import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:4173',
    process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, curl, etc.)
        if (!origin) return callback(null, true);
        if (allowedOrigins.some(allowed => origin.startsWith(allowed))) {
            return callback(null, true);
        }
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
}));

// Parse JSON bodies
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ============ AUTH ROUTES ============
import loginHandler from './api/auth/login.js';
import registerHandler from './api/auth/register.js';
import meHandler from './api/auth/me.js';

app.post('/api/auth/login', (req, res) => loginHandler(req, res));
app.post('/api/auth/register', (req, res) => registerHandler(req, res));
app.get('/api/auth/me', (req, res) => meHandler(req, res));

// ============ PROJECTS ROUTES ============
import projectsHandler from './api/projects/index.js';

app.get('/api/projects', (req, res) => projectsHandler(req, res));
app.post('/api/projects', (req, res) => projectsHandler(req, res));

// ============ TASKS ROUTES ============
import tasksHandler from './api/tasks/index.js';

app.get('/api/tasks', (req, res) => tasksHandler(req, res));
app.post('/api/tasks', (req, res) => tasksHandler(req, res));
app.patch('/api/tasks', (req, res) => tasksHandler(req, res));

// ============ STANDUPS ROUTES ============
import standupsHandler from './api/standups/index.js';

app.get('/api/standups', (req, res) => standupsHandler(req, res));
app.post('/api/standups', (req, res) => standupsHandler(req, res));

// ============ USERS ROUTES ============
import usersHandler from './api/users/[id].js';

app.patch('/api/users/:id', (req, res) => {
    req.query.id = req.params.id;
    usersHandler(req, res);
});

// ============ WHITEBOARD ROUTES ============
import whiteboardHandler from './api/whiteboard/index.js';

app.get('/api/whiteboard', (req, res) => whiteboardHandler(req, res));
app.post('/api/whiteboard', (req, res) => whiteboardHandler(req, res));
app.put('/api/whiteboard', (req, res) => whiteboardHandler(req, res));
app.delete('/api/whiteboard', (req, res) => whiteboardHandler(req, res));
app.options('/api/whiteboard', (req, res) => whiteboardHandler(req, res));

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Backend server running on port ${PORT}`);
    console.log(`   Health check: http://localhost:${PORT}/api/health`);
});
