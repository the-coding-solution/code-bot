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
// const llm = new OpenAI({
//     openAIApiKey: process.env.API_KEY
// })
// const llm = new OpenAI({})
const TEMPLATE = "You are a very knowledgeable assistant who is going to assist a user trying to learn {programming_language} at a {user_level} level."// Please start by providing the user with options of where to beging his or her journey.";
const HUMANTEMPLATE = "{text}";

const pastMessages = [new HumanMessage("My Name's Jim"), new AIMessage("Nice to meet you jim")];




// console.log(memory.chatHistory.getMessages());
// console.log('Message', pastMessages[1].toDict());
// Parse json to chat history
// parse chat history to json

// {
//     'key_${session_id}': new bot;
// }

// [
//     {
//         type: 'HumanMessage',
//         content: 'message'
//     },
//     {
//         type: 'AI Message',
//         content: 'response'
//     }
// ]

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
// const chain = new ConversationChain({llm: llm, memory: memory})

// const res1 = await chain.call({input: "Hi! I'm Jim."});

export class Bot{
    // private llm;
    private template;
    private model;
    private memory;
    private chain;
    private history;

    constructor(key: string){
        this.model = new ChatOpenAI({
            openAIApiKey: key
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
                const content: chatMemory[] = JSON.parse(await readAsync(filePath, 'utf-8'));
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

    async callAI(programming_language: string, user_level: string, input: string){
       return new Promise<Bot>(async (resolve, reject)=> {
        try {
            const inputs = {programming_language, user_level, text: input};
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
            resolve(this);
        } catch (error) {
            reject(error);
        }
       })

    }

    async writeHistoryToFile(filePath: string){
        return new Promise<Bot>(async (resolve, reject)=> {
            try {
                const dataToWrite = JSON.stringify(this.history);
                await writeAsync(filePath, dataToWrite, 'utf-8');
                resolve(this);
            } catch (error) {
                reject(error)
            }
        })
    }

}
if (process.env.API_KEY){
    //const botTest = new Bot(process.env.API_KEY);
    //botTest.callAI('javascript', 'beginner', 'could you show me how to use bind?');
    async function test(){
        const model = new ChatOpenAI({openAIApiKey: process.env.API_KEY});
        const chatPrompt = ChatPromptTemplate.fromMessages([
            ["system", TEMPLATE],
            ["human", HUMANTEMPLATE],
            new MessagesPlaceholder("history"),
        ]);

        const memory = new BufferMemory({
            chatHistory: new ChatMessageHistory(pastMessages),
            memoryKey: "history" 
        })

    //   const formattedChatPrompt = await chatPrompt.formatMessages();
    //   const chain = chatPrompt.pipe(model);
      const chain = new ConversationChain({
        memory: memory,
        prompt: chatPrompt,
        llm: model,
      }) 

      const result1 = await chain.invoke({
        programming_language: "javascript",
        user_level: "beginner",
        text: "Create a function with a basic for loop named whosThatPokemon",
      })

      console.log(result1);

      const result2 = await chain.invoke({
        programming_language: "javascript",
        user_level: "beginner",
        text: "What is the name of the previous function?",
      })

      console.log({result2});

    }

    // test();

    // const chain = new ConversationChain({ llm: model, memory: memory })

    //const res1 = await chain.call({input: "Hi I'm Jim."});

    //console.log({res1});


    
}
async function test2(){
    if (!process.env.API_KEY){
        const bot = await new Bot('test');
        //await bot.callAI('javascript', 'beginner', 'show me how to write a function named \'HelloWorld\' that prints hello world when invoked')
        await bot.loadMemoryFromHistory(path.join(__dirname, './history/652fdb825ca966b8e8032678.json'));
        // await bot.callAI('javascript', 'beginner', 'What was the name of the function I just asked about?');
        await bot.writeHistoryToFile(path.join(__dirname, './history/test.json'));
    }

}

test2()
/** 
[
    {
        input: {
            programming_language:
            user_level:
            text:
        }
        output: {output:'response'}    
        
    }
]

saveContext(element.input, element.output)

*/