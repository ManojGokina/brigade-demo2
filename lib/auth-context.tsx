"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react"
import { useRouter } from "next/navigation"

// Permission types
export type TabId = "add-case" | "all-cases" | "overview" | "user-management"
export type PermissionLevel = "none" | "read" | "write"

export interface TabPermission {
  tabId: TabId
  permission: PermissionLevel
}

export interface User {
  id: string
  email: string
  name: string
  role: "admin" | "analyst" | "viewer"
  avatar?: string
  permissions: TabPermission[]
  createdAt: string
}

interface AuthContextType {
  user: User | null
  users: User[]
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string) => void
  logout: () => void
  addUser: (user: Omit<User, "id" | "createdAt">) => void
  updateUser: (id: string, updates: Partial<Omit<User, "id" | "createdAt">>) => void
  deleteUser: (id: string) => void
  hasPermission: (tabId: TabId, level: PermissionLevel) => boolean
  canAccessTab: (tabId: TabId) => boolean
  getTabPermission: (tabId: TabId) => PermissionLevel
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const USER_STORAGE_KEY = "case_tracker_user"
const USERS_STORAGE_KEY = "case_tracker_users"

// Tab display info
export const TAB_INFO: Record<TabId, { label: string; description: string }> = {
  "add-case": { label: "Add New Case", description: "Create and submit new surgical cases" },
  "all-cases": { label: "All Cases", description: "View and manage all case records" },
  "overview": { label: "Overview", description: "Dashboard with analytics and charts" },
  "user-management": { label: "User Management", description: "Manage users and permissions" },
}

// Default permissions by role
const DEFAULT_PERMISSIONS: Record<User["role"], TabPermission[]> = {
  admin: [
    { tabId: "add-case", permission: "write" },
    { tabId: "all-cases", permission: "write" },
    { tabId: "overview", permission: "write" },
    { tabId: "user-management", permission: "write" },
  ],
  analyst: [
    { tabId: "add-case", permission: "write" },
    { tabId: "all-cases", permission: "write" },
    { tabId: "overview", permission: "read" },
    { tabId: "user-management", permission: "none" },
  ],
  viewer: [
    { tabId: "add-case", permission: "none" },
    { tabId: "all-cases", permission: "read" },
    { tabId: "overview", permission: "read" },
    { tabId: "user-management", permission: "none" },
  ],
}

// Default demo users
const DEFAULT_USERS: User[] = [
  {
    id: "1",
    email: "admin@hospital.org",
    name: "Admin User",
    role: "admin",
    permissions: DEFAULT_PERMISSIONS.admin,
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    email: "analyst@clinic.com",
    name: "Healthcare Analyst",
    role: "analyst",
    permissions: DEFAULT_PERMISSIONS.analyst,
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    email: "dr.smith@medical.net",
    name: "Dr Smith",
    role: "viewer",
    permissions: DEFAULT_PERMISSIONS.viewer,
    createdAt: new Date().toISOString(),
  },
]

function getNameFromEmail(email: string): string {
  const localPart = email.split("@")[0]
  return localPart
    .split(/[._-]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 9)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Load users and current user from localStorage
  useEffect(() => {
    const storedUsers = localStorage.getItem(USERS_STORAGE_KEY)
    if (storedUsers) {
      try {
        setUsers(JSON.parse(storedUsers))
      } catch {
        setUsers(DEFAULT_USERS)
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(DEFAULT_USERS))
      }
    } else {
      setUsers(DEFAULT_USERS)
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(DEFAULT_USERS))
    }

    const storedUser = localStorage.getItem(USER_STORAGE_KEY)
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        // Migrate old users without permissions
        if (!parsedUser.permissions || !Array.isArray(parsedUser.permissions)) {
          const role = parsedUser.role || "viewer"
          parsedUser.permissions = DEFAULT_PERMISSIONS[role as keyof typeof DEFAULT_PERMISSIONS] || DEFAULT_PERMISSIONS.viewer
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(parsedUser))
        }
        setUser(parsedUser)
      } catch {
        localStorage.removeItem(USER_STORAGE_KEY)
      }
    }
    setIsLoading(false)
  }, [])

  // Save users to localStorage when they change
  useEffect(() => {
    if (users.length > 0) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))
    }
  }, [users])

  const login = useCallback(
    (email: string) => {
      // Check if user exists in the system
      const existingUser = users.find((u) => u.email.toLowerCase() === email.toLowerCase())
      
      if (existingUser) {
        setUser(existingUser)
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(existingUser))
      } else {
        // Create new user as viewer by default
        const newUser: User = {
          id: generateId(),
          email,
          name: getNameFromEmail(email),
          role: "viewer",
          permissions: DEFAULT_PERMISSIONS.viewer,
          createdAt: new Date().toISOString(),
        }
        setUser(newUser)
        setUsers((prev) => [...prev, newUser])
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser))
      }
      router.push("/select-dashboard")
    },
    [router, users]
  )

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem(USER_STORAGE_KEY)
    router.push("/login")
  }, [router])

  const addUser = useCallback((userData: Omit<User, "id" | "createdAt">) => {
    const newUser: User = {
      ...userData,
      id: generateId(),
      createdAt: new Date().toISOString(),
    }
    setUsers((prev) => [...prev, newUser])
  }, [])

  const updateUser = useCallback((id: string, updates: Partial<Omit<User, "id" | "createdAt">>) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, ...updates } : u))
    )
    // If updating current user, update their session too
    setUser((currentUser) => {
      if (currentUser?.id === id) {
        const updatedUser = { ...currentUser, ...updates }
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser))
        return updatedUser
      }
      return currentUser
    })
  }, [])

  const deleteUser = useCallback((id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id))
  }, [])

  const hasPermission = useCallback(
    (tabId: TabId, level: PermissionLevel): boolean => {
      if (!user) return false
      if (user.role === "admin") return true
      if (!user.permissions || !Array.isArray(user.permissions)) return false
      
      const tabPermission = user.permissions.find((p) => p.tabId === tabId)
      if (!tabPermission) return false
      
      if (level === "none") return true
      if (level === "read") return tabPermission.permission === "read" || tabPermission.permission === "write"
      if (level === "write") return tabPermission.permission === "write"
      
      return false
    },
    [user]
  )

  const canAccessTab = useCallback(
    (tabId: TabId): boolean => {
      if (!user) return false
      if (user.role === "admin") return true
      if (!user.permissions || !Array.isArray(user.permissions)) return false
      
      const tabPermission = user.permissions.find((p) => p.tabId === tabId)
      return tabPermission ? tabPermission.permission !== "none" : false
    },
    [user]
  )

  const getTabPermission = useCallback(
    (tabId: TabId): PermissionLevel => {
      if (!user) return "none"
      if (user.role === "admin") return "write"
      if (!user.permissions || !Array.isArray(user.permissions)) return "none"
      
      const tabPermission = user.permissions.find((p) => p.tabId === tabId)
      return tabPermission?.permission || "none"
    },
    [user]
  )

  return (
    <AuthContext.Provider
      value={{
        user,
        users,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        addUser,
        updateUser,
        deleteUser,
        hasPermission,
        canAccessTab,
        getTabPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export { DEFAULT_PERMISSIONS }
