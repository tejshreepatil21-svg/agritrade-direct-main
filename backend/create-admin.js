import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import readline from 'readline';

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function createInitialAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/agritrade');
    console.log('Connected to MongoDB');

    // Check if any admin exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('An admin user already exists!');
      console.log(`Email: ${existingAdmin.email}`);
      
      const createAnother = await question('Do you want to create another admin? (yes/no): ');
      if (createAnother.toLowerCase() !== 'yes') {
        console.log('Exiting...');
        process.exit(0);
      }
    }

    console.log('\n=== Create Initial Admin User ===\n');

    const name = await question('Admin Name: ');
    const email = await question('Admin Email: ');
    const password = await question('Admin Password (min 6 characters): ');
    const phone = await question('Admin Phone (optional): ');

    // Validate inputs
    if (!name || !email || !password) {
      console.error('Error: Name, email, and password are required');
      process.exit(1);
    }

    if (password.length < 6) {
      console.error('Error: Password must be at least 6 characters long');
      process.exit(1);
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      console.error('Error: A user with this email already exists');
      process.exit(1);
    }

    // Create admin user
    const admin = new User({
      name,
      email: email.toLowerCase(),
      password,
      role: 'admin',
      phone: phone || undefined,
      isVerified: true,
      isActive: true,
    });

    await admin.save();

    console.log('\n✓ Admin user created successfully!');
    console.log('Details:');
    console.log(`  Name: ${admin.name}`);
    console.log(`  Email: ${admin.email}`);
    console.log(`  Role: ${admin.role}`);
    console.log(`  ID: ${admin._id}`);

  } catch (error) {
    console.error('Error creating admin user:', error.message);
    process.exit(1);
  } finally {
    rl.close();
    await mongoose.connection.close();
    process.exit(0);
  }
}

createInitialAdmin();
