# ZipRoom Deployment Guide

## GitHub Pages Setup

### 1. Push to GitHub
```bash
git add .
git commit -m "Initial ZipRoom deployment"
git push origin main
```

### 2. Configure GitHub Repository
1. Go to your GitHub repository
2. Click **Settings** tab
3. Scroll to **Pages** section
4. Under **Source**, select **GitHub Actions**

### 3. Add Environment Variables
1. In your GitHub repo, go to **Settings** → **Secrets and variables** → **Actions**
2. Add these repository secrets:
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key

### 4. Configure Custom Domain (ziproom.io)

#### In GitHub:
1. Go to **Settings** → **Pages**
2. Under **Custom domain**, enter: `ziproom.io`
3. Check **Enforce HTTPS**

#### In Squarespace:
1. Go to your Squarespace domain settings
2. Find **DNS Settings** or **Advanced DNS**
3. Add these DNS records:

**For root domain (ziproom.io):**
```
Type: A
Host: @
Value: 185.199.108.153

Type: A  
Host: @
Value: 185.199.109.153

Type: A
Host: @
Value: 185.199.110.153

Type: A
Host: @
Value: 185.199.111.153
```

**For www subdomain:**
```
Type: CNAME
Host: www
Value: yourusername.github.io
```

### 5. Verify CNAME File
GitHub will automatically create a CNAME file, but you can also create one manually:

Create `public/CNAME` with content:
```
ziproom.io
```

## Deployment Process

1. **Automatic**: Every push to `main` branch triggers deployment
2. **Manual**: Go to **Actions** tab and run the workflow manually
3. **Status**: Check the **Actions** tab for deployment status

## Environment Variables Needed

Make sure these are set in GitHub Secrets:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Troubleshooting

### Common Issues:
1. **404 on refresh**: GitHub Pages serves SPAs correctly with the workflow above
2. **Environment variables**: Make sure they're set in GitHub Secrets
3. **DNS propagation**: Can take up to 24 hours for domain changes
4. **HTTPS**: GitHub Pages automatically provides SSL for custom domains

### Checking Deployment:
1. Go to **Actions** tab in your GitHub repo
2. Click on the latest workflow run
3. Check for any errors in the build/deploy steps

## Alternative: Using GitHub Pages with Subdirectory

If you want to use a subdirectory (like ziproom.io/app), update `vite.config.ts`:

```typescript
export default defineConfig({
  base: '/your-repo-name/', // Replace with your actual repo name
  // ... rest of config
});
```

## Post-Deployment Checklist

- [ ] Site loads at ziproom.io
- [ ] All routes work (/, /create, /join/ROOMID, /room/ROOMID)
- [ ] Supabase connection works
- [ ] Authentication works
- [ ] Room creation/joining works
- [ ] Real-time chat works
- [ ] HTTPS is enabled
- [ ] www.ziproom.io redirects to ziproom.io