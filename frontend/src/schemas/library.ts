
export interface Category {
  id: string;
  name: string;
}

export interface Book {
    id: string;
    title: string;
    author: string;
    isbn: string;
    categoryId: string;
    description?: string;
    price: number;           // Decimal from backend converted to number
    totalCopies: number;
    availableCopies: number;
    coverImageUrl: string | null;
    category: Category
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
}

// BorrowedBook interface
export interface BorrowedBook {
    id: string;
    book: {
        id: string;
        title: string;
        author: string;
        coverImageUrl: string | null;
    };
    returned: boolean;
}

// Borrowing interface
export interface Borrowing {
    id: string;
    borrowDate: string;
    dueDate: string;
    returnDate: string | null;
    status: "ACTIVE" | "RETURNED" | "OVERDUE" | "LOST";
    borrowType: "INDIVIDUAL" | "GROUP";
    totalFine: number;           // Decimal from backend converted to number
    BorrowedBook: BorrowedBook[];
    students?: {
        student: {
            fullName: string;
            id: string;
        };
    }[];
}

export interface Student {
  id: string;
  fullName: string;
  email: string;
}