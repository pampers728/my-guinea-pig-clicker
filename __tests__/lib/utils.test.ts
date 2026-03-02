import { describe, it, expect } from 'vitest';

describe('Utility Functions', () => {
    it('should return the correct sum of two numbers', () => {
        const result = sum(1, 2);
        expect(result).toBe(3);
    });

    it('should return the correct difference of two numbers', () => {
        const result = subtract(5, 3);
        expect(result).toBe(2);
    });

    it('should handle edge cases', () => {
        const result = sum(0, 0);
        expect(result).toBe(0);
    });
});