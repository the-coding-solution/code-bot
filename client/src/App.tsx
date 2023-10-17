import React, { useEffect, useState, useContext } from "react";
import "./styles.scss";
import PrefrencesPopup from "./components/PrefrencesPopup";
// import ChatWindow from './components/ChatWindow';

type PreferencesContextType = {
  skillLevel: string;
  setSkillLevel: React.Dispatch<React.SetStateAction<string>>;
  language: string;
  setLanguage: React.Dispatch<React.SetStateAction<string>>;
  topic: string;
  setTopic: React.Dispatch<React.SetStateAction<string>>;
};

const defaultPreferences: PreferencesContextType = {
  skillLevel: "beginner",
  setSkillLevel: () => {},
  language: "JavaScript",
  setLanguage: () => {},
  topic: "",
  setTopic: () => {},
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

export const PreferencesProvider: React.FC = ({
  children,
}: {
  children?: React.ReactNode;
}) => {
  const [skillLevel, setSkillLevel] = useState<string>("beginner");
  const [language, setLanguage] = useState<string>("Javascript");
  const [topic, setTopic] = useState<string>("coding excersises");
  // const [messages, setMessages] = useState

  return (
    <PreferencesContext.Provider
      value={{
        skillLevel,
        setSkillLevel,
        language,
        setLanguage,
        topic,
        setTopic,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
};

const App = (): React.JSX.Element => {
  // initial request to fetch('/api/session')
  // receive 'language', 'level', 'initial prompt'
  // pass to <Preferences />

  // fetch('/api/chat')
  // receive a history of messages
  // Prop drill to <Chatbox /> -> forEach(<Message key, id, message/>) -> {}

  // define a function that updates the state for messages
  // function that sends the POST request to the backend
  // wait for response
  // update the state with the new message

  const { setSkillLevel, setLanguage } = usePreferences();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/chat");
        if (!response.ok) {
          throw new Error("Network response not ok");
        }
        const data = await response.json();
        if (Object.keys(data).length === 0) {
          return;
        } else {
          const { language, skillLevel, history } = data;
          setSkillLevel(skillLevel);
          setLanguage(language);
          return;
        }
      } catch (err) {}
    };
  });

  // const handleClose = () => {
  //   return null;
  // };
  // const handleSavePrefrences = (
  //   skillLevel: string,
  //   language: string,
  //   topic: string,
  // ) => {
  //   setPreferences([skillLevel, language, topic]);
  //   return;
  // };
  return (
    <div>
      <h1>The Coding Solution</h1>
      <PrefrencesPopup />
    </div>
  );
};

export default App;
