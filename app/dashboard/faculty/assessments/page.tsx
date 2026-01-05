"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { DashboardShell } from "@/components/dashboard-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { 
  PlusCircle, 
  Search, 
  FileText, 
  Clock, 
  Users,
  Calendar,
  BarChart3,
  Edit,
  Trash2,
  Target,
  Loader2
} from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { createAssessment, updateAssessment, deleteAssessment, getAssessmentsByFaculty, Assessment } from "@/lib/firebase/assessments"
import { createQuestionsBatch } from "@/lib/firebase/questions"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"

export default function AssessmentsManagement() {
  const { user } = useAuth()
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [generatingQuestions, setGeneratingQuestions] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null)
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "mcq" as "mcq" | "coding" | "practical" | "mixed",
    skill: "",
    difficulty: "medium" as "easy" | "medium" | "hard",
    duration: 60,
    totalMarks: 100,
    passingMarks: 70,
    totalQuestions: 10,
    scheduledDate: "",
    dueDate: "",
    tags: "",
  })

  useEffect(() => {
    loadAssessments()
  }, [user])

  const loadAssessments = async () => {
    if (!user?.uid) {
      setLoading(false)
      return
    }
    
    setLoading(true)
    try {
      // If no collegeId, just get all assessments by faculty
      const data = user.collegeId 
        ? await getAssessmentsByFaculty(user.uid, user.collegeId)
        : await getAssessmentsByFaculty(user.uid, '')
      setAssessments(data)
    } catch (error) {
      console.error("Error loading assessments:", error)
      toast.error("Failed to load assessments")
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    console.log("Current user object:", user)
    
    if (!user?.uid) {
      toast.error("User information missing. Please try logging in again.")
      console.error("No user UID found. User object:", user)
      return
    }

    if (!formData.title || !formData.skill) {
      toast.error("Please fill in all required fields (Title and Skill)")
      return
    }

    // Validate marks
    if (formData.passingMarks > formData.totalMarks) {
      toast.error("Passing marks cannot be greater than total marks")
      return
    }

    if (formData.duration <= 0) {
      toast.error("Duration must be greater than 0")
      return
    }

    if (formData.totalQuestions < 1 || formData.totalQuestions > 50) {
      toast.error("Number of questions must be between 1 and 50")
      return
    }

    console.log("Creating assessment with data:", {
      ...formData,
      createdBy: user.uid,
      collegeId: user.collegeId || 'default'
    })

    setCreating(true)
    setGeneratingQuestions(true)
    
    try {
      // Step 1: Generate questions using OpenAI
      toast.info(`Generating ${formData.totalQuestions} questions using AI...`)
      
      const questionResponse = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skill: formData.skill,
          assessmentTitle: formData.title,
          difficulty: formData.difficulty,
          questionType: formData.type,
          numberOfQuestions: formData.totalQuestions,
          topics: formData.tags.split(",").map(t => t.trim()).filter(Boolean),
        }),
      })

      const questionData = await questionResponse.json()

      if (!questionData.success) {
        throw new Error(questionData.error || 'Failed to generate questions')
      }

      setGeneratingQuestions(false)
      toast.success(`Generated ${questionData.count} questions!`)

      // Step 2: Save questions to Firebase
      const questionsToCreate = questionData.questions.map((q: any) => ({
        title: q.question,
        description: q.explanation || "",
        type: q.type,
        difficulty: q.difficulty,
        skill: formData.skill,
        points: q.points,
        timeLimit: Math.ceil(formData.duration / formData.totalQuestions),
        options: q.options,
        correctAnswer: q.correctAnswer,
        testCases: q.testCases,
        createdBy: user.uid,
        collegeId: user.collegeId || 'default',
        tags: formData.tags.split(",").map(t => t.trim()).filter(Boolean),
        isActive: true,
      }))

      const questionBatchResult = await createQuestionsBatch(questionsToCreate)

      if (!questionBatchResult.success) {
        throw new Error('Failed to save generated questions')
      }

      // Step 3: Create assessment with question IDs
      const result = await createAssessment({
        title: formData.title,
        description: formData.description,
        type: formData.type,
        skill: formData.skill,
        difficulty: formData.difficulty,
        duration: formData.duration,
        totalMarks: formData.totalMarks,
        passingMarks: formData.passingMarks,
        questions: questionBatchResult.questionIds || [],
        createdBy: user.uid,
        collegeId: user.collegeId || 'default',
        isActive: true,
        scheduledDate: formData.scheduledDate ? new Date(formData.scheduledDate) : undefined,
        dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
        tags: formData.tags.split(",").map(t => t.trim()).filter(Boolean),
      })

      console.log("Assessment creation result:", result)

      if (result.success) {
        toast.success(`Assessment "${formData.title}" created with ${questionData.count} questions!`)
        setCreateDialogOpen(false)
        resetForm()
        await loadAssessments()
      } else {
        const errorMsg = result.error || "Failed to create assessment"
        toast.error(errorMsg)
        console.error("Assessment creation failed:", errorMsg)
      }
    } catch (error) {
      console.error("Error creating assessment:", error)
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred"
      toast.error(`Error: ${errorMessage}`)
    } finally {
      setCreating(false)
      setGeneratingQuestions(false)
    }
  }

  const handleUpdate = async () => {
    if (!selectedAssessment?.id) return

    setUpdating(true)
    try {
      const result = await updateAssessment(selectedAssessment.id, {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        skill: formData.skill,
        difficulty: formData.difficulty,
        duration: formData.duration,
        totalMarks: formData.totalMarks,
        passingMarks: formData.passingMarks,
        scheduledDate: formData.scheduledDate ? new Date(formData.scheduledDate) : undefined,
        dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
        tags: formData.tags.split(",").map(t => t.trim()).filter(Boolean),
      })

      if (result.success) {
        toast.success("Assessment updated successfully!")
        setEditDialogOpen(false)
        setSelectedAssessment(null)
        resetForm()
        loadAssessments()
      } else {
        toast.error(result.error || "Failed to update assessment")
      }
    } catch (error) {
      console.error("Error updating assessment:", error)
      toast.error("An error occurred")
    } finally {
      setUpdating(false)
    }
  }

  const handleDelete = async (assessmentId: string) => {
    try {
      const result = await deleteAssessment(assessmentId)
      
      if (result.success) {
        toast.success("Assessment deleted successfully!")
        loadAssessments()
      } else {
        toast.error(result.error || "Failed to delete assessment")
      }
    } catch (error) {
      console.error("Error deleting assessment:", error)
      toast.error("An error occurred")
    }
  }

  const openEditDialog = (assessment: Assessment) => {
    setSelectedAssessment(assessment)
    setFormData({
      title: assessment.title,
      description: assessment.description,
      type: assessment.type,
      skill: assessment.skill,
      difficulty: assessment.difficulty,
      duration: assessment.duration,
      totalMarks: assessment.totalMarks,
      passingMarks: assessment.passingMarks,
      totalQuestions: assessment.questions?.length || 10,
      scheduledDate: assessment.scheduledDate ? new Date(assessment.scheduledDate).toISOString().slice(0, 16) : "",
      dueDate: assessment.dueDate ? new Date(assessment.dueDate).toISOString().slice(0, 16) : "",
      tags: assessment.tags.join(", "),
    })
    setEditDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      type: "mcq",
      skill: "",
      difficulty: "medium",
      duration: 60,
      totalMarks: 100,
      passingMarks: 70,
      totalQuestions: 10,
      scheduledDate: "",
      dueDate: "",
      tags: "",
    })
  }

  const filteredAssessments = assessments.filter(assessment => {
    const matchesSearch = assessment.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTab = activeTab === "all" || (activeTab === "active" && assessment.isActive) || (activeTab === "inactive" && !assessment.isActive)
    return matchesSearch && matchesTab
  })

  const stats = {
    total: assessments.length,
    active: assessments.filter(a => a.isActive).length,
    totalParticipants: assessments.reduce((acc, a) => acc + (a.allowedStudents?.length || 0), 0),
  }

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Assessment Management</h1>
            <p className="text-muted-foreground">Create and manage skill assessments</p>
          </div>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <PlusCircle className="h-4 w-4" />
                Create Assessment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Assessment</DialogTitle>
                <DialogDescription>
                  Set up a new skill assessment for your students
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Assessment Title *</Label>
                  <Input 
                    id="title" 
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., React Fundamentals" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of the assessment" 
                    rows={3}
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="type">Assessment Type</Label>
                    <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
                      <SelectTrigger id="type">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mcq">MCQ Only</SelectItem>
                        <SelectItem value="coding">Coding Only</SelectItem>
                        <SelectItem value="mixed">Mixed (MCQ + Coding)</SelectItem>
                        <SelectItem value="practical">Practical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="difficulty">Difficulty</Label>
                    <Select value={formData.difficulty} onValueChange={(value: any) => setFormData({ ...formData, difficulty: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="skill">Skill/Subject *</Label>
                  <Input 
                    id="skill" 
                    value={formData.skill}
                    onChange={(e) => setFormData({ ...formData, skill: e.target.value })}
                    placeholder="e.g., React, JavaScript, Database"
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <Input 
                      id="duration" 
                      type="number" 
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                      placeholder="60" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="totalQuestions">Total Questions</Label>
                    <Input 
                      id="totalQuestions" 
                      type="number" 
                      value={formData.totalQuestions}
                      onChange={(e) => setFormData({ ...formData, totalQuestions: parseInt(e.target.value) })}
                      placeholder="10"
                      min="1"
                      max="50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="totalMarks">Total Marks</Label>
                    <Input 
                      id="totalMarks" 
                      type="number" 
                      value={formData.totalMarks}
                      onChange={(e) => setFormData({ ...formData, totalMarks: parseInt(e.target.value) })}
                      placeholder="100" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="passingMarks">Passing Marks</Label>
                    <Input 
                      id="passingMarks" 
                      type="number" 
                      value={formData.passingMarks}
                      onChange={(e) => setFormData({ ...formData, passingMarks: parseInt(e.target.value) })}
                      placeholder="40" 
                    />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date & Time</Label>
                    <Input 
                      id="startDate" 
                      type="datetime-local" 
                      value={formData.scheduledDate}
                      onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date & Time</Label>
                    <Input 
                      id="endDate" 
                      type="datetime-local" 
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input 
                    id="tags" 
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="e.g., frontend, react, beginner"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setCreateDialogOpen(false)}
                  disabled={creating}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreate}
                  disabled={creating || generatingQuestions}
                >
                  {generatingQuestions ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating Questions...
                    </>
                  ) : creating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Assessment with AI"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Assessments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.active}</div>
              <p className="text-xs text-muted-foreground">In progress</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalParticipants}</div>
              <p className="text-xs text-muted-foreground">Students enrolled</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Inactive</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total - stats.active}</div>
              <p className="text-xs text-muted-foreground">Archived</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>All Assessments</CardTitle>
                <CardDescription>Manage and track your assessments</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <div className="flex items-center justify-between">
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="active">Active</TabsTrigger>
                  <TabsTrigger value="inactive">Inactive</TabsTrigger>
                </TabsList>
                <div className="relative w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search assessments..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <TabsContent value={activeTab} className="space-y-4">
                {loading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <Card key={i}>
                        <CardContent className="pt-6">
                          <div className="flex gap-4">
                            <Skeleton className="h-12 w-12 rounded" />
                            <div className="flex-1 space-y-2">
                              <Skeleton className="h-6 w-3/4" />
                              <Skeleton className="h-4 w-1/2" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : filteredAssessments.length === 0 ? (
                  <div className="text-center py-12">
                    <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No assessments found</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {searchTerm ? "Try adjusting your search" : "Create your first assessment to get started"}
                    </p>
                    {!searchTerm && (
                      <Button onClick={() => setCreateDialogOpen(true)}>
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Create Assessment
                      </Button>
                    )}
                  </div>
                ) : (
                  filteredAssessments.map((assessment) => (
                    <Card key={assessment.id} className="border-border/50">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex gap-4 flex-1">
                            <div className="p-3 bg-primary/10 rounded-lg h-fit">
                              <FileText className="h-6 w-6 text-primary" />
                            </div>
                            <div className="flex-1 space-y-3">
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="font-semibold text-lg">{assessment.title}</h3>
                                  <Badge variant={assessment.isActive ? "default" : "secondary"}>
                                    {assessment.isActive ? "Active" : "Inactive"}
                                  </Badge>
                                  <Badge variant="outline">{assessment.type}</Badge>
                                  <Badge variant="outline">{assessment.difficulty}</Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {assessment.description || "No description"}
                                </p>
                                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Target className="h-3 w-3" />
                                    {assessment.skill}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {assessment.duration} min
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Users className="h-3 w-3" />
                                    {assessment.questions.length} questions
                                  </span>
                                  {assessment.scheduledDate && (
                                    <span className="flex items-center gap-1">
                                      <Calendar className="h-3 w-3" />
                                      {new Date(assessment.scheduledDate).toLocaleDateString()}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => openEditDialog(assessment)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm" className="text-destructive">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will permanently delete the assessment "{assessment.title}".
                                    This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(assessment.id!)}>
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Assessment</DialogTitle>
              <DialogDescription>
                Update assessment details
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Title *</Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-type">Type</Label>
                  <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mcq">Multiple Choice</SelectItem>
                      <SelectItem value="coding">Coding</SelectItem>
                      <SelectItem value="practical">Practical</SelectItem>
                      <SelectItem value="mixed">Mixed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-difficulty">Difficulty</Label>
                  <Select value={formData.difficulty} onValueChange={(value: any) => setFormData({ ...formData, difficulty: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-skill">Skill/Subject *</Label>
                <Input
                  id="edit-skill"
                  value={formData.skill}
                  onChange={(e) => setFormData({ ...formData, skill: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-duration">Duration (min)</Label>
                  <Input
                    id="edit-duration"
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-totalMarks">Total Marks</Label>
                  <Input
                    id="edit-totalMarks"
                    type="number"
                    value={formData.totalMarks}
                    onChange={(e) => setFormData({ ...formData, totalMarks: parseInt(e.target.value) })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-passingMarks">Passing Marks</Label>
                  <Input
                    id="edit-passingMarks"
                    type="number"
                    value={formData.passingMarks}
                    onChange={(e) => setFormData({ ...formData, passingMarks: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-scheduledDate">Scheduled Date</Label>
                  <Input
                    id="edit-scheduledDate"
                    type="datetime-local"
                    value={formData.scheduledDate}
                    onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-dueDate">Due Date</Label>
                  <Input
                    id="edit-dueDate"
                    type="datetime-local"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-tags">Tags (comma-separated)</Label>
                <Input
                  id="edit-tags"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                />
              </div>
            </div>

            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setEditDialogOpen(false)}
                disabled={updating}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleUpdate}
                disabled={updating}
              >
                {updating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Assessment"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardShell>
  )
}
