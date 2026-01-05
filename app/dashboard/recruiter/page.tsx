"use client"

import { useState, useEffect } from "react"
import { DashboardShell } from "@/components/dashboard-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Search, 
  Filter, 
  ShieldCheck, 
  GraduationCap, 
  Award,
  TrendingUp,
  Users,
  Mail,
  ExternalLink,
  CheckCircle2
} from "lucide-react"
import { 
  searchStudentsBySkill, 
  verifyCertificate, 
  getSkillStatistics,
  getTopStudents 
} from "@/lib/firebase/recruiter"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle 
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function RecruiterPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [minProficiency, setMinProficiency] = useState("70")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searching, setSearching] = useState(false)
  const [skillStats, setSkillStats] = useState<any[]>([])
  const [topStudents, setTopStudents] = useState<any[]>([])
  
  // Certificate verification
  const [certId, setCertId] = useState("")
  const [verifyResult, setVerifyResult] = useState<any>(null)
  const [verifying, setVerifying] = useState(false)
  const [showVerifyDialog, setShowVerifyDialog] = useState(false)

  // Selected student details
  const [selectedStudent, setSelectedStudent] = useState<any>(null)
  const [showStudentDialog, setShowStudentDialog] = useState(false)

  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    const [stats, students] = await Promise.all([
      getSkillStatistics(10),
      getTopStudents(8)
    ])
    setSkillStats(stats)
    setTopStudents(students)
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setSearching(true)
    try {
      const results = await searchStudentsBySkill(
        searchQuery,
        undefined,
        parseInt(minProficiency),
        30
      )
      setSearchResults(results)
    } catch (error) {
      console.error("Search error:", error)
    } finally {
      setSearching(false)
    }
  }

  const handleVerifyCertificate = async () => {
    if (!certId.trim()) return

    setVerifying(true)
    setVerifyResult(null)
    try {
      const result = await verifyCertificate(certId.toUpperCase())
      setVerifyResult(result)
    } catch (error) {
      console.error("Verification error:", error)
      setVerifyResult({ error: "Failed to verify certificate" })
    } finally {
      setVerifying(false)
    }
  }

  const viewStudentDetails = (student: any) => {
    setSelectedStudent(student)
    setShowStudentDialog(true)
  }

  return (
    <DashboardShell 
      heading="Recruiter Portal"
      description="Search and verify top talent based on demonstrable skills"
    >
      <div className="space-y-6">
        {/* Search Section */}
        <Card>
          <CardHeader>
            <CardTitle>Search Talent by Skill</CardTitle>
            <CardDescription>
              Find verified students with proven skills from top colleges
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input 
                  className="pl-10" 
                  placeholder="Search by skill (e.g. React, Python, Data Science)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
              <Select value={minProficiency} onValueChange={setMinProficiency}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="70">≥ 70% Proficiency</SelectItem>
                  <SelectItem value="80">≥ 80% Proficiency</SelectItem>
                  <SelectItem value="90">≥ 90% Proficiency</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleSearch} disabled={searching || !searchQuery.trim()}>
                {searching ? "Searching..." : "Search"}
              </Button>
            </div>

            {searchResults.length > 0 && (
              <div className="space-y-4 mt-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">
                    Found {searchResults.length} candidates for "{searchQuery}"
                  </h3>
                  <Button variant="outline" size="sm">
                    Export Results
                  </Button>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {searchResults.map((student) => (
                    <Card key={student.id} className="hover:border-primary/50 transition-all cursor-pointer"
                      onClick={() => viewStudentDetails(student)}>
                      <CardHeader>
                        <div className="flex items-center justify-between mb-2">
                          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-lg font-bold">
                            {student.name.charAt(0)}
                          </div>
                          {student.verified && (
                            <Badge className="gap-1" variant="secondary">
                              <CheckCircle2 className="h-3 w-3" />
                              Verified
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-base">{student.name}</CardTitle>
                        <CardDescription className="flex items-center gap-1 text-xs">
                          <GraduationCap className="h-3 w-3" />
                          {student.collegeName}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Best Score</span>
                            <span className="font-semibold text-green-600">{student.skillData.bestScore}%</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Avg Score</span>
                            <span className="font-semibold">{student.skillData.avgScore}%</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Certificates</span>
                            <Badge variant="outline">{student.skillData.certificatesEarned}</Badge>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" className="w-full" onClick={(e) => {
                          e.stopPropagation()
                          viewStudentDetails(student)
                        }}>
                          View Profile
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Tabs defaultValue="skills" className="space-y-4">
          <TabsList>
            <TabsTrigger value="skills">Top Skills</TabsTrigger>
            <TabsTrigger value="talent">Top Talent</TabsTrigger>
            <TabsTrigger value="verify">Verify Certificate</TabsTrigger>
          </TabsList>

          {/* Top Skills Tab */}
          <TabsContent value="skills" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Most Sought-After Skills</CardTitle>
                <CardDescription>Skills with highest student participation and certification rates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {skillStats.map((skill, index) => (
                    <div key={skill.skill} className="flex items-center gap-4 p-4 rounded-lg border hover:bg-accent transition-colors">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 font-semibold">
                        #{index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold">{skill.skill}</div>
                        <div className="text-sm text-muted-foreground">
                          {skill.studentsCount} students • {skill.certificates} certificates • Avg: {skill.avgProficiency}%
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          setSearchQuery(skill.skill)
                          handleSearch()
                        }}
                      >
                        <Search className="h-4 w-4 mr-1" />
                        Search
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Top Talent Tab */}
          <TabsContent value="talent" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Students</CardTitle>
                <CardDescription>Students with highest number of certificates and skills</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {topStudents.map((student) => (
                    <Card key={student.id} className="hover:border-primary/50 transition-all cursor-pointer"
                      onClick={() => viewStudentDetails(student)}>
                      <CardHeader className="pb-4">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center font-bold">
                            {student.name.charAt(0)}
                          </div>
                          {student.verified && (
                            <Badge variant="secondary" className="text-xs">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-sm">{student.name}</CardTitle>
                        <CardDescription className="text-xs flex items-center gap-1">
                          <GraduationCap className="h-3 w-3" />
                          {student.collegeName}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Best Score</span>
                          <span className="font-semibold text-green-600">{student.bestScore}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Certificates</span>
                          <Badge variant="outline">{student.certificatesCount}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Skills</span>
                          <span className="font-medium">{student.skillsCount}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Verify Certificate Tab */}
          <TabsContent value="verify" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Verify Certificate</CardTitle>
                <CardDescription>
                  Enter a certificate ID to verify its authenticity and view details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <Input 
                    placeholder="Enter Certificate ID (e.g., CERT-ABC12345)"
                    value={certId}
                    onChange={(e) => setCertId(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleVerifyCertificate()}
                    className="flex-1"
                  />
                  <Button onClick={handleVerifyCertificate} disabled={verifying || !certId.trim()}>
                    {verifying ? "Verifying..." : "Verify"}
                  </Button>
                </div>

                {verifyResult && (
                  <Alert className={verifyResult.error || !verifyResult ? "border-destructive" : "border-green-500"}>
                    <ShieldCheck className={`h-4 w-4 ${verifyResult.error || !verifyResult ? "text-destructive" : "text-green-500"}`} />
                    <AlertDescription>
                      {verifyResult.error ? (
                        <div className="space-y-2">
                          <p className="font-semibold text-destructive">Verification Failed</p>
                          <p className="text-sm">{verifyResult.error}</p>
                        </div>
                      ) : !verifyResult ? (
                        <div className="space-y-2">
                          <p className="font-semibold text-destructive">Certificate Not Found</p>
                          <p className="text-sm">No certificate found with ID: {certId}</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <p className="font-semibold text-green-600 flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4" />
                            Certificate Verified Successfully
                          </p>
                          <div className="grid gap-2 text-sm mt-3">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Student:</span>
                              <span className="font-medium">{verifyResult.studentName}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">College:</span>
                              <span className="font-medium flex items-center gap-1">
                                {verifyResult.collegeName}
                                {verifyResult.verified && <CheckCircle2 className="h-3 w-3 text-green-500" />}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Assessment:</span>
                              <span className="font-medium">{verifyResult.assessmentTitle}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Skill:</span>
                              <Badge variant="secondary">{verifyResult.skill}</Badge>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Score:</span>
                              <span className="font-semibold text-green-600">{verifyResult.percentage}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Issued:</span>
                              <span className="font-medium">{new Date(verifyResult.issuedAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Student Details Dialog */}
      <Dialog open={showStudentDialog} onOpenChange={setShowStudentDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-xl font-bold">
                {selectedStudent?.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  {selectedStudent?.name}
                  {selectedStudent?.verified && (
                    <Badge variant="secondary" className="text-xs">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
                <div className="text-sm font-normal text-muted-foreground flex items-center gap-1">
                  <GraduationCap className="h-3 w-3" />
                  {selectedStudent?.collegeName}
                </div>
              </div>
            </DialogTitle>
          </DialogHeader>
          {selectedStudent && (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <a href={`mailto:${selectedStudent.email}`} className="text-primary hover:underline">
                        {selectedStudent.email}
                      </a>
                    </div>
                  </CardContent>
                </Card>

                {selectedStudent.skillData && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">{selectedStudent.skillData.skill} Proficiency</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Best Score:</span>
                        <span className="font-semibold text-green-600">{selectedStudent.skillData.bestScore}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Average Score:</span>
                        <span className="font-medium">{selectedStudent.skillData.avgScore}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Certificates:</span>
                        <Badge variant="outline">{selectedStudent.skillData.certificatesEarned}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Attempts:</span>
                        <span className="font-medium">{selectedStudent.skillData.totalAttempts}</span>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              <div className="flex gap-3">
                <Button className="flex-1" onClick={() => window.location.href = `mailto:${selectedStudent.email}`}>
                  <Mail className="h-4 w-4 mr-2" />
                  Send Email
                </Button>
                <Button variant="outline" className="flex-1">
                  <Award className="h-4 w-4 mr-2" />
                  View Certificates
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardShell>
  )
}
