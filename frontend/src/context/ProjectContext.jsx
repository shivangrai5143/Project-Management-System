import { createContext, useContext, useState, useEffect } from 'react';
import { getItem, setItem, STORAGE_KEYS } from '../utils/storage';
import { projectsApi } from '../utils/api';
import { demoProjects, demoTeam } from '../data/mockData';
import { generateId } from '../utils/helpers';

const ProjectContext = createContext();

export const useProjects = () => {
    const context = useContext(ProjectContext);
    if (!context) {
        throw new Error('useProjects must be used within a ProjectProvider');
    }
    return context;
};

// Check if we should use API or localStorage fallback
const USE_API = false; // Set to true when backend is deployed

export const ProjectProvider = ({ children }) => {
    const [projects, setProjects] = useState([]);
    const [team, setTeam] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadProjects = async () => {
            if (USE_API) {
                try {
                    const data = await projectsApi.getAll();
                    setProjects(data.projects);
                } catch (err) {
                    console.error('Failed to load projects from API:', err);
                    // Fallback to localStorage
                    loadFromLocalStorage();
                }
            } else {
                loadFromLocalStorage();
            }
            setIsLoading(false);
        };

        const loadFromLocalStorage = () => {
            const savedProjects = getItem(STORAGE_KEYS.PROJECTS);
            const savedTeam = getItem(STORAGE_KEYS.TEAM);

            if (savedProjects) {
                setProjects(savedProjects);
            } else {
                setProjects(demoProjects);
                setItem(STORAGE_KEYS.PROJECTS, demoProjects);
            }

            if (savedTeam) {
                setTeam(savedTeam);
            } else {
                setTeam(demoTeam);
                setItem(STORAGE_KEYS.TEAM, demoTeam);
            }
        };

        loadProjects();
    }, []);

    const saveProjects = (newProjects) => {
        setProjects(newProjects);
        setItem(STORAGE_KEYS.PROJECTS, newProjects);
    };

    const createProject = async (projectData) => {
        if (USE_API) {
            try {
                const data = await projectsApi.create(
                    projectData.name,
                    projectData.description,
                    projectData.color,
                    projectData.icon
                );
                const newProject = data.project;
                setProjects(prev => [...prev, newProject]);
                return newProject;
            } catch (err) {
                console.error('Failed to create project:', err);
                throw err;
            }
        } else {
            const newProject = {
                id: generateId(),
                ...projectData,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                status: 'active',
                teamIds: projectData.teamIds || [],
            };

            const updatedProjects = [...projects, newProject];
            saveProjects(updatedProjects);
            return newProject;
        }
    };

    const updateProject = async (id, updates) => {
        if (USE_API) {
            try {
                await projectsApi.update(id, updates);
            } catch (err) {
                console.error('Failed to update project:', err);
            }
        }

        const updatedProjects = projects.map(project =>
            project.id === id
                ? { ...project, ...updates, updatedAt: new Date().toISOString() }
                : project
        );
        saveProjects(updatedProjects);
    };

    const deleteProject = async (id) => {
        if (USE_API) {
            try {
                await projectsApi.delete(id);
            } catch (err) {
                console.error('Failed to delete project:', err);
            }
        }

        const updatedProjects = projects.filter(project => project.id !== id);
        saveProjects(updatedProjects);
    };

    const getProject = (id) => {
        return projects.find(project => project.id === id);
    };

    const getProjectsByUser = (userId) => {
        return projects.filter(project =>
            project.ownerId === userId || project.teamIds?.includes(userId)
        );
    };

    const addTeamMember = (projectId, userId) => {
        const updatedProjects = projects.map(project => {
            if (project.id === projectId && !project.teamIds?.includes(userId)) {
                return {
                    ...project,
                    teamIds: [...(project.teamIds || []), userId],
                    updatedAt: new Date().toISOString(),
                };
            }
            return project;
        });
        saveProjects(updatedProjects);
    };

    const removeTeamMember = (projectId, userId) => {
        const updatedProjects = projects.map(project => {
            if (project.id === projectId) {
                return {
                    ...project,
                    teamIds: (project.teamIds || []).filter(id => id !== userId),
                    updatedAt: new Date().toISOString(),
                };
            }
            return project;
        });
        saveProjects(updatedProjects);
    };

    const getTeamMember = (userId) => {
        return team.find(member => member.id === userId);
    };

    const updateTeamMember = (userId, updates) => {
        const updatedTeam = team.map(member =>
            member.id === userId
                ? { ...member, ...updates }
                : member
        );
        setTeam(updatedTeam);
        setItem(STORAGE_KEYS.TEAM, updatedTeam);
    };

    return (
        <ProjectContext.Provider value={{
            projects,
            team,
            isLoading,
            createProject,
            updateProject,
            deleteProject,
            getProject,
            getProjectsByUser,
            addTeamMember,
            removeTeamMember,
            getTeamMember,
            updateTeamMember,
        }}>
            {children}
        </ProjectContext.Provider>
    );
};
