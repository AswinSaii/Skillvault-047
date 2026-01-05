import { db } from './client'
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where,
  Timestamp 
} from 'firebase/firestore'

// Generate dummy assessments
export async function generateDummyAssessments(facultyId: string, collegeId: string = 'default') {
  const assessments = [
    {
      title: 'JavaScript Fundamentals',
      description: 'Test your knowledge of JavaScript basics including variables, functions, and control flow',
      skill: 'JavaScript',
      difficulty: 'beginner' as const,
      duration: 30,
      passingScore: 70,
      totalQuestions: 10,
    },
    {
      title: 'React Advanced Patterns',
      description: 'Advanced React concepts including hooks, context, and performance optimization',
      skill: 'React',
      difficulty: 'advanced' as const,
      duration: 45,
      passingScore: 75,
      totalQuestions: 15,
    },
    {
      title: 'Python Data Structures',
      description: 'Master Python data structures: lists, dictionaries, sets, and tuples',
      skill: 'Python',
      difficulty: 'intermediate' as const,
      duration: 40,
      passingScore: 70,
      totalQuestions: 12,
    },
    {
      title: 'SQL Database Design',
      description: 'Database design principles, normalization, and advanced SQL queries',
      skill: 'SQL',
      difficulty: 'intermediate' as const,
      duration: 50,
      passingScore: 75,
      totalQuestions: 15,
    },
    {
      title: 'Node.js API Development',
      description: 'Build RESTful APIs with Node.js and Express',
      skill: 'Node.js',
      difficulty: 'intermediate' as const,
      duration: 60,
      passingScore: 70,
      totalQuestions: 20,
    },
  ]

  const createdAssessments = []
  
  for (const assessment of assessments) {
    try {
      const docRef = await addDoc(collection(db, 'assessments'), {
        ...assessment,
        createdBy: facultyId,
        collegeId,
        createdAt: Timestamp.now(),
        isActive: true,
      })
      createdAssessments.push({ id: docRef.id, ...assessment })
      console.log(`Created assessment: ${assessment.title}`)
    } catch (error) {
      console.error(`Failed to create assessment ${assessment.title}:`, error)
    }
  }

  return createdAssessments
}

// Generate dummy students
export async function generateDummyStudents(collegeId: string = 'default', collegeName: string = 'Default College') {
  const studentNames = [
    'Alice Johnson',
    'Bob Smith',
    'Carol Williams',
    'David Brown',
    'Emma Davis',
    'Frank Miller',
    'Grace Wilson',
    'Henry Moore',
  ]

  const createdStudents = []

  for (let i = 0; i < studentNames.length; i++) {
    const name = studentNames[i]
    const email = `${name.toLowerCase().replace(' ', '.')}@student.edu`
    
    try {
      const docRef = await addDoc(collection(db, 'users'), {
        name,
        email,
        role: 'student',
        collegeId,
        collegeName,
        verified: true,
        createdAt: Timestamp.now(),
      })
      createdStudents.push({ id: docRef.id, name, email })
      console.log(`Created student: ${name}`)
    } catch (error) {
      console.error(`Failed to create student ${name}:`, error)
    }
  }

  return createdStudents
}

// Generate dummy attempts and certificates
export async function generateDummyAttempts(studentId: string, studentName: string, assessmentIds: string[]) {
  const skills = ['JavaScript', 'React', 'Python', 'SQL', 'Node.js']
  const attempts = []

  for (let i = 0; i < Math.min(assessmentIds.length, 3); i++) {
    const assessmentId = assessmentIds[i]
    const percentage = 70 + Math.floor(Math.random() * 30) // 70-99%
    const totalQuestions = 10 + Math.floor(Math.random() * 10) // 10-19
    const score = Math.floor((percentage / 100) * totalQuestions)

    try {
      const docRef = await addDoc(collection(db, 'attempts'), {
        studentId,
        studentName,
        assessmentId,
        assessmentTitle: `Sample Assessment ${i + 1}`,
        skill: skills[i % skills.length],
        status: 'completed',
        score,
        totalQuestions,
        percentage,
        startedAt: Timestamp.fromDate(new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)),
        completedAt: Timestamp.now(),
        timeSpent: Math.floor(Math.random() * 1800) + 600, // 10-40 minutes
      })
      attempts.push({ id: docRef.id, percentage, skill: skills[i % skills.length] })
      console.log(`Created attempt for ${studentName}: ${percentage}%`)
    } catch (error) {
      console.error(`Failed to create attempt for ${studentName}:`, error)
    }
  }

  return attempts
}

// Generate all dummy data
export async function seedAllDummyData(facultyId: string, collegeId: string = 'default', collegeName: string = 'Default College') {
  console.log('Starting dummy data generation...')
  
  try {
    // Create assessments
    console.log('\n=== Creating Assessments ===')
    const assessments = await generateDummyAssessments(facultyId, collegeId)
    
    // Create students
    console.log('\n=== Creating Students ===')
    const students = await generateDummyStudents(collegeId, collegeName)
    
    // Create attempts for each student
    console.log('\n=== Creating Attempts ===')
    const assessmentIds = assessments.map(a => a.id)
    for (const student of students.slice(0, 4)) { // Only first 4 students get attempts
      await generateDummyAttempts(student.id, student.name, assessmentIds)
    }

    console.log('\n=== Dummy Data Generation Complete ===')
    console.log(`Created ${assessments.length} assessments`)
    console.log(`Created ${students.length} students`)
    console.log('Created multiple attempts and certificates')

    return {
      success: true,
      assessments: assessments.length,
      students: students.length,
    }
  } catch (error) {
    console.error('Error generating dummy data:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// Helper to check if dummy data already exists
export async function checkDummyDataExists() {
  try {
    const assessmentsQuery = query(collection(db, 'assessments'))
    const assessmentsSnapshot = await getDocs(assessmentsQuery)
    
    const studentsQuery = query(collection(db, 'users'), where('role', '==', 'student'))
    const studentsSnapshot = await getDocs(studentsQuery)
    
    return {
      hasAssessments: !assessmentsSnapshot.empty,
      hasStudents: !studentsSnapshot.empty,
      assessmentCount: assessmentsSnapshot.size,
      studentCount: studentsSnapshot.size,
    }
  } catch (error) {
    console.error('Error checking dummy data:', error)
    return {
      hasAssessments: false,
      hasStudents: false,
      assessmentCount: 0,
      studentCount: 0,
    }
  }
}
