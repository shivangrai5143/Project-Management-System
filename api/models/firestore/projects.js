import { db } from '../lib/firebase-admin.js';

const projectsCollection = db.collection('projects');

/**
 * Create a new project
 */
export async function createProject(projectData) {
    const timestamp = new Date().toISOString();
    const project = {
        name: projectData.name,
        description: projectData.description || '',
        color: projectData.color || '#6366f1',
        icon: projectData.icon || 'folder',
        ownerId: projectData.ownerId,
        members: projectData.members || [],
        status: projectData.status || 'active',
        settings: {
            isPublic: false,
            enableChat: true,
            enableStandups: true,
            ...projectData.settings,
        },
        createdAt: timestamp,
        updatedAt: timestamp,
    };

    const docRef = await projectsCollection.add(project);
    return { id: docRef.id, ...project };
}

/**
 * Get project by ID
 */
export async function getProject(projectId) {
    const doc = await projectsCollection.doc(projectId).get();
    if (!doc.exists) {
        return null;
    }
    return { id: doc.id, ...doc.data() };
}

/**
 * Update project
 */
export async function updateProject(projectId, updates) {
    await projectsCollection.doc(projectId).update({
        ...updates,
        updatedAt: new Date().toISOString(),
    });

    return getProject(projectId);
}

/**
 * Delete project
 */
export async function deleteProject(projectId) {
    await projectsCollection.doc(projectId).delete();
}

/**
 * Get all projects for a user (owned or member of)
 */
export async function getProjectsForUser(userId) {
    // Get projects where user is owner
    const ownedSnapshot = await projectsCollection
        .where('ownerId', '==', userId)
        .where('status', '!=', 'archived')
        .get();

    // Get projects where user is a member
    const memberSnapshot = await projectsCollection
        .where('members', 'array-contains-any', [
            { userId },
        ])
        .where('status', '!=', 'archived')
        .get();

    const projects = new Map();

    // Add owned projects
    ownedSnapshot.docs.forEach(doc => {
        projects.set(doc.id, { id: doc.id, ...doc.data() });
    });

    // Add member projects
    memberSnapshot.docs.forEach(doc => {
        const data = doc.data();
        // Check if user is actually in members array
        if (data.members.some(m => m.userId === userId)) {
            projects.set(doc.id, { id: doc.id, ...data });
        }
    });

    // Sort by updatedAt descending
    return Array.from(projects.values()).sort((a, b) =>
        new Date(b.updatedAt) - new Date(a.updatedAt)
    );
}

/**
 * Add member to project
 */
export async function addMember(projectId, userId, role = 'member') {
    const project = await getProject(projectId);
    if (!project) {
        throw new Error('Project not found');
    }

    const members = project.members || [];
    const existingIndex = members.findIndex(m => m.userId === userId);

    if (existingIndex >= 0) {
        // Update existing member role
        members[existingIndex].role = role;
    } else {
        // Add new member
        members.push({
            userId,
            role,
            joinedAt: new Date().toISOString(),
        });
    }

    await updateProject(projectId, { members });
    return getProject(projectId);
}

/**
 * Remove member from project
 */
export async function removeMember(projectId, userId) {
    const project = await getProject(projectId);
    if (!project) {
        throw new Error('Project not found');
    }

    const members = (project.members || []).filter(m => m.userId !== userId);
    await updateProject(projectId, { members });
    return getProject(projectId);
}
