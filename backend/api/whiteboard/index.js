import * as whiteboardsModel from '../models/firestore/whiteboards.js';
import { verifyFirebaseToken, authMiddleware } from '../lib/auth.js';
import { hasPermission, PERMISSIONS } from '../lib/rbac.js';

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        // Authenticate and attach role-enriched user
        const authResult = await authMiddleware(req);
        if (authResult.error) {
            return res.status(authResult.status || 401).json({ error: authResult.error });
        }

        const user = authResult.user;
        const { projectId } = req.query;

        if (!projectId) {
            return res.status(400).json({ error: 'Project ID is required' });
        }

        // -----------------------------------------------------------------------
        // GET — fetch whiteboard elements (requires whiteboard.read)
        // -----------------------------------------------------------------------
        if (req.method === 'GET') {
            if (!hasPermission(user.role, PERMISSIONS.WHITEBOARD_READ)) {
                return res.status(403).json({
                    error: 'Forbidden: whiteboard read access required',
                    code: 'INSUFFICIENT_PERMISSIONS',
                    userRole: user.role,
                });
            }

            const { since, lastCleared: clientLastCleared } = req.query;

            let whiteboard = await whiteboardsModel.getWhiteboardByProject(projectId);
            if (!whiteboard) {
                whiteboard = await whiteboardsModel.createWhiteboard(projectId);
            }

            const serverLastCleared = whiteboard.lastCleared ? new Date(whiteboard.lastCleared).getTime() : 0;
            const clientClearedTime = clientLastCleared ? parseInt(clientLastCleared) : 0;
            const boardWasCleared = serverLastCleared > clientClearedTime;

            let strokes = whiteboard.strokes || [];
            let shapes = whiteboard.shapes || [];
            let texts = whiteboard.texts || [];
            let stickyNotes = whiteboard.stickyNotes || [];

            if (since && !boardWasCleared) {
                const sinceDate = new Date(parseInt(since));
                strokes = strokes.filter(s => new Date(s.createdAt) > sinceDate);
                shapes = shapes.filter(s => new Date(s.createdAt) > sinceDate);
                texts = texts.filter(t => new Date(t.createdAt) > sinceDate);
                stickyNotes = stickyNotes.filter(n => new Date(n.createdAt) > sinceDate);
            }

            return res.status(200).json({
                strokes,
                shapes,
                texts,
                stickyNotes,
                lastCleared: whiteboard.lastCleared ? new Date(whiteboard.lastCleared).getTime() : null,
                version: whiteboard.version,
                boardWasCleared,
            });
        }

        // -----------------------------------------------------------------------
        // POST — add new elements or clear board (requires whiteboard.write)
        // -----------------------------------------------------------------------
        if (req.method === 'POST') {
            if (!hasPermission(user.role, PERMISSIONS.WHITEBOARD_WRITE)) {
                return res.status(403).json({
                    error: 'Forbidden: whiteboard write access required',
                    code: 'INSUFFICIENT_PERMISSIONS',
                    userRole: user.role,
                });
            }

            const { strokes, shapes, texts, stickyNotes, action } = req.body;

            if (action === 'clear') {
                // Clear requires whiteboard.delete
                if (!hasPermission(user.role, PERMISSIONS.WHITEBOARD_DELETE)) {
                    return res.status(403).json({
                        error: 'Forbidden: whiteboard delete access required',
                        code: 'INSUFFICIENT_PERMISSIONS',
                        userRole: user.role,
                    });
                }
                const whiteboard = await whiteboardsModel.clearWhiteboard(projectId);
                return res.status(200).json({
                    success: true,
                    lastCleared: whiteboard.lastCleared ? new Date(whiteboard.lastCleared).getTime() : null,
                    version: whiteboard.version,
                });
            }

            let whiteboard = await whiteboardsModel.getWhiteboardByProject(projectId);
            if (!whiteboard) {
                whiteboard = await whiteboardsModel.createWhiteboard(projectId);
            }

            const updates = {
                version: whiteboard.version + 1,
                updatedAt: new Date().toISOString(),
            };

            const addUserMeta = items => items.map(item => ({
                ...item,
                userId: user.uid,
                userName: user.name || user.email || 'Unknown',
                createdAt: new Date().toISOString(),
            }));

            if (strokes?.length)     updates.strokes     = [...(whiteboard.strokes     || []), ...addUserMeta(strokes)];
            if (shapes?.length)      updates.shapes      = [...(whiteboard.shapes      || []), ...addUserMeta(shapes)];
            if (texts?.length)       updates.texts       = [...(whiteboard.texts       || []), ...addUserMeta(texts)];
            if (stickyNotes?.length) updates.stickyNotes = [...(whiteboard.stickyNotes || []), ...addUserMeta(stickyNotes)];

            whiteboard = await whiteboardsModel.updateWhiteboard(projectId, updates);
            return res.status(200).json({ success: true, version: whiteboard.version });
        }

        // -----------------------------------------------------------------------
        // PUT — update an existing element (requires whiteboard.write)
        // -----------------------------------------------------------------------
        if (req.method === 'PUT') {
            if (!hasPermission(user.role, PERMISSIONS.WHITEBOARD_WRITE)) {
                return res.status(403).json({
                    error: 'Forbidden: whiteboard write access required',
                    code: 'INSUFFICIENT_PERMISSIONS',
                    userRole: user.role,
                });
            }

            const { elementType, elementId, updates } = req.body;
            if (!elementType || !elementId || !updates) {
                return res.status(400).json({ error: 'elementType, elementId, and updates are required' });
            }

            const whiteboard = await whiteboardsModel.getWhiteboardByProject(projectId);
            if (!whiteboard) {
                return res.status(404).json({ error: 'Whiteboard not found' });
            }

            const fieldMap   = { stroke: 'strokes', shape: 'shapes', text: 'texts', stickyNote: 'stickyNotes' };
            const idFieldMap = { stroke: 'strokeId', shape: 'shapeId', text: 'textId', stickyNote: 'noteId' };
            const field   = fieldMap[elementType];
            const idField = idFieldMap[elementType];

            if (!field) {
                return res.status(400).json({ error: 'Invalid element type' });
            }

            const elements = whiteboard[field] || [];
            const updatedElements = elements.map(elem =>
                elem[idField] === elementId ? { ...elem, ...updates } : elem
            );

            const updatedWhiteboard = await whiteboardsModel.updateWhiteboard(projectId, { [field]: updatedElements });
            return res.status(200).json({ success: true, version: updatedWhiteboard.version });
        }

        // -----------------------------------------------------------------------
        // DELETE — remove element or clear board (requires whiteboard.delete)
        // -----------------------------------------------------------------------
        if (req.method === 'DELETE') {
            if (!hasPermission(user.role, PERMISSIONS.WHITEBOARD_DELETE)) {
                return res.status(403).json({
                    error: 'Forbidden: whiteboard delete access required',
                    code: 'INSUFFICIENT_PERMISSIONS',
                    userRole: user.role,
                });
            }

            const { elementType, elementId } = req.query;

            if (!elementType || !elementId) {
                const whiteboard = await whiteboardsModel.clearWhiteboard(projectId);
                return res.status(200).json({
                    success: true,
                    lastCleared: whiteboard.lastCleared ? new Date(whiteboard.lastCleared).getTime() : null,
                    version: whiteboard.version,
                });
            }

            const whiteboard = await whiteboardsModel.getWhiteboardByProject(projectId);
            if (!whiteboard) {
                return res.status(404).json({ error: 'Whiteboard not found' });
            }

            const fieldMap = {
                stroke:     { field: 'strokes',     idField: 'strokeId' },
                shape:      { field: 'shapes',      idField: 'shapeId' },
                text:       { field: 'texts',       idField: 'textId' },
                stickyNote: { field: 'stickyNotes', idField: 'noteId' },
            };

            const config = fieldMap[elementType];
            if (!config) {
                return res.status(400).json({ error: 'Invalid element type' });
            }

            const elements = whiteboard[config.field] || [];
            const filteredElements = elements.filter(elem => elem[config.idField] !== elementId);
            const updatedWhiteboard = await whiteboardsModel.updateWhiteboard(projectId, {
                [config.field]: filteredElements,
            });

            return res.status(200).json({ success: true, version: updatedWhiteboard?.version || 0 });
        }

        return res.status(405).json({ error: 'Method not allowed' });

    } catch (error) {
        console.error('Whiteboard API error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
