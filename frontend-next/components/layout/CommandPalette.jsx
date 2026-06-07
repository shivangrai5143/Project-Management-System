'use client';

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  Settings,
  User,
  FolderKanban,
  CheckSquare,
  BarChart3,
  Search,
  LayoutDashboard
} from "lucide-react"

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"

import { useProjects } from "@/context/ProjectContext"
import { useTasks } from "@/context/TaskContext"

export function CommandPalette() {
  const [open, setOpen] = React.useState(false)
  const router = useRouter()
  
  const { projects } = useProjects()
  const { tasks } = useTasks()

  React.useEffect(() => {
    const down = (e) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const runCommand = React.useCallback((command) => {
    setOpen(false)
    command()
  }, [])

  return (
    <>
      <button 
        onClick={() => setOpen(true)}
        className="hidden md:flex items-center gap-2 px-3 py-1.5 text-sm text-slate-400 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 rounded-md transition-all w-64 max-w-sm ml-4 shadow-sm group"
      >
        <Search className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
        <span className="group-hover:text-white transition-colors">Search anything...</span>
        <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-slate-700 bg-slate-800 px-1.5 font-mono text-[10px] font-medium text-slate-400 opacity-100">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

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
              <CommandShortcut>⌘S</CommandShortcut>
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
  )
}
