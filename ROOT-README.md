# Activity Logs Portal

This repository contains two separate applications for tracking program activities:

1. **W-2 Activity Logs** - Employment-focused tracking for W-2 program participants
2. **FSET Activity Logs** - Education and training tracking for FSET program participants

## Architecture

The project has been decoupled into two independent Next.js applications:

```
W2-FSET-Activity-Logs/
├── landing.html              # Root landing page with links to both apps
├── W2-Activity-Logs/         # W-2 Program Application (Port 3001)
├── FSET-Activity-Logs/       # FSET Program Application (Port 3002)
└── src/                      # Original monolithic app (to be deprecated)
```

## Getting Started

### 1. View Landing Page

Open `landing.html` in your browser to access the portal landing page with links to both applications.

### 2. Set Up MongoDB

Both applications require MongoDB. Install and start MongoDB:

```bash
# Using MongoDB Community Edition
mongod --dbpath /path/to/data
```

Or use MongoDB Atlas for cloud hosting.

### 3. Configure Applications

Each application has its own environment file:

**W2-Activity-Logs:**
```bash
cd W2-Activity-Logs
cp .env.example .env
# Edit .env with your MongoDB URI
```

**FSET-Activity-Logs:**
```bash
cd FSET-Activity-Logs
cp .env.example .env
# Edit .env with your MongoDB URI
```

### 4. Run Applications

**Option A: Run both applications simultaneously**

Terminal 1 (W-2 App):
```bash
cd W2-Activity-Logs
npm run dev
# Runs on http://localhost:3001
```

Terminal 2 (FSET App):
```bash
cd FSET-Activity-Logs
npm run dev
# Runs on http://localhost:3002
```

**Option B: Run individually**

Run only the application you need.

## Features

### Both Applications Include:

- MongoDB integration with Mongoose ODM
- RESTful API routes for activities and users
- TypeScript for type safety
- TailwindCSS + DaisyUI for styling
- Responsive design
- Multi-language support (English, Spanish, Hmong) - to be implemented

### W-2 Specific Features:

- Job search tracking
- Employment activity logging
- Work hours tracking
- Interview management

### FSET Specific Features:

- Education tracking
- Training program management
- Workshop attendance
- Counseling session logs

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS + DaisyUI
- **Database**: MongoDB
- **ODM**: Mongoose
- **Package Manager**: npm

## Next Steps

1. ✅ Root landing page created
2. ✅ Two separate Next.js applications set up
3. ✅ MongoDB schemas and connections configured
4. ✅ API routes implemented
5. ⏳ Migrate components from original `/src` directory
6. ⏳ Implement authentication
7. ⏳ Add dashboards for clients and coaches
8. ⏳ Implement reporting features
9. ⏳ Add multi-language support
10. ⏳ Deploy applications

## Migration Status

### Completed:
- Project structure separation
- MongoDB integration
- Basic API endpoints
- Landing page

### Pending:
- Component migration from `/src`
- Authentication implementation
- Dashboard migration
- Translation context integration
- Job search feature integration

## Contributing

Each application can be developed independently. See individual README files in each application directory for specific details.

## Support

For issues or questions:
- Check individual application README files
- Review API documentation in each app's `/api` directory
