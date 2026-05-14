import { describe, it, expect } from 'vitest';
import { NOTES, KEY_MAP, VOICES, DEFAULT_VOICE } from '../keyboardData';

describe('keyboardData', () => {
    it('exports a non-empty NOTES array', () => {
        expect(Array.isArray(NOTES)).toBe(true);
        expect(NOTES.length).toBeGreaterThan(0);
    });

    it('every note has required fields', () => {
        for (const note of NOTES) {
            expect(note).toHaveProperty('id');
            expect(note).toHaveProperty('label');
            expect(note).toHaveProperty('type');
            expect(note).toHaveProperty('freq');
            expect(note).toHaveProperty('key');
        }
    });

    it('note types are only "white" or "black"', () => {
        for (const note of NOTES) {
            expect(['white', 'black']).toContain(note.type);
        }
    });

    it('all frequencies are positive numbers', () => {
        for (const note of NOTES) {
            expect(typeof note.freq).toBe('number');
            expect(note.freq).toBeGreaterThan(0);
        }
    });

    it('starts with C4 and ends with E5', () => {
        expect(NOTES[0].id).toBe('C4');
        expect(NOTES[NOTES.length - 1].id).toBe('E5');
    });

    it('KEY_MAP maps keyboard chars to note IDs', () => {
        expect(typeof KEY_MAP).toBe('object');
        // 'a' → C4
        expect(KEY_MAP['a']).toBe('C4');
        // 'k' → C5
        expect(KEY_MAP['k']).toBe('C5');
    });

    it('KEY_MAP contains an entry for every note', () => {
        for (const note of NOTES) {
            expect(KEY_MAP[note.key]).toBe(note.id);
        }
    });

    it('all keyboard shortcuts are unique', () => {
        const keys = NOTES.map((n) => n.key);
        const unique = new Set(keys);
        expect(unique.size).toBe(keys.length);
    });

    // ── VOICES ──────────────────────────────────────────────────────────────
    it('VOICES exports an array with at least 2 entries', () => {
        expect(Array.isArray(VOICES)).toBe(true);
        expect(VOICES.length).toBeGreaterThanOrEqual(2);
    });

    it('VOICES includes piano and choir entries', () => {
        const ids = VOICES.map((v) => v.id);
        expect(ids).toContain('piano');
        expect(ids).toContain('choir');
    });

    it('every voice has id, label, emoji, and description', () => {
        for (const voice of VOICES) {
            expect(voice).toHaveProperty('id');
            expect(voice).toHaveProperty('label');
            expect(voice).toHaveProperty('emoji');
            expect(voice).toHaveProperty('description');
        }
    });

    it('DEFAULT_VOICE is piano', () => {
        expect(DEFAULT_VOICE).toBe('piano');
    });

    it('DEFAULT_VOICE matches one of the VOICES ids', () => {
        const ids = VOICES.map((v) => v.id);
        expect(ids).toContain(DEFAULT_VOICE);
    });
});
