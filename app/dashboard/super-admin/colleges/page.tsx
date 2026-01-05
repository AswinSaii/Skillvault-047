"use client"

import { DashboardShell } from "@/components/dashboard-shell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Building2, CheckCircle2, XCircle, MapPin } from "lucide-react"

export default function CollegesManagement() {
  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">College Verification</h1>
            <p className="text-muted-foreground">Review and manage institutional credentials and trust status.</p>
          </div>
          <Button className="gap-2">Register Institution</Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            { name: "Royal Inst. of Technology", location: "London, UK", status: "pending", users: 0, date: "2h ago" },
            { name: "Global Science College", location: "Mumbai, IN", status: "pending", users: 0, date: "5h ago" },
            { name: "MIT", location: "Cambridge, USA", status: "verified", users: 1240, date: "Verified" },
            { name: "IIT Bombay", location: "Mumbai, IN", status: "verified", users: 890, date: "Verified" },
          ].map((college, i) => (
            <Card key={i} className="border-border/50">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <Badge variant={college.status === "verified" ? "default" : "outline"}>{college.status}</Badge>
                </div>
                <CardTitle className="mt-4">{college.name}</CardTitle>
                <CardDescription className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {college.location}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm">
                    <span className="font-bold">{college.users}</span>
                    <span className="text-muted-foreground ml-1">Users</span>
                  </div>
                  {college.status === "pending" ? (
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="bg-transparent h-8">
                        <XCircle className="h-4 w-4" />
                      </Button>
                      <Button size="sm" className="h-8">
                        <CheckCircle2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button size="sm" variant="ghost">
                      View Details
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardShell>
  )
}
