# 🚀 YojnaFlow — AI-Powered Project Management Platform

<p align="center">
  <strong>A modern full-stack platform for planning, managing, tracking, and collaborating on software projects.</strong>
</p>

<p align="center">
  <a href="https://yojnaflow.vercel.app">Live Demo</a> •
  <a href="https://github.com/shivangrai5143/Yojna-Flow">GitHub</a> •
  <a href="https://www.linkedin.com/in/shivang-rai11/">LinkedIn</a>
</p>

---

## 📌 Overview

**YojnaFlow** is a full-stack project management platform designed to bring project planning, task management, team collaboration, sprint tracking, activity monitoring, role-based access control, AI-assisted insights, and collaborative tools into a single application.

The project is built with a **Next.js frontend**, a separate **Express.js REST API backend**, **Firebase Authentication**, and **Cloud Firestore**.

The application follows a separated frontend/backend architecture so that presentation, business logic, authentication verification, authorization, and data access remain independently manageable.

---

## ✨ Key Features

### 📊 Dashboard

* Project overview
* Task statistics
* Project progress
* Activity timeline
* Productivity insights
* Analytics visualizations

### 📁 Project Management

* Create projects
* Update project information
* Track project status
* Manage project members
* Assign responsibilities
* Monitor project progress

### ✅ Task Management

* Create tasks
* Update tasks
* Delete tasks
* Assign tasks to team members
* Task priorities
* Due dates
* Status management
* Task filtering and organization

### 🏃 Sprint & Workflow Management

* Sprint planning
* Sprint tracking
* Backlog management
* Task organization
* Kanban-style workflows
* Development progress tracking

### 🐞 Bug & Issue Tracking

* Report issues
* Track bugs
* Assign issues
* Set priorities
* Manage resolution status

### 👥 Team Collaboration

* Team member management
* Project membership
* Role-based permissions
* Activity feeds
* Standup management
* Collaborative workspace

### 🤖 AI-Assisted Features

* AI assistant interface
* Project insights
* Productivity recommendations
* Smart suggestions
* Workflow assistance

> AI-related functionality is designed as an application-level assistance layer over project and productivity workflows.

### 📝 Standups

* Create standup updates
* View team standups
* Track development progress
* Organize daily development updates

### 🎨 Collaborative Whiteboard

* Create whiteboard content
* Update whiteboard data
* Delete whiteboard content
* Support collaborative project planning

### 📈 Activity Tracking

* Record project activities
* Display activity timelines
* Filter activity
* Track important project events

### 🔐 Authentication & Authorization

* Firebase Authentication
* Email/password authentication
* Firebase ID-token verification
* Protected application areas
* Role-Based Access Control (RBAC)
* Permission-based API operations

Supported application roles:

| Role              | Purpose                              |
| ----------------- | ------------------------------------ |
| `admin`           | Platform and user administration     |
| `project_manager` | Project and team management          |
| `developer`       | Development and task execution       |
| `client`          | Project visibility and collaboration |

---

# 🏗️ System Architecture

YojnaFlow uses a separated frontend/backend architecture.

```text
                         ┌─────────────────────┐
                         │        USER         │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │     Next.js App     │
                         │   React Frontend    │
                         └──────────┬──────────┘
                                    │
                         Firebase Authentication
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │   Firebase Auth     │
                         │   User Identity     │
                         └──────────┬──────────┘
                                    │
                             Firebase ID Token
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │   Express Backend   │
                         │     REST APIs       │
                         └──────────┬──────────┘
                                    │
                         Verify Firebase Token
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │       RBAC          │
                         │ Roles & Permissions │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │   Firestore Data    │
                         │      Access Layer   │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │    Cloud Firestore  │
                         │      Database       │
                         └─────────────────────┘
```

---

# 🔄 Authentication Flow

Authentication is handled using Firebase Authentication.

The frontend authenticates the user and receives a Firebase ID token.

The token is then sent to protected backend endpoints using the `Authorization` header.

