import { resetDatabase } from './utils/databaseReset.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testDatabaseReset() {
    try {
        console.log('Testing database reset functionality...');

        const result = await resetDatabase();

        console.log('✅ Database reset completed successfully!');
        console.log('Result:', result);

        process.exit(0);
    } catch (error) {
        console.error('❌ Database reset failed:', error);
        process.exit(1);
    }
}

// Run the test
testDatabaseReset();