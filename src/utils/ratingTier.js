// EA FC/FIFA uslubidagi Oltin/Kumush/Bronza reyting darajalari.
// 85+ = Oltin, 75-84 = Kumush, <75 = Bronza.
export function getRatingTier(ovr) {
  if (ovr >= 85) return 'gold';
  if (ovr >= 75) return 'silver';
  return 'bronze';
}

export const RATING_TIER_LABELS = {
  gold: "🥇 Oltin",
  silver: "🥈 Kumush",
  bronze: "🥉 Bronza",
};

// Tailwind klasslari — kartochka fon/chegara/matn ranglari
export const RATING_TIER_CLASSES = {
  gold: 'bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-600 text-yellow-950 border-yellow-300',
  silver: 'bg-gradient-to-br from-slate-100 via-slate-300 to-slate-400 text-slate-900 border-slate-200',
  bronze: 'bg-gradient-to-br from-amber-700 via-amber-800 to-amber-900 text-amber-100 border-amber-600',
};
