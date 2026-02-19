"use client"

import { useState } from "react"
import {
  useAuth,
  type User,
  type TabId,
  type PermissionLevel,
  TAB_INFO,
  DEFAULT_PERMISSIONS,
} from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import {
  Plus,
  Pencil,
  Trash2,
  Users,
  Shield,
  Eye,
  EyeOff,
  Edit3,
  Search,
} from "lucide-react"
import { ProtectedRoute } from "@/components/protected-route"

const TAB_IDS: TabId[] = ["add-case", "all-cases", "overview", "user-management"]

const ROLE_OPTIONS: User["role"][] = ["admin", "analyst", "viewer"]

interface UserFormData {
  email: string
  name: string
  role: User["role"]
  permissions: Record<TabId, PermissionLevel>
}

const getInitialFormData = (): UserFormData => ({
  email: "",
  name: "",
  role: "viewer",
  permissions: {
    "add-case": "none",
    "all-cases": "read",
    "overview": "read",
    "user-management": "none",
  },
})

const getRoleColor = (role: string) => {
  switch (role) {
    case "admin":
      return { bg: "rgba(239, 68, 68, 0.15)", color: "#ef4444" }
    case "analyst":
      return { bg: "rgba(29, 153, 172, 0.12)", color: "#1d99ac" }
    default:
      return { bg: "rgba(107, 114, 128, 0.15)", color: "#6b7280" }
  }
}

const getPermissionColor = (permission: PermissionLevel) => {
  switch (permission) {
    case "write":
      return { bg: "rgba(16, 185, 129, 0.15)", color: "#10b981" }
    case "read":
      return { bg: "rgba(29, 153, 172, 0.12)", color: "#1d99ac" }
    default:
      return { bg: "rgba(107, 114, 128, 0.15)", color: "#6b7280" }
  }
}

const getPermissionIcon = (permission: PermissionLevel) => {
  switch (permission) {
    case "write":
      return <Edit3 className="h-3 w-3" />
    case "read":
      return <Eye className="h-3 w-3" />
    default:
      return <EyeOff className="h-3 w-3" />
  }
}

