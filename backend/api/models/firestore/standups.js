import { db } from '../../lib/firebase-admin.js';

const standupsCollection = db.collection('standups');

/**
 * Create a new standup
 */
export async function createStandup(standupData) {
    const timestamp = new Date().toISOString();
    const standup = {
        userId: standupData.userId,
        userName: standupData.userName,
        response: standupData.response,
        selectedSuggestions: standupData.selectedSuggestions || [],
        allSuggestions: standupData.allSuggestions || [],
        projectId: standupData.projectId || null,
        mood: standupData.mood || null,
        blockers: standupData.blockers || null,
        createdAt: timestamp,
        updatedAt: timestamp,
    };

    const docRef = await standupsCollection.add(standup);
    return { id: docRef.id, ...standup };
}

/**
 * Get standup by ID
 */
export async function getStandup(standupId) {
    const doc = await standupsCollection.doc(standupId).get();
    if (!doc.exists) {
        return null;
    }
    return { id: doc.id, ...doc.data() };
}

/**
 * Get today's standup for a user
 */
export async function getTodayStandup(userId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const snapshot = await standupsCollection
        .where('userId', '==', userId)
        .where('createdAt', '>=', today.toISOString())
        .where('createdAt', '<', tomorrow.toISOString())
        .limit(1)
        .get();

    if (snapshot.empty) {
        return null;
    }

    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() };
}

/**
 * Get user's standup history
 */
export async function getStandupHistory(userId, limit = 30) {
    const snapshot = await standupsCollection
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get();

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

/**
 * Get team standups for a project on a specific date
 */
export async function getTeamStandups(projectId, date = new Date()) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const snapshot = await standupsCollection
        .where('projectId', '==', projectId)
        .where('createdAt', '>=', startOfDay.toISOString())
        .where('createdAt', '<=', endOfDay.toISOString())
        .get();

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
