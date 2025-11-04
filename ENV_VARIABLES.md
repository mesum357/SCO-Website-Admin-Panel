# Admin Panel Environment Variables

This document lists all environment variables required for the admin panel.

## Required Environment Variables

### `VITE_API_URL`
- **Description:** The base URL of your backend API
- **Type:** String (URL)
- **Required:** Yes
- **Example (Development):** `http://localhost:5000`
- **Example (Production):** `https://your-backend.onrender.com`
- **Note:** Must include protocol (http:// or https://) and no trailing slash

### `NODE_ENV`
- **Description:** Environment mode (development or production)
- **Type:** String
- **Required:** Yes (for production builds)
- **Default:** `development`
- **Production Value:** `production`

## Setting Environment Variables

### Local Development

1. Create a `.env` file in the `sco-admin-dashboard` directory:
   ```bash
   cd sco-admin-dashboard
   touch .env
   ```

2. Add the variables:
   ```env
   VITE_API_URL=http://localhost:5000
   NODE_ENV=development
   ```

3. Restart your development server

### Render Deployment

1. Go to your Render service dashboard
2. Navigate to the "Environment" tab
3. Click "Add Environment Variable"
4. Add each variable:
   - Key: `VITE_API_URL`
   - Value: `https://your-backend-url.onrender.com`
   - Key: `NODE_ENV`
   - Value: `production`

5. Save changes (this will trigger a new deployment)

## Important Notes

- **Vite Environment Variables:** Variables must be prefixed with `VITE_` to be accessible in the frontend code
- **Build Time:** Vite environment variables are embedded at build time, not runtime
- **No Secrets:** Never put sensitive secrets in frontend environment variables (they're exposed to the browser)
- **Backend URL:** Ensure your backend URL is correct and accessible from the internet

## Backend CORS Configuration

After deploying, update your backend's `ALLOWED_ORIGINS` environment variable to include your admin panel URL:

```
ALLOWED_ORIGINS=https://your-backend.onrender.com,https://your-admin-panel.onrender.com
```

## Verification

After setting environment variables:

1. **Development:** Check that API calls work in browser console
2. **Production:** Build locally and verify `dist` folder contains correct API URL:
   ```bash
   npm run build
   grep -r "your-backend-url" dist/
   ```

## Troubleshooting

### API Calls Failing

- Check `VITE_API_URL` is set correctly
- Verify backend is accessible at that URL
- Check browser console for CORS errors
- Ensure backend CORS includes admin panel URL

### Build Errors

- Ensure all required variables are set
- Check for typos in variable names
- Verify values don't have trailing slashes or extra spaces

