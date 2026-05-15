import { useCallback, useEffect, useRef, useState } from 'react';
import { NOTES } from '../data/keyboardData';
import { getRandom } from '../utils/crypto';

/**
 * Game phases:
 *  'idle'      – not started yet
 *  'listening' – note has been played, countdown running, waiting for user
 *  'correct'   – user pressed the right key in time
 *  'wrong'     – user pressed a wrong key
 *  'timeout'   – timer ran out before user answered
 *  'revealed'  – showing the answer (after wrong/timeout), before next round
 */

const WHITE_NOTES = NOTES.filter((n) => n.type === 'white');

function pickRandomNote(exclude = null) {
    const pool = exclude ? NOTES.filter((n) => n.id !== exclude) : NOTES;
    return pool[Math.floor(getRandom() * pool.length)];
}

/** Tips that help the user identify a note by ear. */
export const TIPS = [
    '👂 Hum or sing the note back to yourself before pressing anything.',
    '👂 Close your eyes and let the pitch resonate in your mind.',
    '🎵 Think of a melody that starts on that pitch — your memory anchors it.',
    '🎵 Is it high or low? Narrow the range first, then fine-tune.',
    '🎵 Sing "La" on the pitch, then move your voice up or down to match keys.',
    '🎧 Listen for the "brightness" — higher notes feel lighter, lower ones feel fuller.',
    '🎧 Let the note fade, then replay it — a fresh listen often reveals more.',
    '🔁 Compare it to the last note you heard — is this one higher, lower, or the same?',
    '💡 Relative pitch: does it feel like a "Do", "Mi", or "Sol" in a scale?',
    '💡 Tension vs. rest — some notes feel stable (C, E, G), others want to resolve.',
];

function pickRandomTip(exclude = null) {
    const pool = exclude ? TIPS.filter((t) => t !== exclude) : TIPS;
    return pool[Math.floor(getRandom() * pool.length)];
}

/**
 * useEarTraining – manages all ear-training game state.
 *
 * @param {object} opts
 * @param {number}   opts.timeLimit   seconds the user has to answer (default 5)
 * @param {function} opts.playNote    (noteId, freq) => void  – from useAudio
 * @param {function} opts.stopNote    (noteId)       => void
 *
 * Returns game state + actions consumed by the UI.
 */
export function useEarTraining({ timeLimit = 5, playNote, stopNote }) {
    const [phase, setPhase] = useState('idle');
    const [targetNote, setTargetNote] = useState(null);
    const [timeLeft, setTimeLeft] = useState(timeLimit);
    const [lastAnswer, setLastAnswer] = useState(null); // { correct, noteId }
    const [score, setScore] = useState({ correct: 0, total: 0 });
    const [currentTip, setCurrentTip] = useState(null);
    const lastTipRef = useRef(null);

    const timerRef = useRef(null);
    const lastNoteRef = useRef(null);

    /** Clear all running timers */
    const clearTimers = useCallback(() => {
        clearInterval(timerRef.current);
    }, []);

    /** Play (or replay) the current target note — sustains until stopped explicitly */
    const playTarget = useCallback(
        (note) => {
            if (!note) return;
            // Stop any previous sustain before starting a new one
            stopNote(note.id);
            playNote(note.id, note.freq);
        },
        [playNote, stopNote]
    );

    /** Start a new round */
    const startRound = useCallback(() => {
        clearTimers();
        const note = pickRandomNote(lastNoteRef.current?.id);
        lastNoteRef.current = note;
        setTargetNote(note);
        setTimeLeft(timeLimit);
        setLastAnswer(null);
        const tip = pickRandomTip(lastTipRef.current);
        lastTipRef.current = tip;
        setCurrentTip(tip);
        setPhase('listening');

        // Play the note immediately
        playTarget(note);

        // Countdown
        let remaining = timeLimit;
        timerRef.current = setInterval(() => {
            remaining -= 1;
            setTimeLeft(remaining);
            if (remaining <= 0) {
                clearInterval(timerRef.current);
                // Stop the sustained note when time runs out
                stopNote(lastNoteRef.current?.id);
                setScore((s) => ({ ...s, total: s.total + 1 }));
                setLastAnswer({ correct: false, noteId: null });
                setPhase('timeout');
            }
        }, 1000);
    }, [clearTimers, timeLimit, playTarget, stopNote]);

    /** Called when user presses a key while in 'listening' phase */
    const submitAnswer = useCallback(
        (noteId) => {
            if (phase !== 'listening') return;
            clearTimers();
            // Stop the sustained training note
            stopNote(lastNoteRef.current?.id);
            const correct = noteId === targetNote?.id;
            setScore((s) => ({
                correct: s.correct + (correct ? 1 : 0),
                total: s.total + 1,
            }));
            setLastAnswer({ correct, noteId });
            setPhase(correct ? 'correct' : 'wrong');
        },
        [phase, targetNote, clearTimers, stopNote]
    );

    /** Re-play the current note (hint button) */
    const replayNote = useCallback(() => {
        if (phase === 'listening' && targetNote) {
            playTarget(targetNote);
        }
    }, [phase, targetNote, playTarget]);

    /**
     * Retry the SAME note after a timeout — does NOT pick a new note and does
     * NOT touch the score (the miss was already counted when the timer expired).
     */
    const retryRound = useCallback(() => {
        if (phase !== 'timeout' || !targetNote) return;
        clearTimers();
        setTimeLeft(timeLimit);
        setLastAnswer(null);
        // Pick a fresh tip so the user gets a new hint on retry
        const tip = pickRandomTip(lastTipRef.current);
        lastTipRef.current = tip;
        setCurrentTip(tip);
        setPhase('listening');

        // Play the same note again
        playTarget(targetNote);

        // Restart the countdown
        let remaining = timeLimit;
        timerRef.current = setInterval(() => {
            remaining -= 1;
            setTimeLeft(remaining);
            if (remaining <= 0) {
                clearInterval(timerRef.current);
                stopNote(lastNoteRef.current?.id);
                setScore((s) => ({ ...s, total: s.total + 1 }));
                setLastAnswer({ correct: false, noteId: null });
                setPhase('timeout');
            }
        }, 1000);
    }, [phase, targetNote, clearTimers, timeLimit, playTarget, stopNote]);

    /** Reset everything back to idle */
    const reset = useCallback(() => {
        clearTimers();
        stopNote(lastNoteRef.current?.id);
        setPhase('idle');
        setTargetNote(null);
        setTimeLeft(timeLimit);
        setLastAnswer(null);
        setScore({ correct: 0, total: 0 });
        setCurrentTip(null);
        lastNoteRef.current = null;
        lastTipRef.current = null;
    }, [clearTimers, stopNote, timeLimit]);

    // Cleanup on unmount
    useEffect(() => () => clearTimers(), [clearTimers]);

    return {
        phase,
        targetNote,
        timeLeft,
        timeLimit,
        lastAnswer,
        score,
        currentTip,
        startRound,
        submitAnswer,
        replayNote,
        retryRound,
        reset,
    };
}

// Exported for testing
export { pickRandomNote, WHITE_NOTES };
