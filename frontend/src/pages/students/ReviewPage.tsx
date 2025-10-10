// src/pages/ReviewPage.tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

// Validation schema
const reviewSchema = z.object({
    bookId: z.string().min(1, "Please select a book"),
    title: z.string().min(3, "Title is required"),
    content: z.string().min(10, "Comment is required"),
    rating: z.number().min(1).max(5),
    image: z.any().optional(), // Changed from imageUrl to image for file upload
});

export type ReviewFormType = z.infer<typeof reviewSchema>;

// Types for API responses
interface BorrowedBookResponse {
    id: string;
    book?: {
        id: string;
        title: string;
        author: string;
        coverImageUrl?: string;
    } | null;
}

interface BookOption {
    id: string;
    title: string;
}

export const ReviewPage = () => {
    const { user } = useAuth();
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");
    const [borrowedBooks, setBorrowedBooks] = useState<BookOption[]>([]);

    const form = useForm<ReviewFormType>({
        resolver: zodResolver(reviewSchema),
        defaultValues: {
            bookId: "",
            title: "",
            content: "",
            rating: 5,
            image: undefined,
        },
    });


    const BASE_URL = import.meta.env.VITE_BACKEND_URL;
    
    useEffect(() => {
        const fetchBorrowedBooks = async () => {
            const token = localStorage.getItem("token");
            try {
                const res = await fetch(`${BASE_URL}/student/my-borrowings?status=RETURNED`, {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                    },
                });
                const data = await res.json();
                // Map the response to extract book information from nested structure
                const books = (data.data || []).map((borrowing: BorrowedBookResponse): BookOption => ({
                    id: borrowing.book?.id || borrowing.id, // Use book ID from the nested book object
                    title: borrowing.book?.title || 'Unknown Title'
                })).filter((book: BookOption) => book.title !== 'Unknown Title' && book.id); // Filter out books without titles or IDs
                setBorrowedBooks(books);
            } catch (error) {
                console.log(error);
            }
        };
        if (user) fetchBorrowedBooks();
    }, [user, BASE_URL]);

    const onSubmit = async (values: ReviewFormType) => {
        setError("");
        setSuccess("");
        const token = localStorage.getItem("token");
        try {
            // Create FormData for file upload
            const formData = new FormData();
            formData.append("bookId", values.bookId);
            formData.append("title", values.title);
            formData.append("content", values.content);
            formData.append("rating", values.rating.toString());
            formData.append("studentId", user?.id || "");
            
            // Add image file if provided
            if (values.image && values.image[0]) {
                formData.append("image", values.image[0]);
            }

            const res = await fetch(`${BASE_URL}/reviews`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    // Don't set Content-Type for FormData, let browser set it with boundary
                },
                body: formData,
            });
            const data = await res.json();

            if (data.error) setError(data.error);
            else setSuccess("Review submitted successfully!");

            form.reset();
        } catch {
            setError("Something went wrong");
        }
    };

    return (
        <div className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow">
            <h1 className="text-2xl font-bold mb-4">Submit a Review</h1>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    {/* Book Selection */}
                    <FormField
                        control={form.control}
                        name="bookId"
                        render={({ field }) => (
                            <FormItem>
                                <Label>Select Book</Label>
                                <select {...field} className="w-full border rounded px-2 py-1">
                                    <option value="">-- Select a book --</option>
                                    {borrowedBooks.map((book) => (
                                        <option key={book.id} value={book.id}>
                                            {book.title}
                                        </option>
                                    ))}
                                </select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem>
                                <Label>Title</Label>
                                <Input placeholder="Review title" {...field} />
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="content"
                        render={({ field }) => (
                            <FormItem>
                                <Label>Comment</Label>
                                <Textarea placeholder="Write your review" {...field} />
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="rating"
                        render={({ field }) => (
                            <FormItem>
                                <Label>Rating (1-5)</Label>
                                <Input type="number" min={1} max={5} {...field} />
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="image"
                        render={({ field }) => (
                            <FormItem>
                                <Label>Upload Image (optional)</Label>
                                <Input 
                                    type="file" 
                                    accept="image/*"
                                    onChange={(e) => field.onChange(e.target.files)}
                                />
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {error && <p className="text-red-500">{error}</p>}
                    {success && <p className="text-green-500">{success}</p>}

                    <Button type="submit" className="w-full">
                        Submit Review
                    </Button>
                </form>
            </Form>
        </div>
    );
};
