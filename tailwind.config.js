/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './public/index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {},
  },
  // Loyihada mavjud plain-CSS klasslar bilan to'qnashmasligi uchun "preflight"
  // (Tailwindning global reset qatlami) o'chirilgan — index.css'dagi mavjud
  // stillar (masalan body/font sozlamalari) o'zgarmasdan qoladi. Faqat
  // Tailwind komponent/utility klasslari qo'shiladi.
  corePlugins: {
    preflight: false,
  },
  plugins: [],
};
