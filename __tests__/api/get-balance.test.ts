import { describe, it, expect } from 'vitest';

describe('GET /api/balance', () => {
	it('should return balance information', async () => {
		const response = await fetch('/api/balance');
		const data = await response.json();
		expect(response.status).toBe(200);
		expect(data).toHaveProperty('balance');
	});

	it('should handle errors correctly', async () => {
		const response = await fetch('/api/balance?error=true');
		expect(response.status).toBe(400);
		const data = await response.json();
		expect(data).toHaveProperty('error');
	});
});