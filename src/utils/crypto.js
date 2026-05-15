/**
 * Generates a cryptographically secure random number between 0 (inclusive) and 1 (exclusive).
 * This is a secure alternative to Math.random().
 *
 * @returns {number} A random number in the range [0, 1).
 */

const array = new Uint32Array(1);

export function getRandom() {
    window.crypto.getRandomValues(array);
    // Divide by 2^32 to get a value in [0, 1)
    return array[0] / 4294967296;
}
