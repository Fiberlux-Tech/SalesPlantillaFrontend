// src/features/admin/AdminUserManagement.tsx (Refactored)

"use client"

import { useState, useEffect } from "react"
import { UserListTable } from "./components/UserListTable"
import { ResetPasswordForm } from "./components/ResetPasswordForm"
// Import the new service functions
import { getAllUsers, updateUserRole, resetUserPassword } from "./adminService";


// NOTE: The User interface remains here as it defines the data structure for this module.
export interface User {
  id: number 
  email: string
  username: string 
  role: "ADMIN" | "SALES" | "FINANCE" | "USER"
}

// NOTE: We remove the `const API_BASE_URL` definition.

export function PermissionManagementModule() {
  // --- STATE (KEPT) ---
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

  // --- DATA FETCHING (CLEANED UP) ---
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Use the service function
      const result = await getAllUsers();

      if (result.success) {
        setUsers(result.data as User[]) 
      } else {
        throw new Error(result.error);
      }

    } catch (err: any) {
      setError(err.message || "Failed to load user data.")
    } finally {
      setLoading(false)
    }
  }

  // --- EVENT HANDLERS (CLEANED UP) ---
  const handleRoleChange = async (userId: number, newRole: string) => {
    try {
      setError(null)
      // Use the service function
      const result = await updateUserRole(userId, newRole);

      if (result.success) {
        // Update local state based on successful API call
        const updatedUsers = users.map((u) => 
            u.id === userId ? { ...u, role: newRole.toUpperCase() as User['role'] } : u
        )
        setUsers(updatedUsers)
        alert(`Role updated successfully to ${newRole.toUpperCase()}`)
      } else {
        throw new Error(result.error)
      }
    } catch (err: any) {
      setError(err.message || "Failed to update role.")
    }
  }

  const handleResetPasswordSubmit = async () => {
    try {
      setError(null);
      // Client-side validation logic remains here
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
      
      // Use the service function
      const result = await resetUserPassword(selectedUser.id, resetPasswordForm.newPassword);

      if (result.success) {
        alert(`Password reset successful for ${selectedUser.username}`)
        // Reset UI state on success
        setResetPasswordForm({ username: "", newPassword: "", confirmPassword: "" })
        setSelectedUser(null)
        setFilteredUsers([])
        setError(null)
      } else {
        throw new Error(result.error)
      }
    } catch (err: any) {
      setError(err.message || "Failed to reset password.")
    }
  }

  // The rest of the handlers (handleUserNameChange, handleSelectUser) and the render method remain the same.

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


  // --- RENDER (KEPT) ---
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

        <UserListTable 
          users={users} 
          onRoleChange={handleRoleChange} 
        />
        
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