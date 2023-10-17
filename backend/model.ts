import { NextFunction } from 'express';
import mongoose from 'mongoose'
import process from 'process'
import path from 'path';
import fs from 'fs';
import util from 'util';
const writeAsync = util.promisify(fs.writeFile);
let MONGO_URI = "mongodb://127.0.0.1:27017/";

if (process.env.MONGO_URI){
    console.log(`Connecting to: ${process.env.MONGO_URI}`);
    MONGO_URI = process.env.MONGO_URI;
}

mongoose.connect(MONGO_URI, {
    dbName: 'apibot'
})

const Schema = mongoose.Schema;

const DataSchema = new Schema({
    language: {type: String, required: true},
    skillLevel: {type: String, required: true},
    prompt: String,
    path_to_history: {
        type: String, 
        default: function(){
            // @ts-ignore
            return `./history/${this._id}.json`
        },
    }
})

DataSchema.pre('save', async function(next){
    try {
        // @ts-ignore
        const filePath = path.join(__dirname, `./history/${this._id}.json`);
        await writeAsync(filePath, JSON.stringify([]), 'utf-8');
        return next();
    } catch (error) {
        // @ts-ignore
       return next(error)
    }
})

export const Data = mongoose.model('data', DataSchema);