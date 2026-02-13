// Quick MongoDB connection test
import dotenv from 'dotenv';
import connectDB from './lib/mongodb.js';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function testConnection() {
    try {
        console.log('Testing MongoDB connection...');
        console.log('Connection string:', process.env.MONGODB_URI ? '✓ Found' : '✗ Missing');

        await connectDB();
        console.log('\n✅ SUCCESS! MongoDB Atlas is connected.');
        console.log('Database is ready to use.');
        process.exit(0);
    } catch (error) {
        console.error('\n❌ ERROR: Failed to connect to MongoDB');
        console.error('Error details:', error.message);
        process.exit(1);
    }
}

testConnection();
