import React from 'react';
import { VOICES } from './keyboardData';
import './VoiceSelector.css';

/**
 * Voice preset selector.
 *
 * Props:
 *  activeVoice – currently selected voice id ('piano' | 'choir')
 *  onChange    – (voiceId: string) => void
 */
export function VoiceSelector({ activeVoice, onChange }) {
    return (
        <div className="voice-selector" role="group" aria-label="Voice selector">
            {VOICES.map((voice) => (
                <button
                    key={voice.id}
                    id={`voice-btn-${voice.id}`}
                    className={`voice-btn${activeVoice === voice.id ? ' voice-btn--active' : ''}`}
                    aria-pressed={activeVoice === voice.id}
                    onClick={() => onChange(voice.id)}
                    title={voice.description}
                >
                    <span className="voice-btn__emoji">{voice.emoji}</span>
                    <span className="voice-btn__label">{voice.label}</span>
                    {activeVoice === voice.id && (
                        <span className="voice-btn__active-dot" aria-hidden="true" />
                    )}
                </button>
            ))}
        </div>
    );
}
