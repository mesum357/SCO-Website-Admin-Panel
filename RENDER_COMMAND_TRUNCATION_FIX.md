# Render Build Command Truncation Fix

## Problem

Build command is getting truncated in Render, showing:
```
==> Running build command '   npm install && npx vi'...
npm error could not determine executable to run
```

The command is cut off at `npx vi` instead of `npx vite build`.

## Root Cause

Render may have character limits or the command was entered incorrectly. The command should be:
```
npm install && npx vite build
```

Not:
```
npm install && npx vi
```

## Solution

### Option 1: Use Full Command (Recommended)

**Build Command:**
```
npm install && npx vite build
```

**Important:** 
- Copy the entire command exactly as shown
- Make sure it's `vite build` (not `vi` or `vi build`)
- Don't add any extra spaces or characters

### Option 2: Use Bun (Simpler)

Since Render is already using Bun, use Bun consistently:

**Build Command:**
```
bun install && bun run build
```

This is simpler and avoids the npm/npx issue entirely.

### Option 3: Use npm run build with explicit path

If npx still doesn't work, try:

**Build Command:**
```
npm install && ./node_modules/.bin/vite build
```

## Steps to Fix

1. Go to your Render Static Site dashboard
2. Navigate to **Settings** tab
3. Scroll to **Build & Deploy** section
4. Find the **Build Command** field
5. **Clear the entire field** and enter one of these:

   **Option A (npm):**
   ```
   npm install && npx vite build
   ```

   **Option B (Bun - Recommended):**
   ```
   bun install && bun run build
   ```

6. **Double-check** the command before saving:
   - Should be complete: `npm install && npx vite build`
   - Not truncated: `npm install && npx vi`
   - No extra spaces at the beginning or end
7. Click **Save Changes**
8. Wait for deployment to complete

## Verification

After updating, check the build logs. You should see:
```
==> Running build command 'npm install && npx vite build'...
```

Or if using Bun:
```
==> Running build command 'bun install && bun run build'...
```

## Why Bun is Recommended

Since Render automatically detects and uses Bun (because of `bun.lockb`), using Bun consistently avoids:
- Package manager conflicts
- Path resolution issues
- Command truncation issues

Bun is faster and simpler for this use case.

## Alternative: Force npm Usage

If you prefer npm over Bun:

1. Delete or ignore `bun.lockb`:
   - Add to `.gitignore`: `bun.lockb`
   - Remove from repository if already committed
2. Ensure `package-lock.json` exists and is committed
3. Use build command: `npm ci && npm run build`

But using Bun is simpler since Render already prefers it.


