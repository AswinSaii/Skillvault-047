import Link from "next/link"
import Image from "next/image"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Award, CheckCircle2, Code, GraduationCap, Search, ShieldCheck, Zap, BarChart3, Users, FileCheck, Trophy } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-background pt-16 pb-24 md:pt-24 md:pb-32">
          {/* Background decoration */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
          </div>
          
          <div className="container relative z-10 mx-auto px-4 text-center">
            <div className="mx-auto mb-6 flex max-w-fit items-center gap-2 rounded-full border border-border bg-muted/50 px-4 py-1.5 backdrop-blur-sm">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Verified by Global Educational Authorities</span>
            </div>
            <h1 className="mx-auto mb-6 max-w-4xl text-balance text-4xl font-bold tracking-tight text-foreground md:text-6xl lg:text-7xl">
              Skill-First <span className="text-primary">Certification</span> for the Next Generation
            </h1>
            <p className="mx-auto mb-10 max-w-2xl text-pretty text-lg text-muted-foreground md:text-xl">
              SkillVault bridges the gap between colleges and companies by shifting focus from marks to verified,
              demonstrable skills.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" className="h-12 px-8 text-base font-semibold" asChild>
                <Link href="/signup">Join as Student</Link>
              </Button>
              <Button size="lg" variant="outline" className="h-12 px-8 text-base font-semibold bg-transparent" asChild>
                <Link href="/signup?role=college">Register College</Link>
              </Button>
            </div>

            {/* Dashboard Preview */}
            <div className="mt-16 overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
              <div className="border-b border-border bg-muted/50 px-4 py-2 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-destructive" />
                <div className="h-2 w-2 rounded-full bg-yellow-400" />
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span className="ml-2 text-[10px] text-muted-foreground font-mono">skillvault-admin-v1.0</span>
              </div>
              {/* Dashboard Preview Content */}
              <div className="bg-linear-to-br from-background to-muted/30 p-6 md:p-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="rounded-lg bg-card border border-border p-4 text-left">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-4 w-4 text-primary" />
                      <span className="text-xs text-muted-foreground">Total Users</span>
                    </div>
                    <p className="text-2xl font-bold">12,847</p>
                    <p className="text-xs text-green-500">+12% this month</p>
                  </div>
                  <div className="rounded-lg bg-card border border-border p-4 text-left">
                    <div className="flex items-center gap-2 mb-2">
                      <FileCheck className="h-4 w-4 text-accent" />
                      <span className="text-xs text-muted-foreground">Assessments</span>
                    </div>
                    <p className="text-2xl font-bold">3,421</p>
                    <p className="text-xs text-green-500">+8% this month</p>
                  </div>
                  <div className="rounded-lg bg-card border border-border p-4 text-left">
                    <div className="flex items-center gap-2 mb-2">
                      <Trophy className="h-4 w-4 text-yellow-500" />
                      <span className="text-xs text-muted-foreground">Certificates</span>
                    </div>
                    <p className="text-2xl font-bold">8,932</p>
                    <p className="text-xs text-green-500">+23% this month</p>
                  </div>
                  <div className="rounded-lg bg-card border border-border p-4 text-left">
                    <div className="flex items-center gap-2 mb-2">
                      <BarChart3 className="h-4 w-4 text-blue-500" />
                      <span className="text-xs text-muted-foreground">Avg Score</span>
                    </div>
                    <p className="text-2xl font-bold">78.5%</p>
                    <p className="text-xs text-green-500">+5% this month</p>
                  </div>
                </div>
                {/* Chart placeholder */}
                <div className="rounded-lg bg-card border border-border p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold">Skill Assessment Analytics</h3>
                    <span className="text-xs text-muted-foreground">Last 30 days</span>
                  </div>
                  <div className="flex items-end gap-2 h-32">
                    {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((height, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-primary/20 rounded-t-sm hover:bg-primary/40 transition-colors"
                        style={{ height: `${height}%` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-muted/30 py-24">
          <div className="container mx-auto px-4">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">Comprehensive Skill Ecosystem</h2>
              <p className="mx-auto max-w-2xl text-muted-foreground">
                Everything you need to assess, certify, and hire top talent in one unified platform.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: "Skill Assessment",
                  description: "MCQ-based assessments and coding challenges with real-time test-case evaluation.",
                  icon: Code,
                },
                {
                  title: "Verified Trust",
                  description: "College-verified badges for profiles and certificates with QR-based validation.",
                  icon: ShieldCheck,
                },
                {
                  title: "Daily Streaks",
                  description: "Gamified learning with daily quizzes to maintain skill streaks and participation.",
                  icon: Zap,
                },
                {
                  title: "Advanced Analytics",
                  description: "Deep insights into skill gaps, accuracy percentages, and performance history.",
                  icon: Award,
                },
                {
                  title: "Recruiter Access",
                  description: "Find pre-verified candidates based on specific skill requirements.",
                  icon: Search,
                },
                {
                  title: "Proctoring",
                  description: "Lightweight browser-level proctoring to ensure assessment integrity.",
                  icon: CheckCircle2,
                },
              ].map((feature, idx) => (
                <Card
                  key={idx}
                  className="border-border/50 bg-background/50 transition-all hover:border-primary/50 hover:shadow-lg"
                >
                  <CardHeader>
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Roles Section */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
              <div>
                <h2 className="mb-6 text-3xl font-bold md:text-4xl">
                  One Platform, <span className="text-primary">Five Unique Experiences</span>
                </h2>
                <div className="space-y-6">
                  {[
                    {
                      role: "Students",
                      text: "Maintain streaks, earn certificates, and showcase verified skills to recruiters.",
                    },
                    {
                      role: "Faculty",
                      text: "Create assessments, manage question banks, and track student skill analytics.",
                    },
                    {
                      role: "Colleges",
                      text: "Onboard faculty, issue certificates, and get the official verified badge.",
                    },
                    { role: "Recruiters", text: "Find pre-verified candidates based on specific skill requirements." },
                    { role: "Super Admins", text: "Manage the global trust system and platform-wide analytics." },
                  ].map((item, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className="mt-1 h-5 w-5 shrink-0 rounded-full bg-accent/20 flex items-center justify-center">
                        <CheckCircle2 className="h-3 w-3 text-accent" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">{item.role}</h4>
                        <p className="text-sm text-muted-foreground">{item.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative">
                <div className="absolute -inset-4 rounded-3xl bg-primary/5 blur-2xl" />
                {/* Multi-role Dashboard Preview */}
                <div className="relative rounded-2xl border border-border bg-card shadow-xl overflow-hidden">
                  <div className="border-b border-border bg-muted/50 px-4 py-2 flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-destructive" />
                    <div className="h-2 w-2 rounded-full bg-yellow-400" />
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                  </div>
                  <div className="p-6 space-y-4">
                    {/* Student Dashboard Preview */}
                    <div className="rounded-lg bg-muted/30 p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                          <GraduationCap className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Student Dashboard</p>
                          <p className="text-xs text-muted-foreground">Track your skills & certificates</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="rounded bg-background p-2 text-center">
                          <p className="text-lg font-bold text-primary">15</p>
                          <p className="text-[10px] text-muted-foreground">Day Streak</p>
                        </div>
                        <div className="rounded bg-background p-2 text-center">
                          <p className="text-lg font-bold text-accent">8</p>
                          <p className="text-[10px] text-muted-foreground">Certificates</p>
                        </div>
                        <div className="rounded bg-background p-2 text-center">
                          <p className="text-lg font-bold text-green-500">92%</p>
                          <p className="text-[10px] text-muted-foreground">Avg Score</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Faculty Preview */}
                    <div className="rounded-lg bg-muted/30 p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="h-8 w-8 rounded-full bg-accent/20 flex items-center justify-center">
                          <Award className="h-4 w-4 text-accent" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Faculty Panel</p>
                          <p className="text-xs text-muted-foreground">Manage assessments & analytics</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <div className="flex-1 h-2 rounded-full bg-primary/30" />
                        <div className="flex-1 h-2 rounded-full bg-accent/30" />
                        <div className="flex-1 h-2 rounded-full bg-green-500/30" />
                      </div>
                    </div>
                    
                    {/* Recruiter Preview */}
                    <div className="rounded-lg bg-muted/30 p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                          <Search className="h-4 w-4 text-blue-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Recruiter Portal</p>
                          <p className="text-xs text-muted-foreground">Find verified talent instantly</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-muted/30 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">SkillVault</span>
            </div>
            <p className="text-sm text-muted-foreground">© 2026 SkillVault Platform. All rights reserved.</p>
            <div className="flex gap-6 text-sm font-medium text-muted-foreground">
              <Link href="#" className="hover:text-primary">
                Terms
              </Link>
              <Link href="#" className="hover:text-primary">
                Privacy
              </Link>
              <Link href="#" className="hover:text-primary">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
