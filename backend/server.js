import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
// Explicit whitelist — no wildcards, no startsWith (prevents origin-spoofing)
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:4173',
    'http://localhost:3000',
    'https://yojnaflow.vercel.app',          // Production Vercel frontend
    process.env.FRONTEND_URL,                 // Override via env if needed
].filter(Boolean);

// Regex for allowing any *.vercel.app domain dynamically
const vercelRegex = /^https:\/\/.*\.vercel\.app$/;

const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (server-to-server, curl, mobile apps)
        if (!origin) return callback(null, true);
        
        // Check static allowed origins
        if (allowedOrigins.some(allowed => origin.startsWith(allowed))) {
            return callback(null, true);
        }
        
        // Check dynamic Vercel domains
        if (vercelRegex.test(origin)) {
            return callback(null, true);
        }

        callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    optionsSuccessStatus: 204, // Some browsers (IE11) choke on 200 for OPTIONS
};

// Apply CORS middleware — must be before route handlers
app.use(cors(corsOptions));

// Handle OPTIONS preflight for all routes globally
app.options('{*path}', cors(corsOptions));

// Parse JSON bodies
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ============ AUTH ROUTES ============
import loginHandler    from './api/auth/login.js';
import registerHandler from './api/auth/register.js';
import meHandler       from './api/auth/me.js';

app.post('/api/auth/login',    (req, res) => loginHandler(req, res));
app.post('/api/auth/register', (req, res) => registerHandler(req, res));
app.get('/api/auth/me',        (req, res) => meHandler(req, res));

// ============ PROJECTS ROUTES ============
import projectsHandler   from './api/projects/index.js';
import projectIdHandler  from './api/projects/[id].js';

app.get('/api/projects',       (req, res) => projectsHandler(req, res));
app.post('/api/projects',      (req, res) => projectsHandler(req, res));

// Project detail — GET / PUT / DELETE by ID
app.get('/api/projects/:id',    (req, res) => { req.query.id = req.params.id; projectIdHandler(req, res); });
app.put('/api/projects/:id',    (req, res) => { req.query.id = req.params.id; projectIdHandler(req, res); });
app.patch('/api/projects/:id',  (req, res) => { req.query.id = req.params.id; projectIdHandler(req, res); });
app.delete('/api/projects/:id', (req, res) => { req.query.id = req.params.id; projectIdHandler(req, res); });

// ============ TASKS ROUTES ============
import tasksHandler from './api/tasks/index.js';

app.get('/api/tasks',   (req, res) => tasksHandler(req, res));
app.post('/api/tasks',  (req, res) => tasksHandler(req, res));
app.patch('/api/tasks', (req, res) => tasksHandler(req, res));

// ============ STANDUPS ROUTES ============
import standupsHandler from './api/standups/index.js';

app.get('/api/standups',  (req, res) => standupsHandler(req, res));
app.post('/api/standups', (req, res) => standupsHandler(req, res));

// ============ USERS ROUTES ============
import usersIndexHandler from './api/users/index.js';
import usersIdHandler    from './api/users/[id].js';

// GET /api/users  — list all users (admin/PM/developer)
app.get('/api/users', (req, res) => usersIndexHandler(req, res));

// PATCH /api/users/:id  — update profile fields
app.patch('/api/users/:id', (req, res) => {
    req.query.id = req.params.id;
    usersIdHandler(req, res);
});

// PATCH /api/users/:id/role  — change role (admin only)
app.patch('/api/users/:id/role', (req, res) => {
    req.query.id     = req.params.id;
    req.query.action = 'role';
    usersIdHandler(req, res);
});

// ============ WHITEBOARD ROUTES ============
import whiteboardHandler from './api/whiteboard/index.js';

app.get('/api/whiteboard',     (req, res) => whiteboardHandler(req, res));
app.post('/api/whiteboard',    (req, res) => whiteboardHandler(req, res));
app.put('/api/whiteboard',     (req, res) => whiteboardHandler(req, res));
app.delete('/api/whiteboard',  (req, res) => whiteboardHandler(req, res));
app.options('/api/whiteboard', (req, res) => whiteboardHandler(req, res));

// ============ ACTIVITY ROUTES ============
import activityHandler from './api/activity/index.js';

app.get('/api/activity', (req, res) => activityHandler(req, res));

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Backend server running on port ${PORT}`);
    console.log(`   Health check: http://localhost:${PORT}/api/health`);
    console.log(`   RBAC: admin | project_manager | developer | client`);
});
