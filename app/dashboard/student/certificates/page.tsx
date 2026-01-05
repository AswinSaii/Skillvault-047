"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { DashboardShell } from "@/components/dashboard-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Download, Award, ExternalLink, Shield, Calendar, Loader2 } from "lucide-react"
import { getCertificatesByStudent } from "@/lib/firebase/certificates"
import { downloadCertificatePDF } from "@/lib/utils/certificate-pdf"
import { downloadSkillResume, prepareResumeData } from "@/lib/utils/resume-pdf"
import type { Certificate } from "@/lib/firebase/certificates"
import { toast } from "sonner"

export default function StudentCertificatesPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [generatingResume, setGeneratingResume] = useState(false)

  useEffect(() => {
    loadCertificates()
  }, [user])

  const loadCertificates = async () => {
    if (!user?.uid) return

    setLoading(true)
    try {
      const certs = await getCertificatesByStudent(user.uid)
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

  const handleGenerateResume = async () => {
    if (!user?.name || !user?.email) {
      toast.error("User information not available")
      return
    }

    setGeneratingResume(true)
    try {
      const resumeData = prepareResumeData(
        user.name,
        user.email,
        user.collegeName || "Institution",
        certificates
      )
      await downloadSkillResume(resumeData)
      toast.success("Skill resume generated successfully")
    } catch (error) {
      toast.error("Failed to generate resume")
      console.error(error)
    } finally {
      setGeneratingResume(false)
    }
  }

  const filteredCertificates = certificates.filter((cert) =>
    cert.assessmentTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cert.skill.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cert.certificateId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cert.studentName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <DashboardShell
      heading="My Certificates"
      description="View and download your earned certificates"
    >
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Certificates</CardDescription>
              <CardTitle className="text-3xl">{certificates.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Active Certificates</CardDescription>
              <CardTitle className="text-3xl">
                {certificates.filter((c) => c.status === "active").length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Average Score</CardDescription>
              <CardTitle className="text-3xl">
                {certificates.length > 0
                  ? Math.round(
                      certificates.reduce((acc, c) => acc + c.percentage, 0) / certificates.length
                    )
                  : 0}
                %
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search certificates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>

        {/* Certificates Grid */}
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">
            Loading certificates...
          </div>
        ) : filteredCertificates.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Award className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No certificates yet</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery
                  ? "No certificates match your search"
                  : "Complete assessments to earn certificates"}
              </p>
              {!searchQuery && (
                <Button onClick={() => (window.location.href = "/dashboard/student/assessments")}>
                  Take Assessment
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {filteredCertificates.map((cert) => (
              <Card key={cert.id} className="relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-primary/10 to-accent/10 rounded-bl-full" />
                <CardHeader className="relative">
                  <div className="flex items-start justify-between">
                    <Award className="h-10 w-10 text-primary" />
                    <Badge variant={cert.status === "active" ? "default" : "secondary"} className="bg-green-600">
                      <Shield className="mr-1 h-3 w-3" />
                      Verified
                    </Badge>
                  </div>
                  <CardTitle className="text-lg mt-4">{cert.assessmentTitle}</CardTitle>
                  <CardDescription>{cert.skill}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Certificate ID</span>
                      <span className="font-mono text-xs">{cert.certificateId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Score</span>
                      <span className="font-semibold text-green-600">{cert.percentage}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Issued By</span>
                      <span className="text-sm font-medium">{cert.collegeName}</span>
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
                    >
                      {downloadingId === cert.id ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Download className="mr-2 h-4 w-4" />
                          Download PDF
                        </>
                      )}
                    </Button>
                    <Button variant="outline" onClick={() => handleVerify(cert)} title="Verify Certificate">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Export Options */}
        {certificates.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Export Options</CardTitle>
              <CardDescription>
                Generate reports and skill-based resumes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant="outline"
                  onClick={handleGenerateResume}
                  disabled={generatingResume}
                >
                  {generatingResume ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    "Generate Skill Resume PDF"
                  )}
                </Button>
                <Button variant="outline" disabled>
                  Export All Certificates (Coming Soon)
                </Button>
                <Button variant="outline" disabled>
                  Verification Report (Coming Soon)
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-3">
                💡 <strong>Skill Resume:</strong> A recruiter-friendly resume with only verified skills (no marks/CGPA). Perfect for job applications!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardShell>
  )
}
