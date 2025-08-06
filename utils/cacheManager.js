import cache from './cache.js';

class CacheManager {
    // Get cache statistics
    async getStats() {
        try {
            if (cache.useRedis && cache.redisClient) {
                const info = await cache.redisClient.info();
                const keys = await cache.redisClient.dbsize();
                return {
                    type: 'Redis',
                    keys,
                    info: info.split('\r\n').filter(line => line.includes(':')).reduce((acc, line) => {
                        const [key, value] = line.split(':');
                        acc[key] = value;
                        return acc;
                    }, {})
                };
            } else {
                return {
                    type: 'Memory',
                    keys: cache.memoryCache.size,
                    memoryUsage: process.memoryUsage()
                };
            }
        } catch (error) {
            console.error('Error getting cache stats:', error);
            return { error: error.message };
        }
    }

    // Clear all cache
    async clearAll() {
        try {
            if (cache.useRedis && cache.redisClient) {
                await cache.redisClient.flushdb();
                console.log('All Redis cache cleared');
            } else {
                cache.memoryCache.clear();
                console.log('All memory cache cleared');
            }
            return { success: true, message: 'All cache cleared' };
        } catch (error) {
            console.error('Error clearing cache:', error);
            return { error: error.message };
        }
    }

    // Get all cache keys
    async getAllKeys() {
        try {
            return await cache.getAllKeys();
        } catch (error) {
            console.error('Error getting cache keys:', error);
            return [];
        }
    }

    // Warm up cache with frequently accessed data
    async warmUpCache() {
        try {
            const Note = (await import('../models/note.js')).default;
            const notes = await Note.find().sort({ createdAt: -1 });

            // Cache the notes list
            await cache.set('notes:/api/notes', notes, 300);
            console.log('Cache warmed up with notes list');

            // Cache individual notes
            for (const note of notes.slice(0, 10)) { // Cache first 10 notes
                await cache.set(`notes:/api/notes/${note._id}`, [note], 300);
            }
            console.log('Cache warmed up with individual notes');

            return { success: true, message: 'Cache warmed up successfully' };
        } catch (error) {
            console.error('Error warming up cache:', error);
            return { error: error.message };
        }
    }

    // Preload cache for specific note IDs
    async preloadNotes(noteIds) {
        try {
            const Note = (await import('../models/note.js')).default;
            const notes = await Note.find({ _id: { $in: noteIds } });

            for (const note of notes) {
                await cache.set(`notes:/api/notes/${note._id}`, [note], 300);
            }

            console.log(`Preloaded ${notes.length} notes into cache`);
            return { success: true, count: notes.length };
        } catch (error) {
            console.error('Error preloading notes:', error);
            return { error: error.message };
        }
    }

    // Set cache TTL for specific keys
    async setTTL(key, ttlSeconds) {
        try {
            if (cache.useRedis && cache.redisClient) {
                await cache.redisClient.expire(key, ttlSeconds);
                return { success: true };
            } else {
                // For memory cache, we need to get the value and set it again with new TTL
                const item = cache.memoryCache.get(key);
                if (item) {
                    await cache.set(key, item.value, ttlSeconds);
                    return { success: true };
                }
                return { error: 'Key not found' };
            }
        } catch (error) {
            console.error('Error setting TTL:', error);
            return { error: error.message };
        }
    }
}

export default new CacheManager();