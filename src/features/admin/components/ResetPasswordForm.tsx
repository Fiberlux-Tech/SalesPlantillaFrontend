import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { UserSearchInput } from "./UserSearchInput" // Import the new component
import { User } from "../AdminUserManagement"

// Define the complex props this component needs
interface ResetPasswordFormProps {
  resetPasswordForm: {
    username: string;
    newPassword: string;
    confirmPassword: string;
  };
  setResetPasswordForm: React.Dispatch<React.SetStateAction<any>>;
  handleUserNameChange: (value: string) => void;
  showUserDropdown: boolean;
  setShowUserDropdown: (show: boolean) => void;
  filteredUsers: User[];
  handleSelectUser: (user: User) => void;
  selectedUser: User | null;
  handleResetPasswordSubmit: () => void;
}

export function ResetPasswordForm({
  resetPasswordForm,
  setResetPasswordForm,
  handleUserNameChange,
  showUserDropdown,
  setShowUserDropdown,
  filteredUsers,
  handleSelectUser,
  selectedUser,
  handleResetPasswordSubmit
}: ResetPasswordFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Reset User Password</CardTitle>
        <CardDescription>Select a user and set a new password</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-w-md">
          
          {/* Here we use the new UserSearchInput component */}
          <UserSearchInput
            value={resetPasswordForm.username}
            onChange={handleUserNameChange}
            onFocus={() => {
              if (resetPasswordForm.username.trim() && filteredUsers.length > 0) {
                setShowUserDropdown(true)
              }
            }}
            showDropdown={showUserDropdown}
            filteredUsers={filteredUsers}
            onSelectUser={handleSelectUser}
          />

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
  )
}