// Script to add dummy data for demonstration
require('dotenv').config({ path: '.env.local' });

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, doc, setDoc, updateDoc, getDocs, query, where } = require('firebase/firestore');
const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth');

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
const auth = getAuth(app);

// Sample data
const skills = ['React', 'JavaScript', 'Python', 'Java', 'Node.js', 'SQL', 'MongoDB', 'TypeScript', 'AWS', 'Docker'];
const difficulties = ['easy', 'medium', 'hard'];
const assessmentTypes = ['mcq', 'coding', 'practical', 'mixed'];

const studentNames = [
  'Alice Johnson', 'Bob Smith', 'Carol Davis', 'David Wilson',
  'Emma Brown', 'Frank Miller', 'Grace Lee', 'Henry Taylor',
  'Ivy Martinez', 'Jack Anderson', 'Karen White', 'Leo Garcia'
];

const assessmentTitles = {
  React: ['React Fundamentals', 'React Hooks', 'React Advanced Patterns', 'React State Management'],
  JavaScript: ['JavaScript ES6+', 'JavaScript Basics', 'Async JavaScript', 'JS Design Patterns'],
  Python: ['Python Basics', 'Python Data Structures', 'Python OOP', 'Python Web Development'],
  Java: ['Java Fundamentals', 'Java Collections', 'Spring Boot', 'Java Microservices'],
  'Node.js': ['Node.js Core', 'Express.js', 'Node.js REST APIs', 'Node.js Performance'],
};

async function getOrCreateCollege() {
  console.log('Checking for college...');
  
  const collegesQuery = query(collection(db, 'colleges'));
  const collegesSnapshot = await getDocs(collegesQuery);
  
  if (!collegesSnapshot.empty) {
    const college = collegesSnapshot.docs[0];
    console.log(`Using existing college: ${college.data().name} (ID: ${college.id})`);
    return { id: college.id, name: college.data().name };
  }
  
  console.log('Creating new college...');
  const collegeRef = await addDoc(collection(db, 'colleges'), {
    name: 'Tech University',
    location: 'San Francisco, CA',
    verified: true,
  });
  
  console.log(`Created college: Tech University (ID: ${collegeRef.id})`);
  return { id: collegeRef.id, name: 'Tech University' };
}

async function createDummyStudents(collegeId, collegeName) {
  console.log('\n=== Creating Dummy Students ===');
  const students = [];
  
  for (let i = 0; i < studentNames.length; i++) {
    try {
      const name = studentNames[i];
      const email = `student${i + 1}@demo.com`;
      
      // Check if user already exists
      const usersQuery = query(collection(db, 'users'), where('email', '==', email));
      const existingUser = await getDocs(usersQuery);
      
      if (!existingUser.empty) {
        console.log(`Student ${name} already exists, skipping...`);
        students.push({ id: existingUser.docs[0].id, name, email });
        continue;
      }
      
      // Create auth user (skip if it fails - might already exist)
      let uid;
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, 'Demo@123');
        uid = userCredential.user.uid;
      } catch (authError) {
        if (authError.code === 'auth/email-already-in-use') {
          console.log(`Auth user for ${email} already exists`);
          // Use a generated ID for Firestore doc
          uid = `student_${i + 1}_${Date.now()}`;
        } else {
          throw authError;
        }
      }
      
      // Create Firestore user document
      await setDoc(doc(db, 'users', uid), {
        name,
        email,
        role: 'student',
        collegeId,
        collegeName,
        verified: true,
      });
      
      students.push({ id: uid, name, email });
      console.log(`✓ Created student: ${name} (${email})`);
    } catch (error) {
      console.error(`✗ Error creating student ${studentNames[i]}:`, error.message);
    }
  }
  
  return students;
}

