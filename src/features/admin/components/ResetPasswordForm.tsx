// src/features/admin/components/ResetPasswordForm.tsx
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { UserSearchInput } from "./UserSearchInput";
import { User } from "../AdminUserManagement";
import { getAllUsers, resetUserPassword } from "../adminService"; // <-- 1. Import services

// 2. Define a simpler props interface
interface ResetPasswordFormProps {
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export function ResetPasswordForm({ onSuccess, onError }: ResetPasswordFormProps) {
  // 3. All state now lives inside this component
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [form, setForm] = useState({
    usernameSearch: "",
    newPassword: "",
    confirmPassword: "",
  });

  // 4. Fetch users once on mount for the search
  useEffect(() => {
    const loadUsers = async () => {
      const result = await getAllUsers();
      if (result.success && result.data) {
        setAllUsers(result.data);
      }
    };
    loadUsers();
  }, []);

  // 5. All handlers are now internal
  const handleUserNameChange = (value: string) => {
    setForm({ ...form, usernameSearch: value });
    if (value.trim()) {
      const filtered = allUsers.filter((u) =>
        u.username.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredUsers(filtered);
      setShowUserDropdown(true);
    } else {
      setFilteredUsers([]);
      setShowUserDropdown(false);
      setSelectedUser(null);
    }
  };

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    setForm({ ...form, usernameSearch: user.username });
    setShowUserDropdown(false);
  };

  const handleResetPasswordSubmit = async () => {
    try {
      // Client-side validation
      if (!selectedUser) {
        onError("Please select a user");
        return;
      }
      if (!form.newPassword) {
        onError("Please enter a new password");
        return;
      }
      if (form.newPassword !== form.confirmPassword) {
        onError("Passwords do not match");
        return;
      }

      // Call service directly
      const result = await resetUserPassword(selectedUser.id, form.newPassword);

      if (result.success) {
        onSuccess(`Password reset successful for ${selectedUser.username}`);
        // Reset UI state on success
        setForm({ usernameSearch: "", newPassword: "", confirmPassword: "" });
        setSelectedUser(null);
        setFilteredUsers([]);
      } else {
        throw new Error(result.error);
      }
    } catch (err: any) {
      onError(err.message || "Failed to reset password.");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reset User Password</CardTitle>
        <CardDescription>Select a user and set a new password</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex space-x-4 items-end">
          <div className="flex-1">
            {/* 6. Pass internal state and handlers */}
            <UserSearchInput
              value={form.usernameSearch}
              onChange={handleUserNameChange}
              onFocus={() => {
                if (form.usernameSearch.trim() && filteredUsers.length > 0) {
                  setShowUserDropdown(true);
                }
              }}
              showDropdown={showUserDropdown}
              filteredUsers={filteredUsers}
              onSelectUser={handleSelectUser}
            />
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">New Password</label>
            <Input
              type="password"
              placeholder="Enter new password"
              value={form.newPassword}
              onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
            />
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Confirm Password</label>
            <Input
              type="password"
              placeholder="Confirm new password"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            />
          </div>

          <Button onClick={handleResetPasswordSubmit} disabled={!selectedUser}>
            Reset Password
          </Button>
        </div>

        {selectedUser && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md max-w-md">
            <p className="text-sm">
              <span className="font-medium">Selected:</span> {selectedUser.username} ({selectedUser.email})
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}