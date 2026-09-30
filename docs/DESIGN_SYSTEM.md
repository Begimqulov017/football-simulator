# Football-Simulator — Design System (Clean Light UI)

## Ranglar (tailwind.config.js → theme.extend.colors)
| Token | Qiymat | Ishlatilishi |
|---|---|---|
| `bg-surface` | #F8FAFC | sahifa foni |
| `bg-surface-card` | #FFFFFF | kartalar |
| `border-surface-line` | #E2E8F0 | chegaralar |
| `text-ink` | #0F172A | asosiy matn |
| `text-ink-muted` | #64748B | ikkilamchi matn |
| `brand` / `brand-dark` | #10B981 / #059669 | asosiy urg'u (yashil) |
| `accent` / `accent-dark` | #0284C7 / #0369A1 | Sofascore ko'ki |

## Shakllar
`rounded-card` (16px), `rounded-control` (12px), `shadow-soft`, `shadow-lift`,
`shadow-glow-brand`, `shadow-glow-accent`. Shrift: Inter (`font-sans`).

## Animatsiyalar
`animate-fs-fade-up`, `animate-fs-float`. Doim `motion-safe:` bilan ishlating —
"reduced motion" yoqilgan foydalanuvchilarda o'chadi.

## Komponentlar (`src/components/ui`)
`Button` (primary | accent | secondary | ghost; sm | md | lg), `Badge`
(brand | accent | neutral), `SurfaceCard`.

## Qoidalar
1. Yangi (light) sahifa ildizi: `font-sans text-ink bg-surface min-h-screen`.
2. Tailwind `preflight` o'chirilgan — eski dark sahifalar buzilmasligi uchun.
3. `index.css`da band klass nomlari: `.card`, `.title`, `.container`, `.subtitle` —
   ularni yangi komponentlarda ishlatmang.
4. Tailwind JIT dinamik klass nomlarini ko'rmaydi: ranglarni `TONES` obyektida
   to'liq statik nom bilan yozing (`SectionCard.jsx` namunasi).

## Landing tuzilishi
```
src/landing/
├── LandingPage.jsx
├── data/sections.js          ← bo'lim kartalari ma'lumoti
└── components/ TopBar · Hero · SectionCard · BackgroundDecor · BrandMark
```
