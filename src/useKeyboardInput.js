import { useEffect, useRef } from 'react';
import { KEY_MAP } from './keyboardData';

/**
 * Listens for keydown / keyup events and calls playNote / stopNote accordingly.
 * Tracks held keys to avoid repeat events.
 */
export function useKeyboardInput({ playNote, stopNote, notes }) {
    const heldKeys = useRef(new Set());

    useEffect(() => {
        const noteMap = Object.fromEntries(notes.map((n) => [n.id, n]));

        const handleKeyDown = (e) => {
            if (e.repeat) return;
            const noteId = KEY_MAP[e.key.toLowerCase()];
            if (!noteId || heldKeys.current.has(noteId)) return;
            heldKeys.current.add(noteId);
            const note = noteMap[noteId];
            if (note) playNote(noteId, note.freq);
        };

        const handleKeyUp = (e) => {
            const noteId = KEY_MAP[e.key.toLowerCase()];
            if (!noteId) return;
            heldKeys.current.delete(noteId);
            stopNote(noteId);
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [playNote, stopNote, notes]);
}
