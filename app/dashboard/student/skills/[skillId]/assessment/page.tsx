"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { DashboardShell } from "@/components/dashboard-shell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Clock, 
  AlertTriangle, 
  CheckCircle2,
  FileCode,
  ListChecks,
  Loader2
} from "lucide-react"
import { getQuestionsBySkill, Question as FirebaseQuestion } from "@/lib/firebase/questions"
import { createAttempt, updateAttempt } from "@/lib/firebase/assessments"
import { issueCertificate } from "@/lib/firebase/certificates"
import { updateEnrollmentStatus } from "@/lib/firebase/skills"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase/client"
import { toast } from "sonner"

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

export default function SkillAssessmentPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const skillId = params.skillId as string

  const [skill, setSkill] = useState<any>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [timeRemaining, setTimeRemaining] = useState(30 * 60) // 30 minutes default
  const [attemptId, setAttemptId] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [generatingQuestions, setGeneratingQuestions] = useState(false)
  const [started, setStarted] = useState(false)
  const [showSubmitDialog, setShowSubmitDialog] = useState(false)

  useEffect(() => {
    if (user?.uid && skillId) {
      loadSkill()
    }
  }, [user, skillId])

  useEffect(() => {
    if (started && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleAutoSubmit()
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [started, timeRemaining])

  // Security measures: Disable text selection, right-click, F12, Ctrl+U when assessment is started
  useEffect(() => {
    if (!started) return

    // Disable text selection
    const disableSelection = (e: Event) => {
      e.preventDefault()
      return false
    }

    // Disable right-click
    const disableRightClick = (e: MouseEvent) => {
      e.preventDefault()
      return false
    }

    // Disable F12 and other developer tools shortcuts
    const disableDevTools = (e: KeyboardEvent) => {
      // F12
      if (e.key === 'F12') {
        e.preventDefault()
        return false
      }
      // Ctrl+Shift+I (DevTools)
      if (e.ctrlKey && e.shiftKey && e.key === 'I') {
        e.preventDefault()
        return false
      }
      // Ctrl+Shift+J (Console)
      if (e.ctrlKey && e.shiftKey && e.key === 'J') {
        e.preventDefault()
        return false
      }
      // Ctrl+Shift+C (Inspect Element)
      if (e.ctrlKey && e.shiftKey && e.key === 'C') {
        e.preventDefault()
        return false
      }
      // Ctrl+U (View Source)
      if (e.ctrlKey && e.key === 'u' || e.ctrlKey && e.key === 'U') {
        e.preventDefault()
        return false
      }
      // Ctrl+S (Save Page)
      if (e.ctrlKey && e.key === 's' || e.ctrlKey && e.key === 'S') {
        e.preventDefault()
        return false
      }
      // Ctrl+P (Print)
      if (e.ctrlKey && e.key === 'p' || e.ctrlKey && e.key === 'P') {
        e.preventDefault()
        return false
      }
    }

    // Disable context menu
    document.addEventListener('contextmenu', disableRightClick)
    // Disable text selection
    document.addEventListener('selectstart', disableSelection)
    document.addEventListener('dragstart', disableSelection)
    // Disable keyboard shortcuts
    document.addEventListener('keydown', disableDevTools)

    // Add CSS to disable text selection (but allow clicks on buttons and inputs)
    const style = document.createElement('style')
    style.textContent = `
      * {
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
        -webkit-touch-callout: none !important;
      }
      button, input, [role="button"], [role="radio"] {
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
        cursor: pointer !important;
      }
    `
    document.head.appendChild(style)

    // Cleanup
    return () => {
      document.removeEventListener('contextmenu', disableRightClick)
      document.removeEventListener('selectstart', disableSelection)
      document.removeEventListener('dragstart', disableSelection)
      document.removeEventListener('keydown', disableDevTools)
      document.head.removeChild(style)
    }
  }, [started])

  const loadSkill = async () => {
    if (!user?.uid || !skillId) return

    setLoading(true)
    try {
      // Load skill details
      const skillDoc = await getDoc(doc(db, "skills", skillId))
      if (!skillDoc.exists()) {
        toast.error("Skill not found")
        router.push("/dashboard/student/skills")
        return
      }

      const skillData = { id: skillDoc.id, ...skillDoc.data() }
      setSkill(skillData)
    } catch (error) {
      console.error("Error loading skill:", error)
      toast.error("Failed to load skill")
    } finally {
      setLoading(false)
    }
  }


  const handleStart = async () => {
    if (!user?.uid || !skill) return

    try {
      // Generate 5 questions using OpenAI API
      setGeneratingQuestions(true)
      toast.info("Generating assessment questions...")

      const response = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skill: skill.name,
          assessmentTitle: `${skill.name} Skill Assessment`,
          difficulty: 'medium',
          questionType: 'mcq',
          numberOfQuestions: 5,
          topics: skill.description ? [skill.description] : [],
        }),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to generate questions')
      }

      if (!data.questions || data.questions.length === 0) {
        throw new Error('No questions generated')
      }

      // Convert generated questions to our format - filter to only MCQ questions
      const formattedQuestions: Question[] = data.questions
        .filter((q: any) => {
          // Only accept MCQ questions with valid options
          return (q.type === 'mcq' || !q.type) && 
                 q.options && 
                 Array.isArray(q.options) && 
                 q.options.length === 4 &&
                 typeof q.correctAnswer === 'number' &&
                 q.correctAnswer >= 0 && 
                 q.correctAnswer < 4
        })
        .map((q: any, index: number) => ({
          id: `generated-${index}`,
          title: q.question,
          description: q.explanation || "",
          type: 'mcq' as const,
          skill: skill.name,
          difficulty: q.difficulty || 'medium',
          options: q.options || [],
          correctAnswer: q.correctAnswer,
          points: q.points || 20
        }))

      if (formattedQuestions.length === 0) {
        throw new Error('No valid MCQ questions were generated. Please try again.')
      }

      // Ensure we have exactly 5 MCQ questions
      if (formattedQuestions.length < 5) {
        console.warn(`Only ${formattedQuestions.length} valid MCQ questions generated, expected 5`)
      }

      // Set questions and answers
      setQuestions(formattedQuestions)
      setTimeRemaining(30 * 60) // 30 minutes
      setAnswers(formattedQuestions.map(q => ({
        questionId: q.id,
        answer: "",
        timeSpent: 0
      })))

      // Create attempt with the generated questions
      const attemptData = {
        assessmentId: `skill-${skillId}`,
        studentId: user.uid,
        studentName: user.name || "Student",
        studentEmail: user.email || "",
        collegeId: user.collegeId || "",
        collegeName: user.collegeName || "",
        answers: [],
        score: 0,
        totalMarks: formattedQuestions.reduce((sum, q) => sum + (q.points || 1), 0),
        percentage: 0,
        status: "in-progress" as const,
        startedAt: new Date(),
        timeSpent: 0,
        tabSwitches: 0,
        proctoringFlags: [],
      }

      const result = await createAttempt(attemptData)
      if (result.success && result.attemptId) {
        setAttemptId(result.attemptId)
        setStarted(true)
        toast.success(`Assessment started! ${formattedQuestions.length} questions generated. Good luck!`)
      } else {
        toast.error("Failed to start assessment")
      }
    } catch (error: any) {
      console.error("Error starting assessment:", error)
      toast.error(error.message || "Failed to start assessment. Please try again.")
    } finally {
      setGeneratingQuestions(false)
    }
  }

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => prev.map(a => 
      a.questionId === questionId 
        ? { ...a, answer, timeSpent: a.timeSpent + 1 }
        : a
    ))
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
    questions.forEach((question) => {
      const answer = answers.find(a => a.questionId === question.id)
      if (question.type === "mcq" && answer?.answer) {
        const selectedIndex = question.options?.indexOf(answer.answer)
        if (selectedIndex === question.correctAnswer) {
          score += question.points || 1
        }
      }
    })
    return score
  }

  const handleAutoSubmit = async () => {
    if (!attemptId) return
    await handleSubmit()
  }

  const handleSubmit = async () => {
    if (!attemptId || !user || !skill) return

    setIsSubmitting(true)
    try {
      const score = calculateScore()
      const totalMarks = questions.reduce((sum, q) => sum + (q.points || 1), 0)
      const percentage = Math.round((score / totalMarks) * 100)

      // Update attempt
      await updateAttempt(attemptId, {
        submittedAt: new Date(),
        status: "completed",
        score,
        totalMarks,
        percentage,
        answers: answers.map((a) => {
          const question = questions.find(q => q.id === a.questionId)
          if (!question) return null
          const selectedIndex = question.options?.indexOf(a.answer)
          const answerData: any = {
            questionId: a.questionId,
            answer: a.answer,
            pointsEarned: 0,
          }
          // Only add isCorrect if it's a valid boolean value
          if (question.type === "mcq" && selectedIndex !== undefined && selectedIndex !== -1) {
            answerData.isCorrect = selectedIndex === question.correctAnswer
            if (answerData.isCorrect) {
              answerData.pointsEarned = question.points || 0
            }
          }
          return answerData
        }).filter(Boolean) as any[],
        timeSpent: (30 * 60 - timeRemaining),
      })

      // If score >= 70%, issue certificate and update enrollment
      if (percentage >= 70) {
        try {
          // Issue certificate
          const certResult = await issueCertificate({
            studentId: user.uid,
            studentName: user.name || "Student",
            studentEmail: user.email || "",
            collegeId: user.collegeId || "",
            collegeName: user.collegeName || "SkillVault",
            assessmentId: `skill-${skillId}`,
            assessmentTitle: `${skill.name} Skill Assessment`,
            skill: skill.name,
            score,
            percentage,
            passingGrade: 70,
            attemptId,
          })

          if (certResult.success && certResult.certificateId) {
            // Update enrollment status to certified
            const { getStudentEnrollments } = await import("@/lib/firebase/skills")
            const enrollments = await getStudentEnrollments(user.uid)
            const enrollment = enrollments.find(e => e.skillId === skillId)
            
            if (enrollment) {
              await updateEnrollmentStatus(enrollment.id, "certified", certResult.certificateId)
            }

            toast.success(`Congratulations! You scored ${percentage}% and earned a certificate with ID: ${certResult.certificateId}!`)
            router.push(`/dashboard/student/certificates?certified=${certResult.certificateId}`)
          } else {
            toast.success(`Assessment completed! Score: ${percentage}%`)
            router.push("/dashboard/student/skills")
          }
        } catch (certError) {
          console.error("Error issuing certificate:", certError)
          toast.success(`Assessment completed! Score: ${percentage}%`)
          router.push("/dashboard/student/skills")
        }
      } else {
        // Update enrollment status to completed (but not certified)
        const { getStudentEnrollments } = await import("@/lib/firebase/skills")
        const enrollments = await getStudentEnrollments(user.uid)
        const enrollment = enrollments.find(e => e.skillId === skillId)
        
        if (enrollment) {
          await updateEnrollmentStatus(enrollment.id, "completed")
        }

        toast.info(`Assessment completed! Score: ${percentage}%. You need 70% to get certified.`)
        router.push("/dashboard/student/skills")
      }
    } catch (error) {
      console.error("Error submitting assessment:", error)
      toast.error("Failed to submit assessment")
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const currentQuestion = questions[currentQuestionIndex]
  const currentAnswer = answers.find(a => a.questionId === currentQuestion?.id)
  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0

  if (loading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardShell>
    )
  }

  if (!skill) {
    return (
      <DashboardShell>
        <Card>
          <CardContent className="py-12 text-center">
            <AlertTriangle className="h-16 w-16 mx-auto mb-4 text-destructive" />
            <h3 className="text-lg font-semibold mb-2">Skill Not Found</h3>
            <p className="text-muted-foreground mb-4">
              The skill you're looking for doesn't exist.
            </p>
            <Button onClick={() => router.push("/dashboard/student/skills")}>
              Back to Skills
            </Button>
          </CardContent>
        </Card>
      </DashboardShell>
    )
  }

  if (!started) {
    return (
      <DashboardShell>
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">{skill.name} Assessment</CardTitle>
            <CardDescription>
              {skill.description || "Test your knowledge and earn a certificate"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <span className="font-medium">Total Questions</span>
                <Badge variant="outline">{questions.length}</Badge>
              </div>
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <span className="font-medium">Duration</span>
                <Badge variant="outline">30 minutes</Badge>
              </div>
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <span className="font-medium">Passing Score</span>
                <Badge variant="outline">70%</Badge>
              </div>
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <span className="font-medium">Certificate</span>
                <Badge className="bg-green-500">Available on 70%+</Badge>
              </div>
            </div>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Instructions:</strong>
                <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                  <li>You have 30 minutes to complete the assessment</li>
                  <li>Answer all questions to the best of your ability</li>
                  <li>You need 70% or higher to earn a certificate</li>
                  <li>Once started, you cannot pause the assessment</li>
                </ul>
              </AlertDescription>
            </Alert>

            <Button 
              className="w-full" 
              size="lg"
              onClick={handleStart}
              disabled={generatingQuestions}
            >
              {generatingQuestions ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating Questions...
                </>
              ) : (
                "Start Assessment"
              )}
            </Button>
          </CardContent>
        </Card>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell>
      <div className="space-y-6" style={started ? { userSelect: 'none' as any } : {}}>
        {/* Security Warning */}
        {started && (
          <Alert className="bg-yellow-50 border-yellow-200">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              <strong>Security Mode Active:</strong> Text selection, right-click, and developer tools are disabled during the assessment.
            </AlertDescription>
          </Alert>
        )}

        {/* Header */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">{skill.name} Assessment</h1>
                <p className="text-muted-foreground">Question {currentQuestionIndex + 1} of {questions.length}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <span className="font-mono font-semibold">{formatTime(timeRemaining)}</span>
                </div>
                <Button 
                  variant="outline"
                  onClick={() => setShowSubmitDialog(true)}
                >
                  Submit
                </Button>
              </div>
            </div>
            <Progress value={progress} className="mt-4" />
          </CardContent>
        </Card>

        {/* Question */}
        {currentQuestion && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">{currentQuestion.title}</CardTitle>
                <Badge variant="outline">{currentQuestion.difficulty}</Badge>
              </div>
              {currentQuestion.description && (
                <CardDescription>{currentQuestion.description}</CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              {currentQuestion.type === "mcq" && currentQuestion.options && (
                <RadioGroup
                  value={currentAnswer?.answer || ""}
                  onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
                >
                  {currentQuestion.options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-muted/50">
                      <RadioGroupItem value={option} id={`option-${index}`} />
                      <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}

              <div className="flex justify-between pt-4">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentQuestionIndex === 0}
                >
                  Previous
                </Button>
                {currentQuestionIndex < questions.length - 1 ? (
                  <Button onClick={handleNext}>
                    Next
                  </Button>
                ) : (
                  <Button onClick={() => setShowSubmitDialog(true)}>
                    Submit Assessment
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Question Navigation */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Question Navigation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-2">
              {questions.map((q, index) => {
                const answer = answers.find(a => a.questionId === q.id)
                const isAnswered = !!answer?.answer
                const isCurrent = index === currentQuestionIndex
                
                return (
                  <Button
                    key={q.id}
                    variant={isCurrent ? "default" : isAnswered ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => setCurrentQuestionIndex(index)}
                    className="aspect-square"
                  >
                    {index + 1}
                  </Button>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Submit Confirmation Dialog */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Assessment?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to submit your assessment? You have answered{" "}
              {answers.filter(a => a.answer).length} out of {questions.length} questions.
              {answers.filter(a => a.answer).length < questions.length && (
                <span className="block mt-2 text-destructive">
                  You have unanswered questions. Are you sure you want to continue?
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardShell>
  )
}

