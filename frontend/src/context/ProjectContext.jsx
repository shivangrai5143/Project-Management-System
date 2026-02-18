import { createContext, useContext, useState, useEffect } from 'react';
import { projectsService, usersService } from '../services/firestore';
import { useAuth } from './AuthContext';

const ProjectContext = createContext();

export const useProjects = () => {
    const context = useContext(ProjectContext);
    if (!context) {
        throw new Error('useProjects must be used within a ProjectProvider');
    }
    return context;
};

export const ProjectProvider = ({ children }) => {
    const [projects, setProjects] = useState([]);
    const [team, setTeam] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useAuth();

    // Listen to projects and team in real-time from Firestore
    useEffect(() => {
        if (!user?.id) {
            setProjects([]);
            setTeam([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);

        // Listen to projects where user is owner or team member
        const unsubProjects = projectsService.onProjectsChange(user.id, (projectsList) => {
            setProjects(projectsList);
            setIsLoading(false);
        });

        // Listen to all users for team display
        const unsubUsers = usersService.onUsersChange((usersList) => {
            setTeam(usersList.map(u => ({
                id: u.id,
                name: u.name,
                email: u.email,
                avatar: u.avatar || null,
                role: u.role || 'member',
            })));
        });

        return () => {
            unsubProjects();
            unsubUsers();
        };
    }, [user?.id]);

    const createProject = async (projectData) => {
        try {
            const newProject = await projectsService.create({
                ...projectData,
                ownerId: user?.id,
                teamIds: projectData.teamIds || (user?.id ? [user.id] : []),
            });
            return newProject;
        } catch (err) {
            console.error('Failed to create project:', err);
            throw err;
        }
    };

    const updateProject = async (id, updates) => {
        try {
            await projectsService.update(id, updates);
        } catch (err) {
            console.error('Failed to update project:', err);
        }
    };

    const deleteProject = async (id) => {
        try {
            await projectsService.delete(id);
        } catch (err) {
            console.error('Failed to delete project:', err);
        }
    };

    const getProject = (id) => {
        return projects.find(project => project.id === id);
    };

    const getProjectsByUser = (userId) => {
        return projects.filter(project =>
            project.ownerId === userId || project.teamIds?.includes(userId)
        );
    };

    const addTeamMember = async (projectId, userId) => {
        const project = projects.find(p => p.id === projectId);
        if (project && !project.teamIds?.includes(userId)) {
            const updatedTeamIds = [...(project.teamIds || []), userId];
            await updateProject(projectId, { teamIds: updatedTeamIds });
        }
    };

    const removeTeamMember = async (projectId, userId) => {
        const project = projects.find(p => p.id === projectId);
        if (project) {
            const updatedTeamIds = (project.teamIds || []).filter(id => id !== userId);
            await updateProject(projectId, { teamIds: updatedTeamIds });
        }
    };

    const getTeamMember = (userId) => {
        return team.find(member => member.id === userId);
    };

    const updateTeamMember = async (userId, updates) => {
        try {
            await usersService.update(userId, updates);
        } catch (err) {
            console.error('Failed to update team member:', err);
        }
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
