# Deployment Guide - Vercel Cron Job

## Prerequisites

1. **Vercel Account**: You need a Vercel account to deploy and use cron jobs
2. **MongoDB Database**: A MongoDB database (Atlas, local, or other provider)
3. **Vercel CLI** (optional): For local testing and deployment

## Deployment Steps

### 1. Deploy to Vercel

#### Option A: Using Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from the notes-api directory
cd notes-api
vercel

# Follow the prompts to link to your Vercel project
```

#### Option B: Using GitHub Integration
1. Push your code to GitHub
2. Connect your GitHub repository to Vercel
3. Vercel will automatically deploy when you push changes

### 2. Set Environment Variables

In your Vercel project dashboard:

1. Go to **Settings** → **Environment Variables**
2. Add the following variable:
   - **Name**: `MONGO_URI`
   - **Value**: Your MongoDB connection string
   - **Environment**: Production (and Preview if needed)

Example MongoDB URI:
```
mongodb+srv://username:password@cluster.mongodb.net/notes-db?retryWrites=true&w=majority
```

### 3. Verify Deployment

After deployment, you can test the manual reset endpoint:

```bash
curl -X POST https://your-app-name.vercel.app/api/reset-database
```

### 4. Monitor Cron Job

1. **Function Logs**: Check the Vercel dashboard → Functions → Logs
2. **Cron Job Status**: Vercel will show cron job execution status
3. **Database**: Verify that your database is being reset daily

## Testing Locally

Before deploying, test the functionality locally:

```bash
# Set up your .env file with MONGO_URI
echo "MONGO_URI=your_mongodb_connection_string" > .env

# Test the database reset
npm run reset-db
```

## Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Check your `MONGO_URI` environment variable
   - Ensure your MongoDB instance is accessible from Vercel's servers
   - Verify network access and firewall settings

2. **Cron Job Not Running**
   - Check the `vercel.json` configuration
   - Verify the cron schedule format
   - Check Vercel function logs for errors

3. **Authentication Errors**
   - The cron endpoint requires proper authentication
   - Vercel automatically provides the Bearer token
   - Manual endpoint doesn't require authentication

### Debugging

1. **Check Function Logs**:
   ```bash
   vercel logs
   ```

2. **Test Manual Endpoint**:
   ```bash
   curl -X POST https://your-app.vercel.app/api/reset-database
   ```

3. **Verify Database**:
   - Check your MongoDB database directly
   - Verify documents are being deleted and recreated

## Cron Job Schedule

The current configuration runs every day at midnight UTC:
- **Schedule**: `0 0 * * *`
- **Frequency**: Daily at 00:00 UTC
- **Timezone**: UTC (Vercel cron jobs run in UTC)

To change the schedule, modify the `vercel.json` file:
- `0 */12 * * *` = Every 12 hours
- `0 0 * * 0` = Every Sunday at midnight
- `0 0 1 * *` = First day of every month

## Security Considerations

1. **Environment Variables**: Never commit sensitive data like database URIs
2. **Authentication**: The cron endpoint is protected by Vercel's authentication
3. **Manual Endpoint**: Consider adding authentication to the manual endpoint in production
4. **Database Access**: Use read/write permissions only, avoid admin access