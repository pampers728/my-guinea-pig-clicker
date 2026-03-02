import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { MongoClient } from 'mongodb';

let client;
let db;

beforeAll(async () => {
	client = new MongoClient('mongodb://localhost:27017');
	await client.connect();
	db = client.db('testdb');
});

afterAll(async () => {
	await client.close();
});

describe('MongoDB CRUD operations', () => {
	it('should create a document', async () => {
		const result = await db.collection('testCollection').insertOne({ name: 'test' });
		expect(result.insertedCount).toBe(1);
	});

	it('should read a document', async () => {
		const doc = await db.collection('testCollection').findOne({ name: 'test' });
		expect(doc).toHaveProperty('name', 'test');
	});

	it('should update a document', async () => {
		const result = await db.collection('testCollection').updateOne({ name: 'test' }, { $set: { name: 'updatedTest' } });
		expect(result.modifiedCount).toBe(1);
		const updatedDoc = await db.collection('testCollection').findOne({ name: 'updatedTest' });
		expect(updatedDoc).toHaveProperty('name', 'updatedTest');
	});

	it('should delete a document', async () => {
		const result = await db.collection('testCollection').deleteOne({ name: 'updatedTest' });
		expect(result.deletedCount).toBe(1);
	});
});