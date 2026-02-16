import connectDB from '../lib/mongodb.js';
import Whiteboard from '../models/Whiteboard.js';
import { verifyToken } from '../lib/auth.js';

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
        await connectDB();

        // Verify authentication
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = verifyToken(token);
        if (!decoded) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        const { projectId } = req.query;

        if (!projectId) {
            return res.status(400).json({ error: 'Project ID is required' });
        }

        // GET - Fetch all elements for a project
        if (req.method === 'GET') {
            const { since, lastCleared: clientLastCleared } = req.query;

            let whiteboard = await Whiteboard.findOne({ projectId });

            if (!whiteboard) {
                // Create empty whiteboard if doesn't exist
                whiteboard = await Whiteboard.create({
                    projectId,
                    strokes: [],
                    shapes: [],
                    texts: [],
                    stickyNotes: [],
                    lastCleared: null,
                    version: 0
                });
            }

            // Check if board was cleared after client's last known clear time
            const serverLastCleared = whiteboard.lastCleared ? new Date(whiteboard.lastCleared).getTime() : 0;
            const clientClearedTime = clientLastCleared ? parseInt(clientLastCleared) : 0;
            const boardWasCleared = serverLastCleared > clientClearedTime;

            let strokes = whiteboard.strokes || [];
            let shapes = whiteboard.shapes || [];
            let texts = whiteboard.texts || [];
            let stickyNotes = whiteboard.stickyNotes || [];

            // If client has a 'since' timestamp and board wasn't cleared, send only new elements
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
                boardWasCleared
            });
        }

        // POST - Add new elements
        if (req.method === 'POST') {
            const { strokes, shapes, texts, stickyNotes, action } = req.body;

            if (action === 'clear') {
                // Clear the whiteboard
                const whiteboard = await Whiteboard.findOneAndUpdate(
                    { projectId },
                    {
                        $set: {
                            strokes: [],
                            shapes: [],
                            texts: [],
                            stickyNotes: [],
                            lastCleared: new Date()
                        },
                        $inc: { version: 1 }
                    },
                    { new: true, upsert: true }
                );

                return res.status(200).json({
                    success: true,
                    lastCleared: whiteboard.lastCleared.getTime(),
                    version: whiteboard.version
                });
            }

            const updateOps = { $inc: { version: 1 } };
            const pushOps = {};

            // Handle strokes
            if (strokes && Array.isArray(strokes) && strokes.length > 0) {
                const strokesWithUser = strokes.map(stroke => ({
                    ...stroke,
                    userId: decoded.userId,
                    userName: decoded.name || 'Unknown',
                    createdAt: new Date()
                }));
                pushOps.strokes = { $each: strokesWithUser };
            }

            // Handle shapes
            if (shapes && Array.isArray(shapes) && shapes.length > 0) {
                const shapesWithUser = shapes.map(shape => ({
                    ...shape,
                    userId: decoded.userId,
                    userName: decoded.name || 'Unknown',
                    createdAt: new Date()
                }));
                pushOps.shapes = { $each: shapesWithUser };
            }

            // Handle texts
            if (texts && Array.isArray(texts) && texts.length > 0) {
                const textsWithUser = texts.map(text => ({
                    ...text,
                    userId: decoded.userId,
                    userName: decoded.name || 'Unknown',
                    createdAt: new Date()
                }));
                pushOps.texts = { $each: textsWithUser };
            }

            // Handle sticky notes
            if (stickyNotes && Array.isArray(stickyNotes) && stickyNotes.length > 0) {
                const notesWithUser = stickyNotes.map(note => ({
                    ...note,
                    userId: decoded.userId,
                    userName: decoded.name || 'Unknown',
                    createdAt: new Date()
                }));
                pushOps.stickyNotes = { $each: notesWithUser };
            }

            if (Object.keys(pushOps).length > 0) {
                updateOps.$push = pushOps;
            }

            const whiteboard = await Whiteboard.findOneAndUpdate(
                { projectId },
                updateOps,
                { new: true, upsert: true }
            );

            return res.status(200).json({
                success: true,
                version: whiteboard.version
            });
        }

        // PUT - Update existing element (for sticky note content, moving elements)
        if (req.method === 'PUT') {
            const { elementType, elementId, updates } = req.body;

            if (!elementType || !elementId || !updates) {
                return res.status(400).json({ error: 'elementType, elementId, and updates are required' });
            }

            const fieldMap = {
                stroke: 'strokes',
                shape: 'shapes',
                text: 'texts',
                stickyNote: 'stickyNotes'
            };

            const idFieldMap = {
                stroke: 'strokeId',
                shape: 'shapeId',
                text: 'textId',
                stickyNote: 'noteId'
            };

            const field = fieldMap[elementType];
            const idField = idFieldMap[elementType];

            if (!field) {
                return res.status(400).json({ error: 'Invalid element type' });
            }

            // Build update object
            const updateObj = {};
            Object.keys(updates).forEach(key => {
                updateObj[`${field}.$[elem].${key}`] = updates[key];
            });

            const whiteboard = await Whiteboard.findOneAndUpdate(
                { projectId },
                {
                    $set: updateObj,
                    $inc: { version: 1 }
                },
                {
                    new: true,
                    arrayFilters: [{ [`elem.${idField}`]: elementId }]
                }
            );

            if (!whiteboard) {
                return res.status(404).json({ error: 'Whiteboard not found' });
            }

            return res.status(200).json({
                success: true,
                version: whiteboard.version
            });
        }

        // DELETE - Clear board or delete specific element
        if (req.method === 'DELETE') {
            const { elementType, elementId } = req.query;

            // If no specific element, clear entire board
            if (!elementType || !elementId) {
                const whiteboard = await Whiteboard.findOneAndUpdate(
                    { projectId },
                    {
                        $set: {
                            strokes: [],
                            shapes: [],
                            texts: [],
                            stickyNotes: [],
                            lastCleared: new Date()
                        },
                        $inc: { version: 1 }
                    },
                    { new: true, upsert: true }
                );

                return res.status(200).json({
                    success: true,
                    lastCleared: whiteboard.lastCleared.getTime(),
                    version: whiteboard.version
                });
            }

            // Delete specific element
            const fieldMap = {
                stroke: { field: 'strokes', idField: 'strokeId' },
                shape: { field: 'shapes', idField: 'shapeId' },
                text: { field: 'texts', idField: 'textId' },
                stickyNote: { field: 'stickyNotes', idField: 'noteId' }
            };

            const config = fieldMap[elementType];
            if (!config) {
                return res.status(400).json({ error: 'Invalid element type' });
            }

            const whiteboard = await Whiteboard.findOneAndUpdate(
                { projectId },
                {
                    $pull: { [config.field]: { [config.idField]: elementId } },
                    $inc: { version: 1 }
                },
                { new: true }
            );

            return res.status(200).json({
                success: true,
                version: whiteboard?.version || 0
            });
        }

        return res.status(405).json({ error: 'Method not allowed' });

    } catch (error) {
        console.error('Whiteboard API error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
