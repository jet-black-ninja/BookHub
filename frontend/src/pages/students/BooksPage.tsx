import type { Book } from "@/schemas/library";
import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { BorrowBookModal } from "@/components/BorrowBookModal";
import { BookReviewsModal } from "@/components/BookReviewsModal";

export const BooksPage = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [borrowModal, setBorrowModal] = useState<{
    isOpen: boolean;
    bookId: string;
    bookTitle: string;
  }>({
    isOpen: false,
    bookId: "",
    bookTitle: "",
  });

  const [reviewsModal, setReviewsModal] = useState<{
    isOpen: boolean;
    bookId: string;
    bookTitle: string;
  }>({
    isOpen: false,
    bookId: "",
    bookTitle: "",
  });

  const BASE_URL = import.meta.env.VITE_BACKEND_URL;

  const fetchBooks = useCallback(async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${BASE_URL}/student/books`, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setBooks(data.data.books || []);
    } catch (err) {
      console.error("Failed to fetch books", err);
    } finally {
      setLoading(false);
    }
  }, [BASE_URL]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  // Handle opening borrow modal
  const handleBorrowBook = (bookId: string, bookTitle: string) => {
    setBorrowModal({
      isOpen: true,
      bookId,
      bookTitle,
    });
  };

  const handleCloseBorrowModal = () => {
    setBorrowModal({
      isOpen: false,
      bookId: "",
      bookTitle: "",
    });
  };

  const handleBorrowSuccess = () => {
    fetchBooks(); // Refresh the books list
  };

  // Handle opening reviews modal
  const handleViewReviews = (bookId: string, bookTitle: string) => {
    setReviewsModal({
      isOpen: true,
      bookId,
      bookTitle,
    });
  };

  const handleCloseReviewsModal = () => {
    setReviewsModal({
      isOpen: false,
      bookId: "",
      bookTitle: "",
    });
  };

  // Filter books by search
  const filtered = books.filter(
    (b) =>
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.author.toLowerCase().includes(search.toLowerCase()) ||
      b.Category?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Browse Books</h1>

      {/* Search bar */}
      <input
        type="text"
        placeholder="Search by title, author, or category..."
        className="border px-3 py-2 w-full rounded-lg mb-4"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {loading ? (
        <p>Loading books...</p>
      ) : filtered.length === 0 ? (
        <p className="text-gray-500">No books found.</p>
      ) : (
        <div className="grid grid-cols-1  md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((book) => (
            <div
              key={book.id}
              className="border rounded-lg p-3 min-w-[200px] bg-white shadow-sm hover:shadow-md transition "
            >
              <img
                src={book.coverImageUrl || "/placeholder.png"}
                alt={book.title}
                className="w-full h-48 object-cover rounded mb-2"
              />
              <h3 className="font-semibold text-lg">{book.title}</h3>
              <p className="text-sm text-gray-600">{book.author}</p>
              <p className="text-xs text-gray-500">{book.Category?.name || "No category"}</p>

              <p
                className={`text-sm mt-1 mb-2 ${book.availableCopies > 0 ? "text-green-600" : "text-red-500"
                  }`}
              >
                {book.availableCopies > 0
                  ? `${book.availableCopies} copies available`
                  : "Unavailable"}
              </p>

              <button
                disabled={book.availableCopies === 0}
                className={`w-full px-3 py-2 rounded mb-2 ${book.availableCopies === 0
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                onClick={() => handleBorrowBook(book.id, book.title)}
              >
                {book.availableCopies === 0
                  ? "Unavailable"
                  : "Borrow"}
              </button>

              <button
                className="w-full px-3 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm"
                onClick={() => handleViewReviews(book.id, book.title)}
              >
                View Reviews
              </button>
            </div>
          ))}
        </div>
      )}

      <Link
        to="/dashboard"
        className="inline-block mt-6 text-blue-600 hover:underline"
      >
        ← Back to Dashboard
      </Link>

      {/* Borrow Book Modal */}
      <BorrowBookModal
        isOpen={borrowModal.isOpen}
        onClose={handleCloseBorrowModal}
        bookId={borrowModal.bookId}
        bookTitle={borrowModal.bookTitle}
        onBorrowSuccess={handleBorrowSuccess}
      />

      {/* Book Reviews Modal */}
      <BookReviewsModal
        isOpen={reviewsModal.isOpen}
        onClose={handleCloseReviewsModal}
        bookId={reviewsModal.bookId}
        bookTitle={reviewsModal.bookTitle}
      />
    </div>
  );
};
