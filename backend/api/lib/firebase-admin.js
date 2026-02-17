import admin from 'firebase-admin';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Firebase Admin SDK
let app;

if (!admin.apps.length) {
    try {
        // Try to load from service account file first
        let credential;

        if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
            // Use environment variables
            credential = admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            });
        } else {
            // Use service account file
            const configPath = join(__dirname, '..', '..', 'firebase-config.json');
            const serviceAccount = JSON.parse(readFileSync(configPath, 'utf8'));
            credential = admin.credential.cert(serviceAccount);
        }

        app = admin.initializeApp({
            credential,
        });

        console.log('✅ Firebase Admin initialized successfully');
    } catch (error) {
        console.error('❌ Firebase Admin initialization error:', error);
        throw error;
    }
} else {
    app = admin.app();
}

// Export Firebase Admin services
export const auth = admin.auth();
export const db = admin.firestore();

// Configure Firestore settings
db.settings({
    ignoreUndefinedProperties: true,
});

export default app;
