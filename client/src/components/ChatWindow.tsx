// import React, { useState } from 'react';
// import UserInput from './UserInput';
// import './styles.scss';

// interface Message {
//   text: string;
//   isBot: boolean;
// }

// interface ChatWindowProps {
//   messages: Message[];
// }

// const ChatWindow: React.FC<ChatWindowProps> = ({ messages }) => {
//   const [messages, setMessages] =
//     useState < Array<{ text: string; isBot: boolean }>([]);

//   return (
//     <div className='chat-window'>
//       {messages.map((message, index) => (
//         <div
//           key={index}
//           className={message.isBot ? 'bot-message' : 'user-message'}>
//           {message.text}
//         </div>
//       ))}
//     </div>
//   );
// };

// export default ChatWindow;
