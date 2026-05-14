import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useEarTraining, pickRandomNote, TIPS } from '../useEarTraining';
import { NOTES } from '../keyboardData';

// Stub Web Audio for the hook (it uses playNote/stopNote passed in, not AudioContext directly)
const makeMocks = () => ({
    playNote: vi.fn(),
    stopNote: vi.fn(),
});

describe('pickRandomNote helper', () => {
    it('returns a note object from NOTES', () => {
        const note = pickRandomNote();
        expect(NOTES.find((n) => n.id === note.id)).toBeTruthy();
    });

    it('excludes the specified note id', () => {
        // Run many times to reduce flakiness
        for (let i = 0; i < 30; i++) {
            const note = pickRandomNote('C4');
            expect(note.id).not.toBe('C4');
        }
    });
});

describe('useEarTraining hook', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });
    afterEach(() => {
        vi.useRealTimers();
    });

    it('starts in idle phase with zero score', () => {
        const { result } = renderHook(() =>
            useEarTraining({ timeLimit: 5, ...makeMocks() })
        );
        expect(result.current.phase).toBe('idle');
        expect(result.current.score).toEqual({ correct: 0, total: 0 });
        expect(result.current.targetNote).toBeNull();
    });

    it('transitions to listening phase on startRound', () => {
        const mocks = makeMocks();
        const { result } = renderHook(() =>
            useEarTraining({ timeLimit: 5, ...mocks })
        );
        act(() => { result.current.startRound(); });
        expect(result.current.phase).toBe('listening');
        expect(result.current.targetNote).not.toBeNull();
        expect(result.current.timeLeft).toBe(5);
    });

    it('plays the target note on startRound', () => {
        const mocks = makeMocks();
        const { result } = renderHook(() =>
            useEarTraining({ timeLimit: 5, ...mocks })
        );
        act(() => { result.current.startRound(); });
        expect(mocks.playNote).toHaveBeenCalledWith(
            result.current.targetNote.id,
            result.current.targetNote.freq
        );
    });

    it('transitions to correct phase and increments score on correct answer', () => {
        const mocks = makeMocks();
        const { result } = renderHook(() =>
            useEarTraining({ timeLimit: 5, ...mocks })
        );
        act(() => { result.current.startRound(); });
        const correctId = result.current.targetNote.id;
        act(() => { result.current.submitAnswer(correctId); });
        expect(result.current.phase).toBe('correct');
        expect(result.current.score).toEqual({ correct: 1, total: 1 });
    });

    it('transitions to wrong phase on incorrect answer', () => {
        const mocks = makeMocks();
        const { result } = renderHook(() =>
            useEarTraining({ timeLimit: 5, ...mocks })
        );
        act(() => { result.current.startRound(); });
        const wrongId = NOTES.find(
            (n) => n.id !== result.current.targetNote.id
        ).id;
        act(() => { result.current.submitAnswer(wrongId); });
        expect(result.current.phase).toBe('wrong');
        expect(result.current.score).toEqual({ correct: 0, total: 1 });
        expect(result.current.lastAnswer.correct).toBe(false);
    });

    it('transitions to timeout when timer expires', () => {
        const mocks = makeMocks();
        const { result } = renderHook(() =>
            useEarTraining({ timeLimit: 3, ...mocks })
        );
        act(() => { result.current.startRound(); });
        act(() => { vi.advanceTimersByTime(3000); });
        expect(result.current.phase).toBe('timeout');
        expect(result.current.score).toEqual({ correct: 0, total: 1 });
    });

    it('counts down timeLeft each second', () => {
        const mocks = makeMocks();
        const { result } = renderHook(() =>
            useEarTraining({ timeLimit: 5, ...mocks })
        );
        act(() => { result.current.startRound(); });
        act(() => { vi.advanceTimersByTime(2000); });
        expect(result.current.timeLeft).toBe(3);
    });

    it('stops the countdown after a correct answer', () => {
        const mocks = makeMocks();
        const { result } = renderHook(() =>
            useEarTraining({ timeLimit: 5, ...mocks })
        );
        act(() => { result.current.startRound(); });
        const correctId = result.current.targetNote.id;
        act(() => { result.current.submitAnswer(correctId); });
        act(() => { vi.advanceTimersByTime(5000); });
        // Phase should still be 'correct', not 'timeout'
        expect(result.current.phase).toBe('correct');
    });

    it('ignores submitAnswer when not in listening phase', () => {
        const mocks = makeMocks();
        const { result } = renderHook(() =>
            useEarTraining({ timeLimit: 5, ...mocks })
        );
        // idle phase — should do nothing
        act(() => { result.current.submitAnswer('C4'); });
        expect(result.current.phase).toBe('idle');
        expect(result.current.score.total).toBe(0);
    });

    it('resets to idle with zero score', () => {
        const mocks = makeMocks();
        const { result } = renderHook(() =>
            useEarTraining({ timeLimit: 5, ...mocks })
        );
        act(() => { result.current.startRound(); });
        act(() => { result.current.submitAnswer(result.current.targetNote.id); });
        act(() => { result.current.reset(); });
        expect(result.current.phase).toBe('idle');
        expect(result.current.score).toEqual({ correct: 0, total: 0 });
        expect(result.current.targetNote).toBeNull();
    });

    it('can start a new round after a previous one ended', () => {
        const mocks = makeMocks();
        const { result } = renderHook(() =>
            useEarTraining({ timeLimit: 3, ...mocks })
        );
        act(() => { result.current.startRound(); });
        act(() => { vi.advanceTimersByTime(3000); });
        expect(result.current.phase).toBe('timeout');
        act(() => { result.current.startRound(); });
        expect(result.current.phase).toBe('listening');
    });

    // ── retryRound tests ────────────────────────────────────────────────────────

    it('retryRound: does nothing when phase is not timeout', () => {
        const mocks = makeMocks();
        const { result } = renderHook(() =>
            useEarTraining({ timeLimit: 5, ...mocks })
        );
        // idle phase
        act(() => { result.current.retryRound(); });
        expect(result.current.phase).toBe('idle');
    });

    it('retryRound: moves phase back to listening with full timeLeft', () => {
        const mocks = makeMocks();
        const { result } = renderHook(() =>
            useEarTraining({ timeLimit: 4, ...mocks })
        );
        act(() => { result.current.startRound(); });
        act(() => { vi.advanceTimersByTime(4000); });
        expect(result.current.phase).toBe('timeout');
        act(() => { result.current.retryRound(); });
        expect(result.current.phase).toBe('listening');
        expect(result.current.timeLeft).toBe(4);
    });

    it('retryRound: keeps the SAME targetNote', () => {
        const mocks = makeMocks();
        const { result } = renderHook(() =>
            useEarTraining({ timeLimit: 3, ...mocks })
        );
        act(() => { result.current.startRound(); });
        const noteAfterStart = result.current.targetNote;
        act(() => { vi.advanceTimersByTime(3000); });
        act(() => { result.current.retryRound(); });
        expect(result.current.targetNote).toEqual(noteAfterStart);
    });

    it('retryRound: does NOT change score', () => {
        const mocks = makeMocks();
        const { result } = renderHook(() =>
            useEarTraining({ timeLimit: 3, ...mocks })
        );
        act(() => { result.current.startRound(); });
        act(() => { vi.advanceTimersByTime(3000); });
        const scoreAfterTimeout = { ...result.current.score };
        act(() => { result.current.retryRound(); });
        // Score must remain exactly as it was after the timeout
        expect(result.current.score).toEqual(scoreAfterTimeout);
    });

    it('retryRound: replays the target note via playNote', () => {
        const mocks = makeMocks();
        const { result } = renderHook(() =>
            useEarTraining({ timeLimit: 3, ...mocks })
        );
        act(() => { result.current.startRound(); });
        const note = result.current.targetNote;
        act(() => { vi.advanceTimersByTime(3000); });
        mocks.playNote.mockClear();
        act(() => { result.current.retryRound(); });
        expect(mocks.playNote).toHaveBeenCalledWith(note.id, note.freq);
    });

    it('retryRound: a second timeout increments total again', () => {
        const mocks = makeMocks();
        const { result } = renderHook(() =>
            useEarTraining({ timeLimit: 3, ...mocks })
        );
        act(() => { result.current.startRound(); });
        act(() => { vi.advanceTimersByTime(3000); });
        expect(result.current.score).toEqual({ correct: 0, total: 1 });
        act(() => { result.current.retryRound(); });
        act(() => { vi.advanceTimersByTime(3000); });
        expect(result.current.phase).toBe('timeout');
        expect(result.current.score).toEqual({ correct: 0, total: 2 });
    });

    it('retryRound: correct answer after retry increments correct score', () => {
        const mocks = makeMocks();
        const { result } = renderHook(() =>
            useEarTraining({ timeLimit: 3, ...mocks })
        );
        act(() => { result.current.startRound(); });
        act(() => { vi.advanceTimersByTime(3000); });
        act(() => { result.current.retryRound(); });
        const correctId = result.current.targetNote.id;
        act(() => { result.current.submitAnswer(correctId); });
        expect(result.current.phase).toBe('correct');
        // total was 1 (from first timeout) + 1 (correct answer) = 2; correct = 1
        expect(result.current.score).toEqual({ correct: 1, total: 2 });
    });

    // ── currentTip tests ──────────────────────────────────────────────────

    it('currentTip is null in idle phase', () => {
        const mocks = makeMocks();
        const { result } = renderHook(() =>
            useEarTraining({ timeLimit: 5, ...mocks })
        );
        expect(result.current.currentTip).toBeNull();
    });

    it('currentTip is a string from TIPS after startRound', () => {
        const mocks = makeMocks();
        const { result } = renderHook(() =>
            useEarTraining({ timeLimit: 5, ...mocks })
        );
        act(() => { result.current.startRound(); });
        expect(typeof result.current.currentTip).toBe('string');
        expect(TIPS).toContain(result.current.currentTip);
    });

    it('currentTip changes between rounds (no immediate repeat)', () => {
        const mocks = makeMocks();
        const { result } = renderHook(() =>
            useEarTraining({ timeLimit: 1, ...mocks })
        );
        act(() => { result.current.startRound(); });
        const firstTip = result.current.currentTip;
        act(() => { vi.advanceTimersByTime(1000); }); // timeout
        act(() => { result.current.startRound(); });  // next round
        const secondTip = result.current.currentTip;
        // With 10 tips the probability of consecutive repeat is 1/9 ≈ 11%;
        // our pickRandomTip(exclude) prevents it explicitly.
        expect(secondTip).not.toBe(firstTip);
    });

    it('currentTip is cleared on reset', () => {
        const mocks = makeMocks();
        const { result } = renderHook(() =>
            useEarTraining({ timeLimit: 5, ...mocks })
        );
        act(() => { result.current.startRound(); });
        expect(result.current.currentTip).not.toBeNull();
        act(() => { result.current.reset(); });
        expect(result.current.currentTip).toBeNull();
    });

    it('retryRound gives a fresh tip from TIPS', () => {
        const mocks = makeMocks();
        const { result } = renderHook(() =>
            useEarTraining({ timeLimit: 3, ...mocks })
        );
        act(() => { result.current.startRound(); });
        act(() => { vi.advanceTimersByTime(3000); });
        act(() => { result.current.retryRound(); });
        expect(typeof result.current.currentTip).toBe('string');
        expect(TIPS).toContain(result.current.currentTip);
    });
});
