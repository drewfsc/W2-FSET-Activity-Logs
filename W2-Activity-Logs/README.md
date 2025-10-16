# W-2 Activity Logs

Track and manage W-2 program activities, client progress, and employment outcomes.

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: TailwindCSS + DaisyUI
- **Database**: MongoDB with Mongoose ODM
- **Port**: 3001

## Getting Started

### Prerequisites

- Node.js 18+ installed
- MongoDB running locally or connection string ready

### Installation

1. Environment variables are already configured in `.env`:
```
MONGODB_URI=mongodb://VercelMDB:q%26C21frX%25od2yhJN@162.218.1.22:27017/?authMechanism=DEFAULT
MONGODB_DB=W2_FSET_Activity_Log
```

2. Install dependencies (if not already done):
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3001](http://localhost:3001) with your browser.

### First Time Use

1. Navigate to the login page at [http://localhost:3001/login](http://localhost:3001/login)
2. Select your role (Client or Coach) and enter your email
3. You'll be redirected to the dashboard where you can start using the application

## Project Structure

```
W2-Activity-Logs/
├── app/
│   ├── api/                 # API routes
│   │   ├── activities/      # Activity endpoints
│   │   │   ├── route.ts     # GET all, POST new
│   │   │   └── [id]/        # GET, PUT, DELETE by ID
│   │   └── users/           # User endpoints
│   ├── activities/          # Activities list page
│   │   └── page.tsx
│   ├── dashboard/           # Dashboard page
│   │   └── page.tsx
│   ├── login/               # Login page
│   │   └── page.tsx
│   ├── reports/             # Reports & analytics page
│   │   └── page.tsx
│   ├── schedule/            # Calendar view page
│   │   └── page.tsx
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout with TranslationProvider
│   └── page.tsx             # Landing page (redirects to login)
├── components/
│   └── ActivityModal.tsx    # Modal for logging new activities
├── contexts/
│   └── TranslationContext.tsx  # Multi-language support (EN, ES, Hmong)
├── lib/
│   └── mongodb.ts           # MongoDB connection utility
├── models/
│   ├── Activity.ts          # Activity schema
│   └── User.ts              # User schema
├── .env                     # Environment variables (configured)
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

- Job Search
- Job Application
- Interview
- Job Training
- Work Hours
- Meeting
- Other

## Features

### Completed
- ✅ User login with role selection (Client/Coach)
- ✅ Dashboard with real-time statistics
- ✅ Activity logging with modal form
- ✅ Activities list page with filtering and search
- ✅ Calendar/schedule view
- ✅ Reports and analytics page with charts
- ✅ Multi-language support (English, Spanish, Hmong)
- ✅ MongoDB integration with .env configuration

### Quick Actions (Dashboard)

All three quick action buttons are now fully functional:

1. **Log New Activity** - Opens a modal to create new activities with:
   - Activity type selection (Job Search, Job Application, Interview, etc.)
   - Description and date
   - Duration tracking
   - Status (Pending, Completed, Cancelled)
   - Optional notes

2. **View Schedule** - Calendar view showing:
   - Monthly calendar grid
   - Activities displayed on their dates
   - Color-coded by status
   - Selected date details panel
   - Month navigation

3. **View Reports** - Analytics dashboard with:
   - Key metrics (total activities, hours, completion rate)
   - Time range filtering (week, month, year, all time)
   - Activities by type breakdown
   - Monthly trend chart
   - Status breakdown

## Navigation

- `/login` - Login page
- `/dashboard` - Main dashboard with quick actions
- `/activities` - All activities with filtering
- `/schedule` - Calendar view
- `/reports` - Reports and analytics

## Next Steps

1. Implement proper JWT authentication
2. Add edit/delete functionality for activities
3. Migrate job search integration from original app
4. Add coach-specific views for managing clients
5. Implement file attachments for activities
6. Add email notifications
