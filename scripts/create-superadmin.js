// Script to create a super admin user in Firebase
// Run with: node scripts/create-superadmin.js

require('dotenv').config({ path: '.env.local' });
const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore } = require('firebase-admin/firestore');

// Validate environment variables
const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');

if (!projectId || !clientEmail || !privateKey || privateKey === '-----BEGIN PRIVATE KEY-----\nYour Private Key Here\n-----END PRIVATE KEY-----\n') {
  console.error('❌ Missing or invalid Firebase Admin credentials!');
  console.log('\nPlease set the following in your .env.local file:');
  console.log('  - FIREBASE_ADMIN_PROJECT_ID');
  console.log('  - FIREBASE_ADMIN_CLIENT_EMAIL');
  console.log('  - FIREBASE_ADMIN_PRIVATE_KEY');
  console.log('\nGet these from Firebase Console > Project Settings > Service accounts > Generate new private key');
  process.exit(1);
}

// Initialize Firebase Admin
const app = initializeApp({
  credential: cert({
    projectId,
    clientEmail,
    privateKey,
  }),
});

const auth = getAuth(app);
const db = getFirestore(app);

// Super admin credentials - CHANGE THESE!
const SUPER_ADMIN = {
  email: 'superadmin@skillvault.com',
  password: 'SuperAdmin@123', // Change this to a secure password
  name: 'Super Admin'
};

async function createSuperAdmin() {
  console.log('🚀 Creating super admin user in Firebase...\n');

  try {
    let userId;

    // Step 1: Create or get auth user
    console.log('📧 Creating auth user:', SUPER_ADMIN.email);
    
    try {
      // Try to create new user
      const userRecord = await auth.createUser({
        email: SUPER_ADMIN.email,
        password: SUPER_ADMIN.password,
        displayName: SUPER_ADMIN.name,
        emailVerified: true,
      });
      userId = userRecord.uid;
      console.log('✅ Auth user created with ID:', userId);
    } catch (error) {
      if (error.code === 'auth/email-already-exists') {
        console.log('⚠️  Auth user already exists, fetching existing user...');
        const existingUser = await auth.getUserByEmail(SUPER_ADMIN.email);
        userId = existingUser.uid;
        console.log('✅ Found existing user with ID:', userId);
      } else {
        throw error;
      }
    }

    // Step 2: Create/update user profile in Firestore
    console.log('\n📝 Creating user profile in Firestore...');
    
    const userDocRef = db.collection('users').doc(userId);
    await userDocRef.set({
      email: SUPER_ADMIN.email,
      name: SUPER_ADMIN.name,
      role: 'super-admin',
      verified: true,
      collegeName: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }, { merge: true });

    console.log('✅ User profile created/updated in Firestore!');

    // Step 3: Set custom claims for role-based access (optional but recommended)
    console.log('\n🔐 Setting custom claims for super admin role...');
    await auth.setCustomUserClaims(userId, { role: 'super-admin' });
    console.log('✅ Custom claims set successfully!');

    console.log('\n' + '='.repeat(50));
    console.log('🎉 SUPER ADMIN CREATED SUCCESSFULLY!');
    console.log('='.repeat(50));
    console.log('\n📋 Login Credentials:');
    console.log(`   Email:    ${SUPER_ADMIN.email}`);
    console.log(`   Password: ${SUPER_ADMIN.password}`);
    console.log(`   Role:     super-admin`);
    console.log(`   User ID:  ${userId}`);
    console.log('\n⚠️  Please change the password after first login!');
    console.log('='.repeat(50) + '\n');

  } catch (error) {
    console.error('\n❌ Error creating super admin:', error.message);
    if (error.code) {
      console.error('   Error code:', error.code);
    }
    process.exit(1);
  }
}

createSuperAdmin();
