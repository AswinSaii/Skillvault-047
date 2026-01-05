"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { DashboardShell } from "@/components/dashboard-shell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Building2, CheckCircle2, XCircle, MapPin, Loader2, Users as UsersIcon, AlertCircle } from "lucide-react"
import { 
  getAllColleges, 
  approveCollege, 
  rejectCollege,
  type College 
} from "@/lib/firebase/colleges"
import { useToast } from "@/hooks/use-toast"

export default function CollegesManagement() {
  const [colleges, setColleges] = useState<College[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadColleges()
  }, [])

  const loadColleges = async () => {
    setIsLoading(true)
    const result = await getAllColleges()
    if (result.success) {
      setColleges(result.colleges)
    }
    setIsLoading(false)
  }

  const handleApprove = async (collegeId: string, collegeName: string) => {
    setProcessingId(collegeId)
    const result = await approveCollege(collegeId)
    
    if (result.success) {
      toast({
        title: "College Approved",
        description: `${collegeName} has been verified successfully.`,
      })
      await loadColleges()
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to approve college",
        variant: "destructive",
      })
    }
    setProcessingId(null)
  }

  const handleReject = async (collegeId: string, collegeName: string) => {
    setProcessingId(collegeId)
    const result = await rejectCollege(collegeId)
    
    if (result.success) {
      toast({
        title: "College Rejected",
        description: `${collegeName} registration has been rejected.`,
      })
      await loadColleges()
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to reject college",
        variant: "destructive",
      })
    }
    setProcessingId(null)
  }

  const pendingColleges = colleges.filter(c => c.status === "pending")
  const verifiedColleges = colleges.filter(c => c.status === "verified")
  const rejectedColleges = colleges.filter(c => c.status === "rejected")

  const CollegeCard = ({ college }: { college: College }) => (
    <Card className="border-border/50">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Building2 className="h-5 w-5 text-primary" />
          </div>
          <Badge 
            variant={
              college.status === "verified" ? "default" : 
              college.status === "rejected" ? "destructive" : 
              "outline"
            }
          >
            {college.status}
          </Badge>
        </div>
        <CardTitle className="mt-4 line-clamp-2">{college.name}</CardTitle>
        <CardDescription className="flex items-center gap-1">
          <MapPin className="h-3 w-3 shrink-0" />
          {college.location}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {college.email && (
            <p className="text-xs text-muted-foreground truncate">{college.email}</p>
          )}
          {college.website && (
            <a 
              href={college.website} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline truncate block"
            >
              {college.website}
            </a>
          )}
          <div className="flex items-center justify-between mt-4">
            <div className="text-xs text-muted-foreground">
              {new Date(college.createdAt).toLocaleDateString()}
            </div>
            {college.status === "pending" ? (
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="bg-transparent h-8"
                  onClick={() => handleReject(college.id, college.name)}
                  disabled={processingId === college.id}
                >
                  {processingId === college.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                </Button>
                <Button 
                  size="sm" 
                  className="h-8"
                  onClick={() => handleApprove(college.id, college.name)}
                  disabled={processingId === college.id}
                >
                  {processingId === college.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            ) : college.status === "verified" && (
              <div className="flex items-center gap-1 text-xs text-green-600">
                <CheckCircle2 className="h-3 w-3" />
                Verified
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  if (isLoading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">College Verification</h1>
            <p className="text-muted-foreground">Review and manage institutional credentials and trust status.</p>
          </div>
          <Button className="gap-2" asChild>
            <Link href="/college-registration">Register Institution</Link>
          </Button>
        </div>

        {pendingColleges.length > 0 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You have <strong>{pendingColleges.length}</strong> pending college registration{pendingColleges.length !== 1 ? 's' : ''} awaiting review.
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All ({colleges.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({pendingColleges.length})</TabsTrigger>
            <TabsTrigger value="verified">Verified ({verifiedColleges.length})</TabsTrigger>
            <TabsTrigger value="rejected">Rejected ({rejectedColleges.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {colleges.map((college) => (
                <CollegeCard key={college.id} college={college} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            {pendingColleges.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <CheckCircle2 className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No pending registrations</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {pendingColleges.map((college) => (
                  <CollegeCard key={college.id} college={college} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="verified" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {verifiedColleges.map((college) => (
                <CollegeCard key={college.id} college={college} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="rejected" className="space-y-4">
            {rejectedColleges.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No rejected colleges</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {rejectedColleges.map((college) => (
                  <CollegeCard key={college.id} college={college} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardShell>
  )
}
