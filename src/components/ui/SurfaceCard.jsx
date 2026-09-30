import React from 'react';

// Umumiy "karta" konteyneri: oq fon, yengil soya, 16px radius.
// (Eslatma: `.card` nomi index.css'da band — shuning uchun SurfaceCard.)
export default function SurfaceCard({ as: Tag = 'div', className = '', children, ...rest }) {
  return (
    <Tag
      className={['bg-surface-card border border-surface-line rounded-card shadow-soft', className].join(' ')}
      {...rest}
    >
      {children}
    </Tag>
  );
}
