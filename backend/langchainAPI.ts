import { OpenAI } from "langchain/llms/openai";
import { ChatPromptTemplate, MessagesPlaceholder } from "langchain/prompts";
import process from 'process'
import { BufferMemory, ChatMessageHistory } from "langchain/memory"
import { Runnable, RunnableSequence } from "langchain/schema/runnable";
import { ChatAnthropic } from "langchain/chat_models/anthropic"
import { ChatOpenAI } from "langchain/chat_models/openai";
import { HumanMessage, AIMessage, BaseChatMessageHistory } from "langchain/schema";
import { ConversationChain } from "langchain/chains"
import dotenv from "dotenv"
import fs from 'fs';
import util from 'util';
import path from 'path';
import { chatHistoryJSON, chatMemory } from "../types";
const writeAsync = util.promisify(fs.writeFile);
const readAsync = util.promisify(fs.readFile);
dotenv.config({path: path.join(__dirname, '../.env')});

const TEMPLATE = "You are a very knowledgeable assistant who is going to assist a user trying to learn {programming_language} at a {user_level} level."// Please start by providing the user with options of where to beging his or her journey.";
const HUMANTEMPLATE = "{text}";


export const parseJSONtoChatHistory = (json: chatHistoryJSON[]): ChatMessageHistory => {
    const messages: any = [];
    json.forEach(element=>{
        if (element.type==='human'){
            messages.push(new HumanMessage(element.content));
        } else if (element.type==='ai'){
            messages.push(new AIMessage(element.content));
        }
    })

    return new ChatMessageHistory(messages);
}

export const parseChatHistoryToJSON = async (chatHistory: BaseChatMessageHistory): Promise<chatHistoryJSON[]> =>{
    const messagesList = await chatHistory.getMessages();
    const output: chatHistoryJSON[] = [];
    messagesList.forEach(element=>{
        
        const dict = element.toDict();
        const chat: chatHistoryJSON = {
            type: dict.type,
            content: dict.data.content
        }
        output.push(chat);
    })
    return output;
}

export class Bot{
    // private llm;
    private template;
    private model;
    private memory;
    private chain;
    private history;
    private programming_language;
    private experience;
    private id;

    constructor(programming_language: string, experience: string, id: string){
        this.id = id;
        this.programming_language = programming_language;
        this.experience = experience;
        this.model = new ChatOpenAI({
            openAIApiKey: process.env.API_KEY
        });
        this.template = ChatPromptTemplate.fromMessages([
                ["system", TEMPLATE],
                new MessagesPlaceholder("history"),
                ["human", HUMANTEMPLATE]
            ]);
        // this.model = new ChatAnthropic();
        this.memory = new BufferMemory({
            returnMessages: true,
            inputKey: "text",
            outputKey: "output",
            memoryKey: "history"
        }) 
        // this.memory.loadMemoryVariables({}).then(data=>data);
        this.chain =  RunnableSequence.from([
            {
                text: (initialInput) => initialInput.text,
                memory: () => this.memory.loadMemoryVariables({}),
                programming_language: (initialInput)=> initialInput.programming_language,
                user_level: (initialInput) => initialInput.user_level
            },
            {
                text: (previousOutput) => previousOutput.text,
                history: (previousOutput) => previousOutput.memory.history,
                programming_language: (previousOutput)=> previousOutput.programming_language,
                user_level: (previousOutput) => previousOutput.user_level
            },
            this.template,
            this.model,
        ])

        this.history = [] as chatMemory[];
        

    }

    async loadMemoryFromHistory(filePath: string){
        return new Promise<Bot>(async (resolve, reject)=>{
            try {
                const content: chatMemory[] = JSON.parse(await readAsync(path.join(__dirname, filePath), 'utf-8'));
                this.history = content;
                content.forEach(element=>{
                    this.memory.saveContext(element.input, element.output);
                });
                resolve(this);
            } catch (error) {
                reject(error)
            }
        })
       
    }

    async callAI(input: string){
       return new Promise<String>(async (resolve, reject)=> {
        try {
            const inputs = {programming_language: this.programming_language, user_level: this.experience, text: input};
            const response = await this.chain.invoke(inputs);
            console.log(response);
            // Save context
            const temp_mem = {
                input: inputs,
                output: {"output": response.content}
            }
            this.history.push(temp_mem);
            await this.memory.saveContext(inputs, {
                output: response
            }) 
            resolve(response.content);
        } catch (error) {
            reject(error);
        }
       })

    }

    async writeHistoryToFile(filePath: string){
        return new Promise<Bot>(async (resolve, reject)=> {
            try {
                const dataToWrite = JSON.stringify(this.history);
                await writeAsync(path.join(__dirname, filePath), dataToWrite, 'utf-8');
                resolve(this);
            } catch (error) {
                reject(error)
            }
        })
    }

}
