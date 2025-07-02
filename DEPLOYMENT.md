# Vercel Deployment Guide

This guide explains how to deploy the RCA Case Notes Management System to Vercel.

## Prerequisites

1. A Vercel account at [vercel.com](https://vercel.com)
2. The Vercel CLI (optional): `npm i -g vercel`
3. A PostgreSQL database (recommend using Neon, Supabase, or Vercel Postgres)

## Environment Variables

Set these environment variables in your Vercel project:

```
DATABASE_URL=your_postgresql_connection_string
SESSION_SECRET=your_random_session_secret_key
REPL_ID=your_replit_id_for_oauth
```

## Deployment Steps

### Option 1: Deploy via Vercel Dashboard

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your repository
4. Vercel will automatically detect the framework and use the `vercel.json` configuration
5. Add your environment variables in the project settings
6. Deploy!

### Option 2: Deploy via CLI

```bash
# Install Vercel CLI if you haven't already
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow the prompts to configure your project
```

## Build Configuration

The project includes a `vercel.json` file with the following configuration:

- **Frontend**: Built with Vite and served as static files from `dist/public`
- **Backend**: API routes handled by serverless functions in the `api/` directory
- **Database**: PostgreSQL connection via environment variables

## Important Notes

1. **Database**: Make sure your PostgreSQL database is accessible from Vercel (most cloud providers work)
2. **File Uploads**: The current file upload system uses local storage, which won't work on Vercel. You'll need to modify it to use cloud storage (S3, Cloudinary, etc.)
3. **Sessions**: Session storage uses PostgreSQL, which works with Vercel
4. **Authentication**: Replit Auth may need configuration adjustments for your Vercel domain

## Troubleshooting

### Common Issues

1. **Database Connection**: Ensure your DATABASE_URL is correct and the database is accessible
2. **Environment Variables**: Check that all required environment variables are set in Vercel
3. **Build Errors**: Check the build logs in Vercel dashboard for specific error messages

### File Upload Limitations

The current implementation uses local file storage which doesn't work on Vercel's serverless platform. To fix this:

1. Choose a cloud storage provider (AWS S3, Cloudinary, etc.)
2. Update the multer configuration in `server/routes.ts`
3. Modify file serving routes to use cloud URLs

## Performance Considerations

- Vercel functions have a 10-second execution limit
- Database connections should use connection pooling
- Consider implementing caching for frequently accessed data

## Security Notes

- Ensure your PostgreSQL database has proper access controls
- Use strong, unique values for SESSION_SECRET
- Configure CORS properly for your domain
- Review and update authentication settings for production use