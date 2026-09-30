import React from 'react';
import { ratingColor, formatRating } from '../../utils/sofaRating';

// Sofascore uslubidagi rangli reyting belgisi.
export default function RatingBadge({ value, size = 'md', className = '' }) {
  const sizes = {
    sm: 'min-w-[26px] h-[16px] text-[10px] px-1',
    md: 'min-w-[34px] h-[22px] text-xs px-1.5',
    lg: 'min-w-[46px] h-[30px] text-base px-2',
  };
  return (
    <span
      className={`inline-flex items-center justify-center rounded-md font-extrabold tabular-nums text-white transition-colors duration-500 ${sizes[size]} ${className}`}
      style={{ backgroundColor: ratingColor(value) }}
    >
      {formatRating(value)}
    </span>
  );
}
