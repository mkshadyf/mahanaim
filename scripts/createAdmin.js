import dotenv from 'dotenv';
import { cert, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

// Validate required environment variables
const requiredEnvVars = [
  'FIREBASE_PROJECT_ID',
  'FIREBASE_CLIENT_EMAIL',
  'FIREBASE_PRIVATE_KEY',
  'ADMIN_EMAIL',
  'ADMIN_PASSWORD',
  'ADMIN_DISPLAY_NAME'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

// Initialize Firebase Admin
try {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
} catch (error) {
  console.error('Error initializing Firebase Admin:', error);
  process.exit(1);
}

const auth = getAuth();
const db = getFirestore();

async function createAdminUser() {
  try {
    // Check if admin user already exists
    try {
      const userRecord = await auth.getUserByEmail(process.env.ADMIN_EMAIL);
      console.log('Admin user already exists:', userRecord.uid);
      process.exit(0);
    } catch (error) {
      if (error.code !== 'auth/user-not-found') {
        throw error;
      }
    }

    // Create the user in Firebase Auth
    const userRecord = await auth.createUser({
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
      displayName: process.env.ADMIN_DISPLAY_NAME,
      emailVerified: true,
    });

    // Set custom claims to mark as admin
    await auth.setCustomUserClaims(userRecord.uid, { admin: true });

    // Create user document in Firestore
    await db.collection('users').doc(userRecord.uid).set({
      email: userRecord.email,
      displayName: userRecord.displayName,
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log('Admin user created successfully:', {
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName,
    });

    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
}

createAdminUser(); 