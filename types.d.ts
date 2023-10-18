

export interface serverError{
    log: string;
    statusCode: number;
    message: {err: string}
}

export interface chatHistory{
    language: string
    skillLevel: string
    initialPrompt?: string
    history: chatHistoryJSON[]
}

export interface chatHistoryJSON{
    type: string;
    content: string;
}

export interface chatMemory{
    input: {
        programming_language: string;
        user_level: string;
        text: string;
    }
    output: {
        output: string;
    }
}