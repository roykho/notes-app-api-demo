import Redis from 'ioredis';

class Cache {
    constructor() {
        this.memoryCache = new Map();
        this.redisClient = null;
        this.useRedis = process.env.REDIS_URL || process.env.USE_REDIS === 'true';

        if (this.useRedis) {
            this.initializeRedis();
        }
    }

    initializeRedis() {
        try {
            this.redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
            console.log('Redis cache initialized');
        } catch (error) {
            console.warn('Redis connection failed, falling back to memory cache:', error.message);
            this.useRedis = false;
        }
    }

    async get(key) {
        try {
            if (this.useRedis && this.redisClient) {
                const value = await this.redisClient.get(key);
                return value ? JSON.parse(value) : null;
            } else {
                const item = this.memoryCache.get(key);
                if (!item) return null;

                // Check if item has expired
                if (item.expiresAt && Date.now() > item.expiresAt) {
                    this.memoryCache.delete(key);
                    return null;
                }

                return item.value;
            }
        } catch (error) {
            console.error('Cache get error:', error);
            return null;
        }
    }

    async set(key, value, ttlSeconds = 300) { // Default 5 minutes TTL
        try {
            if (this.useRedis && this.redisClient) {
                await this.redisClient.setex(key, ttlSeconds, JSON.stringify(value));
            } else {
                const expiresAt = Date.now() + (ttlSeconds * 1000);
                this.memoryCache.set(key, { value, expiresAt });

                // Clean up expired items periodically
                this.cleanupExpiredItems();
            }
        } catch (error) {
            console.error('Cache set error:', error);
        }
    }

    async delete(key) {
        try {
            if (this.useRedis && this.redisClient) {
                await this.redisClient.del(key);
            } else {
                this.memoryCache.delete(key);
            }
        } catch (error) {
            console.error('Cache delete error:', error);
        }
    }

    async invalidatePattern(pattern) {
        try {
            if (this.useRedis && this.redisClient) {
                const keys = await this.redisClient.keys(pattern);
                if (keys.length > 0) {
                    await this.redisClient.del(...keys);
                }
            } else {
                // For memory cache, we'll delete all keys that match the pattern
                // This is a simplified implementation
                for (const key of this.memoryCache.keys()) {
                    if (key.includes(pattern.replace('*', ''))) {
                        this.memoryCache.delete(key);
                    }
                }
            }
        } catch (error) {
            console.error('Cache invalidate pattern error:', error);
        }
    }

    async getAllKeys() {
        try {
            if (this.useRedis && this.redisClient) {
                const keys = await this.redisClient.keys('*');
                return keys;
            } else {
                return Array.from(this.memoryCache.keys());
            }
        } catch (error) {
            console.error('Error getting cache keys:', error);
            return [];
        }
    }

    cleanupExpiredItems() {
        const now = Date.now();
        for (const [key, item] of this.memoryCache.entries()) {
            if (item.expiresAt && now > item.expiresAt) {
                this.memoryCache.delete(key);
            }
        }
    }

    async close() {
        if (this.redisClient) {
            await this.redisClient.quit();
        }
    }
}

// Create a singleton instance
const cache = new Cache();

export default cache;