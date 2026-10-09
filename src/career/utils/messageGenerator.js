// PHASE 6 — Dynamic Messages & Notifications.
//
// Pure helpers for the inbox:
//  - categoryOf / unreadCounts : shared by Navbar (AppShell) and MessagesPage
//  - generateMessages(player)  : procedural messages derived from the player's
//    CURRENT state (last match, stamina, caps, milestones...). Every message
//    has a deterministic id, so calling this on every render is safe - the
//    hook (useProceduralMessages) only appends ids that are not in the inbox yet.
//
// No Math.random() here on purpose: variety comes from hashing the match /
// event id, so the same event always produces the same text (and never twice).

import { INITIAL_TEAMS } from '../../data/teamsData';
import { getMergedSquad } from '../data/clubRosterStore';
import { flagOfNation } from '../international/calendar';

// ---------------------------------------------------------------------------
// Categories (inbox tabs)
// ---------------------------------------------------------------------------
export const INBOX_TABS = [
  { key: 'all', label: 'Hammasi' },
  { key: 'coach', label: 'Murabbiy' },
  { key: 'club', label: 'Klub' },
  { key: 'national', label: 'Terma jamoa' },
  { key: 'system', label: 'Tizim' },
  { key: 'starred', label: 'Belgilangan' }
];

// Old messages (made by season.js / server) have no `category`, so it is
// derived from `type`. Anything unknown falls back to Club.
export function categoryOf(m) {
  if (m.category) return m.category;
  if (m.type === 'coach') return 'coach';
  if (m.type === 'national') return 'national';
  if (m.type === 'system' || m.from === 'League Awards' || m.from === 'Liga mukofotlari') return 'system';
  return 'club'; // club, transfer, contract, scout, teammate, milestone
}

export function unreadCounts(messages = []) {
  const out = { total: 0, coach: 0, club: 0, national: 0, system: 0, starred: 0 };
  messages.forEach((m) => {
    if (m.read) return;
    out.total += 1;
    out[categoryOf(m)] += 1;
    if (m.starred) out.starred += 1;
  });
  return out;
}

// ---------------------------------------------------------------------------
// Tiny deterministic helpers
// ---------------------------------------------------------------------------
function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
const pickBy = (arr, seed) => arr[hash(String(seed)) % arr.length];
const fill = (tpl, vars) => tpl.replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? ''));
const highestReached = (value, steps) => steps.filter((s) => value >= s).pop();
const FORM_UZ = { Poor: 'yomon', Average: "o'rtacha", Good: 'yaxshi', Excellent: "a'lo" };
const formUz = (f) => FORM_UZ[f] || f;
const fmtRating = (r) => (Number.isFinite(Number(r)) ? Number(r).toFixed(1) : '-');

const make = (id, fields) => ({
  id, read: false, resolved: true, generated: true, ...fields
});

// ---------------------------------------------------------------------------
// 1) Post-match performance report (Coach)
// ---------------------------------------------------------------------------
const VERDICTS = {
  elite: [
    "Bu mukammal o'yin edi — aynan biz sizdan kutgan daraja.",
    "Birinchi daqiqadan oxirgisigacha jahon darajasida. Raqiblar bu o'yinni o'rganib chiqadi.",
    "Bugun o'yin taqdirini siz hal qildingiz. Shu darajani saqlasangiz, katta klublar e'tibor beradi."
  ],
  good: [
    "Ishonchli, barqaror o'yin. O'z ishingizni a'lo bajardingiz.",
    "Bugun shiddat ham, qarorlar ham yaxshi edi — chempionlik shunday qozoniladi.",
    "Ijobiy o'yin. Hujumda sal aniqroq bo'lsangiz, mukammal bo'lardi."
  ],
  average: [
    "Yomon emas, lekin eng yaxshi o'yiningiz emas. Kuchingiz bundan ko'p — keyingi safar ko'rsating.",
    "O'yinda qatnashdingiz, ammo ba'zi to'plarni yo'qotdingiz. Mashg'ulotda ustida ishlang.",
    "Sokin kun bo'ldi. Xavotirga hojat yo'q, lekin quvonadigan joyi ham yo'q."
  ],
  poor: [
    "Bugun o'z darajangizdan past o'ynadingiz. Esdan chiqaring, lavhalarni ko'rib chiqing va qayta boshlang.",
    "Og'ir kun bo'ldi. Bunday kunlar hammada bo'ladi — muhimi, keyingi munosabat.",
    "Sur'atdan bir qadam orqada ko'rindingiz. Dam oling, sizni yana izga tushiramiz."
  ]
};

