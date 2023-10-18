import React, { useState } from 'react';
import { usePreferences } from '../App';
import '../styles.scss';

interface Prefrences {
  skillLevel: string;
  language: string;
  topic: string;
}

interface PrefrencesPopupProps {
  onSavePrefrences: (skill: string, langauge: string, context: string) => void;
  onClose: () => void;
}

const PrefrencesPopup: React.FC = () => {
  const { skillLevel, setSkillLevel, language, setLanguage, topic, setTopic } =
    usePreferences();

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
        {/* Topic: */}
        {/* <input
          type='text'
          value={topic}
          onChange={e => setTopic(e.target.value)}
          style={{ width: '95%' }}
        /> */}
      </label>
      {/* <button onClick={handleSave}>Save</button> */}
    </div>
  );
};

export default PrefrencesPopup;
