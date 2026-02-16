import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { getItem, STORAGE_KEYS } from '../utils/storage';

const WhiteboardContext = createContext();

export const useWhiteboard = () => {
    const context = useContext(WhiteboardContext);
    if (!context) {
        throw new Error('useWhiteboard must be used within a WhiteboardProvider');
    }
    return context;
};

const API_BASE = '/api/whiteboard';
const SYNC_INTERVAL = 1500; // Poll every 1.5 seconds

export const WhiteboardProvider = ({ children }) => {
    // Element states
    const [strokes, setStrokes] = useState([]);
    const [shapes, setShapes] = useState([]);
    const [texts, setTexts] = useState([]);
    const [stickyNotes, setStickyNotes] = useState([]);

    // Connection state
    const [isConnected, setIsConnected] = useState(false);
    const [activeProjectId, setActiveProjectId] = useState(null);
    const [lastSyncTime, setLastSyncTime] = useState(null);
    const [lastCleared, setLastCleared] = useState(null);
    const [version, setVersion] = useState(0);
    const [isSyncing, setIsSyncing] = useState(false);

    // Refs for pending elements
    const syncIntervalRef = useRef(null);
    const pendingStrokesRef = useRef([]);
    const pendingShapesRef = useRef([]);
    const pendingTextsRef = useRef([]);
    const pendingNotesRef = useRef([]);

    // Get auth token
    const getToken = () => {
        const user = getItem(STORAGE_KEYS.USER);
        return user?.token;
    };

    // Generate unique ID
    const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Fetch all elements from server
    const fetchElements = useCallback(async (projectId, since = null) => {
        const token = getToken();
        if (!token || !projectId) return null;

        try {
            let url = `${API_BASE}?projectId=${projectId}`;
            if (since) url += `&since=${since}`;
            if (lastCleared) url += `&lastCleared=${lastCleared}`;

            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Failed to fetch elements');
            return await response.json();
        } catch (error) {
            console.error('Error fetching elements:', error);
            return null;
        }
    }, [lastCleared]);

    // Sync all elements with server
    const syncElements = useCallback(async () => {
        if (!activeProjectId || isSyncing) return;

        setIsSyncing(true);

        try {
            // Push any pending elements
            const hasPending = pendingStrokesRef.current.length > 0 ||
                pendingShapesRef.current.length > 0 ||
                pendingTextsRef.current.length > 0 ||
                pendingNotesRef.current.length > 0;

            if (hasPending) {
                const token = getToken();
                if (token) {
                    const body = {};
                    if (pendingStrokesRef.current.length > 0) {
                        body.strokes = [...pendingStrokesRef.current];
                        pendingStrokesRef.current = [];
                    }
                    if (pendingShapesRef.current.length > 0) {
                        body.shapes = [...pendingShapesRef.current];
                        pendingShapesRef.current = [];
                    }
                    if (pendingTextsRef.current.length > 0) {
                        body.texts = [...pendingTextsRef.current];
                        pendingTextsRef.current = [];
                    }
                    if (pendingNotesRef.current.length > 0) {
                        body.stickyNotes = [...pendingNotesRef.current];
                        pendingNotesRef.current = [];
                    }

                    await fetch(`${API_BASE}?projectId=${activeProjectId}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify(body)
                    });
                }
            }

            // Fetch new elements from server
            const data = await fetchElements(activeProjectId, lastSyncTime);

            if (data) {
                if (data.boardWasCleared) {
                    // Reset all elements
                    setStrokes(data.strokes || []);
                    setShapes(data.shapes || []);
                    setTexts(data.texts || []);
                    setStickyNotes(data.stickyNotes || []);
                    pendingStrokesRef.current = [];
                    pendingShapesRef.current = [];
                    pendingTextsRef.current = [];
                    pendingNotesRef.current = [];
                } else {
                    // Merge new elements
                    if (data.strokes?.length > 0) {
                        setStrokes(prev => {
                            const existingIds = new Set(prev.map(s => s.strokeId));
                            const newItems = data.strokes.filter(s => !existingIds.has(s.strokeId));
                            return [...prev, ...newItems];
                        });
                    }
                    if (data.shapes?.length > 0) {
                        setShapes(prev => {
                            const existingIds = new Set(prev.map(s => s.shapeId));
                            const newItems = data.shapes.filter(s => !existingIds.has(s.shapeId));
                            return [...prev, ...newItems];
                        });
                    }
                    if (data.texts?.length > 0) {
                        setTexts(prev => {
                            const existingIds = new Set(prev.map(t => t.textId));
                            const newItems = data.texts.filter(t => !existingIds.has(t.textId));
                            return [...prev, ...newItems];
                        });
                    }
                    if (data.stickyNotes?.length > 0) {
                        setStickyNotes(prev => {
                            const existingIds = new Set(prev.map(n => n.noteId));
                            const newItems = data.stickyNotes.filter(n => !existingIds.has(n.noteId));
                            return [...prev, ...newItems];
                        });
                    }
                }

                if (data.lastCleared) setLastCleared(data.lastCleared);
                setVersion(data.version);
                setLastSyncTime(Date.now());
                setIsConnected(true);
            }
        } catch (error) {
            console.error('Sync error:', error);
            setIsConnected(false);
        } finally {
            setIsSyncing(false);
        }
    }, [activeProjectId, isSyncing, lastSyncTime, fetchElements]);

    // Add stroke
    const addStroke = useCallback((stroke) => {
        const strokeWithId = {
            ...stroke,
            strokeId: generateId(),
            createdAt: new Date().toISOString()
        };
        setStrokes(prev => [...prev, strokeWithId]);
        pendingStrokesRef.current.push(strokeWithId);
        return strokeWithId;
    }, []);

    // Add shape
    const addShape = useCallback((shape) => {
        const shapeWithId = {
            ...shape,
            shapeId: generateId(),
            createdAt: new Date().toISOString()
        };
        setShapes(prev => [...prev, shapeWithId]);
        pendingShapesRef.current.push(shapeWithId);
        return shapeWithId;
    }, []);

    // Add text
    const addText = useCallback((text) => {
        const textWithId = {
            ...text,
            textId: generateId(),
            createdAt: new Date().toISOString()
        };
        setTexts(prev => [...prev, textWithId]);
        pendingTextsRef.current.push(textWithId);
        return textWithId;
    }, []);

    // Add sticky note
    const addStickyNote = useCallback((note) => {
        const noteWithId = {
            ...note,
            noteId: generateId(),
            createdAt: new Date().toISOString()
        };
        setStickyNotes(prev => [...prev, noteWithId]);
        pendingNotesRef.current.push(noteWithId);
        return noteWithId;
    }, []);

    // Update sticky note content
    const updateStickyNote = useCallback(async (noteId, updates) => {
        // Update locally first
        setStickyNotes(prev => prev.map(n =>
            n.noteId === noteId ? { ...n, ...updates } : n
        ));

        // Send to server
        const token = getToken();
        if (token && activeProjectId) {
            try {
                await fetch(`${API_BASE}?projectId=${activeProjectId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        elementType: 'stickyNote',
                        elementId: noteId,
                        updates
                    })
                });
            } catch (error) {
                console.error('Error updating sticky note:', error);
            }
        }
    }, [activeProjectId]);

    // Delete element
    const deleteElement = useCallback(async (elementType, elementId) => {
        // Remove locally
        switch (elementType) {
            case 'stroke':
                setStrokes(prev => prev.filter(s => s.strokeId !== elementId));
                break;
            case 'shape':
                setShapes(prev => prev.filter(s => s.shapeId !== elementId));
                break;
            case 'text':
                setTexts(prev => prev.filter(t => t.textId !== elementId));
                break;
            case 'stickyNote':
                setStickyNotes(prev => prev.filter(n => n.noteId !== elementId));
                break;
        }

        // Send to server
        const token = getToken();
        if (token && activeProjectId) {
            try {
                await fetch(`${API_BASE}?projectId=${activeProjectId}&elementType=${elementType}&elementId=${elementId}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            } catch (error) {
                console.error('Error deleting element:', error);
            }
        }
    }, [activeProjectId]);

    // Clear the whiteboard
    const clearBoard = useCallback(async () => {
        const token = getToken();
        if (!token || !activeProjectId) return false;

        try {
            const response = await fetch(`${API_BASE}?projectId=${activeProjectId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Failed to clear board');

            const data = await response.json();

            // Clear all local state
            setStrokes([]);
            setShapes([]);
            setTexts([]);
            setStickyNotes([]);
            pendingStrokesRef.current = [];
            pendingShapesRef.current = [];
            pendingTextsRef.current = [];
            pendingNotesRef.current = [];
            setLastCleared(data.lastCleared);
            setVersion(data.version);

            return true;
        } catch (error) {
            console.error('Error clearing board:', error);
            return false;
        }
    }, [activeProjectId]);

    // Initialize whiteboard for a project
    const initWhiteboard = useCallback(async (projectId) => {
        if (!projectId) return;

        setActiveProjectId(projectId);
        setStrokes([]);
        setShapes([]);
        setTexts([]);
        setStickyNotes([]);
        setLastSyncTime(null);
        setLastCleared(null);
        pendingStrokesRef.current = [];
        pendingShapesRef.current = [];
        pendingTextsRef.current = [];
        pendingNotesRef.current = [];

        // Initial fetch
        const data = await fetchElements(projectId);
        if (data) {
            setStrokes(data.strokes || []);
            setShapes(data.shapes || []);
            setTexts(data.texts || []);
            setStickyNotes(data.stickyNotes || []);
            setLastCleared(data.lastCleared);
            setVersion(data.version);
            setLastSyncTime(Date.now());
            setIsConnected(true);
        }
    }, [fetchElements]);

    // Start/stop polling when project changes
    useEffect(() => {
        if (activeProjectId) {
            syncIntervalRef.current = setInterval(syncElements, SYNC_INTERVAL);
        }
        return () => {
            if (syncIntervalRef.current) {
                clearInterval(syncIntervalRef.current);
                syncIntervalRef.current = null;
            }
        };
    }, [activeProjectId, syncElements]);

    return (
        <WhiteboardContext.Provider value={{
            strokes,
            shapes,
            texts,
            stickyNotes,
            isConnected,
            isSyncing,
            version,
            addStroke,
            addShape,
            addText,
            addStickyNote,
            updateStickyNote,
            deleteElement,
            clearBoard,
            initWhiteboard,
            syncElements,
            activeProjectId
        }}>
            {children}
        </WhiteboardContext.Provider>
    );
};
