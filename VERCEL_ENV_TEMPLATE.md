# Environment Variables for Vercel Production

## Copy these values from your .env.local and add to Vercel:

### Database (Supabase)
DATABASE_URL=your_actual_database_url_here
DIRECT_URL=your_actual_direct_url_here

### NextAuth
NEXTAUTH_SECRET=your_actual_nextauth_secret_here
NEXTAUTH_URL=https://your-production-domain.vercel.app

## How to Add to Vercel:
1. Go to your Vercel project
2. Click Settings → Environment Variables
3. Add each variable above
4. Select "Production" environment
5. Click "Save"

## Important Notes:
- NEXTAUTH_URL should be your actual Vercel domain
- NEXTAUTH_SECRET should be the same one from your .env.local
- DATABASE_URL and DIRECT_URL should point to your Supabase production database
