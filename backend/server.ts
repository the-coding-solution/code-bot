import express, {Request, Response, NextFunction} from 'express'
import cookieParser from 'cookie-parser'
import process from 'process'
const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
const PORT = 3000;

if (process.env.NODE_ENV==='production'){
    app.use(express.static('../dist'));
}

app.use('/', (req: Request, res: Response)=>{
    return res.status(200).json({message: "Hello from the backend"});
})

app.use(
    (err: any, req: Request, res: Response, next: NextFunction) => {
        const defaultErr: any = {
            log: "Express error handler caught unknown middleware error",
            status: 500,
            message: { err: 'An error occured' }
        }
        const errObj: any = Object.assign({}, defaultErr, err);
        console.log(errObj.log);
        return res.status(errObj.status).json(errObj.message);
    }
)

app.listen(PORT, ()=>{
    console.log(`Listening on port: ${PORT}`);
})