import React from 'react';
import './Key.css';

/**
 * Renders a single piano key (white or black).
 *
 * Props:
 *  note     – note object { id, label, type, freq, key }
 *  isActive – boolean, whether this key is currently pressed
 *  onPress  – (noteId, freq) => void
 *  onRelease– (noteId) => void
 */
export function Key({ note, isActive, onPress, onRelease }) {
    const handlePointerDown = (e) => {
        e.currentTarget.setPointerCapture?.(e.pointerId);
        onPress(note.id, note.freq);
    };

    const handlePointerUp = () => {
        onRelease(note.id);
    };

    const handlePointerLeave = () => {
        onRelease(note.id);
    };

    return (
        <div
            id={`key-${note.id}`}
            role="button"
            aria-label={`${note.label} key`}
            aria-pressed={isActive}
            tabIndex={0}
            className={`key key--${note.type}${isActive ? ' key--active' : ''}`}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerLeave}
            onKeyDown={(e) => {
                if (e.key === ' ' || e.key === 'Enter') onPress(note.id, note.freq);
            }}
            onKeyUp={(e) => {
                if (e.key === ' ' || e.key === 'Enter') onRelease(note.id);
            }}
        >
            <span className="key__label">{note.label}</span>
            <span className="key__shortcut">{note.key}</span>
        </div>
    );
}
