import connectDB from '../lib/mongodb.js';
import Standup from '../models/Standup.js';
import { authMiddleware, jsonResponse, errorResponse } from '../lib/auth.js';

export default async function handler(req, res) {
    // Verify authentication for all routes
    const authResult = await authMiddleware(req);

    if (authResult.error) {
        return errorResponse(res, authResult.error, authResult.status);
    }

    await connectDB();
    const userId = authResult.user.id;

    switch (req.method) {
        case 'GET':
            return getStandups(req, res, userId);
        case 'POST':
            return createStandup(req, res, userId, authResult.user.name);
        default:
            return errorResponse(res, 'Method not allowed', 405);
    }
}

// GET /api/standups - Get user's standup history
async function getStandups(req, res, userId) {
    try {
        const { limit = 30, today } = req.query;

        if (today === 'true') {
            const todayStandup = await Standup.getTodayStandup(userId);
            return jsonResponse(res, {
                success: true,
                standup: todayStandup,
                hasSubmittedToday: !!todayStandup,
            });
        }

        const standups = await Standup.getHistory(userId, parseInt(limit));

        return jsonResponse(res, {
            success: true,
            standups,
            count: standups.length,
        });

    } catch (error) {
        console.error('Get standups error:', error);
        return errorResponse(res, 'Server error', 500);
    }
}

// POST /api/standups - Submit a standup
async function createStandup(req, res, userId, userName) {
    try {
        const { response, selectedSuggestions, allSuggestions, projectId, mood, blockers } = req.body;

        if (!response || response.trim().length === 0) {
            return errorResponse(res, 'Standup response is required');
        }

        // Check if already submitted today
        const existingStandup = await Standup.getTodayStandup(userId);
        if (existingStandup) {
            return errorResponse(res, 'You have already submitted a standup today');
        }

        // Create standup
        const standup = await Standup.create({
            userId,
            userName,
            response: response.trim(),
            selectedSuggestions: selectedSuggestions || [],
            allSuggestions: allSuggestions || [],
            projectId: projectId || null,
            mood: mood || null,
            blockers: blockers || null,
        });

        return jsonResponse(res, {
            success: true,
            standup,
            message: 'Standup submitted successfully!',
        }, 201);

    } catch (error) {
        console.error('Create standup error:', error);
        return errorResponse(res, 'Server error', 500);
    }
}
