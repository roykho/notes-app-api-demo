import request from 'supertest';
import express from 'express';
import cacheRoute from '../../routes/cacheRoute.js';
import cache from '../../utils/cache.js';
import Note from '../../models/note.js';

const app = express();
app.use(express.json());
app.use('/api/cache', cacheRoute);

describe('Cache Routes', () => {
    describe('GET /api/cache/stats', () => {
        it('should return cache statistics', async () => {
            const response = await request(app).get('/api/cache/stats').expect(200);

            expect(response.body).toHaveProperty('type');
            expect(response.body).toHaveProperty('keys');

            // Should be either 'Memory' or 'Redis'
            expect(['Memory', 'Redis']).toContain(response.body.type);
            expect(typeof response.body.keys).toBe('number');
        });

        it('should include memory usage for in-memory cache', async () => {
            const response = await request(app).get('/api/cache/stats').expect(200);

            if (response.body.type === 'Memory') {
                expect(response.body).toHaveProperty('memoryUsage');
                expect(response.body.memoryUsage).toHaveProperty('rss');
                expect(response.body.memoryUsage).toHaveProperty('heapTotal');
                expect(response.body.memoryUsage).toHaveProperty('heapUsed');
            }
        });
    });

    describe('GET /api/cache/keys', () => {
        it('should return all cache keys', async () => {
            // Add some test data to cache
            await cache.set('test:key1', 'value1', 300);
            await cache.set('test:key2', 'value2', 300);

            const response = await request(app).get('/api/cache/keys').expect(200);

            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body).toContain('test:key1');
            expect(response.body).toContain('test:key2');
        });

        it('should return empty array when no keys exist', async () => {
            // Clear cache first
            await cache.invalidatePattern('test:*');

            const response = await request(app).get('/api/cache/keys').expect(200);

            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body).toHaveLength(0);
        });
    });

    describe('DELETE /api/cache/clear', () => {
        it('should clear all cache', async () => {
            // Add some test data to cache
            await cache.set('test:key1', 'value1', 300);
            await cache.set('test:key2', 'value2', 300);

            // Verify cache has data
            let keys = await cache.getAllKeys();
            expect(keys.length).toBeGreaterThan(0);

            const response = await request(app).delete('/api/cache/clear').expect(200);

            expect(response.body).toHaveProperty('success', true);
            expect(response.body).toHaveProperty('message', 'All cache cleared');

            // Verify cache is cleared
            keys = await cache.getAllKeys();
            expect(keys.length).toBe(0);
        });
    });

    describe('POST /api/cache/warmup', () => {
        it('should warm up cache with notes data', async () => {
            // Create some test notes
            const note1 = new Note({
                title: 'Test Note 1',
                content: 'Test content 1',
                tags: ['test'],
            });
            const note2 = new Note({
                title: 'Test Note 2',
                content: 'Test content 2',
                tags: ['test'],
            });
            await note1.save();
            await note2.save();

            const response = await request(app).post('/api/cache/warmup').expect(200);

            expect(response.body).toHaveProperty('success', true);
            expect(response.body).toHaveProperty('message', 'Cache warmed up successfully');

            // Verify cache is populated
            const listCache = await cache.get('notes:/api/notes');
            const note1Cache = await cache.get(`notes:/api/notes/${note1._id}`);
            const note2Cache = await cache.get(`notes:/api/notes/${note2._id}`);

            expect(listCache).toBeDefined();
            expect(listCache).toHaveLength(2);
            expect(note1Cache).toBeDefined();
            expect(note2Cache).toBeDefined();
        });

        it('should handle warmup when no notes exist', async () => {
            const response = await request(app).post('/api/cache/warmup').expect(200);

            expect(response.body).toHaveProperty('success', true);
            expect(response.body).toHaveProperty('message', 'Cache warmed up successfully');

            // Verify empty list is cached
            const listCache = await cache.get('notes:/api/notes');
            expect(listCache).toBeDefined();
            expect(listCache).toHaveLength(0);
        });
    });

    describe('POST /api/cache/preload', () => {
        it('should preload specific notes into cache', async () => {
            // Create test notes
            const note1 = new Note({
                title: 'Preload Note 1',
                content: 'Preload content 1',
                tags: ['preload'],
            });
            const note2 = new Note({
                title: 'Preload Note 2',
                content: 'Preload content 2',
                tags: ['preload'],
            });
            await note1.save();
            await note2.save();

            const response = await request(app)
                .post('/api/cache/preload')
                .send({ noteIds: [note1._id.toString(), note2._id.toString()] })
                .expect(200);

            expect(response.body).toHaveProperty('success', true);
            expect(response.body).toHaveProperty('count', 2);

            // Verify notes are cached
            const note1Cache = await cache.get(`notes:/api/notes/${note1._id}`);
            const note2Cache = await cache.get(`notes:/api/notes/${note2._id}`);

            expect(note1Cache).toBeDefined();
            expect(note1Cache[0].title).toBe('Preload Note 1');
            expect(note2Cache).toBeDefined();
            expect(note2Cache[0].title).toBe('Preload Note 2');
        });

        it('should return error for invalid noteIds format', async () => {
            const response = await request(app)
                .post('/api/cache/preload')
                .send({ noteIds: 'invalid' })
                .expect(400);

            expect(response.body).toHaveProperty('error', 'noteIds must be an array');
        });

        it('should handle non-existent note IDs gracefully', async () => {
            const fakeId = '507f1f77bcf86cd799439011';

            const response = await request(app)
                .post('/api/cache/preload')
                .send({ noteIds: [fakeId] })
                .expect(200);

            expect(response.body).toHaveProperty('success', true);
            expect(response.body).toHaveProperty('count', 0);
        });
    });

    describe('PUT /api/cache/ttl/:key', () => {
        it('should set TTL for a specific key', async () => {
            // Add test data to cache
            await cache.set('test:ttl', 'test value', 300);

            const response = await request(app)
                .put('/api/cache/ttl/test:ttl')
                .send({ ttl: 600 })
                .expect(200);

            expect(response.body).toHaveProperty('success', true);
        });

        it('should return error for invalid TTL', async () => {
            const response = await request(app)
                .put('/api/cache/ttl/test:ttl')
                .send({ ttl: 'invalid' })
                .expect(400);

            expect(response.body).toHaveProperty('error', 'ttl must be a number');
        });

        it('should return error for non-existent key', async () => {
            const response = await request(app)
                .put('/api/cache/ttl/nonexistent:key')
                .send({ ttl: 600 })
                .expect(200);

            expect(response.body).toHaveProperty('error', 'Key not found');
        });
    });
});