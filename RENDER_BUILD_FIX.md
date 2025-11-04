# Render Build Fix - "vite: not found" Error

## Problem

The build fails with:
```
sh: 1: vite: not found
==> Build failed 😞
```

## Root Cause

`vite` is in `devDependencies`, but Render may set `NODE_ENV=production` which causes npm to skip devDependencies during installation.

## Solution

Update your Render build command to one of these options:

### Option 1: Set NODE_ENV before install (Recommended)

**Build Command:**
```bash
NODE_ENV=development npm install && npm run build
```

This ensures devDependencies are installed before building.

### Option 2: Use npm ci with explicit dev flag

**Build Command:**
```bash
npm ci --include=dev && npm run build
```

**Note:** This requires npm 7+ (Render uses npm 9+ by default, so this should work).

### Option 3: Use npm install (simplest)

**Build Command:**
```bash
npm install && npm run build
```

**Important:** Make sure `NODE_ENV` is NOT set to `production` in your environment variables before the build step. You can set it to `production` AFTER installation, or just don't set it during build.

### Option 4: Install dependencies separately

**Build Command:**
```bash
npm install --production=false && npm run build
```

## Steps to Fix in Render Dashboard

1. Go to your Static Site in Render dashboard
2. Navigate to "Settings" tab
3. Scroll to "Build & Deploy" section
4. Update the **Build Command** to one of the options above
5. Save changes (this will trigger a new deployment)

## Recommended Configuration

For Static Site deployment:
- **Root Directory:** `sco-admin-dashboard`
- **Build Command:** `NODE_ENV=development npm install && npm run build`
- **Publish Directory:** `dist`
- **Environment Variables:**
  - `VITE_API_URL=https://your-backend-url.onrender.com`
  - `NODE_ENV=production` (can be set after build, or don't set it at all)

## Why This Happens

1. Render may set `NODE_ENV=production` by default
2. When `NODE_ENV=production`, npm skips `devDependencies`
3. `vite` is in `devDependencies` (which is correct for a build tool)
4. Without `vite`, the build script fails

## Verification

After updating the build command, check the build logs. You should see:
- ✅ All dependencies installed (including devDependencies)
- ✅ `vite` command found
- ✅ Build completes successfully
- ✅ `dist` folder created with built files

## Alternative: Move vite to dependencies

If you continue having issues, you can temporarily move `vite` from `devDependencies` to `dependencies` in `package.json`, but this is not recommended as it increases production bundle size unnecessarily.

