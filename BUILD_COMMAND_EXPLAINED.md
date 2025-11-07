# Build Command Explanation for Netlify

## What to Write in the Build Command Field

When setting up your Netlify deployment, use this exact command:

```
npm ci && npm run build
```

## Breaking Down the Build Command

### `npm ci`
- **What it does**: Installs dependencies from `package-lock.json`
- **Why use it**: 
  - Faster than `npm install` (skips dependency resolution)
  - More reliable for CI/CD (uses exact versions from lock file)
  - Ensures consistent builds across environments
  - Automatically removes `node_modules` before installing

### `&&`
- **What it does**: Runs the second command only if the first succeeds
- **Why use it**: If `npm ci` fails (e.g., dependency issues), the build stops

### `npm run build`
- **What it does**: Runs the build script defined in `package.json`
- **What happens**: 
  - Executes `vite build` (as defined in package.json)
  - Creates optimized production bundle
  - Outputs files to `dist` folder
  - Minifies code, optimizes images, creates source maps (if enabled)

## Alternative Build Commands

### If `npm ci` fails (shouldn't happen, but just in case):
```
npm install && npm run build
```
**Note**: Use `npm ci` when possible as it's more reliable.

### If you want to see more build output:
```
npm ci && npm run build -- --debug
```

### If you need to build with development mode (not recommended for production):
```
npm ci && npm run build:dev
```

## Where to Enter the Build Command in Netlify

### Option 1: Automatic Detection
- Netlify automatically reads `netlify.toml`
- The build command is already configured
- **You don't need to enter anything manually!**

### Option 2: Manual Entry (if auto-detection fails)
1. Go to Site settings → Build & deploy
2. Click "Edit settings"
3. Under "Build command", enter: `npm ci && npm run build`
4. Under "Publish directory", enter: `dist`

## Publish Directory

**Always use**: `dist`

This is where Vite outputs all built files. The `dist` folder contains:
- `index.html` - Main HTML file
- `assets/` - All JavaScript, CSS, and optimized images
- `LOGO.png` - Static assets from `public/` folder
- Other files from `public/` folder

## Complete Netlify Build Settings Summary

| Setting | Value | Explanation |
|---------|-------|-------------|
| **Build command** | `npm ci && npm run build` | Installs deps and builds the project |
| **Publish directory** | `dist` | Where the built files are located |
| **Node version** | `18` | Specified in `.nvmrc` and `netlify.toml` |
| **Base directory** | (empty) | Root of repository |

## Verification

After deployment, verify the build worked by:

1. **Check build logs** in Netlify dashboard
   - Should see "npm ci" installing packages
   - Should see "vite build" creating the bundle
   - Should see "Build completed successfully"

2. **Check site**
   - Site should load correctly
   - All routes should work
   - Assets should load

## Common Build Issues

### Issue: "Command not found: npm"
**Solution**: Make sure Node.js is installed. Netlify should auto-detect from `.nvmrc`

### Issue: "npm ci failed"
**Solution**: 
- Check if `package-lock.json` exists
- Try using `npm install` instead (not recommended)
- Check build logs for specific error

### Issue: "Build succeeded but site shows 404"
**Solution**: 
- Verify publish directory is `dist`
- Check if `dist/index.html` exists
- Verify SPA redirect rules in `netlify.toml`

### Issue: "Assets not loading"
**Solution**:
- Check if assets are in `public/` folder (they'll be copied to `dist/`)
- Verify asset paths use relative paths (not absolute)
- Check browser console for 404 errors

## Quick Reference

**For Netlify Dashboard:**
```
Build command: npm ci && npm run build
Publish directory: dist
Node version: 18
```

**For netlify.toml (already configured):**
```toml
[build]
  command = "npm ci && npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"
```

---

**Remember**: If `netlify.toml` is present, Netlify will use those settings automatically. You only need to manually enter the build command if auto-detection fails.

