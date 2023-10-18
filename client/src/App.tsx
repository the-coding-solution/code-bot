import React, { useEffect, useState, useContext } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";

import PrefrencesPopup from "./components/PrefrencesPopup";
import ChatBox from "./components/ChatBox";
import "./styles.scss";
import { chatHistory, chatHistoryJSON } from "../../types";

interface Message {
  content: string;
}

type PreferencesContextType = {
  skillLevel: string;
  setSkillLevel: React.Dispatch<React.SetStateAction<string>>;
  language: string;
  setLanguage: React.Dispatch<React.SetStateAction<string>>;
  topic: string;
  setTopic: React.Dispatch<React.SetStateAction<string>>;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
};

const defaultPreferences: PreferencesContextType = {
  skillLevel: "Beginner",
  setSkillLevel: () => {},
  language: "JavaScript",
  setLanguage: () => {},
  topic: "",
  setTopic: () => {},
  messages: [],
  setMessages: () => {},
};

const PreferencesContext =
  React.createContext<PreferencesContextType>(defaultPreferences);

export const usePreferences = () => {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error("Preferences must be set");
  }
  return context;
};

type PreferencesProviderProps = {
  children?: React.ReactNode;
};

export const PreferencesProvider: React.FC<PreferencesProviderProps> = ({
  children,
}) => {
  const [skillLevel, setSkillLevel] = useState<string>("Beginner");
  const [language, setLanguage] = useState<string>("Javascript");
  const [topic, setTopic] = useState<string>("coding excersises");
  const [messages, setMessages] = useState<Message[]>([]);
  return (
    <PreferencesContext.Provider
      value={{
        skillLevel,
        setSkillLevel,
        language,
        setLanguage,
        topic,
        setTopic,
        messages,
        setMessages,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
};

const App = (): React.JSX.Element => {

  return (
    <PreferencesProvider>
      <div id="app-container">
        <div id="header">
          <h1>The Coding Solution</h1>
        </div>
        <PrefrencesPopup />
        <div id="interaction">
          <div id="chatbox">
            <ChatBox />
          </div>
          <div className="code-editor">
            <CodeMirror
              className="code-mirror"
              height="900px"
              theme={vscodeDark}
            />
          </div>
        </div>
      </div>
    </PreferencesProvider>
  );
};

export default App;
