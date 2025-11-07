# Netlify Deployment Checklist

Use this checklist to ensure your site is ready for deployment to Netlify.

## Pre-Deployment

- [x] **Build Configuration**
  - [x] `netlify.toml` file created with build settings
  - [x] Build command: `npm ci && npm run build`
  - [x] Publish directory: `dist`
  - [x] Node version: 18 (specified in `.nvmrc`)

- [x] **Build Test**
  - [x] Build completes successfully locally
  - [x] No build errors or warnings
  - [x] `dist` folder is generated correctly

- [x] **Configuration Files**
  - [x] `vite.config.ts` optimized for production
  - [x] `package.json` has correct build script
  - [x] `.gitignore` excludes `node_modules` and `dist`

- [x] **Routing**
  - [x] `netlify.toml` includes SPA redirect rules
  - [x] All routes redirect to `index.html`
  - [x] React Router configured correctly

- [x] **Assets**
  - [x] Logo image (`/LOGO.png`) is in `public/` folder
  - [x] Favicon configured in `index.html`
  - [x] All images load correctly

## Deployment Steps

- [ ] **GitHub**
  - [ ] Code pushed to GitHub repository
  - [ ] All files committed
  - [ ] Repository is accessible

- [ ] **Netlify**
  - [ ] Create Netlify account (if needed)
  - [ ] Connect GitHub repository
  - [ ] Verify build settings from `netlify.toml`
  - [ ] Click "Deploy site"
  - [ ] Wait for build to complete

- [ ] **Post-Deployment**
  - [ ] Test site is accessible
  - [ ] Test all routes work correctly
  - [ ] Test navigation
  - [ ] Test product pages
  - [ ] Test cart functionality
  - [ ] Test checkout flow
  - [ ] Test mobile responsiveness
  - [ ] Test search functionality

## Verification

### Build Verification
- [ ] Build completes without errors
- [ ] Build time is reasonable (< 5 minutes)
- [ ] No missing dependencies

### Functionality Verification
- [ ] Home page loads correctly
- [ ] Product pages load correctly
- [ ] Category pages work
- [ ] Search works
- [ ] Cart works
- [ ] Checkout works
- [ ] Favorites work
- [ ] Navigation works
- [ ] Mobile menu works

### Performance Verification
- [ ] Page load time is acceptable
- [ ] Images load correctly
- [ ] No console errors
- [ ] No broken links

### Security Verification
- [ ] HTTPS is enabled (automatic on Netlify)
- [ ] Security headers are set (from `netlify.toml`)
- [ ] No sensitive data exposed

## Optional Configuration

- [ ] **Custom Domain**
  - [ ] Domain configured in Netlify
  - [ ] DNS settings updated
  - [ ] SSL certificate active

- [ ] **Environment Variables**
  - [ ] Check if any environment variables are needed
  - [ ] Add variables in Netlify dashboard
  - [ ] Test with variables

- [ ] **Analytics**
  - [ ] Enable Netlify Analytics (optional)
  - [ ] Or integrate Google Analytics (optional)

## Troubleshooting

If deployment fails:

1. **Check Build Logs**
   - Go to Netlify dashboard
   - Click on the failed deployment
   - Review build logs for errors

2. **Common Issues**
   - Node version mismatch → Check `.nvmrc` and `netlify.toml`
   - Missing dependencies → Run `npm install` locally
   - Build errors → Fix errors and push again
   - Routing issues → Verify `netlify.toml` redirects

3. **Test Locally**
   ```bash
   npm run build
   npm run preview
   ```

## Files Created for Deployment

- ✅ `netlify.toml` - Netlify configuration
- ✅ `.nvmrc` - Node version specification
- ✅ `README.md` - Project documentation
- ✅ `NETLIFY_DEPLOYMENT.md` - Deployment guide
- ✅ `DEPLOYMENT_CHECKLIST.md` - This checklist

## Next Steps After Deployment

1. Share the Netlify URL with your team
2. Set up custom domain (if needed)
3. Configure analytics (optional)
4. Monitor build logs for issues
5. Set up branch previews (optional)

---

**Ready to deploy?** Follow the steps in `NETLIFY_DEPLOYMENT.md`!

