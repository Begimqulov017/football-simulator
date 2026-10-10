import React, { useEffect, useState } from 'react';
import { API_BASE } from '../career/utils/careerApi';
import { INITIAL_TEAMS } from '../data/teamsData';
import { STATIC_LOGO_IDS } from '../data/logoManifest';

// Logotiplar frontend bilan birga (public/logos/<klub_id>.png) keladi: backend uxlab yotgan yoki eski bo'lsa ham ko'rinadi.
const STATIC_BASE = `${process.env.PUBLIC_URL || ''}/logos`;

// Klub logotipi: serverda server/gamedata/logoData/<id>.png bo'lsa - haqiqiy rasm, bo'lmasa avvalgi emoji.
// Mavjud logotiplar ro'yxati bir marta yuklanadi va hamma komponentlar orasida bo'lishiladi.
let logoFiles = null; // { real_madrid: 'png', ... }
let loading = false;
const subscribers = new Set();

function loadLogoList() {
  if (logoFiles || loading) return;
  loading = true;
  fetch(`${API_BASE}/api/logos`)
    .then((r) => { if (!r.ok) throw new Error('logos http ' + r.status); return r.json(); })
    .then((d) => { logoFiles = (d && d.files) || {}; })
    .catch(() => {
      // Server uxlab yotgan / hali yangilanmagan bo'lishi mumkin: natijani SAQLAB QO'YMAYMIZ,
      // 8 soniyadan keyin qayta uriniladi (avval {} saqlanib, sahifa yangilanmaguncha emoji qolardi).
      logoFiles = null;
      setTimeout(() => { loadLogoList(); }, 8000);
    })
    .finally(() => { loading = false; subscribers.forEach((f) => f()); });
}

export function logoUrlFor(id) {
  const key = id ? String(id).toLowerCase() : '';
  if (key && STATIC_LOGO_IDS.has(key)) return `${STATIC_BASE}/${key}.png`;
  const ext = logoFiles && id ? logoFiles[String(id).toLowerCase()] : null;
  return ext ? `${API_BASE}/api/logo/${String(id).toLowerCase()}.${ext}` : null;
}

export default function TeamLogo({ id, logo, size = 24, className = '', style, title }) {
  const [, force] = useState(0);
  const [broken, setBroken] = useState(false);
  useEffect(() => {
    const f = () => force((x) => x + 1);
    subscribers.add(f);
    loadLogoList();
    return () => { subscribers.delete(f); };
  }, []);
  const url = !broken ? logoUrlFor(id) : null;
  if (url) {
    return (
      <img
        src={url}
        alt=""
        title={title}
        width={size}
        height={size}
        className={className}
        style={{ objectFit: 'contain', verticalAlign: 'middle', display: 'inline-block', ...style }}
        onError={() => setBroken(true)}
        data-team-logo={id}
      />
    );
  }
  return <span className={className} style={style} title={title}>{logo || '\u26BD'}</span>;
}

// Emoji-logo -> klub id. 1) emoji oxiridagi ko'rinmas identifikator (teamsData.js qo'shadi) - aniq;
// 2) eski saqlangan ma'lumotlar uchun: faqat bir klubga tegishli emojilar.
const ID_RE = /\u2060([\u200B\u200C]{10})$/;
const UNIQUE_EMOJI = (() => {
  const strip = (l) => String(l || '').replace(/\u2060[\u200B\u200C]{10}$/, '');
  const count = new Map();
  INITIAL_TEAMS.forEach((t) => count.set(strip(t.logo), (count.get(strip(t.logo)) || 0) + 1));
  const m = new Map();
  INITIAL_TEAMS.forEach((t) => { if (count.get(strip(t.logo)) === 1) m.set(strip(t.logo), t.id); });
  return m;
})();
const EMOJI_TO_ID = {
  get(value) {
    const str = String(value || '');
    const m = str.match(ID_RE);
    if (m) {
      let idx = 0;
      m[1].split('').forEach((ch) => { idx = (idx << 1) | (ch === '\u200C' ? 1 : 0); });
      return INITIAL_TEAMS[idx] ? INITIAL_TEAMS[idx].id : undefined;
    }
    return UNIQUE_EMOJI.get(str);
  },
};

// Hamma joyda ishlatish uchun: `value` klub id'si yoki emoji-logo satri bo'lishi mumkin.
// Serverda haqiqiy logotip bo'lsa - rasm, bo'lmasa - o'sha emoji.
export function TeamBadge({ value, id, size = 20, className = '', style }) {
  const team = INITIAL_TEAMS.find((t) => t.id === id)
    || INITIAL_TEAMS.find((t) => t.id === value)
    || INITIAL_TEAMS.find((t) => t.id === EMOJI_TO_ID.get(value));
  // Klub emas (masalan davlat bayrog'i yoki noma'lum belgi) - berilgan qiymatni o'zini ko'rsatamiz.
  // Klub id berilgan, lekin `value` boshqa belgi (bayroq) bo'lsa ham bayroq saqlanadi.
  if (!team || (value && value !== team.logo && value !== team.id)) return <span className={className} style={style}>{value}</span>;
  return <TeamLogo id={team.id} logo={team.logo} size={size} className={className} style={style} />;
}

// Hook: serverdagi haqiqiy logotip manzili (yo'q bo'lsa null). SVG ichida <img> ishlamaydi,
// shuning uchun g'ildirak bo'laklari <image href=...> uchun shu manzildan foydalanadi.
export function useLogoUrl(id) {
  const [, force] = useState(0);
  useEffect(() => {
    const f = () => force((x) => x + 1);
    subscribers.add(f);
    loadLogoList();
    return () => { subscribers.delete(f); };
  }, []);
  return logoUrlFor(id);
}

// Liga logotipi: server/gamedata/logoData/<liga_id>.png bo'lsa - rasm, bo'lmasa davlat bayrog'i.
export function LeagueBadge({ league, size = 24, className = '', style }) {
  if (!league) return null;
  return <TeamLogo id={league.id} logo={league.flag} size={size} className={className} style={style} title={league.name} />;
}
