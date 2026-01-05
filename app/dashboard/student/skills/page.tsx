"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { DashboardShell } from "@/components/dashboard-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Target,
  TrendingUp,
  TrendingDown,
  Minus,
  Award,
  BookOpen,
  CheckCircle2,
} from "lucide-react"
import { getAttemptsByStudent } from "@/lib/firebase/assessments"
import { cn } from "@/lib/utils"

export default function StudentSkillsPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [attempts, setAttempts] = useState<any[]>([])

  useEffect(() => {
    loadData()
  }, [user])

  const loadData = async () => {
    if (!user?.uid) return

    setLoading(true)
    try {
      const attemptsData = await getAttemptsByStudent(user.uid)
      setAttempts(attemptsData)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate skill stats from attempts
  const skillStats = attempts.reduce((acc: any, attempt) => {
    const skill = "General" // Would come from assessment skill
    if (!acc[skill]) {
      acc[skill] = {
        totalAttempts: 0,
        totalScore: 0,
        bestScore: 0,
        recentScores: [],
      }
    }
    acc[skill].totalAttempts++
    acc[skill].totalScore += attempt.percentage
    acc[skill].bestScore = Math.max(acc[skill].bestScore, attempt.percentage)
    acc[skill].recentScores.push(attempt.percentage)
    return acc
  }, {})

  const skills = Object.keys(skillStats).map((skill) => {
    const data = skillStats[skill]
    const avgScore = data.totalScore / data.totalAttempts
    const trend =
      data.recentScores.length > 1
        ? data.recentScores[data.recentScores.length - 1] - data.recentScores[0]
        : 0

    return {
      name: skill,
      progress: avgScore,
      attempts: data.totalAttempts,
      bestScore: data.bestScore,
      trend: trend > 5 ? "up" : trend < -5 ? "down" : "stable",
    }
  })

  // Mock data if no attempts
  const displaySkills =
    skills.length > 0
      ? skills
      : [
          {
            name: "React Development",
            progress: 75,
            attempts: 0,
            bestScore: 0,
            trend: "stable",
          },
          {
            name: "Node.js",
            progress: 60,
            attempts: 0,
            bestScore: 0,
            trend: "stable",
          },
          {
            name: "Python",
            progress: 85,
            attempts: 0,
            bestScore: 0,
            trend: "up",
          },
          {
            name: "Data Structures",
            progress: 45,
            attempts: 0,
            bestScore: 0,
            trend: "down",
          },
        ]

  return (
    <DashboardShell
      heading="My Skills"
      description="Track your skill progress and identify improvement areas"
    >
      <div className="space-y-6">
        {/* Overview Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Skills</CardDescription>
              <CardTitle className="text-3xl">{displaySkills.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Average Proficiency</CardDescription>
              <CardTitle className="text-3xl">
                {displaySkills.length > 0
                  ? Math.round(
                      displaySkills.reduce((acc, s) => acc + s.progress, 0) /
                        displaySkills.length
                    )
                  : 0}
                %
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Improving</CardDescription>
              <CardTitle className="text-3xl text-green-600">
                {displaySkills.filter((s) => s.trend === "up").length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Need Focus</CardDescription>
              <CardTitle className="text-3xl text-orange-600">
                {displaySkills.filter((s) => s.progress < 60).length}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Skill Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Skill Progress</CardTitle>
            <CardDescription>Your competency levels across different skills</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {displaySkills.map((skill, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{skill.name}</span>
                    {skill.trend === "up" && (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    )}
                    {skill.trend === "down" && (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    )}
                    {skill.trend === "stable" && (
                      <Minus className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    {skill.attempts > 0 && (
                      <span className="text-xs text-muted-foreground">
                        {skill.attempts} attempts
                      </span>
                    )}
                    <span className="text-sm font-semibold">{Math.round(skill.progress)}%</span>
                  </div>
                </div>
                <Progress value={skill.progress} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Skill Categories */}
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All Skills</TabsTrigger>
            <TabsTrigger value="strong">Strong</TabsTrigger>
            <TabsTrigger value="improving">Improving</TabsTrigger>
            <TabsTrigger value="focus">Need Focus</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {displaySkills.map((skill, idx) => (
                <SkillCard key={idx} skill={skill} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="strong" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {displaySkills
                .filter((s) => s.progress >= 75)
                .map((skill, idx) => (
                  <SkillCard key={idx} skill={skill} />
                ))}
            </div>
          </TabsContent>

          <TabsContent value="improving" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {displaySkills
                .filter((s) => s.trend === "up")
                .map((skill, idx) => (
                  <SkillCard key={idx} skill={skill} />
                ))}
            </div>
          </TabsContent>

          <TabsContent value="focus" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {displaySkills
                .filter((s) => s.progress < 60)
                .map((skill, idx) => (
                  <SkillCard key={idx} skill={skill} />
                ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle>Recommended Actions</CardTitle>
            <CardDescription>Personalized suggestions to improve your skills</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {displaySkills
              .filter((s) => s.progress < 60)
              .slice(0, 3)
              .map((skill, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3 rounded-lg border bg-accent/5"
                >
                  <Target className="h-5 w-5 text-primary mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">Focus on {skill.name}</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Current proficiency: {Math.round(skill.progress)}%. Take more assessments to
                      improve your score.
                    </p>
                  </div>
                </div>
              ))}
            {displaySkills.filter((s) => s.progress < 60).length === 0 && (
              <div className="text-center py-6 text-muted-foreground">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Great work! All skills are performing well.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}

function SkillCard({ skill }: { skill: any }) {
  const getColorClass = (progress: number) => {
    if (progress >= 75) return "text-green-600 bg-green-50 border-green-200"
    if (progress >= 50) return "text-yellow-600 bg-yellow-50 border-yellow-200"
    return "text-red-600 bg-red-50 border-red-200"
  }

  return (
    <Card className={cn("border-2", getColorClass(skill.progress))}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <BookOpen className="h-6 w-6" />
          {skill.trend === "up" && <TrendingUp className="h-5 w-5 text-green-600" />}
          {skill.trend === "down" && <TrendingDown className="h-5 w-5 text-red-600" />}
        </div>
        <CardTitle className="text-lg mt-2">{skill.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Proficiency</span>
            <span className="font-semibold">{Math.round(skill.progress)}%</span>
          </div>
          <Progress value={skill.progress} className="h-2" />
        </div>
        {skill.attempts > 0 && (
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{skill.attempts} attempts</span>
            <span>Best: {skill.bestScore}%</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
