

export interface serverError{
    log: string;
    statusCode: number;
    message: {err: string}
}

export interface chatHistory{
    language: string
    skillLevel: string
    initialPrompt?: string
    history: {[key: string]: string}[]
}
