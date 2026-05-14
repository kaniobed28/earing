import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Key } from '../Key';

const mockNote = {
    id: 'C4',
    label: 'C4',
    type: 'white',
    freq: 261.63,
    key: 'a',
};

describe('Key component', () => {
    let onPress;
    let onRelease;

    beforeEach(() => {
        onPress = vi.fn();
        onRelease = vi.fn();
    });

    it('renders with correct aria-label', () => {
        render(
            <Key note={mockNote} isActive={false} onPress={onPress} onRelease={onRelease} />
        );
        expect(screen.getByRole('button', { name: /C4 key/i })).toBeInTheDocument();
    });

    it('has aria-pressed=false when not active', () => {
        render(
            <Key note={mockNote} isActive={false} onPress={onPress} onRelease={onRelease} />
        );
        expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false');
    });

    it('has aria-pressed=true when active', () => {
        render(
            <Key note={mockNote} isActive={true} onPress={onPress} onRelease={onRelease} />
        );
        expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
    });

    it('applies key--active class when isActive=true', () => {
        render(
            <Key note={mockNote} isActive={true} onPress={onPress} onRelease={onRelease} />
        );
        expect(screen.getByRole('button')).toHaveClass('key--active');
    });

    it('does not apply key--active class when isActive=false', () => {
        render(
            <Key note={mockNote} isActive={false} onPress={onPress} onRelease={onRelease} />
        );
        expect(screen.getByRole('button')).not.toHaveClass('key--active');
    });

    it('calls onPress with noteId and freq on pointerdown', () => {
        render(
            <Key note={mockNote} isActive={false} onPress={onPress} onRelease={onRelease} />
        );
        fireEvent.pointerDown(screen.getByRole('button'));
        expect(onPress).toHaveBeenCalledWith('C4', 261.63);
    });

    it('calls onRelease with noteId on pointerup', () => {
        render(
            <Key note={mockNote} isActive={false} onPress={onPress} onRelease={onRelease} />
        );
        // trigger pointerdown first to set pointer capture context
        const btn = screen.getByRole('button');
        fireEvent.pointerDown(btn);
        fireEvent.pointerUp(btn);
        expect(onRelease).toHaveBeenCalledWith('C4');
    });

    it('calls onRelease on pointerleave', () => {
        render(
            <Key note={mockNote} isActive={false} onPress={onPress} onRelease={onRelease} />
        );
        fireEvent.pointerLeave(screen.getByRole('button'));
        expect(onRelease).toHaveBeenCalledWith('C4');
    });

    it('displays the note label', () => {
        render(
            <Key note={mockNote} isActive={false} onPress={onPress} onRelease={onRelease} />
        );
        expect(screen.getByText('C4')).toBeInTheDocument();
    });

    it('displays the keyboard shortcut', () => {
        render(
            <Key note={mockNote} isActive={false} onPress={onPress} onRelease={onRelease} />
        );
        expect(screen.getByText('a')).toBeInTheDocument();
    });

    it('renders a black key with key--black class', () => {
        const blackNote = { ...mockNote, id: 'Cs4', label: 'C#4', type: 'black', key: 'w' };
        render(
            <Key note={blackNote} isActive={false} onPress={onPress} onRelease={onRelease} />
        );
        expect(screen.getByRole('button')).toHaveClass('key--black');
    });

    it('calls onPress via keyboard Space', () => {
        render(
            <Key note={mockNote} isActive={false} onPress={onPress} onRelease={onRelease} />
        );
        fireEvent.keyDown(screen.getByRole('button'), { key: ' ' });
        expect(onPress).toHaveBeenCalledWith('C4', 261.63);
    });

    it('calls onRelease via keyboard Space up', () => {
        render(
            <Key note={mockNote} isActive={false} onPress={onPress} onRelease={onRelease} />
        );
        fireEvent.keyUp(screen.getByRole('button'), { key: ' ' });
        expect(onRelease).toHaveBeenCalledWith('C4');
    });
});
