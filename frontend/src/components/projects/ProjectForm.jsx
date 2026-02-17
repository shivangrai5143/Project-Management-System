import { useState, useEffect } from 'react';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import { PROJECT_COLORS } from '../../utils/constants';

const ProjectForm = ({ project, onSubmit, onCancel, isLoading }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        color: PROJECT_COLORS[0],
    });

    useEffect(() => {
        if (project) {
            setFormData({
                name: project.name || '',
                description: project.description || '',
                color: project.color || PROJECT_COLORS[0],
            });
        }
    }, [project]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <Input
                label="Project Name"
                placeholder="Enter project name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
            />

            <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-300">
                    Description
                </label>
                <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe your project..."
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-lg bg-slate-700/50 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                />
            </div>

            <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-300">
                    Color
                </label>
                <div className="flex flex-wrap gap-2">
                    {PROJECT_COLORS.map((color) => (
                        <button
                            key={color}
                            type="button"
                            onClick={() => setFormData({ ...formData, color })}
                            className={`
                w-8 h-8 rounded-full transition-all
                ${formData.color === color
                                    ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-800 scale-110'
                                    : 'hover:scale-110'
                                }
              `}
                            style={{ backgroundColor: color }}
                        />
                    ))}
                </div>
            </div>

            <div className="flex gap-3 pt-4">
                <Button type="button" variant="ghost" onClick={onCancel} className="flex-1">
                    Cancel
                </Button>
                <Button type="submit" loading={isLoading} className="flex-1">
                    {project ? 'Update Project' : 'Create Project'}
                </Button>
            </div>
        </form>
    );
};

export default ProjectForm;
