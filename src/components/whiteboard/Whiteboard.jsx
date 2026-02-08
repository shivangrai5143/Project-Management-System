import { useState, useRef, useEffect, useCallback } from 'react';
import {
    Pencil,
    Eraser,
    Trash2,
    Palette,
    Minus,
    Plus,
    Wifi,
    WifiOff,
    RefreshCw,
    Users,
    Square,
    Circle,
    Type,
    StickyNote,
    Download,
    X
} from 'lucide-react';
import { useWhiteboard } from '../../context/WhiteboardContext';
import { useAuth } from '../../context/AuthContext';

const COLORS = [
    '#ffffff', '#ef4444', '#f97316', '#eab308', '#22c55e',
    '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'
];

const STICKY_COLORS = [
    '#fef08a', // Yellow
    '#bbf7d0', // Green
    '#bfdbfe', // Blue
    '#fecaca', // Pink
    '#fed7aa', // Orange
];

const Whiteboard = ({ projectId }) => {
    const {
        strokes, shapes, texts, stickyNotes,
        isConnected, isSyncing,
        addStroke, addShape, addText, addStickyNote,
        updateStickyNote, deleteElement, clearBoard, initWhiteboard
    } = useWhiteboard();
    const { user } = useAuth();

    const canvasRef = useRef(null);
    const contextRef = useRef(null);
    const containerRef = useRef(null);

    const [tool, setTool] = useState('brush');
    const [color, setColor] = useState('#ffffff');
    const [strokeWidth, setStrokeWidth] = useState(3);
    const [isDrawing, setIsDrawing] = useState(false);
    const [currentPoints, setCurrentPoints] = useState([]);
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

    // Shape drawing state
    const [shapeStart, setShapeStart] = useState(null);
    const [tempShape, setTempShape] = useState(null);

    // Text input state
    const [textInput, setTextInput] = useState({ show: false, x: 0, y: 0, value: '' });

    // Editing sticky note
    const [editingNote, setEditingNote] = useState(null);

    // Initialize whiteboard for project
    useEffect(() => {
        if (projectId) {
            initWhiteboard(projectId);
        }
    }, [projectId, initWhiteboard]);

    // Setup canvas
    useEffect(() => {
        const container = containerRef.current;
        const canvas = canvasRef.current;
        if (!container || !canvas) return;

        const updateSize = () => {
            const rect = container.getBoundingClientRect();
            const width = rect.width;
            const height = rect.height - 10;

            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;

            const dpr = window.devicePixelRatio || 1;
            canvas.width = width * dpr;
            canvas.height = height * dpr;

            const ctx = canvas.getContext('2d');
            ctx.scale(dpr, dpr);
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            contextRef.current = ctx;

            setCanvasSize({ width, height });
        };

        updateSize();
        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
    }, [projectId]);

    // Redraw canvas
    useEffect(() => {
        const ctx = contextRef.current;
        if (!ctx) return;

        ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);

        // Draw strokes
        strokes.forEach(stroke => {
            if (!stroke.points || stroke.points.length < 2) return;
            ctx.beginPath();
            if (stroke.tool === 'eraser') {
                ctx.globalCompositeOperation = 'destination-out';
                ctx.strokeStyle = 'rgba(0,0,0,1)';
            } else {
                ctx.globalCompositeOperation = 'source-over';
                ctx.strokeStyle = stroke.color;
            }
            ctx.lineWidth = stroke.width || 3;
            ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
            for (let i = 1; i < stroke.points.length; i++) {
                ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
            }
            ctx.stroke();
        });

        ctx.globalCompositeOperation = 'source-over';

        // Draw shapes
        shapes.forEach(shape => {
            ctx.strokeStyle = shape.color;
            ctx.lineWidth = shape.strokeWidth || 2;
            ctx.beginPath();

            if (shape.type === 'rectangle') {
                ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
            } else if (shape.type === 'circle') {
                const centerX = shape.x + shape.width / 2;
                const centerY = shape.y + shape.height / 2;
                const radiusX = Math.abs(shape.width) / 2;
                const radiusY = Math.abs(shape.height) / 2;
                ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
                ctx.stroke();
            }
        });

        // Draw temp shape while drawing
        if (tempShape) {
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            if (tempShape.type === 'rectangle') {
                ctx.strokeRect(tempShape.x, tempShape.y, tempShape.width, tempShape.height);
            } else if (tempShape.type === 'circle') {
                ctx.beginPath();
                const centerX = tempShape.x + tempShape.width / 2;
                const centerY = tempShape.y + tempShape.height / 2;
                ctx.ellipse(centerX, centerY, Math.abs(tempShape.width) / 2, Math.abs(tempShape.height) / 2, 0, 0, 2 * Math.PI);
                ctx.stroke();
            }
            ctx.setLineDash([]);
        }

        // Draw texts
        texts.forEach(text => {
            ctx.font = `${text.fontSize || 16}px Inter, sans-serif`;
            ctx.fillStyle = text.color;
            ctx.fillText(text.content, text.x, text.y);
        });

    }, [strokes, shapes, texts, tempShape, canvasSize, color]);

    // Check if point is inside a shape
    const isPointInShape = useCallback((point, shape) => {
        if (shape.type === 'rectangle') {
            return point.x >= shape.x && point.x <= shape.x + shape.width &&
                point.y >= shape.y && point.y <= shape.y + shape.height;
        } else if (shape.type === 'circle') {
            const centerX = shape.x + shape.width / 2;
            const centerY = shape.y + shape.height / 2;
            const radiusX = shape.width / 2;
            const radiusY = shape.height / 2;
            const dx = (point.x - centerX) / radiusX;
            const dy = (point.y - centerY) / radiusY;
            return (dx * dx + dy * dy) <= 1;
        }
        return false;
    }, []);

    // Check if point is near text
    const isPointNearText = useCallback((point, text) => {
        const ctx = contextRef.current;
        if (!ctx) return false;
        ctx.font = `${text.fontSize || 16}px Inter, sans-serif`;
        const metrics = ctx.measureText(text.content);
        return point.x >= text.x && point.x <= text.x + metrics.width &&
            point.y >= text.y - (text.fontSize || 16) && point.y <= text.y;
    }, []);

    // Check eraser against shapes and texts
    const checkEraserCollisions = useCallback((point) => {
        const eraserRadius = strokeWidth * 3;

        // Check shapes
        shapes.forEach(shape => {
            // Check if eraser point is near the shape boundary
            const margin = eraserRadius;
            const expandedShape = {
                ...shape,
                x: shape.x - margin,
                y: shape.y - margin,
                width: shape.width + margin * 2,
                height: shape.height + margin * 2
            };
            if (isPointInShape(point, expandedShape)) {
                deleteElement('shape', shape.shapeId);
            }
        });

        // Check texts
        texts.forEach(text => {
            if (isPointNearText(point, text)) {
                deleteElement('text', text.textId);
            }
        });
    }, [shapes, texts, strokeWidth, isPointInShape, isPointNearText, deleteElement]);

    const getPosition = useCallback((e) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return { x: clientX - rect.left, y: clientY - rect.top };
    }, []);

    // Mouse handlers
    const startDrawing = useCallback((e) => {
        e.preventDefault();
        const pos = getPosition(e);

        if (tool === 'text') {
            setTextInput({ show: true, x: pos.x, y: pos.y, value: '' });
            return;
        }

        if (tool === 'sticky') {
            addStickyNote({
                x: pos.x,
                y: pos.y,
                width: 150,
                height: 100,
                color: STICKY_COLORS[Math.floor(Math.random() * STICKY_COLORS.length)],
                content: ''
            });
            return;
        }

        if (tool === 'rectangle' || tool === 'circle') {
            setShapeStart(pos);
            setTempShape({ type: tool, x: pos.x, y: pos.y, width: 0, height: 0 });
            return;
        }

        setIsDrawing(true);
        setCurrentPoints([pos]);

        const ctx = contextRef.current;
        if (ctx) {
            ctx.beginPath();
            if (tool === 'eraser') {
                ctx.globalCompositeOperation = 'destination-out';
                ctx.strokeStyle = 'rgba(0,0,0,1)';
            } else {
                ctx.globalCompositeOperation = 'source-over';
                ctx.strokeStyle = color;
            }
            ctx.lineWidth = tool === 'eraser' ? strokeWidth * 3 : strokeWidth;
            ctx.moveTo(pos.x, pos.y);
        }
    }, [getPosition, tool, color, strokeWidth, addStickyNote]);

    const draw = useCallback((e) => {
        const pos = getPosition(e);

        if (shapeStart && (tool === 'rectangle' || tool === 'circle')) {
            setTempShape({
                type: tool,
                x: Math.min(shapeStart.x, pos.x),
                y: Math.min(shapeStart.y, pos.y),
                width: Math.abs(pos.x - shapeStart.x),
                height: Math.abs(pos.y - shapeStart.y)
            });
            return;
        }

        if (!isDrawing) return;
        e.preventDefault();

        // Check eraser collisions with shapes and texts
        if (tool === 'eraser') {
            checkEraserCollisions(pos);
        }

        setCurrentPoints(prev => [...prev, pos]);

        const ctx = contextRef.current;
        if (ctx) {
            ctx.lineTo(pos.x, pos.y);
            ctx.stroke();
        }
    }, [isDrawing, getPosition, shapeStart, tool, checkEraserCollisions]);

    const endDrawing = useCallback(() => {
        // Handle shape completion
        if (tempShape && shapeStart) {
            if (tempShape.width > 5 && tempShape.height > 5) {
                addShape({
                    type: tempShape.type,
                    x: tempShape.x,
                    y: tempShape.y,
                    width: tempShape.width,
                    height: tempShape.height,
                    color: color,
                    strokeWidth: 2
                });
            }
            setTempShape(null);
            setShapeStart(null);
            return;
        }

        if (!isDrawing || currentPoints.length < 2) {
            setIsDrawing(false);
            setCurrentPoints([]);
            return;
        }

        const ctx = contextRef.current;
        if (ctx) ctx.globalCompositeOperation = 'source-over';

        addStroke({
            points: currentPoints,
            color: color,
            width: tool === 'eraser' ? strokeWidth * 3 : strokeWidth,
            tool
        });

        setIsDrawing(false);
        setCurrentPoints([]);
    }, [isDrawing, currentPoints, addStroke, addShape, color, strokeWidth, tool, tempShape, shapeStart]);

    // Handle text input submit
    const handleTextSubmit = () => {
        if (textInput.value.trim()) {
            addText({
                content: textInput.value,
                x: textInput.x,
                y: textInput.y,
                fontSize: 16,
                color: color
            });
        }
        setTextInput({ show: false, x: 0, y: 0, value: '' });
    };

    // Export as PNG
    const exportAsPNG = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Create a temporary canvas with white background
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tempCtx = tempCanvas.getContext('2d');

        // Fill with dark background
        tempCtx.fillStyle = '#1e293b';
        tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

        // Draw the original canvas content
        tempCtx.drawImage(canvas, 0, 0);

        // Download
        const link = document.createElement('a');
        link.download = `whiteboard-${projectId}-${Date.now()}.png`;
        link.href = tempCanvas.toDataURL('image/png');
        link.click();
    };

    const handleClear = async () => {
        if (window.confirm('Clear the whiteboard for everyone?')) {
            await clearBoard();
        }
    };

    const adjustWidth = (delta) => {
        setStrokeWidth(prev => Math.min(20, Math.max(1, prev + delta)));
    };

    if (!projectId) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <div className="w-16 h-16 rounded-2xl bg-slate-800/50 flex items-center justify-center mb-4">
                    <Pencil className="w-8 h-8 text-slate-500" />
                </div>
                <p className="text-slate-400 text-sm">Select a project to use the whiteboard</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full" style={{ height: 'calc(100vh - 180px)' }}>
            {/* Toolbar Row 1 */}
            <div className="flex items-center gap-2 mb-2 flex-wrap">
                {/* Drawing Tools */}
                <div className="flex items-center gap-0.5 bg-slate-800/50 rounded-lg p-1">
                    {[
                        { id: 'brush', icon: Pencil, title: 'Brush' },
                        { id: 'eraser', icon: Eraser, title: 'Eraser' },
                        { id: 'rectangle', icon: Square, title: 'Rectangle' },
                        { id: 'circle', icon: Circle, title: 'Circle' },
                        { id: 'text', icon: Type, title: 'Text' },
                        { id: 'sticky', icon: StickyNote, title: 'Sticky Note' },
                    ].map(t => (
                        <button
                            key={t.id}
                            onClick={() => setTool(t.id)}
                            className={`p-1.5 rounded-lg transition-colors ${tool === t.id
                                ? 'bg-indigo-500 text-white'
                                : 'text-slate-400 hover:text-white hover:bg-slate-700'
                                }`}
                            title={t.title}
                        >
                            <t.icon className="w-4 h-4" />
                        </button>
                    ))}
                </div>

                {/* Color Picker */}
                <div className="relative">
                    <button
                        onClick={() => setShowColorPicker(!showColorPicker)}
                        className="flex items-center gap-1 p-1.5 rounded-lg bg-slate-800/50 hover:bg-slate-700 transition-colors"
                    >
                        <div className="w-4 h-4 rounded-full border border-slate-600" style={{ backgroundColor: color }} />
                        <Palette className="w-3 h-3 text-slate-400" />
                    </button>
                    {showColorPicker && (
                        <div className="absolute top-full mt-1 left-0 z-20 p-2 bg-slate-800 rounded-lg border border-slate-700 shadow-xl">
                            <div className="grid grid-cols-5 gap-1">
                                {COLORS.map(c => (
                                    <button
                                        key={c}
                                        onClick={() => { setColor(c); setShowColorPicker(false); }}
                                        className={`w-5 h-5 rounded-full border-2 ${color === c ? 'border-indigo-400' : 'border-slate-600'}`}
                                        style={{ backgroundColor: c }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Stroke Width */}
                <div className="flex items-center gap-0.5 bg-slate-800/50 rounded-lg p-1">
                    <button onClick={() => adjustWidth(-1)} className="p-1 rounded text-slate-400 hover:text-white">
                        <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs text-white w-5 text-center">{strokeWidth}</span>
                    <button onClick={() => adjustWidth(1)} className="p-1 rounded text-slate-400 hover:text-white">
                        <Plus className="w-3 h-3" />
                    </button>
                </div>

                {/* Export & Clear */}
                <button
                    onClick={exportAsPNG}
                    className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                    title="Export as PNG"
                >
                    <Download className="w-4 h-4" />
                </button>
                <button
                    onClick={handleClear}
                    className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30"
                    title="Clear Board"
                >
                    <Trash2 className="w-4 h-4" />
                </button>

                {/* Connection Status */}
                <div className="flex items-center gap-1 ml-auto">
                    {isSyncing && <RefreshCw className="w-3 h-3 text-indigo-400 animate-spin" />}
                    {isConnected ? <Wifi className="w-3 h-3 text-emerald-400" /> : <WifiOff className="w-3 h-3 text-red-400" />}
                </div>
            </div>

            {/* Canvas Container */}
            <div ref={containerRef} className="flex-1 bg-slate-800/30 rounded-xl border border-slate-700 overflow-hidden relative">
                <canvas
                    ref={canvasRef}
                    className="absolute inset-0 cursor-crosshair touch-none"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={endDrawing}
                    onMouseLeave={endDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={endDrawing}
                />

                {/* Sticky Notes Layer */}
                {stickyNotes.map(note => (
                    <div
                        key={note.noteId}
                        className="absolute shadow-lg rounded-lg cursor-move select-none group"
                        style={{
                            left: note.x,
                            top: note.y,
                            width: note.width,
                            minHeight: note.height,
                            backgroundColor: note.color,
                        }}
                    >
                        <button
                            onClick={() => deleteElement('stickyNote', note.noteId)}
                            className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                        >
                            <X className="w-3 h-3" />
                        </button>
                        <textarea
                            value={editingNote === note.noteId ? undefined : note.content}
                            defaultValue={note.content}
                            onChange={(e) => {
                                setEditingNote(note.noteId);
                            }}
                            onBlur={(e) => {
                                updateStickyNote(note.noteId, { content: e.target.value });
                                setEditingNote(null);
                            }}
                            placeholder="Type here..."
                            className="w-full h-full p-2 bg-transparent text-slate-800 text-sm resize-none focus:outline-none placeholder-slate-500"
                            style={{ minHeight: note.height - 10 }}
                        />
                    </div>
                ))}

                {/* Text Input */}
                {textInput.show && (
                    <div className="absolute" style={{ left: textInput.x, top: textInput.y - 10 }}>
                        <input
                            type="text"
                            autoFocus
                            value={textInput.value}
                            onChange={e => setTextInput(prev => ({ ...prev, value: e.target.value }))}
                            onKeyDown={e => { if (e.key === 'Enter') handleTextSubmit(); if (e.key === 'Escape') setTextInput({ show: false, x: 0, y: 0, value: '' }); }}
                            onBlur={handleTextSubmit}
                            className="px-2 py-1 bg-slate-800 border border-slate-600 rounded text-white text-sm focus:outline-none focus:border-indigo-500"
                            placeholder="Type and press Enter"
                        />
                    </div>
                )}

                {/* Empty State */}
                {strokes.length === 0 && shapes.length === 0 && texts.length === 0 && stickyNotes.length === 0 && !isDrawing && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="text-center text-slate-500">
                            <Pencil className="w-10 h-10 mx-auto mb-2 opacity-30" />
                            <p className="text-sm">Start drawing, add shapes, text, or sticky notes</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between mt-1 text-xs text-slate-500">
                <span>{strokes.length + shapes.length + texts.length + stickyNotes.length} elements</span>
                <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" /> Real-time
                </span>
            </div>
        </div>
    );
};

export default Whiteboard;
