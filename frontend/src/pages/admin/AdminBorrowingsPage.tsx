import type { Borrowing } from "@/schemas/library";
import { useEffect, useState } from "react";

export const AdminBorrowingsPage = () => {
  const [borrowings, setBorrowings] = useState<Borrowing[]>([]);

  useEffect(() => {
    // 🔹 Simulated API data (replace with backend fetch later)
    setBorrowings([
      {
        id: "BRW-001",
        borrowDate: "2025-09-25",
        dueDate: "2025-10-10",
        returnDate: null,
        status: "ACTIVE",
        borrowType: "INDIVIDUAL",
        totalFine: 0,
        BorrowedBook: [
          { id: "BB1", book: { id: "BK1", title: "Clean Code", author: "Robert C. Martin", coverImageUrl: null }, returned: false },
          { id: "BB2", book: { id: "BK2", title: "React in Action", author: "Mark Tielens Thomas", coverImageUrl: null }, returned: false },
        ],
        students: [
          { student: { fullName: "Aarav Mehta", id: "STU1" } },
        ],
      },
      {
        id: "BRW-002",
        borrowDate: "2025-08-20",
        dueDate: "2025-09-20",
        returnDate: "2025-10-01",
        status: "OVERDUE",
        borrowType: "GROUP",
        totalFine: 1500,
        BorrowedBook: [
          { id: "BB3", book: { id: "BK3", title: "System Design Primer", author: "Alex Xu", coverImageUrl: null }, returned: true },
        ],
        students: [
          { student: { fullName: "Riya Sharma", id: "STU2" } },
          { student: { fullName: "Ankit Verma", id: "STU3" } },
        ],
      },
      {
        id: "BRW-003",
        borrowDate: "2025-07-15",
        dueDate: "2025-08-15",
        returnDate: "2025-08-16",
        status: "RETURNED",
        borrowType: "INDIVIDUAL",
        totalFine: 50,
        BorrowedBook: [
          { id: "BB4", book: { id: "BK4", title: "The Pragmatic Programmer", author: "Andrew Hunt", coverImageUrl: null }, returned: true },
        ],
        students: [
          { student: { fullName: "Neha Patel", id: "STU4" } },
        ],
      },
    ]);
  }, []);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">All Borrowings</h1>
        <p className="text-gray-600 mt-2">
          Track all student borrowings, overdue books, and fines.
        </p>
      </div>

      {borrowings.length === 0 ? (
        <p className="text-gray-500">No borrowings found.</p>
      ) : (
        <table className="w-full border rounded-lg shadow-sm text-left">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="p-3">Borrow ID</th>
              <th className="p-3">Type</th>
              <th className="p-3">Students</th>
              <th className="p-3">Books</th>
              <th className="p-3">Borrowed On</th>
              <th className="p-3">Due Date</th>
              <th className="p-3">Fine (₹)</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {borrowings.map((b) => (
              <tr key={b.id} className="border-t hover:bg-gray-50">
                <td className="p-3 font-medium text-gray-800">{b.id}</td>
                <td className="p-3">{b.borrowType}</td>
                <td className="p-3">
                  {b.students?.map((s) => s.student.fullName).join(", ")}
                </td>
                <td className="p-3">
                  {b.BorrowedBook.map((bb) => bb.book.title).join(", ")}
                </td>
                <td className="p-3">{b.borrowDate}</td>
                <td className="p-3">{b.dueDate}</td>
                <td className="p-3 font-semibold text-blue-700">₹{b.totalFine}</td>
                <td className={`p-3 font-semibold ${
                  b.status === "ACTIVE"
                    ? "text-green-600"
                    : b.status === "OVERDUE"
                    ? "text-red-600"
                    : b.status === "LOST"
                    ? "text-gray-500"
                    : "text-blue-600"
                }`}>
                  {b.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};
