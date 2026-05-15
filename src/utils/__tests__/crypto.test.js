import { describe, it, expect, vi } from 'vitest';
import { getRandom } from '../crypto';

describe('getRandom', () => {
    it('returns a number between 0 and 1', () => {
        for (let i = 0; i < 100; i++) {
            const val = getRandom();
            expect(val).toBeGreaterThanOrEqual(0);
            expect(val).toBeLessThan(1);
        }
    });

    it('uses window.crypto.getRandomValues', () => {
        const spy = vi.spyOn(window.crypto, 'getRandomValues');
        getRandom();
        expect(spy).toHaveBeenCalled();
        spy.mockRestore();
    });

    it('produces different values', () => {
        const results = new Set();
        for (let i = 0; i < 100; i++) {
            results.add(getRandom());
        }
        // It's extremely unlikely to get 100 identical values with a good RNG
        expect(results.size).toBeGreaterThan(90);
    });
});
