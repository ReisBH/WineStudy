# WineStudy - Product Requirements Document

## Original Problem Statement
Build a comprehensive wine education application (WineStudy) with:
1. World Wine Atlas - Global coverage (Old World & New World)
2. Study Platform - Progressive learning (basic/intermediate/advanced)
3. Tasting Diary - WSET Systematic Approach to Tasting (SAT)
4. Filter System - By grapes, regions, countries, styles, aromatic notes
5. Quiz System - Multiple choice, true/false, WSET-style questions
6. Relational aromatic notes system

## User Choices
- Authentication: JWT + Google OAuth
- OCR: Not in MVP (future phase with Google Drive)
- Images: No upload in MVP (future Google Drive integration)
- Language: Multilingual (Portuguese + English)
- Design: Premium editorial wine style (off-white + burgundy)

## User Personas
1. **Wine Enthusiast** - Casual learner wanting to understand wine basics
2. **WSET Student** - Preparing for certifications, needs structured study
3. **Sommelier Trainee** - Professional training, needs WSET SAT practice
4. **Wine Professional** - Reference tool for regions and grapes

## Core Requirements (Static)
- ✅ User authentication (JWT + Google OAuth)
- ✅ Multilingual support (PT/EN)
- ✅ Dark/Light theme
- ✅ Atlas with countries and regions
- ✅ Grape database with relational aromas
- ✅ Study tracks (3 levels)
- ✅ Quiz system with feedback
- ✅ Tasting diary with WSET SAT form
- ✅ Progress tracking

## What's Been Implemented (January 2026)

### Backend (FastAPI + MongoDB)
- Authentication endpoints (register, login, logout, session)
- Wine data APIs (countries, regions, grapes, aromas)
- Study APIs (tracks, lessons, progress)
- Quiz APIs (questions, submit answers)
- Tasting APIs (CRUD operations)
- Database seeding with comprehensive wine data
- **Content expansion endpoint for educational content**

### Frontend (React)
- Landing page with premium editorial design
- Atlas page with Old/New World filters
- **Region detail pages with terroir, climate, appellations, wine styles**
- Grapes page with type and aroma filters
- **Grape detail pages with aromatic profile, structure, best regions**
- Study area with 3 learning tracks
- Lesson viewer with progress tracking
- Quiz page with immediate feedback
- Tasting form with complete WSET SAT fields
- Dashboard with user progress
- Language toggle (PT/EN)
- Theme toggle (light/dark)
- Responsive design
- **Breadcrumb navigation on detail pages**

### Database Seed Data
- 10 Countries (5 Old World, 5 New World)
- 10 Regions (Bordeaux, Burgundy, Champagne, etc.)
- 12 Grape varieties (with aromatic profiles)
- 24 Aroma tags (categorized)
- 3 Study tracks
- **17 Lessons total:**
  - 5 Basic (Wine fundamentals)
  - **8 Intermediate (Terroir, Bordeaux, Burgundy, Winemaking, Sparkling, Fortified, Italy & Spain)**
  - **4 Advanced (Pinot Noir comparison, Human decisions, Aging, Typicity vs Innovation)**
- **16 Quiz questions (Basic, Intermediate, Advanced)**

## Prioritized Backlog

### P0 - Critical (Future MVP Enhancements)
- [x] ~~Add more lessons for intermediate and advanced tracks~~
- [x] ~~Expand quiz question bank~~
- [x] ~~Add region detail pages~~
- [x] ~~Add grape detail pages~~
- [ ] Country detail pages with full information

### P1 - High Priority
- [ ] Google Drive integration for image backup
- [ ] OCR for wine label recognition
- [ ] Wine recommendations based on preferences
- [ ] Social sharing of tastings

### P2 - Medium Priority
- [ ] Badges and gamification
- [ ] Leaderboard
- [ ] Wine pairing suggestions
- [ ] Glossary section
- [ ] Community features (comments, reviews)

### P3 - Nice to Have
- [ ] Offline mode (PWA)
- [ ] Push notifications
- [ ] Export tasting notes as PDF
- [ ] Wine cellar management

## Tech Stack
- **Frontend**: React 19, Tailwind CSS, Framer Motion, Shadcn UI
- **Backend**: FastAPI, Motor (async MongoDB)
- **Database**: MongoDB
- **Authentication**: JWT + Emergent Google OAuth
- **Deployment**: Kubernetes (Emergent Platform)

## Architecture
```
/app
├── backend/
│   ├── server.py          # Main FastAPI app with all routes
│   └── .env               # Environment variables
├── frontend/
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable components
│   │   ├── contexts/      # Auth & Language contexts
│   │   └── utils/         # Translations
│   └── .env               # Frontend env variables
└── memory/
    └── PRD.md             # This document
```

## Next Action Items
1. Add more educational content (lessons, questions)
2. Implement region and grape detail pages
3. Add more visual elements (maps, charts)
4. Consider adding user-generated content features
5. Implement Google Drive integration for phase 2
