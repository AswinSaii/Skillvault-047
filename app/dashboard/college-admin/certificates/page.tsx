"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { DashboardShell } from "@/components/dashboard-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Search, 
  Download, 
  Award, 
  ExternalLink, 
  Shield, 
  Calendar, 
  Loader2,
  Eye,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Users,
  TrendingUp
} from "lucide-react"
import { getCertificatesByCollege, revokeCertificate, type Certificate } from "@/lib/firebase/certificates"
import { downloadCertificatePDF } from "@/lib/utils/certificate-pdf"
import { toast } from "sonner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function CollegeAdminCertificatesPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [skillFilter, setSkillFilter] = useState<string>("all")
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [revokingId, setRevokingId] = useState<string | null>(null)

  useEffect(() => {
    loadCertificates()
  }, [user])

  const loadCertificates = async () => {
    if (!user?.collegeId) {
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const certs = await getCertificatesByCollege(user.collegeId)
      setCertificates(certs)
    } catch (error) {
      toast.error("Failed to load certificates")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (cert: Certificate) => {
    setDownloadingId(cert.id)
    try {
      await downloadCertificatePDF(cert)
      toast.success("Certificate downloaded successfully")
    } catch (error) {
      toast.error("Failed to download certificate")
      console.error(error)
    } finally {
      setDownloadingId(null)
    }
  }

  const handleVerify = (cert: Certificate) => {
    window.open(cert.verificationUrl, "_blank")
    toast.success("Opening verification page")
  }

  const handleRevoke = async (cert: Certificate) => {
    if (!cert.certificateId) {
      toast.error("Certificate ID not found")
      return
    }

    setRevokingId(cert.id)
    try {
      const result = await revokeCertificate(cert.certificateId)
      if (result.success) {
        toast.success("Certificate revoked successfully")
        loadCertificates()
      } else {
        toast.error(result.error || "Failed to revoke certificate")
      }
    } catch (error) {
      toast.error("Failed to revoke certificate")
      console.error(error)
    } finally {
      setRevokingId(null)
    }
  }

  const filteredCertificates = certificates.filter((cert) => {
    const matchesSearch = 
      cert.studentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.studentEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.assessmentTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.skill.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.certificateId.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || cert.status === statusFilter
    const matchesSkill = skillFilter === "all" || cert.skill === skillFilter

    return matchesSearch && matchesStatus && matchesSkill
  })

  const activeCertificates = certificates.filter(c => c.status === "active")
  const revokedCertificates = certificates.filter(c => c.status === "revoked")
  const avgScore = certificates.length > 0
    ? Math.round(certificates.reduce((acc, c) => acc + c.percentage, 0) / certificates.length)
    : 0

  const uniqueSkills = Array.from(new Set(certificates.map(c => c.skill))).sort()

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Active
        </Badge>
      case "revoked":
        return <Badge variant="destructive">
          <XCircle className="h-3 w-3 mr-1" />
          Revoked
        </Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <DashboardShell
      heading="College Certificates"
      description="Manage and monitor all certificates issued to your college students"
    >
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Certificates</CardDescription>
              <CardTitle className="text-3xl">{certificates.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Award className="h-4 w-4" />
                <span>All time</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Active Certificates</CardDescription>
              <CardTitle className="text-3xl text-green-600">
                {activeCertificates.length}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>Verified & Active</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Average Score</CardDescription>
              <CardTitle className="text-3xl">{avgScore}%</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <TrendingUp className="h-4 w-4" />
                <span>Across all certificates</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Unique Students</CardDescription>
              <CardTitle className="text-3xl">
                {new Set(certificates.map(c => c.studentId)).size}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>With certificates</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by student name, email, skill, or certificate ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="revoked">Revoked</SelectItem>
                </SelectContent>
              </Select>
              <Select value={skillFilter} onValueChange={setSkillFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by skill" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Skills</SelectItem>
                  {uniqueSkills.map((skill) => (
                    <SelectItem key={skill} value={skill}>
                      {skill}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Certificates Table */}
        {loading ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Loader2 className="h-8 w-8 mx-auto mb-4 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading certificates...</p>
            </CardContent>
          </Card>
        ) : filteredCertificates.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Award className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No certificates found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || statusFilter !== "all" || skillFilter !== "all"
                  ? "No certificates match your search criteria"
                  : "No certificates have been issued to your college students yet"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="table" className="space-y-4">
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="table">Table View</TabsTrigger>
                <TabsTrigger value="grid">Grid View</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="table" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Certificates ({filteredCertificates.length})</CardTitle>
                  <CardDescription>
                    Complete list of certificates issued to your college students
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Certificate ID</TableHead>
                          <TableHead>Student</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Assessment</TableHead>
                          <TableHead>Skill</TableHead>
                          <TableHead>Score</TableHead>
                          <TableHead>Issued Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredCertificates.map((cert) => (
                          <TableRow key={cert.id}>
                            <TableCell className="font-mono text-xs">
                              {cert.certificateId}
                            </TableCell>
                            <TableCell className="font-medium">
                              {cert.studentName}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {cert.studentEmail}
                            </TableCell>
                            <TableCell>{cert.assessmentTitle}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{cert.skill}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant="outline" 
                                className={cert.percentage >= 90 ? "border-green-500 text-green-600" : cert.percentage >= 80 ? "border-blue-500 text-blue-600" : ""}
                              >
                                {cert.percentage}%
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm">
                              {new Date(cert.issuedDate).toLocaleDateString()}
                            </TableCell>
                            <TableCell>{getStatusBadge(cert.status)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => handleVerify(cert)}
                                  title="Verify Certificate"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => handleDownload(cert)}
                                  disabled={downloadingId === cert.id}
                                  title="Download PDF"
                                >
                                  {downloadingId === cert.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Download className="h-4 w-4" />
                                  )}
                                </Button>
                                {cert.status === "active" && (
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-destructive hover:text-destructive"
                                        disabled={revokingId === cert.id}
                                        title="Revoke Certificate"
                                      >
                                        {revokingId === cert.id ? (
                                          <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                          <XCircle className="h-4 w-4" />
                                        )}
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Revoke Certificate?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Are you sure you want to revoke this certificate? This action cannot be undone.
                                          <div className="mt-2 p-2 bg-muted rounded text-sm">
                                            <strong>Certificate ID:</strong> {cert.certificateId}<br />
                                            <strong>Student:</strong> {cert.studentName}<br />
                                            <strong>Skill:</strong> {cert.skill}
                                          </div>
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => handleRevoke(cert)}
                                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                        >
                                          Revoke Certificate
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="grid" className="space-y-4">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredCertificates.map((cert) => (
                  <Card key={cert.id} className="relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-accent/10 rounded-bl-full" />
                    <CardHeader className="relative">
                      <div className="flex items-start justify-between">
                        <Award className="h-10 w-10 text-primary" />
                        {getStatusBadge(cert.status)}
                      </div>
                      <CardTitle className="text-lg mt-4">{cert.assessmentTitle}</CardTitle>
                      <CardDescription>
                        <Badge variant="outline" className="mt-2">{cert.skill}</Badge>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Student</span>
                          <span className="font-medium">{cert.studentName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Certificate ID</span>
                          <span className="font-mono text-xs">{cert.certificateId}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Score</span>
                          <span className="font-semibold text-green-600">{cert.percentage}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Issued Date</span>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {new Date(cert.issuedDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button 
                          onClick={() => handleDownload(cert)} 
                          className="flex-1"
                          disabled={downloadingId === cert.id}
                          size="sm"
                        >
                          {downloadingId === cert.id ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Download className="mr-2 h-4 w-4" />
                              Download
                            </>
                          )}
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => handleVerify(cert)} 
                          size="sm"
                          title="Verify Certificate"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        {cert.status === "active" && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-destructive hover:text-destructive"
                                disabled={revokingId === cert.id}
                                title="Revoke Certificate"
                              >
                                {revokingId === cert.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <XCircle className="h-4 w-4" />
                                )}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Revoke Certificate?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to revoke this certificate? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleRevoke(cert)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Revoke
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        )}

        {/* Summary Stats */}
        {certificates.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Skills Distribution</CardTitle>
                <CardDescription>Certificates by skill domain</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {uniqueSkills.slice(0, 5).map((skill) => {
                    const count = certificates.filter(c => c.skill === skill).length
                    const percentage = Math.round((count / certificates.length) * 100)
                    return (
                      <div key={skill} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{skill}</span>
                          <span className="text-muted-foreground">{count} ({percentage}%)</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Status Overview</CardTitle>
                <CardDescription>Certificate status breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span>Active</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{activeCertificates.length}</div>
                      <div className="text-xs text-muted-foreground">
                        {Math.round((activeCertificates.length / certificates.length) * 100)}%
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-destructive" />
                      <span>Revoked</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{revokedCertificates.length}</div>
                      <div className="text-xs text-muted-foreground">
                        {Math.round((revokedCertificates.length / certificates.length) * 100)}%
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardShell>
  )
}

