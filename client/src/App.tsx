import React, { useEffect, useState, useContext } from 'react';
import './styles.scss';
import PrefrencesPopup from './components/PrefrencesPopup';
import ChatBox from './components/ChatBox';

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
  skillLevel: 'beginner',
  setSkillLevel: () => {},
  language: 'JavaScript',
  setLanguage: () => {},
  topic: '',
  setTopic: () => {},
  messages: [],
  setMessages: () => {},
};

const PreferencesContext =
  React.createContext<PreferencesContextType>(defaultPreferences);

export const usePreferences = () => {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error('Preferences must be set');
  }
  return context;
};

type PreferencesProviderProps = {
  children?: React.ReactNode;
};

export const PreferencesProvider: React.FC<PreferencesProviderProps> = ({
  children,
}) => {
  const [skillLevel, setSkillLevel] = useState<string>('Beginner');
  const [language, setLanguage] = useState<string>('Javascript');
  const [topic, setTopic] = useState<string>('coding excersises');
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
      }}>
      {children}
    </PreferencesContext.Provider>
  );
};

const App = (): React.JSX.Element => {
  const { setSkillLevel, setLanguage } = usePreferences();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/chat');
        if (!response.ok) {
          throw new Error('Network response not ok');
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
      fetchData();
    };
  }, []);

  return (
    <PreferencesProvider>
      <div>
        <h1>The Coding Solution</h1>
        <PrefrencesPopup />
        <ChatBox />
      </div>
    </PreferencesProvider>
  );
};

const AppProvider = (): React.JSX.Element => {
  return (
    <PreferencesProvider>
      <App />
    </PreferencesProvider>
  );
};

export default App;
