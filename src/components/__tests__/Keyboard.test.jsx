import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Keyboard } from '../Keyboard';

// Mock useAudio so no real AudioContext is created in tests
vi.mock('../../hooks/useAudio', () => ({
    useAudio: () => ({
        playNote: vi.fn(),
        stopNote: vi.fn(),
    }),
}));

describe('Keyboard component', () => {
    it('renders the keyboard aria region', () => {
        render(<Keyboard />);
        expect(screen.getByRole('generic', { name: /piano keyboard/i }) ||
            document.querySelector('[aria-label="Piano keyboard"]')).toBeTruthy();
    });

    it('renders all 17 keys (12 white + 5 black for 2 octaves C4–E5)', () => {
        render(<Keyboard />);
        const buttons = screen.getAllByRole('button');
        expect(buttons).toHaveLength(17);
    });

    it('renders correct number of white keys', () => {
        render(<Keyboard />);
        const whiteKeys = document.querySelectorAll('.key--white');
        // C4 D4 E4 F4 G4 A4 B4 C5 D5 E5 = 10
        expect(whiteKeys).toHaveLength(10);
    });

    it('renders correct number of black keys', () => {
        render(<Keyboard />);
        const blackKeys = document.querySelectorAll('.key--black');
        // C#4 D#4 F#4 G#4 A#4 C#5 D#5 = 7
        expect(blackKeys).toHaveLength(7);
    });

    it('shows C4 as first key', () => {
        render(<Keyboard />);
        expect(screen.getByLabelText(/C4 key/i)).toBeInTheDocument();
    });

    it('shows E5 as last key', () => {
        render(<Keyboard />);
        expect(screen.getByLabelText(/E5 key/i)).toBeInTheDocument();
    });

    it('no key is initially active', () => {
        render(<Keyboard />);
        const active = document.querySelectorAll('.key--active');
        expect(active).toHaveLength(0);
    });
});
