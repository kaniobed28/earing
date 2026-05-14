import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { EarTraining } from '../EarTraining';

const baseProps = {
    phase: 'idle',
    targetNote: null,
    timeLeft: 5,
    timeLimit: 5,
    lastAnswer: null,
    score: { correct: 0, total: 0 },
    currentTip: null,
    startRound: vi.fn(),
    replayNote: vi.fn(),
    retryRound: vi.fn(),
    reset: vi.fn(),
};

describe('EarTraining component', () => {
    it('renders the ear training panel region', () => {
        render(<EarTraining {...baseProps} />);
        expect(document.querySelector('[aria-label="Ear training panel"]')).toBeInTheDocument();
    });

    it('shows score as 0/0 initially', () => {
        render(<EarTraining {...baseProps} />);
        const scoreEl = document.querySelector('.et__score-value');
        expect(scoreEl).toBeInTheDocument();
        expect(scoreEl.textContent).toMatch(/0.*0/);
    });

    it('shows Start button in idle phase', () => {
        render(<EarTraining {...baseProps} />);
        expect(screen.getByRole('button', { name: /start/i })).toBeInTheDocument();
    });

    it('does not show timer bar in idle phase', () => {
        render(<EarTraining {...baseProps} />);
        expect(document.querySelector('.et__timer-bar')).not.toBeInTheDocument();
    });

    it('calls startRound when Start is clicked', () => {
        const startRound = vi.fn();
        render(<EarTraining {...baseProps} startRound={startRound} />);
        fireEvent.click(screen.getByRole('button', { name: /start/i }));
        expect(startRound).toHaveBeenCalledTimes(1);
    });

    it('shows listening prompt and timer bar when phase=listening', () => {
        render(
            <EarTraining
                {...baseProps}
                phase="listening"
                targetNote={{ id: 'C4', label: 'C4', freq: 261.63 }}
                timeLeft={3}
            />
        );
        expect(screen.getByText(/what note was that/i)).toBeInTheDocument();
        expect(document.querySelector('.et__timer-bar')).toBeInTheDocument();
        expect(screen.getByText('3s')).toBeInTheDocument();
    });

    it('shows Replay note button during listening phase', () => {
        render(
            <EarTraining
                {...baseProps}
                phase="listening"
                targetNote={{ id: 'C4', label: 'C4', freq: 261.63 }}
            />
        );
        expect(screen.getByRole('button', { name: /replay note/i })).toBeInTheDocument();
    });

    it('calls replayNote when Replay button is clicked', () => {
        const replayNote = vi.fn();
        render(
            <EarTraining
                {...baseProps}
                phase="listening"
                targetNote={{ id: 'C4', label: 'C4', freq: 261.63 }}
                replayNote={replayNote}
            />
        );
        fireEvent.click(screen.getByRole('button', { name: /replay note/i }));
        expect(replayNote).toHaveBeenCalledTimes(1);
    });

    it('shows Correct result when phase=correct', () => {
        render(
            <EarTraining
                {...baseProps}
                phase="correct"
                targetNote={{ id: 'C4', label: 'C4', freq: 261.63 }}
                score={{ correct: 1, total: 1 }}
            />
        );
        expect(screen.getByText(/correct/i)).toBeInTheDocument();
        expect(screen.getByText('C4')).toBeInTheDocument();
    });

    it('shows Wrong result when phase=wrong', () => {
        render(
            <EarTraining
                {...baseProps}
                phase="wrong"
                targetNote={{ id: 'G4', label: 'G4', freq: 392 }}
                lastAnswer={{ correct: false, noteId: 'C4' }}
            />
        );
        expect(screen.getByText(/wrong/i)).toBeInTheDocument();
        expect(screen.getByText('G4')).toBeInTheDocument();
    });

    it("shows Time's up result when phase=timeout", () => {
        render(
            <EarTraining
                {...baseProps}
                phase="timeout"
                targetNote={{ id: 'A4', label: 'A4', freq: 440 }}
            />
        );
        expect(screen.getByText(/time's up/i)).toBeInTheDocument();
        expect(screen.getByText('A4')).toBeInTheDocument();
    });

    it('shows Next and Reset buttons after an answer', () => {
        render(
            <EarTraining
                {...baseProps}
                phase="correct"
                targetNote={{ id: 'C4', label: 'C4', freq: 261.63 }}
            />
        );
        expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument();
    });

    it('calls startRound on Next click', () => {
        const startRound = vi.fn();
        render(
            <EarTraining
                {...baseProps}
                phase="correct"
                targetNote={{ id: 'C4', label: 'C4', freq: 261.63 }}
                startRound={startRound}
            />
        );
        fireEvent.click(screen.getByRole('button', { name: /next/i }));
        expect(startRound).toHaveBeenCalledTimes(1);
    });

    it('calls reset on Reset click', () => {
        const reset = vi.fn();
        render(
            <EarTraining
                {...baseProps}
                phase="wrong"
                targetNote={{ id: 'C4', label: 'C4', freq: 261.63 }}
                reset={reset}
            />
        );
        fireEvent.click(screen.getByRole('button', { name: /reset/i }));
        expect(reset).toHaveBeenCalledTimes(1);
    });

    it('timer bar has danger class when timeLeft <= 2', () => {
        render(
            <EarTraining
                {...baseProps}
                phase="listening"
                targetNote={{ id: 'C4', label: 'C4', freq: 261.63 }}
                timeLeft={2}
            />
        );
        expect(document.querySelector('.et__timer-bar--danger')).toBeInTheDocument();
    });

    it('timer bar does NOT have danger class when timeLeft > 2', () => {
        render(
            <EarTraining
                {...baseProps}
                phase="listening"
                targetNote={{ id: 'C4', label: 'C4', freq: 261.63 }}
                timeLeft={4}
            />
        );
        expect(document.querySelector('.et__timer-bar--danger')).not.toBeInTheDocument();
    });

    // ── retryRound / Try Again button tests ────────────────────────────────────

    it('shows Try Again button only when phase=timeout', () => {
        render(
            <EarTraining
                {...baseProps}
                phase="timeout"
                targetNote={{ id: 'A4', label: 'A4', freq: 440 }}
            />
        );
        expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    });

    it('does NOT show Try Again button when phase=correct', () => {
        render(
            <EarTraining
                {...baseProps}
                phase="correct"
                targetNote={{ id: 'C4', label: 'C4', freq: 261.63 }}
            />
        );
        expect(screen.queryByRole('button', { name: /try again/i })).not.toBeInTheDocument();
    });

    it('does NOT show Try Again button when phase=wrong', () => {
        render(
            <EarTraining
                {...baseProps}
                phase="wrong"
                targetNote={{ id: 'G4', label: 'G4', freq: 392 }}
                lastAnswer={{ correct: false, noteId: 'C4' }}
            />
        );
        expect(screen.queryByRole('button', { name: /try again/i })).not.toBeInTheDocument();
    });

    it('calls retryRound when Try Again is clicked', () => {
        const retryRound = vi.fn();
        render(
            <EarTraining
                {...baseProps}
                phase="timeout"
                targetNote={{ id: 'A4', label: 'A4', freq: 440 }}
                retryRound={retryRound}
            />
        );
        fireEvent.click(screen.getByRole('button', { name: /try again/i }));
        expect(retryRound).toHaveBeenCalledTimes(1);
    });

    it('shows Next and Reset buttons alongside Try Again on timeout', () => {
        render(
            <EarTraining
                {...baseProps}
                phase="timeout"
                targetNote={{ id: 'A4', label: 'A4', freq: 440 }}
            />
        );
        expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument();
    });

    // ── currentTip UI tests ────────────────────────────────────────────────

    it('renders tip text during listening phase when currentTip is provided', () => {
        const tip = '👂 Hum or sing the note back to yourself before pressing anything.';
        render(
            <EarTraining
                {...baseProps}
                phase="listening"
                targetNote={{ id: 'C4', label: 'C4', freq: 261.63 }}
                currentTip={tip}
            />
        );
        expect(screen.getByRole('note')).toBeInTheDocument();
        expect(screen.getByText(tip)).toBeInTheDocument();
    });

    it('does NOT render tip element when currentTip is null during listening', () => {
        render(
            <EarTraining
                {...baseProps}
                phase="listening"
                targetNote={{ id: 'C4', label: 'C4', freq: 261.63 }}
                currentTip={null}
            />
        );
        expect(document.querySelector('.et__tip')).not.toBeInTheDocument();
    });

    it('does NOT render tip element in idle phase', () => {
        render(
            <EarTraining
                {...baseProps}
                phase="idle"
                currentTip="some tip"
            />
        );
        // idle is not a listening or answered phase, so no tip at all
        expect(document.querySelector('.et__tip')).not.toBeInTheDocument();
    });

    it('tip persists with --persist class after a correct answer', () => {
        const tip = '👂 Hum or sing the note back to yourself before pressing anything.';
        render(
            <EarTraining
                {...baseProps}
                phase="correct"
                targetNote={{ id: 'C4', label: 'C4', freq: 261.63 }}
                currentTip={tip}
            />
        );
        const tipEl = document.querySelector('.et__tip--persist');
        expect(tipEl).toBeInTheDocument();
        expect(tipEl.textContent).toBe(tip);
    });

    it('tip persists after a wrong answer', () => {
        const tip = '🎵 Is it high or low? Narrow the range first, then fine-tune.';
        render(
            <EarTraining
                {...baseProps}
                phase="wrong"
                targetNote={{ id: 'G4', label: 'G4', freq: 392 }}
                lastAnswer={{ correct: false, noteId: 'C4' }}
                currentTip={tip}
            />
        );
        expect(document.querySelector('.et__tip--persist')).toBeInTheDocument();
    });

    it('tip persists on timeout', () => {
        const tip = '🔁 Compare it to the last note you heard — is this one higher, lower, or the same?';
        render(
            <EarTraining
                {...baseProps}
                phase="timeout"
                targetNote={{ id: 'A4', label: 'A4', freq: 440 }}
                currentTip={tip}
            />
        );
        expect(document.querySelector('.et__tip--persist')).toBeInTheDocument();
    });

    it('persisted tip is absent when currentTip is null after answering', () => {
        render(
            <EarTraining
                {...baseProps}
                phase="correct"
                targetNote={{ id: 'C4', label: 'C4', freq: 261.63 }}
                currentTip={null}
            />
        );
        expect(document.querySelector('.et__tip--persist')).not.toBeInTheDocument();
    });
});
