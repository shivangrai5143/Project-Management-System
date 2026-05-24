'use client';

import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { ProjectProvider } from '@/context/ProjectContext';
import { TaskProvider } from '@/context/TaskContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { ChatProvider } from '@/context/ChatContext';
import { StandupBotProvider } from '@/context/StandupBotContext';
import { AIAgentProvider } from '@/context/AIAgentContext';
import { WhiteboardProvider } from '@/context/WhiteboardContext';

export function Providers({ children }) {
    return (
        <ThemeProvider>
            <AuthProvider>
                <ProjectProvider>
                    <TaskProvider>
                        <NotificationProvider>
                            <ChatProvider>
                                <StandupBotProvider>
                                    <AIAgentProvider>
                                        <WhiteboardProvider>
                                            {children}
                                        </WhiteboardProvider>
                                    </AIAgentProvider>
                                </StandupBotProvider>
                            </ChatProvider>
                        </NotificationProvider>
                    </TaskProvider>
                </ProjectProvider>
            </AuthProvider>
        </ThemeProvider>
    );
}
