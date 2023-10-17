// import { OpenAI } from "langchain/llms/openai";
// import { ChatPromptTemplate, MessagesPlaceholder } from "langchain/prompts";
// import process from 'process'
// import { BufferMemory } from "langchain/memory"
// import { Runnable, RunnableSequence } from "langchain/dist/schema/runnable";
// import { ChatAnthropic } from "langchain/chat_models/anthropic"
// const llm = new OpenAI({
//     openAIApiKey: process.env.API_KEY
// })

// const TEMPLATE = "You are a very knowledgeable assistant who is going to assist a user trying to learn {programming_language} at a {user_level} level."// Please start by providing the user with options of where to beging his or her journey.";
// const HUMANTEMPLATE = "{text}";

// const chatPrompt = ChatPromptTemplate.fromMessages([
//     ["system", TEMPLATE],
//     new MessagesPlaceholder("history"),
//     ["human", HUMANTEMPLATE]
// ])

// // const formattedChatPrompt = await chatPrompt.formatMessages({
// //     "programming_language": "",
// //     "user_level": "",
// //     "text": ""
// // })

// const memory = new BufferMemory({
//     returnMessages: true,
//     inputKey: "input",
//     outputKey: "output",
//     memoryKey: "history"
// })
// const model = new ChatAnthropic();

// await memory.loadMemoryVariables({});

// const chain = RunnableSequence.from([
//     {
//         input: (initialInput) => initialInput.input,
//         memory: () => memory.loadMemoryVariables({})
//     },
//     {
//         input: (previousOutput) => previousOutput.input,
//         history: (previousOutput) => previousOutput.memory.history,
//     },
//     chatPrompt,
//     model,
// ])