import type { Borrowing } from "@/schemas/library";
import { useEffect, useState } from "react";

export default function BorrowingsPage() {
  const [borrowings, setBorrowings] = useState<Borrowing[]>([]);
  const [loading, setLoading] = useState(true);

  const BASE_URL = import.meta.env.VITE_BACKEND_URL;

  // Fetch all borrowings
  const fetchBorrowings = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${BASE_URL}/student/my-borrowings`, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setBorrowings(data.data || []);
    } catch (err) {
      console.error("Failed to fetch borrowings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBorrowings();
  }, []);

  // Handle returning a book
  const handleReturnBook = async (borrowingId: string) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        `${BASE_URL}/student/return/${borrowingId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();
      if (data.success) {
        alert("Book returned successfully");
        fetchBorrowings(); // refresh borrowings
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error("Failed to return book:", err);
    }
  };

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
              <div className="mb-2 text-sm text-gray-700 space-y-1">
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
                  className={`font-medium ${b.status === "OVERDUE"
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

              {/* Loop over borrowed books */}
              {b.BorrowedBook.map((bb) => (
                <div key={bb.id} className="mb-4 border p-2 rounded-lg">
                  {bb.book.coverImageUrl && (
                    <img
                      src={bb.book.coverImageUrl}
                      alt={bb.book.title}
                      className="w-full h-40 object-cover rounded-lg mb-2"
                    />
                  )}
                  <h3 className="text-lg font-semibold">{bb.book.title}</h3>
                  <p className="text-sm text-gray-600">by {bb.book.author}</p>

                  <button
                    disabled={bb.returned}
                    className={`mt-2 w-full px-3 py-1 rounded ${bb.returned
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700 text-white"
                      }`}
                    onClick={() => handleReturnBook(b.id)}
                  >
                    {bb.returned ? "Returned" : "Return Book"}
                  </button>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
