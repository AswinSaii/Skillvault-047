"use client"

import { DashboardShell } from "@/components/dashboard-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Search, 
  Download, 
  Eye, 
  Award, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Filter,
  FileCheck
} from "lucide-react"

export default function CertificatesPage() {
  const certificates = [
    {
      id: "CERT-2026-001234",
      studentName: "John Smith",
      skill: "JavaScript Advanced",
      college: "MIT",
      issuedBy: "Prof. Johnson",
      issueDate: "Jan 15, 2026",
      status: "verified",
      score: 92
    },
    {
      id: "CERT-2026-001235",
      studentName: "Emma Wilson",
      skill: "Python Data Science",
      college: "Stanford",
      issuedBy: "Dr. Martinez",
      issueDate: "Jan 18, 2026",
      status: "verified",
      score: 88
    },
    {
      id: "CERT-2026-001236",
      studentName: "Michael Chen",
      skill: "React Development",
      college: "IIT Bombay",
      issuedBy: "Dr. Kumar",
      issueDate: "Jan 20, 2026",
      status: "pending",
      score: 85
    },
    {
      id: "CERT-2026-001237",
      studentName: "Sarah Johnson",
      skill: "SQL Database",
      college: "Oxford",
      issuedBy: "Prof. Brown",
      issueDate: "Jan 22, 2026",
      status: "verified",
      score: 95
    },
    {
      id: "CERT-2026-001238",
      studentName: "David Lee",
      skill: "Machine Learning",
      college: "Cambridge",
      issuedBy: "Dr. Taylor",
      issueDate: "Jan 23, 2026",
      status: "revoked",
      score: 78
    },
  ]

  const stats = [
    { 
      label: "Total Certificates", 
      value: "8,932", 
      icon: Award, 
      color: "text-blue-500",
      bgColor: "bg-blue-500/10"
    },
    { 
      label: "Verified", 
      value: "8,124", 
      icon: CheckCircle2, 
      color: "text-green-500",
      bgColor: "bg-green-500/10"
    },
    { 
      label: "Pending Review", 
      value: "156", 
      icon: AlertCircle, 
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10"
    },
    { 
      label: "Revoked", 
      value: "32", 
      icon: XCircle, 
      color: "text-red-500",
      bgColor: "bg-red-500/10"
    },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20">Verified</Badge>
      case "pending":
        return <Badge variant="secondary">Pending</Badge>
      case "revoked":
        return <Badge variant="destructive">Revoked</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Certificate Management</h1>
            <p className="text-muted-foreground">
              Monitor and verify all certificates issued across the platform.
            </p>
          </div>
          <Button variant="outline" className="gap-2 bg-transparent">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="all" className="space-y-4">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="all">All Certificates</TabsTrigger>
              <TabsTrigger value="verified">Verified</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="revoked">Revoked</TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input 
                  placeholder="Search by ID, student, or skill..." 
                  className="pl-10" 
                />
              </div>
              <Button variant="outline" size="icon" className="bg-transparent">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <TabsContent value="all" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>All Certificates</CardTitle>
                <CardDescription>
                  Complete list of all certificates issued through the platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Certificate ID</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Skill</TableHead>
                      <TableHead>College</TableHead>
                      <TableHead>Issued By</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {certificates.map((cert) => (
                      <TableRow key={cert.id}>
                        <TableCell className="font-mono text-sm">{cert.id}</TableCell>
                        <TableCell className="font-medium">{cert.studentName}</TableCell>
                        <TableCell>{cert.skill}</TableCell>
                        <TableCell>{cert.college}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {cert.issuedBy}
                        </TableCell>
                        <TableCell className="text-sm">{cert.issueDate}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-mono">
                            {cert.score}%
                          </Badge>
                        </TableCell>
                        <TableCell>{getStatusBadge(cert.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="verified">
            <Card>
              <CardHeader>
                <CardTitle>Verified Certificates</CardTitle>
                <CardDescription>Certificates that have been verified and approved</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Showing verified certificates only...
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle>Pending Verification</CardTitle>
                <CardDescription>Certificates awaiting review and verification</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Showing pending certificates only...
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="revoked">
            <Card>
              <CardHeader>
                <CardTitle>Revoked Certificates</CardTitle>
                <CardDescription>Certificates that have been revoked or flagged</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Showing revoked certificates only...
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardShell>
  )
}
