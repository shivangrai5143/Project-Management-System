import { useState, useEffect } from 'react';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import { useProjects } from '../../context/ProjectContext';
import { PRIORITIES, TASK_STATUSES, DEFAULT_LABELS } from '../../utils/constants';

const TaskForm = ({ task, projectId, onSubmit, onCancel, isLoading }) => {
    const { team, projects } = useProjects();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        status: TASK_STATUSES.TODO,
        priority: PRIORITIES.MEDIUM,
        assigneeId: '',
        projectId: projectId || '',
        dueDate: '',
        labels: [],
    });

    useEffect(() => {
        if (task) {
            setFormData({
                title: task.title || '',
                description: task.description || '',
                status: task.status || TASK_STATUSES.TODO,
                priority: task.priority || PRIORITIES.MEDIUM,
                assigneeId: task.assigneeId || '',
                projectId: task.projectId || projectId || '',
                dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
                labels: task.labels || [],
            });
        }
    }, [task, projectId]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({
            ...formData,
            dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
        });
    };

    const toggleLabel = (labelId) => {
        setFormData(prev => ({
            ...prev,
            labels: prev.labels.includes(labelId)
                ? prev.labels.filter(id => id !== labelId)
                : [...prev.labels, labelId],
        }));
    };

    const priorityOptions = Object.entries(PRIORITIES).map(([key, value]) => ({
        label: key.charAt(0) + key.slice(1).toLowerCase(),
        value,
    }));

    const statusOptions = [
        { label: 'To Do', value: TASK_STATUSES.TODO },
        { label: 'In Progress', value: TASK_STATUSES.IN_PROGRESS },
        { label: 'Review', value: TASK_STATUSES.REVIEW },
        { label: 'Done', value: TASK_STATUSES.DONE },
    ];

    const assigneeOptions = team.map(member => ({
        label: member.name,
        value: member.id,
    }));

    const projectOptions = projects.map(project => ({
        label: project.name,
        value: project.id,
    }));

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <Input
                label="Task Title"
                placeholder="Enter task title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
            />

            <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-300">
                    Description
                </label>
                <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the task..."
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-lg bg-slate-700/50 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                {!projectId && (
                    <Select
                        label="Project"
                        value={formData.projectId}
                        onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                        options={projectOptions}
                        placeholder="Select project"
                        required
                    />
                )}

                <Select
                    label="Status"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    options={statusOptions}
                />

                <Select
                    label="Priority"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    options={priorityOptions}
                />

                <Select
                    label="Assignee"
                    value={formData.assigneeId}
                    onChange={(e) => setFormData({ ...formData, assigneeId: e.target.value })}
                    options={assigneeOptions}
                    placeholder="Unassigned"
                />
            </div>

            <Input
                label="Due Date"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            />

            <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">Labels</label>
                <div className="flex flex-wrap gap-2">
                    {DEFAULT_LABELS.map(label => (
                        <button
                            key={label.id}
                            type="button"
                            onClick={() => toggleLabel(label.id)}
                            className={`
                px-3 py-1.5 rounded-full text-xs font-medium
                transition-all
                ${formData.labels.includes(label.id)
                                    ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-800'
                                    : 'opacity-60 hover:opacity-100'
                                }
              `}
                            style={{
                                backgroundColor: `${label.color}30`,
                                color: label.color,
                            }}
                        >
                            {label.name}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex gap-3 pt-4">
                <Button type="button" variant="ghost" onClick={onCancel} className="flex-1">
                    Cancel
                </Button>
                <Button type="submit" loading={isLoading} className="flex-1">
                    {task ? 'Update Task' : 'Create Task'}
                </Button>
            </div>
        </form>
    );
};

export default TaskForm;
