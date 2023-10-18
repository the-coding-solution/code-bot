import {Request, Response, NextFunction} from 'express';
import { serverError, chatHistory, chatMemory, chatHistoryJSON } from '../types';
import  { Data }  from './model';
import fs from 'fs';
import util from 'util';

const readAsync = util.promisify(fs.readFile);

import path from 'path';
import { Bot } from './langchainAPI';
interface ILCController{
    // checkSetCookie: (req: Request, res: Response, next: NextFunction) => Promise<void>
    getAllChatHistory: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    // @ts-ignore
    promptAiWrapped: () => Promise<void>; // => (req: Request, res: Response, next: NextFunction)
}


const LCController: ILCController = {} as ILCController;

function parseHistoryToJSON(history: chatMemory[]): chatHistoryJSON[]{
    const output: chatHistoryJSON[] = [];
    history.forEach(element=>{
        output.push({
            type: 'human',
            content: element.input.text
        })
        output.push({
            type: 'ai',
            content: element.output.output
        })
    })
    return output
}


LCController.getAllChatHistory = async(req: Request, res: Response, next: NextFunction): Promise<void> =>{
    try {
        // Check if there is a header, if so send back the language context and initial context
        res.locals.chat = {};
        const {session} = req.cookies;
        if (!session) return next();

        const info = await Data.findOne({_id: session});
        if (!info) return next();
        const history = JSON.parse(await readAsync(path.join(__dirname, info.path_to_history), 'utf-8'));
        
        const data: chatHistory = {
            language: info.language,
            skillLevel: info.skillLevel,
            history: parseHistoryToJSON(history)
        }
        res.locals.chat = data;
        return next();
    } catch (error) {
        const errObj: serverError = {
            log: JSON.stringify({"LCController.getAllChatHistory Error": error}),
            statusCode: 500,
            message: { err: 'Error occured checking cookie' }
        }

        return next(errObj);

    }
}




function checkCache(session_id: string, cache: {[key: string]: Bot}): Bot | undefined {
    if (`key_${session_id}` in cache){
        const model = cache[`key_${session_id}`];
        console.log(`key_${session_id}`);
        return model;
    } 
}


// @ts-ignore
LCController.promptAiWrapped = () => {

    const cache: {[key: string]: Bot} = {};


    return async function(req: Request, res: Response, next: NextFunction): Promise<void>{
        try {
            let session = req.cookies.session;
            let language, skillLevel, prompt;
            prompt = req.body.prompt;
            let bot;
            if (prompt===undefined){
                console.log('No Prompt found...')
                return next({message: {err: 'Missing prompt'}, statusCode: 400});
            }
            if (session===undefined){
                skillLevel = req.body.skillLevel;
                language = req.body.skillLevel;
                if (skillLevel===undefined || language===undefined){
                    return next({message: {err: 'Missing data for skill level and language'}, statusCode: 400});
                }
                const newEntry = await Data.create({language, skillLevel})//Data(language, skillLevel)
                console.log('Creating cookie...');
                session = newEntry._id.toString();
                res.cookie('session', newEntry._id);
                bot = new Bot(language, skillLevel, newEntry._id.toString());
            }
            if (session!=undefined){
                // First check cache
                console.log('Checking cache...')
                bot = checkCache(session, cache);
            }

            const result = await Data.findOne({_id: session});
            if (!result){
                return next({message: {err: 'Error getting session data', statusCode: 500, log: `LCController.promptAi: Could get session ${session}`}})
            }

            if (!bot){
                // Load bot from history;
                console.log('No Bot in cache, creating from memory...')
                bot = new Bot(result.language, result.skillLevel, session);
                console.log('Created bot')
                bot.loadMemoryFromHistory(result.path_to_history);
            }

            // Actually call bot here
            const aiMessage = await bot.callAI(prompt);
            await bot.writeHistoryToFile(result.path_to_history);
            console.log('Message:', aiMessage);

            res.locals.response = {
                type: 'ai',
                content: aiMessage
            }
              
            return next();
        } catch (error) {
            const errObj: serverError = {
                log: JSON.stringify({"LCController.getAllChatHistory Error": error}),
                statusCode: 500,
                message: { err: 'Error occured checking cookie' }
            }
    
            return next(errObj);
        }
    }
}


export default LCController;