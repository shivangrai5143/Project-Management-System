# YojnaFlow - Project Management System hi

A full-stack project management system with Firebase authentication and Firestore database.

## Project Structure

```
├── frontend/          # React + Vite (deployed on Vercel)
│   ├── src/           # React components, pages, contexts
│   ├── public/        # Static assets
│   └── package.json   # Frontend dependencies
│
├── backend/           # Express.js API (deployed on Render)
│   ├── api/           # Route handlers and models
│   ├── server.js      # Express server entry point
│   └── package.json   # Backend dependencies
```

## Getting Started

### Backend

```bash
cd backend
npm install
# Create .env from .env.example and add your Firebase credentials
npm run dev
```

The backend will run on `http://localhost:5000`.

### Frontend

```bash
cd frontend
npm install
# Create .env from .env.example and add your Firebase config
npm run dev
```

The frontend will run on `http://localhost:5173`.

## Deployment

- **Frontend**: Deploy `frontend/` folder to [Vercel](https://vercel.com)
- **Backend**: Deploy `backend/` folder to [Render](https://render.com)

### Environment Variables

See `frontend/.env.example` and `backend/.env.example` for required variables.

> **Important**: Set `VITE_API_URL` in frontend to your Render backend URL, and set `FRONTEND_URL` in backend to your Vercel frontend URL for CORS.

## Tech Stack

- **Frontend**: React, Vite, TailwindCSS, Firebase Auth
- **Backend**: Express.js, Firebase Admin SDK, Firestore
- **Auth**: Firebase Authentication
- **Database**: Cloud Firestore
