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
    imageUrl: z.string().optional(),
});

export type ReviewFormType = z.infer<typeof reviewSchema>;

export const ReviewPage = () => {
    const { user } = useAuth();
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");
    const [borrowedBooks, setBorrowedBooks] = useState<{ id: string; title: string }[]>([]);

    const form = useForm<ReviewFormType>({
        resolver: zodResolver(reviewSchema),
        defaultValues: {
            bookId: "",
            title: "",
            content: "",
            rating: 5,
            imageUrl: "",
        },
    });


    const BASE_URL = import.meta.env.VITE_BACKEND_URL;
    useEffect(() => {
        const fetchBorrowedBooks = async () => {
            const token = localStorage.getItem("token");
            try {
                const res = await fetch(`${BASE_URL}/student/my-borrowings`, {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                    },
                });
                const data = await res.json();
                setBorrowedBooks(data.data || []);
            } catch (err) {
                console.log(err);
            }
        };
        if (user) fetchBorrowedBooks();
    }, [user]);

    const onSubmit = async (values: ReviewFormType) => {
        setError("");
        setSuccess("");
        const token = localStorage.getItem("token");
        try {
            const res = await fetch(`${BASE_URL}/student/reviews`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({ ...values, studentId: user?.id }),
            });
            const data = await res.json();

            if (data.error) setError(data.error);
            else setSuccess("Review submitted successfully!");

            form.reset();
        } catch (err) {
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
                        name="imageUrl"
                        render={({ field }) => (
                            <FormItem>
                                <Label>Image URL (optional)</Label>
                                <Input placeholder="Image URL" {...field} />
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
