"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { DashboardShell } from "@/components/dashboard-shell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Plus, 
  Search, 
  BookOpen, 
  Code, 
  Database, 
  Layout, 
  Edit, 
  Trash2, 
  Loader2,
  X
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  getAllSkills, 
  createSkill, 
  updateSkill, 
  deleteSkill,
  type Skill 
} from "@/lib/firebase/skills"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"

function SkillsContent() {
  const { user } = useAuth()
  const [skills, setSkills] = useState<Skill[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null)
  const [creating, setCreating] = useState(false)
  const [updating, setUpdating] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "general",
  })

  const categories = [
    { name: "Frontend", value: "frontend", icon: Layout, color: "bg-blue-500/10 text-blue-500" },
    { name: "Backend", value: "backend", icon: Database, color: "bg-green-500/10 text-green-500" },
    { name: "Languages", value: "languages", icon: Code, color: "bg-orange-500/10 text-orange-500" },
    { name: "CS Fundamentals", value: "cs-fundamentals", icon: BookOpen, color: "bg-purple-500/10 text-purple-500" },
    { name: "General", value: "general", icon: BookOpen, color: "bg-gray-500/10 text-gray-500" },
  ]

  useEffect(() => {
    loadSkills()
  }, [])

  const loadSkills = async () => {
    setLoading(true)
    try {
      const data = await getAllSkills()
      setSkills(data)
    } catch (error) {
      console.error("Error loading skills:", error)
      toast.error("Failed to load skills")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSkill = async () => {
    if (!formData.name || !formData.category) {
      toast.error("Please fill in all required fields")
      return
    }

    setCreating(true)
    try {
      const result = await createSkill({
        name: formData.name,
        description: formData.description,
        category: formData.category,
        createdBy: user?.uid,
      })

      if (result.success) {
        toast.success("Skill created successfully")
        setShowCreateDialog(false)
        resetForm()
        loadSkills()
      } else {
        toast.error(result.error || "Failed to create skill")
      }
    } catch (error) {
      console.error("Error creating skill:", error)
      toast.error("Failed to create skill")
    } finally {
      setCreating(false)
    }
  }

  const handleUpdateSkill = async () => {
    if (!selectedSkill || !formData.name || !formData.category) {
      toast.error("Please fill in all required fields")
      return
    }

    setUpdating(true)
    try {
      const result = await updateSkill(selectedSkill.id, {
        name: formData.name,
        description: formData.description,
        category: formData.category,
      })

      if (result.success) {
        toast.success("Skill updated successfully")
        setShowEditDialog(false)
        resetForm()
        setSelectedSkill(null)
        loadSkills()
      } else {
        toast.error(result.error || "Failed to update skill")
      }
    } catch (error) {
      console.error("Error updating skill:", error)
      toast.error("Failed to update skill")
    } finally {
      setUpdating(false)
    }
  }

  const handleDeleteSkill = async () => {
    if (!selectedSkill) return

    try {
      const result = await deleteSkill(selectedSkill.id)
      if (result.success) {
        toast.success("Skill deleted successfully")
        setShowDeleteDialog(false)
        setSelectedSkill(null)
        loadSkills()
      } else {
        toast.error(result.error || "Failed to delete skill")
      }
    } catch (error) {
      console.error("Error deleting skill:", error)
      toast.error("Failed to delete skill")
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      category: "general",
    })
  }

  const openEditDialog = (skill: Skill) => {
    setSelectedSkill(skill)
    setFormData({
      name: skill.name,
      description: skill.description || "",
      category: skill.category,
    })
    setShowEditDialog(true)
  }

  const filteredSkills = skills.filter(skill =>
    skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    skill.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    skill.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const categoryCounts = categories.map(cat => ({
    ...cat,
    count: skills.filter(s => s.category === cat.value && s.isActive).length
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Skill Library</h1>
          <p className="text-muted-foreground">Define and categorize skills for platform-wide assessment.</p>
        </div>
        <Button className="gap-2" onClick={() => {
          resetForm()
          setShowCreateDialog(true)
        }}>
          <Plus className="h-4 w-4" />
          Add Skill
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {categoryCounts.map((cat, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <div className={`p-2 w-fit rounded-lg ${cat.color}`}>
                <cat.icon className="h-5 w-5" />
              </div>
              <CardTitle className="text-lg mt-2">{cat.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{cat.count}</div>
              <p className="text-xs text-muted-foreground">Active Skills</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Global Skills ({filteredSkills.length})</CardTitle>
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Search skills..." 
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : filteredSkills.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No skills found</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredSkills.map((skill) => {
                const category = categories.find(c => c.value === skill.category)
                return (
                  <div
                    key={skill.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-muted/20"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                        {skill.name[0]}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">{skill.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {category && (
                            <Badge variant="outline" className="text-xs">
                              {category.name}
                            </Badge>
                          )}
                          {!skill.isActive && (
                            <Badge variant="secondary" className="text-xs">
                              Inactive
                            </Badge>
                          )}
                        </div>
                        {skill.description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                            {skill.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => openEditDialog(skill)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          setSelectedSkill(skill)
                          setShowDeleteDialog(true)
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Skill Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Skill</DialogTitle>
            <DialogDescription>
              Add a new skill to the platform that students can enroll in and get certified.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="skill-name">Skill Name *</Label>
              <Input
                id="skill-name"
                placeholder="e.g., JavaScript, Python, React"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="skill-category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="skill-description">Description (Optional)</Label>
              <Textarea
                id="skill-description"
                placeholder="Brief description of the skill..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowCreateDialog(false)
              resetForm()
            }}>
              Cancel
            </Button>
            <Button onClick={handleCreateSkill} disabled={creating}>
              {creating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Skill"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Skill Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Skill</DialogTitle>
            <DialogDescription>
              Update skill information.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-skill-name">Skill Name *</Label>
              <Input
                id="edit-skill-name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-skill-category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-skill-description">Description</Label>
              <Textarea
                id="edit-skill-description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowEditDialog(false)
              resetForm()
              setSelectedSkill(null)
            }}>
              Cancel
            </Button>
            <Button onClick={handleUpdateSkill} disabled={updating}>
              {updating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Skill"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Skill Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Skill</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedSkill?.name}"? This action cannot be undone.
              Students enrolled in this skill will be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedSkill(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSkill}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default function SkillsManagement() {
  return (
    <DashboardShell>
      <SkillsContent />
    </DashboardShell>
  )
}
