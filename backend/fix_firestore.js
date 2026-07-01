import { db } from './api/lib/firebase-admin.js';

async function fixFirestore() {
    console.log('Starting Firestore fix...');
    const userId = '1pMF8WjT4qNncysc1egRSjreNxi2';
    
    try {
        const projectsSnapshot = await db.collection('projects').get();
        
        if (projectsSnapshot.empty) {
            console.log('No projects found in Firestore.');
            process.exit(0);
        }
        
        console.log(`Found ${projectsSnapshot.size} project(s).`);
        
        for (const doc of projectsSnapshot.docs) {
            const data = doc.data();
            console.log(`Processing project: ${doc.id} - ${data.name}`);
            
            const teamIds = data.teamIds || [];
            if (!teamIds.includes(userId)) {
                teamIds.push(userId);
            }
            
            await doc.ref.update({
                ownerId: userId, // Make them the owner to ensure full access
                teamIds: teamIds
            });
            console.log(`✅ Project ${doc.id} updated to include user ${userId}.`);
        }
        
        console.log('Firestore fix completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Error fixing Firestore:', error);
        process.exit(1);
    }
}

fixFirestore();
