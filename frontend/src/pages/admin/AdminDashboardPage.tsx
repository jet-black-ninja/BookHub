import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

interface SummaryStats {
  totalBooks: number;
  totalStudents: number;
  totalBorrowings: number;
  totalFines: number;
}

export const AdminDashboardPage = () => {
  const [stats, setStats] = useState<SummaryStats>({
    totalBooks: 0,
    totalStudents: 0,
    totalBorrowings: 0,
    totalFines: 0,
  });

  useEffect(() => {
    // Replace with your actual API call later
    const fetchStats = async () => {
      const data = {
        totalBooks: 120,
        totalStudents: 85,
        totalBorrowings: 35,
        totalFines: 5000,
      };
      setStats(data);
    };

    fetchStats();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Admin Dashboard</h1>
      <p className="text-gray-600 mb-6">Overview of your library system.</p>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="p-4 border rounded-lg shadow-sm">
          <h2 className="text-lg font-medium">Books</h2>
          <p className="text-2xl font-bold">{stats.totalBooks}</p>
        </div>

        <div className="p-4 border rounded-lg shadow-sm">
          <h2 className="text-lg font-medium">Students</h2>
          <p className="text-2xl font-bold">{stats.totalStudents}</p>
        </div>

        <div className="p-4 border rounded-lg shadow-sm">
          <h2 className="text-lg font-medium">Borrowings</h2>
          <p className="text-2xl font-bold">{stats.totalBorrowings}</p>
        </div>

        <div className="p-4 border rounded-lg shadow-sm">
          <h2 className="text-lg font-medium">Total Fines (₹)</h2>
          <p className="text-2xl font-bold">{stats.totalFines}</p>
        </div>
      </div>

      {/* Quick Navigation */}
      <h2 className="text-xl font-semibold mb-3">Quick Links</h2>
      <div className="flex flex-wrap gap-4">
        <Link
          to="/admin/books"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          Manage Books
        </Link>
        <Link
          to="/admin/borrowings"
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
        >
          View Borrowings
        </Link>
        <Link
          to="/admin/users"
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition"
        >
          Manage Users
        </Link>
      </div>
    </div>
  );
};
