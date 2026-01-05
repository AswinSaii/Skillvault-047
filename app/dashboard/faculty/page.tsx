"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { DashboardShell } from "@/components/dashboard-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, FileText, BarChart3, PlusCircle, Award, Clock, TrendingUp, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { cn } from "@/lib/utils"
import { getFacultyDashboardStats, FacultyStats, getProctoringAlerts, ProctoringAlert } from "@/lib/firebase/faculty"
import { Skeleton } from "@/components/ui/skeleton"

export default function FacultyDashboard() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<FacultyStats | null>(null)
  const [alerts, setAlerts] = useState<ProctoringAlert[]>([])

  useEffect(() => {
    loadDashboardData()
  }, [user])

  const loadDashboardData = async () => {
    if (!user?.uid) {
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const collegeId = user.collegeId || 'default'
      
      const [dashboardStats, proctoringAlerts] = await Promise.all([
        getFacultyDashboardStats(user.uid, collegeId),
        getProctoringAlerts(user.uid, collegeId),
      ])
      
      setStats(dashboardStats)
      setAlerts(proctoringAlerts.slice(0, 3)) // Show top 3 alerts
    } catch (error) {
      console.error("Error loading dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !stats) {
    return (
      <DashboardShell>
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-96" />
            </div>
            <Skeleton className="h-10 w-40" />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-3 w-32" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DashboardShell>
    )
  }

  if (!loading && !user?.collegeId) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center h-[400px]">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Setup Required</CardTitle>
              <CardDescription>
                Your account needs to be associated with a college. Please contact your administrator.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Faculty Dashboard</h1>
            <p className="text-muted-foreground">Manage assessments and monitor student performance.</p>
          </div>
          <Button className="gap-2" asChild>
            <Link href="/dashboard/faculty/assessments">
              <PlusCircle className="h-4 w-4" />
              New Assessment
            </Link>
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Students</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeStudents}</div>
              <p className="text-xs text-muted-foreground">Enrolled students</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Assessments</CardTitle>
              <FileText className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAssessments}</div>
              <p className="text-xs text-muted-foreground">Created by you</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Avg. Pass Rate</CardTitle>
              <BarChart3 className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averagePassRate}%</div>
              <p className="text-xs text-green-600 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                +2.1% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Certificates Issued</CardTitle>
              <Award className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.certificatesIssued}</div>
              <p className="text-xs text-muted-foreground">This semester</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-7">
          <Card className="lg:col-span-4">
            <CardHeader>
              <CardTitle>Recent Assessments</CardTitle>
              <CardDescription>Latest assessment activity and completion rates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {stats.recentAssessments.length > 0 ? stats.recentAssessments.map((assessment, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <FileText className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{assessment.name}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {assessment.date}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={assessment.completed === assessment.students ? "default" : "outline"}>
                          {assessment.completed}/{assessment.students}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">Avg: {assessment.avgScore}%</p>
                      </div>
                    </div>
                    <Progress value={assessment.students > 0 ? (assessment.completed / assessment.students) * 100 : 0} className="h-2" />
                  </div>
                )) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">No recent assessments</p>
                    <p className="text-xs mt-1">Create your first assessment to get started</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Skill Performance</CardTitle>
              <CardDescription>Average scores by skill area</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  avg: { label: "Average Score", color: "hsl(var(--chart-1))" },
                }}
                className="h-64"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.performanceData} layout="vertical">
                    <XAxis type="number" hide />
                    <YAxis
                      dataKey="skill"
                      type="category"
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="avg" fill="var(--color-avg)" radius={[0, 4, 4, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Assessments</CardTitle>
              <CardDescription>Scheduled tests and deadlines</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.upcomingAssessments.length > 0 ? stats.upcomingAssessments.map((upcoming, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">{upcoming.title}</p>
                      <p className="text-xs text-muted-foreground">{upcoming.date}</p>
                    </div>
                    <Badge variant="outline">{upcoming.students} students</Badge>
                  </div>
                )) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">No upcoming assessments</p>
                  </div>
                )}
              </div>
              <Button variant="outline" className="w-full mt-4" asChild>
                <Link href="/dashboard/faculty/assessments">View All Assessments</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Performers</CardTitle>
              <CardDescription>Students with highest scores this month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.topPerformers.length > 0 ? stats.topPerformers.map((student, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                        {i + 1}
                      </div>
                      <div>
                        <p className="font-medium">{student.name}</p>
                        <p className="text-xs text-muted-foreground">{student.skills} skills</p>
                      </div>
                    </div>
                    <Badge variant="default">{student.score}%</Badge>
                  </div>
                )) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">No data available yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/dashboard/faculty/assessments">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create Assessment
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/dashboard/faculty/students">
                  <Users className="h-4 w-4 mr-2" />
                  View Students
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/dashboard/faculty/analytics">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Analytics
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.recentActivity.map((activity, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                    <div className="flex-1">
                      <p className="font-medium">{activity.action}</p>
                      <p className="text-muted-foreground">{activity.detail}</p>
                    </div>
                    <p className="text-xs text-muted-foreground whitespace-nowrap">{activity.time}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  )
}