async function createDummyAssessments(facultyId, collegeId) {
  console.log('\n=== Creating Dummy Assessments ===');
  const assessments = [];
  
  const now = new Date();
  const skillsToUse = skills.slice(0, 5); // Use first 5 skills
  
  for (let i = 0; i < skillsToUse.length; i++) {
    const skill = skillsToUse[i];
    const titles = assessmentTitles[skill] || [`${skill} Assessment`];
    
    for (let j = 0; j < 2; j++) {
      try {
        const scheduledDate = new Date(now);
        scheduledDate.setDate(scheduledDate.getDate() - (i * 7) - j); // Past dates
        
        const dueDate = new Date(scheduledDate);
        dueDate.setDate(dueDate.getDate() + 7);
        
        const assessmentRef = await addDoc(collection(db, 'assessments'), {
          title: titles[j] || `${skill} Test ${j + 1}`,
          description: `Comprehensive ${skill} assessment covering key concepts and practical applications`,
          type: assessmentTypes[Math.floor(Math.random() * assessmentTypes.length)],
          skill,
          difficulty: difficulties[Math.floor(Math.random() * difficulties.length)],
          duration: 60 + (i * 10),
          totalMarks: 100,
          passingMarks: 70,
          questions: [],
          createdBy: facultyId,
          collegeId,
          isActive: true,
          allowedStudents: [],
          tags: [skill, 'programming', 'technical'],
        });
        
        assessments.push({ id: assessmentRef.id, skill, title: titles[j] || `${skill} Test ${j + 1}` });
        console.log(`✓ Created assessment: ${titles[j] || `${skill} Test ${j + 1}`}`);
      } catch (error) {
        console.error(`✗ Error creating assessment for ${skill}:`, error.message);
      }
    }
  }
  
  return assessments;
}

async function createDummyAttempts(students, assessments) {
  console.log('\n=== Creating Dummy Attempts ===');
  let count = 0;
  
  for (const assessment of assessments) {
    // Each assessment gets 6-10 random student attempts
    const numAttempts = 6 + Math.floor(Math.random() * 5);
    const shuffled = [...students].sort(() => 0.5 - Math.random());
    const selectedStudents = shuffled.slice(0, numAttempts);
    
    for (const student of selectedStudents) {
      try {
        const score = 60 + Math.floor(Math.random() * 40); // 60-100
        const percentage = score;
        const passed = percentage >= 70;
        
        const attemptRef = await addDoc(collection(db, 'attempts'), {
          assessmentId: assessment.id,
          studentId: student.id,
          collegeId: 'default',
          answers: [],
          score,
          totalMarks: 100,
          percentage,
          status: 'completed',
          timeSpent: 3000 + Math.floor(Math.random() * 600),
          tabSwitches: Math.floor(Math.random() * 3),
          proctoringFlags: [],
        });
        
        count++;
        
        // Create certificate for passing attempts
        if (passed) {
          await addDoc(collection(db, 'certificates'), {
            studentId: student.id,
            studentName: student.name,
            assessmentId: assessment.id,
            assessmentTitle: assessment.title,
            skill: assessment.skill,
            score,
            percentage,
            certificateId: `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
            collegeName: 'Tech University',
            verified: true,
          });
        }
      } catch (error) {
        console.error(`✗ Error creating attempt:`, error.message);
      }
    }
  }
  
  console.log(`✓ Created ${count} attempts`);
}

async function getFacultyUser() {
  console.log('\n=== Finding Faculty User ===');
  
  const usersQuery = query(collection(db, 'users'), where('role', '==', 'faculty'));
  const usersSnapshot = await getDocs(usersQuery);
  
  if (usersSnapshot.empty) {
    console.log('No faculty user found. Please create a faculty user first.');
    return null;
  }
  
  const faculty = usersSnapshot.docs[0];
  console.log(`Found faculty: ${faculty.data().email} (ID: ${faculty.id})`);
  
  // Update faculty with collegeId if missing
  if (!faculty.data().collegeId) {
    const college = await getOrCreateCollege();
    await updateDoc(doc(db, 'users', faculty.id), {
      collegeId: college.id,
      collegeName: college.name,
    });
    console.log(`Updated faculty with collegeId: ${college.id}`);
  }
  
  return { id: faculty.id, collegeId: faculty.data().collegeId };
}

async function main() {
  try {
    console.log('🚀 Starting dummy data creation...\n');
    
    // Get or create college
    const college = await getOrCreateCollege();
    
    // Get faculty user
    const faculty = await getFacultyUser();
    if (!faculty) {
      console.log('❌ Cannot proceed without a faculty user');
      process.exit(1);
    }
    
    // Create students
    const students = await createDummyStudents(college.id, college.name);
    console.log(`\n✅ Created/Found ${students.length} students`);
    
    // Create assessments
    const assessments = await createDummyAssessments(faculty.id, college.id);
    console.log(`\n✅ Created ${assessments.length} assessments`);
    
    // Create attempts and certificates
    await createDummyAttempts(students, assessments);
    
    console.log('\n✨ All dummy data created successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - College: ${college.name}`);
    console.log(`   - Students: ${students.length}`);
    console.log(`   - Assessments: ${assessments.length}`);
    console.log(`   - Attempts: Multiple per assessment`);
    console.log(`   - Certificates: Generated for passing attempts`);
    console.log('\n👉 Please refresh your browser to see the data!');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
  
  process.exit(0);
}

main();
