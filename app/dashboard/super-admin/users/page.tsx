"use client"

import { DashboardShell } from "@/components/dashboard-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, UserPlus, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Suspense } from "react"

function UsersContent() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">Manage and monitor all platform users across roles.</p>
        </div>
        <Button className="gap-2">
          <UserPlus className="h-4 w-4" />
          Add User
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search by name, email, or role..." className="pl-10" />
        </div>
        <Button variant="outline" className="gap-2 bg-transparent">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Institutional Affiliation</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                {
                  name: "John Doe",
                  email: "john@mit.edu",
                  role: "student",
                  institution: "MIT",
                  status: "active",
                  date: "Jan 12, 2026",
                },
                {
                  name: "Prof. Sarah Smith",
                  email: "sarah@stanford.edu",
                  role: "faculty",
                  institution: "Stanford",
                  status: "active",
                  date: "Dec 05, 2025",
                },
                {
                  name: "Super Admin",
                  email: "superadmin@skill.com",
                  role: "super-admin",
                  institution: "Platform",
                  status: "active",
                  date: "Jan 01, 2026",
                },
                {
                  name: "Alex Johnson",
                  email: "alex@google.com",
                  role: "recruiter",
                  institution: "Google",
                  status: "pending",
                  date: "Feb 10, 2026",
                },
              ].map((user, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.institution}</TableCell>
                  <TableCell>
                    <Badge variant={user.status === "active" ? "default" : "secondary"}>{user.status}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{user.date}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

export default function UsersManagement() {
  return (
    <DashboardShell>
      <Suspense fallback={null}>
        <UsersContent />
      </Suspense>
    </DashboardShell>
  )
}
