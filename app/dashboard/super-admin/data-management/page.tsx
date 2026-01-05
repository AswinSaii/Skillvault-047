"use client"

import { useState } from "react"
import { DashboardShell } from "@/components/dashboard-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { 
  Database, 
  Users, 
  FileText, 
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw
} from "lucide-react"
import { seedAllDummyData, checkDummyDataExists } from "@/lib/firebase/seed-dummy-data"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"

export default function DataManagementPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(false)
  const [dataStatus, setDataStatus] = useState<{
    hasAssessments: boolean
    hasStudents: boolean
    assessmentCount: number
    studentCount: number
  } | null>(null)
  const [generationResult, setGenerationResult] = useState<{
    success: boolean
    assessments?: number
    students?: number
    error?: string
  } | null>(null)

  const handleCheckData = async () => {
    setChecking(true)
    try {
      const status = await checkDummyDataExists()
      setDataStatus(status)
    } catch (error) {
      toast.error('Failed to check data status')
      console.error(error)
    } finally {
      setChecking(false)
    }
  }

  const handleGenerateData = async () => {
    if (!user) {
      toast.error('You must be logged in to generate data')
      return
    }

    setLoading(true)
    setGenerationResult(null)

    try {
      const result = await seedAllDummyData(
        user.uid,
        user.collegeId || 'default',
        user.collegeName || 'Default College'
      )

      setGenerationResult(result)
      
      if (result.success) {
        toast.success('Dummy data generated successfully!')
        // Refresh data status
        await handleCheckData()
      } else {
        toast.error(`Failed to generate data: ${result.error}`)
      }
    } catch (error) {
      console.error('Generation error:', error)
      toast.error('An error occurred while generating data')
      setGenerationResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardShell>
      <div className="space-y-6 max-w-4xl">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Data Management</h1>
          <p className="text-muted-foreground mt-2">
            Generate dummy data for testing and demonstration purposes
          </p>
        </div>

        {/* Current Status Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Current Database Status</CardTitle>
                <CardDescription>Check what data exists in your database</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCheckData}
                disabled={checking}
              >
                {checking ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {dataStatus ? (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center gap-3 p-4 border rounded-lg">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Assessments</p>
                    <p className="text-2xl font-bold">{dataStatus.assessmentCount}</p>
                    {dataStatus.hasAssessments ? (
                      <Badge variant="default" className="mt-1 bg-green-600">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Data exists
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="mt-1">
                        No data
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 border rounded-lg">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Students</p>
                    <p className="text-2xl font-bold">{dataStatus.studentCount}</p>
                    {dataStatus.hasStudents ? (
                      <Badge variant="default" className="mt-1 bg-green-600">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Data exists
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="mt-1">
                        No data
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Database className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Click "Refresh" to check database status</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Generate Dummy Data Card */}
        <Card>
          <CardHeader>
            <CardTitle>Generate Dummy Data</CardTitle>
            <CardDescription>
              Create sample assessments, students, and attempts for testing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>What will be created</AlertTitle>
              <AlertDescription>
                <ul className="mt-2 space-y-1 text-sm">
                  <li>• 5 sample assessments (JavaScript, React, Python, SQL, Node.js)</li>
                  <li>• 8 student accounts with verified status</li>
                  <li>• Multiple completed attempts with varying scores (70-99%)</li>
                  <li>• Certificates for passing attempts</li>
                </ul>
              </AlertDescription>
            </Alert>

            <div className="flex gap-2">
              <Button
                onClick={handleGenerateData}
                disabled={loading}
                size="lg"
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating Data...
                  </>
                ) : (
                  <>
                    <Database className="h-4 w-4 mr-2" />
                    Generate Dummy Data
                  </>
                )}
              </Button>
            </div>

            {generationResult && (
              <Alert variant={generationResult.success ? "default" : "destructive"}>
                {generationResult.success ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <AlertTitle>
                  {generationResult.success ? 'Success!' : 'Error'}
                </AlertTitle>
                <AlertDescription>
                  {generationResult.success ? (
                    <div className="space-y-1">
                      <p>Dummy data has been generated successfully:</p>
                      <ul className="text-sm mt-2">
                        <li>✓ {generationResult.assessments} assessments created</li>
                        <li>✓ {generationResult.students} students created</li>
                        <li>✓ Multiple attempts and certificates generated</li>
                      </ul>
                    </div>
                  ) : (
                    <p>{generationResult.error}</p>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Information Card */}
        <Card>
          <CardHeader>
            <CardTitle>Important Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span>Generated data will be associated with your current college and user account</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span>This operation may take a few seconds to complete</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span>You can run this multiple times, but it will create duplicate data</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span>For production use, delete or disable dummy accounts before going live</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}
