import { db } from "./client"
import { collection, query, where, getDocs, doc, getDoc, orderBy } from "firebase/firestore"

export interface SkillRecommendation {
  skill: string
  reason: string
  priority: "high" | "medium" | "low"
  currentProficiency: number
  targetProficiency: number
  recommendedAssessments: Array<{
    id: string
    title: string
    difficulty: string
  }>
}

/**
 * Generate skill gap recommendations for a student based on their performance
 * @param studentId - Student's Firebase UID
 * @returns Array of skill recommendations
 */
export async function getSkillRecommendations(studentId: string): Promise<SkillRecommendation[]> {
  try {
    // Get all student's attempts
    const attemptsQuery = query(
      collection(db, "attempts"),
      where("studentId", "==", studentId),
      where("status", "==", "completed"),
      orderBy("submittedAt", "desc")
    )

    const attemptsSnapshot = await getDocs(attemptsQuery)
    const attempts = attemptsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[]

    if (attempts.length === 0) {
      return getDefaultRecommendations()
    }

    // Get assessment details to map skills
    const assessmentIds = [...new Set(attempts.map((a: any) => a.assessmentId))]
    const assessmentPromises = assessmentIds.map(id => getDoc(doc(db, "assessments", id)))
    const assessmentDocs = await Promise.all(assessmentPromises)
    
    const assessmentsMap = new Map()
    assessmentDocs.forEach(doc => {
      if (doc.exists()) {
        assessmentsMap.set(doc.id, { id: doc.id, ...doc.data() })
      }
    })

    // Analyze skill performance
    const skillPerformance = new Map<string, { scores: number[], attempts: number }>()

    attempts.forEach((attempt: any) => {
      const assessment = assessmentsMap.get(attempt.assessmentId)
      if (!assessment) return

      const skill = assessment.skill
      if (!skillPerformance.has(skill)) {
        skillPerformance.set(skill, { scores: [], attempts: 0 })
      }

      const performance = skillPerformance.get(skill)!
      performance.scores.push(attempt.percentage)
      performance.attempts++
    })

    // Generate recommendations
    const recommendations: SkillRecommendation[] = []

    // 1. Skills with low proficiency (< 60%)
    for (const [skill, data] of skillPerformance.entries()) {
      const avgScore = data.scores.reduce((a, b) => a + b, 0) / data.scores.length
      
      if (avgScore < 60) {
        // Get available assessments for this skill
        const assessmentsForSkill = Array.from(assessmentsMap.values())
          .filter((a: any) => a.skill === skill && a.isActive)
          .slice(0, 3)

        recommendations.push({
          skill,
          reason: `Your current proficiency is ${Math.round(avgScore)}%. Focus on improving this skill to unlock more opportunities.`,
          priority: "high",
          currentProficiency: Math.round(avgScore),
          targetProficiency: 70,
          recommendedAssessments: assessmentsForSkill.map((a: any) => ({
            id: a.id,
            title: a.title,
            difficulty: a.difficulty
          }))
        })
      } else if (avgScore < 75) {
        // 2. Skills with medium proficiency (60-75%)
        const assessmentsForSkill = Array.from(assessmentsMap.values())
          .filter((a: any) => a.skill === skill && a.isActive && a.difficulty === "medium")
          .slice(0, 2)

        if (assessmentsForSkill.length > 0) {
          recommendations.push({
            skill,
            reason: `You're doing well with ${Math.round(avgScore)}% proficiency. Take intermediate assessments to reach expert level.`,
            priority: "medium",
            currentProficiency: Math.round(avgScore),
            targetProficiency: 85,
            recommendedAssessments: assessmentsForSkill.map((a: any) => ({
              id: a.id,
              title: a.title,
              difficulty: a.difficulty
            }))
          })
        }
      }
    }

    // 3. Suggest new skills if student has mastered current ones
    if (recommendations.length === 0) {
      const masteredSkills = Array.from(skillPerformance.keys())
      const allAssessmentsSnapshot = await getDocs(query(
        collection(db, "assessments"),
        where("isActive", "==", true)
      ))
      
      const newSkills = new Set<string>()
      allAssessmentsSnapshot.docs.forEach(doc => {
        const assessment = doc.data()
        if (!masteredSkills.includes(assessment.skill)) {
          newSkills.add(assessment.skill)
        }
      })

      // Recommend top 3 new skills
      Array.from(newSkills).slice(0, 3).forEach(skill => {
        const assessmentsForSkill = allAssessmentsSnapshot.docs
          .filter(doc => doc.data().skill === skill)
          .slice(0, 2)
          .map(doc => ({
            id: doc.id,
            title: doc.data().title,
            difficulty: doc.data().difficulty
          }))

        recommendations.push({
          skill,
          reason: "Expand your skillset by exploring this new area. It complements your existing expertise.",
          priority: "low",
          currentProficiency: 0,
          targetProficiency: 70,
          recommendedAssessments: assessmentsForSkill
        })
      })
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 }
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    })
  } catch (error) {
    console.error("Error generating skill recommendations:", error)
    return getDefaultRecommendations()
  }
}

