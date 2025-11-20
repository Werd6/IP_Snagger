# IP Capture Page

A simple HTML page that captures visitor IP addresses, designed for deployment on Vercel.

## Local Development

1. Install Vercel CLI (if not already installed):
```bash
npm i -g vercel
```

2. Run locally:
```bash
vercel dev
```

3. Open your browser and visit:
```
http://localhost:3000
```

## Deploying to Vercel

1. Push your code to GitHub

2. Import your repository in Vercel:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will automatically detect the configuration

3. Your site will be live at: `https://your-project.vercel.app`

## Accessing Captured IPs

After deployment, you can view all captured IP addresses via the API endpoint:

```
https://your-project.vercel.app/api/view-ips
```

**Note**: IPs are stored in `/tmp` which is ephemeral. They will reset on each deployment. For persistent storage, consider:
- Using Vercel KV (key-value store)
- Using a database (MongoDB, PostgreSQL, etc.)
- Using an external service like JSONBin.io

## File Structure

- `index.html` - The "Gotcha" page
- `api/capture-ip.js` - Serverless function that captures IPs
- `api/view-ips.js` - Serverless function to view captured IPs
- `vercel.json` - Vercel configuration
- `package.json` - Project configuration

## Notes

- IPs are stored with timestamps and user agent information
- The functions handle Vercel proxy headers to get real IP addresses
- Files in `/tmp` are ephemeral and reset on each deployment

