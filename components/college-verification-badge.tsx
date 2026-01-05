"use client"

import { useEffect, useState } from "react"
import { isUserCollegeVerified } from "@/lib/firebase/users"
import { VerifiedBadge } from "./verified-badge"
import { Building2 } from "lucide-react"
import { Skeleton } from "./ui/skeleton"

interface CollegeVerificationBadgeProps {
  userId: string
  collegeName?: string
  showCollegeName?: boolean
  size?: "sm" | "md" | "lg"
  variant?: "default" | "subtle" | "inline"
}

export function CollegeVerificationBadge({
  userId,
  collegeName,
  showCollegeName = true,
  size = "md",
  variant = "default"
}: CollegeVerificationBadgeProps) {
  const [isVerified, setIsVerified] = useState<boolean | null>(null)
  const [displayName, setDisplayName] = useState<string | undefined>(collegeName)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function checkVerification() {
      setIsLoading(true)
      const result = await isUserCollegeVerified(userId)
      setIsVerified(result.isVerified)
      if (result.collegeName) {
        setDisplayName(result.collegeName)
      }
      setIsLoading(false)
    }

    checkVerification()
  }, [userId])

  if (isLoading) {
    return <Skeleton className="h-5 w-24" />
  }

  if (!isVerified) {
    return null
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {showCollegeName && displayName && (
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Building2 className="h-3.5 w-3.5" />
          <span>{displayName}</span>
        </div>
      )}
      <VerifiedBadge 
        size={size}
        variant={variant}
        message={`Verified student from ${displayName}`}
      />
    </div>
  )
}
