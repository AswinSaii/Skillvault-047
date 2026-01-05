import type { Attempt } from "./assessments"
import type { Assessment } from "./assessments"

export interface SkillGapAnalysis {
  weakSkills: {
    skill: string
    averageScore: number
    attemptCount: number
    failedAttempts: number
    lowestScore: number
    highestScore: number
    trend: "improving" | "declining" | "stable"
  }[]
  recommendedSkills: {
    skill: string
    reason: string
    priority: "high" | "medium" | "low"
    relatedToWeakSkill?: string
  }[]
  overallInsights: {
    totalAttempts: number
    passRate: number
    averageScore: number
    strongestSkill: string | null
    weakestSkill: string | null
  }
}

/**
 * Analyze student's skill gaps based on assessment history
 */
export function analyzeSkillGaps(
  attempts: Attempt[],
  assessments: Assessment[]
): SkillGapAnalysis {
  // Group attempts by skill
  const skillAttempts = new Map<string, { scores: number[]; timestamps: Date[] }>()
  
  attempts.forEach((attempt) => {
    const assessment = assessments.find((a) => a.id === attempt.assessmentId)
    if (!assessment) return

    const skill = assessment.skill
    if (!skillAttempts.has(skill)) {
      skillAttempts.set(skill, { scores: [], timestamps: [] })
    }

    const data = skillAttempts.get(skill)!
    data.scores.push(attempt.percentage || 0)
    data.timestamps.push(attempt.startedAt)
  })

  // Calculate weak skills (below 75% average or high failure rate)
  const weakSkills: SkillGapAnalysis["weakSkills"] = []
  
  skillAttempts.forEach((data, skill) => {
    const scores = data.scores
    const timestamps = data.timestamps
    const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length
    const failedAttempts = scores.filter(s => s < 70).length
    const lowestScore = Math.min(...scores)
    const highestScore = Math.max(...scores)

    // Determine trend
    let trend: "improving" | "declining" | "stable" = "stable"
    if (scores.length >= 2) {
      const firstHalf = scores.slice(0, Math.floor(scores.length / 2))
      const secondHalf = scores.slice(Math.floor(scores.length / 2))
      const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length
      const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length
      
      if (secondAvg > firstAvg + 5) trend = "improving"
      else if (secondAvg < firstAvg - 5) trend = "declining"
    }

    // Consider weak if average < 75% or failure rate > 40%
    const failureRate = failedAttempts / scores.length
    if (averageScore < 75 || failureRate > 0.4) {
      weakSkills.push({
        skill,
        averageScore: Math.round(averageScore),
        attemptCount: scores.length,
        failedAttempts,
        lowestScore,
        highestScore,
        trend,
      })
    }
  })

  // Sort weak skills by priority (lowest average, highest failure rate)
  weakSkills.sort((a, b) => {
    const priorityA = a.averageScore + (a.failedAttempts / a.attemptCount) * -20
    const priorityB = b.averageScore + (b.failedAttempts / b.attemptCount) * -20
    return priorityA - priorityB
  })

  // Generate skill recommendations
  const recommendedSkills = generateRecommendations(weakSkills, skillAttempts, assessments)

  // Calculate overall insights
  const allScores = Array.from(skillAttempts.values()).flatMap(d => d.scores)
  const passedAttempts = allScores.filter(s => s >= 70).length
  const totalAttempts = allScores.length
  const averageScore = totalAttempts > 0 
    ? allScores.reduce((a, b) => a + b, 0) / totalAttempts 
    : 0
  const passRate = totalAttempts > 0 
    ? (passedAttempts / totalAttempts) * 100 
    : 0

  // Find strongest and weakest skills
  let strongestSkill: string | null = null
  let weakestSkill: string | null = null
  let highestAvg = -1
  let lowestAvg = 101

  skillAttempts.forEach((data, skill) => {
    const avg = data.scores.reduce((a, b) => a + b, 0) / data.scores.length
    if (avg > highestAvg) {
      highestAvg = avg
      strongestSkill = skill
    }
    if (avg < lowestAvg) {
      lowestAvg = avg
      weakestSkill = skill
    }
  })

  return {
    weakSkills,
    recommendedSkills,
    overallInsights: {
      totalAttempts,
      passRate: Math.round(passRate),
      averageScore: Math.round(averageScore),
      strongestSkill,
      weakestSkill,
    },
  }
}

/**
 * Generate skill recommendations based on weak areas
 */
