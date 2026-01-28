import { useState, useEffect } from "react";

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  movieTitle: string;
  currentRating?: number;
  currentComment?: string;
  onSubmit: (rating: number, comment: string) => Promise<void>;
  onDelete?: () => Promise<void>;
}

export default function RatingModal({
  isOpen,
  onClose,
  movieTitle,
  currentRating,
  currentComment,
  onSubmit,
  onDelete,
}: RatingModalProps) {
  const [rating, setRating] = useState(currentRating || 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState(currentComment || "");
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setRating(currentRating || 0);
      setComment(currentComment || "");
    }
  }, [isOpen, currentRating, currentComment]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate rating
    if (rating === 0 || rating < 1 || rating > 10) {
      alert("Vui lòng chọn số sao từ 1-10");
      return;
    }

    // Validate comment length
    if (comment.length > 500) {
      alert("Nhận xét không được quá 500 ký tự");
      return;
    }

    setSubmitting(true);
    try {
      console.log("📤 Submitting rating:", { 
        rating, 
        comment,
        commentLength: comment.length 
      });
      
      await onSubmit(rating, comment);
      onClose();
    } catch (error: any) {
      console.error("❌ Error submitting rating:", error);
      const errorMessage = error.response?.data?.message || "Không thể gửi đánh giá";
      alert(errorMessage);
      
      // Don't close modal on error
      // onClose(); // Remove this
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    
    if (!confirm("Bạn có chắc muốn xóa đánh giá này?")) return;

    setDeleting(true);
    try {
      await onDelete();
      onClose();
    } catch (error) {
      console.error("Error deleting rating:", error);
    } finally {
      setDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-netflix-dark border border-white/10 rounded-2xl p-6 max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-white">
            {currentRating ? "Sửa đánh giá" : "Đánh giá phim"}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6 text-netflix-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Movie Title */}
        <p className="text-netflix-light mb-6 line-clamp-2">{movieTitle}</p>

        <form onSubmit={handleSubmit}>
          {/* Star Rating */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-netflix-light mb-3">
              Đánh giá của bạn *
            </label>
            <div className="flex items-center gap-2">
              {[...Array(10)].map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setRating(i + 1)}
                  onMouseEnter={() => setHoverRating(i + 1)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <svg
                    className={`w-8 h-8 ${
                      i < (hoverRating || rating)
                        ? "text-yellow-400"
                        : "text-netflix-gray"
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </button>
              ))}
              <span className="text-white font-bold ml-2">
                {rating > 0 ? `${rating}/10` : "Chọn điểm"}
              </span>
            </div>
          </div>

          {/* Comment */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-netflix-light mb-2">
              Nhận xét (tùy chọn)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Chia sẻ suy nghĩ của bạn về bộ phim..."
              rows={4}
              className="w-full px-4 py-3 bg-netflix-gray border border-white/10 rounded-lg 
                       text-white placeholder-netflix-light resize-none
                       focus:outline-none focus:border-netflix-red transition-colors"
              maxLength={500}
            />
            <p className="text-xs text-netflix-light mt-1">
              {comment.length}/500 ký tự
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            {currentRating && onDelete && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 px-4 py-3 bg-red-500/20 text-red-400 rounded-lg
                         hover:bg-red-500/30 transition-colors font-semibold
                         border border-red-500/30 disabled:opacity-50"
              >
                {deleting ? "Đang xóa..." : "Xóa đánh giá"}
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-netflix-gray text-white rounded-lg
                       hover:bg-white/20 transition-colors font-semibold"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting || rating === 0}
              className="flex-1 px-4 py-3 bg-netflix-red text-white rounded-lg
                       hover:bg-netflix-red/80 transition-colors font-semibold
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Đang lưu..." : currentRating ? "Cập nhật" : "Gửi đánh giá"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}