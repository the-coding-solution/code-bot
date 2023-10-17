import React, { useEffect, useState, useContext } from "react";
import { usePreferences } from '../App'

const ChatBox = (): React.JSX.Element => {
    const { skillLevel, language, messages, setMessages } = usePreferences();
    const [input, setInput] = useState<string>('');

    const handleSubmit = async () => {
        //post req to api/chat 
        //includes language, skillLevel, prompt, cookie?
        try{
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(input)
            })
            if(!response.ok) throw new Error("Message Failed");
            const data = await response.json();
            setMessages([...messages, ...data])
            setInput('');
            return;
        }catch(err){

        }
    }

    return(
        <div className="chatBox">
            <div className="chatBox-header">
                <h2>ProfessorGPT</h2>
            </div>
            <div className="chatBox-messages">
                {messages.map((message, index) => 
                    <div className="message" key={index}>
                        {message.content}
                    </div>
                )}
            </div>
            <div className="chatBox-input">
                <input 
                    type="text"
                    placeholder="Send a message..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)} 
                />
                <button onClick={handleSubmit}>Send</button>
            </div>
        </div>
    );
};

export default ChatBox;