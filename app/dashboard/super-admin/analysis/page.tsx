"use client"

import { DashboardShell } from "@/components/dashboard-shell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Line, LineChart } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { TrendingUp, Users, Award, ShieldAlert } from "lucide-react"

const enrollmentData = [
  { month: "Jan", students: 4500, faculty: 120, certifications: 800 },
  { month: "Feb", students: 5200, faculty: 150, certifications: 950 },
  { month: "Mar", students: 6100, faculty: 180, certifications: 1100 },
  { month: "Apr", students: 7800, faculty: 210, certifications: 1400 },
  { month: "May", students: 9500, faculty: 240, certifications: 1800 },
  { month: "Jun", students: 12500, faculty: 300, certifications: 3240 },
]

const skillPopularity = [
  { name: "JavaScript", count: 4200 },
  { name: "Python", count: 3800 },
  { name: "React", count: 3500 },
  { name: "Node.js", count: 2900 },
  { name: "SQL", count: 2500 },
]

export default function AnalysisPage() {
  return (
    <DashboardShell>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Platform Analysis</h1>
          <p className="text-muted-foreground">
            Deep insights into user growth, skill trends, and certification metrics.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            { title: "Active Students", value: "12,500", icon: Users, trend: "+12% this month" },
            { title: "Total Certifications", value: "34,201", icon: Award, trend: "+18% this month" },
            { title: "Faculty Members", value: "300", icon: TrendingUp, trend: "+5% this month" },
            { title: "Suspicious Activities", value: "12", icon: ShieldAlert, trend: "-2% this month" },
          ].map((stat, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.trend}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-7">
          <Card className="lg:col-span-4">
            <CardHeader>
              <CardTitle>Growth Trends</CardTitle>
              <CardDescription>User and certification growth over the last 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  students: { label: "Students", color: "hsl(var(--chart-1))" },
                  certifications: { label: "Certifications", color: "hsl(var(--chart-2))" },
                }}
                className="h-[350px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={enrollmentData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="students"
                      stroke="var(--color-students)"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="certifications"
                      stroke="var(--color-certifications)"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Skill Popularity</CardTitle>
              <CardDescription>Most certified skills on the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  count: { label: "Certified Users", color: "hsl(var(--chart-3))" },
                }}
                className="h-[350px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={skillPopularity} layout="vertical" margin={{ left: 20 }}>
                    <XAxis type="number" hide />
                    <YAxis
                      dataKey="name"
                      type="category"
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="count" fill="var(--color-count)" radius={[0, 4, 4, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  )
}
