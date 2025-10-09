import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

interface Book {
  id: string;
  title: string;
  author: string;
  category: string;
  price: number;
  availableCopies: number;
  totalCopies: number;
}

export const AdminBooksPage = () => {
  const [books, setBooks] = useState<Book[]>([]);

  useEffect(() => {
    // 🔹 Replace with actual API call later
    setBooks([
      {
        id: "1",
        title: "React Essentials",
        author: "Dan Abramov",
        category: "Programming",
        price: 499,
        availableCopies: 2,
        totalCopies: 3,
      },
      {
        id: "2",
        title: "Node.js Deep Dive",
        author: "Ryan Dahl",
        category: "Backend",
        price: 599,
        availableCopies: 1,
        totalCopies: 3,
      },
      {
        id: "3",
        title: "Database Systems",
        author: "Raghu Ramakrishnan",
        category: "Database",
        price: 799,
        availableCopies: 3,
        totalCopies: 3,
      },
    ]);
  }, []);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Manage Books</h1>
          <p className="text-gray-600 mt-2">
            Add, edit, or remove books from the library.
          </p>
        </div>
        <Link
          to="/admin/books/add"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          + Add Book
        </Link>
      </div>

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
                <td className="p-3">{book.category}</td>
                <td className="p-3">₹{book.price}</td>
                <td className="p-3">
                  {book.availableCopies}/{book.totalCopies}
                </td>
                <td className="p-3 text-center space-x-3">
                  <button className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700">
                    Edit
                  </button>
                  <button className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700">
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
