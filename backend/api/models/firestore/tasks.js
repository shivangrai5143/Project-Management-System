import { db } from '../../lib/firebase-admin.js';

const tasksCollection = db.collection('tasks');

/**
 * Create a new task
 */
export async function createTask(taskData) {
    const timestamp = new Date().toISOString();
    const task = {
        title: taskData.title,
        description: taskData.description || '',
        projectId: taskData.projectId,
        assigneeId: taskData.assigneeId || null,
        creatorId: taskData.creatorId,
        status: taskData.status || 'todo',
        priority: taskData.priority || 'medium',
        labels: taskData.labels || [],
        dueDate: taskData.dueDate || null,
        order: taskData.order || 0,
        completedAt: null,
        createdAt: timestamp,
        updatedAt: timestamp,
    };

    const docRef = await tasksCollection.add(task);
    return { id: docRef.id, ...task };
}

/**
 * Get task by ID
 */
export async function getTask(taskId) {
    const doc = await tasksCollection.doc(taskId).get();
    if (!doc.exists) {
        return null;
    }
    return { id: doc.id, ...doc.data() };
}

/**
 * Update task
 */
export async function updateTask(taskId, updates) {
    const updateData = {
        ...updates,
        updatedAt: new Date().toISOString(),
    };

    // If status is being changed to 'done', set completedAt
    if (updates.status === 'done' && !updates.completedAt) {
        updateData.completedAt = new Date().toISOString();
    } else if (updates.status && updates.status !== 'done') {
        updateData.completedAt = null;
    }

    await tasksCollection.doc(taskId).update(updateData);
    return getTask(taskId);
}

/**
 * Delete task
 */
export async function deleteTask(taskId) {
    await tasksCollection.doc(taskId).delete();
}

/**
 * Get tasks by project
 */
export async function getTasksByProject(projectId, status = null) {
    let query = tasksCollection.where('projectId', '==', projectId);

    if (status) {
        query = query.where('status', '==', status);
    }

    const snapshot = await query.orderBy('order').orderBy('createdAt', 'desc').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

/**
 * Get tasks assigned to a user
 */
export async function getTasksByAssignee(userId) {
    const snapshot = await tasksCollection
        .where('assigneeId', '==', userId)
        .where('status', '!=', 'done')
        .get();

    const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Sort by dueDate and priority
    return tasks.sort((a, b) => {
        // First sort by due date
        if (a.dueDate && b.dueDate) {
            const dateCompare = new Date(a.dueDate) - new Date(b.dueDate);
            if (dateCompare !== 0) return dateCompare;
        } else if (a.dueDate) {
            return -1;
        } else if (b.dueDate) {
            return 1;
        }

        // Then by priority
        const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
        return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
    });
}

/**
 * Move task to new status with order
 */
export async function moveTask(taskId, newStatus, order = 0) {
    return updateTask(taskId, { status: newStatus, order });
}

/**
 * Mark task as complete
 */
export async function completeTask(taskId) {
    return updateTask(taskId, {
        status: 'done',
        completedAt: new Date().toISOString(),
    });
}
