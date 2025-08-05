# Vercel Cron Job - Database Reset

This project includes a Vercel cron job that automatically resets the notes database every 24 hours by deleting all documents and reimporting the sample data.

## Setup

### 1. Vercel Configuration

The `vercel.json` file contains the cron job configuration:

```json
{
  "crons": [
    {
      "path": "/api/cron/reset-database",
      "schedule": "0 0 * * *"
    }
  ]
}
```

- **Schedule**: `0 0 * * *` means the job runs every day at midnight (00:00 UTC)
- **Path**: `/api/cron/reset-database` points to the serverless function that handles the reset

### 2. API Endpoint

#### Database Reset Endpoint (Dual Purpose)
- **Path**: `/api/reset-database`
- **Method**: POST
- **Authentication**:
  - **Cron Job**: Requires Bearer token (automatically provided by Vercel)
  - **Manual**: None (for testing purposes)
- **Purpose**:
  - Called automatically by Vercel cron job (authenticated)
  - Manual database reset for testing (unauthenticated)

## How It Works

1. **Database Connection**: The function connects to MongoDB using the `MONGO_URI` environment variable
2. **Data Deletion**: All documents in the `notes` collection are deleted
3. **Sample Data Import**: The function reads `sample-data/notes-data.json` and imports all notes
4. **Data Transformation**: MongoDB date format is converted to JavaScript Date objects
5. **Response**: Returns success/failure status with counts of deleted and inserted documents

## Environment Variables

Make sure you have the following environment variable set in your Vercel project:

```
MONGO_URI=your_mongodb_connection_string
```

## Testing

You can test the database reset functionality manually by making a POST request to:

```
POST /api/reset-database
```

Example using curl:
```bash
curl -X POST https://your-vercel-app.vercel.app/api/reset-database
```

## Monitoring

- Check Vercel Function Logs in the Vercel dashboard
- The cron job logs will show:
  - Number of documents deleted
  - Number of documents inserted
  - Any errors that occur during the process

## Cron Schedule Format

The schedule uses standard cron syntax:
- `0 0 * * *` = Every day at midnight (00:00 UTC)
- `0 */12 * * *` = Every 12 hours
- `0 0 * * 0` = Every Sunday at midnight

## Files Created

- `vercel.json` - Vercel configuration with cron job
- `api/reset-database.js` - Database reset endpoint (handles both cron and manual requests)
- `utils/databaseReset.js` - Database reset utility function

## Security Notes

- The endpoint automatically detects if it's called by Vercel cron (has Bearer token) or manually
- Cron job requests are authenticated via Bearer token (automatically provided by Vercel)
- Manual requests have no authentication (for testing only)
- In production, consider adding additional security measures for manual requests