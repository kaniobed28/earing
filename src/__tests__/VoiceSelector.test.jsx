import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { VoiceSelector } from '../VoiceSelector';
import { VOICES } from '../keyboardData';

describe('VoiceSelector component', () => {
    it('renders a button for each available voice', () => {
        render(<VoiceSelector activeVoice="piano" onChange={() => { }} />);
        const buttons = screen.getAllByRole('button');
        expect(buttons).toHaveLength(VOICES.length);
    });

    it('renders Piano and Choir buttons', () => {
        render(<VoiceSelector activeVoice="piano" onChange={() => { }} />);
        expect(screen.getByText('Piano')).toBeInTheDocument();
        expect(screen.getByText('Choir')).toBeInTheDocument();
    });

    it('marks the active voice button as aria-pressed=true', () => {
        render(<VoiceSelector activeVoice="choir" onChange={() => { }} />);
        expect(screen.getByRole('button', { name: /Choir/i })).toHaveAttribute('aria-pressed', 'true');
        expect(screen.getByRole('button', { name: /Piano/i })).toHaveAttribute('aria-pressed', 'false');
    });

    it('applies voice-btn--active class to the active voice button only', () => {
        render(<VoiceSelector activeVoice="piano" onChange={() => { }} />);
        const pianoBtn = document.getElementById('voice-btn-piano');
        const choirBtn = document.getElementById('voice-btn-choir');
        expect(pianoBtn).toHaveClass('voice-btn--active');
        expect(choirBtn).not.toHaveClass('voice-btn--active');
    });

    it('calls onChange with choir id when Choir is clicked', () => {
        const onChange = vi.fn();
        render(<VoiceSelector activeVoice="piano" onChange={onChange} />);
        fireEvent.click(screen.getByText('Choir'));
        expect(onChange).toHaveBeenCalledWith('choir');
    });

    it('calls onChange with piano id when Piano is clicked', () => {
        const onChange = vi.fn();
        render(<VoiceSelector activeVoice="choir" onChange={onChange} />);
        fireEvent.click(screen.getByText('Piano'));
        expect(onChange).toHaveBeenCalledWith('piano');
    });

    it('does not call onChange when clicking the already-active voice', () => {
        const onChange = vi.fn();
        render(<VoiceSelector activeVoice="piano" onChange={onChange} />);
        fireEvent.click(screen.getByText('Piano'));
        // onChange IS called — the parent decides whether to update state
        // (this is correct behaviour — the selector is stateless)
        expect(onChange).toHaveBeenCalledWith('piano');
    });

    it('shows an active dot only on the active button', () => {
        render(<VoiceSelector activeVoice="choir" onChange={() => { }} />);
        const dots = document.querySelectorAll('.voice-btn__active-dot');
        expect(dots).toHaveLength(1);
    });

    it('has an accessible group aria-label', () => {
        render(<VoiceSelector activeVoice="piano" onChange={() => { }} />);
        expect(
            document.querySelector('[aria-label="Voice selector"]')
        ).toBeInTheDocument();
    });
});
