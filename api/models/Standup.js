import mongoose from 'mongoose';

const StandupSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    userName: {
        type: String,
        required: true,
    },
    response: {
        type: String,
        required: true,
    },
    selectedSuggestions: [{
        type: {
            type: String,
        },
        icon: String,
        text: String,
    }],
    allSuggestions: [{
        type: {
            type: String,
        },
        icon: String,
        text: String,
    }],
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        default: null,
    },
    mood: {
        type: String,
        enum: ['great', 'good', 'okay', 'struggling'],
        default: null,
    },
    blockers: {
        type: String,
        default: null,
    },
}, {
    timestamps: true,
});

// Get today's standup for a user
StandupSchema.statics.getTodayStandup = async function (userId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.findOne({
        userId,
        createdAt: {
            $gte: today,
            $lt: tomorrow,
        },
    });
};

// Get user's standup history
StandupSchema.statics.getHistory = async function (userId, limit = 30) {
    return this.find({ userId })
        .sort({ createdAt: -1 })
        .limit(limit);
};

// Get team standups for a project
StandupSchema.statics.getTeamStandups = async function (projectId, date = new Date()) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return this.find({
        projectId,
        createdAt: {
            $gte: startOfDay,
            $lte: endOfDay,
        },
    }).populate('userId', 'name avatar');
};

export default mongoose.models.Standup || mongoose.model('Standup', StandupSchema);
