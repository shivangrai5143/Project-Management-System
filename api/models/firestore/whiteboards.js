import { db } from '../lib/firebase-admin.js';

const whiteboardsCollection = db.collection('whiteboards');

/**
 * Create a new whiteboard for a project
 */
export async function createWhiteboard(projectId) {
    const timestamp = new Date().toISOString();
    const whiteboard = {
        projectId,
        strokes: [],
        shapes: [],
        texts: [],
        stickyNotes: [],
        lastCleared: null,
        version: 0,
        createdAt: timestamp,
        updatedAt: timestamp,
    };

    // Use projectId as document ID for easy lookup
    await whiteboardsCollection.doc(projectId).set(whiteboard);
    return { id: projectId, ...whiteboard };
}

/**
 * Get whiteboard by project ID
 */
export async function getWhiteboardByProject(projectId) {
    const doc = await whiteboardsCollection.doc(projectId).get();
    if (!doc.exists) {
        return null;
    }
    return { id: doc.id, ...doc.data() };
}

/**
 * Update whiteboard (add/remove elements)
 */
export async function updateWhiteboard(projectId, updates) {
    const whiteboard = await getWhiteboardByProject(projectId);

    if (!whiteboard) {
        throw new Error('Whiteboard not found');
    }

    const updateData = {
        ...updates,
        version: (whiteboard.version || 0) + 1,
        updatedAt: new Date().toISOString(),
    };

    await whiteboardsCollection.doc(projectId).update(updateData);
    return getWhiteboardByProject(projectId);
}

/**
 * Add stroke to whiteboard
 */
export async function addStroke(projectId, stroke) {
    const whiteboard = await getWhiteboardByProject(projectId);
    if (!whiteboard) {
        await createWhiteboard(projectId);
    }

    const timestamp = new Date().toISOString();
    const newStroke = { ...stroke, createdAt: timestamp };

    await whiteboardsCollection.doc(projectId).update({
        strokes: [...(whiteboard?.strokes || []), newStroke],
        version: (whiteboard?.version || 0) + 1,
        updatedAt: timestamp,
    });

    return getWhiteboardByProject(projectId);
}

/**
 * Add shape to whiteboard
 */
export async function addShape(projectId, shape) {
    const whiteboard = await getWhiteboardByProject(projectId);
    if (!whiteboard) {
        await createWhiteboard(projectId);
    }

    const timestamp = new Date().toISOString();
    const newShape = { ...shape, createdAt: timestamp };

    await whiteboardsCollection.doc(projectId).update({
        shapes: [...(whiteboard?.shapes || []), newShape],
        version: (whiteboard?.version || 0) + 1,
        updatedAt: timestamp,
    });

    return getWhiteboardByProject(projectId);
}

/**
 * Add text to whiteboard
 */
export async function addText(projectId, text) {
    const whiteboard = await getWhiteboardByProject(projectId);
    if (!whiteboard) {
        await createWhiteboard(projectId);
    }

    const timestamp = new Date().toISOString();
    const newText = { ...text, createdAt: timestamp };

    await whiteboardsCollection.doc(projectId).update({
        texts: [...(whiteboard?.texts || []), newText],
        version: (whiteboard?.version || 0) + 1,
        updatedAt: timestamp,
    });

    return getWhiteboardByProject(projectId);
}

/**
 * Add sticky note to whiteboard
 */
export async function addStickyNote(projectId, note) {
    const whiteboard = await getWhiteboardByProject(projectId);
    if (!whiteboard) {
        await createWhiteboard(projectId);
    }

    const timestamp = new Date().toISOString();
    const newNote = { ...note, createdAt: timestamp };

    await whiteboardsCollection.doc(projectId).update({
        stickyNotes: [...(whiteboard?.stickyNotes || []), newNote],
        version: (whiteboard?.version || 0) + 1,
        updatedAt: timestamp,
    });

    return getWhiteboardByProject(projectId);
}

/**
 * Update sticky note content
 */
export async function updateStickyNote(projectId, noteId, content) {
    const whiteboard = await getWhiteboardByProject(projectId);
    if (!whiteboard) {
        throw new Error('Whiteboard not found');
    }

    const stickyNotes = whiteboard.stickyNotes.map(note =>
        note.noteId === noteId ? { ...note, content } : note
    );

    await whiteboardsCollection.doc(projectId).update({
        stickyNotes,
        version: whiteboard.version + 1,
        updatedAt: new Date().toISOString(),
    });

    return getWhiteboardByProject(projectId);
}

/**
 * Clear whiteboard
 */
export async function clearWhiteboard(projectId) {
    const timestamp = new Date().toISOString();

    await whiteboardsCollection.doc(projectId).update({
        strokes: [],
        shapes: [],
        texts: [],
        stickyNotes: [],
        lastCleared: timestamp,
        version: 0,
        updatedAt: timestamp,
    });

    return getWhiteboardByProject(projectId);
}

/**
 * Delete whiteboard
 */
export async function deleteWhiteboard(projectId) {
    await whiteboardsCollection.doc(projectId).delete();
}
