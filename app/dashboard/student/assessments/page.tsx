"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { DashboardShell } from "@/components/dashboard-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Search,
  Clock,
  PlayCircle,
  CheckCircle2,
  XCircle,
  Calendar,
  Award,
  BookOpen,
  AlertCircle,
} from "lucide-react"
import { getActiveAssessmentsForStudent, getAttemptsByStudent } from "@/lib/firebase/assessments"
import { toast } from "sonner"

export default function StudentAssessmentsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [assessments, setAssessments] = useState<any[]>([])
  const [attempts, setAttempts] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filterSkill, setFilterSkill] = useState("all")

  useEffect(() => {
    loadData()
  }, [user])

  const loadData = async () => {
    if (!user?.uid || !user?.collegeId) return

    setLoading(true)
    try {
      const [assessmentsData, attemptsData] = await Promise.all([
        getActiveAssessmentsForStudent(user.collegeId, user.uid),
        getAttemptsByStudent(user.uid),
      ])

      setAssessments(assessmentsData)
      setAttempts(attemptsData)
    } catch (error) {
      toast.error("Failed to load assessments")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const getAttemptForAssessment = (assessmentId: string) => {
    return attempts.find((a) => a.assessmentId === assessmentId)
  }

  const filteredAssessments = assessments.filter((assessment) => {
    const matchesSearch =
      assessment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assessment.skill.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSkill = filterSkill === "all" || assessment.skill === filterSkill

    return matchesSearch && matchesSkill
  })

  const availableAssessments = filteredAssessments.filter(
    (a) => !getAttemptForAssessment(a.id)
  )
  const completedAssessments = filteredAssessments.filter((a) => {
    const attempt = getAttemptForAssessment(a.id)
    return attempt && attempt.status === "completed"
  })

  const skills = [...new Set(assessments.map((a) => a.skill))]

  return (
    <DashboardShell
      heading="Assessments"
      description="Take tests and track your progress"
    >
      <div className="space-y-6">
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search assessments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={filterSkill} onValueChange={setFilterSkill}>
            <SelectTrigger className="w-full sm:w-50">
              <SelectValue placeholder="All Skills" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Skills</SelectItem>
              {skills.map((skill) => (
                <SelectItem key={skill} value={skill}>
                  {skill}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="available" className="space-y-6">
          <TabsList>
            <TabsTrigger value="available">
              Available ({availableAssessments.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({completedAssessments.length})
            </TabsTrigger>
            <TabsTrigger value="all">
              All ({filteredAssessments.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="available" className="space-y-4">
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">
                Loading assessments...
              </div>
            ) : availableAssessments.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">No available assessments</h3>
                  <p className="text-muted-foreground">
                    Check back later for new assessments
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {availableAssessments.map((assessment) => (
                  <AssessmentCard
                    key={assessment.id}
                    assessment={assessment}
                    onStart={() => router.push(`/dashboard/student/assessments/${assessment.id}`)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completedAssessments.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">No completed assessments</h3>
                  <p className="text-muted-foreground">
                    Complete your first assessment to see results here
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {completedAssessments.map((assessment) => {
                  const attempt = getAttemptForAssessment(assessment.id)
                  return (
                    <CompletedAssessmentCard
                      key={assessment.id}
                      assessment={assessment}
                      attempt={attempt}
                      onViewResults={() =>
                        router.push(`/dashboard/student/history/${attempt.id}`)
                      }
                    />
                  )
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="all" className="space-y-4">
            {filteredAssessments.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">No assessments found</h3>
                  <p className="text-muted-foreground">Try adjusting your filters</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {filteredAssessments.map((assessment) => {
                  const attempt = getAttemptForAssessment(assessment.id)
                  return attempt ? (
                    <CompletedAssessmentCard
                      key={assessment.id}
                      assessment={assessment}
                      attempt={attempt}
                      onViewResults={() =>
                        router.push(`/dashboard/student/history/${attempt.id}`)
                      }
                    />
                  ) : (
                    <AssessmentCard
                      key={assessment.id}
                      assessment={assessment}
                      onStart={() =>
                        router.push(`/dashboard/student/assessments/${assessment.id}`)
                      }
                    />
                  )
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardShell>
  )
}

function AssessmentCard({ assessment, onStart }: { assessment: any; onStart: () => void }) {
  const difficultyColors = {
    easy: "bg-green-100 text-green-700",
    medium: "bg-yellow-100 text-yellow-700",
    hard: "bg-red-100 text-red-700",
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <CardTitle className="text-lg">{assessment.title}</CardTitle>
            <CardDescription className="line-clamp-2">
              {assessment.description}
            </CardDescription>
          </div>
          <Badge className={difficultyColors[assessment.difficulty as keyof typeof difficultyColors]}>
            {assessment.difficulty}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{assessment.duration} mins</span>
          </div>
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-muted-foreground" />
            <span>{assessment.totalMarks} marks</span>
          </div>
          {assessment.scheduledDate && (
            <div className="flex items-center gap-2 col-span-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{new Date(assessment.scheduledDate).toLocaleDateString()}</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline">{assessment.skill}</Badge>
          <Badge variant="secondary" className="capitalize">
            {assessment.type}
          </Badge>
        </div>

        <Button onClick={onStart} className="w-full">
          <PlayCircle className="mr-2 h-4 w-4" />
          Start Assessment
        </Button>
      </CardContent>
    </Card>
  )
}

function CompletedAssessmentCard({
  assessment,
  attempt,
  onViewResults,
}: {
  assessment: any
  attempt: any
  onViewResults: () => void
}) {
  const passed = attempt.percentage >= (assessment.passingMarks / assessment.totalMarks) * 100

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <CardTitle className="text-lg">{assessment.title}</CardTitle>
            <CardDescription>
              Completed on {new Date(attempt.submittedAt).toLocaleDateString()}
            </CardDescription>
          </div>
          {passed ? (
            <CheckCircle2 className="h-6 w-6 text-green-600" />
          ) : (
            <XCircle className="h-6 w-6 text-red-600" />
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
          <div>
            <div className="text-2xl font-bold">{attempt.percentage}%</div>
            <div className="text-sm text-muted-foreground">
              {attempt.score}/{attempt.totalMarks} marks
            </div>
          </div>
          <Badge
            variant={passed ? "default" : "destructive"}
            className={passed ? "bg-green-600" : ""}
          >
            {passed ? "Passed" : "Failed"}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline">{assessment.skill}</Badge>
          <Badge variant="secondary" className="capitalize">
            {assessment.type}
          </Badge>
        </div>

        <Button onClick={onViewResults} variant="outline" className="w-full">
          View Results
        </Button>
      </CardContent>
    </Card>
  )
}
