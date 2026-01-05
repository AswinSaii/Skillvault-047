"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { DashboardShell } from "@/components/dashboard-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  TrendingDown,
  TrendingUp,
  Minus,
  Target,
  Lightbulb,
  Calendar,
  Award,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  BarChart3,
} from "lucide-react"
import { getAttemptsByStudent, getAssessmentsByCollege } from "@/lib/firebase/assessments"
import { analyzeSkillGaps, generateStudyPlan } from "@/lib/utils/skill-gap-analysis"
import type { SkillGapAnalysis } from "@/lib/utils/skill-gap-analysis"
import { toast } from "sonner"

export default function SkillRecommendationsPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [analysis, setAnalysis] = useState<SkillGapAnalysis | null>(null)
  const [studyPlan, setStudyPlan] = useState<any>(null)

  useEffect(() => {
    loadAnalysis()
  }, [user])

  const loadAnalysis = async () => {
    if (!user?.uid || !user?.collegeId) return

    setLoading(true)
    try {
      const [attempts, assessments] = await Promise.all([
        getAttemptsByStudent(user.uid),
        getAssessmentsByCollege(user.collegeId),
      ])

      const completedAttempts = attempts.filter((a) => a.status === "completed")
      const gapAnalysis = analyzeSkillGaps(completedAttempts, assessments)
      const plan = generateStudyPlan(gapAnalysis)

      setAnalysis(gapAnalysis)
      setStudyPlan(plan)
    } catch (error) {
      toast.error("Failed to load skill analysis")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const getTrendIcon = (trend: "improving" | "declining" | "stable") => {
    if (trend === "improving") return <TrendingUp className="h-4 w-4 text-green-600" />
    if (trend === "declining") return <TrendingDown className="h-4 w-4 text-red-600" />
    return <Minus className="h-4 w-4 text-gray-600" />
  }

  const getPriorityColor = (priority: "high" | "medium" | "low") => {
    if (priority === "high") return "destructive"
    if (priority === "medium") return "default"
    return "secondary"
  }

  if (loading) {
    return (
      <DashboardShell
        heading="Skill Recommendations"
        description="AI-powered suggestions to improve your skills"
      >
        <div className="flex items-center justify-center h-96">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Analyzing your skills...</p>
          </div>
        </div>
      </DashboardShell>
    )
  }

  if (!analysis || analysis.overallInsights.totalAttempts === 0) {
    return (
      <DashboardShell
        heading="Skill Recommendations"
        description="AI-powered suggestions to improve your skills"
      >
        <Card>
          <CardContent className="py-12 text-center">
            <Target className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No Data Yet</h3>
            <p className="text-muted-foreground mb-4">
              Complete some assessments to get personalized skill recommendations
            </p>
            <Button onClick={() => (window.location.href = "/dashboard/student")}>
              Take an Assessment
            </Button>
          </CardContent>
        </Card>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell
      heading="Skill Recommendations"
      description="AI-powered suggestions based on your performance"
    >
      <div className="space-y-6">
        {/* Overall Insights */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Attempts</CardDescription>
              <CardTitle className="text-3xl">{analysis.overallInsights.totalAttempts}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Pass Rate</CardDescription>
              <CardTitle className="text-3xl">{analysis.overallInsights.passRate}%</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Average Score</CardDescription>
              <CardTitle className="text-3xl">{analysis.overallInsights.averageScore}%</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Weak Skills</CardDescription>
              <CardTitle className="text-3xl">{analysis.weakSkills.length}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Strongest & Weakest Skills */}
        {(analysis.overallInsights.strongestSkill || analysis.overallInsights.weakestSkill) && (
          <div className="grid gap-4 md:grid-cols-2">
            {analysis.overallInsights.strongestSkill && (
              <Card className="border-green-200 bg-green-50/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-700">
                    <Award className="h-5 w-5" />
                    Strongest Skill
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-green-700">
                    {analysis.overallInsights.strongestSkill}
                  </p>
                  <p className="text-sm text-green-600 mt-2">
                    Keep up the great work! Consider advanced topics in this area.
                  </p>
                </CardContent>
              </Card>
            )}
            {analysis.overallInsights.weakestSkill && (
              <Card className="border-orange-200 bg-orange-50/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-700">
                    <AlertTriangle className="h-5 w-5" />
                    Needs Improvement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-orange-700">
                    {analysis.overallInsights.weakestSkill}
                  </p>
                  <p className="text-sm text-orange-600 mt-2">
                    Focus on this skill to strengthen your overall profile.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        <Tabs defaultValue="recommendations" className="space-y-4">
          <TabsList>
            <TabsTrigger value="recommendations">
              Recommendations ({analysis.recommendedSkills.length})
            </TabsTrigger>
            <TabsTrigger value="weak-skills">
              Weak Skills ({analysis.weakSkills.length})
            </TabsTrigger>
            {studyPlan?.weekPlan && (
              <TabsTrigger value="study-plan">Study Plan</TabsTrigger>
            )}
          </TabsList>

          {/* Recommendations Tab */}
          <TabsContent value="recommendations" className="space-y-4">
            {analysis.recommendedSkills.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <CheckCircle2 className="h-16 w-16 mx-auto mb-4 text-green-600" />
                  <h3 className="text-lg font-semibold mb-2">Great Job!</h3>
                  <p className="text-muted-foreground">
                    You're performing well across all skills. Keep taking assessments to maintain your level.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {analysis.recommendedSkills.map((rec, index) => (
                  <Card key={index} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge variant={getPriorityColor(rec.priority)}>
                              {rec.priority} priority
                            </Badge>
                            <h3 className="text-lg font-bold">{rec.skill}</h3>
                          </div>
                          <p className="text-muted-foreground mb-3">{rec.reason}</p>
                          {rec.relatedToWeakSkill && (
                            <Alert className="bg-blue-50 border-blue-200 mb-3">
                              <Lightbulb className="h-4 w-4 text-blue-600" />
                              <AlertDescription className="text-sm text-blue-700">
                                <strong>Tip:</strong> Mastering this will help improve{" "}
                                <strong>{rec.relatedToWeakSkill}</strong>
                              </AlertDescription>
                            </Alert>
                          )}
                        </div>
                        <Button size="sm" className="ml-4">
                          Find Assessments
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Weak Skills Tab */}
          <TabsContent value="weak-skills" className="space-y-4">
            {analysis.weakSkills.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <CheckCircle2 className="h-16 w-16 mx-auto mb-4 text-green-600" />
                  <h3 className="text-lg font-semibold mb-2">No Weak Skills Detected</h3>
                  <p className="text-muted-foreground">
                    You're performing well! Keep up the good work.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {analysis.weakSkills.map((skill, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          {getTrendIcon(skill.trend)}
                          {skill.skill}
                        </CardTitle>
                        <Badge
                          variant={
                            skill.trend === "improving"
                              ? "default"
                              : skill.trend === "declining"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {skill.trend}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Average Score</span>
                          <span className="font-semibold">{skill.averageScore}%</span>
                        </div>
                        <Progress value={skill.averageScore} className="h-2" />
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center text-sm">
                        <div>
                          <p className="text-muted-foreground text-xs">Attempts</p>
                          <p className="font-semibold">{skill.attemptCount}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Failed</p>
                          <p className="font-semibold text-red-600">{skill.failedAttempts}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Best Score</p>
                          <p className="font-semibold text-green-600">{skill.highestScore}%</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Study Plan Tab */}
          {studyPlan?.weekPlan && (
            <TabsContent value="study-plan" className="space-y-4">
              <Alert className="bg-blue-50 border-blue-200">
                <Calendar className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-700">
                  <strong>Personalized Study Plan:</strong> Follow this week-by-week plan to systematically improve your skills.
                </AlertDescription>
              </Alert>

              <div className="grid gap-4">
                {studyPlan.weekPlan.map((week: any, index: number) => (
                  <Card key={index}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <Badge variant="outline">Week {week.week}</Badge>
                          {week.focus}
                        </CardTitle>
                        <BarChart3 className="h-5 w-5 text-primary" />
                      </div>
                      <CardDescription>{week.goal}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="text-sm font-semibold text-muted-foreground">Focus Skills:</p>
                        <div className="flex flex-wrap gap-2">
                          {week.skills.map((skill: string, idx: number) => (
                            <Badge key={idx} variant="secondary">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </DashboardShell>
  )
}
