import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import cache from '../utils/cache.js';

let mongod;

beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri);
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongod.stop();
    await cache.close();
});

afterEach(async () => {
    // Clear database collections
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        const collection = collections[key];
        await collection.deleteMany();
    }

    // Clear cache to prevent test interference
    await cache.invalidatePattern('notes:*');
});