function matchReport(player, last) {
  const diff = last.golFor - last.golAgainst;
  const resultWord = diff > 0 ? "G'alaba" : diff < 0 ? "Mag'lubiyat" : 'Durang';
  const tier = last.rating >= 8.5 ? 'elite' : last.rating >= 7 ? 'good' : last.rating >= 6 ? 'average' : 'poor';

  let body = `${resultWord} ${last.golFor}-${last.golAgainst} (${last.opponent} ${last.isHome ? 'bilan uyda' : 'safarida'}). `;
  body += `Siz ${last.minutes} daqiqa o'ynadingiz, bahoyingiz ${fmtRating(last.rating)}/10`;
  if (last.goals) body += `, ${last.goals} ta gol urdingiz`;
  if (last.assists) body += `${last.goals ? ' va' : ','} ${last.assists} ta assist berdingiz`;
  body += '. ';
  if (last.mvp) body += "Siz o'yinning eng yaxshi futbolchisi bo'ldingiz. ";
  body += pickBy(VERDICTS[tier], `${last.id}_v`);
  if (player.career.form) body += ` So'nggi formangiz: ${formUz(player.career.form)}.`;

  return make(`gen_report_${last.id}`, {
    type: 'coach', date: last.date, from: `Bosh murabbiy · ${player.club.name}`,
    subject: `O'yin hisoboti: ${last.opponent}`, body
  });
}

// ---------------------------------------------------------------------------
// 2) Coach advice - rotation / stamina management / starting XI readiness
// ---------------------------------------------------------------------------
function coachAdvice(player, last) {
  const { career, club } = player;
  const stamina = Number.isFinite(career.stamina) ? career.stamina : 100;
  const base = { type: 'coach', date: last.date, from: `Bosh murabbiy · ${club.name}` };
  const id = `gen_advice_${last.id}`;

  if (career.injury) {
    return make(id, {
      ...base, subject: "Avval sog'ayib oling",
      body: `Jarohatdan shoshilib qaytmang. Shifokorlar yana taxminan ${career.injury.daysLeft || 0} kun kerak deyapti. Tarkibdagi o'rningiz saqlanadi — avval tuzaling, keyin asosiy 11lik haqida gaplashamiz.`
    });
  }
  if (stamina < 35) {
    return make(id, {
      ...base, subject: "Rotatsiya rejasi: sizga dam beramiz",
      body: `Chidamliligingiz ${stamina}% ga tushdi. Jarohat olmasligingiz uchun sizni almashtirib o'ynatmoqchiman — keyingi o'yinda zaxirada yoki kamroq rolda bo'lishingiz mumkin. Og'ir mashg'ulotni qoldiring, tanangiz tiklansin.`
    });
  }
  if (stamina < 65) {
    return make(id, {
      ...base, subject: 'Chidamlilikni boshqarish',
      body: `Chidamliligingiz ${stamina}%. O'yin uchun yetarli, lekin charchagan futbolchi xato qiladi va ko'proq jarohat oladi. Bu hafta mashg'ulotni yengil qiling, bo'sh kunlar kuchingizni tiklasin.`
    });
  }
  // Yetarlicha tetik — pochta to'lib ketmasligi uchun faqat ba'zi o'yinlardan keyin yuboriladi.
  if (hash(`${last.id}_xi`) % 2 !== 0) return null;
  const inForm = career.form === 'Good' || career.form === 'Excellent';
  return make(id, {
    ...base,
    subject: inForm ? "Asosiy 11lik: siz rejadasiz" : "Asosiy 11lik: hech narsa kafolatlanmagan",
    body: inForm
      ? `Chidamlilik ${stamina}%, forma ${formUz(career.form)}. Siz tetik va o'tkirsiz — keyingi o'yinda asosiy 11likka chaqirilishingiz kutiladi.`
      : `Chidamlilik ${stamina}% — jismonan tayyorsiz, lekin forma ${formUz(career.form || 'Average')}. Asosiy 11likdagi o'rin sizniki, faqat uni yo'qotmang: mashg'ulotda nimadir ko'rsating.`
  });
}

