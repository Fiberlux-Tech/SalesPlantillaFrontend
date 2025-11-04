// src/features/admin/AdminUserManagement.tsx (Refactored)

"use client"

import { useState, useEffect } from "react"
import { UserListTable } from "./components/UserListTable"
import { ResetPasswordForm } from "./components/ResetPasswordForm"
import { getAllUsers, updateUserRole } from "./adminService"; // <-- 1. resetUserPassword removed

export interface User {
  id: number 
  email: string
  username: string 
  role: "ADMIN" | "SALES" | "FINANCE" | "USER"
}

export function PermissionManagementModule() {
  // --- STATE (CLEANED UP) ---
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // --- DATA FETCHING (Unchanged) ---
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const result = await getAllUsers();

      if (result.success && result.data) { // Check for data
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
      const result = await updateUserRole(userId, newRole);

      if (result.success) {
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

  // --- RENDER (CLEANED UP) ---
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
        
        {/* 2. Render the new smart component with simple props */}
        <ResetPasswordForm
          allUsers={users} // <-- PASS THE users STATE HERE
          onSuccess={(message) => {
            setError(null); // Clear any previous errors
            alert(message); // Show success
          }}
          onError={(message) => {
            setError(message); // Show new errors
          }}
        />
      </div>
    </div>
  )
}