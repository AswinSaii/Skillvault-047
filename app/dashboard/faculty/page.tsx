import { DashboardShell } from "@/components/dashboard-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, FileText, BarChart3, PlusCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function FacultyDashboard() {
  return (
    <DashboardShell>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Faculty Dashboard</h1>
            <p className="text-muted-foreground">Manage assessments and monitor student performance.</p>
          </div>
          <Button className="gap-2">
            <PlusCircle className="h-4 w-4" />
            New Assessment
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Students</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">428</div>
              <p className="text-xs text-muted-foreground">Across 5 departments</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Assessments</CardTitle>
              <FileText className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">3 scheduled for this week</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Avg. Pass Rate</CardTitle>
              <BarChart3 className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">76.4%</div>
              <p className="text-xs text-muted-foreground">+2.1% from last month</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Assessment Performance Distribution</CardTitle>
              <CardDescription>Class-wide score trends for "React Advanced Final"</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex h-[240px] items-end justify-between gap-2 px-2 pb-4">
                {[45, 60, 85, 95, 75, 55, 40, 65, 90, 80].map((height, i) => (
                  <div key={i} className="relative w-full group">
                    <div
                      className="w-full bg-primary/20 hover:bg-primary transition-colors rounded-t-sm"
                      style={{ height: `${height}%` }}
                    />
                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-muted-foreground">
                      B{i + 1}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 flex items-center justify-center gap-6 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <span>Pass Rate (70%+)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary/20" />
                  <span>Below Threshold</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Proctoring Alerts</CardTitle>
              <CardDescription>Unusual activity detected during tests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { user: "David L.", reason: "Tab Switch (3x)", time: "Just now", severity: "high" },
                  { user: "Sarah M.", reason: "Fullscreen Exit", time: "5m ago", severity: "medium" },
                  { user: "James K.", reason: "Right Click Attempt", time: "12m ago", severity: "low" },
                ].map((alert, i) => (
                  <div key={i} className="flex items-start gap-3 rounded-md border p-2 text-xs">
                    <AlertCircle
                      className={cn(
                        "mt-0.5 h-3.5 w-3.5",
                        alert.severity === "high"
                          ? "text-destructive"
                          : alert.severity === "medium"
                            ? "text-orange-500"
                            : "text-muted-foreground",
                      )}
                    />
                    <div className="flex-1">
                      <p className="font-semibold">{alert.user}</p>
                      <p className="text-muted-foreground">{alert.reason}</p>
                    </div>
                    <span className="text-[10px] text-muted-foreground">{alert.time}</span>
                  </div>
                ))}
              </div>
              <Button variant="outline" size="sm" className="mt-4 w-full text-xs bg-transparent">
                View All Logs
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Student Activity</CardTitle>
            <CardDescription>Monitor assessment completions in real-time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[
                { student: "Alex Johnson", test: "React Basics", score: "95%", time: "10 mins ago" },
                { student: "Sarah Smith", test: "Node.js Core", score: "82%", time: "25 mins ago" },
                { student: "Michael Brown", test: "Database Design", score: "Pass", time: "1 hour ago" },
                { student: "Emily Davis", test: "React Basics", score: "64%", time: "2 hours ago" },
              ].map((activity, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold">
                      {activity.student.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{activity.student}</p>
                      <p className="text-xs text-muted-foreground">Completed: {activity.test}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">{activity.score}</p>
                    <p className="text-[10px] text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}
