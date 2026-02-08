import mongoose from 'mongoose';

// Schema for drawing strokes (brush, eraser)
const strokeSchema = new mongoose.Schema({
    strokeId: {
        type: String,
        required: true
    },
    points: [{
        x: Number,
        y: Number
    }],
    color: {
        type: String,
        default: '#ffffff'
    },
    width: {
        type: Number,
        default: 3
    },
    tool: {
        type: String,
        enum: ['brush', 'eraser'],
        default: 'brush'
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    userName: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Schema for shapes (rectangle, circle)
const shapeSchema = new mongoose.Schema({
    shapeId: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['rectangle', 'circle'],
        required: true
    },
    x: Number,
    y: Number,
    width: Number,
    height: Number,
    color: {
        type: String,
        default: '#ffffff'
    },
    fillColor: {
        type: String,
        default: 'transparent'
    },
    strokeWidth: {
        type: Number,
        default: 2
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    userName: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Schema for text elements
const textSchema = new mongoose.Schema({
    textId: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    x: Number,
    y: Number,
    fontSize: {
        type: Number,
        default: 16
    },
    color: {
        type: String,
        default: '#ffffff'
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    userName: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Schema for sticky notes
const stickyNoteSchema = new mongoose.Schema({
    noteId: {
        type: String,
        required: true
    },
    content: {
        type: String,
        default: ''
    },
    x: Number,
    y: Number,
    width: {
        type: Number,
        default: 150
    },
    height: {
        type: Number,
        default: 150
    },
    color: {
        type: String,
        default: '#fef08a' // Yellow
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    userName: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const whiteboardSchema = new mongoose.Schema({
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true,
        unique: true
    },
    strokes: [strokeSchema],
    shapes: [shapeSchema],
    texts: [textSchema],
    stickyNotes: [stickyNoteSchema],
    lastCleared: {
        type: Date,
        default: null
    },
    version: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Index for efficient queries
whiteboardSchema.index({ projectId: 1 });
whiteboardSchema.index({ 'strokes.createdAt': 1 });

const Whiteboard = mongoose.models.Whiteboard || mongoose.model('Whiteboard', whiteboardSchema);

export default Whiteboard;
