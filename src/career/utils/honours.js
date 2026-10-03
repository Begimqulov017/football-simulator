// ---------------------------------------------------------------------------
// Shared honours model (Profile "Honours" tab + Club "Trophy cabinet").
// career.trophies turli formatda: client obyektlari {name, year, icon}, server
// satrlari ("World Cup 2026", "Oltin to'p ... · 1-mavsum"), career.awards va
// career.international.trophies. Hammasi bitta ro'yxatga yig'iladi, dublikatlar
// olib tashlanadi.
// kind: 'individual' | 'club' | 'country'
// ---------------------------------------------------------------------------
export const yearOf = (s) => { const m = String(s || '').match(/^(\d{4})/); return m ? Number(m[1]) : null; };

const AWARD_META = {
  ballon_dor: { icon: '🥇', title: "Ballon d'Or" },
  golden_boot: { icon: '👟', title: 'Golden Boot' },
  team_of_season: { icon: '🌟', title: 'Team of the Season' },
};
const INDIVIDUAL_TEXT = /oltin to'p|ballon|oltin batinka|golden boot|mavsumning eng yaxshi tarkibi|team of the season/i;

export function buildHonours(player) {
  const career = player.career || {};
  const map = new Map();
  const add = (h) => { if (!map.has(h.key)) map.set(h.key, h); };

  // 1) Individual: server mukofotlari
  (career.awards || []).forEach((a) => {
    const meta = AWARD_META[a.type];
    if (!meta) return;
    const year = yearOf(a.date);
    add({
      key: a.type === 'golden_boot' && year ? `golden_boot_${year}` : `ind_${a.type}_${a.season}_${a.league}`,
      kind: 'individual', type: a.type, icon: meta.icon, title: meta.title,
      sub: `${a.league || 'League'} · Season ${a.season}`, year,
    });
  });

  // 2) Klub / individual: client tomonidan yozilgan obyektlar va server satrlari
  (career.trophies || []).forEach((t) => {
    if (t && typeof t === 'object') {
      if (/golden boot/i.test(t.name)) {
        add({ key: `golden_boot_${t.year}`, kind: 'individual', type: 'golden_boot', icon: '👟', title: 'Golden Boot', sub: t.name.replace(/\s*golden boot/i, '') || 'League', year: t.year });
      } else {
        add({ key: `club_${t.name}_${t.year}`, kind: 'club', type: 'club', icon: t.icon || '🏆', title: t.name, sub: t.icon === '🌍' ? 'Continental' : 'Club silverware', year: t.year });
      }
      return;
    }
    if (typeof t !== 'string' || INDIVIDUAL_TEXT.test(t)) return; // individuallar career.awards da bor
    const m = t.match(/^(.*?)\s*(\d{4})\s*$/);
    const name = m ? m[1].trim() : t;
    const year = m ? Number(m[2]) : null;
    add({ key: `country_${name}_${year}`, kind: 'country', type: 'country', icon: '🌍', title: name, sub: 'National team', year });
  });

  // 3) Terma jamoa kubogi
  (career.international?.trophies || []).forEach((t) => {
    add({ key: `country_${t.name}_${t.year}`, kind: 'country', type: 'country', icon: '🌍', title: t.name, sub: t.country ? `With ${t.country}` : 'National team', year: t.year });
  });

  return [...map.values()].sort((a, b) => (b.year || 0) - (a.year || 0) || a.title.localeCompare(b.title));
}
