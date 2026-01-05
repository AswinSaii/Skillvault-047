"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { DashboardShell } from "@/components/dashboard-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Download, Award, ExternalLink, Shield, Calendar } from "lucide-react"
import { getAttemptsByStudent } from "@/lib/firebase/assessments"
import { toast } from "sonner"

export default function StudentCertificatesPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [certificates, setCertificates] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    loadCertificates()
  }, [user])

  const loadCertificates = async () => {
    if (!user?.uid) return

    setLoading(true)
    try {
      const attempts = await getAttemptsByStudent(user.uid)
      // Filter for passing attempts that would earn certificates
      const passingAttempts = attempts.filter((a) => a.percentage >= 70 && a.status === "completed")
      
      // Transform to certificate format
      const certs = passingAttempts.map((attempt, idx) => ({
        id: attempt.id,
        title: `Certificate of Achievement #${idx + 1}`,
        skill: "Assessment Completion",
        issuedDate: attempt.submittedAt || attempt.startedAt,
        score: attempt.percentage,
        certificateId: `CERT-${attempt.id?.substring(0, 8).toUpperCase()}`,
        status: "verified",
      }))

      setCertificates(certs)
    } catch (error) {
      toast.error("Failed to load certificates")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = (cert: any) => {
    toast.success("Certificate download started")
    // TODO: Implement PDF generation
  }

  const handleVerify = (cert: any) => {
    toast.info(`Certificate ID: ${cert.certificateId}`)
    // TODO: Implement blockchain verification
  }

  const filteredCertificates = certificates.filter((cert) =>
    cert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cert.skill.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cert.certificateId.toLowerCase().includes(searchQuery.toLowerCase())
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
              <CardDescription>Verified</CardDescription>
              <CardTitle className="text-3xl">
                {certificates.filter((c) => c.status === "verified").length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Average Score</CardDescription>
              <CardTitle className="text-3xl">
                {certificates.length > 0
                  ? Math.round(
                      certificates.reduce((acc, c) => acc + c.score, 0) / certificates.length
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
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-accent/10 rounded-bl-full" />
                <CardHeader className="relative">
                  <div className="flex items-start justify-between">
                    <Award className="h-10 w-10 text-primary" />
                    <Badge variant={cert.status === "verified" ? "default" : "secondary"} className="bg-green-600">
                      <Shield className="mr-1 h-3 w-3" />
                      Verified
                    </Badge>
                  </div>
                  <CardTitle className="text-lg mt-4">{cert.title}</CardTitle>
                  <CardDescription>{cert.skill}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Certificate ID</span>
                      <span className="font-mono">{cert.certificateId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Score</span>
                      <span className="font-semibold">{cert.score}%</span>
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
                    <Button onClick={() => handleDownload(cert)} className="flex-1">
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                    <Button variant="outline" onClick={() => handleVerify(cert)}>
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
                <Button variant="outline">
                  Export All Certificates
                </Button>
                <Button variant="outline">
                  Generate Skill Resume
                </Button>
                <Button variant="outline">
                  Verification Report
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardShell>
  )
}
