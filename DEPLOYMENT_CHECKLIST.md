# Backend Deployment Checklist - Render

## Step 1: Deploy to Render

1. Visit https://render.com and sign up/login
2. Click **"New +" → "Web Service"**
3. Connect your GitHub repository: `elegant-gadget-emporium`
4. Configure:
   - **Name**: `khamobile-backend`
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

## Step 2: Add Environment Variables

In Render's Environment Variables section, add:

```
NODE_ENV=production
DATABASE_URL=postgresql://postgres.tixfrpfwaregytbbzgwz:Mhmd1020300456@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres
JWT_SECRET=cba48b55c44131debed11103ce013e2e889f4aa152e4a2d5f68f55eb772b192700b1759382fdd732b0bcdeb50650e0fbfe23592cf62a7af4c9959687b85d5bc6
FRONTEND_ORIGIN=https://khamobile.store
SITE_URL=https://khamobile.store
RESEND_API_KEY=re_YV74Axrz_5i1CLdxUkh42otduFySZ5yia
ADMIN_EMAIL=kamelhassanamer@gmail.com
```

## Step 3: Deploy and Get URL

- Click "Create Web Service"
- Wait 2-5 minutes for deployment
- Copy your backend URL (e.g., `https://khamobile-backend.onrender.com`)

## Step 4: Update Frontend .env

Replace in `.env`:
```
VITE_API_URL=https://your-backend-url.onrender.com
```

## Step 5: Rebuild and Redeploy Frontend

```bash
npm run build
# Then upload the dist/ folder to your hosting (Netlify/Vercel/etc)
```

## Step 6: Test

Visit `https://khamobile.store/admin/login` and try logging in with:
- Email: `admin@khamobile.local`
- Password: `kamel102030`

---

## Troubleshooting

**If backend shows as "Deploy failed":**
- Check Render logs for errors
- Verify all environment variables are correct

**If frontend can't connect:**
- Verify VITE_API_URL in .env matches your Render URL
- Rebuild frontend after changing .env
- Check CORS: FRONTEND_ORIGIN in Render must include https://khamobile.store

**Free tier limitations:**
- Backend may sleep after 15 min of inactivity
- First request after sleep takes ~30 seconds to wake up
- Consider paid tier ($7/month) for production if this is an issue
