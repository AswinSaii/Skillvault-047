// Simple script to check and update faculty users
require('dotenv').config({ path: '.env.local' });

const { initializeApp } = require('firebase/app');
const { getFirestore, doc, updateDoc, collection, query, where, getDocs } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function fixFacultyUser() {
  try {
    console.log('Looking for faculty users...\n');
    
    const usersQuery = query(
      collection(db, 'users'),
      where('role', '==', 'faculty')
    );
    
    const usersSnapshot = await getDocs(usersQuery);
    
    if (usersSnapshot.empty) {
      console.log('No faculty users found.');
      return;
    }

    console.log(`Found ${usersSnapshot.docs.length} faculty user(s)\n`);
    
    // Use a default college ID (you can change this to your actual college ID)
    const DEFAULT_COLLEGE_ID = 'college_1';
    
    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      console.log(`User: ${userData.name} (${userData.email})`);
      console.log(`Current collegeId: ${userData.collegeId || 'NOT SET'}\n`);
      
      if (!userData.collegeId) {
        console.log(`Updating to use collegeId: ${DEFAULT_COLLEGE_ID}...`);
        
        await updateDoc(doc(db, 'users', userDoc.id), {
          collegeId: DEFAULT_COLLEGE_ID
        });
        
        console.log(`✓ Updated successfully\n`);
      }
    }

    console.log('✅ All faculty users processed!');
    console.log('Please log out and log back in to see changes.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
  }
  
  process.exit(0);
}

fixFacultyUser();
