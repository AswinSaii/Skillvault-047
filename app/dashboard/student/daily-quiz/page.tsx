"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { DashboardShell } from "@/components/dashboard-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Flame,
  Trophy,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Target,
  Zap,
} from "lucide-react"
import { getUserStreak, getTodayQuiz, updateUserStreak } from "@/lib/firebase/assessments"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export default function DailyQuizPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [streakData, setStreakData] = useState<any>(null)
  const [todayQuiz, setTodayQuiz] = useState<any>(null)
  const [quizStarted, setQuizStarted] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<any[]>([])
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [score, setScore] = useState(0)

  useEffect(() => {
    loadData()
  }, [user])

  const loadData = async () => {
    if (!user?.uid) return

    setLoading(true)
    try {
      const [streak, quiz] = await Promise.all([
        getUserStreak(user.uid),
        getTodayQuiz(),
      ])

      setStreakData(streak)
      setTodayQuiz(quiz)

      // Check if already completed today
      const today = new Date().toISOString().split("T")[0]
      if (streak?.lastQuizDate === today) {
        setQuizCompleted(true)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleStartQuiz = () => {
    setQuizStarted(true)
    setCurrentQuestion(0)
    setAnswers([])
  }

  const handleAnswer = (answer: any) => {
    const newAnswers = [...answers]
    newAnswers[currentQuestion] = answer
    setAnswers(newAnswers)

    if (currentQuestion < 4) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      completeQuiz(newAnswers)
    }
  }

  const completeQuiz = async (finalAnswers: any[]) => {
    // Calculate score (mock)
    const calculatedScore = Math.floor(Math.random() * 3) + 3 // 3-5 correct

    setScore(calculatedScore)
    setQuizCompleted(true)

    // Update streak
    if (user?.uid) {
      await updateUserStreak(user.uid, true)
      await loadData()
      toast.success("Daily quiz completed! Streak maintained!")
    }
  }

  const mockQuestions = [
    {
      question: "What is the time complexity of binary search?",
      options: ["O(n)", "O(log n)", "O(n²)", "O(1)"],
      correct: 1,
    },
    {
      question: "Which hook is used for side effects in React?",
      options: ["useState", "useEffect", "useContext", "useMemo"],
      correct: 1,
    },
    {
      question: "What does REST stand for?",
      options: [
        "Remote State Transfer",
        "Representational State Transfer",
        "Real-time State Transfer",
        "Responsive State Transfer",
      ],
      correct: 1,
    },
    {
      question: "Which HTTP method is idempotent?",
      options: ["POST", "PUT", "PATCH", "All of them"],
      correct: 1,
    },
    {
      question: "What is the purpose of async/await?",
      options: [
        "Handle synchronous code",
        "Handle asynchronous code",
        "Improve performance",
        "Debug code",
      ],
      correct: 1,
    },
  ]

  if (loading) {
    return (
      <DashboardShell
        heading="Daily Quiz"
        description="Maintain your streak with daily challenges"
      >
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      </DashboardShell>
    )
  }

  if (quizCompleted && !quizStarted) {
    return (
      <DashboardShell
        heading="Daily Quiz"
        description="Maintain your streak with daily challenges"
      >
        <div className="max-w-2xl mx-auto space-y-6">
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardContent className="pt-6 text-center">
              <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Quiz Completed!</h2>
              <p className="text-muted-foreground mb-6">
                You've already completed today's quiz. Come back tomorrow!
              </p>
              <div className="flex items-center justify-center gap-2 text-lg">
                <Flame className="h-6 w-6 text-orange-500" />
                <span className="font-bold">{streakData?.currentStreak || 0} Day Streak</span>
              </div>
            </CardContent>
          </Card>

          <StreakCalendar streak={streakData} />
        </div>
      </DashboardShell>
    )
  }

  if (quizStarted && quizCompleted) {
    return (
      <DashboardShell
        heading="Daily Quiz"
        description="Maintain your streak with daily challenges"
      >
        <div className="max-w-2xl mx-auto space-y-6">
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardContent className="pt-6 text-center">
              <Trophy className="h-16 w-16 text-yellow-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Congratulations!</h2>
              <p className="text-muted-foreground mb-4">You scored {score} out of 5</p>
              <div className="flex items-center justify-center gap-2 text-lg mb-6">
                <Flame className="h-6 w-6 text-orange-500" />
                <span className="font-bold">{streakData?.currentStreak || 0} Day Streak</span>
              </div>
              <Button onClick={() => router.push("/dashboard/student")}>
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>

          <StreakCalendar streak={streakData} />
        </div>
      </DashboardShell>
    )
  }

  if (quizStarted) {
    const question = mockQuestions[currentQuestion]

    return (
      <DashboardShell
        heading="Daily Quiz"
        description="Maintain your streak with daily challenges"
      >
        <div className="max-w-2xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Badge>Question {currentQuestion + 1} of 5</Badge>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>5 mins remaining</span>
                </div>
              </div>
              <Progress value={((currentQuestion + 1) / 5) * 100} className="mt-4" />
            </CardHeader>
            <CardContent className="space-y-6">
              <h3 className="text-xl font-semibold">{question.question}</h3>

              <div className="space-y-3">
                {question.options.map((option, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    className="w-full justify-start text-left h-auto py-4 px-6"
                    onClick={() => handleAnswer(idx)}
                  >
                    <span className="mr-3 font-bold">{String.fromCharCode(65 + idx)}.</span>
                    {option}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell
      heading="Daily Quiz"
      description="Maintain your streak with daily challenges"
    >
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Streak Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Current Streak</CardDescription>
              <CardTitle className="text-3xl flex items-center gap-2">
                <Flame className="h-8 w-8 text-orange-500" />
                {streakData?.currentStreak || 0}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Longest Streak</CardDescription>
              <CardTitle className="text-3xl flex items-center gap-2">
                <Trophy className="h-8 w-8 text-yellow-600" />
                {streakData?.longestStreak || 0}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Quizzes</CardDescription>
              <CardTitle className="text-3xl flex items-center gap-2">
                <Target className="h-8 w-8 text-primary" />
                {streakData?.totalQuizzesTaken || 0}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Start Quiz Card */}
        <Card className="bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200">
          <CardHeader>
            <CardTitle className="text-2xl">Today's Challenge</CardTitle>
            <CardDescription className="text-base">
              5 questions • 5 minutes • Maintain your streak
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-base px-4 py-2">
                <Zap className="mr-2 h-4 w-4" />
                Quick Quiz
              </Badge>
              <Badge variant="secondary" className="text-base px-4 py-2">
                Mixed Topics
              </Badge>
            </div>
            <Button size="lg" className="w-full" onClick={handleStartQuiz}>
              <Flame className="mr-2 h-5 w-5" />
              Start Quiz
            </Button>
          </CardContent>
        </Card>

        {/* Streak Calendar */}
        <StreakCalendar streak={streakData} />

        {/* Streak Milestones */}
        <Card>
          <CardHeader>
            <CardTitle>Streak Milestones</CardTitle>
            <CardDescription>Achieve these goals to unlock badges</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { days: 3, badge: "🔥 Fire Starter", unlocked: (streakData?.longestStreak || 0) >= 3 },
              { days: 7, badge: "⚡ Week Warrior", unlocked: (streakData?.longestStreak || 0) >= 7 },
              { days: 30, badge: "💪 Month Master", unlocked: (streakData?.longestStreak || 0) >= 30 },
              { days: 100, badge: "🏆 Century Champion", unlocked: (streakData?.longestStreak || 0) >= 100 },
            ].map((milestone, idx) => (
              <div
                key={idx}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg border",
                  milestone.unlocked ? "bg-green-50 border-green-200" : "bg-muted/30"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{milestone.badge.split(" ")[0]}</div>
                  <div>
                    <div className="font-medium">{milestone.badge.split(" ").slice(1).join(" ")}</div>
                    <div className="text-xs text-muted-foreground">{milestone.days} day streak</div>
                  </div>
                </div>
                {milestone.unlocked ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <div className="text-xs text-muted-foreground">Locked</div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}

function StreakCalendar({ streak }: { streak: any }) {
  const today = new Date()
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today)
    date.setDate(date.getDate() - (6 - i))
    return date
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>7-Day Activity</CardTitle>
        <CardDescription>Your quiz completion history</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2">
          {last7Days.map((date, idx) => {
            const dateStr = date.toISOString().split("T")[0]
            const isToday = dateStr === new Date().toISOString().split("T")[0]
            const isCompleted = streak?.streakHistory?.some((h: any) => h.date === dateStr && h.completed)

            return (
              <div key={idx} className="text-center">
                <div className="text-xs text-muted-foreground mb-1">
                  {date.toLocaleDateString("en-US", { weekday: "short" })}
                </div>
                <div
                  className={cn(
                    "aspect-square rounded-lg border-2 flex items-center justify-center",
                    isCompleted
                      ? "bg-green-100 border-green-500"
                      : isToday
                        ? "border-primary border-dashed"
                        : "border-muted"
                  )}
                >
                  {isCompleted && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                </div>
                <div className="text-xs mt-1">{date.getDate()}</div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
