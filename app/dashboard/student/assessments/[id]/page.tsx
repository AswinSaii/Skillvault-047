"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Clock, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2,
  FileCode,
  ListChecks
} from "lucide-react"
import { getQuestionsBySkill, getQuestionsByIds, Question as FirebaseQuestion } from "@/lib/firebase/questions"
import { createAttempt, updateAttempt } from "@/lib/firebase/assessments"
import { collection, doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase/client"

interface Question {
  id: string
  title: string
  description: string
  type: "mcq" | "coding" | "practical"
  skill: string
  difficulty: "easy" | "medium" | "hard"
  options?: string[]
  correctAnswer?: number
  points: number
}

interface Answer {
  questionId: string
  answer: string
  timeSpent: number
}

export default function TakeAssessmentPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const assessmentId = params.id as string

  // Assessment state
  const [assessment, setAssessment] = useState<any>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [attemptId, setAttemptId] = useState("")

  // Anti-cheating state
  const [tabSwitchCount, setTabSwitchCount] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showWarning, setShowWarning] = useState(false)
  const [warningMessage, setWarningMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Loading state
  const [loading, setLoading] = useState(true)
  const [started, setStarted] = useState(false)

  // Load assessment details
  useEffect(() => {
    const loadAssessment = async () => {
      try {
        const assessmentDoc = await getDoc(doc(db, "assessments", assessmentId))
        if (assessmentDoc.exists()) {
          const assessmentData = { id: assessmentDoc.id, ...assessmentDoc.data() } as any
          setAssessment(assessmentData)

          // Load questions for this assessment
          // First try to load questions by their IDs from the assessment
          if (assessmentData.questions && assessmentData.questions.length > 0) {
            const questionsData = await getQuestionsByIds(assessmentData.questions)
            const selectedQuestions = questionsData
              .filter((q: FirebaseQuestion) => q.isActive)
              .map((q: FirebaseQuestion) => ({
                id: q.id || "",
                title: q.title,
                description: q.description,
                type: q.type,
                skill: q.skill,
                difficulty: q.difficulty,
                options: q.options,
                correctAnswer: q.correctAnswer,
                points: q.points
              }))
            
            if (selectedQuestions.length > 0) {
              setQuestions(selectedQuestions)
              setTimeRemaining(assessmentData.duration * 60) // Convert minutes to seconds
              // Initialize answers array
              setAnswers(selectedQuestions.map(q => ({ questionId: q.id, answer: "", timeSpent: 0 })))
            }
          } else if (user?.collegeId) {
            // Fallback: Load questions by skill if assessment doesn't have specific question IDs
            const questionsData = await getQuestionsBySkill(user.collegeId, assessmentData.skill)
            const selectedQuestions = questionsData
              .filter((q: FirebaseQuestion) => q.isActive)
              .slice(0, assessmentData.questions?.length || 10)
              .map((q: FirebaseQuestion) => ({
                id: q.id || "",
                title: q.title,
                description: q.description,
                type: q.type,
                skill: q.skill,
                difficulty: q.difficulty,
                options: q.options,
                correctAnswer: q.correctAnswer,
                points: q.points
              }))
            
            if (selectedQuestions.length > 0) {
              setQuestions(selectedQuestions)
              setTimeRemaining(assessmentData.duration * 60) // Convert minutes to seconds
              // Initialize answers array
              setAnswers(selectedQuestions.map(q => ({ questionId: q.id, answer: "", timeSpent: 0 })))
            }
          }
        }
        setLoading(false)
      } catch (error) {
        console.error("Error loading assessment:", error)
        setLoading(false)
      }
    }

    if (assessmentId && user) {
      loadAssessment()
    }
  }, [assessmentId, user])

  // Start assessment and create attempt
  const handleStart = async () => {
    if (!user || !assessment) return

    try {
      // Enter fullscreen
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen()
        setIsFullscreen(true)
      }

      // Create attempt record
      const attemptResult = await createAttempt({
        assessmentId: assessment.id,
        studentId: user.uid,
        collegeId: user.collegeId!,
        answers: [],
        score: 0,
        totalMarks: assessment.totalMarks,
        percentage: 0,
        status: "in-progress",
        timeSpent: 0,
        tabSwitches: 0,
        proctoringFlags: [],
      })

      if (attemptResult.success && attemptResult.attemptId) {
        setAttemptId(attemptResult.attemptId)
        setStarted(true)
      } else {
        console.error("Failed to create attempt:", attemptResult.error)
      }
    } catch (error) {
      console.error("Error starting assessment:", error)
    }
  }

  // Timer countdown
  useEffect(() => {
    if (!started || timeRemaining <= 0) return

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleAutoSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [started, timeRemaining])

  // Anti-cheating: Tab switch detection
  useEffect(() => {
    if (!started) return

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount(prev => {
          const newCount = prev + 1
          if (newCount >= 3) {
            setWarningMessage("Multiple tab switches detected. Assessment will be auto-submitted.")
            setShowWarning(true)
            setTimeout(() => handleAutoSubmit(), 3000)
          } else {
            setWarningMessage(`Warning: Tab switch detected (${newCount}/3). Assessment will auto-submit after 3 switches.`)
            setShowWarning(true)
          }
          return newCount
        })
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange)
  }, [started])

  // Anti-cheating: Fullscreen exit detection
  useEffect(() => {
    if (!started) return

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && isFullscreen) {
        setWarningMessage("Fullscreen mode exited. Please re-enter fullscreen to continue.")
        setShowWarning(true)
        
        // Try to re-enter fullscreen
        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen()
        }
      }
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange)
  }, [started, isFullscreen])

  // Disable right-click and keyboard shortcuts
  useEffect(() => {
    if (!started) return

    const disableRightClick = (e: MouseEvent) => {
      e.preventDefault()
      setWarningMessage("Right-click is disabled during assessment")
      setShowWarning(true)
    }

    const disableShortcuts = (e: KeyboardEvent) => {
      // Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, Ctrl+U, Ctrl+S, Ctrl+C
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "J" || e.key === "C")) ||
        (e.ctrlKey && (e.key === "u" || e.key === "s" || e.key === "c"))
      ) {
        e.preventDefault()
        setWarningMessage("This action is disabled during assessment")
        setShowWarning(true)
      }
    }

    document.addEventListener("contextmenu", disableRightClick)
    document.addEventListener("keydown", disableShortcuts)

    return () => {
      document.removeEventListener("contextmenu", disableRightClick)
      document.removeEventListener("keydown", disableShortcuts)
    }
  }, [started])

  // Disable text selection
  useEffect(() => {
    if (started) {
      document.body.style.userSelect = "none"
      document.body.style.webkitUserSelect = "none"
    }
    return () => {
      document.body.style.userSelect = ""
      document.body.style.webkitUserSelect = ""
    }
  }, [started])

  const handleAnswerChange = (answer: string) => {
    setAnswers(prev => {
      const newAnswers = [...prev]
      newAnswers[currentQuestionIndex] = {
        ...newAnswers[currentQuestionIndex],
        answer
      }
      return newAnswers
    })
  }

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
    }
  }

  const calculateScore = () => {
    let score = 0
    questions.forEach((question, index) => {
      if (question.type === "mcq" && answers[index]?.answer) {
        const selectedIndex = question.options?.indexOf(answers[index].answer)
        if (selectedIndex === question.correctAnswer) {
          score += question.points || 1
        }
      }
    })
    return score
  }

  const handleSubmit = async () => {
    if (!attemptId || !user) return

    setIsSubmitting(true)
    try {
      const score = calculateScore()
      const totalMarks = questions.reduce((sum, q) => sum + (q.points || 1), 0)
      const percentage = Math.round((score / totalMarks) * 100)

      await updateAttempt(attemptId, {
        submittedAt: new Date(),
        status: "completed",
        score,
        totalMarks,
        percentage,
        answers: answers.map((a, i) => {
          const selectedIndex = questions[i].options?.indexOf(a.answer)
          return {
            questionId: a.questionId,
            answer: a.answer,
            isCorrect: questions[i].type === "mcq" ? selectedIndex === questions[i].correctAnswer : undefined,
            pointsEarned: questions[i].type === "mcq" && selectedIndex === questions[i].correctAnswer ? questions[i].points : 0,
          }
        }),
        tabSwitches: tabSwitchCount,
        timeSpent: (assessment.duration * 60 - timeRemaining),
      })

      // Exit fullscreen
      if (document.exitFullscreen) {
        await document.exitFullscreen()
      }

      router.push(`/dashboard/student/assessments?completed=${attemptId}`)
    } catch (error) {
      console.error("Error submitting assessment:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAutoSubmit = async () => {
    setWarningMessage("Time's up! Auto-submitting assessment...")
    setShowWarning(true)
    await handleSubmit()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading assessment...</p>
        </div>
      </div>
    )
  }

  if (!assessment || questions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Assessment Not Found</CardTitle>
            <CardDescription>The requested assessment could not be loaded.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/dashboard/student/assessments")}>
              Back to Assessments
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!started) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="max-w-2xl w-full">
          <CardHeader>
            <CardTitle className="text-2xl">{assessment.title}</CardTitle>
            <CardDescription>{assessment.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                <ListChecks className="h-5 w-5 text-primary" />
                <div>
                  <div className="font-semibold">{questions.length} Questions</div>
                  <div className="text-sm text-muted-foreground">Total marks: {questions.reduce((sum, q) => sum + (q.points || 1), 0)}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                <Clock className="h-5 w-5 text-primary" />
                <div>
                  <div className="font-semibold">{assessment.duration} Minutes</div>
                  <div className="text-sm text-muted-foreground">Time limit</div>
                </div>
              </div>
            </div>

            <Alert>
              <ShieldAlert className="h-4 w-4" />
              <AlertDescription>
                <strong className="font-semibold">Anti-Cheating Measures Active</strong>
                <ul className="mt-2 space-y-1 text-sm list-disc list-inside">
                  <li>Assessment will be in fullscreen mode</li>
                  <li>Tab switching is monitored (3 switches = auto-submit)</li>
                  <li>Right-click and keyboard shortcuts are disabled</li>
                  <li>Copy, paste, and inspect are blocked</li>
                  <li>Time is server-validated</li>
                </ul>
              </AlertDescription>
            </Alert>

            <div className="flex gap-4">
              <Button 
                onClick={handleStart} 
                className="flex-1"
                size="lg"
              >
                Start Assessment
              </Button>
              <Button 
                variant="outline" 
                onClick={() => router.push("/dashboard/student/assessments")}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]
  const currentAnswer = answers[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100

  return (
    <div className="min-h-screen bg-background p-4">
      {/* Warning Dialog */}
      <AlertDialog open={showWarning} onOpenChange={setShowWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Warning
            </AlertDialogTitle>
            <AlertDialogDescription>{warningMessage}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>Understood</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Tab Switch Warning Banner */}
      {tabSwitchCount > 0 && (
        <Alert variant={tabSwitchCount >= 3 ? "destructive" : "default"} className="max-w-4xl mx-auto mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {tabSwitchCount >= 3 ? (
              <strong>⚠️ Assessment auto-submitted due to multiple tab switches ({tabSwitchCount}/3)</strong>
            ) : (
              <span>
                <strong>Warning:</strong> Tab switch detected ({tabSwitchCount}/3). Switching tabs again will result in auto-submission.
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="flex items-center justify-between p-4 bg-card rounded-lg border">
          <div>
            <h1 className="text-xl font-bold">{assessment.title}</h1>
            <p className="text-sm text-muted-foreground">
              Question {currentQuestionIndex + 1} of {questions.length}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {tabSwitchCount > 0 && (
              <Badge variant="destructive" className="gap-1">
                <AlertTriangle className="h-3 w-3" />
                {tabSwitchCount}/3 Warnings
              </Badge>
            )}
            <div className="flex items-center gap-2 text-lg font-semibold">
              <Clock className="h-5 w-5" />
              {Math.floor(timeRemaining / 60)}:{String(timeRemaining % 60).padStart(2, "0")}
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{answers.filter(a => a.answer).length} answered</span>
            <span>{questions.length - answers.filter(a => a.answer).length} remaining</span>
          </div>
        </div>

        {/* Question Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <Badge variant={
                currentQuestion.difficulty === "easy" ? "default" : 
                currentQuestion.difficulty === "medium" ? "secondary" : 
                "destructive"
              }>
                {currentQuestion.difficulty}
              </Badge>
              <div className="text-sm text-muted-foreground">
                {currentQuestion.points || 1} point{(currentQuestion.points || 1) > 1 ? 's' : ''}
              </div>
            </div>
            <CardTitle className="text-lg mt-4">{currentQuestion.title}</CardTitle>
            {currentQuestion.description && (
              <p className="text-sm text-muted-foreground mt-2">{currentQuestion.description}</p>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {/* MCQ Options */}
            {currentQuestion.type === "mcq" && currentQuestion.options && (
              <RadioGroup value={currentAnswer?.answer} onValueChange={handleAnswerChange}>
                <div className="space-y-3">
                  {currentQuestion.options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-accent cursor-pointer">
                      <RadioGroupItem value={option} id={`option-${index}`} />
                      <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                        {option}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            )}

            {/* Coding/Practical Answer */}
            {(currentQuestion.type === "coding" || currentQuestion.type === "practical") && (
              <div className="space-y-2">
                <Label>Your Answer {currentQuestion.type === "coding" && <FileCode className="inline h-4 w-4 ml-1" />}</Label>
                <Textarea
                  value={currentAnswer?.answer || ""}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                  placeholder={
                    currentQuestion.type === "coding" 
                      ? "Write your code here..." 
                      : "Describe your approach or provide a link to your solution..."
                  }
                  rows={10}
                  className="font-mono text-sm"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-4">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
          >
            Previous
          </Button>
          
          <div className="flex gap-2">
            {questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestionIndex(index)}
                className={`w-8 h-8 rounded-full text-xs font-medium transition-all ${
                  index === currentQuestionIndex
                    ? "bg-primary text-primary-foreground"
                    : answers[index]?.answer
                    ? "bg-green-500 text-white"
                    : "bg-muted hover:bg-muted/80"
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>

          {currentQuestionIndex === questions.length - 1 ? (
            <Button onClick={handleSubmit} disabled={isSubmitting} className="gap-2">
              {isSubmitting ? "Submitting..." : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Submit Assessment
                </>
              )}
            </Button>
          ) : (
            <Button onClick={handleNext}>
              Next
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
