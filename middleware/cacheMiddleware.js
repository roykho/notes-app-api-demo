import cache from '../utils/cache.js';

// Cache middleware for GET requests
export const cacheMiddleware = (ttlSeconds = 300) => {
    return async (req, res, next) => {
        // Only cache GET requests
        if (req.method !== 'GET') {
            return next();
        }

        const cacheKey = `notes:${req.originalUrl}`;

        try {
            // Try to get cached data
            const cachedData = await cache.get(cacheKey);

            if (cachedData) {
                console.log(`Cache hit for key: ${cacheKey}`);
                return res.json(cachedData);
            }

            // If no cached data, store the original res.json method
            const originalJson = res.json;

            // Override res.json to cache the response
            res.json = function(data) {
                // Cache the response data
                cache.set(cacheKey, data, ttlSeconds);
                console.log(`Cached data for key: ${cacheKey}`);

                // Call the original res.json method
                return originalJson.call(this, data);
            };

            next();
        } catch (error) {
            console.error('Cache middleware error:', error);
            next();
        }
    };
};

// Cache invalidation middleware for POST, PUT, DELETE requests
export const invalidateCache = () => {
    return async (req, res, next) => {
        // Only invalidate cache for write operations
        if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
            try {
                // Invalidate all notes-related cache
                await cache.invalidatePattern('notes:*');
                console.log('Cache invalidated for notes');
            } catch (error) {
                console.error('Cache invalidation error:', error);
            }
        }

        next();
    };
};

// Specific cache invalidation for individual note operations
export const invalidateNoteCache = () => {
    return async (req, res, next) => {
        if (['PUT', 'DELETE'].includes(req.method) && req.params.id) {
            try {
                // Invalidate specific note cache
                await cache.delete(`notes:/${req.params.id}`);
                // Also invalidate the list cache since it might be affected
                await cache.invalidatePattern('notes:/');
                console.log(`Cache invalidated for note: ${req.params.id}`);
            } catch (error) {
                console.error('Note cache invalidation error:', error);
            }
        }

        next();
    };
};