function generateRecommendations(
  weakSkills: SkillGapAnalysis["weakSkills"],
  skillAttempts: Map<string, { scores: number[]; timestamps: Date[] }>,
  assessments: Assessment[]
): SkillGapAnalysis["recommendedSkills"] {
  const recommendations: SkillGapAnalysis["recommendedSkills"] = []

  // Skill dependency map (foundational skills needed for advanced topics)
  const skillDependencies: Record<string, string[]> = {
    "JavaScript": ["HTML", "CSS", "Programming Basics"],
    "React": ["JavaScript", "HTML", "CSS"],
    "Node.js": ["JavaScript"],
    "Python": ["Programming Basics"],
    "Django": ["Python"],
    "Flask": ["Python"],
    "Data Structures": ["Programming Basics"],
    "Algorithms": ["Data Structures", "Programming Basics"],
    "Machine Learning": ["Python", "Mathematics", "Statistics"],
    "Deep Learning": ["Machine Learning", "Python"],
    "SQL": ["Database Concepts"],
    "MongoDB": ["Database Concepts"],
    "AWS": ["Cloud Computing Basics"],
    "Docker": ["Linux", "DevOps Basics"],
    "Kubernetes": ["Docker", "DevOps Basics"],
  }

  // 1. Recommend re-taking weak skills with declining trend
  weakSkills
    .filter(ws => ws.trend === "declining" && ws.averageScore < 70)
    .slice(0, 2)
    .forEach(ws => {
      recommendations.push({
        skill: ws.skill,
        reason: `Your scores are declining (avg ${ws.averageScore}%). Review fundamentals and retry.`,
        priority: "high",
      })
    })

  // 2. Recommend foundational skills if weak in advanced topics
  weakSkills.forEach(ws => {
    const dependencies = skillDependencies[ws.skill] || []
    dependencies.forEach(dep => {
      const depData = skillAttempts.get(dep)
      const depAvg = depData 
        ? depData.scores.reduce((a, b) => a + b, 0) / depData.scores.length 
        : 0

      // If foundational skill is also weak or not attempted
      if (!depData || depAvg < 75) {
        const exists = recommendations.some(r => r.skill === dep)
        if (!exists) {
          recommendations.push({
            skill: dep,
            reason: `Foundational skill needed to improve ${ws.skill}`,
            priority: "high",
            relatedToWeakSkill: ws.skill,
          })
        }
      }
    })
  })

  // 3. Recommend similar/related skills to strengthen weak areas
  const skillCategories: Record<string, string[]> = {
    "Frontend": ["HTML", "CSS", "JavaScript", "React", "Vue", "Angular"],
    "Backend": ["Node.js", "Python", "Java", "PHP", "Django", "Flask"],
    "Database": ["SQL", "MongoDB", "PostgreSQL", "Redis"],
    "DevOps": ["Docker", "Kubernetes", "CI/CD", "AWS", "Azure"],
    "Data Science": ["Python", "Machine Learning", "Deep Learning", "Statistics"],
  }

  weakSkills.slice(0, 3).forEach(ws => {
    // Find which category the weak skill belongs to
    let category: string | null = null
    Object.entries(skillCategories).forEach(([cat, skills]) => {
      if (skills.includes(ws.skill)) category = cat
    })

    if (category) {
      const relatedSkills = skillCategories[category].filter(s => 
        s !== ws.skill && !skillAttempts.has(s)
      )

      relatedSkills.slice(0, 1).forEach(skill => {
        const exists = recommendations.some(r => r.skill === skill)
        if (!exists) {
          recommendations.push({
            skill,
            reason: `Strengthen ${category} skills alongside ${ws.skill}`,
            priority: "medium",
          })
        }
      })
    }
  })

  // 4. Recommend skills with improving trend but still below target
  weakSkills
    .filter(ws => ws.trend === "improving" && ws.averageScore >= 65 && ws.averageScore < 80)
    .slice(0, 2)
    .forEach(ws => {
      const exists = recommendations.some(r => r.skill === ws.skill)
      if (!exists) {
        recommendations.push({
          skill: ws.skill,
          reason: `You're improving (${ws.averageScore}%)! Push for mastery (>80%).`,
          priority: "medium",
        })
      }
    })

  // 5. Recommend popular skills not yet attempted (from available assessments)
  const attemptedSkills = new Set(skillAttempts.keys())
  const popularSkills = ["JavaScript", "Python", "React", "SQL", "Git"]
  
  popularSkills.forEach(skill => {
    if (!attemptedSkills.has(skill)) {
      const hasAssessment = assessments.some(a => a.skill === skill)
      if (hasAssessment) {
        const exists = recommendations.some(r => r.skill === skill)
        if (!exists && recommendations.length < 8) {
          recommendations.push({
            skill,
            reason: "In-demand skill - expand your portfolio",
            priority: "low",
          })
        }
      }
    }
  })

  // Sort by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 }
  recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])

  return recommendations.slice(0, 8) // Return top 8 recommendations
}

/**
 * Get personalized study plan based on skill gaps
 */
export function generateStudyPlan(analysis: SkillGapAnalysis): {
  weekPlan: {
    week: number
    focus: string
    skills: string[]
    goal: string
  }[]
} {
  const weekPlan: {
    week: number
    focus: string
    skills: string[]
    goal: string
  }[] = []

  const highPriority = analysis.recommendedSkills.filter(r => r.priority === "high")
  const mediumPriority = analysis.recommendedSkills.filter(r => r.priority === "medium")
  const lowPriority = analysis.recommendedSkills.filter(r => r.priority === "low")

  // Week 1-2: High priority skills
  if (highPriority.length > 0) {
    weekPlan.push({
      week: 1,
      focus: "Critical Skill Gaps",
      skills: highPriority.slice(0, 2).map(r => r.skill),
      goal: "Address foundational weaknesses",
    })

    if (highPriority.length > 2) {
      weekPlan.push({
        week: 2,
        focus: "Core Skills",
        skills: highPriority.slice(2, 4).map(r => r.skill),
        goal: "Build strong foundation",
      })
    }
  }

  // Week 3-4: Medium priority skills
  if (mediumPriority.length > 0) {
    weekPlan.push({
      week: weekPlan.length + 1,
      focus: "Skill Enhancement",
      skills: mediumPriority.slice(0, 2).map(r => r.skill),
      goal: "Improve existing knowledge",
    })
  }

  // Week 5+: Low priority (optional)
  if (lowPriority.length > 0) {
    weekPlan.push({
      week: weekPlan.length + 1,
      focus: "Skill Expansion",
      skills: lowPriority.slice(0, 2).map(r => r.skill),
      goal: "Broaden skill portfolio",
    })
  }

  return { weekPlan }
}
