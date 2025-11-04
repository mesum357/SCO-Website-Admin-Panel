# Render Admin Panel Deployment Guide

This guide will help you deploy the SCO Admin Dashboard to Render.

## Prerequisites

1. A Render account (sign up at [render.com](https://render.com))
2. Your backend API deployed and accessible
3. Git repository with your admin panel code

## Deployment Steps

### Option 1: Static Site Deployment (Recommended)

1. **Create a new Static Site in Render:**
   - Go to your Render dashboard
   - Click "New +" → "Static Site"
   - Connect your GitHub/GitLab/Bitbucket repository
   - Select the `sco-admin-dashboard` directory as the root directory

2. **Configure Build Settings:**
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`
   - **Node Version:** 18 or higher (Render default should work)
   - **Note:** If build fails with "vite: not found", use: `NODE_ENV=development npm install && npm run build`

3. **Environment Variables:**
   Add the following environment variables in Render dashboard:
   ```
   VITE_API_URL=https://your-backend-url.onrender.com
   NODE_ENV=production
   ```
   **Important:** Replace `https://your-backend-url.onrender.com` with your actual backend URL.

4. **Custom Domain (Optional):**
   - Add your custom domain in the Settings tab
   - Configure DNS records as instructed by Render

### Option 2: Web Service Deployment

If you prefer to deploy as a Web Service instead:

1. **Create a new Web Service:**
   - Go to your Render dashboard
   - Click "New +" → "Web Service"
   - Connect your GitHub/GitLab/Bitbucket repository

2. **Configure Build Settings:**
   - **Root Directory:** `sco-admin-dashboard`
   - **Environment:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm run preview` (requires a preview script) or use a static server
   - **Note:** If build fails with "vite: not found", use: `NODE_ENV=development npm install && npm run build`

3. **Environment Variables:**
   Same as Option 1 above.

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `https://your-backend.onrender.com` |
| `NODE_ENV` | Environment mode | `production` |

### Setting Environment Variables

1. Go to your service in Render dashboard
2. Navigate to "Environment" tab
3. Click "Add Environment Variable"
4. Add each variable with its value
5. Save changes (this will trigger a new deployment)

## Backend CORS Configuration

After deploying the admin panel, you need to update your backend's CORS configuration to allow requests from your admin panel URL.

### Update Backend Environment Variables

In your backend service on Render, add or update the `ALLOWED_ORIGINS` environment variable:

```
ALLOWED_ORIGINS=https://your-backend.onrender.com,https://your-admin-panel.onrender.com,https://your-main-frontend.onrender.com
```

**Important:** Include all your frontend URLs (main app, admin panel) separated by commas.

### Example

If your services are:
- Backend: `https://earn-era-backend.onrender.com`
- Main Frontend: `https://earn-era-frontend.onrender.com`
- Admin Panel: `https://earn-era-admin.onrender.com`

Then set:
```
ALLOWED_ORIGINS=https://earn-era-backend.onrender.com,https://earn-era-frontend.onrender.com,https://earn-era-admin.onrender.com
```

## Post-Deployment Checklist

- [ ] Admin panel is accessible at the Render URL
- [ ] Environment variables are set correctly
- [ ] Backend CORS is updated with admin panel URL
- [ ] Can login to admin panel
- [ ] API calls are working (check browser console)
- [ ] Custom domain is configured (if applicable)

## Troubleshooting

### CORS Errors

If you see CORS errors in the browser console:
1. Verify the admin panel URL is in `ALLOWED_ORIGINS` on the backend
2. Check that `VITE_API_URL` is set correctly
3. Ensure backend is using `credentials: true` in CORS config

### Build Errors

If the build fails:
1. **"vite: not found" error:** This means devDependencies weren't installed. Use this build command:
   ```
   NODE_ENV=development npm install && npm run build
   ```
   Or set `NODE_ENV=development` in environment variables before the build step
2. Check that all dependencies are in `package.json`
3. Verify Node.js version (Render uses Node 18+ by default)
4. Check build logs in Render dashboard for specific errors
5. Try clearing build cache in Render dashboard and redeploy

### API Connection Issues

If the admin panel can't connect to the backend:
1. Verify `VITE_API_URL` environment variable is correct
2. Check backend is running and accessible
3. Test backend health endpoint: `https://your-backend.onrender.com/api/health`
4. Check browser console for network errors

### Session/Cookie Issues

If login doesn't persist:
1. Ensure backend CORS has `credentials: true`
2. Verify cookies are being set (check browser DevTools → Application → Cookies)
3. Check that backend session configuration is correct
4. Verify `sameSite: 'none'` and `secure: true` for production cookies

## Security Notes

1. **Never commit `.env` files** - Use Render environment variables instead
2. **Use HTTPS** - Render provides SSL certificates automatically
3. **Keep secrets secure** - Store sensitive values only in Render environment variables
4. **Regular updates** - Keep dependencies updated for security patches

## Support

For Render-specific issues, check:
- [Render Documentation](https://render.com/docs)
- [Render Community](https://community.render.com)

For application-specific issues, check the main project README or contact the development team.

