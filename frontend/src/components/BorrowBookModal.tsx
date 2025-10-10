import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface BorrowBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookId: string;
  bookTitle: string;
  onBorrowSuccess: () => void;
}

export const BorrowBookModal = ({
  isOpen,
  onClose,
  bookId,
  bookTitle,
  onBorrowSuccess,
}: BorrowBookModalProps) => {
  const [borrowType, setBorrowType] = useState<"INDIVIDUAL" | "GROUP">("INDIVIDUAL");
  const [studentEmails, setStudentEmails] = useState<string[]>([""]);
  const [dueDate, setDueDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 14); // Default 14 days
    return date.toISOString().split("T")[0];
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const BASE_URL = import.meta.env.VITE_BACKEND_URL;

  const handleAddEmail = () => {
    if (studentEmails.length < 5) { // Max 6 students total (including current user)
      setStudentEmails([...studentEmails, ""]);
    }
  };

  const handleRemoveEmail = (index: number) => {
    if (studentEmails.length > 1) {
      setStudentEmails(studentEmails.filter((_, i) => i !== index));
    }
  };

  const handleEmailChange = (index: number, value: string) => {
    const newEmails = [...studentEmails];
    newEmails[index] = value;
    setStudentEmails(newEmails);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Validate group borrowing requirements
      if (borrowType === "GROUP") {
        const validEmails = studentEmails.filter(email => email.trim() !== "");
        if (validEmails.length < 2) {
          setError("Group borrowing requires at least 3 students total (including you)");
          setLoading(false);
          return;
        }
        if (validEmails.length > 5) {
          setError("Maximum 6 students allowed for group borrowing");
          setLoading(false);
          return;
        }
      }

      const token = localStorage.getItem("token");
      interface BorrowRequest {
        bookId: string;
        borrowType: "INDIVIDUAL" | "GROUP";
        dueDate: string;
        studentEmails?: string[];
      }

      const body: BorrowRequest = {
        bookId,
        borrowType,
        dueDate,
      };

      // Only include studentEmails for group borrowing
      if (borrowType === "GROUP") {
        body.studentEmails = studentEmails.filter(email => email.trim() !== "");
      }

      const res = await fetch(`${BASE_URL}/student/borrow`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (data.success) {
        onBorrowSuccess();
        onClose();
        alert(`Book borrowed successfully! ${borrowType === "GROUP" ? `Shared with ${data.data.students.length} students.` : ""}`);
      } else {
        setError(data.message || "Failed to borrow book");
      }
    } catch (err) {
      console.error("Failed to borrow book:", err);
      setError("Failed to borrow book. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError("");
    setBorrowType("INDIVIDUAL");
    setStudentEmails([""]);
    const date = new Date();
    date.setDate(date.getDate() + 14);
    setDueDate(date.toISOString().split("T")[0]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">Borrow Book</h2>
        <h3 className="text-lg mb-4 text-gray-700">{bookTitle}</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Borrow Type Selection */}
          <div>
            <Label className="text-sm font-medium">Borrow Type</Label>
            <div className="flex gap-4 mt-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="INDIVIDUAL"
                  checked={borrowType === "INDIVIDUAL"}
                  onChange={(e) => setBorrowType(e.target.value as "INDIVIDUAL" | "GROUP")}
                  className="mr-2"
                />
                Individual
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="GROUP"
                  checked={borrowType === "GROUP"}
                  onChange={(e) => setBorrowType(e.target.value as "INDIVIDUAL" | "GROUP")}
                  className="mr-2"
                />
                Group (3-6 students)
              </label>
            </div>
          </div>

          {/* Due Date */}
          <div>
            <Label htmlFor="dueDate" className="text-sm font-medium">
              Due Date
            </Label>
            <Input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              required
            />
          </div>

          {/* Student Emails for Group Borrowing */}
          {borrowType === "GROUP" && (
            <div>
              <Label className="text-sm font-medium">
                Other Student Emails (2-5 additional students)
              </Label>
              <div className="space-y-2 mt-2">
                {studentEmails.map((email, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      type="email"
                      placeholder="student@example.com"
                      value={email}
                      onChange={(e) => handleEmailChange(index, e.target.value)}
                      required={borrowType === "GROUP"}
                    />
                    {studentEmails.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveEmail(index)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
                {studentEmails.length < 5 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddEmail}
                  >
                    Add Another Student
                  </Button>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Including yourself, the group will have {studentEmails.filter(e => e.trim()).length + 1} students
              </p>
            </div>
          )}

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1"
            >
              {loading ? "Borrowing..." : "Borrow Book"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};