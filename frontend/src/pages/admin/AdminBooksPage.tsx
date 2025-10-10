import type { Book } from "@/schemas/library";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

export const AdminBooksPage = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [newBook, setNewBook] = useState<Partial<Book>>({});
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [adding, setAdding] = useState(false);

  const token = localStorage.getItem("token");

  // Fetch all books
  const fetchBooks = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/books?includeDeleted=false&page=1&limit=100`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setBooks(data.data.books || []);
    } catch (err) {
      console.error("Failed to fetch books:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  // Add a new book
  const addBook = async () => {
    if (!newBook.title || !newBook.author || !newBook.price) {
      alert("Please fill title, author, and price.");
      return;
    }

    try {
      setAdding(true);
      const formData = new FormData();
      formData.append("title", newBook.title);
      formData.append("author", newBook.author);
      formData.append("categoryId", newBook.Category?.id || "");
      formData.append("price", String(newBook.price));
      formData.append("totalCopies", String(newBook.totalCopies || 1));
      formData.append("isbn", newBook.isbn || "");
      if (coverFile) formData.append("coverImage", coverFile);

      const res = await fetch(`${BASE_URL}/books`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      console.log("Book added:", data);

      setNewBook({});
      setCoverFile(null);
      fetchBooks(); // Refresh list
    } catch (err) {
      console.error("Failed to add book:", err);
    } finally {
      setAdding(false);
    }
  };

  // Edit/update a book
  const updateBook = async (id: string, updatedBook: Partial<Book>, coverFile?: File) => {
    try {
      const formData = new FormData();
      if (updatedBook.title) formData.append("title", updatedBook.title);
      if (updatedBook.author) formData.append("author", updatedBook.author);
      if (updatedBook.Category) formData.append("categoryId", updatedBook.Category.id);
      if (updatedBook.price !== undefined) formData.append("price", String(updatedBook.price));
      if (updatedBook.totalCopies !== undefined)
        formData.append("totalCopies", String(updatedBook.totalCopies));
      if (coverFile) formData.append("coverImage", coverFile);

      const res = await fetch(`${BASE_URL}/books/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      console.log("Book updated:", data);
      fetchBooks(); // Refresh list
    } catch (err) {
      console.error("Failed to update book:", err);
    }
  };

  // Soft delete a book
  const deleteBook = async (id: string) => {
    if (!confirm("Are you sure you want to delete this book?")) return;
    try {
      const res = await fetch(`${BASE_URL}/books/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      console.log("Book deleted:", data);
      fetchBooks(); // Refresh list
    } catch (err) {
      console.error("Failed to delete book:", err);
    }
  };

  if (loading) return <p>Loading books...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Manage Books</h1>

      {/* Add Book Form */}
      <div className="mb-6 p-4 border rounded-lg bg-gray-50">
        <h2 className="text-lg font-semibold mb-2">Add New Book</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
          <Input
            placeholder="Title"
            value={newBook.title || ""}
            onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
          />
          <Input
            placeholder="Author"
            value={newBook.author || ""}
            onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
          />
          <Input
            placeholder="Category ID"
            value={newBook.Category?.id || ""}
            onChange={(e) =>
              setNewBook({ ...newBook, Category: { id: e.target.value, name: "" } })
            }
          />
          <Input
            type="number"
            placeholder="Price"
            value={newBook.price || ""}
            onChange={(e) => setNewBook({ ...newBook, price: Number(e.target.value) })}
          />
          <Input
            type="number"
            placeholder="Total Copies"
            value={newBook.totalCopies || 1}
            onChange={(e) => setNewBook({ ...newBook, totalCopies: Number(e.target.value) })}
          />
          <Input type="file" onChange={(e) => setCoverFile(e.target.files?.[0] || null)} />
          <Input
            placeholder="ISBN"
            value={newBook.isbn || ""}
            onChange={(e) => setNewBook({ ...newBook, isbn: e.target.value })}
          />

        </div>
        <Button onClick={addBook} disabled={adding}>
          {adding ? "Adding..." : "Add Book"}
        </Button>
      </div>

      {/* Books Table */}
      {books.length === 0 ? (
        <p className="text-gray-500">No books found.</p>
      ) : (
        <table className="w-full border rounded-lg shadow-sm text-left">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="p-3">Title</th>
              <th className="p-3">Author</th>
              <th className="p-3">Category</th>
              <th className="p-3">Price (₹)</th>
              <th className="p-3">Available / Total</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {books.map((book) => (
              <tr key={book.id} className="border-t hover:bg-gray-50">
                <td className="p-3">{book.title}</td>
                <td className="p-3">{book.author}</td>
                <td className="p-3">{book.Category.name}</td>
                <td className="p-3">₹{book.price}</td>
                <td className="p-3">
                  {book.availableCopies}/{book.totalCopies}
                </td>
                <td className="p-3 text-center space-x-3">
                  <button
                    className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                    onClick={() => updateBook(book.id, { title: book.title })}
                  >
                    Edit
                  </button>
                  <button
                    className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                    onClick={() => deleteBook(book.id)}
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
