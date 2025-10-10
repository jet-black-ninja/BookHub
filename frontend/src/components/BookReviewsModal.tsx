import { useEffect, useState, useCallback } from "react";
import type { Review } from "@/schemas/library";
import { ImageModal } from "./ImageModal";

interface BookReviewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookId: string;
  bookTitle: string;
}

export const BookReviewsModal = ({
  isOpen,
  onClose,
  bookId,
  bookTitle,
}: BookReviewsModalProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [totalReviews, setTotalReviews] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [imageModal, setImageModal] = useState<{
    isOpen: boolean;
    imageUrl: string;
    alt: string;
  }>({
    isOpen: false,
    imageUrl: "",
    alt: "",
  });

  const BASE_URL = import.meta.env.VITE_BACKEND_URL;

  const fetchBookReviews = useCallback(async (page: number = 1) => {
    if (!bookId) return;

    setLoading(true);
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `${BASE_URL}/reviews/book/${bookId}?page=${page}&limit=10`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setReviews(data.data.reviews);
        setAverageRating(data.data.averageRating);
        setTotalReviews(data.data.totalReviews);
        setCurrentPage(data.data.pagination.page);
        setTotalPages(data.data.pagination.pages);
      } else {
        console.error("Failed to fetch reviews");
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  }, [bookId, BASE_URL]);

  useEffect(() => {
    if (isOpen && bookId) {
      fetchBookReviews(1);
    }
  }, [isOpen, bookId, fetchBookReviews]);

  const handlePageChange = (page: number) => {
    fetchBookReviews(page);
  };

  const handleImageClick = (imageUrl: string, reviewTitle: string) => {
    setImageModal({
      isOpen: true,
      imageUrl,
      alt: `Review image for: ${reviewTitle}`,
    });
  };

  const handleCloseImageModal = () => {
    setImageModal({
      isOpen: false,
      imageUrl: "",
      alt: "",
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const renderStars = (rating: number) => {
    return "★".repeat(rating) + "☆".repeat(5 - rating);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                Reviews for "{bookTitle}"
              </h2>
              {totalReviews > 0 && (
                <div className="mt-2 flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <span className="text-2xl text-yellow-400">
                      {renderStars(Math.round(averageRating))}
                    </span>
                    <span className="text-sm text-gray-600 ml-2">
                      {averageRating.toFixed(1)} ({totalReviews} review{totalReviews !== 1 ? 's' : ''})
                    </span>
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="text-gray-500">Loading reviews...</div>
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500 text-lg">No reviews yet</div>
              <p className="text-gray-400 mt-2">Be the first to review this book!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="border-b border-gray-100 pb-6 last:border-b-0">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-800">{review.student.fullName}</h4>
                        <span className="text-yellow-400 text-sm">
                          {renderStars(review.rating)}
                        </span>
                        <span className="text-sm text-gray-500">({review.rating}/5)</span>
                      </div>
                      <p className="text-sm text-gray-500">{formatDate(review.createdAt)}</p>
                    </div>
                  </div>
                  
                  <h5 className="font-medium text-gray-800 mb-2">{review.title}</h5>
                  <p className="text-gray-700 mb-3 leading-relaxed">{review.content}</p>
                  
                  {review.imageUrl && (
                    <div className="mt-3">
                      <img
                        src={review.imageUrl}
                        alt="Review"
                        className="max-w-48 h-32 object-cover rounded-lg shadow-sm cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => handleImageClick(review.imageUrl!, review.title)}
                      />
                      <p className="text-xs text-gray-500 mt-1">Click to view full size</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
              >
                Previous
              </button>
              
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>

      {/* Image Modal */}
      <ImageModal
        isOpen={imageModal.isOpen}
        onClose={handleCloseImageModal}
        imageUrl={imageModal.imageUrl}
        alt={imageModal.alt}
      />
    </div>
  );
};