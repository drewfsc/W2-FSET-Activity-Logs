# FSET Activity Logs

Track and manage FSET program activities, education and training progress, and client development.

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: TailwindCSS + DaisyUI
- **Database**: MongoDB with Mongoose ODM
- **Port**: 3002

## Getting Started

### Prerequisites

- Node.js 18+ installed
- MongoDB running locally or connection string ready

### Installation

1. Copy the environment variables:
```bash
cp .env.example .env
```

2. Update `.env` with your MongoDB connection string:
```
MONGODB_URI=mongodb://localhost:27017/fset-activity-logs
```

3. Install dependencies (already completed):
```bash
npm install
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3002](http://localhost:3002) with your browser.

## Project Structure

```
FSET-Activity-Logs/
├── app/
│   ├── api/                 # API routes
│   │   ├── activities/      # Activity endpoints
│   │   └── users/           # User endpoints
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Home page
├── lib/
│   └── mongodb.ts           # MongoDB connection utility
├── models/
│   ├── Activity.ts          # Activity schema
│   └── User.ts              # User schema
├── components/              # React components (to be added)
├── .env.example             # Environment variables template
├── next.config.mjs          # Next.js configuration
├── tailwind.config.ts       # Tailwind configuration
└── package.json             # Dependencies
```

## API Endpoints

### Activities

- `GET /api/activities` - Get all activities (filter by userId, status)
- `POST /api/activities` - Create new activity
- `GET /api/activities/[id]` - Get single activity
- `PUT /api/activities/[id]` - Update activity
- `DELETE /api/activities/[id]` - Delete activity

### Users

- `GET /api/users` - Get all users (filter by role)
- `POST /api/users` - Create new user

## Activity Types

- Education
- Training
- Job Search
- Job Application
- Interview
- Workshop
- Counseling
- Other

## Next Steps

1. Migrate FSET specific components from the original application
2. Implement authentication
3. Add client and coach dashboards
4. Add education/training tracking features
5. Add reporting features
