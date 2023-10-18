import React, { useEffect, useState, useContext, useRef } from 'react';
import { usePreferences } from '../App';

const ChatBox = (): React.JSX.Element => {
  const { skillLevel, language, messages, setMessages } = usePreferences();
  const [input, setInput] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async () => {
    const userMessage = {
      content: input,
      type: 'user',
    };

    const botMessage = {
      content: 'Response from server',
      type: 'bot',
    };
    setMessages(prevMessages => [...prevMessages, userMessage]);

    try {
      // adds user message directly
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });
      if (!response.ok) throw new Error('Message Failed');
      const data = await response.json();
      setMessages(prevMessages => [...prevMessages, ...data]);
      setInput('');
      inputRef.current?.focus();
      return;
    } catch (err) {}
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className='chatBox'>
      <div className='chatBox-header'>
        <h2>ProfessorGPT</h2>
      </div>
      <div className='chatBox-messages'>
        {messages.map((message, index) => (
          <div className={`message`} key={index}>
            {message.content}
          </div>
        ))}
      </div>
      <div className='chatBox-input'>
        <input
          type='text'
          placeholder='Send a message...'
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleInputKeyDown}
          style={{ width: '97%' }}
          ref={inputRef}
        />
        <button
          onClick={handleSubmit}
          style={{
            backgroundColor: 'grey',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}>
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
