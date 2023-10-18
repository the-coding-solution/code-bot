import express, {Request, Response, NextFunction} from 'express'
import cookieParser from 'cookie-parser'
import process from 'process'
import {serverError} from '../types'
import LCController from './controller'
import util from 'util';
import { exec } from 'child_process';
const execAsync = util.promisify(exec);

const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
const PORT = 3000;

if (process.env.NODE_ENV==='production'){
    app.use(express.static('../dist'));
}


app.get('/api/chat', LCController.getAllChatHistory, (req: Request, res: Response) => {
    return res.status(200).json(res.locals.chat);
})

const promptAi = LCController.promptAiWrapped();

// @ts-ignore
app.post('/api/chat', promptAi, (req: Request, res: Response) => {
    return res.status(201).json(res.locals.response);
})

function quickProcess(str: string): string{
    const arr: string[] = str.split('file an issue.\n\n');
    return arr[arr.length-1];
}

app.post('/api/sketchbot', async(req, res, next) => {
    try {
        const {prompt} = req.body;
        const {stdout, stderr} = await execAsync(`./work_around.sh ${prompt}`);
        const data = {
            type: 'ai',
            content: quickProcess(stdout)
        }
        return res.status(201).json(data);
    } catch (error) {
        return next(error)
    }
})

app.use(
    (err: any, req: Request, res: Response, next: NextFunction) => {
        const defaultErr: serverError = {
            log: "Express error handler caught unknown middleware error",
            statusCode: 500,
            message: { err: 'An error occured' }
        }
        const errObj: any = Object.assign({}, defaultErr, err);
        console.log(errObj.log);
        return res.status(errObj.statusCode).json(errObj.message);
    }
)

app.listen(PORT, ()=>{
    console.log(`Listening on port: ${PORT}`);
})