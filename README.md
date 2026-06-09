# 🚀 YojnaFlow - AI-Powered Project Management System

YojnaFlow is a modern full-stack project management platform designed to help teams plan, track, and collaborate efficiently. It provides project management, task tracking, sprint planning, team collaboration, bug tracking, AI-powered assistance, and real-time productivity insights.

---

## 🌐 Live Deployment

### Frontend (Vercel)

**Application URL:** https://yojnaflow.vercel.app

### Backend (Render)

**API URL:** https://your-render-backend-url.onrender.com

---

## 📂 Project Structure

```bash
YojnaFlow/
│
├── frontend/                    # React + Vite Frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── contexts/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── utils/
│   │
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── backend/                     # Express.js Backend
│   ├── api/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   └── services/
│   │
│   ├── server.js
│   ├── package.json
│   └── firebase-admin.json
│
└── README.md
```

---

## ✨ Features

### 📊 Dashboard

* Project analytics
* Task statistics
* Activity timeline
* Team productivity metrics

### 📋 Project Management

* Create and manage projects
* Project progress tracking
* Team assignments
* Milestone management

### ✅ Task Management

* Create, update, and delete tasks
* Task priorities
* Due dates
* Status tracking
* Assignee management

### 🏃 Sprint Management

* Sprint planning
* Sprint tracking
* Sprint analytics
* Backlog management

### 🐞 Bug Tracker

* Bug reporting
* Issue management
* Priority categorization
* Resolution workflow

### 👥 Team Collaboration

* Team management
* Activity feeds
* Project member roles
* Collaboration workspace

### 🤖 AI Assistant

* Productivity recommendations
* Project insights
* Smart suggestions
* Workflow optimization

### 🔐 Authentication

* Firebase Authentication
* Secure login/signup
* Protected routes
* Role-based access

---

## 🛠️ Tech Stack

### Frontend

* React.js
* Vite
* Tailwind CSS
* Firebase Authentication
* React Router
* Recharts

### Backend

* Node.js
* Express.js
* Firebase Admin SDK
* Cloud Firestore
* CORS
* JWT Authentication

### Database

* Google Cloud Firestore

### Deployment

* Frontend: Vercel
* Backend: Render

---

## ⚙️ Local Development Setup

### 1. Clone Repository

```bash
git clone https://github.com/your-username/YojnaFlow.git

cd YojnaFlow
```

---

## 🔧 Backend Setup

```bash
cd backend

npm install
```

Create a `.env` file:

```env
PORT=5000

FRONTEND_URL=http://localhost:5173

FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
```

Start backend:

```bash
npm run dev
```

Backend runs on:

```bash
http://localhost:5000
```

---

## 🎨 Frontend Setup

```bash
cd frontend

npm install
```

Create a `.env` file:

```env
VITE_API_URL=http://localhost:5000

VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

Start frontend:

```bash
npm run dev
```

Frontend runs on:

```bash
http://localhost:5173
```

---

## 🚀 Deployment Guide

### Frontend Deployment (Vercel)

Deploy the `frontend` directory.

Required Environment Variables:

```env
VITE_API_URL=https://your-render-backend-url.onrender.com
```

Build Settings:

```bash
Build Command: npm run build

Output Directory: dist
```

---

### Backend Deployment (Render)

Deploy the `backend` directory.

Required Environment Variables:

```env
PORT=10000

FRONTEND_URL=https://yojnaflow.vercel.app

FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
```

Start Command:

```bash
npm start
```

---

## 🔒 Environment Variables

### Frontend

```env
VITE_API_URL=
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

### Backend

```env
PORT=
FRONTEND_URL=
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
```

---

## 📈 Future Enhancements

* Real-time notifications
* WebSocket collaboration
* Gantt charts
* Kanban board
* Advanced analytics
* AI sprint planning
* Team performance insights
* Mobile application

---

## 👨‍💻 Author

**Shivang Rai**

GitHub: https://github.com/shivangrai5143

LinkedIn: https://www.linkedin.com/in/shivang-rai11/

Portfolio: https://shivang-2005.vercel.app/

---

## 📄 License

This project is licensed under the MIT License.
