# Render Axios Dependency Fix

## Problem

Build fails with:
```
[vite]: Rollup failed to resolve import "axios" from "/opt/render/project/src/src/lib/api.ts".
```

Even though `axios` is in `package.json`, Bun's lockfile (`bun.lockb`) might be out of sync, causing axios not to be installed.

## Root Cause

When you add a new dependency to `package.json`, Bun's lockfile (`bun.lockb`) needs to be updated. If the lockfile is out of sync, Bun will skip installing the new dependency.

## Solution

### Option 1: Force Fresh Install (Recommended)

Update your Render build command to force a fresh install:

**Build Command:**
```bash
rm -rf node_modules bun.lockb && bun install && bun run build
```

This will:
1. Delete `node_modules` and `bun.lockb`
2. Run a fresh `bun install` (which will regenerate the lockfile)
3. Build the project

### Option 2: Update Lockfile Locally

1. Run locally:
   ```bash
   cd sco-admin-dashboard
   bun install
   ```
2. Commit the updated `bun.lockb`:
   ```bash
   git add bun.lockb
   git commit -m "Update bun.lockb with axios dependency"
   git push
   ```
3. Use regular build command:
   ```bash
   bun install && bun run build
   ```

### Option 3: Use npm Instead

If you want to avoid Bun lockfile issues:

1. Delete or ignore `bun.lockb`:
   ```bash
   # Add to .gitignore
   echo "bun.lockb" >> sco-admin-dashboard/.gitignore
   ```
2. Ensure `package-lock.json` exists (run `npm install` locally)
3. Use npm build command:
   ```bash
   rm -rf node_modules && npm ci && npm run build
   ```

## Steps to Fix in Render

1. Go to your Static Site in Render dashboard
2. Navigate to **Settings** tab
3. Scroll to **Build & Deploy** section
4. Update **Build Command** to:
   ```
   rm -rf node_modules bun.lockb && bun install && bun run build
   ```
5. Save changes (this will trigger a new deployment)

## Why This Works

- `rm -rf node_modules bun.lockb` - Clears old installs and lockfile
- `bun install` - Fresh install that reads `package.json` and creates new lockfile
- `bun run build` - Builds with all dependencies properly installed

## Verification

After updating, check build logs. You should see:
- ✅ `axios` being installed
- ✅ Build completing successfully
- ✅ No "failed to resolve import" errors

## Long-term Solution

For production, it's better to:
1. Keep `bun.lockb` committed to git
2. Update it locally whenever you add dependencies
3. Use regular `bun install && bun run build` command

But for immediate fix, the `rm -rf` approach works perfectly.