```text
User
 │
 │ Email + Password
 ▼
Firebase Authentication
 │
 │ Firebase ID Token
 ▼
Next.js Frontend
 │
 │ Authorization: Bearer <token>
 ▼
Express API
 │
 │ Firebase Admin SDK
 │
 ▼
Verify ID Token
 │
 │ UID
 ▼
Firestore User Profile
 │
 ▼
RBAC / Permission Check
 │
 ▼
Protected Resource
```

This separates:

* **Authentication** — determining who the user is
* **Authorization** — determining what the user is allowed to do
* **Data access** — retrieving or modifying application data

---

# 🔐 Role-Based Access Control

YojnaFlow uses RBAC to control application permissions.

Instead of assigning permissions individually to every user, permissions are associated with application roles.

```text
User
 │
 ▼
Role
 │
 ▼
Permissions
 │
 ├── PROJECTS_READ
 ├── PROJECTS_CREATE
 ├── PROJECTS_UPDATE
 ├── TASKS_READ
 ├── TASKS_CREATE
 ├── TASKS_UPDATE
 ├── TASKS_DELETE
 ├── USERS_READ
 └── ...
```

The backend is responsible for enforcing authorization rather than relying only on frontend UI restrictions.

---

# 🌐 REST API

The backend exposes REST-style endpoints for the main application resources.

## Authentication

```http
POST /api/auth/login
POST /api/auth/register
GET  /api/auth/me
```

## Projects

```http
GET    /api/projects
POST   /api/projects
GET    /api/projects/:id
PUT    /api/projects/:id
PATCH  /api/projects/:id
DELETE /api/projects/:id
```

## Tasks

```http
GET   /api/tasks
POST  /api/tasks
PATCH /api/tasks
```

## Standups

```http
GET  /api/standups
POST /api/standups
```

## Users

```http
GET   /api/users
PATCH /api/users/:id
PATCH /api/users/:id/role
```

## Whiteboard

```http
GET    /api/whiteboard
POST   /api/whiteboard
PUT    /api/whiteboard
DELETE /api/whiteboard
```

## Activity

```http
GET /api/activity
```

## Health Check

```http
GET /api/health
```

The API routes are registered centrally in the Express backend entry point.

---

# 🛠️ Technology Stack

## Frontend

| Technology                   | Purpose                                 |
| ---------------------------- | --------------------------------------- |
| Next.js                      | React framework and application routing |
| React                        | UI development                          |
| Tailwind CSS                 | Styling                                 |
| Firebase Client SDK          | Authentication                          |
| Recharts                     | Data visualization                      |
| Framer Motion                | Animations                              |
| dnd-kit                      | Drag-and-drop interactions              |
| Radix UI                     | Accessible UI primitives                |
| Lucide React                 | Icons                                   |
| Three.js / React Three Fiber | 3D UI experiences                       |
| date-fns                     | Date manipulation                       |

The current frontend package uses Next.js 16.2.6 and React 19.2.4.

## Backend

| Technology         | Purpose                          |
| ------------------ | -------------------------------- |
| Node.js            | JavaScript runtime               |
| Express.js         | REST API server                  |
| Firebase Admin SDK | Server-side Firebase integration |
| Cloud Firestore    | Application database             |
| CORS               | Cross-origin request handling    |
| dotenv             | Environment configuration        |

The backend currently requires Node.js 18+ and uses Express 5 with Firebase Admin.

## Database

**Google Cloud Firestore**

The application uses Firestore for application data including users, projects, tasks, standups, whiteboards, and activity records.

## Deployment

```text
Frontend → Vercel
Backend  → Render
Database → Cloud Firestore
Auth     → Firebase Authentication
```

---

# 📂 Project Structure

