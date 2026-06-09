'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
    Settings,
    User,
    FolderKanban,
    CheckSquare,
    BarChart3,
    Search,
    LayoutDashboard,
} from 'lucide-react';

import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
    CommandShortcut,
} from '@/components/ui/command';

import { useProjects } from '@/context/ProjectContext';
import { useTasks } from '@/context/TaskContext';

export function CommandPalette({
    className = '',
    compact = false,
    placeholder = 'Search anything...',
}) {
    const [open, setOpen] = React.useState(false);
    const router = useRouter();

    const { projects } = useProjects();
    const { tasks } = useTasks();

    React.useEffect(() => {
        const down = (event) => {
            if (event.key === 'k' && (event.metaKey || event.ctrlKey)) {
                event.preventDefault();
                setOpen(current => !current);
            }
        };

        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, []);

    const runCommand = React.useCallback((command) => {
        setOpen(false);
        command();
    }, []);

    return (
        <>
            {compact ? (
                <button
                    type="button"
                    onClick={() => setOpen(true)}
                    className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700/50 bg-slate-800/50 text-slate-300 transition-colors hover:border-slate-600 hover:text-white ${className}`}
                    aria-label="Open command palette"
                >
                    <Search className="h-4 w-4" />
                </button>
            ) : (
                <button
                    type="button"
                    onClick={() => setOpen(true)}
                    className={`flex h-10 w-full items-center gap-3 rounded-xl border border-slate-700/50 bg-slate-800/50 px-3 text-left text-sm text-slate-400 transition-colors hover:border-slate-600 hover:bg-slate-800 hover:text-white ${className}`}
                >
                    <Search className="h-4 w-4 shrink-0" />
                    <span className="min-w-0 flex-1 truncate">{placeholder}</span>
                    <kbd className="hidden shrink-0 rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-[10px] font-medium text-slate-500 sm:inline-flex">
                        Ctrl K
                    </kbd>
                </button>
            )}

            <CommandDialog open={open} onOpenChange={setOpen}>
                <CommandInput placeholder="Type a command or search projects, tasks..." />
                <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>

                    <CommandGroup heading="Quick Links">
                        <CommandItem onSelect={() => runCommand(() => router.push('/dashboard'))}>
                            <LayoutDashboard className="mr-2 h-4 w-4 text-indigo-400" />
                            <span>Dashboard</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => router.push('/projects'))}>
                            <FolderKanban className="mr-2 h-4 w-4 text-purple-400" />
                            <span>All Projects</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => router.push('/tasks'))}>
                            <CheckSquare className="mr-2 h-4 w-4 text-emerald-400" />
                            <span>My Tasks</span>
                        </CommandItem>
                    </CommandGroup>

                    <CommandSeparator />

                    {projects && projects.length > 0 && (
                        <CommandGroup heading="Projects">
                            {projects.map((project) => (
                                <CommandItem
                                    key={project.id}
                                    onSelect={() => runCommand(() => router.push(`/projects/${project.id}`))}
                                >
                                    <FolderKanban className="mr-2 h-4 w-4 text-slate-500" />
                                    <span>{project.name}</span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    )}

                    <CommandSeparator />

                    {tasks && tasks.length > 0 && (
                        <CommandGroup heading="Tasks">
                            {tasks.slice(0, 5).map((task) => (
                                <CommandItem
                                    key={task.id}
                                    onSelect={() => runCommand(() => router.push('/tasks'))}
                                >
                                    <CheckSquare className="mr-2 h-4 w-4 text-slate-500" />
                                    <span>{task.title}</span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    )}

                    <CommandSeparator />
                    <CommandGroup heading="Settings & Team">
                        <CommandItem onSelect={() => runCommand(() => router.push('/settings'))}>
                            <Settings className="mr-2 h-4 w-4 text-slate-400" />
                            <span>Settings</span>
                            <CommandShortcut>Ctrl S</CommandShortcut>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => router.push('/team'))}>
                            <User className="mr-2 h-4 w-4 text-slate-400" />
                            <span>Team Directory</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => router.push('/analytics'))}>
                            <BarChart3 className="mr-2 h-4 w-4 text-slate-400" />
                            <span>Analytics</span>
                        </CommandItem>
                    </CommandGroup>
                </CommandList>
            </CommandDialog>
        </>
    );
}
