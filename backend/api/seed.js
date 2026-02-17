import mongoose from 'mongoose';

// Import models
import User from './models/User.js';
import Project from './models/Project.js';
import Task from './models/Task.js';

// MongoDB Atlas connection string
// eslint-disable-next-line no-undef
const MONGODB_URI = process.env.MONGODB_URI ;

// Avatar generator
const AVATAR_STYLE = 'dicebear-bottts';
const avatarGenerators = {
    initials: (name) => `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=128&bold=true`,
    'dicebear-avataaars': (name) => `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
    'dicebear-bottts': (name) => `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`,
    'dicebear-pixel': (name) => `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(name)}`,
    'dicebear-lorelei': (name) => `https://api.dicebear.com/7.x/lorelei/svg?seed=${encodeURIComponent(name)}`,
};
const getUserAvatar = (name) => avatarGenerators[AVATAR_STYLE](name);

// Demo users data
const demoUsersData = [
    {
        name: 'Shivang Rai',
        email: 'raishivang69@gmail.com',
        password: 'password123',
        role: 'admin',
    },
    {
        name: 'Anuj Yadav',
        email: 'anujyad12@gmail.com',
        password: 'password123',
        role: 'admin',
    },
    {
        name: 'Vivek Yadav',
        email: 'vivek123@gmail.com',
        password: 'password123',
        role: 'user',
    },
    {
        name: 'Sachin Singh',
        email: 'sachin198@gmail.com',
        password: 'password123',
        role: 'user',
    },
    {
        name: 'Suraj Maurya',
        email: 'suraj8@gmail.com',
        password: 'password123',
        role: 'user',
    },
];

// Demo projects data (will be populated with actual user IDs after users are created)
const demoProjectsData = [
    {
        name: 'Website Redesign',
        description: 'Complete overhaul of the company website with modern design and improved UX.',
        color: '#667eea',
        status: 'active',
    },
    {
        name: 'Mobile App Development',
        description: 'Build a cross-platform mobile application for our customers.',
        color: '#f5576c',
        status: 'active',
    },
    {
        name: 'Marketing Campaign',
        description: 'Q1 2026 marketing campaign planning and execution.',
        color: '#43e97b',
        status: 'active',
    },
];

// Demo tasks data (indices reference users and projects arrays)
const demoTasksData = [
    // Website Redesign tasks (project index 0)
    {
        projectIndex: 0,
        title: 'Design homepage mockup',
        description: 'Create a modern homepage design with hero section, features, and testimonials.',
        status: 'done',
        priority: 'high',
        assigneeIndex: 1, // Anuj
        labels: ['design', 'frontend'],
        daysOffset: -6,
        dueDaysOffset: -1,
    },
    {
        projectIndex: 0,
        title: 'Implement responsive navigation',
        description: 'Build a responsive navigation component with mobile hamburger menu.',
        status: 'in-progress',
        priority: 'high',
        assigneeIndex: 2, // Vivek
        labels: ['frontend'],
        daysOffset: -4,
        dueDaysOffset: 2,
    },
    {
        projectIndex: 0,
        title: 'Set up API endpoints',
        description: 'Create REST API endpoints for contact form and newsletter subscription.',
        status: 'todo',
        priority: 'medium',
        assigneeIndex: 2, // Vivek
        labels: ['backend'],
        daysOffset: -3,
        dueDaysOffset: 5,
    },
    {
        projectIndex: 0,
        title: 'Write content for About page',
        description: 'Draft compelling copy for the about page including company history and team.',
        status: 'review',
        priority: 'low',
        assigneeIndex: 1, // Anuj
        labels: ['documentation'],
        daysOffset: -2,
        dueDaysOffset: 3,
    },
    // Mobile App tasks (project index 1)
    {
        projectIndex: 1,
        title: 'Set up React Native project',
        description: 'Initialize React Native project with TypeScript and configure navigation.',
        status: 'done',
        priority: 'high',
        assigneeIndex: 2, // Vivek
        labels: ['frontend'],
        daysOffset: -10,
        dueDaysOffset: -7,
    },
    {
        projectIndex: 1,
        title: 'Design app UI/UX',
        description: 'Create wireframes and high-fidelity mockups for all app screens.',
        status: 'in-progress',
        priority: 'high',
        assigneeIndex: 3, // Sachin
        labels: ['design'],
        daysOffset: -5,
        dueDaysOffset: 4,
    },
    {
        projectIndex: 1,
        title: 'Implement authentication flow',
        description: 'Build login, register, and password reset screens with validation.',
        status: 'todo',
        priority: 'urgent',
        assigneeIndex: 2, // Vivek
        labels: ['frontend', 'backend'],
        daysOffset: -1,
        dueDaysOffset: 1,
    },
    // Marketing Campaign tasks (project index 2)
    {
        projectIndex: 2,
        title: 'Define campaign objectives',
        description: 'Set clear KPIs and goals for the Q1 marketing campaign.',
        status: 'done',
        priority: 'high',
        assigneeIndex: 1, // Anuj
        labels: ['documentation'],
        daysOffset: -2,
        dueDaysOffset: -1,
    },
    {
        projectIndex: 2,
        title: 'Create social media content calendar',
        description: 'Plan and schedule social media posts for the entire quarter.',
        status: 'in-progress',
        priority: 'medium',
        assigneeIndex: 3, // Sachin
        labels: ['documentation'],
        daysOffset: -1,
        dueDaysOffset: 7,
    },
    {
        projectIndex: 2,
        title: 'Design promotional banners',
        description: 'Create eye-catching banners for digital advertising.',
        status: 'todo',
        priority: 'medium',
        assigneeIndex: 3, // Sachin
        labels: ['design'],
        daysOffset: 0,
        dueDaysOffset: 10,
    },
];

