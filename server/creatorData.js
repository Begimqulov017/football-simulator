// ============================================================
// CREATOR: Excel orqali klub va futbolchi ma'lumotlarini yuklash
// ============================================================
// Excel (Clubs + Players varaqlari) brauzerda JSON'ga o'giriladi va shu yerga yuboriladi.
// Bu modul: 1) ma'lumotni TEKSHIRADI (xatolar qator raqami bilan), 2) o'yin ma'lumotiga QO'SHADI
// (INITIAL_TEAMS / LEAGUES xotirada o'zgaradi va baza `db.customData` ga yoziladi, server qayta
// ishga tushganda qaytadan qo'llanadi), 3) hammasini QAYTARISH (asl holatga) imkonini beradi.
// Faqat creator kira oladi (creatorMiddleware).
// ============================================================
const { INITIAL_TEAMS } = require('./gamedata/teamsData');
const { LEAGUES, NATIONALITIES } = require('./gamedata/leaguesData');

const POSITIONS = ['GK', 'RB', 'CB', 'LB', 'CDM', 'CM', 'CAM', 'LM', 'RM', 'LW', 'RW', 'ST'];
const POS_ALIAS = { LWB: 'LB', RWB: 'RB', CF: 'ST', SS: 'CAM', DM: 'CDM', AM: 'CAM', FW: 'ST', DF: 'CB' };
const OUT_KEYS = ['pac', 'sho', 'pas', 'dri', 'def', 'phy'];
const GK_KEYS = ['div', 'han', 'kic', 'ref', 'spd', 'pos'];
const MIN_PLAYERS = 20;
const MIN_GK = 2;
const MAX_PLAYERS = 60;
const MAX_LOGO_BYTES = 60 * 1024;
const MAX_LOGOS_TOTAL = 6 * 1024 * 1024;
const NATION_NAMES = new Set((NATIONALITIES || []).map((n) => (typeof n === 'string' ? n : n.name)));
const NATION_LOWER = new Map([...NATION_NAMES].map((n) => [n.toLowerCase(), n]));
const NATION_ALIAS = {
  'united states': 'USA', 'united states of america': 'USA', 'us': 'USA', 'czech republic': 'Czechia', 'czechia': 'Czechia',
  "côte d'ivoire": 'Ivory Coast', "cote d'ivoire": 'Ivory Coast', 'korea republic': 'South Korea', 'republic of korea': 'South Korea',
  'korea dpr': 'North Korea', 'türkiye': 'Turkey', 'turkiye': 'Turkey', 'congo dr': 'DR Congo', 'dr congo': 'DR Congo',
  'democratic republic of the congo': 'DR Congo', 'curacao': 'Curaçao', 'cape verde islands': 'Cape Verde', 'cabo verde': 'Cape Verde',
  'bosnia': 'Bosnia and Herzegovina', 'bosnia-herzegovina': 'Bosnia and Herzegovina', 'uae': 'United Arab Emirates', 'ksa': 'Saudi Arabia',
  'holland': 'Netherlands', 'the netherlands': 'Netherlands', 'china pr': 'China', 'ir iran': 'Iran', 'uzbekistan': 'Uzbekistan',
};

// ----- Asl (o'rnatilgan) ma'lumot surati: "qaytarish" uchun -----
const BASE = {
  teamCount: INITIAL_TEAMS.length,
  squads: new Map(INITIAL_TEAMS.map((t) => [t.id, t.squad])),
  teamMeta: new Map(INITIAL_TEAMS.map((t) => [t.id, { name: t.name, logo: t.logo }])),
  leagueTeamIds: new Map(LEAGUES.map((l) => [l.id, l.teamIds.slice()])),
};

