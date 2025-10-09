import type { Book } from "@/schemas/library";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export const BooksPage = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await fetch("http://localhost:4000/api/books");
        const data = await res.json();
        setBooks(data);
      } catch (err) {
        console.error("Failed to fetch books", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, []);

  const filtered = books.filter(
    (b) =>
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.author.toLowerCase().includes(search.toLowerCase()) ||
      b.category.name.toLowerCase().includes(search.toLowerCase())
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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {filtered.map((book) => (
            <div
              key={book.id}
              className="border rounded-lg p-3 bg-white shadow-sm hover:shadow-md transition"
            >
              <img
                src={book.coverImageUrl || "/placeholder.png"}
                alt={book.title}
                className="w-full h-48 object-cover rounded mb-2"
              />
              <h3 className="font-semibold text-lg">{book.title}</h3>
              <p className="text-sm text-gray-600">{book.author}</p>
              <p className="text-xs text-gray-500">{book.category.name}</p>

              <p
                className={`text-sm mt-1 mb-2 ${book.availableCopies > 0
                    ? "text-green-600"
                    : "text-red-500"
                  }`}
              >
                {book.availableCopies > 0
                  ? `${book.availableCopies} copies available`
                  : "Unavailable"}
              </p>

              <button
                disabled={book.availableCopies === 0}
                className={`w-full px-3 py-2 rounded ${book.availableCopies === 0
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                onClick={() => alert(`Borrowing ${book.title}`)}
              >
                Borrow
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
    </div>
  );
};
