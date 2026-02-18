/**
 * Firestore Seed Script
 * 
 * Seeds Firebase Firestore with demo data from mockData.js.
 * This is a React component that can be rendered once to populate Firestore.
 * 
 * Usage: Import and render <SeedFirestore /> in your App temporarily,
 * or call seedAllData() from a browser console after importing.
 */

import { db } from '../lib/firebase';
import {
    collection,
    doc,
    setDoc,
    addDoc,
    getDocs,
    query,
    limit,
} from 'firebase/firestore';
import {
    demoProjects,
    demoTasks,
    demoNotifications,
    demoTeam,
} from '../data/mockData';

/**
 * Seed all demo data into Firestore.
 * Checks if data already exists before seeding to avoid duplicates.
 */
export async function seedAllData() {
    const results = {
        projects: 0,
        tasks: 0,
        notifications: 0,
        users: 0,
    };

    try {
        // Check if projects already exist
        const existingProjects = await getDocs(query(collection(db, 'projects'), limit(1)));
        if (!existingProjects.empty) {
            console.log('⚠️ Firestore already has data. Skipping seed to avoid duplicates.');
            console.log('   If you want to re-seed, delete the collections in Firebase Console first.');
            return results;
        }

        console.log('🌱 Seeding Firestore with demo data...');

        // 1. Seed team/users (using their mock IDs as doc IDs for consistency)
        console.log('  📝 Seeding users...');
        for (const member of demoTeam) {
            await setDoc(doc(db, 'users', member.id), {
                uid: member.id,
                name: member.name,
                email: member.email,
                avatar: member.avatar || null,
                role: member.role || 'member',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });
            results.users++;
        }

        // 2. Seed projects (using their mock IDs as doc IDs for consistency)
        console.log('  📁 Seeding projects...');
        for (const project of demoProjects) {
            await setDoc(doc(db, 'projects', project.id), {
                name: project.name,
                description: project.description || '',
                color: project.color || '#6366f1',
                ownerId: project.ownerId,
                teamIds: project.teamIds || [],
                status: project.status || 'active',
                createdAt: project.createdAt,
                updatedAt: project.updatedAt,
            });
            results.projects++;
        }

        // 3. Seed tasks (using their mock IDs as doc IDs for consistency)
        console.log('  ✅ Seeding tasks...');
        for (const task of demoTasks) {
            await setDoc(doc(db, 'tasks', task.id), {
                projectId: task.projectId,
                title: task.title,
                description: task.description || '',
                status: task.status || 'todo',
                priority: task.priority || 'medium',
                assigneeId: task.assigneeId || null,
                createdBy: task.createdBy || null,
                labels: task.labels || [],
                order: task.order || 0,
                dueDate: task.dueDate || null,
                createdAt: task.createdAt,
                updatedAt: task.updatedAt,
            });
            results.tasks++;
        }

        // 4. Seed notifications
        console.log('  🔔 Seeding notifications...');
        for (const notif of demoNotifications) {
            await setDoc(doc(db, 'notifications', notif.id), {
                userId: notif.userId,
                type: notif.type || 'info',
                title: notif.title,
                message: notif.message,
                read: notif.read || false,
                createdAt: notif.createdAt,
            });
            results.notifications++;
        }

        console.log('✅ Seeding complete!');
        console.log(`   Users: ${results.users}`);
        console.log(`   Projects: ${results.projects}`);
        console.log(`   Tasks: ${results.tasks}`);
        console.log(`   Notifications: ${results.notifications}`);

        return results;
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        throw error;
    }
}

/**
 * React component to seed Firestore with demo data.
 * Renders a button that triggers the seed process.
 */
export default function SeedFirestore() {
    const handleSeed = async () => {
        try {
            const results = await seedAllData();
            alert(`Seeding complete!\n\nUsers: ${results.users}\nProjects: ${results.projects}\nTasks: ${results.tasks}\nNotifications: ${results.notifications}`);
        } catch (error) {
            alert(`Seeding failed: ${error.message}`);
        }
    };

    return (
        <div style={{
            padding: '20px',
            textAlign: 'center',
            background: '#1a1a2e',
            color: '#e0e0e0',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
        }}>
            <h2>🌱 Firestore Data Seeder</h2>
            <p>Click the button below to seed Firestore with demo data.</p>
            <p style={{ fontSize: '14px', color: '#999' }}>
                This will add demo projects, tasks, users, and notifications.
                <br />It will NOT overwrite existing data — if data exists, seeding is skipped.
            </p>
            <button
                onClick={handleSeed}
                style={{
                    padding: '12px 32px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                }}
                onMouseOver={e => e.target.style.transform = 'scale(1.05)'}
                onMouseOut={e => e.target.style.transform = 'scale(1)'}
            >
                Seed Firestore
            </button>
        </div>
    );
}