```text
Yojna-Flow/
│
├── backend/
│   │
│   ├── api/
│   │   ├── activity/
│   │   ├── auth/
│   │   ├── lib/
│   │   ├── models/
│   │   │   └── firestore/
│   │   ├── projects/
│   │   ├── standups/
│   │   ├── tasks/
│   │   ├── users/
│   │   ├── whiteboard/
│   │   ├── seed.js
│   │   ├── seed-firestore.js
│   │   └── test-connection.js
│   │
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
├── frontend-next/
│   │
│   ├── app/
│   │   ├── (auth)/
│   │   ├── (protected)/
│   │   ├── layout.jsx
│   │   ├── page.jsx
│   │   └── providers.jsx
│   │
│   ├── components/
│   │   ├── 3d/
│   │   ├── activity/
│   │   ├── ai/
│   │   ├── chat/
│   │   ├── dashboard/
│   │   ├── kanban/
│   │   ├── layout/
│   │   ├── pages/
│   │   ├── projects/
│   │   ├── rbac/
│   │   ├── standup/
│   │   ├── tasks/
│   │   ├── ui/
│   │   ├── whiteboard/
│   │   └── workspace/
│   │
│   ├── context/
│   │   ├── AIAgentContext.jsx
│   │   ├── ActivityContext.jsx
│   │   ├── AuthContext.jsx
│   │   ├── ChatContext.jsx
│   │   ├── NotificationContext.jsx
│   │   ├── ProjectContext.jsx
│   │   ├── RBACContext.jsx
│   │   ├── StandupBotContext.jsx
│   │   ├── TaskContext.jsx
│   │   ├── ThemeContext.jsx
│   │   └── WhiteboardContext.jsx
│   │
│   ├── data/
│   ├── lib/
│   ├── public/
│   ├── services/
│   ├── utils/
│   │
│   ├── package.json
│   ├── next.config.mjs
│   └── postcss.config.mjs
│
├── firebase.json
├── firestore.rules
├── firestore.indexes.json
├── render.yaml
├── .gitignore
└── README.md
```

---

# 🚀 Getting Started

## Prerequisites

Make sure the following are installed:

* Node.js 18+
* npm
* Git
* Firebase project
* Firebase Authentication enabled
* Cloud Firestore enabled

---

## 1. Clone the Repository

```bash
git clone https://github.com/shivangrai5143/Yojna-Flow.git

cd Yojna-Flow
```

---

# 🔧 Backend Setup

Navigate to the backend:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file:

```env
PORT=5000

FRONTEND_URL=http://localhost:3000

FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
```

> Never commit Firebase Admin credentials or private keys to GitHub.

Start the development server:

```bash
npm run dev
```

Start the production server:

```bash
npm start
```

The backend will be available at:

```text
http://localhost:5000
```

Health check:

```text
http://localhost:5000/api/health
```

---

# 🎨 Frontend Setup

Open a new terminal:

```bash
cd frontend-next
```

Install dependencies:

```bash
npm install
```

Create the appropriate environment configuration for the Firebase client and backend API.

Example:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000

NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

Start the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

# 🧪 Available Scripts

## Frontend

```bash
npm run dev
```

Starts the Next.js development server.

```bash
npm run build
```

Creates a production build.

```bash
npm run start
```

Starts the production Next.js server.

```bash
npm run lint
```

Runs ESLint.

## Backend

```bash
npm run dev
```

Starts the backend with Node's watch mode.

```bash
npm start
```

Starts the production backend server.

---

# 🔒 Security

YojnaFlow uses multiple security layers.

### Authentication

Firebase Authentication manages user identity.

### Backend Token Verification

The Express backend verifies Firebase ID tokens using Firebase Admin SDK.

### Authorization

RBAC determines whether an authenticated user has permission to perform a particular operation.

### Environment Variables

Sensitive server configuration is stored through environment variables rather than hard-coded credentials.

### Firestore Rules

Firestore Security Rules provide an additional database-level security boundary.

### CORS

The backend restricts cross-origin requests to configured application origins.

---

# 🔄 Example Request Lifecycle

Consider creating a project.

```text
User
 │
 │ Clicks "Create Project"
 ▼
Next.js Component
 │
 │ POST /api/projects
 ▼
Express API
 │
 │ Read Authorization header
 ▼
Firebase Admin SDK
 │
 │ Verify Firebase ID Token
 ▼
Authenticated User
 │
 │ Check RBAC permission
 ▼
Project Business Logic
 │
 │ Validate / process data
 ▼
Firestore
 │
 │ Create project document
 ▼
Express Response
 │
 ▼
Next.js
 │
 ▼
Updated UI
```

