import {Request, Response, NextFunction} from 'express';
import { serverError, chatHistory } from '../types';
import  { Data }  from './model';
import fs from 'fs';
import util from 'util';
const readAsync = util.promisify(fs.readFile);
import path from 'path';
interface ILCController{
    // checkSetCookie: (req: Request, res: Response, next: NextFunction) => Promise<void>
    getAllChatHistory: (req: Request, res: Response, next: NextFunction) => Promise<void>
    promptAi: (req: Request, res: Response, next: NextFunction) => Promise<void> 
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


// LCController.checkSetCookie = async(req: Request, res: Response, next: NextFunction): Promise<void> => {
//     try {
//         const { session } = req.cookies();
        
//     } catch (error) {
        
//     }
// }

LCController.promptAi = async(req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { session } = req.cookies;
        let language;
        let skillLevel;
        let prompt;
        let history = [];
        prompt = req.body.prompt;
        if (prompt===undefined){
            return next({message: {err: 'Missing prompt'}, statusCode: 400});
        }
        if (session!=undefined){
            console.log(`Finding session: ${session}`)
            const result = await Data.findOne({_id: session});
            if (result){
                language = result.language;
                skillLevel = result.skillLevel;
                history = JSON.parse(fs.readFileSync(result.path_to_history, 'utf-8'));
            } else {
                // Error getting session data
                return next({message: {err: 'Error getting session data', statusCode: 500, log: `LCController.promptAi: Could get session ${session}`}})
            }
        } else {
            // Theres not a session so set a new cookie and create file
            skillLevel = req.body.skillLevel;
            language = req.body.language;
            if (skillLevel===undefined || language===undefined){
                return next({message: {err: 'Missing data for skill level andn language'}, statusCode: 400});
            }
            const newEntry = await Data.create({language, skillLevel})//Data(language, skillLevel)
            res.cookie('session', newEntry._id);
        }
        console.log(`AI Prompt: ${language}, ${skillLevel}, ${history}, ${prompt}`);
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
export default LCController;