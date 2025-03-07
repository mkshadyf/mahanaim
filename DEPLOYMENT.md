# Mahanaim Money App Deployment Guide

This document outlines the steps to deploy the Mahanaim Money App using Vercel and GitHub integration.

## Deployment with Vercel

### Prerequisites

- A GitHub account with the Mahanaim Money App repository
- A Vercel account (you can sign up at [vercel.com](https://vercel.com) using your GitHub account)

### Setup Steps

1. **Push your code to GitHub**

   Make sure your code is pushed to a GitHub repository:

   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **Connect Vercel to your GitHub repository**

   - Go to [vercel.com](https://vercel.com) and sign in with your GitHub account
   - Click "Add New..." and select "Project"
   - Import your GitHub repository
   - Vercel will automatically detect that it's a Vite project

3. **Configure the deployment**

   - Vercel will automatically detect the build settings from your `vercel.json` file
   - You can customize the project name and other settings if needed
   - Click "Deploy"

4. **Verify the deployment**

   - Once the deployment is complete, Vercel will provide you with a URL to access your application
   - Test the application to ensure everything is working correctly

## Continuous Deployment

With the GitHub integration enabled in your `vercel.json` file, Vercel will automatically deploy your application whenever you push changes to your GitHub repository:

```json
"github": {
  "enabled": true,
  "silent": false
}
```

This means:
- Every push to the main branch will trigger a production deployment
- Every pull request will create a preview deployment

## Environment Variables

If your application requires environment variables:

1. Go to your project settings in Vercel
2. Navigate to the "Environment Variables" tab
3. Add your environment variables (e.g., API keys, database URLs)
4. You can specify different values for Production, Preview, and Development environments

## Custom Domains

To use a custom domain:

1. Go to your project settings in Vercel
2. Navigate to the "Domains" tab
3. Add your domain and follow the instructions to configure DNS settings

## Troubleshooting

If you encounter issues with your deployment:

1. Check the build logs in Vercel for error messages
2. Ensure all dependencies are correctly listed in your `package.json`
3. Verify that your application works locally with `npm run build && npm run preview`
4. Check that your `vercel.json` configuration is correct

For more help, refer to the [Vercel documentation](https://vercel.com/docs) or contact Vercel support. 