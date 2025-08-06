# Notes API Caching Implementation

This document describes the caching implementation for the Notes API, which provides both in-memory and Redis caching options to improve performance.

## Features

- **Dual Cache Support**: In-memory caching (default) and Redis caching (optional)
- **Automatic Cache Invalidation**: Cache is automatically invalidated when data changes
- **Configurable TTL**: Time-to-live settings for cached data
- **Cache Management API**: Endpoints for monitoring and managing cache
- **Cache Warming**: Pre-load frequently accessed data into cache

## Configuration

### Environment Variables

```bash
# Optional: Enable Redis caching
REDIS_URL=redis://localhost:6379
USE_REDIS=true

# Optional: Set default cache TTL (in seconds, default: 300)
CACHE_TTL=300
```

### Cache Types

1. **In-Memory Cache (Default)**
   - Uses Node.js Map for storage
   - Automatic cleanup of expired items
   - No external dependencies
   - Data is lost on server restart

2. **Redis Cache (Optional)**
   - Persistent cache storage
   - Better for production environments
   - Supports multiple server instances
   - Requires Redis server

## API Endpoints

### Notes Endpoints (Cached)

All GET requests to notes endpoints are automatically cached:

- `GET /api/notes` - List all notes (cached for 5 minutes)
- `GET /api/notes/:id` - Get specific note (cached for 5 minutes)

### Cache Management Endpoints

- `GET /api/cache/stats` - Get cache statistics
- `GET /api/cache/keys` - List all cache keys
- `DELETE /api/cache/clear` - Clear all cache
- `POST /api/cache/warmup` - Warm up cache with frequently accessed data
- `POST /api/cache/preload` - Preload specific notes into cache
- `PUT /api/cache/ttl/:key` - Set TTL for specific cache key

## Usage Examples

### Get Cache Statistics

```bash
curl http://localhost:8000/api/cache/stats
```

Response:
```json
{
  "type": "Memory",
  "keys": 5,
  "memoryUsage": {
    "rss": 12345678,
    "heapTotal": 9876543,
    "heapUsed": 5432109,
    "external": 123456
  }
}
```

### Warm Up Cache

```bash
curl -X POST http://localhost:8000/api/cache/warmup
```

### Preload Specific Notes

```bash
curl -X POST http://localhost:8000/api/cache/preload \
  -H "Content-Type: application/json" \
  -d '{"noteIds": ["note1", "note2", "note3"]}'
```

### Clear All Cache

```bash
curl -X DELETE http://localhost:8000/api/cache/clear
```

## How It Works

### Automatic Caching

1. **GET Requests**: Automatically cached using middleware
2. **Cache Keys**: Generated based on request URL (e.g., `notes:/`, `notes:/123`)
3. **TTL**: Default 5 minutes, configurable per route

### Cache Invalidation

1. **POST Requests**: Invalidates all notes-related cache
2. **PUT/DELETE Requests**: Invalidates specific note cache and list cache
3. **Pattern-based**: Uses Redis pattern matching or memory cache filtering

### Cache Middleware

The caching system uses Express middleware that:

1. Intercepts GET requests
2. Checks for cached data
3. Returns cached data if available
4. Caches new responses automatically
5. Handles cache invalidation for write operations

## Performance Benefits

- **Reduced Database Load**: Frequently accessed data served from cache
- **Faster Response Times**: Cache hits return data immediately
- **Scalability**: Redis cache supports multiple server instances
- **Automatic Management**: No manual cache management required

## Monitoring

### Cache Hit Rate

Monitor cache effectiveness by checking the console logs:
- `Cache hit for key: notes:/` - Data served from cache
- `Cached data for key: notes:/` - New data cached
- `Cache invalidated for notes` - Cache cleared due to data changes

### Cache Statistics

Use the `/api/cache/stats` endpoint to monitor:
- Cache type (Memory/Redis)
- Number of cached items
- Memory usage (for in-memory cache)
- Redis info (for Redis cache)

## Best Practices

1. **TTL Configuration**: Set appropriate TTL based on data freshness requirements
2. **Cache Warming**: Use warmup endpoint during application startup
3. **Monitoring**: Regularly check cache statistics and hit rates
4. **Redis Setup**: Use Redis in production for better performance and persistence

## Troubleshooting

### Common Issues

1. **Cache Not Working**: Check if middleware is properly applied to routes
2. **Redis Connection Failed**: Verify Redis server is running and accessible
3. **Memory Usage High**: Monitor in-memory cache size and consider Redis
4. **Stale Data**: Check TTL settings and cache invalidation logic

### Debug Mode

Enable debug logging by setting environment variable:
```bash
DEBUG=cache:*
```

## Installation

1. Install dependencies:
```bash
npm install
```

2. For Redis caching (optional):
```bash
# Install Redis server
# macOS: brew install redis
# Ubuntu: sudo apt-get install redis-server

# Start Redis
redis-server

# Set environment variables
export REDIS_URL=redis://localhost:6379
export USE_REDIS=true
```

3. Start the server:
```bash
npm run dev
```

## Cache Keys Format

- `notes:/` - List of all notes
- `notes:/:id` - Individual note by ID
- `notes:search:query` - Search results (if implemented)

## Future Enhancements

- [ ] Cache compression for large datasets
- [ ] Cache analytics and metrics
- [ ] Distributed cache support
- [ ] Cache warming strategies
- [ ] Cache versioning