/**
 * Get default recommendations for new students
 */
function getDefaultRecommendations(): SkillRecommendation[] {
  return [
    {
      skill: "Programming Fundamentals",
      reason: "Start your learning journey with programming basics. This foundational skill is essential for all developers.",
      priority: "high",
      currentProficiency: 0,
      targetProficiency: 70,
      recommendedAssessments: []
    },
    {
      skill: "Web Development",
      reason: "Learn to build modern web applications. This is one of the most in-demand skills in the industry.",
      priority: "medium",
      currentProficiency: 0,
      targetProficiency: 70,
      recommendedAssessments: []
    },
    {
      skill: "Data Structures",
      reason: "Master data structures to solve complex problems efficiently. Essential for technical interviews.",
      priority: "medium",
      currentProficiency: 0,
      targetProficiency: 70,
      recommendedAssessments: []
    }
  ]
}

/**
 * Get personalized learning path based on career goals
 * @param studentId - Student's Firebase UID
 * @param careerGoal - Target career path (e.g., "Full Stack Developer", "Data Scientist")
 * @returns Ordered list of skills to learn
 */
export async function getCareerPathRecommendations(
  studentId: string,
  careerGoal: string
): Promise<string[]> {
  // Career path mappings
  const careerPaths: Record<string, string[]> = {
    "Full Stack Developer": [
      "HTML/CSS",
      "JavaScript",
      "React",
      "Node.js",
      "Databases",
      "API Design",
      "Cloud Deployment"
    ],
    "Data Scientist": [
      "Python",
      "Statistics",
      "Machine Learning",
      "Data Visualization",
      "SQL",
      "Deep Learning",
      "Big Data"
    ],
    "Mobile Developer": [
      "Programming Fundamentals",
      "React Native",
      "Flutter",
      "Mobile UI/UX",
      "API Integration",
      "App Deployment"
    ],
    "DevOps Engineer": [
      "Linux",
      "Docker",
      "Kubernetes",
      "CI/CD",
      "Cloud Platforms",
      "Monitoring",
      "Infrastructure as Code"
    ]
  }

  const path = careerPaths[careerGoal] || careerPaths["Full Stack Developer"]

  // Get student's current skills to filter already mastered ones
  try {
    const attemptsQuery = query(
      collection(db, "attempts"),
      where("studentId", "==", studentId),
      where("status", "==", "completed"),
      where("percentage", ">=", 75)
    )

    const attemptsSnapshot = await getDocs(attemptsQuery)
    const attempts = attemptsSnapshot.docs.map(doc => doc.data()) as any[]

    const assessmentIds = [...new Set(attempts.map((a: any) => a.assessmentId))]
    const assessmentPromises = assessmentIds.map(id => getDoc(doc(db, "assessments", id)))
    const assessmentDocs = await Promise.all(assessmentPromises)
    
    const masteredSkills = new Set<string>()
    assessmentDocs.forEach(doc => {
      if (doc.exists()) {
        masteredSkills.add(doc.data().skill)
      }
    })

    // Filter out mastered skills from recommended path
    return path.filter(skill => !masteredSkills.has(skill))
  } catch (error) {
    console.error("Error getting career path recommendations:", error)
    return path
  }
}
