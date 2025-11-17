# School CTF Platform

A friendly, web-based Capture The Flag platform designed for school-age students (15+ years old) to learn cybersecurity through hands-on challenges.

## Features

- 🎯 Event-based system with password protection
- 👥 Team registration with simple team name entry
- 🔒 Password-protected events containing multiple challenges
- ⏱️ Timer tracking for each CTF attempt
- 🏆 Real-time leaderboard showing all teams (sorted by points, then time)
- 💰 Points system for completed CTFs (teams start with 60 points)
- 💡 Hint system with point costs (Hint 1: 10pts, Hint 2: 20pts, etc.)
- 🎨 Youth-friendly, colorful UI

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
/events.json              # Event configurations (name, password, date, location)
/challenges/
  /[challenge-name]/
    config.json          # Challenge configuration (name, description)
    /ctfs/
      /[ctf-name]/
        config.json      # CTF configuration (title, description, points, flag, hints, links)
        photo.jpg        # Optional photo for the CTF

/app/
  /api/                  # API routes
  /event/                # Event password entry
  /dashboard/            # Team dashboard
  /join/                 # Team registration
  /challenge/[id]/       # Challenge CTF listing
  /challenge/[id]/ctf/[ctfId]/  # Individual CTF page
```

## Adding Events

Edit `events.json`:
```json
{
  "id": "event-id",
  "name": "Event Name",
  "date": "Date",
  "location": "Location",
  "password": "event_password",
  "description": "Description"
}
```

## Adding Challenges

1. Create a new folder in `/challenges/` with your challenge name
2. Create `config.json` in that folder:
```json
{
  "id": "my-challenge",
  "name": "My Challenge Name",
  "description": "Description of the challenge"
}
```

3. Create a `/ctfs/` folder inside your challenge folder
4. For each CTF, create a subfolder with `config.json`:
```json
{
  "id": "my-ctf",
  "title": "My CTF Title",
  "description": "Detailed description of the CTF challenge",
  "points": 100,
  "photo": "photo.jpg",
  "links": ["https://example.com"],
  "hints": ["Hint 1", "Hint 2"],
  "flag": "FLAG{your_flag_here}"
}
```

## Example Challenge

The platform includes an example "Cryptography Challenge" with a Caesar cipher CTF:
- CTF flag: `FLAG{THE STUDENT WHO CAN SOLVE THIS}`

## Database

The platform uses JSON file-based storage for development. **For production deployment (especially on Netlify), you'll need to migrate to a database.** See `DEPLOYMENT.md` for details.

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Deployment

See `DEPLOYMENT.md` for Netlify deployment instructions.

## Notes

- Teams are identified by cookies (team_id and event_id)
- Event passwords are stored in events.json
- CTF flags are case-sensitive
- Timer starts automatically when a team views a CTF
- Points are awarded only on first correct submission
- Teams start with 60 points
- Hints cost: Hint 1 = 10pts, Hint 2 = 20pts, Hint 3 = 30pts, etc.
- Leaderboard ranks by points, then by total time (lower time wins ties)
# school-ctf
