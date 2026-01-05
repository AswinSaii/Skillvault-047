"use client"

import { DashboardShell } from "@/components/dashboard-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Plus, Search, BookOpen, Code, Database, Layout } from "lucide-react"
import { Suspense } from "react"

function SkillsContent() {
  const categories = [
    { name: "Frontend", icon: Layout, color: "bg-blue-500/10 text-blue-500", count: 12 },
    { name: "Backend", icon: Database, color: "bg-green-500/10 text-green-500", count: 8 },
    { name: "Languages", icon: Code, color: "bg-orange-500/10 text-orange-500", count: 15 },
    { name: "CS Fundamentals", icon: BookOpen, color: "bg-purple-500/10 text-purple-500", count: 6 },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Skill Library</h1>
          <p className="text-muted-foreground">Define and categorize skills for platform-wide assessment.</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Skill
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {categories.map((cat, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <div className={`p-2 w-fit rounded-lg ${cat.color}`}>
                <cat.icon className="h-5 w-5" />
              </div>
              <CardTitle className="text-lg mt-2">{cat.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{cat.count}</div>
              <p className="text-xs text-muted-foreground">Active Skills</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Global Skills</CardTitle>
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search skills..." className="pl-10" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {["JavaScript", "React", "Node.js", "Python", "SQL", "TypeScript", "Data Structures", "Algorithms"].map(
              (skill, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-muted/20"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                      {skill[0]}
                    </div>
                    <div>
                      <p className="font-semibold">{skill}</p>
                      <p className="text-xs text-muted-foreground">324 Certified Users</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    Manage
                  </Button>
                </div>
              ),
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function SkillsManagement() {
  return (
    <DashboardShell>
      <Suspense fallback={null}>
        <SkillsContent />
      </Suspense>
    </DashboardShell>
  )
}
