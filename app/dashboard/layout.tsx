"use client"

import type React from "react"
import { usePathname } from "next/navigation"
import { AuthProvider, useAuth, type UserRole } from "@/lib/auth-context"
import { RouteGuard } from "@/lib/middleware/route-guard"

function DashboardContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user, isLoading } = useAuth()

  // Determine allowed roles based on pathname
  const getAllowedRoles = (): UserRole[] => {
    if (pathname?.startsWith("/dashboard/student")) {
      return ["student"]
    }
    if (pathname?.startsWith("/dashboard/faculty")) {
      return ["faculty"]
    }
    if (pathname?.startsWith("/dashboard/college-admin")) {
      return ["college-admin"]
    }
    if (pathname?.startsWith("/dashboard/recruiter")) {
      return ["recruiter"]
    }
    if (pathname?.startsWith("/dashboard/super-admin")) {
      return ["super-admin"]
    }
    return ["student", "faculty", "college-admin", "recruiter", "super-admin"]
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <RouteGuard allowedRoles={getAllowedRoles()}>
      {children}
    </RouteGuard>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <DashboardContent>{children}</DashboardContent>
    </AuthProvider>
  )
}
