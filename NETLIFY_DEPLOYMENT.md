# Netlify Deployment Guide

This guide will help you deploy your KHA_MOBILE application to Netlify.

## Prerequisites

- A GitHub account
- A Netlify account (sign up at https://www.netlify.com)
- Your code pushed to a GitHub repository

## Deployment Steps

### Option 1: Deploy via Netlify Dashboard (Recommended)

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for Netlify deployment"
   git push origin main
   ```

2. **Log in to Netlify**
   - Go to https://app.netlify.com
   - Sign in with your GitHub account

3. **Add a new site**
   - Click "Add new site" → "Import an existing project"
   - Select "GitHub" as your Git provider
   - Authorize Netlify to access your GitHub repositories if prompted
   - Select your repository

4. **Configure build settings**
   Netlify will automatically detect the settings from `netlify.toml`:
   - **Build command**: `npm ci && npm run build`
     - `npm ci` - Installs dependencies from package-lock.json (faster and more reliable)
     - `npm run build` - Runs the Vite build command to create the production bundle
   - **Publish directory**: `dist` (this is where Vite outputs the built files)
   - **Node version**: 18 (specified in `.nvmrc` and `netlify.toml`)
   
   **Important**: If Netlify doesn't auto-detect the settings, manually enter:
   - Build command: `npm ci && npm run build`
   - Publish directory: `dist`
   - Base directory: (leave empty unless your project is in a subfolder)

5. **Deploy**
   - Click "Deploy site"
   - Netlify will build and deploy your site
   - Wait for the build to complete (usually 2-5 minutes)

6. **Access your site**
   - Once deployed, Netlify will provide you with a URL like `https://random-name-123456.netlify.app`
   - Your site is now live!

### Option 2: Deploy via Netlify CLI

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**
   ```bash
   netlify login
   ```

3. **Initialize Netlify in your project**
   ```bash
   netlify init
   ```
   - Follow the prompts to link your site
   - The CLI will detect `netlify.toml` automatically

4. **Deploy**
   ```bash
   netlify deploy --prod
   ```

## Post-Deployment Configuration

### 1. Custom Domain (Optional)

1. Go to your site settings in Netlify
2. Click "Domain settings"
3. Click "Add custom domain"
4. Follow the instructions to configure your domain

### 2. Environment Variables (If Needed)

If you need to add environment variables:

1. Go to Site settings → Environment variables
2. Add your variables
3. Redeploy your site

**Note**: Currently, no environment variables are required for this project.

### 3. SSL Certificate

Netlify automatically provides SSL certificates for all sites (including custom domains) via Let's Encrypt. No configuration needed!

## Build Configuration

The project includes a `netlify.toml` file with the following configuration:

### Build Settings

- **Build Command**: `npm ci && npm run build`
  - This command does two things:
    1. `npm ci` - Cleans install of dependencies (uses package-lock.json)
    2. `npm run build` - Builds the project using Vite (creates optimized production bundle)
  
- **Publish Directory**: `dist`
  - This is where Vite outputs the built files after running `npm run build`
  - All static files (HTML, CSS, JS, images) will be in this folder

- **Node Version**: 18
  - Specified in both `.nvmrc` file and `netlify.toml`
  - Netlify will automatically use Node.js 18 for the build

### What Happens During Build

1. Netlify installs Node.js 18
2. Runs `npm ci` to install all dependencies
3. Runs `npm run build` which executes `vite build`
4. Vite creates an optimized production build in the `dist` folder
5. Netlify deploys everything in the `dist` folder to their CDN

### Other Configuration

- **SPA Routing**: All routes redirect to `index.html` for React Router
- **Security Headers**: X-Frame-Options, XSS Protection, etc.
- **Cache Optimization**: Static assets are cached for 1 year

## Troubleshooting

### Build Fails

1. **Check build logs** in Netlify dashboard
2. **Verify Node version**: Ensure Node 18 is being used
3. **Check dependencies**: Ensure all dependencies are in `package.json`
4. **Test build locally**: Run `npm run build` locally to catch errors

### Routes Not Working

1. **Verify `netlify.toml`**: Ensure redirects are configured correctly
2. **Check React Router**: Ensure all routes use `Link` component
3. **Clear cache**: Clear browser cache and try again

### Assets Not Loading

1. **Check file paths**: Ensure all assets use relative paths
2. **Verify public folder**: Ensure assets in `public/` are included in build
3. **Check base URL**: If using a custom domain, verify base URL settings

### Performance Issues

1. **Check bundle size**: Run `npm run build` and check for warnings
2. **Enable compression**: Netlify automatically compresses files
3. **Optimize images**: Ensure images are optimized before deployment

## Continuous Deployment

Netlify automatically deploys your site when you push to your main branch:

1. Make changes to your code
2. Commit and push to GitHub
3. Netlify automatically rebuilds and deploys
4. Your changes go live in 2-5 minutes

## Preview Deployments

Netlify creates preview deployments for every pull request:

1. Create a pull request on GitHub
2. Netlify automatically creates a preview deployment
3. Share the preview URL with your team
4. Merge when ready

## Useful Netlify Features

- **Split Testing**: Test different versions of your site
- **Form Handling**: Handle form submissions (if needed)
- **Functions**: Serverless functions (if needed)
- **Analytics**: Built-in analytics (optional)
- **Branch Deploys**: Deploy different branches

## Support

If you encounter any issues:

1. Check Netlify's documentation: https://docs.netlify.com
2. Check build logs in Netlify dashboard
3. Verify your `netlify.toml` configuration
4. Contact Netlify support if needed

## Next Steps

After deployment:

1. ✅ Test all routes and functionality
2. ✅ Verify mobile responsiveness
3. ✅ Test checkout flow
4. ✅ Configure custom domain (optional)
5. ✅ Set up analytics (optional)
6. ✅ Enable form notifications (if using forms)

---

Happy deploying! 🚀

