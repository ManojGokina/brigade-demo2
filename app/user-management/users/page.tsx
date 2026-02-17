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
import { Plus, Search, ChevronLeft, ChevronRight } from "lucide-react"
import { ProtectedRoute } from "@/components/protected-route"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"
import { CreateUserModal } from "@/components/create-user-modal"

interface User {
  userId: string
  username: string
  email: string
  createdAt: string
  updatedAt: string
}

const DEFAULT_PAGE_SIZE = 20
const PAGE_SIZE_OPTIONS = [10, 20, 25, 50, 100]

export default function UsersPage() {
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

  return (
    <ProtectedRoute>
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Users</h1>
            <p className="text-sm text-muted-foreground">{pagination.total} total users</p>
          </div>
          <Button 
            style={{ backgroundColor: "#3b82f6" }}
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
            className="pl-9"
          />
        </div>

        <div className="rounded-lg border border-border/50 bg-card">
          {isLoading ? (
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-4 w-full rounded-full" />
                ))}
              </div>
              <div className="space-y-2">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div key={i} className="grid grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, j) => (
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
      </div>
    </ProtectedRoute>
  )
}
