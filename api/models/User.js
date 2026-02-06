import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters'],
        select: false, // Don't include password in queries by default
    },
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
    },
    avatar: {
        type: String,
        default: null,
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },
    gitHubUsername: {
        type: String,
        default: null,
    },
    standupSettings: {
        enabled: { type: Boolean, default: true },
        standupTime: { type: String, default: '09:00' },
        snoozeDuration: { type: Number, default: 30 },
    },
}, {
    timestamps: true,
});

// Hash password before saving
UserSchema.pre('save', async function () {
    if (!this.isModified('password')) return;

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
UserSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Return user without sensitive data
UserSchema.methods.toPublicJSON = function () {
    return {
        id: this._id,
        email: this.email,
        name: this.name,
        avatar: this.avatar,
        role: this.role,
        gitHubUsername: this.gitHubUsername,
        standupSettings: this.standupSettings,
        createdAt: this.createdAt,
    };
};

export default mongoose.models.User || mongoose.model('User', UserSchema);
