<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:author -->
# Author Configuration

Use these values for all git commits:
- **Name:** apoorva-01
- **Email:** apoorva-01
- **GitHub:** apoorva-01

Example `.gitconfig` for this project:
```bash
git config user.name "apoorva-01"
git config user.email "apoorva-01"
```
<!-- END:author -->

<!-- BEGIN:vercel-deploy -->
# Vercel Deployment

## Environment Variables (set in Vercel dashboard)

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Your Vercel deployment URL (e.g., `https://gitfolio.vercel.app`) |
| `ANTHROPIC_API_KEY` | Anthropic Claude API key |
| `GITHUB_CLIENT_ID` | From GitHub OAuth App settings |
| `GITHUB_CLIENT_SECRET` | From GitHub OAuth App settings |
| `ENCRYPTION_KEY` | `openssl rand -hex 32` |

## GitHub OAuth Callback URL

Update your GitHub OAuth App callback to:
```
https://your-vercel-domain.vercel.app/api/auth/callback/github
```

## Deploy Steps

1. Push to GitHub
2. Import project in Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

## Note

For production, `NEXTAUTH_URL` should match your deployment domain exactly.
<!-- END:vercel-deploy -->