export default function UserManagementPage() {
  const { user: currentUser, users, addUser, updateUser, deleteUser, canAccessTab } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [formData, setFormData] = useState<UserFormData>(getInitialFormData())

  // Check if user has access
  if (!canAccessTab("user-management")) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Shield className="mx-auto h-12 w-12 text-muted-foreground" />
          <h2 className="mt-4 text-lg font-semibold">Access Denied</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            You do not have permission to access user management.
          </p>
        </div>
      </div>
    )
  }

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.role.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleRoleChange = (role: User["role"]) => {
    const defaultPerms = DEFAULT_PERMISSIONS[role]
    const permissions: Record<TabId, PermissionLevel> = {
      "add-case": defaultPerms.find((p) => p.tabId === "add-case")?.permission || "none",
      "all-cases": defaultPerms.find((p) => p.tabId === "all-cases")?.permission || "none",
      "overview": defaultPerms.find((p) => p.tabId === "overview")?.permission || "none",
      "user-management": defaultPerms.find((p) => p.tabId === "user-management")?.permission || "none",
    }
    setFormData({ ...formData, role, permissions })
  }

  const handlePermissionChange = (tabId: TabId, permission: PermissionLevel) => {
    setFormData({
      ...formData,
      permissions: { ...formData.permissions, [tabId]: permission },
    })
  }

  const handleCreateUser = () => {
    const permissions = TAB_IDS.map((tabId) => ({
      tabId,
      permission: formData.permissions[tabId],
    }))
    
    addUser({
      email: formData.email,
      name: formData.name,
      role: formData.role,
      permissions,
    })
    
    setFormData(getInitialFormData())
    setIsCreateDialogOpen(false)
  }

  const handleEditUser = () => {
    if (!editingUser) return
    
    const permissions = TAB_IDS.map((tabId) => ({
      tabId,
      permission: formData.permissions[tabId],
    }))
    
    updateUser(editingUser.id, {
      email: formData.email,
      name: formData.name,
      role: formData.role,
      permissions,
    })
    
    setEditingUser(null)
    setFormData(getInitialFormData())
  }

  const openEditDialog = (user: User) => {
    const permissions: Record<TabId, PermissionLevel> = {
      "add-case": user.permissions.find((p) => p.tabId === "add-case")?.permission || "none",
      "all-cases": user.permissions.find((p) => p.tabId === "all-cases")?.permission || "none",
      "overview": user.permissions.find((p) => p.tabId === "overview")?.permission || "none",
      "user-management": user.permissions.find((p) => p.tabId === "user-management")?.permission || "none",
    }
    setFormData({
      email: user.email,
      name: user.name,
      role: user.role,
      permissions,
    })
    setEditingUser(user)
  }

  const closeEditDialog = () => {
    setEditingUser(null)
    setFormData(getInitialFormData())
  }

  const UserFormContent = () => (
    <div className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="user@hospital.org"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          placeholder="John Doe"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="role">Role</Label>
        <Select value={formData.role} onValueChange={(v) => handleRoleChange(v as User["role"])}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ROLE_OPTIONS.map((role) => (
              <SelectItem key={role} value={role}>
                <span className="capitalize">{role}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Changing role will reset permissions to defaults. You can customize below.
        </p>
      </div>
      
      <div className="mt-2 grid gap-3">
        <Label>Tab Permissions</Label>
        <div className="rounded-lg border border-border/50 bg-muted/30">
          {TAB_IDS.map((tabId) => (
            <div
              key={tabId}
              className="flex items-center justify-between border-b border-border/50 px-3 py-2.5 last:border-b-0"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium">{TAB_INFO[tabId].label}</p>
                <p className="text-xs text-muted-foreground">{TAB_INFO[tabId].description}</p>
              </div>
              <Select
                value={formData.permissions[tabId]}
                onValueChange={(v) => handlePermissionChange(tabId, v as PermissionLevel)}
              >
                <SelectTrigger className="w-[110px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">
                    <span className="flex items-center gap-2">
                      <EyeOff className="h-3 w-3" /> None
                    </span>
                  </SelectItem>
                  <SelectItem value="read">
                    <span className="flex items-center gap-2">
                      <Eye className="h-3 w-3" /> Read
                    </span>
                  </SelectItem>
                  <SelectItem value="write">
                    <span className="flex items-center gap-2">
                      <Edit3 className="h-3 w-3" /> Write
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <ProtectedRoute>
    <div className="min-h-screen p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">User Management</h1>
            <p className="text-sm text-muted-foreground">
              Manage users and their access permissions
            </p>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button style={{ backgroundColor: "#1d99ac" }}>
                <Plus className="mr-2 h-4 w-4" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New User</DialogTitle>
                <DialogDescription>
                  Add a new user and configure their permissions.
                </DialogDescription>
              </DialogHeader>
              <UserFormContent />
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateUser}
                  disabled={!formData.email || !formData.name}
                  style={{ backgroundColor: "#1d99ac" }}
                >
                  Create User
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="border-border/50">
              <CardHeader className="pb-2">
              <CardDescription>Total Users</CardDescription>
              <CardTitle className="text-3xl" style={{ color: "#1d99ac" }}>
                {users.length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardDescription>Admins</CardDescription>
              <CardTitle className="text-3xl" style={{ color: "#ef4444" }}>
                {users.filter((u) => u.role === "admin").length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardDescription>Analysts</CardDescription>
              <CardTitle className="text-3xl" style={{ color: "#10b981" }}>
                {users.filter((u) => u.role === "analyst").length}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Users Table */}
        <Card className="border-border/50">
          <CardHeader className="pb-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" style={{ color: "#1d99ac" }} />
                  Users
                </CardTitle>
                <CardDescription>{filteredUsers.length} users found</CardDescription>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-auto rounded-lg border border-border/50">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/50 hover:bg-transparent">
                    <TableHead className="text-foreground">User</TableHead>
                    <TableHead className="text-foreground">Role</TableHead>
                    <TableHead className="text-foreground">Permissions</TableHead>
                    <TableHead className="text-right text-foreground">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id} className="border-border/50">
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className="font-medium capitalize"
                          style={getRoleColor(user.role)}
                        >
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {user.permissions
                            .filter((p) => p.permission !== "none")
                            .map((p) => (
                              <Badge
                                key={p.tabId}
                                variant="outline"
                                className="gap-1 text-[10px]"
                                style={getPermissionColor(p.permission)}
                              >
                                {getPermissionIcon(p.permission)}
                                {TAB_INFO[p.tabId].label.split(" ")[0]}
                              </Badge>
                            ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Dialog
                            open={editingUser?.id === user.id}
                            onOpenChange={(open) => !open && closeEditDialog()}
                          >
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => openEditDialog(user)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                              <DialogHeader>
                                <DialogTitle>Edit User</DialogTitle>
                                <DialogDescription>
                                  Update user information and permissions.
                                </DialogDescription>
                              </DialogHeader>
                              <UserFormContent />
                              <DialogFooter>
                                <Button variant="outline" onClick={closeEditDialog}>
                                  Cancel
                                </Button>
                                <Button
                                  onClick={handleEditUser}
                                  disabled={!formData.email || !formData.name}
                                  style={{ backgroundColor: "#1d99ac" }}
                                >
                                  Save Changes
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                disabled={user.id === currentUser?.id}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete User</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete {user.name}? This action cannot be
                                  undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteUser(user.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </ProtectedRoute>
  )
}
