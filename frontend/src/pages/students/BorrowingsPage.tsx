import type { Borrowing } from "@/schemas/library";
import { useEffect, useState, useCallback } from "react";
import { ReturnBookModal } from "@/components/ReturnBookModal";

export default function BorrowingsPage() {
  const [borrowings, setBorrowings] = useState<Borrowing[]>([]);
  const [loading, setLoading] = useState(true);
  const [returnModal, setReturnModal] = useState<{
    isOpen: boolean;
    borrowingId: string;
    bookTitle: string;
  }>({
    isOpen: false,
    borrowingId: "",
    bookTitle: "",
  });

  const BASE_URL = import.meta.env.VITE_BACKEND_URL;

  // Fetch all borrowings
  const fetchBorrowings = useCallback(async () => {
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
  }, [BASE_URL]);

  useEffect(() => {
    fetchBorrowings();
  }, [fetchBorrowings]);

  // Handle returning a book - opens modal
  const handleReturnBook = (borrowingId: string, bookTitle: string) => {
    setReturnModal({
      isOpen: true,
      borrowingId,
      bookTitle,
    });
  };

  const handleCloseReturnModal = () => {
    setReturnModal({
      isOpen: false,
      borrowingId: "",
      bookTitle: "",
    });
  };

  const handleReturnSuccess = () => {
    fetchBorrowings(); // Refresh the borrowings list
  };

  // Handle reporting a book as lost
  const handleReportLost = async (borrowingId: string, bookTitle: string) => {
    if (!confirm(`Are you sure you want to report "${bookTitle}" as lost? This will apply the full replacement cost as a fine.`)) {
      return;
    }

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${BASE_URL}/student/report-lost/${borrowingId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        alert(`Book reported as lost. Fine: ₹${data.data.lostBookFine}`);
        fetchBorrowings(); // Refresh the borrowings list
      } else {
        alert(data.message || "Failed to report book as lost");
      }
    } catch (err) {
      console.error("Failed to report lost book:", err);
      alert("Failed to report book as lost. Please try again.");
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
                {b.borrowType === "GROUP" && b.students && b.students.length > 0 && (
                  <div>
                    <span className="font-medium">Group Members:</span>
                    <div className="ml-2 mt-1">
                      {b.students.map((student, index) => (
                        <p key={index} className="text-xs text-gray-600">
                          • {student?.fullName || "Unknown"}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
                <p
                  className={`font-medium ${b.status === "OVERDUE"
                    ? "text-red-600"
                    : b.status === "RETURNED"
                      ? "text-gray-500"
                      : b.status === "LOST"
                        ? "text-red-800"
                        : "text-green-600"
                    }`}
                >
                  Status: {b.status}
                </p>
                {Number(b.totalFine) > 0 && (
                  <p className="text-red-600 font-medium">
                    Fine: ₹{Number(b.totalFine).toFixed(2)}
                  </p>
                )}
              </div>

              {/* Display borrowed book */}
              {b.book ? (
                <div className="mb-4 border p-2 rounded-lg">
                  {b.book.coverImageUrl && (
                    <img
                      src={b.book.coverImageUrl}
                      alt={b.book.title}
                      className="w-full h-40 object-cover rounded-lg mb-2"
                    />
                  )}
                  <h3 className="text-lg font-semibold">{b.book.title}</h3>
                  <p className="text-sm text-gray-600">by {b.book.author}</p>

                  <button
                    disabled={b.status !== "ACTIVE"}
                    className={`mt-2 w-full px-3 py-1 rounded ${b.status !== "ACTIVE"
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700 text-white"
                      }`}
                    onClick={() => handleReturnBook(b.id, b.book?.title || "Unknown Book")}
                  >
                    {b.status === "RETURNED" ? "Returned" : b.status === "LOST" ? "Lost" : "Return Book"}
                  </button>

                  {/* Report as Lost button - only show for active borrowings */}
                  {b.status === "ACTIVE" && (
                    <button
                      className="mt-2 w-full px-3 py-1 rounded bg-red-600 hover:bg-red-700 text-white text-sm"
                      onClick={() => handleReportLost(b.id, b.book?.title || "Unknown Book")}
                    >
                      Report as Lost
                    </button>
                  )}
                </div>
              ) : (
                <div className="mb-4 border p-2 rounded-lg text-center text-gray-500">
                  <p>No book information available</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Return Book Modal */}
      <ReturnBookModal
        isOpen={returnModal.isOpen}
        onClose={handleCloseReturnModal}
        borrowingId={returnModal.borrowingId}
        bookTitle={returnModal.bookTitle}
        onReturnSuccess={handleReturnSuccess}
      />
    </div>
  );
}
