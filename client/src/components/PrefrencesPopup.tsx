import React, { useState } from 'react';
import { usePreferences } from 
import '../styles.scss';

interface Prefrences {
  skillLevel: string;
  language: string;
  topic: string;
}

interface PrefrencesPopupProps {
  skillLevel: string;
  language: string;
  onSavePrefrences: (skill: string, langauge: string, context: string) => void;
  onClose: () => void;
}

const PrefrencesPopup: React.FC<PrefrencesPopupProps> = ({
  onSavePrefrences,
  onClose,
}) => {
  const { skillLevel, setSkillLevel, langauge, setLanguage } = usePreferences();
  const handleSave = () => {
    onSavePrefrences(skillLevel, language, topic);
    onClose();


    
  };

  return (
    <div className='prefrences-popup'>
      <h2>Set Your Prefrences</h2>
      <label>
        Skill Level:
        <select
          value={skillLevel}
          onChange={e => setSkillLevel(e.target.value)}>
          <option value='beginner'>Beginner</option>
          <option value='intermediate'>Intermediate</option>
          <option value='advanced'>Advanced</option>
        </select>
      </label>
      <label>
        Language:
        <select value={language} onChange={e => setLanguage(e.target.value)}>
          <option value='JavaScript'>JavaScript</option>
          <option value='TypeScript'>TypeScript</option>
        </select>
      </label>
      <label>
        Topic:
        <input
          type='text'
          value={topic}
          onChange={e => setTopic(e.target.value)}
        />
      </label>
      <button onClick={handleSave}>Save</button>
    </div>
  );
};

export default PrefrencesPopup;
