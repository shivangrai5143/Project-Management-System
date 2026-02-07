import { createContext, useContext, useState, useCallback } from 'react';
import { useProjects } from './ProjectContext';
import { useTasks } from './TaskContext';
import { generateProjectPlan, analyzeTrends, detectRisks, getQuickInsights } from '../utils/aiAnalysis';

const AIAgentContext = createContext();

export const useAIAgent = () => {
    const context = useContext(AIAgentContext);
    if (!context) {
        throw new Error('useAIAgent must be used within an AIAgentProvider');
    }
    return context;
};

export const AIAgentProvider = ({ children }) => {
    const { projects, team } = useProjects();
    const { tasks } = useTasks();

    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [activeProjectId, setActiveProjectId] = useState(null);
    const [lastAnalysis, setLastAnalysis] = useState(null);

    // Open/close the AI panel
    const openPanel = useCallback((projectId = null) => {
        setActiveProjectId(projectId);
        setIsPanelOpen(true);
    }, []);

    const closePanel = useCallback(() => {
        setIsPanelOpen(false);
        setActiveProjectId(null);
    }, []);

    const togglePanel = useCallback(() => {
        setIsPanelOpen(prev => !prev);
    }, []);

    // Generate project plan suggestions
    const getProjectPlanSuggestions = useCallback((projectId) => {
        const project = projects.find(p => p.id === projectId);
        if (!project) return [];

        const projectTasks = tasks.filter(t => t.projectId === projectId);
        return generateProjectPlan(project, projectTasks);
    }, [projects, tasks]);

    // Get all trends
    const getTrends = useCallback(() => {
        return analyzeTrends(tasks, projects);
    }, [tasks, projects]);

    // Get all risks
    const getRisks = useCallback(() => {
        return detectRisks(tasks, projects, team);
    }, [tasks, projects, team]);

    // Get quick insights for dashboard
    const getInsights = useCallback(() => {
        return getQuickInsights(tasks, projects, team);
    }, [tasks, projects, team]);

    // Run full analysis and cache results
    const runFullAnalysis = useCallback(() => {
        const analysis = {
            trends: analyzeTrends(tasks, projects),
            risks: detectRisks(tasks, projects, team),
            insights: getQuickInsights(tasks, projects, team),
            timestamp: new Date().toISOString()
        };
        setLastAnalysis(analysis);
        return analysis;
    }, [tasks, projects, team]);

    // Get project-specific analysis
    const getProjectAnalysis = useCallback((projectId) => {
        const project = projects.find(p => p.id === projectId);
        if (!project) return null;

        const projectTasks = tasks.filter(t => t.projectId === projectId);

        return {
            project,
            taskStats: {
                total: projectTasks.length,
                todo: projectTasks.filter(t => t.status === 'todo').length,
                inProgress: projectTasks.filter(t => t.status === 'in-progress').length,
                review: projectTasks.filter(t => t.status === 'review').length,
                done: projectTasks.filter(t => t.status === 'done').length,
            },
            completionRate: projectTasks.length > 0
                ? Math.round((projectTasks.filter(t => t.status === 'done').length / projectTasks.length) * 100)
                : 0,
            risks: detectRisks(projectTasks, [project], team),
            suggestions: generateProjectPlan(project, projectTasks)
        };
    }, [projects, tasks, team]);

    return (
        <AIAgentContext.Provider value={{
            // State
            isPanelOpen,
            activeProjectId,
            lastAnalysis,

            // Panel controls
            openPanel,
            closePanel,
            togglePanel,

            // Analysis functions
            getProjectPlanSuggestions,
            getTrends,
            getRisks,
            getInsights,
            runFullAnalysis,
            getProjectAnalysis,
        }}>
            {children}
        </AIAgentContext.Provider>
    );
};
