# Netlify Deployment Guide for Employee Management App

This guide will help you deploy the Employee Management App to Netlify using the Netlify Drop service or the Netlify CLI.

## Option 1: Deploy using Netlify Drop (Easiest)

1. Go to [Netlify Drop](https://app.netlify.com/drop)
2. Drag and drop the `dist` folder from your local machine
3. Wait for the deployment to complete
4. Your application will be available at a Netlify subdomain (e.g., https://your-site-name.netlify.app)

## Option 2: Deploy using Netlify CLI

If you prefer using the command line, follow these steps:

1. Install the Netlify CLI globally:
   ```
   npm install -g netlify-cli
   ```

2. Log in to your Netlify account:
   ```
   netlify login
   ```

3. Deploy the application:
   ```
   netlify deploy --dir=dist --prod
   ```

4. Follow the prompts to complete the deployment

## Option 3: Deploy using the Netlify Site

1. Go to [Netlify](https://app.netlify.com/) and log in
2. Click on "New site from Git"
3. Connect to your Git provider (GitHub, GitLab, or Bitbucket)
4. Select your repository
5. Configure the build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Click on "Deploy site"

## Post-Deployment Configuration

After deploying your site, you may want to configure the following:

### 1. Environment Variables

Set the following environment variables in your Netlify site settings:

- `VITE_API_URL`: The URL of your API server (e.g., https://my-json-server.typicode.com/your-username/employee-management-demo)

### 2. Domain Settings

If you have a custom domain, you can configure it in the Netlify site settings:

1. Go to your site's dashboard
2. Click on "Domain settings"
3. Click on "Add custom domain"
4. Follow the instructions to set up your domain

### 3. Build Hooks

If you want to trigger builds automatically, you can set up build hooks:

1. Go to your site's dashboard
2. Click on "Build & deploy"
3. Scroll down to "Build hooks"
4. Click on "Add build hook"
5. Give it a name and select the branch to build
6. Use the generated URL to trigger builds

## Troubleshooting

### 1. Page Not Found Errors

If you're getting 404 errors when navigating to routes directly, make sure the `_redirects` file is in the `dist` folder with the following content:

```
/* /index.html 200
```

### 2. API Connection Issues

If the application can't connect to the API, check the following:

1. Make sure the API URL is correct in the environment variables
2. Check if CORS is enabled on your API server
3. Verify that the API endpoints match what the application expects

### 3. Build Failures

If the build fails, check the build logs for errors. Common issues include:

1. Missing dependencies
2. TypeScript errors
3. Environment variable issues

## Testing the Deployed Application

Once deployed, you can test the application using the following credentials:

- Email: admin@example.com
- Password: password123

## Need Help?

If you encounter any issues during deployment, refer to the [Netlify documentation](https://docs.netlify.com/) or contact support.
