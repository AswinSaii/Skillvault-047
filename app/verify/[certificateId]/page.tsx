"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  GraduationCap,
  CheckCircle2,
  XCircle,
  Loader2,
  Award,
  Building2,
  Calendar,
  BarChart3,
  Shield,
  AlertCircle,
} from "lucide-react"
import { getCertificateByCertificateId } from "@/lib/firebase/certificates"
import type { Certificate } from "@/lib/firebase/certificates"
import { VerifiedBadge } from "@/components/verified-badge"

export default function CertificateVerificationPage() {
  const params = useParams()
  const certificateId = params.certificateId as string

  const [loading, setLoading] = useState(true)
  const [certificate, setCertificate] = useState<Certificate | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    verifyCertificate()
  }, [certificateId])

  const verifyCertificate = async () => {
    setLoading(true)
    setError(null)

    try {
      const cert = await getCertificateByCertificateId(certificateId)

      if (!cert) {
        setError("Certificate not found. Please check the certificate ID and try again.")
      } else if (cert.status === "revoked") {
        setError("This certificate has been revoked and is no longer valid.")
        setCertificate(cert)
      } else {
        setCertificate(cert)
      }
    } catch (err) {
      console.error("Verification error:", err)
      setError("An error occurred while verifying the certificate.")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-12">
        <Card className="w-full max-w-md border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Verifying certificate...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error && !certificate) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-12">
        <div className="w-full max-w-2xl space-y-8">
          <div className="flex flex-col items-center text-center">
            <Link href="/" className="mb-6 flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <GraduationCap className="h-6 w-6" />
              </div>
              <span className="text-2xl font-bold">SkillVault</span>
            </Link>
          </div>

          <Card className="border-border/50 shadow-lg">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
                <XCircle className="h-6 w-6 text-red-500" />
              </div>
              <CardTitle className="text-red-600">Verification Failed</CardTitle>
              <CardDescription>{error}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  The certificate ID <strong>{certificateId}</strong> could not be verified.
                </AlertDescription>
              </Alert>
              <div className="flex justify-center gap-4">
                <Button variant="outline" asChild>
                  <Link href="/">Return Home</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (certificate?.status === "revoked") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-12">
        <div className="w-full max-w-2xl space-y-8">
          <div className="flex flex-col items-center text-center">
            <Link href="/" className="mb-6 flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <GraduationCap className="h-6 w-6" />
              </div>
              <span className="text-2xl font-bold">SkillVault</span>
            </Link>
          </div>

          <Card className="border-border/50 shadow-lg border-red-200">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
                <XCircle className="h-6 w-6 text-red-500" />
              </div>
              <CardTitle className="text-red-600">Certificate Revoked</CardTitle>
              <CardDescription>This certificate is no longer valid</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert variant="destructive">
                <AlertDescription>
                  This certificate has been revoked by the issuing institution and is no longer considered valid.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!certificate) {
    return null
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-12">
      <div className="w-full max-w-3xl space-y-8">
        <div className="flex flex-col items-center text-center">
          <Link href="/" className="mb-6 flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <GraduationCap className="h-6 w-6" />
            </div>
            <span className="text-2xl font-bold">SkillVault</span>
          </Link>
          <h2 className="text-3xl font-bold tracking-tight">Certificate Verification</h2>
          <p className="text-muted-foreground">Authentic & Verified</p>
        </div>

        <Card className="border-border/50 shadow-lg border-green-200">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-green-600 text-2xl">Certificate Verified ✓</CardTitle>
            <CardDescription>This is an authentic certificate issued by a verified institution</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert className="bg-green-50 border-green-200">
              <Shield className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                This certificate has been cryptographically verified and is authentic.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                <Award className="h-8 w-8 text-primary shrink-0" />
                <div className="flex-1">
                  <div className="text-sm text-muted-foreground">Certificate Holder</div>
                  <div className="text-xl font-bold">{certificate.studentName}</div>
                  <div className="text-sm text-muted-foreground">{certificate.studentEmail}</div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                  <Building2 className="h-6 w-6 text-primary shrink-0" />
                  <div>
                    <div className="text-sm text-muted-foreground">Issued By</div>
                    <div className="font-semibold">{certificate.collegeName}</div>
                    <VerifiedBadge size="sm" variant="subtle" className="mt-1" />
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                  <Calendar className="h-6 w-6 text-primary shrink-0" />
                  <div>
                    <div className="text-sm text-muted-foreground">Issue Date</div>
                    <div className="font-semibold">
                      {new Date(certificate.issuedDate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="text-sm text-muted-foreground mb-2">Assessment Details</div>
                <div className="font-semibold text-lg mb-1">{certificate.assessmentTitle}</div>
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-primary" />
                    <span className="text-sm">
                      Skill: <strong>{certificate.skill}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-green-600" />
                    <span className="text-sm">
                      Score: <strong className="text-green-600">{certificate.percentage}%</strong>
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg border-2 border-dashed">
                <div className="text-sm text-muted-foreground mb-1">Certificate ID</div>
                <div className="font-mono text-sm font-semibold break-all">{certificate.certificateId}</div>
              </div>
            </div>

            <div className="flex justify-center gap-4 pt-4">
              <Button variant="outline" asChild>
                <Link href="/">Return Home</Link>
              </Button>
              <Button asChild>
                <Link href="/login">Login to SkillVault</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-xs text-muted-foreground">
          This certificate can be verified at any time by visiting this URL or scanning the QR code on the PDF.
        </div>
      </div>
    </div>
  )
}
