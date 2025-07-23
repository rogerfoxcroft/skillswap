import React from 'react';

interface StarRatingProps {
  rating: number;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onRatingChange?: (rating: number) => void;
}

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  readonly = false,
  size = 'md',
  onRatingChange
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const handleStarClick = (value: number) => {
    if (!readonly && onRatingChange) {
      onRatingChange(value);
    }
  };

  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= rating;
        const partiallyFilled = star > rating && star - 1 < rating;
        
        return (
          <button
            key={star}
            type="button"
            className={`${sizeClasses[size]} ${
              readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110 transition-transform'
            } focus:outline-none`}
            onClick={() => handleStarClick(star)}
            disabled={readonly}
          >
            <svg
              viewBox="0 0 20 20"
              fill="currentColor"
              className={`${sizeClasses[size]} ${
                filled
                  ? 'text-yellow-400'
                  : partiallyFilled
                  ? 'text-yellow-200'
                  : 'text-gray-300'
              }`}
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            
            {/* Partial fill for decimal ratings */}
            {partiallyFilled && (
              <svg
                viewBox="0 0 20 20"
                className={`${sizeClasses[size]} text-yellow-400 absolute`}
                style={{
                  clipPath: `inset(0 ${100 - ((rating - (star - 1)) * 100)}% 0 0)`
                }}
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default StarRating;