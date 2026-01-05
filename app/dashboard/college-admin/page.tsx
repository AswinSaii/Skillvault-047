"use client"

import { useEffect, useState } from "react"
import { DashboardShell } from "@/components/dashboard-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { GraduationCap, UserCheck, ShieldCheck, Award, TrendingUp, Users, BookOpen, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/lib/auth-context"
import { CollegeVerificationBadge } from "@/components/college-verification-badge"
import { DummyDataButton } from "@/components/dummy-data-button"
import Link from "next/link"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const departmentData = [
  { name: "CS", students: 420 },
  { name: "IT", students: 380 },
  { name: "ECE", students: 320 },
  { name: "ME", students: 120 },
]

export default function CollegeAdminDashboard() {
  const { user } = useAuth()

  return (
    <DashboardShell>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">College Administration</h1>
            <div className="mt-2">
              {user?.collegeId ? (
                <CollegeVerificationBadge 
                  userId={user.id} 
                  collegeName={user.collegeName}
                  size="md"
                  variant="subtle"
                />
              ) : (
                <p className="text-muted-foreground">{user?.collegeName || "College Dashboard"}</p>
              )}
            </div>
          </div>
          <DummyDataButton />
        </div>

        {!user?.collegeId && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Your college needs to be verified to access all features. Please contact support.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Faculty Members</CardTitle>
              <UserCheck className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">4 departments</p>
              <Button variant="link" size="sm" className="px-0 mt-1" asChild>
                <Link href="/dashboard/college-admin/faculty">Manage →</Link>
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <GraduationCap className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,240</div>
              <p className="text-xs text-muted-foreground">85% active this month</p>
              <Button variant="link" size="sm" className="px-0 mt-1" asChild>
                <Link href="/dashboard/college-admin/students">View All →</Link>
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Certificates Issued</CardTitle>
              <Award className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">856</div>
              <p className="text-xs text-muted-foreground">32 in the last 7 days</p>
              <Button variant="link" size="sm" className="px-0 mt-1" asChild>
                <Link href="/dashboard/college-admin/certificates">View →</Link>
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Trust Score</CardTitle>
              <ShieldCheck className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">98.5%</div>
              <p className="text-xs text-muted-foreground">Above platform avg</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Department Distribution</CardTitle>
              <CardDescription>Student enrollment by department</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  students: { label: "Students", color: "hsl(var(--chart-1))" },
                }}
                className="h-64"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={departmentData}>
                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="students" fill="var(--color-students)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest updates from your institution</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { action: "Certificate issued", user: "John Doe", skill: "React Development", time: "2 min ago", icon: Award },
                  { action: "New faculty added", user: "Dr. Sarah Wilson", skill: "Computer Science", time: "1 hour ago", icon: UserCheck },
                  { action: "Assessment completed", user: "Advanced JavaScript", skill: "42 students", time: "3 hours ago", icon: BookOpen },
                  { action: "Student enrolled", user: "Mike Johnson", skill: "IT Department", time: "5 hours ago", icon: Users },
                ].map((activity, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <activity.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">
                        {activity.user} · {activity.skill}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                ))}
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
                <Link href="/dashboard/college-admin/faculty">
                  <UserCheck className="h-4 w-4 mr-2" />
                  Add Faculty Member
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/dashboard/college-admin/certificates">
                  <Award className="h-4 w-4 mr-2" />
                  Issue Certificate
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/dashboard/college-admin/analytics">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  View Analytics
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Top Performing Students</CardTitle>
              <CardDescription>Based on skill assessments this month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: "Alice Johnson", dept: "Computer Science", skills: 12, score: "95%" },
                  { name: "Bob Smith", dept: "Information Technology", skills: 10, score: "92%" },
                  { name: "Carol Davis", dept: "ECE", skills: 8, score: "89%" },
                ].map((student, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                        {i + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{student.name}</p>
                        <p className="text-xs text-muted-foreground">{student.dept}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">{student.score}</p>
                      <p className="text-xs text-muted-foreground">{student.skills} skills</p>
                    </div>
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
