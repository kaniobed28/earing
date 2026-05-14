/**
 * Defines the notes of one octave displayed on the keyboard.
 * frequency: Hz computed from A4 = 440 Hz
 * type    : 'white' | 'black'
 * label   : note name shown on key
 * keyCode : computer keyboard shortcut (two octaves spread across two rows)
 */

// prettier-ignore
export const NOTES = [
  // ── Octave 4 ─────────────────────────────────────────────────────────────
  { id: 'C4', label: 'C4', type: 'white', freq: 261.63, key: 'a' },
  { id: 'Cs4', label: 'C#4', type: 'black', freq: 277.18, key: 'w' },
  { id: 'D4', label: 'D4', type: 'white', freq: 293.66, key: 's' },
  { id: 'Ds4', label: 'D#4', type: 'black', freq: 311.13, key: 'e' },
  { id: 'E4', label: 'E4', type: 'white', freq: 329.63, key: 'd' },
  { id: 'F4', label: 'F4', type: 'white', freq: 349.23, key: 'f' },
  { id: 'Fs4', label: 'F#4', type: 'black', freq: 369.99, key: 't' },
  { id: 'G4', label: 'G4', type: 'white', freq: 392.00, key: 'g' },
  { id: 'Gs4', label: 'G#4', type: 'black', freq: 415.30, key: 'y' },
  { id: 'A4', label: 'A4', type: 'white', freq: 440.00, key: 'h' },
  { id: 'As4', label: 'A#4', type: 'black', freq: 466.16, key: 'u' },
  { id: 'B4', label: 'B4', type: 'white', freq: 493.88, key: 'j' },
  // ── Octave 5 ─────────────────────────────────────────────────────────────
  { id: 'C5', label: 'C5', type: 'white', freq: 523.25, key: 'k' },
  { id: 'Cs5', label: 'C#5', type: 'black', freq: 554.37, key: 'o' },
  { id: 'D5', label: 'D5', type: 'white', freq: 587.33, key: 'l' },
  { id: 'Ds5', label: 'D#5', type: 'black', freq: 622.25, key: 'p' },
  { id: 'E5', label: 'E5', type: 'white', freq: 659.25, key: ';' },
];

/** Map keyboard character → note id for quick lookup */
export const KEY_MAP = Object.fromEntries(NOTES.map((n) => [n.key, n.id]));

/**
 * Available voice presets.
 * Each voice has an id, display label, emoji, and description.
 */
export const VOICES = [
  {
    id: 'piano',
    label: 'Piano',
    emoji: '🎹',
    description: 'Clean sine-wave piano tone',
  },
  {
    id: 'choir',
    label: 'Choir',
    emoji: '🎵',
    description: 'Warm choir with vocal formants & reverb',
  },
];

export const DEFAULT_VOICE = 'piano';