const str = (v) => (v == null ? '' : String(v).trim());
const toInt = (v) => {
  if (v == null || v === '') return NaN;
  const n = Number(String(v).replace(',', '.'));
  return Number.isFinite(n) ? Math.round(n) : NaN;
};
const slug = (s) => String(s || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');

function leagueOfClub(clubId) {
  const l = LEAGUES.find((x) => x.teamIds.includes(clubId));
  return l ? l.id : null;
}

// Emoji-logoga ko'rinmas identifikator (jamoa tartib raqami) qo'shadi - teamsData.js dagi bilan BIR XIL.
function withMarker(emoji, index) {
  let bits = '';
  for (let b = 9; b >= 0; b -= 1) bits += (index >> b) & 1 ? '\u200C' : '\u200B';
  return `${emoji}\u2060${bits}`;
}
const stripMarker = (l) => String(l || '').replace(/\u2060[\u200B\u200C]{10}$/, '');

// ------------------------------------------------------------
// TEKSHIRUV
// ------------------------------------------------------------
// payload: { clubs: [{league_id, club_id, club_name, colors, _row}], players: [{club_id, name, nationality, pos, ovr, s1..s6, _row}] }
function validate(payload) {
  const errors = []; const warnings = [];
  const err = (sheet, row, msg) => errors.push({ sheet, row, msg });
  const warn = (sheet, row, msg) => warnings.push({ sheet, row, msg });
  const clubsIn = Array.isArray(payload?.clubs) ? payload.clubs : [];
  const playersIn = Array.isArray(payload?.players) ? payload.players : [];
  if (!clubsIn.length) err('Clubs', 0, "«Clubs» varag'i bo'sh yoki topilmadi.");
  if (!playersIn.length) err('Players', 0, "«Players» varag'i bo'sh yoki topilmadi.");
  if (errors.length) return { ok: false, errors, warnings, clubs: [], totals: { clubs: 0, players: 0 }, parsed: [] };

  const leagueIds = new Set(LEAGUES.map((l) => l.id));
  const clubs = new Map();
  clubsIn.forEach((c, i) => {
    const row = c._row || i + 2;
    const clubId = str(c.club_id).toLowerCase();
    const leagueId = str(c.league_id).toLowerCase();
    const name = str(c.club_name);
    if (!clubId && !name && !leagueId) return; // bo'sh qator
    if (!/^[a-z0-9_]{2,40}$/.test(clubId)) { err('Clubs', row, `club_id noto'g'ri: «${c.club_id ?? ''}» (faqat kichik lotin harf, raqam va _ ; 2-40 belgi)`); return; }
    if (clubs.has(clubId)) { err('Clubs', row, `club_id takrorlangan: ${clubId}`); return; }
    if (!leagueIds.has(leagueId)) { err('Clubs', row, `league_id noma'lum: «${c.league_id ?? ''}». Mumkin: ${[...leagueIds].join(', ')}`); return; }
    if (!name) { err('Clubs', row, `club_name bo'sh (${clubId})`); return; }
    const existing = INITIAL_TEAMS.find((t) => t.id === clubId);
    if (existing) {
      const own = leagueOfClub(clubId);
      if (own && own !== leagueId) { err('Clubs', row, `${clubId} hozir «${own}» ligasida, siz «${leagueId}» deb yozgansiz`); return; }
    } else {
      const same = INITIAL_TEAMS.find((t) => String(t.name).toLowerCase() === name.toLowerCase());
      if (same) warn('Clubs', row, `«${name}» nomli klub allaqachon bor (id: ${same.id}). Bu yangi klub (${clubId}) sifatida qo'shiladi - takror bo'lsa club_id ni mavjud id ga o'zgartiring.`);
    }
    const colors = str(c.colors);
    if (colors.length > 12) { err('Clubs', row, `colors juda uzun (${clubId}): faqat 2 ta rangli doira emoji yozing`); return; }
    clubs.set(clubId, { clubId, leagueId, name, colors: colors || '⚽', row, existing: !!existing, players: [] });
  });

  const seenNames = new Map();
  playersIn.forEach((p, i) => {
    const row = p._row || i + 2;
    const clubId = str(p.club_id).toLowerCase();
    const name = str(p.name);
    if (!clubId && !name) return; // bo'sh qator
    const club = clubs.get(clubId);
    if (!club) { err('Players', row, `club_id «${p.club_id ?? ''}» «Clubs» varag'ida yo'q`); return; }
    if (!name) { err('Players', row, `Ism bo'sh (${clubId})`); return; }
    let pos = str(p.pos).toUpperCase();
    if (POS_ALIAS[pos]) { warn('Players', row, `${name}: ${pos} -> ${POS_ALIAS[pos]} ga o'zgartirildi`); pos = POS_ALIAS[pos]; }
    if (!POSITIONS.includes(pos)) { err('Players', row, `${name}: pos noto'g'ri «${p.pos ?? ''}». Mumkin: ${POSITIONS.join(', ')}`); return; }
    const ovr = toInt(p.ovr);
    if (!Number.isFinite(ovr) || ovr < 40 || ovr > 99) { err('Players', row, `${name}: ovr 40-99 oralig'ida bo'lishi kerak (yozilgan: «${p.ovr ?? ''}»)`); return; }
    const stats = [];
    for (let k = 1; k <= 6; k += 1) {
      const v = toInt(p[`s${k}`]);
      if (!Number.isFinite(v) || v < 1 || v > 99) { err('Players', row, `${name}: s${k} 1-99 oralig'ida bo'lishi kerak (yozilgan: «${p[`s${k}`] ?? ''}»)`); return; }
      stats.push(v);
    }
    let nat = str(p.nationality);
    if (!nat) { warn('Players', row, `${name}: millat bo'sh`); nat = 'Unknown'; }
    else if (!NATION_NAMES.has(nat)) {
      const fix = NATION_LOWER.get(nat.toLowerCase()) || NATION_ALIAS[nat.toLowerCase()];
      if (fix && NATION_NAMES.has(fix)) nat = fix;
      else warn('Players', row, `${name}: millat «${nat}» o'yin ro'yxatida yo'q (o'zi saqlanadi)`);
    }
    const dupKey = `${clubId}|${name.toLowerCase()}`;
    if (seenNames.has(dupKey)) { err('Players', row, `${name} ${clubId} klubida takrorlangan (avval ${seenNames.get(dupKey)}-qatorda)`); return; }
    seenNames.set(dupKey, row);
    if (club.players.length >= MAX_PLAYERS) { err('Players', row, `${clubId}: ${MAX_PLAYERS} tadan ortiq o'yinchi bo'lmasin`); return; }
    club.players.push({ name, nat, pos, ovr, stats, row });
  });

  const parsed = [];
  clubs.forEach((c) => {
    const gk = c.players.filter((p) => p.pos === 'GK').length;
    if (c.players.length < MIN_PLAYERS) err('Clubs', c.row, `${c.clubId}: kamida ${MIN_PLAYERS} ta o'yinchi kerak (hozir ${c.players.length})`);
    if (gk < MIN_GK) err('Clubs', c.row, `${c.clubId}: kamida ${MIN_GK} ta darvozabon (GK) kerak (hozir ${gk})`);
    const sorted = c.players.slice().sort((a, b) => b.ovr - a.ovr);
    parsed.push({
      clubId: c.clubId, leagueId: c.leagueId, name: c.name, colors: c.colors, existing: c.existing,
      players: c.players.length, gk, topOvr: sorted[0]?.ovr || 0,
      avgOvr: sorted.length ? Math.round((sorted.slice(0, 11).reduce((s, p) => s + p.ovr, 0) / Math.min(11, sorted.length)) * 10) / 10 : 0,
      squadRaw: sorted,
    });
  });
  return {
    ok: errors.length === 0, errors, warnings,
    clubs: parsed.map(({ squadRaw, ...rest }) => rest),
    totals: { clubs: parsed.length, players: parsed.reduce((s, c) => s + c.players, 0) },
    parsed,
  };
}

// ------------------------------------------------------------
// Klub tarkibini o'yin formatiga o'tkazish (id'lar barqaror va takrorlanmas)
// ------------------------------------------------------------
function buildSquad(clubId, raw, takenIds) {
  const used = new Set(takenIds);
  return raw.map((p) => {
    const parts = p.name.split(/\s+/);
    const base = slug(parts[parts.length - 1] || p.name) || 'player';
    const ini = parts.length > 1 ? slug(parts[0]).slice(0, 1) : '';
    const root = ini ? `${base}_${ini}` : base;
    let pid = root; let k = 2;
    while (used.has(pid)) { pid = `${root}${k}`; k += 1; }
    used.add(pid);
    const keys = p.pos === 'GK' ? GK_KEYS : OUT_KEYS;
    const stats = {}; keys.forEach((key, i) => { stats[key] = p.stats[i]; });
    return { id: pid, name: p.name, nat: p.nat, pos: p.pos, ovr: p.ovr, stats };
  });
}

// ------------------------------------------------------------
// O'YINGA QO'LLASH (xotirada): db.customData -> INITIAL_TEAMS / LEAGUES
// ------------------------------------------------------------
let version = 0;
const listeners = [];
const onChange = (fn) => listeners.push(fn);

function applyCustomData(db) {
  const cd = db && db.customData;
  version = (cd && cd.version) || 0;
  if (!cd || !Array.isArray(cd.clubs)) { listeners.forEach((f) => f()); return; }
  cd.clubs.forEach((c) => {
    const squadCopy = c.squad.map((p) => ({ ...p, stats: { ...p.stats } }));
    const ex = INITIAL_TEAMS.find((t) => t.id === c.id);
    if (ex) {
      ex.squad = squadCopy;
    } else {
      INITIAL_TEAMS.push({ id: c.id, name: c.name, logo: withMarker(c.logo || '⚽', INITIAL_TEAMS.length), squad: squadCopy });
    }
    const league = LEAGUES.find((l) => l.id === c.leagueId);
    if (league && !league.teamIds.includes(c.id)) league.teamIds.push(c.id);
  });
  listeners.forEach((f) => f());
}

// Barcha yuklangan ma'lumotni olib tashlab, o'rnatilgan holatga qaytaradi.
function revertToBase() {
  while (INITIAL_TEAMS.length > BASE.teamCount) INITIAL_TEAMS.pop();
  INITIAL_TEAMS.forEach((t) => { if (BASE.squads.has(t.id)) t.squad = BASE.squads.get(t.id); });
  LEAGUES.forEach((l) => {
    const ids = BASE.leagueTeamIds.get(l.id);
    if (ids) { l.teamIds.length = 0; ids.forEach((id) => l.teamIds.push(id)); }
  });
}

function staleWorlds(db, leagueIds) {
  const marked = [];
  leagueIds.forEach((id) => {
    const w = db.leagueWorlds && db.leagueWorlds[id];
    if (w) { w.dataVersion = -1; marked.push(id); }
  });
  return marked;
}

function validDataUri(s) {
  return typeof s === 'string' && /^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(s) && Buffer.byteLength(s, 'utf8') <= MAX_LOGO_BYTES * 1.4;
}

function register(app, ctx) {
  const { authMiddleware, creatorMiddleware, readDB, writeDB } = ctx;

  // Hamma uchun ochiq: klub ma'lumoti (ilova ochilganda mijoz shuni oladi)
  app.get('/api/data/custom', (req, res) => {
    const db = readDB();
    const cd = db.customData || { version: 0, clubs: [] };
    if (String(req.query.v) === String(cd.version || 0)) return res.json({ ok: true, version: cd.version || 0, unchanged: true });
    res.json({
      ok: true,
      version: cd.version || 0,
      clubs: (cd.clubs || []).map((c) => ({ id: c.id, name: c.name, logo: c.logo, leagueId: c.leagueId, squad: c.squad })),
    });
  });

  app.get('/api/creator/import/status', authMiddleware, creatorMiddleware, (req, res) => {
    const db = readDB();
    const cd = db.customData || { version: 0, clubs: [], logos: {} };
    res.json({
      ok: true, version: cd.version || 0, updatedAt: cd.updatedAt || null, by: cd.by || null,
      logoCount: Object.keys(cd.logos || {}).length,
      leagues: LEAGUES.map((l) => ({ id: l.id, name: l.name, clubs: l.teamIds.length })),
      clubs: (cd.clubs || []).map((c) => ({ id: c.id, name: c.name, leagueId: c.leagueId, players: c.squad.length, updatedAt: c.updatedAt, hasLogo: !!(cd.logos || {})[c.id] })),
    });
  });

  app.post('/api/creator/import/validate', authMiddleware, creatorMiddleware, (req, res) => {
    const r = validate(req.body || {});
    res.json({ ok: r.ok, errors: r.errors.slice(0, 300), errorCount: r.errors.length, warnings: r.warnings.slice(0, 300), warningCount: r.warnings.length, clubs: r.clubs, totals: r.totals });
  });

  app.post('/api/creator/import/apply', authMiddleware, creatorMiddleware, (req, res) => {
    const body = req.body || {};
    const r = validate(body);
    if (!r.ok) return res.json({ ok: false, error: `${r.errors.length} ta xato bor - avval tuzating`, errors: r.errors.slice(0, 300), errorCount: r.errors.length });
    const db = readDB();
    const cd = db.customData && Array.isArray(db.customData.clubs) ? db.customData : { version: 0, clubs: [], logos: {} };
    cd.logos = cd.logos || {};

    // Logolar (ixtiyoriy): { club_id: 'data:image/png;base64,...' }
    const logosIn = body.logos && typeof body.logos === 'object' ? body.logos : {};
    const knownIds = new Set([...r.parsed.map((c) => c.clubId), ...INITIAL_TEAMS.map((t) => t.id)]);
    let logoCount = 0; const logoWarn = [];
    Object.entries(logosIn).forEach(([id, uri]) => {
      const key = String(id).toLowerCase();
      if (!knownIds.has(key)) { logoWarn.push(`Logo «${id}»: bunday club_id yo'q`); return; }
      if (!validDataUri(uri)) { logoWarn.push(`Logo «${id}»: PNG emas yoki hajmi katta`); return; }
      cd.logos[key] = uri; logoCount += 1;
    });
    const total = Object.values(cd.logos).reduce((s, u) => s + u.length, 0);
    if (total > MAX_LOGOS_TOTAL) return res.json({ ok: false, error: "Logolar umumiy hajmi juda katta (6 MB dan oshmasin)" });

    // Boshqa klublarning o'yinchi id'lari bilan to'qnashmaslik uchun band id'lar
    const importedIds = new Set(r.parsed.map((c) => c.clubId));
    const taken = new Set();
    INITIAL_TEAMS.forEach((t) => { if (!importedIds.has(t.id)) t.squad.forEach((p) => taken.add(p.id)); });
    (cd.clubs || []).forEach((c) => { if (!importedIds.has(c.id)) c.squad.forEach((p) => taken.add(p.id)); });

    const now = new Date().toISOString();
    r.parsed.forEach((c) => {
      const squad = buildSquad(c.clubId, c.squadRaw, taken);
      squad.forEach((p) => taken.add(p.id));
      const entry = { id: c.clubId, name: c.name, logo: c.colors, leagueId: c.leagueId, squad, updatedAt: now };
      const i = cd.clubs.findIndex((x) => x.id === c.clubId);
      if (i >= 0) cd.clubs[i] = { ...cd.clubs[i], ...entry, logo: cd.clubs[i].logo || entry.logo, name: cd.clubs[i].name || entry.name };
      else cd.clubs.push(entry);
    });
    cd.version = (cd.version || 0) + 1;
    cd.updatedAt = now; cd.by = req.user.username;
    db.customData = cd;

    revertToBase();
    applyCustomData(db);
    const affected = [...new Set(r.parsed.map((c) => c.leagueId))];
    const marked = staleWorlds(db, affected);
    writeDB(db);
    res.json({
      ok: true, version: cd.version, clubs: r.parsed.length, players: r.totals.players, logos: logoCount, logoWarnings: logoWarn,
      affectedLeagues: affected, staleLeagues: marked,
      message: marked.length
        ? `Ma'lumot qo'llandi. ${marked.join(', ')} ligalari dunyosi eskirdi - Admin panelidan «Wipe Data» qiling.`
        : "Ma'lumot qo'llandi. Ligalar dunyosi hali yaratilmagan, yangi ma'lumot bilan boshlanadi.",
    });
  });

  app.post('/api/creator/import/reset', authMiddleware, creatorMiddleware, (req, res) => {
    const db = readDB();
    const cd = db.customData;
    if (!cd || !(cd.clubs || []).length) return res.json({ ok: false, error: "Yuklangan ma'lumot yo'q" });
    const affected = [...new Set(cd.clubs.map((c) => c.leagueId))];
    db.customData = { version: (cd.version || 0) + 1, clubs: [], logos: {}, updatedAt: new Date().toISOString(), by: req.user.username };
    revertToBase();
    applyCustomData(db);
    const marked = staleWorlds(db, affected);
    writeDB(db);
    res.json({ ok: true, version: db.customData.version, staleLeagues: marked, message: marked.length ? `Asl holatga qaytarildi. ${marked.join(', ')} ligalari dunyosini «Wipe Data» bilan qayta yarating.` : 'Asl holatga qaytarildi.' });
  });
}

module.exports = { register, applyCustomData, onChange, validate, stripMarker, getVersion: () => version, POSITIONS };
