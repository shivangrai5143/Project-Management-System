import mongoose from 'mongoose';

const TaskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Task title is required'],
        trim: true,
    },
    description: {
        type: String,
        default: '',
    },
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true,
        index: true,
    },
    assigneeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },
    creatorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    status: {
        type: String,
        enum: ['backlog', 'todo', 'in-progress', 'review', 'done'],
        default: 'todo',
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium',
    },
    labels: [{
        type: String,
    }],
    dueDate: {
        type: Date,
        default: null,
    },
    order: {
        type: Number,
        default: 0,
    },
    completedAt: {
        type: Date,
        default: null,
    },
}, {
    timestamps: true,
});

// Get tasks by project
TaskSchema.statics.getByProject = async function (projectId, status = null) {
    const query = { projectId };
    if (status) query.status = status;

    return this.find(query)
        .populate('assigneeId', 'name avatar')
        .sort({ order: 1, createdAt: -1 });
};

// Get tasks assigned to user
TaskSchema.statics.getByAssignee = async function (userId) {
    return this.find({ assigneeId: userId, status: { $ne: 'done' } })
        .populate('projectId', 'name color')
        .sort({ dueDate: 1, priority: -1 });
};

// Mark task as complete
TaskSchema.methods.complete = async function () {
    this.status = 'done';
    this.completedAt = new Date();
    return this.save();
};

// Move task to new status
TaskSchema.methods.moveTo = async function (newStatus, order = 0) {
    this.status = newStatus;
    this.order = order;

    if (newStatus === 'done') {
        this.completedAt = new Date();
    } else {
        this.completedAt = null;
    }

    return this.save();
};

export default mongoose.models.Task || mongoose.model('Task', TaskSchema);
