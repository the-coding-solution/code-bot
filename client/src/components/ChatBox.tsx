import React, { useEffect, useState, useContext, useRef } from 'react';
import { usePreferences } from '../App';
import { chatHistoryJSON, chatHistory } from '../../../types';

const ChatBox = (): React.JSX.Element => {
  const { skillLevel,setSkillLevel, language, setLanguage, messages, setMessages } = usePreferences();
  const [input, setInput] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);
  console.log(messages)

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Trying to fetch')
        const response = await fetch("/api/chat");
        if (!response.ok) {
          throw new Error("Network response not ok");
        }
        const data: chatHistory = await response.json();
        if (Object.keys(data).length === 0) {
          return;
        } else {
          const { language, skillLevel, history } = data;
          console.log(history)
          setSkillLevel(skillLevel);
          setLanguage(language);
          setMessages(history);
          return;
        }
      } catch (err) {
        console.error('error loading messages')
        //throw new Error( 'Network connection failed')
      }
    };
    fetchData();
    console.log(messages)
  }, []);

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
      const request = {
        language: language,
        skillLevel: skillLevel,
        prompt: input
      }
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });
      if (!response.ok) throw new Error(await response.json());
      const data: chatHistoryJSON = await response.json();
      setMessages(prevMessages => [...prevMessages, data]);
      // inputRef.current?.focus();
      return;
    } catch (err) {
      console.error(err);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setInput('');
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
          onClick={() => {
            setInput('');
            handleSubmit()}}
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
