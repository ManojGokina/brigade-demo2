"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
import { Badge } from "@/components/ui/badge"
import { Plus, Search, ChevronLeft, ChevronRight, Shield, LayoutDashboard, Pencil, Trash2 } from "lucide-react"
import { ProtectedRoute } from "@/components/protected-route"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"
import { CreateUserModal } from "@/components/create-user-modal"
import { useAuthStore } from "@/store/auth.store"

interface User {
  userId: string
  username: string
  email: string
  createdAt: string
  updatedAt: string
}

interface DashboardAccess {
  id: number
  name: string
  description?: string | null
}

interface ModuleAction {
  actionId: number
  actionName: string
}

interface ModulePermission {
  moduleId: number
  moduleName: string
  description?: string | null
  actions: ModuleAction[]
}

const DEFAULT_PAGE_SIZE = 20
const PAGE_SIZE_OPTIONS = [10, 20, 25, 50, 100]

export default function UsersPage() {
  const { toast } = useToast()
  const { user: currentUser } = useAuthStore()

  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [pagination, setPagination] = useState({
    total: 0,
    limit: DEFAULT_PAGE_SIZE,
    offset: 0,
    hasMore: false,
  })

  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isAccessDialogOpen, setIsAccessDialogOpen] = useState(false)
  const [isAccessLoading, setIsAccessLoading] = useState(false)
  const [dashboards, setDashboards] = useState<DashboardAccess[]>([])
  const [selectedDashboardId, setSelectedDashboardId] = useState<number | null>(null)
  const [modules, setModules] = useState<ModulePermission[]>([])

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editUsername, setEditUsername] = useState("")
  const [editEmail, setEditEmail] = useState("")
  const [isSavingEdit, setIsSavingEdit] = useState(false)
  const [isEditConfirmOpen, setIsEditConfirmOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deleteUserTarget, setDeleteUserTarget] = useState<User | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    loadUsers()
  }, [pagination.offset, pagination.limit])

  const loadUsers = async () => {
    setIsLoading(true)
    try {
      const response = await api.get(`/users?limit=${pagination.limit}&offset=${pagination.offset}`)
      setUsers(response.data.data.items)
      setPagination({
        total: response.data.data.pagination.total,
        limit: response.data.data.pagination.limit,
        offset: response.data.data.pagination.offset,
        hasMore: response.data.data.pagination.hasMore,
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to load users",
        description: error?.response?.data?.message || error.message,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePageChange = (newOffset: number) => {
    setPagination((prev) => ({ ...prev, offset: newOffset }))
  }

  const handlePageSizeChange = (value: string) => {
    setPagination((prev) => ({ ...prev, limit: Number(value), offset: 0 }))
  }

  const filteredUsers = users.filter(
    (u) =>
      u.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalPages = Math.ceil(pagination.total / pagination.limit)
  const currentPageIndex = Math.floor(pagination.offset / pagination.limit)

  const loadDashboardAccess = async (user: User) => {
    setIsAccessLoading(true)
    setDashboards([])
    setModules([])
    setSelectedDashboardId(null)

    try {
      const response = await api.post("/users/dashboard-access", { userId: user.userId })
      const data: DashboardAccess[] = response.data.data || []
      setDashboards(data)

      if (data.length > 0) {
        setSelectedDashboardId(data[0].id)
        await loadModulesForDashboard(data[0].id)
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to load access details",
        description: error?.response?.data?.message || error.message,
      })
    } finally {
      setIsAccessLoading(false)
    }
  }

  const loadModulesForDashboard = async (dashboardId: number) => {
    setIsAccessLoading(true)
    setModules([])

    try {
      const response = await api.get(`/dashboards/${dashboardId}/modules`)
      const data: ModulePermission[] = response.data.data || []
      setModules(data)
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to load modules",
        description: error?.response?.data?.message || error.message,
      })
    } finally {
      setIsAccessLoading(false)
    }
  }

  const openAccessDialog = async (user: User) => {
    setSelectedUser(user)
    setIsAccessDialogOpen(true)
    await loadDashboardAccess(user)
  }

  const handleDashboardChange = async (value: string) => {
    const id = Number(value)
    setSelectedDashboardId(id)
    await loadModulesForDashboard(id)
  }

  const canModifyUser = (userId: string) => {
    // For now, treat the currently logged-in user as superadmin and block edit/delete on that row
    if (!currentUser) return true
    return currentUser.userId !== userId
  }

  const handleEditClick = (user: User) => {
    if (!canModifyUser(user.userId)) return
    setSelectedUser(user)
    setIsEditConfirmOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!selectedUser) return

    if (!editUsername || !editEmail) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Name and email are required",
      })
      return
    }

    setIsSavingEdit(true)
    try {
      await api.put(`/users/${selectedUser.userId}`, {
        username: editUsername,
        email: editEmail,
      })
      toast({
        title: "User updated",
        description: "User details have been updated successfully.",
      })
      setIsEditDialogOpen(false)
      setSelectedUser(null)
      await loadUsers()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to update user",
        description: error?.response?.data?.message || error.message,
      })
    } finally {
      setIsSavingEdit(false)
    }
  }

  const handleDeleteClick = (user: User) => {
    if (!canModifyUser(user.userId)) return
    setDeleteUserTarget(user)
    setIsDeleteDialogOpen(true)
  }

  const confirmDeleteUser = async () => {
    if (!deleteUserTarget) return
    setIsDeleting(true)
    try {
      await api.delete(`/users/${deleteUserTarget.userId}`)
      toast({
        title: "User deactivated",
        description: "The user has been marked as inactive.",
      })
      await loadUsers()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to deactivate user",
        description: error?.response?.data?.message || error.message,
      })
    } finally {
      setIsDeleting(false)
      setIsDeleteDialogOpen(false)
      setDeleteUserTarget(null)
    }
  }

  return (
    <ProtectedRoute>
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Users</h1>
            <p className="text-sm text-muted-foreground">{pagination.total} total users</p>
          </div>
          <Button 
            style={{ backgroundColor: "#1d99ac" }}
            onClick={() => setIsModalOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add New User
          </Button>
        </div>

        <CreateUserModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={loadUsers}
        />

        <div className="mb-4 relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-white"
          />
        </div>

        <div className="rounded-lg border border-border/50 bg-card">
          {isLoading ? (
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-5 gap-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-4 w-full rounded-full" />
                ))}
              </div>
              <div className="space-y-2">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div key={i} className="grid grid-cols-5 gap-4">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Skeleton key={j} className="h-5 w-full rounded-md" />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/50 hover:bg-transparent">
                      <TableHead className="text-foreground">User ID</TableHead>
                      <TableHead className="text-foreground">Name</TableHead>
                      <TableHead className="text-foreground">Email</TableHead>
                      <TableHead className="text-foreground">Created At</TableHead>
                      <TableHead className="text-foreground">Last Updated</TableHead>
                      <TableHead className="text-foreground">Access</TableHead>
                      <TableHead className="text-right text-foreground">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.userId} className="border-border/50">
                        <TableCell className="font-mono text-sm text-foreground">
                          {user.userId}
                        </TableCell>
                        <TableCell className="font-medium text-sm text-foreground">
                          {user.username}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {user.email}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(user.updatedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 border-border text-xs cursor-pointer text-white"
                            style={{ backgroundColor: "#1d99ac" }}
                            onClick={() => openAccessDialog(user)}
                          >
                            <Shield className="mr-2 h-3 w-3" />
                            View Access
                          </Button>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 border-border cursor-pointer text-white"
                              onClick={() => handleEditClick(user)}
                              disabled={!canModifyUser(user.userId)}
                              style={{ backgroundColor: "#10b981" }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 border-border text-destructive hover:text-destructive cursor-pointer"
                              onClick={() => handleDeleteClick(user)}
                              disabled={!canModifyUser(user.userId) || isDeleting}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex items-center justify-between border-t border-border/50 px-4 py-3">
                <div className="flex items-center gap-4">
                  <span className="text-xs text-muted-foreground">
                    Showing {pagination.offset + 1}-
                    {Math.min(pagination.offset + pagination.limit, pagination.total)} of{" "}
                    {pagination.total}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Rows per page:</span>
                    <Select value={String(pagination.limit)} onValueChange={handlePageSizeChange}>
                      <SelectTrigger className="h-8 w-[70px] border-border bg-white text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PAGE_SIZE_OPTIONS.map((size) => (
                          <SelectItem key={size} value={String(size)}>
                            {size}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {totalPages > 1 && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(Math.max(0, pagination.offset - pagination.limit))}
                      disabled={pagination.offset === 0}
                      className="h-8 border-border bg-white text-foreground hover:bg-accent"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-xs text-muted-foreground">
                      {currentPageIndex + 1} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.offset + pagination.limit)}
                      disabled={!pagination.hasMore}
                      className="h-8 border-border bg-white text-foreground hover:bg-accent"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <Dialog open={isAccessDialogOpen} onOpenChange={setIsAccessDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>User Access Details</DialogTitle>
              <DialogDescription>
                View dashboard access and module permissions for{" "}
                <span className="font-medium text-foreground">
                  {selectedUser?.username || selectedUser?.email}
                </span>
              </DialogDescription>
            </DialogHeader>

            {isAccessLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-6 w-40" />
                <div className="grid grid-cols-2 gap-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full rounded-md" />
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Dashboards
                  </p>
                  {dashboards.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      This user does not have any dashboard access configured yet.
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {dashboards.map((dashboard) => (
                        <Badge
                          key={dashboard.id}
                          variant={dashboard.id === selectedDashboardId ? "default" : "outline"}
                          className="cursor-pointer text-xs"
                          onClick={() => handleDashboardChange(String(dashboard.id))}
                        >
                          <LayoutDashboard className="mr-1 h-3 w-3" />
                          {dashboard.name}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {selectedDashboardId && (
                  <div className="space-y-3">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Modules & Actions
                    </p>
                    {modules.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No module-level permissions found for this dashboard.
                      </p>
                    ) : (
                      <div className="grid gap-3 md:grid-cols-2">
                        {modules.map((module) => (
                          <div
                            key={module.moduleId}
                            className="rounded-md border border-border/60 bg-muted/40 p-3"
                          >
                            <p className="text-sm font-medium text-foreground">
                              {module.moduleName}
                            </p>
                            {module.description && (
                              <p className="mt-1 text-xs text-muted-foreground">
                                {module.description}
                              </p>
                            )}
                            <div className="mt-2 flex flex-wrap gap-1">
                              {module.actions.map((action) => (
                                <Badge
                                  key={action.actionId}
                                  variant="outline"
                                  className="text-[10px]"
                                >
                                  {action.actionName}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>Update basic details for this user.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Name</label>
                <Input
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  placeholder="User name"
                  className="bg-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Email</label>
                <Input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="bg-white"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false)
                  setSelectedUser(null)
                }}
                disabled={isSavingEdit}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveEdit}
                disabled={isSavingEdit}
                style={{ backgroundColor: "#1d99ac" }}
              >
                {isSavingEdit ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <AlertDialog open={isEditConfirmOpen} onOpenChange={setIsEditConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure you want to edit this user?</AlertDialogTitle>
              <AlertDialogDescription>
                You are about to modify this user's basic details. These changes will take effect
                immediately.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="cursor-pointer"
                onClick={() => {
                  if (!selectedUser) return
                  setEditUsername(selectedUser.username)
                  setEditEmail(selectedUser.email)
                  setIsEditConfirmOpen(false)
                  setIsEditDialogOpen(true)
                }}
              >
                Yes, edit user
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Deactivate this user?</AlertDialogTitle>
              <AlertDialogDescription>
                This will mark the user as inactive (soft delete). They will no longer be able to log
                in, but their data will be kept for audit purposes.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer"
                onClick={confirmDeleteUser}
                disabled={isDeleting}
              >
                {isDeleting ? "Deactivating..." : "Yes, deactivate user"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </ProtectedRoute>
  )
}

 