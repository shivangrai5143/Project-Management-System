'use client';

import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { RBACProvider } from '@/context/RBACContext';
import { ProjectProvider } from '@/context/ProjectContext';
import { TaskProvider } from '@/context/TaskContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { ChatProvider } from '@/context/ChatContext';
import { StandupBotProvider } from '@/context/StandupBotContext';
import { AIAgentProvider } from '@/context/AIAgentContext';
import { WhiteboardProvider } from '@/context/WhiteboardContext';
import { ActivityProvider } from '@/context/ActivityContext';

export function Providers({ children }) {
    return (
        <ThemeProvider>
            <AuthProvider>
                {/* RBACProvider must be inside AuthProvider to read user.role */}
                <RBACProvider>
                    <ProjectProvider>
                        <TaskProvider>
                            <NotificationProvider>
                                <ChatProvider>
                                    <StandupBotProvider>
                                        <AIAgentProvider>
                                            <WhiteboardProvider>
                                                <ActivityProvider>
                                                    {children}
                                                </ActivityProvider>
                                            </WhiteboardProvider>
                                        </AIAgentProvider>
                                    </StandupBotProvider>
                                </ChatProvider>
                            </NotificationProvider>
                        </TaskProvider>
                    </ProjectProvider>
                </RBACProvider>
            </AuthProvider>
        </ThemeProvider>
    );
}
