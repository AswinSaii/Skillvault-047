"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { DashboardShell } from "@/components/dashboard-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  Award,
  TrendingUp,
} from "lucide-react"
import { getAttemptsByStudent } from "@/lib/firebase/assessments"
import { cn } from "@/lib/utils"

export default function StudentHistoryPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [attempts, setAttempts] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")

  useEffect(() => {
    loadHistory()
  }, [user])

  const loadHistory = async () => {
    if (!user?.uid) return

    setLoading(true)
    try {
      const attemptsData = await getAttemptsByStudent(user.uid)
      setAttempts(attemptsData)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const filteredAttempts = attempts.filter((attempt) => {
    const matchesSearch = true // Would search by assessment title
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "passed" && attempt.percentage >= 70) ||
      (filterStatus === "failed" && attempt.percentage < 70)

    return matchesSearch && matchesStatus
  })

  const stats = {
    totalAttempts: attempts.length,
    passed: attempts.filter((a) => a.percentage >= 70).length,
    failed: attempts.filter((a) => a.percentage < 70).length,
    averageScore: attempts.length > 0
      ? Math.round(attempts.reduce((acc, a) => acc + a.percentage, 0) / attempts.length)
      : 0,
  }

  return (
    <DashboardShell
      heading="Assessment History"
      description="View your past assessment attempts and results"
    >
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Attempts</CardDescription>
              <CardTitle className="text-3xl">{stats.totalAttempts}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Passed</CardDescription>
              <CardTitle className="text-3xl text-green-600">{stats.passed}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Failed</CardDescription>
              <CardTitle className="text-3xl text-red-600">{stats.failed}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Average Score</CardDescription>
              <CardTitle className="text-3xl">{stats.averageScore}%</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search history..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-50">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="passed">Passed</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* History Table */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">
                Loading history...
              </div>
            ) : filteredAttempts.length === 0 ? (
              <div className="text-center py-12">
                <Award className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No attempts yet</h3>
                <p className="text-muted-foreground">
                  Start taking assessments to build your history
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Assessment</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Time Spent</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Result</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAttempts.map((attempt, idx) => {
                    const passed = attempt.percentage >= 70
                    return (
                      <TableRow key={attempt.id}>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {new Date(attempt.submittedAt || attempt.startedAt).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">Assessment #{idx + 1}</div>
                            <div className="text-xs text-muted-foreground">
                              ID: {attempt.assessmentId.substring(0, 8)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-bold">{attempt.percentage}%</div>
                            <div className="text-xs text-muted-foreground">
                              {attempt.score}/{attempt.totalMarks}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            {Math.floor(attempt.timeSpent / 60)}m
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={attempt.status === "completed" ? "default" : "secondary"}>
                            {attempt.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {passed ? (
                              <>
                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                                <Badge variant="default" className="bg-green-600">
                                  Passed
                                </Badge>
                              </>
                            ) : (
                              <>
                                <XCircle className="h-5 w-5 text-red-600" />
                                <Badge variant="destructive">Failed</Badge>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Performance Trend */}
        {attempts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Performance Trend</CardTitle>
              <CardDescription>Your score progression over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-muted-foreground">
                <TrendingUp className="h-5 w-5" />
                <span>Performance analytics will be displayed here</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardShell>
  )
}
