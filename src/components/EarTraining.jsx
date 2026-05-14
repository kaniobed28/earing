import React from 'react';
import './EarTraining.css';

/**
 * EarTraining panel — shown above the keyboard when ear-training mode is active.
 *
 * Props (from useEarTraining):
 *  phase, targetNote, timeLeft, timeLimit, lastAnswer, score
 *  startRound, replayNote, reset
 */
export function EarTraining({
    phase,
    targetNote,
    timeLeft,
    timeLimit,
    lastAnswer,
    score,
    currentTip,
    startRound,
    replayNote,
    retryRound,
    reset,
}) {
    const progressPct = phase === 'listening' ? (timeLeft / timeLimit) * 100 : 0;
    const isAnswered = phase === 'correct' || phase === 'wrong' || phase === 'timeout';

    return (
        <div className="et" role="region" aria-label="Ear training panel">
            {/* Score */}
            <div className="et__score">
                <span className="et__score-label">Score</span>
                <span className="et__score-value">
                    {score.correct}
                    <span className="et__score-sep">/</span>
                    {score.total}
                </span>
            </div>

            {/* Main status */}
            <div className="et__status">
                {phase === 'idle' && (
                    <p className="et__hint">Press <strong>Start</strong> — a note will play and you find it on the keyboard!</p>
                )}

                {phase === 'listening' && (
                    <>
                        <p className="et__prompt">🎵 What note was that?</p>
                        <div className="et__timer-bar-wrap" aria-label={`${timeLeft} seconds left`}>
                            <div
                                className={`et__timer-bar${timeLeft <= 2 ? ' et__timer-bar--danger' : ''}`}
                                style={{ width: `${progressPct}%` }}
                            />
                        </div>
                        <p className="et__countdown">{timeLeft}s</p>
                        {currentTip && (
                            <p className="et__tip" role="note">{currentTip}</p>
                        )}
                    </>
                )}

                {phase === 'correct' && (
                    <p className="et__result et__result--correct">
                        ✅ Correct! <strong>{targetNote?.label}</strong>
                    </p>
                )}

                {phase === 'wrong' && (
                    <p className="et__result et__result--wrong">
                        ❌ Wrong — it was <strong>{targetNote?.label}</strong>
                        {lastAnswer?.noteId && (
                            <span className="et__result-you"> (you played {lastAnswer.noteId})</span>
                        )}
                    </p>
                )}

                {phase === 'timeout' && (
                    <p className="et__result et__result--timeout">
                        ⏰ Time's up! It was <strong>{targetNote?.label}</strong>
                    </p>
                )}

                {/* Keep the tip visible after answering so the user can still read it */}
                {isAnswered && currentTip && (
                    <p className="et__tip et__tip--persist" role="note">{currentTip}</p>
                )}
            </div>

            {/* Controls */}
            <div className="et__controls">
                {phase === 'idle' && (
                    <button id="et-start-btn" className="et__btn et__btn--primary" onClick={startRound}>
                        Start
                    </button>
                )}

                {phase === 'listening' && (
                    <button id="et-replay-btn" className="et__btn et__btn--ghost" onClick={replayNote}>
                        🔁 Replay note
                    </button>
                )}

                {isAnswered && (
                    <>
                        {phase === 'timeout' && (
                            <button id="et-retry-btn" className="et__btn et__btn--retry" onClick={retryRound}>
                                🔄 Try Again
                            </button>
                        )}
                        <button id="et-next-btn" className="et__btn et__btn--primary" onClick={startRound}>
                            Next →
                        </button>
                        <button id="et-reset-btn" className="et__btn et__btn--ghost" onClick={reset}>
                            Reset
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
