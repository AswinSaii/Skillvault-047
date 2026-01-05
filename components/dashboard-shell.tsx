"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  BookOpen,
  Award,
  Users,
  Settings,
  LogOut,
  GraduationCap,
  Building2,
  Search,
  ShieldCheck,
  Menu,
  TrendingUp,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { VerifiedBadge } from "@/components/verified-badge"

interface NavItem {
  title: string
  href: string
  icon: React.ElementType
}

const roleNavItems: Record<string, NavItem[]> = {
  student: [
    { title: "Overview", href: "/dashboard/student", icon: LayoutDashboard },
    { title: "Assessments", href: "/dashboard/student/assessments", icon: BookOpen },
    { title: "Certificates", href: "/dashboard/student/certificates", icon: Award },
    { title: "Skill Progress", href: "/dashboard/student/analytics", icon: Settings },
  ],
  faculty: [
    { title: "Overview", href: "/dashboard/faculty", icon: LayoutDashboard },
    { title: "Assessments", href: "/dashboard/faculty/manage", icon: BookOpen },
    { title: "Students", href: "/dashboard/faculty/students", icon: Users },
    { title: "Question Bank", href: "/dashboard/faculty/questions", icon: ShieldCheck },
  ],
  "college-admin": [
    { title: "Dashboard", href: "/dashboard/college-admin", icon: LayoutDashboard },
    { title: "Faculty", href: "/dashboard/college-admin/faculty", icon: Users },
    { title: "Students", href: "/dashboard/college-admin/students", icon: GraduationCap },
    { title: "Certificates", href: "/dashboard/college-admin/certificates", icon: Award },
  ],
  recruiter: [
    { title: "Search Talent", href: "/dashboard/recruiter", icon: Search },
    { title: "Verify Skills", href: "/dashboard/recruiter/verify", icon: ShieldCheck },
    { title: "Shortlisted", href: "/dashboard/recruiter/shortlisted", icon: Users },
  ],
  "super-admin": [
    { title: "Dashboard", href: "/dashboard/super-admin", icon: LayoutDashboard },
    { title: "Users", href: "/dashboard/super-admin/users", icon: Users },
    { title: "Colleges", href: "/dashboard/super-admin/colleges", icon: Building2 },
    { title: "Skills", href: "/dashboard/super-admin/skills", icon: BookOpen },
    { title: "Certificates", href: "/dashboard/super-admin/certificates", icon: Award },
    { title: "Templates", href: "/dashboard/super-admin/templates", icon: ShieldCheck },
    { title: "Analysis", href: "/dashboard/super-admin/analysis", icon: TrendingUp },
    { title: "Reports", href: "/dashboard/super-admin/reports", icon: BookOpen },
    { title: "Profile", href: "/dashboard/super-admin/profile", icon: Users },
    { title: "Settings", href: "/dashboard/super-admin/settings", icon: Settings },
  ],
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const [isMobileNavOpen, setIsMobileNavOpen] = React.useState(false)

  if (!user) return null

  const items = roleNavItems[user.role] || []

  const Sidebar = () => (
    <div className="flex h-full flex-col gap-4">
      <div className="flex h-16 items-center px-6">
        <Link href="/" className="flex items-center gap-2">
          <GraduationCap className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">SkillVault</span>
        </Link>
      </div>
      <ScrollArea className="flex-1 px-3">
        <div className="space-y-1">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                pathname === item.href ? "bg-accent text-accent-foreground" : "text-muted-foreground",
              )}
            >
              <item.icon className="mr-3 h-4 w-4" />
              {item.title}
            </Link>
          ))}
        </div>
      </ScrollArea>
      <div className="border-t p-4">
        <div className="mb-4 flex items-center gap-3 px-2">
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-sm font-medium">{user.name}</p>
            <p className="truncate text-xs text-muted-foreground capitalize">{user.role.replace("-", " ")}</p>
          </div>
        </div>
        <Button
          variant="outline"
          className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive bg-transparent"
          onClick={logout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 border-r bg-card md:block">
        <Sidebar />
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        {/* Top Header */}
        <header className="flex h-16 items-center justify-between border-b bg-card px-4 md:px-8">
          <div className="flex items-center gap-4">
            <Sheet open={isMobileNavOpen} onOpenChange={setIsMobileNavOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <Sidebar />
              </SheetContent>
            </Sheet>
            <div className="hidden items-center gap-2 md:flex">
              {user.collegeName && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  <span>{user.collegeName}</span>
                  <VerifiedBadge />
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" className="hidden sm:flex bg-transparent">
              Help & Support
            </Button>
            <div className="h-8 w-8 rounded-full bg-muted border flex items-center justify-center text-xs font-medium">
              JD
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  )
}
