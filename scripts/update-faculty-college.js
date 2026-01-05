// Load environment variables
require('dotenv').config({ path: '.env.local' });

const { initializeApp } = require('firebase/app');
const { getFirestore, doc, updateDoc, getDoc, collection, query, where, getDocs, addDoc, Timestamp } = require('firebase/firestore');

// Your Firebase config
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

async function updateFacultyUser() {
  try {
    // First, let's create a college if it doesn't exist
    console.log('Checking for colleges...');
    
    const collegesQuery = query(collection(db, 'colleges'));
    const collegesSnapshot = await getDocs(collegesQuery);
    
    let collegeId;
    
    if (collegesSnapshot.empty) {
      console.log('No colleges found. Creating a default college...');
      
      const collegeRef = await addDoc(collection(db, 'colleges'), {
        name: 'College 1',
        location: 'City',
        verified: true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      
      collegeId = collegeRef.id;
      console.log('Created college with ID:', collegeId);
    } else {
      // Use the first college
      collegeId = collegesSnapshot.docs[0].id;
      const collegeName = collegesSnapshot.docs[0].data().name;
      console.log(`Using existing college: ${collegeName} (ID: ${collegeId})`);
    }

    // Now find all faculty users without a collegeId and update them
    console.log('\nLooking for faculty users...');
    
    const usersQuery = query(
      collection(db, 'users'),
      where('role', '==', 'faculty')
    );
    
    const usersSnapshot = await getDocs(usersQuery);
    
    if (usersSnapshot.empty) {
      console.log('No faculty users found.');
      return;
    }

    let updatedCount = 0;
    
    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      
      // Only update if collegeId is missing
      if (!userData.collegeId) {
        console.log(`\nUpdating user: ${userData.email} (${userData.name})`);
        
        await updateDoc(doc(db, 'users', userDoc.id), {
          collegeId: collegeId,
          updatedAt: Timestamp.now(),
        });
        
        console.log(`✓ Updated ${userData.email} with collegeId: ${collegeId}`);
        updatedCount++;
      } else {
        console.log(`\nUser ${userData.email} already has collegeId: ${userData.collegeId}`);
      }
    }

    console.log(`\n✅ Successfully updated ${updatedCount} faculty user(s)`);
    console.log('Please refresh your browser to see the changes.');
    
  } catch (error) {
    console.error('❌ Error updating faculty users:', error);
    process.exit(1);
  }
}

updateFacultyUser()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
