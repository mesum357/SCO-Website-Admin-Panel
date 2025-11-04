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

### Option 1: Use npx to find vite (Recommended)

**Build Command:**
```bash
npm install && npx vite build
```

This uses `npx` to find vite in `node_modules/.bin`, which works regardless of how dependencies were installed.

### Option 2: Use Bun consistently

If Render is using Bun, use Bun consistently:

**Build Command:**
```bash
bun install && bun run build
```

### Option 3: Set NODE_ENV before install

**Build Command:**
```bash
NODE_ENV=development npm install && npx vite build
```

This ensures devDependencies are installed before building.

### Option 4: Disable automatic Bun install

If Bun is interfering, ensure `package-lock.json` exists and is committed to force npm usage:

**Build Command:**
```bash
npm ci && npx vite build
```

## Steps to Fix in Render Dashboard

1. Go to your Static Site in Render dashboard
2. Navigate to "Settings" tab
3. Scroll to "Build & Deploy" section
4. Update the **Build Command** to one of the options above
5. **IMPORTANT:** Make sure the entire command is entered correctly:
   - Full command: `npm install && npx vite build`
   - Make sure it's `vite build` not `vi build` or `vi`
   - Copy and paste the entire command to avoid typos
6. Save changes (this will trigger a new deployment)

## Recommended Configuration

For Static Site deployment:
- **Root Directory:** `sco-admin-dashboard`
- **Build Command:** `npm install && npx vite build`
- **Publish Directory:** `dist`
- **Environment Variables:**
  - `VITE_API_URL=https://your-backend-url.onrender.com`
  - `NODE_ENV=production` (optional, doesn't affect build if using npx)

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