This architecture keeps authentication, authorization, business logic, and data persistence separated.

---

# 🧠 Engineering Decisions

## Why Next.js?

Next.js provides a structured React application framework with routing, layouts, build optimization, and production deployment support.

## Why Express?

Express provides a lightweight and flexible way to build REST APIs and organize backend business logic independently from the frontend.

## Why Firebase Authentication?

Firebase Authentication provides a managed identity system without requiring the application to implement password storage and authentication infrastructure from scratch.

## Why Firestore?

Firestore provides a flexible document-oriented data model and integrates naturally with Firebase Authentication and the Firebase Admin SDK.

## Why a Separate Backend?

The backend provides a centralized location for:

* Business logic
* Authorization
* Token verification
* Data access
* API contracts
* Server-side operations

This prevents sensitive business rules from being implemented only on the client.

---

# 📈 Scalability Considerations

If YojnaFlow were scaled to a larger production environment, possible improvements would include:

* Redis caching
* Background job processing
* Queue-based activity processing
* Rate limiting
* Centralized structured logging
* API versioning
* Automated testing
* CI/CD pipelines
* Monitoring and observability
* Database query optimization
* Pagination for large datasets
* WebSocket-based real-time collaboration
* CDN and asset optimization
* Horizontal backend scaling

---

# 🛡️ Future Improvements

Potential improvements include:

* Real-time notifications
* WebSocket-based collaboration
* Advanced analytics
* Gantt charts
* Improved Kanban workflows
* AI-assisted sprint planning
* AI-generated project summaries
* Team performance analytics
* Advanced audit logging
* Automated testing
* CI/CD
* Mobile application

---

# 🧪 Testing Strategy

A production version of YojnaFlow should include automated tests across multiple levels:

```text
Unit Tests
    ↓
Service / Utility Tests
    ↓
API Integration Tests
    ↓
Authentication Tests
    ↓
RBAC / Authorization Tests
    ↓
End-to-End Tests
```

Important test cases include:

* Successful registration
* Invalid registration
* Successful authentication
* Invalid credentials
* Expired/invalid Firebase token
* Unauthorized API requests
* Role-based permission checks
* Project CRUD
* Task CRUD
* User role updates
* Firestore failures
* Invalid request payloads

---

# 📊 Project Highlights

| Area               | Implementation          |
| ------------------ | ----------------------- |
| Frontend           | Next.js + React         |
| Backend            | Node.js + Express       |
| Authentication     | Firebase Authentication |
| Token Verification | Firebase Admin SDK      |
| Database           | Cloud Firestore         |
| Authorization      | RBAC                    |
| API                | REST                    |
| Styling            | Tailwind CSS            |
| Charts             | Recharts                |
| Drag & Drop        | dnd-kit                 |
| Animations         | Framer Motion           |
| Deployment         | Vercel + Render         |

---

# 🌐 Deployment

### Frontend

**Vercel**

```text
https://yojnaflow.vercel.app
```

### Backend

The backend is designed to run as a separate Node.js service, such as Render.

Configure the frontend with the deployed backend API URL and configure the backend with the production frontend origin.

---

# 📚 Architecture Principles

YojnaFlow follows these core principles:

* Separation of concerns
* Feature-oriented frontend organization
* RESTful API design
* Authentication/authorization separation
* Server-side permission enforcement
* Environment-based configuration
* Centralized backend API
* Document-oriented data access
* Modular application contexts
* Reusable UI components

---

# 👨‍💻 Author

## Shivang Rai

B.Tech Computer Science Engineering
Cloud Computing & Machine Learning

### Connect

* GitHub: https://github.com/shivangrai5143
* LinkedIn: https://www.linkedin.com/in/shivang-rai11/
* Portfolio: https://shivang-2005.vercel.app/

---

# 📄 License

This project is licensed under the **MIT License**.

---

<p align="center">
  Built with ❤️ by <strong>Shivang Rai</strong>
</p>
