import express from 'express';
import cacheManager from '../utils/cacheManager.js';

const router = express.Router();

// Get cache statistics
router.get('/stats', async (req, res, next) => {
    try {
        const stats = await cacheManager.getStats();
        res.json(stats);
    } catch (err) {
        next(err);
    }
});

// Get all cache keys
router.get('/keys', async (req, res, next) => {
    try {
        const keys = await cacheManager.getAllKeys();
        res.json(keys);
    } catch (err) {
        next(err);
    }
});

// Clear all cache
router.delete('/clear', async (req, res, next) => {
    try {
        const result = await cacheManager.clearAll();
        res.json(result);
    } catch (err) {
        next(err);
    }
});

// Warm up cache
router.post('/warmup', async (req, res, next) => {
    try {
        const result = await cacheManager.warmUpCache();
        res.json(result);
    } catch (err) {
        next(err);
    }
});

// Preload specific notes
router.post('/preload', async (req, res, next) => {
    try {
        const { noteIds } = req.body;
        if (!Array.isArray(noteIds)) {
            return res.status(400).json({ error: 'noteIds must be an array' });
        }

        const result = await cacheManager.preloadNotes(noteIds);
        res.json(result);
    } catch (err) {
        next(err);
    }
});

// Set TTL for a specific key
router.put('/ttl/:key', async (req, res, next) => {
    try {
        const { key } = req.params;
        const { ttl } = req.body;

        if (!ttl || typeof ttl !== 'number') {
            return res.status(400).json({ error: 'ttl must be a number' });
        }

        const result = await cacheManager.setTTL(key, ttl);
        res.json(result);
    } catch (err) {
        next(err);
    }
});

export default router;