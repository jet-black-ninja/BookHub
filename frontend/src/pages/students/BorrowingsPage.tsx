import { useAuth } from "@/context/AuthContext";
import type { Borrowing } from "@/schemas/library";
import { useEffect, useState } from "react";

export default function BorrowingsPage() {
  const { user } = useAuth();
  const [borrowings, setBorrowings] = useState<Borrowing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBorrowings = async () => {
      try {
        // TODO: Replace with your API endpoint (e.g. /api/borrowings/me)
        const res = await fetch(`http://localhost:4000/api/borrowings/${user?.id}`);
        const data = await res.json();
        setBorrowings(data);
      } catch (err) {
        console.error("Failed to fetch borrowings:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBorrowings();
  }, [user?.id]);

  if (loading) return <p>Loading your borrowings...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">My Borrowings</h1>

      {borrowings.length === 0 ? (
        <p className="text-gray-500">You haven’t borrowed any books yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {borrowings.map((b) => (
            <div
              key={b.id}
              className="bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition"
            >
              {b.BorrowedBook[0]?.book.coverImageUrl && (
                <img
                  src={b.BorrowedBook[0].book.coverImageUrl}
                  alt={b.BorrowedBook[0].book.title}
                  className="w-full h-40 object-cover rounded-lg mb-3"
                />
              )}

              <h3 className="text-lg font-semibold">
                {b.BorrowedBook[0]?.book.title}
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                by {b.BorrowedBook[0]?.book.author}
              </p>

              <div className="text-sm text-gray-700 space-y-1">
                <p>
                  <span className="font-medium">Borrowed On:</span>{" "}
                  {new Date(b.borrowDate).toLocaleDateString()}
                </p>
                <p>
                  <span className="font-medium">Due Date:</span>{" "}
                  {new Date(b.dueDate).toLocaleDateString()}
                </p>
                <p>
                  <span className="font-medium">Type:</span> {b.borrowType}
                </p>
                <p
                  className={`font-medium ${
                    b.status === "OVERDUE"
                      ? "text-red-600"
                      : b.status === "RETURNED"
                      ? "text-gray-500"
                      : "text-green-600"
                  }`}
                >
                  Status: {b.status}
                </p>
                {b.totalFine > 0 && (
                  <p className="text-red-600 font-medium">
                    Fine: ₹{b.totalFine.toFixed(2)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}