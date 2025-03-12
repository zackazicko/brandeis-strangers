# Vercel Deployment Guide

This guide explains how to properly set up environment variables when deploying this application to Vercel.

## Environment Variables in Vercel

When deploying to Vercel, you need to add environment variables through the Vercel dashboard rather than relying on `.env` files. This is because:

1. `.env` files in your repo are not automatically used by Vercel
2. Environment variables in Vercel are securely encrypted and not exposed in your git repository
3. Client-side environment variables must use different naming conventions

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
- Do not use the `REACT_APP_` prefix for Vercel deployments
- All environment variables without the `NEXT_PUBLIC_` prefix will only be available server-side

### 4. Redeploy Your Application

After adding the environment variables:

1. Go to the "Deployments" tab
2. Find your most recent deployment
3. Click the three dots menu (...)
4. Select "Redeploy" to apply the new environment variables

## Security Considerations

- Never commit your actual service keys or passwords to your git repository
- The `.env` file should be listed in your `.gitignore` file
- Regularly rotate your service keys and passwords
- Consider using Vercel's integration with secret management services for production environments

## Troubleshooting

If your application can't access environment variables after deployment:

1. Verify that you've used the `NEXT_PUBLIC_` prefix for browser-accessible variables
2. Check the browser console for any errors related to undefined environment variables
3. Ensure you've redeployed the application after adding the variables
4. Check that the environment variables are added to the correct project in Vercel

## Local vs. Vercel Environment Variables

This application is configured to check for environment variables in both formats:

- `REACT_APP_*` format for local development with Create React App
- `NEXT_PUBLIC_*` format for Vercel deployment

This allows the application to work seamlessly in both environments. 