"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useAuth, type UserRole } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { GraduationCap, Loader2, ShieldCheck, AlertCircle, CheckCircle2 } from "lucide-react"
import { getVerifiedColleges, isCollegeVerified, type College } from "@/lib/firebase/colleges"

export default function SignupPage() {
  const searchParams = useSearchParams()
  const defaultRole = (searchParams.get("role") as UserRole) || "student"

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [collegeId, setCollegeId] = useState("")
  const [role, setRole] = useState<UserRole>(defaultRole)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [verifiedColleges, setVerifiedColleges] = useState<College[]>([])
  const [loadingColleges, setLoadingColleges] = useState(false)
  const { signup } = useAuth()
  const router = useRouter()

  useEffect(() => {
    loadVerifiedColleges()
  }, [])

  const loadVerifiedColleges = async () => {
    setLoadingColleges(true)
    const result = await getVerifiedColleges()
    if (result.success) {
      setVerifiedColleges(result.colleges)
    }
    setLoadingColleges(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Validate college verification for roles that require it
      if ((role === "student" || role === "faculty" || role === "college-admin") && collegeId) {
        const verificationResult = await isCollegeVerified(collegeId)
        if (!verificationResult.isVerified) {
          setError("Selected college is not verified. Please contact your institution or register your college.")
          setIsLoading(false)
          return
        }
      }

      // Find selected college name
      const selectedCollege = verifiedColleges.find(c => c.id === collegeId)
      const collegeName = selectedCollege?.name || ""

      const result = await signup(email, password, name, role, collegeName, collegeId)
      if (!result.success) {
        setError(result.error || "Signup failed. Please try again.")
      }
    } catch (err) {
      console.error("[v0] Signup failed", err)
      setError("An unexpected error occurred.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-12">
      <div className="w-full max-w-lg space-y-8">
        <div className="flex flex-col items-center text-center">
          <Link href="/" className="mb-6 flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <GraduationCap className="h-6 w-6" />
            </div>
            <span className="text-2xl font-bold">SkillVault</span>
          </Link>
          <h2 className="text-3xl font-bold tracking-tight">Create your account</h2>
          <p className="text-muted-foreground">Join the skill-first certification revolution</p>
        </div>

        <Card className="border-border/50 shadow-lg">
          <CardHeader>
            <CardTitle>Get Started</CardTitle>
            <CardDescription>Enter your details to create a new SkillVault account</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive" className="py-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Registering as</Label>
                  <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
                    <SelectTrigger id="role" className="bg-background">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="faculty">Faculty</SelectItem>
                      <SelectItem value="college-admin">College Admin</SelectItem>
                      <SelectItem value="recruiter">Recruiter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-background"
                />
              </div>

              {(role === "student" || role === "faculty" || role === "college-admin") && (
                <div className="space-y-2">
                  <Label htmlFor="college">College/Institution</Label>
                  <Select value={collegeId} onValueChange={setCollegeId} disabled={loadingColleges}>
                    <SelectTrigger id="college" className="bg-background">
                      <SelectValue placeholder={loadingColleges ? "Loading colleges..." : "Select verified college"} />
                    </SelectTrigger>
                    <SelectContent>
                      {verifiedColleges.length === 0 ? (
                        <SelectItem value="no-colleges" disabled>
                          No verified colleges available
                        </SelectItem>
                      ) : (
                        verifiedColleges.map((college) => (
                          <SelectItem key={college.id} value={college.id}>
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="h-3 w-3 text-green-600" />
                              <span>{college.name}</span>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3 text-accent" />
                    Registration restricted to verified colleges only.
                    {verifiedColleges.length === 0 && (
                      <Link href="/college-registration" className="text-primary hover:underline ml-1">
                        Register your college
                      </Link>
                    )}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-background" 
                  minLength={6}
                  placeholder="Min 6 characters"
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button 
                type="submit" 
                className="w-full font-semibold" 
                disabled={isLoading || (role !== "recruiter" && !collegeId && (role === "student" || role === "faculty" || role === "college-admin"))}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
              <div className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="font-medium text-primary hover:underline">
                  Sign in
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
