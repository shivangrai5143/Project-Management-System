import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, User, MoreVertical, Flag } from 'lucide-react';
import Badge from '../ui/Badge';
import Avatar from '../ui/Avatar';
import { Dropdown, DropdownItem, DropdownDivider } from '../ui/Dropdown';
import { useProjects } from '../../context/ProjectContext';
import { formatDate, isOverdue, isDueSoon } from '../../utils/helpers';
import { PRIORITY_CONFIG, DEFAULT_LABELS } from '../../utils/constants';

const TaskCard = ({ task, onEdit, onDelete, onClick }) => {
    const { getTeamMember } = useProjects();
    const assignee = task.assigneeId ? getTeamMember(task.assigneeId) : null;
    const priorityConfig = PRIORITY_CONFIG[task.priority];

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: task.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const taskLabels = (task.labels || [])
        .map(labelId => DEFAULT_LABELS.find(l => l.id === labelId))
        .filter(Boolean);

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`
        bg-slate-800/80 border border-slate-700/50 rounded-xl p-4
        cursor-grab active:cursor-grabbing
        hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/10
        transition-all duration-200
        ${isDragging ? 'opacity-50 shadow-2xl scale-105' : ''}
      `}
            onClick={onClick}
        >
            {/* Labels */}
            {taskLabels.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                    {taskLabels.map(label => (
                        <Badge key={label.id} size="sm" color={label.color}>
                            {label.name}
                        </Badge>
                    ))}
                </div>
            )}

            {/* Title and menu */}
            <div className="flex items-start justify-between gap-2 mb-2">
                <h4 className="text-sm font-medium text-white flex-1 line-clamp-2">
                    {task.title}
                </h4>
                <Dropdown
                    align="right"
                    trigger={
                        <button
                            onClick={(e) => e.stopPropagation()}
                            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-700 transition-colors flex-shrink-0"
                        >
                            <MoreVertical className="w-4 h-4" />
                        </button>
                    }
                >
                    {(close) => (
                        <>
                            <DropdownItem
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEdit?.(task);
                                    close();
                                }}
                            >
                                Edit Task
                            </DropdownItem>
                            <DropdownDivider />
                            <DropdownItem
                                danger
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete?.(task.id);
                                    close();
                                }}
                            >
                                Delete Task
                            </DropdownItem>
                        </>
                    )}
                </Dropdown>
            </div>

            {/* Description preview */}
            {task.description && (
                <p className="text-xs text-slate-400 mb-3 line-clamp-2">
                    {task.description}
                </p>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-700/50">
                <div className="flex items-center gap-3">
                    {/* Priority */}
                    {priorityConfig && (
                        <div className={`flex items-center gap-1 ${priorityConfig.textColor}`}>
                            <Flag className="w-3 h-3" />
                            <span className="text-xs">{priorityConfig.label}</span>
                        </div>
                    )}

                    {/* Due date */}
                    {task.dueDate && (
                        <div className={`
              flex items-center gap-1 text-xs
              ${isOverdue(task.dueDate) ? 'text-red-400' : ''}
              ${isDueSoon(task.dueDate) && !isOverdue(task.dueDate) ? 'text-amber-400' : ''}
              ${!isOverdue(task.dueDate) && !isDueSoon(task.dueDate) ? 'text-slate-400' : ''}
            `}>
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(task.dueDate)}</span>
                        </div>
                    )}
                </div>

                {/* Assignee */}
                {assignee && (
                    <Avatar name={assignee.name} size="xs" />
                )}
            </div>
        </div>
    );
};

export default TaskCard;
