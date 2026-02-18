import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { whiteboardsService } from '../services/firestore';
import { useAuth } from './AuthContext';

const WhiteboardContext = createContext();

export const useWhiteboard = () => {
    const context = useContext(WhiteboardContext);
    if (!context) {
        throw new Error('useWhiteboard must be used within a WhiteboardProvider');
    }
    return context;
};

export const WhiteboardProvider = ({ children }) => {
    // Element states
    const [strokes, setStrokes] = useState([]);
    const [shapes, setShapes] = useState([]);
    const [texts, setTexts] = useState([]);
    const [stickyNotes, setStickyNotes] = useState([]);

    // Connection state
    const [isConnected, setIsConnected] = useState(false);
    const [activeProjectId, setActiveProjectId] = useState(null);
    const [version, setVersion] = useState(0);
    const [isSyncing, setIsSyncing] = useState(false);

    // Ref for the Firestore unsubscribe function
    const unsubRef = useRef(null);
    // Ref to track if we should skip the next snapshot (to avoid echo)
    const skipNextSnapshot = useRef(false);
    const { user } = useAuth();

    // Generate unique ID
    const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Save current state to Firestore
    const saveToFirestore = useCallback(async (updates) => {
        if (!activeProjectId) return;
        setIsSyncing(true);
        skipNextSnapshot.current = true;
        try {
            await whiteboardsService.update(activeProjectId, updates);
            setIsConnected(true);
        } catch (error) {
            console.error('Error saving to Firestore:', error);
            setIsConnected(false);
        } finally {
            setIsSyncing(false);
        }
    }, [activeProjectId]);

    // Add stroke
    const addStroke = useCallback((stroke) => {
        const strokeWithId = {
            ...stroke,
            strokeId: generateId(),
            createdAt: new Date().toISOString()
        };
        setStrokes(prev => {
            const updated = [...prev, strokeWithId];
            saveToFirestore({ strokes: updated });
            return updated;
        });
        return strokeWithId;
    }, [saveToFirestore]);

    // Add shape
    const addShape = useCallback((shape) => {
        const shapeWithId = {
            ...shape,
            shapeId: generateId(),
            createdAt: new Date().toISOString()
        };
        setShapes(prev => {
            const updated = [...prev, shapeWithId];
            saveToFirestore({ shapes: updated });
            return updated;
        });
        return shapeWithId;
    }, [saveToFirestore]);

    // Add text
    const addText = useCallback((text) => {
        const textWithId = {
            ...text,
            textId: generateId(),
            createdAt: new Date().toISOString()
        };
        setTexts(prev => {
            const updated = [...prev, textWithId];
            saveToFirestore({ texts: updated });
            return updated;
        });
        return textWithId;
    }, [saveToFirestore]);

    // Add sticky note
    const addStickyNote = useCallback((note) => {
        const noteWithId = {
            ...note,
            noteId: generateId(),
            createdAt: new Date().toISOString()
        };
        setStickyNotes(prev => {
            const updated = [...prev, noteWithId];
            saveToFirestore({ stickyNotes: updated });
            return updated;
        });
        return noteWithId;
    }, [saveToFirestore]);

    // Update sticky note content
    const updateStickyNote = useCallback(async (noteId, updates) => {
        setStickyNotes(prev => {
            const updated = prev.map(n =>
                n.noteId === noteId ? { ...n, ...updates } : n
            );
            saveToFirestore({ stickyNotes: updated });
            return updated;
        });
    }, [saveToFirestore]);

    // Delete element
    const deleteElement = useCallback(async (elementType, elementId) => {
        switch (elementType) {
            case 'stroke':
                setStrokes(prev => {
                    const updated = prev.filter(s => s.strokeId !== elementId);
                    saveToFirestore({ strokes: updated });
                    return updated;
                });
                break;
            case 'shape':
                setShapes(prev => {
                    const updated = prev.filter(s => s.shapeId !== elementId);
                    saveToFirestore({ shapes: updated });
                    return updated;
                });
                break;
            case 'text':
                setTexts(prev => {
                    const updated = prev.filter(t => t.textId !== elementId);
                    saveToFirestore({ texts: updated });
                    return updated;
                });
                break;
            case 'stickyNote':
                setStickyNotes(prev => {
                    const updated = prev.filter(n => n.noteId !== elementId);
                    saveToFirestore({ stickyNotes: updated });
                    return updated;
                });
                break;
        }
    }, [saveToFirestore]);

    // Clear the whiteboard
    const clearBoard = useCallback(async () => {
        if (!activeProjectId) return false;

        try {
            await whiteboardsService.clear(activeProjectId);
            setStrokes([]);
            setShapes([]);
            setTexts([]);
            setStickyNotes([]);
            setVersion(0);
            return true;
        } catch (error) {
            console.error('Error clearing board:', error);
            return false;
        }
    }, [activeProjectId]);

    // Initialize whiteboard for a project
    const initWhiteboard = useCallback(async (projectId) => {
        if (!projectId) return;

        // Cleanup previous listener
        if (unsubRef.current) {
            unsubRef.current();
            unsubRef.current = null;
        }

        setActiveProjectId(projectId);
        setStrokes([]);
        setShapes([]);
        setTexts([]);
        setStickyNotes([]);

        try {
            // Get or create the whiteboard document
            await whiteboardsService.getOrCreate(projectId);

            // Set up real-time listener
            const unsub = whiteboardsService.onWhiteboardChange(projectId, (data) => {
                if (skipNextSnapshot.current) {
                    skipNextSnapshot.current = false;
                    return;
                }

                if (data) {
                    setStrokes(data.strokes || []);
                    setShapes(data.shapes || []);
                    setTexts(data.texts || []);
                    setStickyNotes(data.stickyNotes || []);
                    setVersion(data.version || 0);
                    setIsConnected(true);
                }
            });

            unsubRef.current = unsub;
        } catch (error) {
            console.error('Error initializing whiteboard:', error);
            setIsConnected(false);
        }
    }, []);

    // Sync is now handled by Firestore onSnapshot — this is a no-op for compatibility
    const syncElements = useCallback(() => {
        // Real-time sync handled by Firestore listener
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (unsubRef.current) {
                unsubRef.current();
            }
        };
    }, []);

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
