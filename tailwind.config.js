/** @type {import('tailwindcss').Config} */
//
// DESIGN SYSTEM TOKENS (Phase 1)
// --------------------------------------------------------------------------
// Clean Light UI — Sofascore / zamonaviy sport ilovalari ruhida.
//   surface  : sahifa va karta foni      (#F8FAFC / #FFFFFF)
//   ink      : matn ranglari             (#0F172A asosiy)
//   brand    : zumrad yashil urg'u       (#10B981 / #059669)
//   accent   : Sofascore ko'ki urg'usi   (#0284C7)
//
// Eslatma: "preflight" o'chirilgan — eski (qorong'i) sahifalardagi plain-CSS
// stillar buzilmasligi uchun. Yangi (light) sahifalar o'z ildiz elementida
// `font-sans text-ink bg-surface` klasslarini ishlatadi.
module.exports = {
  content: ['./public/index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#F8FAFC',
          card: '#FFFFFF',
          muted: '#F1F5F9',
          line: '#E2E8F0',
        },
        ink: {
          DEFAULT: '#0F172A',
          soft: '#334155',
          muted: '#64748B',
          subtle: '#94A3B8',
        },
        brand: {
          DEFAULT: '#10B981',
          dark: '#059669',
          soft: '#D1FAE5',
          tint: '#ECFDF5',
        },
        accent: {
          DEFAULT: '#0284C7',
          dark: '#0369A1',
          soft: '#BAE6FD',
          tint: '#F0F9FF',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Montserrat', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        card: '16px',
        control: '12px',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(15, 23, 42, 0.04), 0 4px 16px rgba(15, 23, 42, 0.06)',
        lift: '0 2px 4px rgba(15, 23, 42, 0.04), 0 16px 40px rgba(15, 23, 42, 0.12)',
        'glow-brand': '0 10px 30px rgba(16, 185, 129, 0.28)',
        'glow-accent': '0 10px 30px rgba(2, 132, 199, 0.28)',
      },
      keyframes: {
        'fs-fade-up': {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fs-pop': {
          '0%': { transform: 'scale(1)' },
          '40%': { transform: 'scale(1.22)' },
          '100%': { transform: 'scale(1)' },
        },
        'fs-pop-in': {
          '0%': { opacity: '0', transform: 'translateY(16px) scale(0.96)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'fs-draw': {
          '0%': { strokeDashoffset: '60' },
          '100%': { strokeDashoffset: '0' },
        },
        'fs-confetti': {
          '0%': { transform: 'translateY(-30px) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(340px) rotate(620deg)', opacity: '0' },
        },
        'fs-float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
      animation: {
        'fs-fade-up': 'fs-fade-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) both',
        'fs-float': 'fs-float 6s ease-in-out infinite',
        'fs-pop-in': 'fs-pop-in 0.45s cubic-bezier(0.22, 1, 0.36, 1) both',
        'fs-draw': 'fs-draw 0.7s 0.25s ease-out both',
        'fs-confetti': 'fs-confetti 2.6s ease-in both',
        'fs-pop': 'fs-pop 0.9s cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  corePlugins: {
    preflight: false,
  },
  plugins: [],
};
