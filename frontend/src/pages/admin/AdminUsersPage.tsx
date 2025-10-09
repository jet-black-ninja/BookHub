import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

export interface User {
  id: string;
  fullName: string;
  email: string;
  universityId: string;
  role: "ADMIN" | "STUDENT";
  isDeleted?: boolean;
}

export const AdminUsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    // 🔹 Replace with actual API call
    setUsers([
      { id: "STU1", fullName: "Aarav Mehta", email: "aarav@example.com", role: "STUDENT", universityId: "U001" },
      { id: "STU2", fullName: "Riya Sharma", email: "riya@example.com", role: "STUDENT", universityId: "U002" },
      { id: "ADM1", fullName: "Admin User", email: "admin@example.com", role: "ADMIN", universityId: "U000" },
    ]);
  }, []);

  const handleRoleChange = (userId: string) => {
    setUsers(prev =>
      prev.map(u =>
        u.id === userId
          ? { ...u, role: u.role === "ADMIN" ? "STUDENT" : "ADMIN" }
          : u
      )
    );
    toast.success("Role updated successfully!"); // optional notification
  };

  const handleDelete = (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    setUsers(prev => prev.filter(u => u.id !== userId));
    toast.success("User deleted!");
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Manage Users</h1>
        <p className="text-gray-600 mt-2">View and manage student accounts.</p>
      </div>

      {users.length === 0 ? (
        <p className="text-gray-500">No users found.</p>
      ) : (
        <table className="w-full border rounded-lg shadow-sm text-left">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">University ID</th>
              <th className="p-3">Role</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-t hover:bg-gray-50">
                <td className="p-3 font-medium text-gray-800">{u.fullName}</td>
                <td className="p-3">{u.email}</td>
                <td className="p-3">{u.universityId}</td>
                <td className="p-3">{u.role}</td>
                <td className="p-3 flex gap-2">
                  <button
                    className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                    onClick={() => handleDelete(u.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};
