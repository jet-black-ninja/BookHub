import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

interface SummaryStats {
  totalBooks: number;
  totalDeletedBooks: number;
}

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

export const AdminDashboardPage = () => {
  const [stats, setStats] = useState<SummaryStats>({
    totalBooks: 0,
    totalDeletedBooks: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const booksRes = await fetch(`${BASE_URL}/books?page=1&limit=1`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const booksData = await booksRes.json();
        const totalBooks = booksData.data?.pagination?.totalBooks || 0;

        const deletedRes = await fetch(`${BASE_URL}/books?page=1&limit=1&includeDeleted=true`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const deletedData = await deletedRes.json();
        const totalDeletedBooks = deletedData.data?.pagination?.totalBooks || 0;

        setStats({ totalBooks, totalDeletedBooks });
      } catch (err) {
        console.error("Failed to fetch admin stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <p>Loading dashboard...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Admin Dashboard</h1>
      <p className="text-gray-600 mb-6">Overview of your library system.</p>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="p-4 border rounded-lg shadow-sm">
          <h2 className="text-lg font-medium">Total Books</h2>
          <p className="text-2xl font-bold">{stats.totalBooks}</p>
        </div>

        <div className="p-4 border rounded-lg shadow-sm">
          <h2 className="text-lg font-medium">Deleted Books</h2>
          <p className="text-2xl font-bold">{stats.totalDeletedBooks}</p>
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
      </div>
    </div>
  );
};
