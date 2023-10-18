import {Request, Response, NextFunction} from 'express';
import { serverError, chatHistory } from '../types';
import  { Data }  from './model';
import fs from 'fs';
import util from 'util';
import { exec } from 'child_process'
const readAsync = util.promisify(fs.readFile);
const execAsync = util.promisify(exec);
import path from 'path';
interface ILCController{
    // checkSetCookie: (req: Request, res: Response, next: NextFunction) => Promise<void>
    getAllChatHistory: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    // @ts-ignore
    promptAiWrapped: () => Promise<void>; // => (req: Request, res: Response, next: NextFunction)
}


const LCController: ILCController = {} as ILCController;

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
            history: history
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


function quickProcess(str: string): string{
    const arr: string[] = str.split('file an issue.\n\n');
    return arr[arr.length-1];
}


// @ts-ignore
LCController.promptAiWrapped = () => {

    const cache: any = {};


    return async function(req: Request, res: Response, next: NextFunction): Promise<void>{
        try {
            const { session } = req.cookies;
            let language, skillLevel, prompt;
            let history = [];
            prompt = req.body.prompt;
            if (prompt===undefined){
                return next({message: {err: 'Missing prompt'}, statusCode: 400});
            }
            if (session!=undefined){
                // First check cache
                if (`key_${session}` in cache){
                    const model = cache[`key_${session}`];
                    console.log(`key_${session}`);
                    
                }
                const result = await Data.findOne({_id: session});
                if (result){
                    language = result.language;
                    skillLevel = result.skillLevel;
                    history = JSON.parse(await readAsync(path.join(__dirname, result.path_to_history), 'utf-8'));
                } else {
                    // Error getting session data
                    return next({message: {err: 'Error getting session data', statusCode: 500, log: `LCController.promptAi: Could get session ${session}`}})
                }
            } else {
                // Theres not a session so set a new cookie and create file
                skillLevel = req.body.skillLevel;
                language = req.body.language;
                if (skillLevel===undefined || language===undefined){
                    return next({message: {err: 'Missing data for skill level and language'}, statusCode: 400});
                }
                const newEntry = await Data.create({language, skillLevel})//Data(language, skillLevel)
                res.cookie('session', newEntry._id);
                
                cache[`key_${newEntry._id}`] = 1;
            }
            console.log(`AI Prompt: ${language}, ${skillLevel}, ${history}, ${prompt}`); // query AI here
            const { stdout, stderr } = await execAsync(`${path.join(__dirname, './work_around.sh')} ${prompt}`);
            res.locals.response = {
                type: 'ai',
                content: quickProcess(stdout),
            };
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