import { db } from '../../lib/firebase-admin.js';

const usersCollection = db.collection('users');

/**
 * Create a new user in Firestore
 */
export async function createUser(uid, userData) {
    const timestamp = new Date().toISOString();
    const user = {
        uid,
        email: userData.email?.toLowerCase(),
        name: userData.name,
        avatar: userData.avatar || null,
        role: userData.role || 'user',
        gitHubUsername: userData.gitHubUsername || null,
        standupSettings: {
            enabled: true,
            standupTime: '09:00',
            snoozeDuration: 30,
            ...userData.standupSettings,
        },
        createdAt: timestamp,
        updatedAt: timestamp,
    };

    await usersCollection.doc(uid).set(user);
    return user;
}

/**
 * Get user by UID
 */
export async function getUser(uid) {
    const doc = await usersCollection.doc(uid).get();
    if (!doc.exists) {
        return null;
    }
    return { id: doc.id, ...doc.data() };
}

/**
 * Get user by email
 */
export async function getUserByEmail(email) {
    const snapshot = await usersCollection
        .where('email', '==', email.toLowerCase())
        .limit(1)
        .get();

    if (snapshot.empty) {
        return null;
    }

    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() };
}

/**
 * Update user data
 */
export async function updateUser(uid, updates) {
    await usersCollection.doc(uid).update({
        ...updates,
        updatedAt: new Date().toISOString(),
    });

    return getUser(uid);
}

/**
 * Get all users
 */
export async function getAllUsers() {
    const snapshot = await usersCollection.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

/**
 * Delete user
 */
export async function deleteUser(uid) {
    await usersCollection.doc(uid).delete();
}

/**
 * Convert user data to public JSON (without sensitive fields)
 */
export function toPublicJSON(user) {
    return {
        id: user.id || user.uid,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
        gitHubUsername: user.gitHubUsername,
        standupSettings: user.standupSettings,
        createdAt: user.createdAt,
    };
}
