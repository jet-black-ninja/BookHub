import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

interface BorrowingFine {
  id: string;
  borrowDate: string;
  dueDate: string;
  returnDate: string | null;
  totalFine: number;
  status: "ACTIVE" | "RETURNED" | "OVERDUE" | "LOST";
  borrowType: "INDIVIDUAL" | "GROUP";
  book: {
    title: string;
    author: string;
    coverImageUrl: string | null;
    price?: number;
  };
  students?: { fullName: string; email: string }[];
}

export default function FinesPage() {
  const { user } = useAuth();
  const [fines, setFines] = useState<BorrowingFine[]>([]);
  const [loading, setLoading] = useState(true);

  const BASE_URL = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchFines = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${BASE_URL}/student/my-borrowings`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        // Filter only borrowings with fines (OVERDUE or LOST)
        const borrowingsWithFines = (data.data || []).filter(
          (b: BorrowingFine) => b.status === "OVERDUE" || b.status === "LOST"
        );
        setFines(borrowingsWithFines);
      } catch (err) {
        console.error("Failed to fetch borrowings:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) fetchFines();
  }, [user?.id]);

  if (loading) return <p>Loading your fines...</p>;

  // Total fine sum
  const totalFine = fines.reduce((sum, f) => sum + (f.totalFine || 0), 0);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">My Fines 💸</h1>

      {/* Total Fine */}
      <div className="bg-red-50 border border-red-200 p-4 rounded-xl mb-6">
        <p className="text-red-600 font-semibold text-lg">
          Total Pending Fine: ₹{totalFine.toFixed(2)}
        </p>
      </div>

      {/* Fine Details Table */}
      {fines.length === 0 ? (
        <p className="text-gray-500">No fines yet! 🎉</p>
      ) : (
        <table className="w-full border rounded-lg text-left bg-white shadow-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3">Book</th>
              <th className="p-3">Borrowed On</th>
              <th className="p-3">Due Date</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Fine (₹)</th>
            </tr>
          </thead>
          <tbody>
            {fines.map((fine) => (
              <tr key={fine.id} className="border-t hover:bg-gray-50">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    {fine.book.coverImageUrl && (
                      <img
                        src={fine.book.coverImageUrl}
                        alt={fine.book.title}
                        className="w-10 h-14 object-cover rounded-md"
                      />
                    )}
                    <div>
                      <p className="font-medium">{fine.book.title}</p>
                      <p className="text-sm text-gray-500">{fine.book.author}</p>
                    </div>
                  </div>
                </td>
                <td className="p-3">{new Date(fine.borrowDate).toLocaleDateString()}</td>
                <td className="p-3">{new Date(fine.dueDate).toLocaleDateString()}</td>
                <td
                  className={`p-3 font-medium ${
                    fine.status === "OVERDUE"
                      ? "text-red-600"
                      : fine.status === "LOST"
                      ? "text-gray-800"
                      : "text-green-600"
                  }`}
                >
                  {fine.status}
                </td>
                <td className="p-3 text-right font-semibold text-red-600">
                  ₹{fine.totalFine.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
