"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

// This reads the base URL set in the environment (e.g., http://10.100.23.164:5000)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
// -------------------------------------------------------------

// --- ADAPTED INTERFACES TO MATCH FLASK BACKEND ---
interface User {
  id: number // Matches db.Column(db.Integer)
  email: string
  username: string // Matches backend field name
  role: "ADMIN" | "SALES" | "FINANCE" | "USER" // Matches backend casing
}

export function PermissionManagementModule() {
  const [users, setUsers] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [resetPasswordForm, setResetPasswordForm] = useState({
    username: "", // Changed from userName to reflect backend
    newPassword: "",
    confirmPassword: "",
  })
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  
  // Removed state and logic related to Module Assignments

  // --- ADAPTED: Load users from Backend API ---
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // API Call: Using absolute URL and including credentials
      const response = await fetch(`${API_BASE_URL}/api/admin/users`, {
            credentials: 'include' // CRITICAL: Sends session cookie
        }) 
      
      if (!response.ok) {
          // Check for 401/403 errors and parse JSON error response
          let errorMessage = 'Failed to fetch users.';
          try {
              const errorData = await response.json();
              // This handles 401/403 responses gracefully
              errorMessage = errorData.message || errorData.error || errorMessage;
          } catch (e) {
              // If parsing failed (e.g., received HTML from Nginx/system), use a generic error
              errorMessage = `Server returned status ${response.status} (Authentication or Server Error).`;
          }
          throw new Error(errorMessage)
      }

      const data = await response.json()
      // Backend returns { success: true, users: [...] }
      setUsers(data.users as User[]) 

    } catch (err: any) {
      setError(err.message || "Failed to load user data from server.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // --- ADAPTED: Update role via Backend API ---
  const handleRoleChange = async (userId: number, newRole: string) => {
    try {
      setError(null)
      
      // API Call: Using absolute URL and including credentials
      const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/role`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
            credentials: 'include', // CRITICAL: Sends session cookie
          // Ensure role is sent in uppercase as required by backend service
          body: JSON.stringify({ role: newRole.toUpperCase() }), 
      })

      if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || `Failed to update role for user ${userId}.`)
      }

      // If successful, update the local state with the new role
      const updatedUsers = users.map((u) => 
          u.id === userId ? { ...u, role: newRole.toUpperCase() as User['role'] } : u
      )
      setUsers(updatedUsers)

      // Optional: Show success notification
      alert(`Role for user ${userId} updated successfully to ${newRole.toUpperCase()}`)

    } catch (err: any) {
      setError(err.message || "Failed to update role on server.")
      console.error(err)
    }
  }

  // --- ADAPTED: Reset password via Backend API ---
  const handleResetPasswordSubmit = async () => {
    try {
      if (!selectedUser) {
        setError("Please select a user")
        return
      }

      if (!resetPasswordForm.newPassword) {
        setError("Please enter a new password")
        return
      }

      if (resetPasswordForm.newPassword !== resetPasswordForm.confirmPassword) {
        setError("Passwords do not match")
        return
      }
      
      // API Call: Using absolute URL and including credentials
      const response = await fetch(`${API_BASE_URL}/api/admin/users/${selectedUser.id}/reset-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
            credentials: 'include', // CRITICAL: Sends session cookie
          // Key name MUST be 'new_password' to match backend service parameter
          body: JSON.stringify({ new_password: resetPasswordForm.newPassword }), 
      })

      if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to reset password.')
      }

      // Success Feedback and Cleanup
      alert(`Password reset successful for ${selectedUser.username}`)
      setResetPasswordForm({ username: "", newPassword: "", confirmPassword: "" })
      setSelectedUser(null)
      setFilteredUsers([])
      setError(null)
      
    } catch (err: any) {
      setError(err.message || "Failed to reset password on server.")
      console.error(err)
    }
  }

  // --- ADAPTED: User filtering logic uses 'username' ---
  const handleUserNameChange = (value: string) => {
    setResetPasswordForm({ ...resetPasswordForm, username: value })
    if (value.trim()) {
      // Filter by username, which is what the backend returns
      const filtered = users.filter((u) => u.username.toLowerCase().includes(value.toLowerCase()))
      setFilteredUsers(filtered)
      setShowUserDropdown(true)
    } else {
      setFilteredUsers([])
      setShowUserDropdown(false)
      setSelectedUser(null)
    }
  }

  const handleSelectUser = (user: User) => {
    setSelectedUser(user)
    setResetPasswordForm({ ...resetPasswordForm, username: user.username })
    setShowUserDropdown(false)
  }

  // Removed handleModuleToggle

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    )
  }

  // --- ADAPTED JSX TO USE USERNAME AND CORRECT ROLES ---
  return (
    <div className="space-y-6">
      {error && <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">{error}</div>}

      {/* User Management Section */}
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>View all users and manage their roles</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Current Role</TableHead>
                  <TableHead>Change Role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{user.role}</Badge>
                    </TableCell>
                    <TableCell>
                      {/* Select value uses user.role directly */}
                      <Select value={user.role} onValueChange={(value) => handleRoleChange(user.id, value)}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {/* Use uppercase values matching backend (ADMIN, SALES, FINANCE) */}
                          <SelectItem value="ADMIN">Admin</SelectItem>
                          <SelectItem value="SALES">Sales</SelectItem>
                          <SelectItem value="FINANCE">Finance</SelectItem>
                          {/* Keeping USER role option for completeness if needed */}
                          <SelectItem value="USER">User</SelectItem> 
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {users.length === 0 && (
            <div className="text-center py-8">
              <p className="text-slate-600">No users found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reset User Password Section */}
      <Card>
        <CardHeader>
          <CardTitle>Reset User Password</CardTitle>
          <CardDescription>Select a user and set a new password</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-w-md">
            {/* User Name Input with Autocomplete (using username) */}
            <div className="relative">
              <label className="block text-sm font-medium mb-2">Username</label>
              <Input
                type="text"
                placeholder="Type username..."
                value={resetPasswordForm.username}
                onChange={(e) => handleUserNameChange(e.target.value)}
                onFocus={() => {
                  if (resetPasswordForm.username.trim() && filteredUsers.length > 0) {
                    setShowUserDropdown(true)
                  }
                }}
              />
              {showUserDropdown && filteredUsers.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 border rounded-md bg-white shadow-lg z-10">
                  {filteredUsers.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => handleSelectUser(user)}
                      className="w-full text-left px-4 py-2 hover:bg-slate-100 border-b last:border-b-0"
                    >
                      <div className="font-medium">{user.username}</div>
                      <div className="text-sm text-slate-600">{user.email}</div>
                    </button>
                  ))}
                </div>
              )}
              {showUserDropdown && filteredUsers.length === 0 && resetPasswordForm.username.trim() && (
                <div className="absolute top-full left-0 right-0 mt-1 border rounded-md bg-white shadow-lg z-10 p-4 text-slate-600">
                  No users found
                </div>
              )}
            </div>

            {/* Selected User Display */}
            {selectedUser && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm">
                  <span className="font-medium">Selected:</span> {selectedUser.username} ({selectedUser.email})
                </p>
              </div>
            )}

            {/* New Password Input */}
            <div>
              <label className="block text-sm font-medium mb-2">New Password</label>
              <Input
                type="password"
                placeholder="Enter new password"
                value={resetPasswordForm.newPassword}
                onChange={(e) => setResetPasswordForm({ ...resetPasswordForm, newPassword: e.target.value })}
              />
            </div>

            {/* Confirm Password Input */}
            <div>
              <label className="block text-sm font-medium mb-2">Confirm Password</label>
              <Input
                type="password"
                placeholder="Confirm new password"
                value={resetPasswordForm.confirmPassword}
                onChange={(e) => setResetPasswordForm({ ...resetPasswordForm, confirmPassword: e.target.value })}
              />
            </div>

            {/* Submit Button */}
            <Button onClick={handleResetPasswordSubmit} className="w-full" disabled={!selectedUser}>
              Reset Password
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* NOTE: Module Assignments section removed as it has no backend support. */}
    </div>
  )
}