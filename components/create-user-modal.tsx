"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/lib/api"
import { ChevronDown, ChevronRight, Shield, ShieldCheck, Edit3, Eye, Search, CheckSquare, XSquare, User, Mail, Lock, UserCog, Settings, EyeOff } from "lucide-react"

interface Role {
  id: number
  name: string
}

interface Dashboard {
  id: number
  name: string
}

interface Module {
  id: number
  name: string
  dashboard_id: number
}

interface Action {
  id: number
  name: string
}

interface ModulePermission {
  moduleId: number
  actionIds: number[]
}

interface UserFormData {
  name: string
  email: string
  password: string
  confirmPassword: string
  roleId: number | null
  isSuperAdmin: boolean
  dashboardIds: number[]
  modulePermissions: ModulePermission[]
}

interface CreateUserModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function CreateUserModal({ open, onClose, onSuccess }: CreateUserModalProps) {
  const [roles, setRoles] = useState<Role[]>([])
  const [dashboards, setDashboards] = useState<Dashboard[]>([])
  const [modules, setModules] = useState<Module[]>([])
  const [actions, setActions] = useState<Action[]>([])
  const [expandedDashboards, setExpandedDashboards] = useState<Set<number>>(new Set())
  const [searchQuery, setSearchQuery] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  const [formData, setFormData] = useState<UserFormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    roleId: null,
    isSuperAdmin: false,
    dashboardIds: [],
    modulePermissions: [],
  })

  const { toast } = useToast()

  const getRoleIcon = (roleName: string) => {
    const name = roleName.toLowerCase()
    if (name.includes('super admin')) return <ShieldCheck className="h-4 w-4 text-purple-600" />
    if (name.includes('admin')) return <Shield className="h-4 w-4 text-red-600" />
    if (name.includes('editor')) return <Edit3 className="h-4 w-4 text-blue-600" />
    return <Eye className="h-4 w-4 text-gray-600" />
  }

  const getRoleColor = (roleName: string) => {
    const name = roleName.toLowerCase()
    if (name.includes('super admin')) return 'bg-purple-50 text-purple-700 hover:bg-purple-100'
    if (name.includes('admin')) return 'bg-red-50 text-red-700 hover:bg-red-100'
    if (name.includes('editor')) return 'bg-blue-50 text-blue-700 hover:bg-blue-100'
    return 'bg-gray-50 text-gray-700 hover:bg-gray-100'
  }

  const getActionBadge = (actionName: string) => {
    return actionName.charAt(0).toUpperCase() + actionName.slice(1).toLowerCase()
  }

  const getPermissionCount = (dashboardId: number) => {
    const dashboardModules = modules.filter(m => m.dashboard_id === dashboardId)
    const totalActions = dashboardModules.length * actions.length
    const selectedActions = formData.modulePermissions
      .filter(mp => dashboardModules.some(m => m.id === mp.moduleId))
      .reduce((sum, mp) => sum + mp.actionIds.length, 0)
    return { selected: selectedActions, total: totalActions }
  }

  const selectAllPermissions = () => {
    const allDashboardIds = dashboards.map(d => d.id)
    const allModulePermissions = modules.map(m => ({
      moduleId: m.id,
      actionIds: actions.map(a => a.id)
    }))
    setFormData(prev => ({
      ...prev,
      dashboardIds: allDashboardIds,
      modulePermissions: allModulePermissions
    }))
  }

  const clearAllPermissions = () => {
    setFormData(prev => ({
      ...prev,
      dashboardIds: [],
      modulePermissions: []
    }))
  }

  const handleModuleToggle = (moduleId: number) => {
    const isSelected = formData.modulePermissions.some(mp => mp.moduleId === moduleId)
    if (isSelected) {
      setFormData(prev => ({
        ...prev,
        modulePermissions: prev.modulePermissions.filter(mp => mp.moduleId !== moduleId)
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        modulePermissions: [...prev.modulePermissions, { moduleId, actionIds: actions.map(a => a.id) }]
      }))
    }
  }

  const getModuleCheckState = (moduleId: number) => {
    const module = formData.modulePermissions.find(mp => mp.moduleId === moduleId)
    if (!module || module.actionIds.length === 0) return 'unchecked'
    if (module.actionIds.length === actions.length) return 'checked'
    return 'indeterminate'
  }

  const filteredDashboards = dashboards.filter(d => {
    if (!searchQuery) return true
    const matchesDashboard = d.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesModule = modules.some(m => 
      m.dashboard_id === d.id && m.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    return matchesDashboard || matchesModule
  })

  useEffect(() => {
    if (open) {
      loadMetadata()
    }
  }, [open])

  const loadMetadata = async () => {
    try {
      const [rolesRes, dashboardsRes, modulesRes, actionsRes] = await Promise.all([
        api.get("/meta/roles"),
        api.get("/meta/dashboards"),
        api.get("/meta/modules"),
        api.get("/meta/actions"),
      ])
      setRoles(rolesRes.data.data.filter((role: Role) => !role.name.toLowerCase().includes('super admin')))
      setDashboards(dashboardsRes.data.data)
      setModules(modulesRes.data.data)
      setActions(actionsRes.data.data)
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to load metadata",
        description: error?.response?.data?.message || error.message,
      })
    }
  }

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const validatePassword = (password: string) => {
    return password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password)
  }

  const handleCreateUser = async () => {
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword || !formData.roleId) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fill all required fields",
      })
      return
    }

    if (!validateEmail(formData.email)) {
      toast({
        variant: "destructive",
        title: "Invalid Email",
        description: "Please enter a valid email address",
      })
      return
    }

    if (!validatePassword(formData.password)) {
      toast({
        variant: "destructive",
        title: "Weak Password",
        description: "Password must be at least 8 characters with uppercase, lowercase, and number",
      })
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        variant: "destructive",
        title: "Password Mismatch",
        description: "Passwords do not match",
      })
      return
    }

    setIsCreating(true)
    try {
      const { confirmPassword, ...payload } = formData
      await api.post("/auth/register", payload)
      toast({
        title: "Success",
        description: "User created successfully",
      })
      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        roleId: null,
        isSuperAdmin: false,
        dashboardIds: [],
        modulePermissions: [],
      })
      onSuccess()
      onClose()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to create user",
        description: error?.response?.data?.message || error.message,
      })
    } finally {
      setIsCreating(false)
    }
  }

  const handleDashboardToggle = (dashboardId: number) => {
    const isSelected = formData.dashboardIds.includes(dashboardId)
    
    if (isSelected) {
      const modulesInDashboard = modules
        .filter((m) => m.dashboard_id === dashboardId)
        .map((m) => m.id)
      
      setFormData((prev) => ({
        ...prev,
        dashboardIds: prev.dashboardIds.filter((id) => id !== dashboardId),
        modulePermissions: prev.modulePermissions.filter(
          (mp) => !modulesInDashboard.includes(mp.moduleId)
        ),
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        dashboardIds: [...prev.dashboardIds, dashboardId],
      }))
    }
  }

  const handleModuleActionToggle = (moduleId: number, actionId: number) => {
    setFormData((prev) => {
      const existingModule = prev.modulePermissions.find((m) => m.moduleId === moduleId)
      
      if (existingModule) {
        const hasAction = existingModule.actionIds.includes(actionId)
        const updatedPermissions = prev.modulePermissions
          .map((m) =>
            m.moduleId === moduleId
              ? {
                  ...m,
                  actionIds: hasAction
                    ? m.actionIds.filter((id) => id !== actionId)
                    : [...m.actionIds, actionId],
                }
              : m
          )
          .filter((m) => m.actionIds.length > 0)
        
        return { ...prev, modulePermissions: updatedPermissions }
      } else {
        return {
          ...prev,
          modulePermissions: [...prev.modulePermissions, { moduleId, actionIds: [actionId] }],
        }
      }
    })
  }

  const isActionSelected = (moduleId: number, actionId: number) => {
    const module = formData.modulePermissions.find((m) => m.moduleId === moduleId)
    return module?.actionIds.includes(actionId) || false
  }

  const toggleDashboard = (dashboardId: number) => {
    setExpandedDashboards((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(dashboardId)) {
        newSet.delete(dashboardId)
      } else {
        newSet.add(dashboardId)
      }
      return newSet
    })
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[100vw] max-w-[1400px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New User</DialogTitle>
          <DialogDescription>Add a new user with role and permissions</DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          {/* User Information Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border">
              <User className="h-4 w-4 text-blue-600" />
              <h3 className="font-semibold text-sm">User Information</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Doe"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john@hospital.org"
                />
              </div>
            </div>
          </div>

          {/* Set Password Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border">
              <Lock className="h-4 w-4 text-green-600" />
              <h3 className="font-semibold text-sm">Set Password</h3>
              <span className="text-xs text-muted-foreground ml-auto">Min 8 chars, uppercase, lowercase, number</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="password">Password *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Enter password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="Re-enter password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Role Assignment Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border">
              <UserCog className="h-4 w-4 text-purple-600" />
              <h3 className="font-semibold text-sm">Role Assignment</h3>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role">Role *</Label>
              <Select
                value={formData.roleId?.toString() || ""}
                onValueChange={(v) => {
                  const roleId = Number(v)
                  const selectedRole = roles.find(r => r.id === roleId)
                  const isSuperAdmin = selectedRole?.name.toLowerCase().includes('super admin') || false
                  setFormData({ ...formData, roleId, isSuperAdmin })
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem 
                      key={role.id} 
                      value={String(role.id)} 
                      className={`${getRoleColor(role.name)} cursor-pointer my-1 rounded-md`}
                    >
                      <div className="flex items-center gap-2">
                        {getRoleIcon(role.name)}
                        <span>{role.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Permissions Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border">
              <Settings className="h-4 w-4 text-orange-600" />
              <h3 className="font-semibold text-sm">Dashboard & Module Permissions</h3>
              <div className="flex gap-2 ml-auto">
                {formData.dashboardIds.length === 0 && formData.modulePermissions.length === 0 ? (
                  <Button variant="outline" size="sm" onClick={selectAllPermissions}>
                    <CheckSquare className="h-3 w-3 mr-1" />
                    Select All
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" onClick={clearAllPermissions}>
                    <XSquare className="h-3 w-3 mr-1" />
                    Clear All
                  </Button>
                )}
              </div>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search dashboard or module..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="rounded-lg border border-border/50 bg-muted/20 max-h-[350px] overflow-y-auto">
              {filteredDashboards.map((dashboard) => {
                const dashboardModules = modules.filter((m) => m.dashboard_id === dashboard.id)
                const isExpanded = expandedDashboards.has(dashboard.id)
                const permCount = getPermissionCount(dashboard.id)
                
                return (
                  <div key={dashboard.id} className={`border-b border-border/30 last:border-0 ${isExpanded ? 'bg-accent/30' : ''}`}>
                    <div className="flex items-center justify-between px-3 py-2 hover:bg-accent/50 transition-colors">
                      <div className="flex items-center gap-2 flex-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-5 w-5 p-0"
                          onClick={() => toggleDashboard(dashboard.id)}
                        >
                          {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                        </Button>
                        <Checkbox
                          id={`dashboard-${dashboard.id}`}
                          checked={formData.dashboardIds.includes(dashboard.id)}
                          onCheckedChange={() => handleDashboardToggle(dashboard.id)}
                        />
                        <Label htmlFor={`dashboard-${dashboard.id}`} className="cursor-pointer font-medium text-sm">
                          {dashboard.name}
                        </Label>
                      </div>
                      <span className="text-xs text-muted-foreground">({permCount.selected}/{permCount.total})</span>
                    </div>
                    
                    {isExpanded && formData.dashboardIds.includes(dashboard.id) && (
                      <div className="pl-10 pr-3 pb-2 space-y-1">
                        {dashboardModules.map((module) => {
                          const checkState = getModuleCheckState(module.id)
                          
                          return (
                            <div key={module.id} className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-accent/40">
                              <div className="flex items-center gap-2">
                                <Checkbox
                                  id={`module-${module.id}`}
                                  checked={checkState === 'checked'}
                                  ref={(el: HTMLButtonElement | null) => {
                                    if (el) (el as any).indeterminate = checkState === 'indeterminate'
                                  }}
                                  onCheckedChange={() => handleModuleToggle(module.id)}
                                />
                                <Label htmlFor={`module-${module.id}`} className="text-sm cursor-pointer">
                                  {module.name}
                                </Label>
                              </div>
                              <div className="flex gap-1">
                                {actions.map((action) => (
                                  <button
                                    key={action.id}
                                    type="button"
                                    title={action.name}
                                    onClick={() => handleModuleActionToggle(module.id, action.id)}
                                    className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                                      isActionSelected(module.id, action.id)
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                    }`}
                                  >
                                    {getActionBadge(action.name)}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isCreating}>
            Cancel
          </Button>
          <Button onClick={handleCreateUser} disabled={isCreating} style={{ backgroundColor: "#3b82f6" }}>
            {isCreating ? (
              <>
                <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Creating...
              </>
            ) : (
              "Create User"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
