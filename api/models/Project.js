import mongoose from 'mongoose';

const ProjectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Project name is required'],
        trim: true,
    },
    description: {
        type: String,
        default: '',
    },
    color: {
        type: String,
        default: '#6366f1', // Indigo
    },
    icon: {
        type: String,
        default: 'folder',
    },
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    members: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        role: {
            type: String,
            enum: ['owner', 'admin', 'member', 'viewer'],
            default: 'member',
        },
        joinedAt: {
            type: Date,
            default: Date.now,
        },
    }],
    status: {
        type: String,
        enum: ['active', 'archived', 'completed'],
        default: 'active',
    },
    settings: {
        isPublic: { type: Boolean, default: false },
        enableChat: { type: Boolean, default: true },
        enableStandups: { type: Boolean, default: true },
    },
}, {
    timestamps: true,
});

// Get projects for a user (owned or member of)
ProjectSchema.statics.getForUser = async function (userId) {
    return this.find({
        $or: [
            { ownerId: userId },
            { 'members.userId': userId },
        ],
        status: { $ne: 'archived' },
    }).sort({ updatedAt: -1 });
};

// Add member to project
ProjectSchema.methods.addMember = async function (userId, role = 'member') {
    const existingMember = this.members.find(m => m.userId.toString() === userId.toString());

    if (existingMember) {
        existingMember.role = role;
    } else {
        this.members.push({ userId, role });
    }

    return this.save();
};

// Remove member from project
ProjectSchema.methods.removeMember = async function (userId) {
    this.members = this.members.filter(m => m.userId.toString() !== userId.toString());
    return this.save();
};

export default mongoose.models.Project || mongoose.model('Project', ProjectSchema);