async function seedDatabase() {
    try {
        // Connect to MongoDB
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing data
        console.log('🗑️  Clearing existing data...');
        await User.deleteMany({});
        await Project.deleteMany({});
        await Task.deleteMany({});

        // Create users
        console.log('👥 Creating users...');
        const createdUsers = [];
        for (const userData of demoUsersData) {
            const user = new User({
                ...userData,
                avatar: getUserAvatar(userData.name),
            });
            await user.save();
            createdUsers.push(user);
            console.log(`   ✓ Created user: ${userData.name}`);
        }

        // Create projects
        console.log('📁 Creating projects...');
        const createdProjects = [];
        const projectOwners = [0, 0, 1]; // Shivang owns first 2, Anuj owns 3rd
        const projectMembers = [
            [0, 1, 2],      // Website Redesign: Shivang, Anuj, Vivek
            [0, 2, 3],      // Mobile App: Shivang, Vivek, Sachin
            [1, 3],         // Marketing: Anuj, Sachin
        ];

        for (let i = 0; i < demoProjectsData.length; i++) {
            const projectData = demoProjectsData[i];
            const ownerId = createdUsers[projectOwners[i]]._id;
            const members = projectMembers[i].map((userIndex, idx) => ({
                userId: createdUsers[userIndex]._id,
                role: userIndex === projectOwners[i] ? 'owner' : 'member',
            }));

            const project = new Project({
                ...projectData,
                ownerId,
                members,
            });
            await project.save();
            createdProjects.push(project);
            console.log(`   ✓ Created project: ${projectData.name}`);
        }

        // Create tasks
        console.log('📋 Creating tasks...');
        for (const taskData of demoTasksData) {
            const now = Date.now();
            const task = new Task({
                title: taskData.title,
                description: taskData.description,
                projectId: createdProjects[taskData.projectIndex]._id,
                assigneeId: createdUsers[taskData.assigneeIndex]._id,
                creatorId: createdUsers[0]._id, // Shivang creates all
                status: taskData.status,
                priority: taskData.priority,
                labels: taskData.labels,
                dueDate: new Date(now + taskData.dueDaysOffset * 24 * 60 * 60 * 1000),
                order: 0,
            });
            await task.save();
            console.log(`   ✓ Created task: ${taskData.title}`);
        }

        console.log('\n🎉 Database seeded successfully!');
        console.log('\n📊 Summary:');
        console.log(`   • Users: ${createdUsers.length}`);
        console.log(`   • Projects: ${createdProjects.length}`);
        console.log(`   • Tasks: ${demoTasksData.length}`);
        console.log('\n👉 You can now view this data in MongoDB Compass!');
        console.log('   Connection: mongodb://localhost:27017/project-management');

    } catch (error) {
        console.error('❌ Error seeding database:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Disconnected from MongoDB');
    }
}

// Run the seeder
seedDatabase();