// ---------------------------------------------------------------------------
// 3) Teammate dialogues (5 dynamic lines per situation)
// ---------------------------------------------------------------------------
const MATE_LINES = {
  scorer: [
    "{opponent}ga qarshi qanday gol edi! Bugun kechqurun ichimliklar sizdan.",
    "{goals_word} urdingiz — kiyinish xonasidagi musiqa ro'yxatida ham mening o'rnimni olmoqchimisiz?",
    "Bu gol ishonib bo'lmas edi. Hali ham xayolimda qayta ko'ryapman.",
    "Shunday gol urishda davom etsangiz, butun stadion nomingizni kuylaydi.",
    "Rostini aytsam, men shunchaki yugurdim — sehrni siz qildingiz. Ajoyib gol!"
  ],
  great: [
    "Bugun hamma joyda siz edingiz. Ajoyib o'yin, do'stim!",
    "Murabbiy kiyinish xonasida o'yiningizdan juda xursand edi.",
    "Siz bilan yonma-yon o'ynash mening ishimni yengillashtiradi. Shu seriyani davom ettiramiz.",
    "{opponent}ga qarshi bu o'yin uch ochkoga munosib edi.",
    "Har hafta shunday o'ynasangiz, ligani yutamiz."
  ],
  average: [
    "Eng yaxshi o'yinimiz emas, lekin o'tib oldik. Keyingisiga.",
    "{opponent}ga qarshi qiyin o'yin bo'ldi. Ertaga qo'shimcha pas mashqi qilamizmi?",
    "Tez orada tushunishamiz, his qilyapman. Boshingizni tik tuting.",
    "Bugun farq mayda narsalarda edi. Mashg'ulotda to'g'rilaymiz.",
    "Keyinroq qahva ichamizmi? O'yinni birga ko'rib chiqamiz."
  ],
  bad: [
    "Bugungi o'yin uchun xavotir olmang. Butun mavsumda bitta yomon o'yin hech narsa emas.",
    "Og'ir o'yin bo'ldi, lekin hammamiz birgamiz. Qaytamiz.",
    "Men bundan yomonroq kunlarni ham ko'rganman, ishoning. Bosh ko'tarib turing.",
    "Ertaga qo'shimcha zarba mashqi qilamizmi? Ikkimizga ham foydasi bo'ladi.",
    "Muxlislar nimaga qodir ekaningizni biladi. Men ham bilaman."
  ],
  injured: [
    "Maydonni tark etganingizga afsusdaman. Shoshilmang — biz o'rningizni saqlaymiz.",
    "Tezroq tuzaling! Kiyinish xonasi sizsiz avvalgidek emas.",
    "Reabilitatsiyani to'g'ri o'ting, shoshilmang. Bizga 100% holatda kerak bo'lasiz.",
    "Jarohat haqida eshitdim. Biror narsa kerak bo'lsa, ayting.",
    "Dam oling. Qaytguningizcha shkafingizni saqlab turaman."
  ]
};

function teammateChat(player, last) {
  if (hash(`${last.id}_mate`) % 100 >= 25) return null; // ~1 game in 4

  const mood = last.injured ? 'injured'
    : last.goals > 0 ? 'scorer'
    : last.rating >= 7.5 ? 'great'
    : last.rating >= 6 ? 'average' : 'bad';

  let mate = { name: 'Jamoadosh' };
  try {
    const team = INITIAL_TEAMS.find((t) => t.id === player.club.id);
    const squad = team ? getMergedSquad(team).filter((p) => p.id !== player.id) : [];
    if (squad.length) mate = squad[hash(`${last.id}_who`) % squad.length];
  } catch (e) { /* roster store unavailable - keep generic name */ }

  const body = fill(pickBy(MATE_LINES[mood], `${last.id}_line`), {
    opponent: last.opponent,
    goals_word: last.goals > 1 ? `${last.goals} ta gol` : 'Bitta gol'
  });
  return make(`gen_mate_${last.id}`, {
    type: 'teammate', date: last.date, from: mate.name || 'Jamoadosh',
    subject: `${mate.name || 'Jamoadosh'}dan xabar`, body
  });
}

// ---------------------------------------------------------------------------
// 4) National team call-ups and milestones (National)
// ---------------------------------------------------------------------------
const CAP_STEPS = [1, 10, 25, 50, 100];

