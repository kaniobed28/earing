import { useRef, useCallback } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// Choir formant frequencies (vowel "ah" — classic choral open vowel)
// Each entry: [frequency Hz, gain, Q]
// ─────────────────────────────────────────────────────────────────────────────
const CHOIR_FORMANTS = [
    [800, 0.9, 8],   // F1 – "ah" first formant
    [1200, 0.6, 10],  // F2
    [2500, 0.3, 12],  // F3
    [3500, 0.15, 14], // F4 – presence / shimmer
];

// Detune amounts in cents for the "choir" of oscillators
const CHOIR_DETUNE = [-12, -6, 0, 6, 12];

/**
 * Build a simple impulse-response reverb for the choir context.
 * Returns a ConvolverNode that can be cached per AudioContext.
 */
function buildReverb(ctx, duration = 2.0, decay = 2.5) {
    const sampleRate = ctx.sampleRate;
    const length = Math.floor(sampleRate * duration);
    const impulse = ctx.createBuffer(2, length, sampleRate);
    const left = impulse.getChannelData(0);
    const right = impulse.getChannelData(1);
    const invLength = 1 / length;

    if (decay === 2.5) {
        for (let i = 0; i < length; i++) {
            const x = 1 - i * invLength;
            const envelope = x * x * Math.sqrt(x);
            left[i] = (Math.random() * 2 - 1) * envelope;
            right[i] = (Math.random() * 2 - 1) * envelope;
        }
    } else {
        for (let i = 0; i < length; i++) {
            const envelope = Math.pow(1 - i * invLength, decay);
            left[i] = (Math.random() * 2 - 1) * envelope;
            right[i] = (Math.random() * 2 - 1) * envelope;
        }
    }

    const convolver = ctx.createConvolver();
    convolver.buffer = impulse;
    return convolver;
}

/**
 * Custom hook that wraps the Web Audio API.
 * Accepts a `voice` prop: 'piano' | 'choir'
 *
 * Returns { playNote, stopNote }.
 */
export function useAudio(voice = 'piano') {
    const ctxRef = useRef(null);
    const reverbRef = useRef(null);
    // Map noteId → list of audio nodes to clean up
    const activeRef = useRef({});

    /** Lazily create AudioContext + shared reverb on first use */
    const getCtx = useCallback(() => {
        if (!ctxRef.current) {
            ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (ctxRef.current.state === 'suspended') {
            ctxRef.current.resume();
        }
        // Build reverb once per context (choir uses it)
        if (!reverbRef.current) {
            reverbRef.current = buildReverb(ctxRef.current);
            reverbRef.current.connect(ctxRef.current.destination);
        }
        return ctxRef.current;
    }, []);

    // ── Piano synthesis ─────────────────────────────────────────────────────
    const playPiano = useCallback(
        (ctx, noteId, frequency) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(frequency, ctx.currentTime);

            gain.gain.setValueAtTime(0, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.01);

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();

            activeRef.current[noteId] = { oscillators: [osc], gain };
        },
        []
    );

    // ── Choir synthesis ────────────────────────────────────────────────────
    const playChoir = useCallback(
        (ctx, noteId, frequency) => {
            // Master gain for this note
            const masterGain = ctx.createGain();
            masterGain.gain.setValueAtTime(0, ctx.currentTime);
            masterGain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 0.12); // slower attack for choir

            // Formant bank: chain of bandpass filters
            let filterChain = masterGain;
            const filters = CHOIR_FORMANTS.map(([freq, , q]) => {
                const f = ctx.createBiquadFilter();
                f.type = 'bandpass';
                f.frequency.value = freq;
                f.Q.value = q;
                filterChain.connect(f);
                filterChain = f;
                return f;
            });
            // Also connect unfiltered (dry) signal at reduced level for body
            const dryGain = ctx.createGain();
            dryGain.gain.value = 0.4;
            masterGain.connect(dryGain);
            dryGain.connect(ctx.destination);

            // Connect last filter to reverb + destination
            const lastFilter = filters[filters.length - 1];
            const wetGain = ctx.createGain();
            wetGain.gain.value = 0.7;
            lastFilter.connect(wetGain);
            wetGain.connect(reverbRef.current);
            wetGain.connect(ctx.destination);

            // Build choir of detuned oscillators
            const oscillators = CHOIR_DETUNE.map((detuneCents) => {
                const osc = ctx.createOscillator();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(frequency, ctx.currentTime);
                osc.detune.setValueAtTime(detuneCents, ctx.currentTime);
                // Add slow vibrato via a low-frequency oscillator
                const lfo = ctx.createOscillator();
                const lfoGain = ctx.createGain();
                lfo.type = 'sine';
                lfo.frequency.value = 5 + Math.random() * 1.5; // 5–6.5 Hz vibrato
                lfoGain.gain.value = 4; // ±4 cents vibrato depth
                lfo.connect(lfoGain);
                lfoGain.connect(osc.detune);
                lfo.start();
                osc.connect(masterGain);
                osc.start();
                return { osc, lfo };
            });

            activeRef.current[noteId] = {
                oscillators: oscillators.map((o) => o.osc),
                lfos: oscillators.map((o) => o.lfo),
                gain: masterGain,
            };
        },
        []
    );

    const playNote = useCallback(
        (noteId, frequency) => {
            if (activeRef.current[noteId]) return;
            const ctx = getCtx();
            if (voice === 'choir') {
                playChoir(ctx, noteId, frequency);
            } else {
                playPiano(ctx, noteId, frequency);
            }
        },
        [voice, getCtx, playPiano, playChoir]
    );

    const stopNote = useCallback((noteId) => {
        const active = activeRef.current[noteId];
        if (!active) return;

        const ctx = ctxRef.current;
        const { oscillators, lfos = [], gain } = active;

        const releaseTime = voice === 'choir' ? 0.6 : 0.3;

        gain.gain.cancelScheduledValues(ctx.currentTime);
        gain.gain.setValueAtTime(gain.gain.value, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + releaseTime);

        oscillators.forEach((osc) => osc.stop(ctx.currentTime + releaseTime));
        lfos.forEach((lfo) => lfo.stop(ctx.currentTime + releaseTime));

        delete activeRef.current[noteId];
    }, [voice]);

    return { playNote, stopNote };
}
