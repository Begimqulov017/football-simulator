import React from 'react';
import Icon from '../../components/Icon';

// Kichik logotip belgisi (TopBar va Footer uchun).
export default function BrandMark({ size = 36 }) {
  return (
    <span
      className="inline-flex items-center justify-center rounded-control bg-gradient-to-br from-brand to-accent text-white shadow-soft"
      style={{ width: size, height: size }}
    >
      <Icon name="ball" size={Math.round(size * 0.6)} strokeWidth={1.8} />
    </span>
  );
}
