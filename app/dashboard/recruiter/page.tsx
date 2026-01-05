import { DashboardShell } from "@/components/dashboard-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Filter, ShieldCheck, GraduationCap } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Suspense } from "react"

function RecruiterContent() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Recruiter Portal</h1>
        <p className="text-muted-foreground">Search and verify top talent based on demonstrable skills.</p>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-10" placeholder="Search by skill (e.g. React, Python, Data Science)..." />
        </div>
        <Button variant="outline" className="gap-2 bg-transparent">
          <Filter className="h-4 w-4" />
          Filters
        </Button>
        <Button className="bg-primary hover:bg-primary/90">Search Talent</Button>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Recommended Candidates</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              name: "Arjun Verma",
              college: "MIT Technology",
              skills: ["React", "TypeScript", "Node.js"],
              verified: true,
            },
            { name: "Priya Sharma", college: "Stanford Inst.", skills: ["Python", "Pandas", "ML"], verified: true },
            {
              name: "Kevin Durant",
              college: "Austin College",
              skills: ["AWS", "Docker", "Kubernetes"],
              verified: true,
            },
          ].map((candidate, i) => (
            <Card key={i} className="group hover:border-primary/50 transition-all">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-lg font-bold">
                    {candidate.name.charAt(0)}
                  </div>
                  {candidate.verified && (
                    <Badge className="bg-accent/10 text-accent border-accent/20 flex gap-1">
                      <ShieldCheck className="h-3 w-3" />
                      Verified
                    </Badge>
                  )}
                </div>
                <CardTitle className="mt-4">{candidate.name}</CardTitle>
                <CardDescription className="flex items-center gap-1">
                  <GraduationCap className="h-3 w-3" />
                  {candidate.college}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-6">
                  {candidate.skills.map((s, j) => (
                    <Badge key={j} variant="secondary" className="text-[10px]">
                      {s}
                    </Badge>
                  ))}
                </div>
                <Button
                  variant="outline"
                  className="w-full text-xs h-8 group-hover:bg-primary group-hover:text-primary-foreground bg-transparent"
                >
                  View Verified Profile
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function RecruiterDashboard() {
  return (
    <DashboardShell>
      <Suspense fallback={<div>Loading recruiter portal...</div>}>
        <RecruiterContent />
      </Suspense>
    </DashboardShell>
  )
}
