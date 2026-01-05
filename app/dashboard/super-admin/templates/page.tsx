"use client"

import { DashboardShell } from "@/components/dashboard-shell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Eye, Edit3, Trash2 } from "lucide-react"

export default function TemplatesManagement() {
  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Certificate Templates</h1>
            <p className="text-muted-foreground">Manage official certification designs and institutional signatures.</p>
          </div>
          <Button className="gap-2">Create Template</Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {[
            {
              name: "Standard Professional Certificate",
              institution: "Global Platform",
              status: "active",
              date: "Jan 01, 2026",
            },
            {
              name: "Advanced Engineering Credential",
              institution: "IIT Bombay",
              status: "active",
              date: "Dec 15, 2025",
            },
            { name: "Computer Science Minor", institution: "MIT", status: "draft", date: "Feb 02, 2026" },
            { name: "Faculty Accreditation", institution: "Global Platform", status: "active", date: "Nov 20, 2025" },
          ].map((template, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="h-32 bg-muted/50 flex items-center justify-center border-b">
                <FileText className="h-12 w-12 text-muted-foreground/30" />
              </div>
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <CardDescription>{template.institution}</CardDescription>
                  </div>
                  <Badge variant={template.status === "active" ? "default" : "outline"}>{template.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="flex items-center justify-between border-t pt-4">
                <span className="text-xs text-muted-foreground">Modified {template.date}</span>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Edit3 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardShell>
  )
}
