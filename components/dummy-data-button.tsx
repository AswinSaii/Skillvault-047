"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Database, Loader2 } from "lucide-react"
import { generateAllDummyData } from "@/lib/utils/dummy-data-generator"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export function DummyDataButton() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  const handleGenerate = async () => {
    if (!user) return

    setLoading(true)
    try {
      const result = await generateAllDummyData({
        userId: user.uid,
        userRole: user.role,
        collegeId: user.collegeId,
        collegeName: user.collegeName,
      })

      if (result.success) {
        toast.success(result.message)
        setOpen(false)
        // Reload page after a short delay to show new data
        setTimeout(() => {
          window.location.reload()
        }, 1500)
      } else {
        toast.error(result.message)
      }
    } catch (error: any) {
      console.error("Error generating dummy data:", error)
      toast.error(error.message || "Failed to generate dummy data")
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  // Only show for development or if explicitly enabled
  // In production builds, NODE_ENV will be "production" and this button will be hidden
  const isDev = process.env.NODE_ENV === "development"
  const isExplicitlyEnabled = process.env.NEXT_PUBLIC_ENABLE_DUMMY_DATA === "true"
  
  if (!isDev && !isExplicitlyEnabled) {
    return null
  }

  const roleMessages: Record<string, string> = {
    faculty: "This will generate sample assessments for you to manage.",
    student: "This will generate sample attempts, certificates, and streak data.",
    "college-admin": "This will generate sample students for your college.",
    recruiter: "This will generate students with certificates and attempts for testing search functionality.",
    "super-admin": "Dummy data generation not available for super admins.",
  }

  const roleTitles: Record<string, string> = {
    faculty: "Generate Sample Assessments",
    student: "Generate Sample Data",
    "college-admin": "Generate Sample Students",
    recruiter: "Generate Test Students",
  }

  if (!roleMessages[user.role] || roleMessages[user.role].includes("not available")) {
    return null
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Database className="h-4 w-4" />
          Add Dummy Data
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{roleTitles[user.role] || "Generate Dummy Data"}</AlertDialogTitle>
          <AlertDialogDescription>
            {roleMessages[user.role]}
            <br />
            <br />
            <strong>Note:</strong> This will create sample data in your Firebase database. This feature is only available in development mode.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleGenerate} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

