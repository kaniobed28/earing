<<<<<<< HEAD
import React, { useState, useCallback, useRef } from 'react';
import { Keyboard } from './Keyboard';
import { VoiceSelector } from './VoiceSelector';
import { EarTraining } from './EarTraining';
import { useAudio } from './useAudio';
import { useEarTraining } from './useEarTraining';
import { DEFAULT_VOICE } from './keyboardData';
=======
import React, { useState, useCallback } from 'react';
import { Keyboard } from './components/Keyboard';
import { VoiceSelector } from './components/VoiceSelector';
import { EarTraining } from './components/EarTraining';
import { useAudio } from './hooks/useAudio';
import { useEarTraining } from './hooks/useEarTraining';
import { DEFAULT_VOICE } from './data/keyboardData';
>>>>>>> 4540bd0
import './App.css';

// Time limit options (seconds)
const TIME_OPTIONS = [3, 5, 10, 15];

export default function App() {
  const [voice, setVoice] = useState(DEFAULT_VOICE);
  const [earMode, setEarMode] = useState(false);
  const [timeLimit, setTimeLimit] = useState(5);

  // Shared audio for ear training (always piano voice for the training tone)
  const { playNote: etPlay, stopNote: etStop } = useAudio('piano');

  const earTraining = useEarTraining({
    timeLimit,
    playNote: etPlay,
    stopNote: etStop,
  });

  const toggleEarMode = useCallback(() => {
    earTraining.reset();
    setEarMode((prev) => !prev);
  }, [earTraining]);

  return (
    <div className="app">
      <header className="app__header">
        <h1 className="app__title">
          <span className="app__title-icon">🎹</span>
          Piano
        </h1>
        <p className="app__subtitle">
          Click keys or use your keyboard · <kbd>A</kbd>–<kbd>;</kbd> /{' '}
          <kbd>W</kbd>–<kbd>P</kbd>
        </p>
      </header>

      {/* Mode toggle row */}
      <div className="app__mode-row">
        <button
          id="ear-mode-toggle"
          className={`mode-toggle${earMode ? ' mode-toggle--active' : ''}`}
          aria-pressed={earMode}
          onClick={toggleEarMode}
        >
          <span>👂</span> Ear Training
        </button>

        {!earMode && (
          <div className="app__voice-row">
            <span className="app__voice-label">Voice</span>
            <VoiceSelector activeVoice={voice} onChange={setVoice} />
          </div>
        )}

        {earMode && (
          <div className="app__time-row">
            <span className="app__voice-label">Time limit</span>
            <div className="time-options" role="group" aria-label="Time limit options">
              {TIME_OPTIONS.map((t) => (
                <button
                  key={t}
                  id={`time-opt-${t}`}
                  className={`time-opt${timeLimit === t ? ' time-opt--active' : ''}`}
                  aria-pressed={timeLimit === t}
                  onClick={() => setTimeLimit(t)}
                  disabled={earTraining.phase === 'listening'}
                >
                  {t}s
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Ear training panel */}
      {earMode && (
        <div className="app__et-panel">
          <EarTraining {...earTraining} />
        </div>
      )}

      {/* Keyboard — in ear mode, key presses submit answers */}
      <main className="app__main">
        <Keyboard
          voice={earMode ? 'piano' : voice}
          earMode={earMode}
          onEarAnswer={earTraining.submitAnswer}
        />
      </main>

      <footer className="app__footer">
        <p>Two octaves · C4 → E5 · Web Audio API</p>
      </footer>
    </div>
  );
}
