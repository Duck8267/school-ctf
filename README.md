# School CTF Platform

A web-based Capture The Flag platform designed for school-age students (15+) to learn cybersecurity through hands-on challenges.

## Features

- Team registration with team name and a 4-digit PIN (so teams can log back in if they lose their session)
- **Log in to existing team** — teams that signed out or lost connection can re-enter their team name and PIN to resume
- Password-protected events containing multiple challenge categories
- Timer tracking for each CTF attempt
- Real-time leaderboard with countdown timer
- Points system with hint purchasing
- Youth-friendly, colorful UI
- Superuser admin controls (remove teams, manage timer)

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
npm install
```

### Environment Variables

This repo works **out of the box** without any env vars. For better security in real deployments, you can override the built-in default secret:

| Variable | Required | Description |
|----------|----------|-------------|
| `AUTH_SECRET` | No (recommended in production) | Random hex string used to sign session cookies. Generate with `openssl rand -hex 32`. If unset, a default insecure secret baked into the repo is used so clones run with zero config. |
| `NODE_ENV` | No | Set to `production` for secure cookies and optimized builds. |

### Running

```bash
npm run dev        # Development server
npm run build      # Production build
npm start          # Production server
npm test           # Run tests
npm run lint       # Run ESLint
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
/challenges/
  /[challenge-name]/
    config.json                # Challenge config (name, description, password)
    /ctfs/
      /[ctf-name]/
        config.json            # CTF config (title, points, flag, hints, links)

/app/
  /api/                        # API routes
  /dashboard/                  # Team dashboard with leaderboard
  /event/                      # Event password entry
  /join/                       # Team registration (name + PIN) and login to existing team
  /challenge/[id]/             # Challenge category page
  /challenge/[id]/ctf/[ctfId]/ # Individual CTF page

/lib/
  auth.ts                      # HMAC-signed cookies, path sanitization, auth helpers
  db.ts                        # JSON file-based data store
  challenges.ts                # Challenge/CTF config loader
  events.ts                    # Event config loader
  ctfEmojis.ts                 # Emoji mapping for leaderboard
```

## Adding Challenges

1. Create a folder in `/challenges/` with a `config.json`:

```json
{
  "id": "my-challenge",
  "name": "My Challenge Name",
  "description": "Description of the challenge",
  "password": "your_password_here"
}
```

2. Add CTFs inside a `/ctfs/` subfolder, each with its own `config.json`:

```json
{
  "id": "my-ctf",
  "title": "My CTF Title",
  "description": "Detailed description",
  "points": 100,
  "photo": "photo.jpg",
  "links": ["https://example.com"],
  "hints": ["Hint 1", "Hint 2"],
  "flag": "FLAG{your_flag_here}"
}
```

## Security

### Vulnerabilities Found & Fixed

| Vulnerability | Severity | Description | Fix |
|---------------|----------|-------------|-----|
| **Cookie spoofing** | Critical | `team_id` cookie was a plain integer — anyone could set it to impersonate any team | Cookies are now HMAC-signed with `AUTH_SECRET`; tampered values are rejected |
| **Path traversal** | High | `challengeId` and `ctfId` URL params were passed directly to `path.join()` (e.g. `../../etc/passwd`) | All path segments are validated with `safePath()` — rejects slashes, `..`, null bytes |
| **Superuser privilege escalation** | High | Admin features gated only by team name — register as "superuser" to get full admin | Auth centralised via `requireSuperuser()` using signed cookies; name-based check still present but cookies can no longer be forged |
| **Error information leakage** | Medium | Raw `error.message` was returned in all API responses | Catch blocks now return generic error messages; no internal details exposed |
| **Missing input validation** | Medium | No length limits on team names, no type checks on request bodies | Team names capped at 50 chars; all inputs validated for type and bounds |
| **No timing-safe comparison** | Low | Cookie verification used string comparison (theoretical timing attack) | HMAC verification uses `crypto.timingSafeEqual` |

### Remaining Considerations

- **Secrets in repo**: Event passwords and CTF flags are in committed JSON files. For higher security, move these to environment variables or a separate config not in source control.
- **No rate limiting**: Flag submissions and login attempts have no throttling. Add middleware-level rate limiting for production.
- **npm audit**: Next.js 14.x has known advisories (DoS in Image Optimizer, RSC deserialization). These require upgrading to Next.js 15+ which is a breaking change.

## Deployment

### Required for all platforms

Set the `AUTH_SECRET` environment variable:

```bash
openssl rand -hex 32
# Use the output as your AUTH_SECRET value
```

### Render

A `render.yaml` is included. Connect your GitHub repo and Render auto-detects the config. `AUTH_SECRET` is auto-generated.

### Fly.io

```bash
fly launch
fly secrets set AUTH_SECRET=$(openssl rand -hex 32)
fly deploy
```

### Railway

1. **Create a new project**
   - Go to `https://railway.app`
   - Sign in with GitHub
   - Click **New Project** → **Deploy from GitHub repo**
   - Select your `school-ctf` repository

2. **Configure service**
   - Railway will detect Next.js automatically
   - If you need to set commands manually:
     - **Build command**: `npm install && npm run build`
     - **Start command**: `npm start`
   - Ensure **Node version** is 18+ in the service settings (Environment → Node)

3. **Environment variables**
   - In your Railway service, open the **Variables** tab
   - Add:
     - `AUTH_SECRET` → use `openssl rand -hex 32` locally and paste the value
     - `NODE_ENV` → `production`

4. **Filesystem / data**
   - The app writes JSON data to a `/data` directory (already git-ignored)
   - On Railway, this data lives on the service disk and will persist across restarts for the same deployment, but can be lost if the service is rebuilt from scratch
   - For long-lived competitions, consider exporting leaderboard data manually

5. **Deploy**
   - After saving variables, Railway will build and deploy automatically
   - Your app will be available at the Railway-generated URL (you can add a custom domain)

## Data Storage

The platform uses JSON files in a `/data` directory (auto-created, git-ignored). Data persists between deployments on platforms with persistent filesystems.

## Notes

- Teams are identified by HMAC-signed cookies. On first join, teams set a 4-digit PIN; they can log back in later with team name + PIN.
- **Existing teams (created before PIN was added)** have no stored PIN and cannot use “Log in to existing team”; only newly registered teams can.
- Timer starts automatically when a team views a CTF
- Points are awarded only on first correct submission
- Hints cost points (10 per hint number: hint 1 = 10pts, hint 2 = 20pts)
- Superuser team is hidden from the leaderboard
