import React, { useState, useCallback } from 'react';
import { NOTES } from '../data/keyboardData';
import { useAudio } from '../hooks/useAudio';
import { useKeyboardInput } from '../hooks/useKeyboardInput';
import { Key } from './Key';
import './Keyboard.css';

/**
 * The main Piano Keyboard component.
 *
 * Props:
 *  voice       – active voice id ('piano' | 'choir'), passed from App
 *  earMode     – boolean; when true, key presses submit an ear-training answer
 *  onEarAnswer – (noteId: string) => void; called instead of playing sound in earMode
 */
export function Keyboard({ voice = 'piano', earMode = false, onEarAnswer }) {
    const [activeKeys, setActiveKeys] = useState(new Set());
    const { playNote: audioPlay, stopNote: audioStop } = useAudio(voice);

    const playNote = useCallback(
        (noteId, freq) => {
            // Always play the note so the user can hear what they pressed
            audioPlay(noteId, freq);
            setActiveKeys((prev) => new Set([...prev, noteId]));

            if (earMode && onEarAnswer) {
                // In ear mode: also submit this note as the answer
                onEarAnswer(noteId);
            }
        },
        [earMode, onEarAnswer, audioPlay]
    );

    const stopNote = useCallback(
        (noteId) => {
            audioStop(noteId);
            setActiveKeys((prev) => {
                const next = new Set(prev);
                next.delete(noteId);
                return next;
            });
        },
        [audioStop]
    );

    useKeyboardInput({ playNote, stopNote, notes: NOTES });

    return (
        <div className="keyboard-scroll-area">
            <div className="keyboard-wrapper" aria-label="Piano keyboard">
                <div className="keyboard">
                    {NOTES.map((note) => (
                        <Key
                            key={note.id}
                            note={note}
                            isActive={activeKeys.has(note.id)}
                            onPress={playNote}
                            onRelease={stopNote}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
