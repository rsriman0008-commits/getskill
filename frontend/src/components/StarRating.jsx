import React, { useState } from 'react';

const StarRating = ({ rating = 0, onRate = null, interactive = false, size = 'md' }) => {
  const [hoverRating, setHoverRating] = useState(0);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const renderStars = () => {
    const stars = [];
    const displayRating = hoverRating || rating;

    for (let i = 1; i <= 5; i++) {
      const isFullStar = i <= Math.floor(displayRating);
      const isHalfStar = i - 0.5 <= displayRating && i > Math.floor(displayRating);

      stars.push(
        <button
          key={i}
          className={`${sizeClasses[size]} ${
            interactive ? 'cursor-pointer' : 'cursor-default'
          } transition-all`}
          onClick={() => interactive && onRate?.(i)}
          onMouseEnter={() => interactive && setHoverRating(i)}
          onMouseLeave={() => interactive && setHoverRating(0)}
          disabled={!interactive}
        >
          <svg
            className="w-full h-full"
            viewBox="0 0 24 24"
            fill={isFullStar ? '#fbbf24' : isHalfStar ? 'url(#half)' : 'none'}
            stroke={isFullStar || isHalfStar ? '#fbbf24' : '#cbd5e1'}
            strokeWidth="2"
          >
            <defs>
              <linearGradient id="half">
                <stop offset="50%" stopColor="#fbbf24" />
                <stop offset="50%" stopColor="none" />
              </linearGradient>
            </defs>
            <polygon points="12 2 15.09 10.26 24 10.26 17.55 15.05 19.64 23.31 12 18.52 4.36 23.31 6.45 15.05 0 10.26 8.91 10.26" />
          </svg>
        </button>
      );
    }

    return stars;
  };

  return (
    <div className="flex gap-1 items-center">
      <div className="flex gap-1">{renderStars()}</div>
      {rating > 0 && (
        <span className="text-sm text-slate-600 font-medium">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default StarRating;
