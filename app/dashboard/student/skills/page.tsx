"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { DashboardShell } from "@/components/dashboard-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  BookOpen, 
  Search, 
  UserPlus, 
  Award, 
  CheckCircle2, 
  Clock,
  Loader2,
  ArrowRight
} from "lucide-react"
import { 
  getActiveSkills, 
  enrollInSkill, 
  getStudentEnrollments,
  type Skill,
  type SkillEnrollment
} from "@/lib/firebase/skills"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function StudentSkillsPage() {
  const { user } = useAuth()
  const [skills, setSkills] = useState<Skill[]>([])
  const [enrollments, setEnrollments] = useState<SkillEnrollment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [enrollingId, setEnrollingId] = useState<string | null>(null)
  const [showEnrollDialog, setShowEnrollDialog] = useState(false)
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null)

  useEffect(() => {
    if (user?.uid) {
      loadData()
    }
  }, [user])

  const loadData = async () => {
    if (!user?.uid) return

    setLoading(true)
    try {
      const [skillsData, enrollmentsData] = await Promise.all([
        getActiveSkills(),
        getStudentEnrollments(user.uid),
      ])
      setSkills(skillsData)
      setEnrollments(enrollmentsData)
    } catch (error) {
      console.error("Error loading data:", error)
      toast.error("Failed to load skills")
    } finally {
      setLoading(false)
    }
  }

  const handleEnroll = async (skill: Skill) => {
    if (!user?.uid) {
      toast.error("Please log in to enroll")
      return
    }

    setEnrollingId(skill.id)
    try {
      const result = await enrollInSkill(user.uid, skill.id, skill.name)
      if (result.success) {
        toast.success(`Successfully enrolled in ${skill.name}`)
        loadData()
      } else {
        toast.error(result.error || "Failed to enroll in skill")
      }
    } catch (error) {
      console.error("Error enrolling:", error)
      toast.error("Failed to enroll in skill")
    } finally {
      setEnrollingId(null)
    }
  }

  const isEnrolled = (skillId: string) => {
    return enrollments.some(e => e.skillId === skillId)
  }

  const getEnrollmentStatus = (skillId: string) => {
    const enrollment = enrollments.find(e => e.skillId === skillId)
    return enrollment?.status || null
  }

  const filteredSkills = skills.filter(skill =>
    skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    skill.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    skill.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const enrolledSkills = filteredSkills.filter(skill => isEnrolled(skill.id))
  const availableSkills = filteredSkills.filter(skill => !isEnrolled(skill.id))

  return (
    <DashboardShell
      heading="Skill Courses"
      description="Enroll in skill courses, take assessments, and earn certifications"
    >
      <div className="space-y-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Enrolled Skills */}
        {enrolledSkills.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">My Enrolled Skills</h2>
              <Badge variant="secondary">{enrolledSkills.length} Enrolled</Badge>
            </div>
            {loading ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-48" />
                ))}
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {enrolledSkills.map((skill) => {
                  const enrollment = enrollments.find(e => e.skillId === skill.id)
                  const status = enrollment?.status || "enrolled"
                  
                  return (
                    <Card key={skill.id} className="relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-accent/10 rounded-bl-full" />
                      <CardHeader className="relative">
                        <div className="flex items-start justify-between">
                          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xl">
                            {skill.name[0]}
                          </div>
                          {status === "certified" && (
                            <Badge className="bg-green-500">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Certified
                            </Badge>
                          )}
                          {status === "completed" && (
                            <Badge variant="secondary">
                              Completed
                            </Badge>
                          )}
                          {status === "enrolled" && (
                            <Badge variant="outline">
                              Enrolled
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-lg mt-4">{skill.name}</CardTitle>
                        <CardDescription>
                          {skill.description || "No description available"}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{skill.category}</Badge>
                          {enrollment?.certificateId && (
                            <Badge variant="secondary" className="text-xs">
                              Cert: {enrollment.certificateId}
                            </Badge>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {status === "enrolled" && (
                            <Button 
                              className="flex-1" 
                              asChild
                            >
                              <Link href={`/dashboard/student/skills/${skill.id}/assessment`}>
                                Take Assessment
                                <ArrowRight className="h-4 w-4 ml-2" />
                              </Link>
                            </Button>
                          )}
                          {status === "certified" && (
                            <Button 
                              variant="outline" 
                              className="flex-1"
                              asChild
                            >
                              <Link href="/dashboard/student/certificates">
                                View Certificate
                              </Link>
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Available Skills */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Available Skills</h2>
            <Badge variant="secondary">{availableSkills.length} Available</Badge>
          </div>
          {loading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <Skeleton key={i} className="h-48" />
              ))}
            </div>
          ) : availableSkills.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No skills available</h3>
                <p className="text-muted-foreground">
                  {searchQuery ? "No skills match your search" : "All skills have been enrolled or no skills are available"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {availableSkills.map((skill) => (
                <Card key={skill.id} className="relative overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-accent/10 rounded-bl-full" />
                  <CardHeader className="relative">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xl">
                      {skill.name[0]}
                    </div>
                    <CardTitle className="text-lg mt-4">{skill.name}</CardTitle>
                    <CardDescription>
                      {skill.description || "No description available"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Badge variant="outline">{skill.category}</Badge>
                    <Button 
                      className="w-full" 
                      onClick={() => handleEnroll(skill)}
                      disabled={enrollingId === skill.id}
                    >
                      {enrollingId === skill.id ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Enrolling...
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Enroll Now
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  )
}
