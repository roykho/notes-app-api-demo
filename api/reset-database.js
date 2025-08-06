import { resetDatabase } from '../utils/databaseReset.js';

export default async function handler(req, res) {
    // Allow POST requests and GET requests for cron jobs
    if (req.method !== 'POST' && req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Check if this is a Vercel cron job request (has authorization header)
    const authHeader = req.headers.authorization;
    const isCronJob = authHeader && authHeader.startsWith('Bearer ');

    // For cron jobs, require authentication
    if (isCronJob) {
        console.log('Cron job triggered - resetting database...');
    } else {
        console.log('Manual database reset triggered...');
    }

    try {
        const result = await resetDatabase();

        console.log('Database reset completed successfully:', result);

        return res.status(200).json({
            success: true,
            message: 'Database reset completed successfully',
            data: result,
            triggeredBy: isCronJob ? 'cron-job' : 'manual'
        });

    } catch (error) {
        console.error('Database reset failed:', error);

        return res.status(500).json({
            success: false,
            error: 'Database reset failed',
            message: error.message
        });
    }
}