"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { DashboardShell } from "@/components/dashboard-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
} from "@/components/ui/alert-dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Copy,
  Eye,
  Code,
  FileText,
  CheckCircle2,
  XCircle,
  MoreVertical,
  PlayCircle,
} from "lucide-react"
import {
  Question,
  createQuestion,
  getQuestionsByFaculty,
  updateQuestion,
  deleteQuestion,
  toggleQuestionStatus,
  bulkDeleteQuestions,
} from "@/lib/firebase/questions"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const questionTypes = [
  { value: "mcq", label: "Multiple Choice", icon: CheckCircle2 },
  { value: "coding", label: "Coding Challenge", icon: Code },
  { value: "practical", label: "Practical Task", icon: FileText },
]

const difficultyLevels = [
  { value: "easy", label: "Easy", color: "text-green-600 bg-green-50" },
  { value: "medium", label: "Medium", color: "text-yellow-600 bg-yellow-50" },
  { value: "hard", label: "Hard", color: "text-red-600 bg-red-50" },
]

const skills = [
  "React",
  "Node.js",
  "Python",
  "Java",
  "JavaScript",
  "TypeScript",
  "Data Structures",
  "Algorithms",
  "Database Design",
  "System Design",
  "Machine Learning",
  "DevOps",
  "Cloud Computing",
  "Cybersecurity",
]

