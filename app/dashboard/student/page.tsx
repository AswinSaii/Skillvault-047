"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { DashboardShell } from "@/components/dashboard-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Award, 
  BookOpen, 
  Clock, 
  Zap, 
  TrendingUp, 
  Target,
  PlayCircle,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Trophy,
  Flame
} from "lucide-react"
import { cn } from "@/lib/utils"
import { getUserStreak } from "@/lib/firebase/assessments"
import { getActiveAssessmentsForStudent } from "@/lib/firebase/assessments"
import { getAttemptsByStudent } from "@/lib/firebase/assessments"
import { getSkillRecommendations, SkillRecommendation } from "@/lib/firebase/recommendations"
import { DummyDataButton } from "@/components/dummy-data-button"

export default function StudentDashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [streakData, setStreakData] = useState<any>(null)
  const [upcomingAssessments, setUpcomingAssessments] = useState<any[]>([])
  const [recentAttempts, setRecentAttempts] = useState<any[]>([])
  const [recommendations, setRecommendations] = useState<SkillRecommendation[]>([])

  useEffect(() => {
    loadDashboardData()
  }, [user])

  const loadDashboardData = async () => {
    if (!user?.uid || !user?.collegeId) return

    setLoading(true)
    try {
      const [streak, assessments, attempts, skillRecs] = await Promise.all([
        getUserStreak(user.uid),
        getActiveAssessmentsForStudent(user.collegeId, user.uid),
        getAttemptsByStudent(user.uid),
        getSkillRecommendations(user.uid),
      ])

      setStreakData(streak)
      setUpcomingAssessments(assessments.slice(0, 5))
      setRecentAttempts(attempts.slice(0, 5))
      setRecommendations(skillRecs.slice(0, 3)) // Show top 3 recommendations
    } catch (error) {
      console.error("Error loading dashboard:", error)
    } finally {
      setLoading(false)
    }
  }

  const stats = {
    currentStreak: streakData?.currentStreak || 0,
    longestStreak: streakData?.longestStreak || 0,
    certificatesEarned: recentAttempts.filter((a: any) => a.percentage >= 70).length,
    upcomingTests: upcomingAssessments.length,
    averageScore: recentAttempts.length > 0 
      ? Math.round(recentAttempts.reduce((acc: number, a: any) => acc + a.percentage, 0) / recentAttempts.length)
      : 0,
    totalAttempts: recentAttempts.length,
  }

  return (
    <DashboardShell
      heading="Student Dashboard"
      description="Welcome back! Track your skills and maintain your streak."
    >
      <div className="space-y-6">
        <div className="flex justify-end">
          <DummyDataButton />
        </div>
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
              <Flame className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.currentStreak} Days</div>
              <p className="text-xs text-muted-foreground">
                Best: {stats.longestStreak} days
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Certificates</CardTitle>
              <Award className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.certificatesEarned}</div>
              <p className="text-xs text-muted-foreground">From {stats.totalAttempts} attempts</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Tests</CardTitle>
              <BookOpen className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.upcomingTests}</div>
              <p className="text-xs text-muted-foreground">
                {upcomingAssessments[0]?.title || "No upcoming tests"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageScore}%</div>
              <p className="text-xs text-muted-foreground">From {stats.totalAttempts} attempts</p>
            </CardContent>
          </Card>
        </div>

        {/* Daily Quiz Banner */}
        <Card className="bg-linear-to-r from-orange-50 to-amber-50 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Flame className="h-5 w-5 text-orange-500" />
                  Daily Challenge
                </h3>
                <p className="text-sm text-muted-foreground">
                  Keep your streak alive! Complete today's quiz
                </p>
              </div>
              <Button onClick={() => router.push("/dashboard/student/daily-quiz")}>
                Start Quiz
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Upcoming Assessments */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Upcoming Assessments</CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => router.push("/dashboard/student/assessments")}
                >
                  View All
                </Button>
              </div>
              <CardDescription>Scheduled tests and challenges</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center text-muted-foreground py-8">Loading...</div>
              ) : upcomingAssessments.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No upcoming assessments</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingAssessments.map((assessment: any, idx: number) => (
                    <div key={idx} className="flex items-start justify-between p-3 border rounded-lg">
                      <div className="space-y-1 flex-1">
                        <div className="font-medium">{assessment.title}</div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {assessment.duration} mins
                          <Badge variant="outline" className="ml-2">
                            {assessment.skill}
                          </Badge>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => router.push(`/dashboard/student/assessments/${assessment.id}`)}
                      >
                        <PlayCircle className="h-4 w-4 mr-1" />
                        Start
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Results */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Results</CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => router.push("/dashboard/student/history")}
                >
                  View All
                </Button>
              </div>
              <CardDescription>Your latest assessment scores</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center text-muted-foreground py-8">Loading...</div>
              ) : recentAttempts.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <Trophy className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No attempts yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentAttempts.map((attempt: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "h-10 w-10 rounded-full flex items-center justify-center",
                          attempt.percentage >= 70 ? "bg-green-100" : "bg-red-100"
                        )}>
                          {attempt.percentage >= 70 ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-red-600" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-sm">Assessment #{idx + 1}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(attempt.submittedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{attempt.percentage}%</div>
                        <div className="text-xs text-muted-foreground">
                          {attempt.score}/{attempt.totalMarks}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button 
                variant="outline" 
                className="h-24 flex-col gap-2"
                onClick={() => router.push("/dashboard/student/assessments")}
              >
                <BookOpen className="h-6 w-6" />
                Take Test
              </Button>
              <Button 
                variant="outline" 
                className="h-24 flex-col gap-2"
                onClick={() => router.push("/dashboard/student/certificates")}
              >
                <Award className="h-6 w-6" />
                Certificates
              </Button>
              <Button 
                variant="outline" 
                className="h-24 flex-col gap-2"
                onClick={() => router.push("/dashboard/student/skills")}
              >
                <Target className="h-6 w-6" />
                Skills
              </Button>
              <Button 
                variant="outline" 
                className="h-24 flex-col gap-2"
                onClick={() => router.push("/dashboard/student/daily-quiz")}
              >
                <Flame className="h-6 w-6 text-orange-500" />
                Daily Quiz
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Skill Gap Recommendations */}
        {recommendations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Recommended for You
              </CardTitle>
              <CardDescription>Skills to focus on next</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recommendations.map((rec) => (
                  <div key={rec.skill} className="flex items-start justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{rec.skill}</h4>
                        <Badge variant={
                          rec.priority === "high" ? "destructive" : 
                          rec.priority === "medium" ? "default" : 
                          "secondary"
                        }>
                          {rec.priority} priority
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{rec.reason}</p>
                      {rec.currentProficiency !== undefined && (
                        <p className="text-xs text-muted-foreground">
                          Current: {rec.currentProficiency}%
                        </p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      onClick={() => {
                        if (rec.recommendedAssessments && rec.recommendedAssessments.length > 0) {
                          router.push(`/dashboard/student/assessments/${rec.recommendedAssessments[0]}`)
                        }
                      }}
                      disabled={!rec.recommendedAssessments || rec.recommendedAssessments.length === 0}
                    >
                      Start Learning
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardShell>
  )
}
