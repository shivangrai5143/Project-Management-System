import { createContext, useContext, useState, useEffect } from 'react';
import { getItem, setItem, STORAGE_KEYS } from '../utils/storage';
import { tasksApi } from '../utils/api';
import { demoTasks } from '../data/mockData';
import { generateId } from '../utils/helpers';
import { logActivity, ACTIVITY_TYPES } from '../utils/activityTracker';

const TaskContext = createContext();

export const useTasks = () => {
    const context = useContext(TaskContext);
    if (!context) {
        throw new Error('useTasks must be used within a TaskProvider');
    }
    return context;
};

// Check if we should use API or localStorage fallback
const USE_API = false; // Set to true when backend is deployed

export const TaskProvider = ({ children }) => {
    const [tasks, setTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadTasks = async () => {
            if (USE_API) {
                try {
                    const data = await tasksApi.getMyTasks();
                    setTasks(data.tasks);
                } catch (err) {
                    console.error('Failed to load tasks from API:', err);
                    loadFromLocalStorage();
                }
            } else {
                loadFromLocalStorage();
            }
            setIsLoading(false);
        };

        const loadFromLocalStorage = () => {
            const savedTasks = getItem(STORAGE_KEYS.TASKS);
            if (savedTasks) {
                setTasks(savedTasks);
            } else {
                setTasks(demoTasks);
                setItem(STORAGE_KEYS.TASKS, demoTasks);
            }
        };

        loadTasks();
    }, []);

    const saveTasks = (newTasks) => {
        setTasks(newTasks);
        setItem(STORAGE_KEYS.TASKS, newTasks);
    };

    const createTask = async (taskData, userId, userName) => {
        if (USE_API) {
            try {
                const data = await tasksApi.create(taskData);
                const newTask = data.task;
                setTasks(prev => [...prev, newTask]);

                // Log activity for standup bot
                if (userId && userName) {
                    logActivity(userId, userName, ACTIVITY_TYPES.TASK_CREATED, {
                        taskId: newTask.id || newTask._id,
                        taskTitle: newTask.title,
                        projectId: newTask.projectId,
                    });
                }

                return newTask;
            } catch (err) {
                console.error('Failed to create task:', err);
                throw err;
            }
        } else {
            const newTask = {
                id: generateId(),
                ...taskData,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                labels: taskData.labels || [],
                order: tasks.filter(t => t.projectId === taskData.projectId && t.status === taskData.status).length,
            };

            const updatedTasks = [...tasks, newTask];
            saveTasks(updatedTasks);

            // Log activity for standup bot
            if (userId && userName) {
                logActivity(userId, userName, ACTIVITY_TYPES.TASK_CREATED, {
                    taskId: newTask.id,
                    taskTitle: newTask.title,
                    projectId: newTask.projectId,
                });
            }

            return newTask;
        }
    };

    const updateTask = async (id, updates) => {
        if (USE_API) {
            try {
                await tasksApi.update(id, updates);
            } catch (err) {
                console.error('Failed to update task:', err);
            }
        }

        const updatedTasks = tasks.map(task =>
            task.id === id
                ? { ...task, ...updates, updatedAt: new Date().toISOString() }
                : task
        );
        saveTasks(updatedTasks);
    };

    const deleteTask = (id) => {
        const updatedTasks = tasks.filter(task => task.id !== id);
        saveTasks(updatedTasks);
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

        if (USE_API) {
            try {
                await tasksApi.moveTask(taskId, newStatus, newOrder);
            } catch (err) {
                console.error('Failed to move task:', err);
            }
        }

        const updatedTasks = tasks.map(task => {
            if (task.id === taskId) {
                return {
                    ...task,
                    status: newStatus,
                    order: newOrder,
                    updatedAt: new Date().toISOString(),
                };
            }
            return task;
        });
        saveTasks(updatedTasks);

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

    const reorderTasks = (projectId, status, orderedIds) => {
        const updatedTasks = tasks.map(task => {
            if (task.projectId === projectId && task.status === status) {
                const newOrder = orderedIds.indexOf(task.id);
                return newOrder >= 0 ? { ...task, order: newOrder } : task;
            }
            return task;
        });
        saveTasks(updatedTasks);
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
