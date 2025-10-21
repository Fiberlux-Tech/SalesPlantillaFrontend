"use client"

import { useState, useEffect } from "react"
import { UserListTable } from "./components/UserListTable"
import { ResetPasswordForm } from "./components/ResetPasswordForm"

// This reads the base URL set in the environment
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

// --- INTERFACES ---
// We can export this to share it with child components
export interface User {
  id: number 
  email: string
  username: string 
  role: "ADMIN" | "SALES" | "FINANCE" | "USER"
}

export function PermissionManagementModule() {
  // --- STATE ---
  // All state is kept here in the main component
  const [users, setUsers] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const [resetPasswordForm, setResetPasswordForm] = useState({
    username: "", 
    newPassword: "",
    confirmPassword: "",
  })

  // --- DATA FETCHING ---
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`${API_BASE_URL}/api/admin/users`, {
          credentials: 'include' 
        }) 
      
      if (!response.ok) {
          let errorMessage = 'Failed to fetch users.';
          try {
              const errorData = await response.json();
              errorMessage = errorData.message || errorData.error || errorMessage;
          } catch (e) {
              errorMessage = `Server returned status ${response.status}.`;
          }
          throw new Error(errorMessage)
      }

      const data = await response.json()
      setUsers(data.users as User[]) 
    } catch (err: any) {
      setError(err.message || "Failed to load user data.")
    } finally {
      setLoading(false)
    }
  }

  // --- EVENT HANDLERS ---
  // All logic handlers also stay in the parent
  const handleRoleChange = async (userId: number, newRole: string) => {
    try {
      setError(null)
      const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/role`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include', 
          body: JSON.stringify({ role: newRole.toUpperCase() }), 
      })

      if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || `Failed to update role.`)
      }

      const updatedUsers = users.map((u) => 
          u.id === userId ? { ...u, role: newRole.toUpperCase() as User['role'] } : u
      )
      setUsers(updatedUsers)
      alert(`Role updated successfully to ${newRole.toUpperCase()}`)
    } catch (err: any) {
      setError(err.message || "Failed to update role.")
    }
  }

  const handleResetPasswordSubmit = async () => {
    try {
      if (!selectedUser) {
        setError("Please select a user");
        return;
      }
      if (!resetPasswordForm.newPassword) {
        setError("Please enter a new password");
        return;
      }
      if (resetPasswordForm.newPassword !== resetPasswordForm.confirmPassword) {
        setError("Passwords do not match");
        return;
      }
      
      const response = await fetch(`${API_BASE_URL}/api/admin/users/${selectedUser.id}/reset-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include', 
          body: JSON.stringify({ new_password: resetPasswordForm.newPassword }), 
      })

      if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to reset password.')
      }

      alert(`Password reset successful for ${selectedUser.username}`)
      setResetPasswordForm({ username: "", newPassword: "", confirmPassword: "" })
      setSelectedUser(null)
      setFilteredUsers([])
      setError(null)
    } catch (err: any) {
      setError(err.message || "Failed to reset password.")
    }
  }

  const handleUserNameChange = (value: string) => {
    setResetPasswordForm({ ...resetPasswordForm, username: value })
    if (value.trim()) {
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


  // --- RENDER ---
  if (loading) {
    return (
      <div className="container mx-auto px-8 py-8">
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-8 py-8">
      <div className="space-y-6">
        {error && <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">{error}</div>}

        {/* Instead of all that JSX, we just render the child component 
          and pass it the props it needs.
        */}
        <UserListTable 
          users={users} 
          onRoleChange={handleRoleChange} 
        />
        
        {/* Same for the reset password form */}
        <ResetPasswordForm
          resetPasswordForm={resetPasswordForm}
          setResetPasswordForm={setResetPasswordForm}
          handleUserNameChange={handleUserNameChange}
          showUserDropdown={showUserDropdown}
          filteredUsers={filteredUsers}
          handleSelectUser={handleSelectUser}
          selectedUser={selectedUser}
          handleResetPasswordSubmit={handleResetPasswordSubmit}
          setShowUserDropdown={setShowUserDropdown}
        />
      </div>
    </div>
  )
}