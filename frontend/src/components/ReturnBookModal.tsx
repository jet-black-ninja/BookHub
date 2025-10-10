import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, BookOpen, X } from "lucide-react";

interface ReturnBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  borrowingId: string;
  bookTitle: string;
  onReturnSuccess: () => void;
}

type DamageLevel = "NONE" | "SMALL" | "LARGE";

interface ReturnResponse {
  borrowingId: string;
  returnDate: string;
  overdueFine: number;
  damageFine: number;
  lostBookFine: number;
  totalFine: number;
  isOverdue: boolean;
  isLostBook: boolean;
  overdueDays: number;
  damageLevel: string;
  status: string;
}

export const ReturnBookModal = ({
  isOpen,
  onClose,
  borrowingId,
  bookTitle,
  onReturnSuccess,
}: ReturnBookModalProps) => {
  const [damageLevel, setDamageLevel] = useState<DamageLevel>("NONE");
  const [damageNotes, setDamageNotes] = useState("");
  const [isReturning, setIsReturning] = useState(false);
  const [returnResult, setReturnResult] = useState<ReturnResponse | null>(null);

  const BASE_URL = import.meta.env.VITE_BACKEND_URL;

  const handleReturn = async () => {
    setIsReturning(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/student/return/${borrowingId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          damageLevel,
          damageNotes: damageNotes.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setReturnResult(data.data);
        onReturnSuccess();
      } else {
        alert(data.message || "Failed to return book");
      }
    } catch (error) {
      console.error("Error returning book:", error);
      alert("An error occurred while returning the book");
    } finally {
      setIsReturning(false);
    }
  };

  const handleClose = () => {
    setDamageLevel("NONE");
    setDamageNotes("");
    setReturnResult(null);
    onClose();
  };

  const getDamageDescription = (level: DamageLevel) => {
    switch (level) {
      case "NONE":
        return "Book is in perfect condition with no visible damage";
      case "SMALL":
        return "Minor damage such as slight wear, small marks, or bent corners (10% of book price)";
      case "LARGE":
        return "Significant damage such as torn pages, water damage, or broken binding (50% of book price)";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">
            {returnResult ? "Return Successful" : "Return Book"}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {!returnResult ? (
            <>
              {/* Book Info */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <BookOpen className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="font-semibold text-gray-800">{bookTitle}</p>
                  <p className="text-sm text-gray-500">Borrowing ID: {borrowingId}</p>
                </div>
              </div>

              {/* Damage Assessment */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">
                  Book Condition Assessment
                </Label>
                <div className="space-y-2">
                  {(["NONE", "SMALL", "LARGE"] as DamageLevel[]).map((level) => (
                    <label
                      key={level}
                      className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                        damageLevel === level
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="damageLevel"
                        value={level}
                        checked={damageLevel === level}
                        onChange={(e) => setDamageLevel(e.target.value as DamageLevel)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="font-medium">
                          {level === "NONE" && "No Damage"}
                          {level === "SMALL" && "Small Damage"}
                          {level === "LARGE" && "Large Damage"}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {getDamageDescription(level)}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Damage Notes */}
              {damageLevel !== "NONE" && (
                <div className="space-y-2">
                  <Label htmlFor="damageNotes">
                    Damage Description (Optional)
                  </Label>
                  <Textarea
                    id="damageNotes"
                    placeholder="Please describe the damage in detail..."
                    value={damageNotes}
                    onChange={(e) => setDamageNotes(e.target.value)}
                    className="min-h-[80px]"
                  />
                </div>
              )}

              {/* Warning for damage */}
              {damageLevel !== "NONE" && (
                <div className="flex items-start gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-orange-800">
                    <p className="font-medium">Additional Fine Will Apply</p>
                    <p>
                      {damageLevel === "SMALL" && "A fine of 10% of the book price will be added."}
                      {damageLevel === "LARGE" && "A fine of 50% of the book price will be added."}
                    </p>
                  </div>
                </div>
              )}

              {/* Lost book warning */}
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-red-800">
                  <p className="font-medium">Important Notice</p>
                  <p>
                    Books returned more than 30 days after the due date will be marked as 
                    <strong> LOST</strong> and will incur a fine of 200% of the book price 
                    plus daily overdue fines (₹50/day for all overdue days).
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={handleClose} className="flex-1">
                  Cancel
                </Button>
                <Button
                  onClick={handleReturn}
                  disabled={isReturning}
                  className="flex-1"
                >
                  {isReturning ? "Returning..." : "Return Book"}
                </Button>
              </div>
            </>
          ) : (
            <>
              {/* Return Success Result */}
              <div className="text-center space-y-4">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${
                  returnResult.isLostBook ? "bg-red-100" : "bg-green-100"
                }`}>
                  <BookOpen className={`h-8 w-8 ${
                    returnResult.isLostBook ? "text-red-600" : "text-green-600"
                  }`} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {returnResult.isLostBook 
                      ? "Book Marked as Lost" 
                      : "Book Returned Successfully!"}
                  </h3>
                  <p className="text-gray-600">{bookTitle}</p>
                  {returnResult.isLostBook && (
                    <p className="text-sm text-red-600 mt-2">
                      Book was returned {returnResult.overdueDays} days after the due date
                      and has been marked as lost.
                    </p>
                  )}
                </div>
              </div>

              {/* Fine Breakdown */}
              <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-800">Fine Breakdown</h4>
                <div className="space-y-2 text-sm">
                  {returnResult.isOverdue && (
                    <div className="flex justify-between">
                      <span>Overdue Fine ({returnResult.overdueDays} days):</span>
                      <span className="font-medium text-orange-600">
                        ₹{returnResult.overdueFine.toFixed(2)}
                      </span>
                    </div>
                  )}
                  {returnResult.lostBookFine > 0 && (
                    <div className="flex justify-between">
                      <span>Lost Book Fine (200% of book price):</span>
                      <span className="font-medium text-red-600">
                        ₹{returnResult.lostBookFine.toFixed(2)}
                      </span>
                    </div>
                  )}
                  {returnResult.damageFine > 0 && !returnResult.isLostBook && (
                    <div className="flex justify-between">
                      <span>Damage Fine ({returnResult.damageLevel}):</span>
                      <span className="font-medium text-red-600">
                        ₹{returnResult.damageFine.toFixed(2)}
                      </span>
                    </div>
                  )}
                  <hr className="my-2" />
                  <div className="flex justify-between font-semibold">
                    <span>Total Fine:</span>
                    <span className={returnResult.totalFine > 0 ? "text-red-600" : "text-green-600"}>
                      ₹{returnResult.totalFine.toFixed(2)}
                    </span>
                  </div>
                  {returnResult.totalFine === 0 && (
                    <p className="text-center text-green-600 text-sm mt-2">
                      No fines! Thank you for returning the book on time and in good condition.
                    </p>
                  )}
                  {returnResult.isLostBook && (
                    <p className="text-center text-red-600 text-sm mt-2">
                      This book will be removed from available inventory as it was returned too late.
                    </p>
                  )}
                </div>
              </div>

              {/* Return Date */}
              <div className="text-center text-sm text-gray-500">
                Returned on {new Date(returnResult.returnDate).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>

              <Button onClick={handleClose} className="w-full">
                Close
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};