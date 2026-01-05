import { Button } from "@/components/ui/button"
import { DashboardShell } from "@/components/dashboard-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Award, BookOpen, Clock, Zap, TrendingUp, Target } from "lucide-react"
import { cn } from "@/lib/utils"

export default function StudentDashboard() {
  return (
    <DashboardShell>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Student Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Track your skills and maintain your streak.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
              <Zap className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12 Days</div>
              <p className="text-xs text-muted-foreground">+2 from last week</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Certificates Earned</CardTitle>
              <Award className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5</div>
              <p className="text-xs text-muted-foreground">2 pending verification</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Tests</CardTitle>
              <BookOpen className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">Next: Python Advanced</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Hours of Practice</CardTitle>
              <Clock className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">48h</div>
              <p className="text-xs text-muted-foreground">Across 8 skills</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Skill Progress Analytics</CardTitle>
              <CardDescription>Your competency levels across key technical domains</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {[
                  { skill: "Frontend Architecture", progress: 85, color: "bg-primary" },
                  { skill: "Backend Logic & APIs", progress: 62, color: "bg-accent" },
                  { skill: "Data Structures", progress: 78, color: "bg-primary" },
                  { skill: "System Design", progress: 45, color: "bg-muted-foreground/30" },
                ].map((skill, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{skill.skill}</span>
                      <span className="text-muted-foreground">{skill.progress}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn("h-full rounded-full transition-all duration-500", skill.color)}
                        style={{ width: `${skill.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Skill Gap Insights</CardTitle>
              <CardDescription>AI-recommended focus areas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-accent/5 p-3 border border-accent/10">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="h-4 w-4 text-accent" />
                  <span className="text-sm font-semibold">Primary Focus</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Improve your "Asynchronous JS" accuracy (currently 42%) to unlock the Fullstack Certification.
                </p>
              </div>
              <div className="rounded-lg bg-primary/5 p-3 border border-primary/10">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold">Growth Opportunity</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Your "SQL Query Optimization" score is high. Consider taking the Advanced Database Assessment.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Assessments</CardTitle>
              <CardDescription>Your performance in the last 5 tests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: "Data Structures", score: "92%", date: "2 days ago", status: "Completed" },
                  { name: "Web Development", score: "88%", date: "1 week ago", status: "Completed" },
                  { name: "Cloud Computing", score: "-", date: "Tomorrow", status: "Upcoming" },
                ].map((test, i) => (
                  <div key={i} className="flex items-center justify-between border-b pb-2 last:border-0">
                    <div>
                      <p className="font-medium">{test.name}</p>
                      <p className="text-xs text-muted-foreground">{test.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{test.score}</p>
                      <Badge variant={test.status === "Upcoming" ? "outline" : "secondary"} className="text-[10px]">
                        {test.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Daily Skill Quiz</CardTitle>
              <CardDescription>Complete your daily quiz to maintain your streak!</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-6 text-center">
              <div className="mb-4 rounded-full bg-accent/10 p-4 text-accent">
                <Zap className="h-10 w-10 fill-current" />
              </div>
              <h3 className="mb-2 font-bold">Daily Javascript Logic</h3>
              <p className="mb-6 text-sm text-muted-foreground">Estimated time: 5 minutes</p>
              <Button className="w-full">Start Daily Quiz</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  )
}
