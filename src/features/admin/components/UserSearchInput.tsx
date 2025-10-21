import { Input } from "@/components/ui/input"
import { User } from "../AdminUserManagement"

// Define this component's props
interface UserSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onFocus: () => void;
  showDropdown: boolean;
  filteredUsers: User[];
  onSelectUser: (user: User) => void;
}

export function UserSearchInput({
  value,
  onChange,
  onFocus,
  showDropdown,
  filteredUsers,
  onSelectUser
}: UserSearchInputProps) {
  return (
    <div className="relative">
      <label className="block text-sm font-medium mb-2">Username</label>
      <Input
        type="text"
        placeholder="Type username..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
      />
      {showDropdown && filteredUsers.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 border rounded-md bg-white shadow-lg z-10">
          {filteredUsers.map((user) => (
            <button
              key={user.id}
              onClick={() => onSelectUser(user)}
              className="w-full text-left px-4 py-2 hover:bg-slate-100 border-b last:border-b-0"
           >
              <div className="font-medium">{user.username}</div>
              <div className="text-sm text-slate-600">{user.email}</div>
            </button>
          ))}
        </div>
      )}
      {showDropdown && filteredUsers.length === 0 && value.trim() && (
        <div className="absolute top-full left-0 right-0 mt-1 border rounded-md bg-white shadow-lg z-10 p-4 text-slate-600">
          No users found
        </div>
      )}
    </div>
  )
}