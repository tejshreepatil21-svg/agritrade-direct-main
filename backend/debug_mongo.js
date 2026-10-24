import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGODB_URI;
console.log('Testing connection to Atlas...');
// Mask credentials for log
const maskedUri = uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@');
console.log('URI:', maskedUri);

const client = new MongoClient(uri, { 
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 5000 
});

async function run() {
  try {
    await client.connect();
    console.log('SUCCESS: Connected to Atlas!');
    const databases = await client.db().admin().listDatabases();
    console.log('Databases available:', databases.databases.map(db => db.name).join(', '));
  } catch (err) {
    console.error('CONNECTION FAILED:');
    console.error('Name:', err.name);
    console.error('Message:', err.message);
    if (err.reason) console.error('Reason:', JSON.stringify(err.reason, null, 2));
  } finally {
    await client.close();
  }
}

run();
