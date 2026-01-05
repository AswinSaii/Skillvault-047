"use client"

import { useState } from "react"
import { DashboardShell } from "@/components/dashboard-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  ShieldCheck, 
  Search, 
  CheckCircle2,
  XCircle,
  Award,
  GraduationCap,
  Calendar,
  TrendingUp
} from "lucide-react"
import { verifyCertificate, CertificateRecord } from "@/lib/firebase/recruiter"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"

export default function VerifyCertificatePage() {
  const [certificateId, setCertificateId] = useState("")
  const [verifying, setVerifying] = useState(false)
  const [result, setResult] = useState<CertificateRecord | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleVerify = async () => {
    if (!certificateId.trim()) {
      setError("Please enter a certificate ID")
      return
    }

    setVerifying(true)
    setError(null)
    setResult(null)

    try {
      const certificate = await verifyCertificate(certificateId.toUpperCase().trim())
      
      if (certificate) {
        setResult(certificate)
      } else {
        setError("Certificate not found or invalid")
      }
    } catch (err) {
      console.error("Verification error:", err)
      setError("An error occurred while verifying the certificate")
    } finally {
      setVerifying(false)
    }
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Unknown'
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <DashboardShell>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <ShieldCheck className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Certificate Verification</h1>
          <p className="text-muted-foreground mt-2">
            Verify the authenticity of student certificates issued by SkillVault
          </p>
        </div>

        {/* Verification Form */}
        <Card>
          <CardHeader>
            <CardTitle>Enter Certificate ID</CardTitle>
            <CardDescription>
              The certificate ID can be found on the certificate document (e.g., CERT-ABC12345)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="certificateId">Certificate ID</Label>
                <div className="flex gap-2">
                  <Input
                    id="certificateId"
                    placeholder="CERT-XXXXXXXX"
                    value={certificateId}
                    onChange={(e) => setCertificateId(e.target.value.toUpperCase())}
                    onKeyPress={(e) => e.key === 'Enter' && handleVerify()}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleVerify} 
                    disabled={verifying || !certificateId.trim()}
                  >
                    {verifying ? (
                      <>Verifying...</>
                    ) : (
                      <>
                        <Search className="h-4 w-4 mr-2" />
                        Verify
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="text-xs text-muted-foreground">
                <strong>Note:</strong> Certificate IDs are case-insensitive and typically start with "CERT-"
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Message */}
        {error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Verification Failed</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Success Result */}
        {result && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-900">Certificate Verified ✓</AlertTitle>
            <AlertDescription className="text-green-800">
              This certificate is authentic and has been issued by SkillVault
            </AlertDescription>
          </Alert>
        )}

        {/* Certificate Details */}
        {result && (
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">Certificate Details</CardTitle>
                  <CardDescription>Verified information about this certificate</CardDescription>
                </div>
                <Badge variant="default" className="bg-green-600">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Certificate ID */}
              <div className="bg-primary/5 p-4 rounded-lg">
                <Label className="text-xs text-muted-foreground">Certificate ID</Label>
                <p className="text-lg font-mono font-semibold">{result.certificateId}</p>
              </div>

              <Separator />

              {/* Student Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-primary" />
                  Student Information
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Student Name</Label>
                    <p className="font-semibold">{result.studentName}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">College/University</Label>
                    <p className="font-semibold">{result.collegeName}</p>
                  </div>
                  {result.verified && (
                    <div className="md:col-span-2">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        <ShieldCheck className="h-3 w-3 mr-1" />
                        Verified Student
                      </Badge>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Assessment Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  Assessment Details
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Assessment Title</Label>
                    <p className="font-semibold">{result.assessmentTitle}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Skill Assessed</Label>
                    <p>
                      <Badge variant="secondary">{result.skill}</Badge>
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Score Obtained</Label>
                    <p className="text-2xl font-bold text-primary">{result.score}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Percentage</Label>
                    <div className="flex items-center gap-2">
                      <p className="text-2xl font-bold text-green-600">{result.percentage}%</p>
                      {result.percentage >= 90 ? (
                        <Badge className="bg-green-600">Excellent</Badge>
                      ) : result.percentage >= 80 ? (
                        <Badge className="bg-blue-600">Very Good</Badge>
                      ) : result.percentage >= 70 ? (
                        <Badge className="bg-yellow-600">Good</Badge>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Issuance Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Issuance Details
                </h3>
                <div>
                  <Label className="text-xs text-muted-foreground">Issued On</Label>
                  <p className="font-semibold">{formatDate(result.issuedAt)}</p>
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    This certificate was issued by <strong>SkillVault Platform</strong> after the student 
                    successfully completed the assessment with a passing score of 70% or above.
                  </p>
                </div>
              </div>

              {/* Performance Insight */}
              {result.percentage >= 85 && (
                <>
                  <Separator />
                  <Alert className="border-blue-200 bg-blue-50">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                    <AlertTitle className="text-blue-900">High Performer</AlertTitle>
                    <AlertDescription className="text-blue-800">
                      This student demonstrated exceptional performance with a score of {result.percentage}%, 
                      placing them in the top tier of candidates.
                    </AlertDescription>
                  </Alert>
                </>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => window.print()}
                  className="flex-1"
                >
                  Print Details
                </Button>
                <Button 
                  onClick={() => {
                    setResult(null)
                    setError(null)
                    setCertificateId("")
                  }}
                  className="flex-1"
                >
                  Verify Another
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Information Card */}
        {!result && !error && (
          <Card>
            <CardHeader>
              <CardTitle>How Certificate Verification Works</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs">
                    1
                  </div>
                  <div>
                    <p className="font-semibold mb-1">Enter Certificate ID</p>
                    <p className="text-muted-foreground">
                      Input the unique certificate ID found on the student's certificate
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs">
                    2
                  </div>
                  <div>
                    <p className="font-semibold mb-1">Instant Verification</p>
                    <p className="text-muted-foreground">
                      Our system checks the certificate against our secure database
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs">
                    3
                  </div>
                  <div>
                    <p className="font-semibold mb-1">View Complete Details</p>
                    <p className="text-muted-foreground">
                      Get comprehensive information about the student's achievement and performance
                    </p>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-semibold mb-2 text-sm">Security & Privacy</h4>
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    <li>• All certificates are cryptographically verified</li>
                    <li>• Certificate data is tamper-proof and blockchain-backed</li>
                    <li>• Student information is protected and compliant with privacy regulations</li>
                    <li>• Verification logs are maintained for audit purposes</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardShell>
  )
}
