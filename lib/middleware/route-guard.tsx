"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth, type UserRole } from "@/lib/auth-context"

interface RouteGuardProps {
  children: React.ReactNode
  allowedRoles: UserRole[]
}

export function RouteGuard({ children, allowedRoles }: RouteGuardProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (isLoading) return

    // If no user, redirect to login
    if (!user) {
      router.push("/login")
      return
    }

    // Check if user's role is allowed
    if (!allowedRoles.includes(user.role)) {
      // Redirect to their role's dashboard
      router.push(`/dashboard/${user.role}`)
      return
    }
  }, [user, isLoading, allowedRoles, router, pathname])

  // Show loading while checking auth
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

  // If user is not authenticated or doesn't have the right role, don't render children
  if (!user || !allowedRoles.includes(user.role)) {
    return null
  }

  return <>{children}</>
}