export default function FacultyQuestionsPage() {
  const { user } = useAuth()
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [filterDifficulty, setFilterDifficulty] = useState<string>("all")
  const [filterSkill, setFilterSkill] = useState<string>("all")
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([])
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [questionToDelete, setQuestionToDelete] = useState<string | null>(null)

  // Form state for creating/editing questions
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "mcq" as "mcq" | "coding" | "practical",
    difficulty: "medium" as "easy" | "medium" | "hard",
    skill: "",
    points: 10,
    timeLimit: 30,
    tags: [] as string[],
    isActive: true,
    // MCQ specific
    options: ["", "", "", ""],
    correctAnswer: 0,
    // Coding specific
    starterCode: "",
    language: [] as string[],
    testCases: [{ input: "", expectedOutput: "", isHidden: false }],
  })

  useEffect(() => {
    loadQuestions()
  }, [user])

  const loadQuestions = async () => {
    if (!user?.uid || !user?.collegeId) return

    setLoading(true)
    try {
      const data = await getQuestionsByFaculty(user.uid, user.collegeId)
      setQuestions(data)
    } catch (error) {
      toast.error("Failed to load questions")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateQuestion = async () => {
    if (!user?.uid || !user?.collegeId) return

    if (!formData.title || !formData.skill) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      const questionData: any = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        difficulty: formData.difficulty,
        skill: formData.skill,
        points: formData.points,
        timeLimit: formData.timeLimit,
        tags: formData.tags,
        isActive: formData.isActive,
        createdBy: user.uid,
        collegeId: user.collegeId,
      }

      // Add type-specific fields
      if (formData.type === "mcq") {
        questionData.options = formData.options.filter((opt) => opt.trim() !== "")
        questionData.correctAnswer = formData.correctAnswer
      } else if (formData.type === "coding") {
        questionData.starterCode = formData.starterCode
        questionData.language = formData.language
        questionData.testCases = formData.testCases.filter(
          (tc) => tc.input && tc.expectedOutput
        )
      }

      const result = await createQuestion(questionData)

      if (result.success) {
        toast.success("Question created successfully!")
        setShowCreateDialog(false)
        resetForm()
        loadQuestions()
      } else {
        toast.error(result.error || "Failed to create question")
      }
    } catch (error) {
      toast.error("An error occurred")
      console.error(error)
    }
  }

  const handleUpdateQuestion = async () => {
    if (!currentQuestion?.id) return

    try {
      const updates: any = {
        title: formData.title,
        description: formData.description,
        difficulty: formData.difficulty,
        skill: formData.skill,
        points: formData.points,
        timeLimit: formData.timeLimit,
        tags: formData.tags,
        isActive: formData.isActive,
      }

      if (formData.type === "mcq") {
        updates.options = formData.options.filter((opt) => opt.trim() !== "")
        updates.correctAnswer = formData.correctAnswer
      } else if (formData.type === "coding") {
        updates.starterCode = formData.starterCode
        updates.language = formData.language
        updates.testCases = formData.testCases.filter((tc) => tc.input && tc.expectedOutput)
      }

      const result = await updateQuestion(currentQuestion.id, updates)

      if (result.success) {
        toast.success("Question updated successfully!")
        setShowEditDialog(false)
        setCurrentQuestion(null)
        resetForm()
        loadQuestions()
      } else {
        toast.error(result.error || "Failed to update question")
      }
    } catch (error) {
      toast.error("An error occurred")
      console.error(error)
    }
  }

  const handleDeleteQuestion = async () => {
    if (!questionToDelete) return

    try {
      const result = await deleteQuestion(questionToDelete)

      if (result.success) {
        toast.success("Question deleted successfully!")
        setShowDeleteDialog(false)
        setQuestionToDelete(null)
        loadQuestions()
      } else {
        toast.error(result.error || "Failed to delete question")
      }
    } catch (error) {
      toast.error("An error occurred")
      console.error(error)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedQuestions.length === 0) return

    try {
      const result = await bulkDeleteQuestions(selectedQuestions)

      if (result.success) {
        toast.success(`${selectedQuestions.length} questions deleted successfully!`)
        setSelectedQuestions([])
        loadQuestions()
      } else {
        toast.error(result.error || "Failed to delete questions")
      }
    } catch (error) {
      toast.error("An error occurred")
      console.error(error)
    }
  }

  const handleToggleStatus = async (questionId: string, isActive: boolean) => {
    try {
      const result = await toggleQuestionStatus(questionId, !isActive)

      if (result.success) {
        toast.success(`Question ${!isActive ? "activated" : "deactivated"}`)
        loadQuestions()
      } else {
        toast.error(result.error || "Failed to update status")
      }
    } catch (error) {
      toast.error("An error occurred")
      console.error(error)
    }
  }

  const openEditDialog = (question: Question) => {
    setCurrentQuestion(question)
    setFormData({
      title: question.title,
      description: question.description,
      type: question.type,
      difficulty: question.difficulty,
      skill: question.skill,
      points: question.points,
      timeLimit: question.timeLimit,
      tags: question.tags || [],
      isActive: question.isActive,
      options: question.options || ["", "", "", ""],
      correctAnswer: question.correctAnswer || 0,
      starterCode: question.starterCode || "",
      language: question.language || [],
      testCases: question.testCases || [{ input: "", expectedOutput: "", isHidden: false }],
    })
    setShowEditDialog(true)
  }

  const openViewDialog = (question: Question) => {
    setCurrentQuestion(question)
    setShowViewDialog(true)
  }

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      type: "mcq",
      difficulty: "medium",
      skill: "",
      points: 10,
      timeLimit: 30,
      tags: [],
      isActive: true,
      options: ["", "", "", ""],
      correctAnswer: 0,
      starterCode: "",
      language: [],
      testCases: [{ input: "", expectedOutput: "", isHidden: false }],
    })
  }

  const filteredQuestions = questions.filter((q) => {
    const matchesSearch =
      q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.skill.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = filterType === "all" || q.type === filterType
    const matchesDifficulty = filterDifficulty === "all" || q.difficulty === filterDifficulty
    const matchesSkill = filterSkill === "all" || q.skill === filterSkill

    return matchesSearch && matchesType && matchesDifficulty && matchesSkill
  })

  const stats = {
    total: questions.length,
    mcq: questions.filter((q) => q.type === "mcq").length,
    coding: questions.filter((q) => q.type === "coding").length,
    practical: questions.filter((q) => q.type === "practical").length,
    active: questions.filter((q) => q.isActive).length,
  }

  return (
    <DashboardShell
      heading="Question Bank"
      description="Create and manage assessment questions"
    >
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Questions</CardDescription>
              <CardTitle className="text-3xl">{stats.total}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>MCQ</CardDescription>
              <CardTitle className="text-3xl">{stats.mcq}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Coding</CardDescription>
              <CardTitle className="text-3xl">{stats.coding}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Practical</CardDescription>
              <CardTitle className="text-3xl">{stats.practical}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Active</CardDescription>
              <CardTitle className="text-3xl">{stats.active}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-37.5">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="mcq">MCQ</SelectItem>
                <SelectItem value="coding">Coding</SelectItem>
                <SelectItem value="practical">Practical</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
              <SelectTrigger className="w-37.5">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterSkill} onValueChange={setFilterSkill}>
              <SelectTrigger className="w-45">
                <SelectValue placeholder="Skill" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Skills</SelectItem>
                {skills.map((skill) => (
                  <SelectItem key={skill} value={skill}>
                    {skill}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            {selectedQuestions.length > 0 && (
              <Button variant="destructive" onClick={handleBulkDelete}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete ({selectedQuestions.length})
              </Button>
            )}
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Question
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Question</DialogTitle>
                  <DialogDescription>
                    Add a new question to your question bank
                  </DialogDescription>
                </DialogHeader>
                <QuestionForm
                  formData={formData}
                  setFormData={setFormData}
                  onSubmit={handleCreateQuestion}
                  onCancel={() => {
                    setShowCreateDialog(false)
                    resetForm()
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Questions Table */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center p-12">
                <div className="text-muted-foreground">Loading questions...</div>
              </div>
            ) : filteredQuestions.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No questions found</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {searchQuery || filterType !== "all" || filterDifficulty !== "all"
                    ? "Try adjusting your filters"
                    : "Get started by creating your first question"}
                </p>
                {!searchQuery && filterType === "all" && (
                  <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Question
                  </Button>
                )}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={
                          selectedQuestions.length === filteredQuestions.length &&
                          filteredQuestions.length > 0
                        }
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedQuestions(filteredQuestions.map((q) => q.id!))
                          } else {
                            setSelectedQuestions([])
                          }
                        }}
                      />
                    </TableHead>
                    <TableHead>Question</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Difficulty</TableHead>
                    <TableHead>Skill</TableHead>
                    <TableHead>Points</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredQuestions.map((question) => (
                    <TableRow key={question.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedQuestions.includes(question.id!)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedQuestions([...selectedQuestions, question.id!])
                            } else {
                              setSelectedQuestions(
                                selectedQuestions.filter((id) => id !== question.id)
                              )
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{question.title}</div>
                          <div className="text-xs text-muted-foreground line-clamp-1">
                            {question.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {question.type === "mcq" && <CheckCircle2 className="mr-1 h-3 w-3" />}
                          {question.type === "coding" && <Code className="mr-1 h-3 w-3" />}
                          {question.type === "practical" && <FileText className="mr-1 h-3 w-3" />}
                          {question.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={
                            difficultyLevels.find((d) => d.value === question.difficulty)?.color
                          }
                        >
                          {question.difficulty}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{question.skill}</Badge>
                      </TableCell>
                      <TableCell>{question.points}</TableCell>
                      <TableCell>{question.usageCount || 0}</TableCell>
                      <TableCell>
                        {question.isActive ? (
                          <Badge variant="default" className="bg-green-600">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openViewDialog(question)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openEditDialog(question)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleToggleStatus(question.id!, question.isActive)}
                            >
                              {question.isActive ? (
                                <>
                                  <XCircle className="mr-2 h-4 w-4" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="mr-2 h-4 w-4" />
                                  Activate
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => {
                                setQuestionToDelete(question.id!)
                                setShowDeleteDialog(true)
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Question</DialogTitle>
            <DialogDescription>Update question details</DialogDescription>
          </DialogHeader>
          <QuestionForm
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleUpdateQuestion}
            onCancel={() => {
              setShowEditDialog(false)
              setCurrentQuestion(null)
              resetForm()
            }}
            isEdit
          />
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Question Preview</DialogTitle>
          </DialogHeader>
          {currentQuestion && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">{currentQuestion.title}</h3>
                <p className="text-sm text-muted-foreground">{currentQuestion.description}</p>
              </div>

              <div className="flex gap-2">
                <Badge variant="outline" className="capitalize">
                  {currentQuestion.type}
                </Badge>
                <Badge
                  variant="secondary"
                  className={
                    difficultyLevels.find((d) => d.value === currentQuestion.difficulty)?.color
                  }
                >
                  {currentQuestion.difficulty}
                </Badge>
                <Badge variant="outline">{currentQuestion.skill}</Badge>
              </div>

              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Points:</span> {currentQuestion.points}
                </div>
                <div>
                  <span className="text-muted-foreground">Time Limit:</span>{" "}
                  {currentQuestion.timeLimit}m
                </div>
                <div>
                  <span className="text-muted-foreground">Usage:</span>{" "}
                  {currentQuestion.usageCount || 0}
                </div>
              </div>

              {currentQuestion.type === "mcq" && currentQuestion.options && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Options:</h4>
                  {currentQuestion.options.map((option, idx) => (
                    <div
                      key={idx}
                      className={`p-2 rounded border ${
                        idx === currentQuestion.correctAnswer
                          ? "border-green-500 bg-green-50"
                          : ""
                      }`}
                    >
                      {idx + 1}. {option}
                      {idx === currentQuestion.correctAnswer && (
                        <Badge variant="default" className="ml-2 bg-green-600">
                          Correct
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {currentQuestion.type === "coding" && (
                <div className="space-y-2">
                  <div>
                    <h4 className="font-medium text-sm mb-1">Languages:</h4>
                    <div className="flex gap-1">
                      {currentQuestion.language?.map((lang) => (
                        <Badge key={lang} variant="outline">
                          {lang}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  {currentQuestion.starterCode && (
                    <div>
                      <h4 className="font-medium text-sm mb-1">Starter Code:</h4>
                      <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
                        {currentQuestion.starterCode}
                      </pre>
                    </div>
                  )}
                  {currentQuestion.testCases && currentQuestion.testCases.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm mb-1">Test Cases:</h4>
                      <div className="space-y-2">
                        {currentQuestion.testCases.map((tc, idx) => (
                          <div key={idx} className="bg-muted p-2 rounded text-xs">
                            <div>
                              <strong>Input:</strong> {tc.input}
                            </div>
                            <div>
                              <strong>Output:</strong> {tc.expectedOutput}
                            </div>
                            {tc.isHidden && <Badge variant="secondary">Hidden</Badge>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {currentQuestion.tags && currentQuestion.tags.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm mb-1">Tags:</h4>
                  <div className="flex gap-1 flex-wrap">
                    {currentQuestion.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the question from your
              question bank.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setQuestionToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteQuestion} className="bg-destructive">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardShell>
  )
}

// Question Form Component
function QuestionForm({
  formData,
  setFormData,
  onSubmit,
  onCancel,
  isEdit = false,
}: {
  formData: any
  setFormData: (data: any) => void
  onSubmit: () => void
  onCancel: () => void
  isEdit?: boolean
}) {
  const updateFormData = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value })
  }

  const addOption = () => {
    updateFormData("options", [...formData.options, ""])
  }

  const updateOption = (index: number, value: string) => {
    const newOptions = [...formData.options]
    newOptions[index] = value
    updateFormData("options", newOptions)
  }

  const removeOption = (index: number) => {
    const newOptions = formData.options.filter((_: any, i: number) => i !== index)
    updateFormData("options", newOptions)
  }

  const addTestCase = () => {
    updateFormData("testCases", [
      ...formData.testCases,
      { input: "", expectedOutput: "", isHidden: false },
    ])
  }

  const updateTestCase = (index: number, field: string, value: any) => {
    const newTestCases = [...formData.testCases]
    newTestCases[index] = { ...newTestCases[index], [field]: value }
    updateFormData("testCases", newTestCases)
  }

  const removeTestCase = (index: number) => {
    const newTestCases = formData.testCases.filter((_: any, i: number) => i !== index)
    updateFormData("testCases", newTestCases)
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Question Title *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => updateFormData("title", e.target.value)}
          placeholder="Enter question title"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => updateFormData("description", e.target.value)}
          placeholder="Describe the question requirements"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="type">Question Type *</Label>
          <Select
            value={formData.type}
            onValueChange={(value) => updateFormData("type", value)}
            disabled={isEdit}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {questionTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="difficulty">Difficulty *</Label>
          <Select
            value={formData.difficulty}
            onValueChange={(value) => updateFormData("difficulty", value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {difficultyLevels.map((level) => (
                <SelectItem key={level.value} value={level.value}>
                  {level.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="skill">Skill *</Label>
          <Select value={formData.skill} onValueChange={(value) => updateFormData("skill", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select skill" />
            </SelectTrigger>
            <SelectContent>
              {skills.map((skill) => (
                <SelectItem key={skill} value={skill}>
                  {skill}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="points">Points</Label>
          <Input
            id="points"
            type="number"
            value={formData.points}
            onChange={(e) => updateFormData("points", parseInt(e.target.value))}
            min={1}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="timeLimit">Time (min)</Label>
          <Input
            id="timeLimit"
            type="number"
            value={formData.timeLimit}
            onChange={(e) => updateFormData("timeLimit", parseInt(e.target.value))}
            min={1}
          />
        </div>
      </div>

      {/* MCQ Specific Fields */}
      {formData.type === "mcq" && (
        <div className="space-y-3 border rounded-lg p-4">
          <Label>Options *</Label>
          {formData.options.map((option: string, index: number) => (
            <div key={index} className="flex gap-2 items-start">
              <div className="flex-1 space-y-2">
                <Input
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <Checkbox
                  checked={formData.correctAnswer === index}
                  onCheckedChange={(checked) => {
                    if (checked) updateFormData("correctAnswer", index)
                  }}
                />
                <Label className="text-xs">Correct</Label>
                {formData.options.length > 2 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeOption(index)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={addOption}>
            <Plus className="mr-2 h-4 w-4" />
            Add Option
          </Button>
        </div>
      )}

      {/* Coding Specific Fields */}
      {formData.type === "coding" && (
        <div className="space-y-4 border rounded-lg p-4">
          <div className="space-y-2">
            <Label>Programming Languages</Label>
            <div className="flex gap-2 flex-wrap">
              {["JavaScript", "Python", "Java", "C++", "Go"].map((lang) => (
                <Button
                  key={lang}
                  type="button"
                  variant={formData.language.includes(lang) ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    if (formData.language.includes(lang)) {
                      updateFormData(
                        "language",
                        formData.language.filter((l: string) => l !== lang)
                      )
                    } else {
                      updateFormData("language", [...formData.language, lang])
                    }
                  }}
                >
                  {lang}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="starterCode">Starter Code (Optional)</Label>
            <Textarea
              id="starterCode"
              value={formData.starterCode}
              onChange={(e) => updateFormData("starterCode", e.target.value)}
              placeholder="// Starter code for students"
              rows={5}
              className="font-mono text-xs"
            />
          </div>

          <div className="space-y-3">
            <Label>Test Cases</Label>
            {formData.testCases.map((tc: any, index: number) => (
              <div key={index} className="space-y-2 border rounded p-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Test Case {index + 1}</span>
                  {formData.testCases.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTestCase(index)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                <Input
                  value={tc.input}
                  onChange={(e) => updateTestCase(index, "input", e.target.value)}
                  placeholder="Input"
                  className="font-mono text-xs"
                />
                <Input
                  value={tc.expectedOutput}
                  onChange={(e) => updateTestCase(index, "expectedOutput", e.target.value)}
                  placeholder="Expected Output"
                  className="font-mono text-xs"
                />
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={tc.isHidden}
                    onCheckedChange={(checked) => updateTestCase(index, "isHidden", checked)}
                  />
                  <Label className="text-xs">Hidden test case</Label>
                </div>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={addTestCase}>
              <Plus className="mr-2 h-4 w-4" />
              Add Test Case
            </Button>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2">
        <Checkbox
          checked={formData.isActive}
          onCheckedChange={(checked) => updateFormData("isActive", checked)}
        />
        <Label>Set as active</Label>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="button" onClick={onSubmit}>
          {isEdit ? "Update" : "Create"} Question
        </Button>
      </DialogFooter>
    </div>
  )
}
