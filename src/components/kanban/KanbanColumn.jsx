import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import TaskCard from '../tasks/TaskCard';
import { STATUS_CONFIG } from '../../utils/constants';

const KanbanColumn = ({
    id,
    title,
    tasks,
    onAddTask,
    onEditTask,
    onDeleteTask,
    onTaskClick,
}) => {
    const { setNodeRef, isOver } = useDroppable({ id });
    const statusConfig = STATUS_CONFIG[id];

    return (
        <div
            ref={setNodeRef}
            className={`
        flex-shrink-0 w-80
        bg-slate-900/50 rounded-2xl border border-slate-800
        flex flex-col
        transition-colors duration-200
        ${isOver ? 'border-indigo-500/50 bg-indigo-500/5' : ''}
      `}
        >
            {/* Column header */}
            <div className="p-4 border-b border-slate-800">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: statusConfig?.color || '#64748b' }}
                        />
                        <h3 className="font-semibold text-white">{title}</h3>
                        <span className="px-2 py-0.5 rounded-full bg-slate-700 text-xs text-slate-300">
                            {tasks.length}
                        </span>
                    </div>

                    <button
                        onClick={onAddTask}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Tasks container */}
            <div className="flex-1 p-3 space-y-3 overflow-y-auto min-h-[200px]">
                <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                    {tasks.map(task => (
                        <TaskCard
                            key={task.id}
                            task={task}
                            onEdit={onEditTask}
                            onDelete={onDeleteTask}
                            onClick={() => onTaskClick?.(task)}
                        />
                    ))}
                </SortableContext>

                {tasks.length === 0 && (
                    <div className="flex items-center justify-center h-32 text-slate-500 text-sm">
                        No tasks yet
                    </div>
                )}
            </div>
        </div>
    );
};

export default KanbanColumn;
