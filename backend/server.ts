import express, {Request, Response, NextFunction} from 'express'
import cookieParser from 'cookie-parser'
import process from 'process'
import {serverError} from '../types'
import LCController from './controller'
const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
const PORT = 3000;

if (process.env.NODE_ENV==='production'){
    app.use(express.static('../dist'));
}

app.get('/', (req: Request, res: Response)=>{
    return res.status(200).json({message: "Hello from the backend"});
})

app.get('/api/session')

app.get('/api/chat', LCController.getAllChatHistory, (req: Request, res: Response) => {
    return res.status(200).json(res.locals.chat);
})

app.post('/api/chat', (req: Request, res: Response) => {
    return res.status(201).json({response: 'AI message response'});
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