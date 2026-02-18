import { createContext, useContext, useState, useEffect } from 'react';
import { tasksService } from '../services/firestore';
import { logActivity, ACTIVITY_TYPES } from '../utils/activityTracker';
import { useAuth } from './AuthContext';

const TaskContext = createContext();

export const useTasks = () => {
    const context = useContext(TaskContext);
    if (!context) {
        throw new Error('useTasks must be used within a TaskProvider');
    }
    return context;
};

export const TaskProvider = ({ children }) => {
    const [tasks, setTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useAuth();

    // Listen to tasks in real-time from Firestore
    useEffect(() => {
        if (!user?.id) {
            setTasks([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);

        const unsub = tasksService.onTasksChange((tasksList) => {
            setTasks(tasksList);
            setIsLoading(false);
        });

        return () => unsub();
    }, [user?.id]);

    const createTask = async (taskData, userId, userName) => {
        try {
            const newTask = await tasksService.create({
                ...taskData,
                createdBy: userId || user?.id,
                order: tasks.filter(t => t.projectId === taskData.projectId && t.status === taskData.status).length,
            });

            // Log activity for standup bot
            if (userId && userName) {
                logActivity(userId, userName, ACTIVITY_TYPES.TASK_CREATED, {
                    taskId: newTask.id,
                    taskTitle: newTask.title,
                    projectId: newTask.projectId,
                });
            }

            return newTask;
        } catch (err) {
            console.error('Failed to create task:', err);
            throw err;
        }
    };

    const updateTask = async (id, updates) => {
        try {
            await tasksService.update(id, updates);
        } catch (err) {
            console.error('Failed to update task:', err);
        }
    };

    const deleteTask = async (id) => {
        try {
            await tasksService.delete(id);
        } catch (err) {
            console.error('Failed to delete task:', err);
        }
    };

    const getTask = (id) => {
        return tasks.find(task => task.id === id);
    };

    const getTasksByProject = (projectId) => {
        return tasks.filter(task => task.projectId === projectId);
    };

    const getTasksByStatus = (projectId, status) => {
        return tasks
            .filter(task => task.projectId === projectId && task.status === status)
            .sort((a, b) => a.order - b.order);
    };

    const getTasksByAssignee = (assigneeId) => {
        return tasks.filter(task => task.assigneeId === assigneeId);
    };

    const moveTask = async (taskId, newStatus, newOrder, userId, userName) => {
        const movedTask = tasks.find(t => t.id === taskId);
        const oldStatus = movedTask?.status;

        try {
            await tasksService.update(taskId, {
                status: newStatus,
                order: newOrder,
            });
        } catch (err) {
            console.error('Failed to move task:', err);
        }

        // Log activity for standup bot
        if (userId && userName && movedTask) {
            if (newStatus === 'done') {
                logActivity(userId, userName, ACTIVITY_TYPES.TASK_COMPLETED, {
                    taskId: movedTask.id,
                    taskTitle: movedTask.title,
                    projectId: movedTask.projectId,
                });
            } else if (oldStatus !== newStatus) {
                logActivity(userId, userName, ACTIVITY_TYPES.TASK_MOVED, {
                    taskId: movedTask.id,
                    taskTitle: movedTask.title,
                    projectId: movedTask.projectId,
                    oldStatus,
                    newStatus,
                });
            }
        }
    };

    const reorderTasks = async (projectId, status, orderedIds) => {
        // Update order for each task in the list
        const updates = orderedIds.map((taskId, index) =>
            tasksService.update(taskId, { order: index })
        );
        try {
            await Promise.all(updates);
        } catch (err) {
            console.error('Failed to reorder tasks:', err);
        }
    };

    const getTaskStats = (projectId) => {
        const projectTasks = projectId
            ? tasks.filter(t => t.projectId === projectId)
            : tasks;

        return {
            total: projectTasks.length,
            todo: projectTasks.filter(t => t.status === 'todo').length,
            inProgress: projectTasks.filter(t => t.status === 'in-progress').length,
            review: projectTasks.filter(t => t.status === 'review').length,
            done: projectTasks.filter(t => t.status === 'done').length,
            overdue: projectTasks.filter(t => {
                if (!t.dueDate || t.status === 'done') return false;
                return new Date(t.dueDate) < new Date();
            }).length,
        };
    };

    return (
        <TaskContext.Provider value={{
            tasks,
            isLoading,
            createTask,
            updateTask,
            deleteTask,
            getTask,
            getTasksByProject,
            getTasksByStatus,
            getTasksByAssignee,
            moveTask,
            reorderTasks,
            getTaskStats,
        }}>
            {children}
        </TaskContext.Provider>
    );
};
