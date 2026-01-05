"use client"

import { useState } from "react"
import { DashboardShell } from "@/components/dashboard-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Search, 
  GraduationCap, 
  Award, 
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart3
} from "lucide-react"
import { Progress } from "@/components/ui/progress"

const students = [
  { id: 1, name: "Alice Johnson", email: "alice.j@student.edu", assessments: 12, completed: 12, avgScore: 95, certificates: 8, trend: "up" },
  { id: 2, name: "Bob Smith", email: "bob.s@student.edu", assessments: 10, completed: 9, avgScore: 92, certificates: 6, trend: "up" },
  { id: 3, name: "Carol Davis", email: "carol.d@student.edu", assessments: 8, completed: 8, avgScore: 89, certificates: 5, trend: "stable" },
  { id: 4, name: "David Wilson", email: "david.w@student.edu", assessments: 15, completed: 14, avgScore: 97, certificates: 10, trend: "up" },
  { id: 5, name: "Emma Brown", email: "emma.b@student.edu", assessments: 6, completed: 5, avgScore: 72, certificates: 3, trend: "down" },
  { id: 6, name: "Frank Miller", email: "frank.m@student.edu", assessments: 11, completed: 10, avgScore: 85, certificates: 7, trend: "stable" },
  { id: 7, name: "Grace Lee", email: "grace.l@student.edu", assessments: 9, completed: 9, avgScore: 91, certificates: 6, trend: "up" },
]

export default function FacultyStudents() {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("avgScore")

  const filteredStudents = students
    .filter(student => {
      const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           student.email.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesSearch
    })
    .sort((a, b) => {
      if (sortBy === "avgScore") return b.avgScore - a.avgScore
      if (sortBy === "assessments") return b.assessments - a.assessments
      if (sortBy === "certificates") return b.certificates - a.certificates
      return 0
    })

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Students</h1>
            <p className="text-muted-foreground">Track student performance and progress</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{students.length}</div>
              <p className="text-xs text-muted-foreground">Under supervision</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Avg. Completion</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round((students.reduce((acc, s) => acc + (s.completed / s.assessments), 0) / students.length) * 100)}%
              </div>
              <p className="text-xs text-muted-foreground">Assessment rate</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Avg. Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(students.reduce((acc, s) => acc + s.avgScore, 0) / students.length)}%
              </div>
              <p className="text-xs text-green-600">Above target</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Certificates Earned</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {students.reduce((acc, s) => acc + s.certificates, 0)}
              </div>
              <p className="text-xs text-muted-foreground">Total issued</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Student Performance</CardTitle>
                <CardDescription>Detailed view of individual student progress</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search students by name or email..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="avgScore">Average Score</SelectItem>
                  <SelectItem value="assessments">Assessments Taken</SelectItem>
                  <SelectItem value="certificates">Certificates</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Assessments</TableHead>
                    <TableHead>Completion Rate</TableHead>
                    <TableHead>Avg. Score</TableHead>
                    <TableHead>Certificates</TableHead>
                    <TableHead>Trend</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                            <GraduationCap className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{student.name}</p>
                            <p className="text-sm text-muted-foreground">{student.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <BarChart3 className="h-4 w-4 text-muted-foreground" />
                          <span>{student.completed}/{student.assessments}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span>{Math.round((student.completed / student.assessments) * 100)}%</span>
                          </div>
                          <Progress 
                            value={(student.completed / student.assessments) * 100} 
                            className="h-2"
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`w-12 h-2 rounded-full bg-muted overflow-hidden`}>
                            <div 
                              className={`h-full ${
                                student.avgScore >= 90 ? "bg-green-500" :
                                student.avgScore >= 75 ? "bg-yellow-500" :
                                "bg-red-500"
                              }`}
                              style={{ width: `${student.avgScore}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{student.avgScore}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Award className="h-4 w-4 text-yellow-600" />
                          <span>{student.certificates}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {student.trend === "up" ? (
                          <Badge variant="default" className="gap-1">
                            <TrendingUp className="h-3 w-3" />
                            Improving
                          </Badge>
                        ) : student.trend === "down" ? (
                          <Badge variant="destructive" className="gap-1">
                            <TrendingDown className="h-3 w-3" />
                            Declining
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="gap-1">
                            <Minus className="h-3 w-3" />
                            Stable
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Top Performers</CardTitle>
              <CardDescription>Highest average scores</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {students
                  .sort((a, b) => b.avgScore - a.avgScore)
                  .slice(0, 5)
                  .map((student, i) => (
                    <div key={student.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                          {i + 1}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{student.name}</p>
                          <p className="text-xs text-muted-foreground">{student.assessments} assessments</p>
                        </div>
                      </div>
                      <Badge variant="default">{student.avgScore}%</Badge>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Most Certified</CardTitle>
              <CardDescription>Students with most certificates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {students
                  .sort((a, b) => b.certificates - a.certificates)
                  .slice(0, 5)
                  .map((student, i) => (
                    <div key={student.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30">
                          <Award className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{student.name}</p>
                          <p className="text-xs text-muted-foreground">{student.avgScore}% avg</p>
                        </div>
                      </div>
                      <Badge variant="outline">{student.certificates}</Badge>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Need Attention</CardTitle>
              <CardDescription>Students with declining trend</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {students
                  .filter(s => s.trend === "down" || s.avgScore < 75)
                  .slice(0, 5)
                  .map((student) => (
                    <div key={student.id} className="flex items-center justify-between p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                      <div className="flex items-center gap-3">
                        <TrendingDown className="h-5 w-5 text-destructive" />
                        <div>
                          <p className="text-sm font-medium">{student.name}</p>
                          <p className="text-xs text-muted-foreground">{student.avgScore}% avg</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        Contact
                      </Button>
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
