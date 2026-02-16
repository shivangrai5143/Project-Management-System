import { useState } from 'react';
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import KanbanColumn from './KanbanColumn';
import TaskCard from '../tasks/TaskCard';
import Modal from '../ui/Modal';
import TaskForm from '../tasks/TaskForm';
import { useTasks } from '../../context/TaskContext';
import { KANBAN_COLUMNS, STATUS_CONFIG, TASK_STATUSES } from '../../utils/constants';

const KanbanBoard = ({ projectId }) => {
    const { getTasksByStatus, moveTask, createTask, updateTask, deleteTask } = useTasks();
    const [activeTask, setActiveTask] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [newTaskStatus, setNewTaskStatus] = useState(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragStart = (event) => {
        const { active } = event;
        const task = findTask(active.id);
        setActiveTask(task);
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        setActiveTask(null);

        if (!over) return;

        const activeTask = findTask(active.id);
        if (!activeTask) return;

        // Check if dropped on a column
        if (KANBAN_COLUMNS.includes(over.id)) {
            if (activeTask.status !== over.id) {
                moveTask(active.id, over.id, 0);
            }
        } else {
            // Dropped on another task
            const overTask = findTask(over.id);
            if (overTask && activeTask.status !== overTask.status) {
                moveTask(active.id, overTask.status, overTask.order);
            }
        }
    };

    const findTask = (taskId) => {
        for (const status of KANBAN_COLUMNS) {
            const tasks = getTasksByStatus(projectId, status);
            const task = tasks.find(t => t.id === taskId);
            if (task) return task;
        }
        return null;
    };

    const handleAddTask = (status) => {
        setNewTaskStatus(status);
        setEditingTask(null);
        setIsModalOpen(true);
    };

    const handleEditTask = (task) => {
        setEditingTask(task);
        setNewTaskStatus(null);
        setIsModalOpen(true);
    };

    const handleDeleteTask = (taskId) => {
        if (confirm('Are you sure you want to delete this task?')) {
            deleteTask(taskId);
        }
    };

    const handleSubmitTask = (formData) => {
        if (editingTask) {
            updateTask(editingTask.id, formData);
        } else {
            createTask({
                ...formData,
                projectId,
                status: newTaskStatus || TASK_STATUSES.TODO,
            });
        }
        setIsModalOpen(false);
        setEditingTask(null);
        setNewTaskStatus(null);
    };

    return (
        <>
            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className="flex gap-4 overflow-x-auto pb-4 min-h-[calc(100vh-300px)]">
                    {KANBAN_COLUMNS.map(status => (
                        <KanbanColumn
                            key={status}
                            id={status}
                            title={STATUS_CONFIG[status].label}
                            tasks={getTasksByStatus(projectId, status)}
                            onAddTask={() => handleAddTask(status)}
                            onEditTask={handleEditTask}
                            onDeleteTask={handleDeleteTask}
                        />
                    ))}
                </div>

                <DragOverlay>
                    {activeTask && (
                        <div className="rotate-3 opacity-90">
                            <TaskCard task={activeTask} />
                        </div>
                    )}
                </DragOverlay>
            </DndContext>

            {/* Task Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingTask(null);
                    setNewTaskStatus(null);
                }}
                title={editingTask ? 'Edit Task' : 'Create Task'}
                size="lg"
            >
                <TaskForm
                    task={editingTask}
                    projectId={projectId}
                    onSubmit={handleSubmitTask}
                    onCancel={() => {
                        setIsModalOpen(false);
                        setEditingTask(null);
                        setNewTaskStatus(null);
                    }}
                />
            </Modal>
        </>
    );
};

export default KanbanBoard;
