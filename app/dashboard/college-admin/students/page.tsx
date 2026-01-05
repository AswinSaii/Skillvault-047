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
  Download,
  Filter
} from "lucide-react"

const students = [
  { id: 1, name: "Alice Johnson", email: "alice.j@student.edu", department: "Computer Science", skills: 12, certificates: 8, avgScore: 95, status: "active" },
  { id: 2, name: "Bob Smith", email: "bob.s@student.edu", department: "Information Technology", skills: 10, certificates: 6, avgScore: 92, status: "active" },
  { id: 3, name: "Carol Davis", email: "carol.d@student.edu", department: "ECE", skills: 8, certificates: 5, avgScore: 89, status: "active" },
  { id: 4, name: "David Wilson", email: "david.w@student.edu", department: "Computer Science", skills: 15, certificates: 10, avgScore: 97, status: "active" },
  { id: 5, name: "Emma Brown", email: "emma.b@student.edu", department: "Mechanical", skills: 6, certificates: 4, avgScore: 85, status: "inactive" },
]

export default function StudentsManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [activeTab, setActiveTab] = useState("all")

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDepartment = departmentFilter === "all" || student.department === departmentFilter
    const matchesTab = activeTab === "all" || student.status === activeTab
    return matchesSearch && matchesDepartment && matchesTab
  })

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Student Management</h1>
            <p className="text-muted-foreground">Monitor student performance and engagement</p>
          </div>
          <Button className="gap-2" variant="outline">
            <Download className="h-4 w-4" />
            Export Data
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{students.length}</div>
              <p className="text-xs text-muted-foreground">
                {students.filter(s => s.status === "active").length} active
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Avg. Skills/Student</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(students.reduce((acc, s) => acc + s.skills, 0) / students.length).toFixed(1)}
              </div>
              <p className="text-xs text-muted-foreground">Platform average: 8.2</p>
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
              <p className="text-xs text-muted-foreground">This academic year</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Avg. Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(students.reduce((acc, s) => acc + s.avgScore, 0) / students.length).toFixed(1)}%
              </div>
              <p className="text-xs flex items-center gap-1 text-green-600">
                <TrendingUp className="h-3 w-3" />
                +3.2% from last month
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Student Directory</CardTitle>
                <CardDescription>View and track student progress</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <div className="flex items-center justify-between">
                <TabsList>
                  <TabsTrigger value="all">All Students</TabsTrigger>
                  <TabsTrigger value="active">Active</TabsTrigger>
                  <TabsTrigger value="inactive">Inactive</TabsTrigger>
                </TabsList>
              </div>

              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search students by name or email..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger className="w-48">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    <SelectItem value="Computer Science">Computer Science</SelectItem>
                    <SelectItem value="Information Technology">Information Technology</SelectItem>
                    <SelectItem value="ECE">ECE</SelectItem>
                    <SelectItem value="Mechanical">Mechanical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <TabsContent value={activeTab} className="mt-4">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Skills Mastered</TableHead>
                        <TableHead>Certificates</TableHead>
                        <TableHead>Avg. Score</TableHead>
                        <TableHead>Status</TableHead>
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
                          <TableCell>{student.department}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 text-sm font-bold dark:bg-blue-900/30">
                                {student.skills}
                              </div>
                              <span className="text-sm text-muted-foreground">skills</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Award className="h-4 w-4 text-yellow-600" />
                              <span>{student.certificates}</span>
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
                            <Badge variant={student.status === "active" ? "default" : "outline"}>
                              {student.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Top Performers</CardTitle>
              <CardDescription>Students with highest average scores</CardDescription>
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
                          <p className="text-xs text-muted-foreground">{student.department}</p>
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
              <CardDescription>Students with most earned certificates</CardDescription>
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
                          <p className="text-xs text-muted-foreground">{student.skills} skills</p>
                        </div>
                      </div>
                      <Badge variant="outline">{student.certificates} certs</Badge>
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