function nationalMessages(player) {
  const intl = player.career.international;
  if (!intl) return [];
  const out = [];
  const country = intl.country || player.nationality || 'Vataningiz';
  const flag = flagOfNation(country);
  const from = `${flag} ${country} Futbol assotsiatsiyasi`;

  const cu = intl.lastCallUp;
  if (cu && cu.date) {
    let body = `Tabriklaymiz! Siz ${country} terma jamoasiga chaqirildingiz: ${cu.competition || 'xalqaro o\u02bbyin'}, raqib — ${cu.opponent || 'raqiblarimiz'}.`;
    if (cu.rating) {
      body += ` O'yin bahoyingiz: ${fmtRating(cu.rating)}`;
      body += cu.goals ? `, ${cu.goals} ta gol urdingiz.` : '.';
    }
    out.push(make(`gen_callup_${cu.date}_${cu.competition || ''}_${cu.opponent || ''}`, {
      type: 'national', date: cu.date, from, subject: `Terma jamoaga chaqiruv: ${country}`, body
    }));
  }

  const capStep = highestReached(intl.caps || 0, CAP_STEPS);
  if (capStep) {
    out.push(make(`gen_caps_${capStep}`, {
      type: 'national', date: player.career.gameDate, from,
      subject: capStep === 1 ? "Terma jamoadagi birinchi o'yiningiz!" : `Marra: ${country} uchun ${capStep} ta o'yin`,
      body: capStep === 1
        ? `Siz ${country} terma jamoasida debyut qildingiz. Bu lahzani umr bo'yi eslaysiz — barakalla!`
        : `${country} terma jamoasida ${capStep} ta o'yinga yetganingiz bilan tabriklaymiz. Siz terma jamoaning haqiqiy yetakchisiga aylanyapsiz.`
    }));
  }

  const trophy = (intl.trophies || []).slice(-1)[0];
  if (trophy) {
    out.push(make(`gen_intl_trophy_${trophy.name}_${trophy.year}`, {
      type: 'national', date: player.career.gameDate, from,
      subject: `Chempionlar: ${trophy.name} ${trophy.year}`,
      body: `${country} ${trophy.name} ${trophy.year} turnirini yutdi va siz ham shu g'alabaning bir qismisiz. Tabriklaymiz — bu tarix!`
    }));
  }
  return out;
}

// ---------------------------------------------------------------------------
// 5) Career milestones (Club)
// ---------------------------------------------------------------------------
const MILESTONES = [
  { key: 'goals', field: 'goals', steps: [10, 25, 50, 100, 150, 200, 300], text: (n) => `karyerada ${n} ta gol` },
  { key: 'apps', field: 'appearances', steps: [25, 50, 100, 200, 300], text: (n) => `karyerada ${n} ta o'yin` },
  { key: 'mvp', field: 'mvpCount', steps: [5, 10, 25], text: (n) => `${n} marta o'yin eng yaxshisi` }
];

function milestoneMessages(player) {
  const out = [];
  MILESTONES.forEach(({ key, field, steps, text }) => {
    const step = highestReached(player.career[field] || 0, steps);
    if (!step) return;
    out.push(make(`gen_ms_${key}_${step}`, {
      type: 'milestone', date: player.career.gameDate, from: player.club.name,
      subject: `Marra: ${text(step)}`,
      body: `${player.club.name} jamoasi nomidan tabriklaymiz! Siz ${text(step)} ga yetdingiz. Raqamlar o'zi gapiradi — davom eting.`
    }));
  });
  return out;
}

// ---------------------------------------------------------------------------
// 6) One-off system notice
// ---------------------------------------------------------------------------
function welcomeMessage(player) {
  return make('gen_system_welcome', {
    type: 'system', date: player.career.gameDate, from: 'Tizim',
    subject: "Xabarlar bo'limi yangilandi",
    body: "Xabarlar endi Murabbiy, Klub, Terma jamoa va Tizim bo'limlariga ajratiladi. Istalgan xabardagi yulduzchani bossangiz, u «Belgilangan» bo'limiga tushadi. Menyudagi qizil nuqta o'qilmagan xabar borligini bildiradi."
  });
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------
export function generateMessages(player) {
  if (!player?.career || !player.club) return [];
  const out = [welcomeMessage(player)];

  const last = (player.career.matchHistory || []).slice(-1)[0];
  if (last && last.id) {
    out.push(matchReport(player, last));
    const advice = coachAdvice(player, last);
    if (advice) out.push(advice);
    const chat = teammateChat(player, last);
    if (chat) out.push(chat);
  }

  out.push(...nationalMessages(player), ...milestoneMessages(player));
  return out;
}
