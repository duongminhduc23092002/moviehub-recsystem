import { useEffect, useState } from "react";

interface TrailerModalProps {
  isOpen: boolean;
  onClose: () => void;
  trailerUrl: string;
  movieTitle: string;
}

// Hàm lấy YouTube video ID từ URL
function getYouTubeVideoId(url: string): string | null {
  if (!url) return null;
  
  // Các format URL của YouTube
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\?]+)/,
    /youtube\.com\/embed\/([^&\?]+)/,
    /youtube\.com\/v\/([^&\?]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
}

export default function TrailerModal({ isOpen, onClose, trailerUrl, movieTitle }: TrailerModalProps) {
  const videoId = getYouTubeVideoId(trailerUrl);
  const [isLoading, setIsLoading] = useState(true);

  // Escape key để đóng modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll
      document.body.style.overflow = "hidden";
      // Reset loading state khi mở modal
      setIsLoading(true);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Nếu không phải YouTube URL hoặc không lấy được video ID
  if (!videoId) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
           onClick={onClose}>
        <div className="bg-netflix-dark rounded-xl border border-white/10 p-8 max-w-md w-full"
             onClick={(e) => e.stopPropagation()}>
          <div className="text-center">
            <svg className="w-16 h-16 mx-auto text-netflix-red mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-xl font-bold text-white mb-2">Không thể phát trailer</h3>
            <p className="text-netflix-light mb-6">URL trailer không hợp lệ hoặc không phải là YouTube link.</p>
            <button onClick={onClose} className="btn-primary">
              Đóng
            </button>
          </div>
        </div>
      </div>
    );
  }

  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div className="relative w-full max-w-6xl aspect-video animate-scale-in"
           onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white hover:text-netflix-red 
                   transition-colors p-2 bg-black/50 rounded-lg backdrop-blur-sm
                   flex items-center gap-2 text-sm font-medium z-10"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          <span className="hidden sm:inline">ESC để đóng</span>
        </button>

        {/* Movie Title */}
        <div className="absolute -top-12 left-0 text-white z-10">
          <p className="text-sm text-netflix-light">Trailer</p>
          <h3 className="text-lg font-bold">{movieTitle}</h3>
        </div>

        {/* YouTube Iframe Container */}
        <div className="relative w-full h-full rounded-xl overflow-hidden shadow-2xl 
                      border-4 border-netflix-red/30">
          {/* Loading Overlay - Chỉ hiển thị khi đang loading */}
          {isLoading && (
            <div className="absolute inset-0 bg-netflix-black flex items-center justify-center 
                          z-20 animate-pulse">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-netflix-red border-t-transparent 
                              rounded-full animate-spin" />
                <p className="text-netflix-light text-sm">Đang tải trailer...</p>
              </div>
            </div>
          )}

          {/* YouTube Iframe */}
          <iframe
            src={embedUrl}
            title={`${movieTitle} Trailer`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
            onLoad={() => {
              // Ẩn loading overlay sau khi iframe load xong
              setTimeout(() => setIsLoading(false), 500);
            }}
          />
        </div>
      </div>
    </div>
  );
} 