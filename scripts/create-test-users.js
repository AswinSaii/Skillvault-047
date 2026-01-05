/**
 * Script to create test users for automated testing
 * Run this script to create test users in Firebase Auth and Firestore
 * 
 * Usage: node scripts/create-test-users.js
 * 
 * Note: This requires Firebase Admin SDK to be configured
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
try {
  const serviceAccount = require(path.join(__dirname, '../serviceAccountKey.json'));
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
} catch (error) {
  console.error('Error initializing Firebase Admin:', error);
  console.error('Please ensure serviceAccountKey.json exists in the project root');
  process.exit(1);
}

const db = admin.firestore();
const auth = admin.auth();

const TEST_USERS = [
  {
    email: "test.student@example.com",
    password: "Test123!@#",
    name: "Test Student",
    role: "student",
    collegeId: "college_1",
    collegeName: "Test College",
    verified: true,
  },
  {
    email: "test.faculty@example.com",
    password: "Test123!@#",
    name: "Test Faculty",
    role: "faculty",
    collegeId: "college_1",
    collegeName: "Test College",
    verified: true,
  },
  {
    email: "test.admin@example.com",
    password: "Test123!@#",
    name: "Test College Admin",
    role: "college-admin",
    collegeId: "college_1",
    collegeName: "Test College",
    verified: true,
  },
  {
    email: "test.recruiter@example.com",
    password: "Test123!@#",
    name: "Test Recruiter",
    role: "recruiter",
    verified: true,
  },
  {
    email: "test.superadmin@example.com",
    password: "Test123!@#",
    name: "Test Super Admin",
    role: "super-admin",
    verified: true,
  },
];

async function createTestUsers() {
  console.log('Creating test users...\n');

  // First, ensure test college exists
  try {
    const collegeRef = db.collection('colleges').doc('college_1');
    const collegeDoc = await collegeRef.get();
    
    if (!collegeDoc.exists) {
      await collegeRef.set({
        name: 'Test College',
        email: 'test@college.com',
        location: 'Test Location',
        verified: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      console.log('✓ Created test college (college_1)');
    } else {
      console.log('✓ Test college already exists');
    }
  } catch (error) {
    console.error('Error creating test college:', error);
  }

  // Create users
  for (const userData of TEST_USERS) {
    try {
      // Check if user already exists
      let user;
      try {
        user = await auth.getUserByEmail(userData.email);
        console.log(`⚠ User ${userData.email} already exists in Auth, skipping...`);
      } catch (error) {
        if (error.code === 'auth/user-not-found') {
          // Create user in Auth
          user = await auth.createUser({
            email: userData.email,
            password: userData.password,
            displayName: userData.name,
            emailVerified: true,
          });
          console.log(`✓ Created Auth user: ${userData.email}`);
        } else {
          throw error;
        }
      }

      // Create/update user document in Firestore
      const userRef = db.collection('users').doc(user.uid);
      const userDoc = await userRef.get();
      
      if (!userDoc.exists) {
        await userRef.set({
          email: userData.email,
          name: userData.name,
          role: userData.role,
          verified: userData.verified,
          collegeId: userData.collegeId || null,
          collegeName: userData.collegeName || null,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        console.log(`✓ Created Firestore user: ${userData.email} (${userData.role})`);
      } else {
        // Update existing user
        await userRef.update({
          email: userData.email,
          name: userData.name,
          role: userData.role,
          verified: userData.verified,
          collegeId: userData.collegeId || null,
          collegeName: userData.collegeName || null,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        console.log(`✓ Updated Firestore user: ${userData.email} (${userData.role})`);
      }
    } catch (error) {
      console.error(`✗ Error creating user ${userData.email}:`, error.message);
    }
  }

  console.log('\n✓ Test user creation complete!');
  console.log('\nTest credentials:');
  TEST_USERS.forEach(user => {
    console.log(`  ${user.role}: ${user.email} / ${user.password}`);
  });
}

// Run the script
createTestUsers()
  .then(() => {
    console.log('\nDone!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

