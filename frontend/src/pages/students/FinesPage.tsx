
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
  BorrowedBook: {
    book: {
      title: string;
      author: string;
      coverImageUrl: string | null;
      price: number;
    };
  }[];
}

export default function FinesPage() {
  const { user } = useAuth();
  const [fines, setFines] = useState<BorrowingFine[]>([]);
  const [loading, setLoading] = useState(true);
  const [fineConfig, setFineConfig] = useState({
    dailyFine: 50,
    lostBookMultiplier: 2,
    overdueThreshold: 30,
  });

  useEffect(() => {
    const fetchFines = async () => {
      try {
        // TODO: Replace these with your real backend endpoints
        const [borrowRes, configRes] = await Promise.all([
          fetch(`http://localhost:4000/api/fines/${user?.id}`),
          fetch(`http://localhost:4000/api/fine-config`),
        ]);

        const borrowData = await borrowRes.json();
        const configData = await configRes.json();

        setFines(borrowData);
        setFineConfig(configData);
      } catch (err) {
        console.error("Failed to fetch fines:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFines();
  }, [user?.id]);

  if (loading) return <p>Loading your fines...</p>;

  const totalFine = fines.reduce((sum, f) => sum + f.totalFine, 0);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">My Fines 💸</h1>

      {/* Fine Summary Card */}
      <div className="bg-white p-4 rounded-xl shadow-sm border mb-6">
        <h2 className="text-lg font-semibold mb-1">Fine Configuration</h2>
        <p className="text-sm text-gray-600">
          ₹{fineConfig.dailyFine}/day late fee | Missing = {fineConfig.lostBookMultiplier}× book price | Overdue threshold: {fineConfig.overdueThreshold} days
        </p>
      </div>

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
                    {fine.BorrowedBook[0]?.book.coverImageUrl && (
                      <img
                        src={fine.BorrowedBook[0].book.coverImageUrl}
                        alt={fine.BorrowedBook[0].book.title}
                        className="w-10 h-14 object-cover rounded-md"
                      />
                    )}
                    <div>
                      <p className="font-medium">
                        {fine.BorrowedBook[0]?.book.title}
                      </p>
                      <p className="text-sm text-gray-500">
                        {fine.BorrowedBook[0]?.book.author}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="p-3">
                  {new Date(fine.borrowDate).toLocaleDateString()}
                </td>
                <td className="p-3">
                  {new Date(fine.dueDate).toLocaleDateString()}
                </td>
                <td
                  className={`p-3 font-medium ${
                    fine.status === "OVERDUE"
                      ? "text-red-600"
                      : fine.status === "RETURNED"
                      ? "text-gray-500"
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
