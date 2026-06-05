/**
 * Firestore Seeder — Seeds demo users with the 4 RBAC roles.
 *
 * Run:  node backend/api/seed-firestore.js
 *
 * This creates Firebase Auth accounts AND Firestore user documents.
 * Safe to re-run: existing users are skipped (not overwritten).
 */

import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

dotenv.config();

// ---------------------------------------------------------------------------
// Firebase Admin Init
// ---------------------------------------------------------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

if (!admin.apps.length) {
    let credential;
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
        credential = admin.credential.cert({
            projectId:   process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey:  process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        });
    } else {
        const configPath = join(__dirname, '..', 'firebase-config.json');
        credential = admin.credential.cert(JSON.parse(readFileSync(configPath, 'utf8')));
    }
    admin.initializeApp({ credential });
}

const auth = admin.auth();
const db   = admin.firestore();
db.settings({ ignoreUndefinedProperties: true });

// ---------------------------------------------------------------------------
// Demo User Data — one user per role
// ---------------------------------------------------------------------------

const DEMO_USERS = [
    {
        name:     'Admin User',
        email:    'admin@yojnaflow.dev',
        password: 'Admin@123',
        role:     'admin',
        avatar:   `https://api.dicebear.com/7.x/bottts/svg?seed=admin`,
    },
    {
        name:     'Project Manager',
        email:    'pm@yojnaflow.dev',
        password: 'Manager@123',
        role:     'project_manager',
        avatar:   `https://api.dicebear.com/7.x/bottts/svg?seed=pm`,
    },
    {
        name:     'Developer',
        email:    'dev@yojnaflow.dev',
        password: 'Developer@123',
        role:     'developer',
        avatar:   `https://api.dicebear.com/7.x/bottts/svg?seed=developer`,
    },
    {
        name:     'Client User',
        email:    'client@yojnaflow.dev',
        password: 'Client@123',
        role:     'client',
        avatar:   `https://api.dicebear.com/7.x/bottts/svg?seed=client`,
    },
];

// ---------------------------------------------------------------------------
// Seeder
// ---------------------------------------------------------------------------

async function seedUser(userData) {
    console.log(`\n   → Seeding user: ${userData.email} (${userData.role})`);

    let uid;

    try {
        // Try to find existing Firebase Auth user
        const existing = await auth.getUserByEmail(userData.email);
        uid = existing.uid;
        console.log(`     ✓ Firebase Auth user already exists (uid: ${uid})`);
    } catch {
        // Create new Firebase Auth user
        const userRecord = await auth.createUser({
            email:       userData.email,
            password:    userData.password,
            displayName: userData.name,
        });
        uid = userRecord.uid;
        console.log(`     ✓ Created Firebase Auth user (uid: ${uid})`);
    }

    // Upsert Firestore document
    const timestamp = new Date().toISOString();
    await db.collection('users').doc(uid).set(
        {
            uid,
            email:           userData.email.toLowerCase(),
            name:            userData.name,
            avatar:          userData.avatar,
            role:            userData.role,
            gitHubUsername:  null,
            standupSettings: {
                enabled:        true,
                standupTime:    '09:00',
                snoozeDuration: 30,
            },
            createdAt: timestamp,
            updatedAt: timestamp,
        },
        { merge: true }   // safe to re-run — won't wipe existing fields
    );
    console.log(`     ✓ Firestore document upserted`);

    return { uid, ...userData };
}

async function seed() {
    console.log('🌱 Starting Firestore seed...');
    console.log('   Roles: admin | project_manager | developer | client\n');

    const seededUsers = [];

    for (const userData of DEMO_USERS) {
        try {
            const user = await seedUser(userData);
            seededUsers.push(user);
        } catch (error) {
            console.error(`   ✗ Failed to seed ${userData.email}:`, error.message);
        }
    }

    console.log('\n🎉 Seeding complete!\n');
    console.log('📋 Demo Accounts:');
    console.log('─'.repeat(60));

    seededUsers.forEach(u => {
        console.log(`  Role: ${u.role.padEnd(20)} Email: ${u.email}`);
        console.log(`  Password: ${u.password}\n`);
    });

    console.log('─'.repeat(60));
    console.log('\n💡 Log in with any of the accounts above to test RBAC.\n');

    process.exit(0);
}

seed().catch(err => {
    console.error('Fatal seed error:', err);
    process.exit(1);
});
