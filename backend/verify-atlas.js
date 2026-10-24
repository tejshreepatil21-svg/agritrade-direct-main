import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const uri = process.env.MONGODB_URI;

if (!uri) {
    console.error('ERROR: MONGODB_URI not found in backend/.env');
    process.exit(1);
}

const maskedUri = uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@');
console.log('Connecting to:', maskedUri);

async function verify() {
    try {
        await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
        console.log('✅ SUCCESS: Connected to MongoDB Atlas!');
        
        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();
        console.log('Collections available:', collections.map(c => c.name).join(', ') || 'None (New DB)');

        if (collections.some(c => c.name === 'users')) {
            const userCount = await db.collection('users').countDocuments();
            console.log(`User Count: ${userCount}`);
            
            if (userCount > 0) {
                const sampleUser = await db.collection('users').findOne({}, { projection: { password: 0 } });
                console.log('Sample User Found (Masked):', {
                    name: sampleUser.name,
                    email: sampleUser.email.replace(/(.{3})(.*)(@.*)/, '$1***$3'),
                    role: sampleUser.role
                });
            }
        } else {
            console.log('Note: "users" collection not found. Database might be empty or using a different name.');
        }

        await mongoose.disconnect();
        console.log('Verification Complete.');
        process.exit(0);
    } catch (err) {
        console.error('❌ CONNECTION FAILED:');
        console.error('Error Name:', err.name);
        console.error('Message:', err.message);
        console.log('\nTroubleshooting Tips:');
        console.log('1. Check if your IP is whitelisted in Atlas (Network Access).');
        console.log('2. Verify the username and password in backend/.env are correct.');
        console.log('3. Ensure you have no firewall blocking port 27017.');
        process.exit(1);
    }
}

verify();
