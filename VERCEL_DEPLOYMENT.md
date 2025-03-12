# Vercel Deployment Guide

This guide explains how to properly set up environment variables when deploying this application to Vercel.

## Environment Variables in Vercel

When deploying to Vercel, you need to add environment variables through the Vercel dashboard. This is because:

1. Environment variables in Vercel are securely encrypted and not exposed in your git repository
2. Client-side environment variables must use a specific naming convention (`NEXT_PUBLIC_` prefix)

## Setting Up Environment Variables

Follow these steps to set up your environment variables in Vercel:

### 1. Navigate to Project Settings

- Go to your Vercel dashboard
- Select your project
- Click on the "Settings" tab
- Select "Environment Variables" from the sidebar

### 2. Add Required Environment Variables

Add the following environment variables:

| Name | Value | Environment |
|------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_SERVICE_KEY` | `your-service-role-key` | Production, Preview, Development |
| `NEXT_PUBLIC_ADMIN_PASSWORD` | `your-admin-password` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `your-anon-key` (if needed) | Production, Preview, Development |

### 3. Important Notes About Names

- The `NEXT_PUBLIC_` prefix is **required** for any environment variables that need to be accessible in the browser
- Do not include quotes around your values in the Vercel dashboard
- Make sure to select all environments (Production, Preview, Development) for each variable

### 4. Redeploy Your Application

After adding the environment variables:

1. Go to the "Deployments" tab
2. Find your most recent deployment
3. Click the three dots menu (...)
4. Select "Redeploy" to apply the new environment variables

## Verifying Environment Variables

After redeployment, check that your environment variables are working:

1. Open your deployed site and check the browser console
2. Look for messages confirming that the service key was found
3. Try accessing the admin panel to confirm it works with your credentials

## Security Considerations

- Never commit your actual service keys or passwords to your git repository
- Regularly rotate your service keys and passwords
- Consider using Vercel's integration with secret management services for production environments

## Troubleshooting

If your application can't access environment variables after deployment:

1. Verify that you've used the `NEXT_PUBLIC_` prefix for all variables
2. Check that you've added the variables to all environments (Production, Preview, Development)
3. Ensure you've redeployed the application after adding the variables
4. Check the browser console for any error messages about missing environment variables
5. Verify the exact variable names match what the application expects 