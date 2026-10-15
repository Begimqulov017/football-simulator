import React, { useRef, useState } from 'react';
import { Button } from '../../components/ui';
import { useFetch, Panel, Loading, ErrorBox, Empty } from './adminUi';
import { creatorImportStatus, creatorImportValidate, creatorImportApply, creatorImportReset } from '../utils/careerApi';
import { processLogoFile } from './logoProcess';

// CREATOR: Excel orqali klub va futbolchi ma'lumotlarini yuklash.
// Oqim: 1) Excel tanlanadi -> 2) server tekshiradi (xatolar qator raqami bilan) -> 3) logolar (ixtiyoriy) -> 4) «Qo'llash».

const LEAGUE_IDS = [
  'la_liga', 'premier_league', 'bundesliga', 'ligue_1', 'serie_a', 'uzbekistan_super_league', 'saudi_pro_league', 'j1_league',
  'k_league', 'qatar_stars_league', 'uae_pro_league', 'iran_pro_league', 'iraqi_premier_league', 'chinese_super_league',
  'a_league', 'primeira_liga', 'eredivisie', 'belgian_pro_league', 'super_lig', 'swiss_super_league', 'mls',
];
const norm = (s) => String(s == null ? '' : s).trim().toLowerCase().replace(/\s+/g, '_');

// Varaqni qatorlar ro'yxatiga aylantiradi: sarlavhalar kichik harfga, _row = Excel'dagi haqiqiy qator raqami
function sheetRows(XLSX, wb, wanted) {
  const name = wb.SheetNames.find((n) => norm(n) === wanted);
  if (!name) return null;
  const aoa = XLSX.utils.sheet_to_json(wb.Sheets[name], { header: 1, defval: '', raw: true });
  if (!aoa.length) return [];
  const headers = aoa[0].map(norm);
  const rows = [];
  for (let i = 1; i < aoa.length; i += 1) {
    const r = aoa[i];
    if (!r || r.every((c) => String(c).trim() === '')) continue;
    const o = { _row: i + 1 };
    headers.forEach((h, j) => { if (h) o[h] = r[j]; });
    rows.push(o);
  }
  return rows;
}

async function downloadTemplate() {
  const XLSX = await import('xlsx');
  const wb = XLSX.utils.book_new();
  const clubs = [
    ['league_id', 'club_id', 'club_name', 'colors'],
    ['eredivisie', 'fc_example', 'FC Example', '🔴⚪'],
    ['eredivisie', 'sc_sample', 'SC Sample', '🔵🟡'],
  ];
  const pos = ['GK', 'GK', 'GK', 'CB', 'CB', 'CB', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CM', 'CAM', 'LM', 'RM', 'LW', 'RW', 'ST', 'ST', 'CM', 'CB', 'ST'];
  const players = [['club_id', 'name', 'nationality', 'pos', 'ovr', 's1', 's2', 's3', 's4', 's5', 's6']];
  ['fc_example', 'sc_sample'].forEach((club, c) => {
    pos.forEach((p, i) => {
      const ovr = 78 - i - c * 2;
      players.push([club, `Player ${c + 1}-${i + 1}`, i % 3 === 0 ? 'Netherlands' : 'Uzbekistan', p, ovr, 70, 62, 66, 68, p === 'GK' ? 45 : 55, 66]);
    });
  });
  const info = [
    ['season', 'source', 'notes'],
    ['2026/27', 'EA SPORTS FC ratings', 'Namuna fayl. Haqiqiy ma\u2019lumot bilan almashtiring.'],
  ];
  const help = [
    ['QOIDALAR'],
    ['Clubs: league_id mavjud ligalardan biri bo\u2018lsin (pastda). club_id kichik lotin harf, raqam va _ (masalan al_hilal).'],
    ['Clubs: club_id o\u2018yinda bor klubniki bo\u2018lsa - uning tarkibi to\u2018liq almashtiriladi, yo\u2018q bo\u2018lsa - yangi klub yaratiladi.'],
    ['Players: pos faqat GK, RB, CB, LB, CDM, CM, CAM, LM, RM, LW, RW, ST. (LWB->LB, RWB->RB, CF->ST, SS->CAM avtomatik)'],
    ['Players: ovr 40-99. s1..s6: 1-99. Maydon o\u2018yinchisi: PAC,SHO,PAS,DRI,DEF,PHY. Darvozabon: DIV,HAN,KIC,REF,SPD,POS.'],
    ['Har klubda kamida 20 o\u2018yinchi va kamida 2 ta darvozabon bo\u2018lsin.'],
    ['Logotip Excelga kirmaydi: alohida PNG/JPG yuklang, fayl nomi club_id bilan bir xil bo\u2018lsin (fc_example.png).'],
    [''],
    ['MAVJUD league_id lar:'],
    ...LEAGUE_IDS.map((l) => [l]),
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(clubs), 'Clubs');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(players), 'Players');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(info), 'Info');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(help), 'Qoidalar');
  XLSX.writeFile(wb, 'club-data-template.xlsx');
}

const Msg = ({ kind, children }) => (
  <div className={`rounded-control border text-sm px-4 py-3 ${kind === 'ok' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : kind === 'warn' ? 'border-amber-200 bg-amber-50 text-amber-800' : 'border-red-200 bg-red-50 text-red-700'}`}>{children}</div>
);

export default function ImportTab() {
  const status = useFetch(creatorImportStatus, []);
  const fileRef = useRef(null);
  const logoRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  const [payload, setPayload] = useState(null);   // { clubs, players }
  const [fileName, setFileName] = useState('');
  const [report, setReport] = useState(null);     // server validate javobi
  const [logos, setLogos] = useState({});         // { club_id: { dataUrl, removed } }
  const [logoNotes, setLogoNotes] = useState([]);

  const clubIdsInFile = new Set((payload?.clubs || []).map((c) => String(c.club_id || '').trim().toLowerCase()).filter(Boolean));

  const onFile = async (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    setBusy(true); setMsg(null); setReport(null); setPayload(null); setLogos({}); setLogoNotes([]);
    try {
      const XLSX = await import('xlsx');
      const wb = XLSX.read(await f.arrayBuffer(), { type: 'array' });
      const clubs = sheetRows(XLSX, wb, 'clubs');
      const players = sheetRows(XLSX, wb, 'players');
      if (!clubs || !players) {
        setMsg({ kind: 'err', text: `Excelda «Clubs» va «Players» varaqlari bo'lishi kerak. Topilgan varaqlar: ${wb.SheetNames.join(', ') || '—'}` });
      } else {
        const p = { clubs, players };
        setPayload(p); setFileName(f.name);
        const r = await creatorImportValidate(p);
        if (r.ok === false && !r.errors) setMsg({ kind: 'err', text: r.error || 'Tekshirib bo\u2018lmadi' });
        else setReport(r);
      }
    } catch (err) {
      setMsg({ kind: 'err', text: `Faylni o'qib bo'lmadi: ${err.message || err}` });
    }
    setBusy(false);
    if (fileRef.current) fileRef.current.value = '';
  };

  const onLogos = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setBusy(true);
    const next = { ...logos }; const notes = [];
    for (const f of files) {
      const id = f.name.replace(/\.[^.]+$/, '').trim().toLowerCase();
      try {
        const out = await processLogoFile(f);
        next[id] = { dataUrl: out.dataUrl, removed: out.backgroundRemoved };
        if (payload && !clubIdsInFile.has(id)) notes.push(`«${f.name}»: bu club_id Excelda yo'q (o'yinda bor klubniki bo'lsa ishlaydi)`);
      } catch (err) { notes.push(`«${f.name}»: ${err.message || err}`); }
    }
    setLogos(next); setLogoNotes(notes); setBusy(false);
    if (logoRef.current) logoRef.current.value = '';
  };

  const apply = async () => {
    if (!payload || !report?.ok) return;
    const ok = window.confirm(
      `${report.totals.clubs} ta klub va ${report.totals.players} ta o'yinchi o'yinga qo'shiladi.\n\n` +
      "Mavjud klublar tarkibi to'liq almashtiriladi. Ta'sir qilgan ligalar dunyosi eskiradi va admin «Wipe Data» qilishi kerak (barcha karyera va mavsum tarixi nolga tushadi).\n\nDavom etamizmi?",
    );
    if (!ok) return;
    setBusy(true); setMsg(null);
    const logoMap = {}; Object.entries(logos).forEach(([id, l]) => { logoMap[id] = l.dataUrl; });
    const r = await creatorImportApply({ ...payload, logos: logoMap });
    setBusy(false);
    if (r.ok) {
      setMsg({ kind: 'ok', text: `${r.message} (${r.clubs} klub, ${r.players} o'yinchi, ${r.logos} logo)${r.logoWarnings?.length ? ` · Logo ogohlantirishlari: ${r.logoWarnings.join('; ')}` : ''}` });
      setPayload(null); setReport(null); setLogos({}); setFileName('');
      status.reload();
    } else {
      setMsg({ kind: 'err', text: r.error || 'Qo\u2018llab bo\u2018lmadi' });
      if (r.errors) setReport({ ok: false, errors: r.errors, errorCount: r.errorCount, warnings: [], warningCount: 0, clubs: [], totals: { clubs: 0, players: 0 } });
    }
  };

  const reset = async () => {
    if (!window.confirm("Creator yuklagan BARCHA klub, futbolchi va logolar o'chiriladi (o'yinning asl ma'lumoti qaytadi). Davom etamizmi?")) return;
    setBusy(true); setMsg(null);
    const r = await creatorImportReset();
    setBusy(false);
    setMsg(r.ok ? { kind: 'ok', text: r.message } : { kind: 'err', text: r.error || 'Qaytarib bo\u2018lmadi' });
    status.reload();
  };

  const logoCount = Object.keys(logos).length;
  const canApply = !!report?.ok && !busy;

  return (
    <div className="flex flex-col gap-4">
      <Panel title="1. Excel faylni yuklash" action={<Button size="sm" variant="ghost" onClick={downloadTemplate}>⬇ Shablonni yuklab olish</Button>}>
        <p className="text-xs text-ink-muted m-0 mb-3">
          Excelda ikki varaq bo&apos;ladi: <b>Clubs</b> (league_id, club_id, club_name, colors) va <b>Players</b> (club_id, name, nationality, pos, ovr, s1…s6).
          Shablonda qoidalar va mavjud league_id lar yozilgan.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <input ref={fileRef} type="file" accept=".xlsx,.xlsm,.xls" onChange={onFile} disabled={busy} className="text-sm" />
          {fileName && <span className="text-xs text-ink-soft">Tanlandi: <b>{fileName}</b></span>}
          {busy && <span className="text-xs text-ink-muted">Ishlanmoqda…</span>}
        </div>
      </Panel>

      {msg && <Msg kind={msg.kind}>{msg.text}</Msg>}

      {report && (
        <Panel title={`2. Tekshiruv natijasi — ${report.ok ? 'xato yo\u2018q ✅' : `${report.errorCount} ta xato ❌`}`}>
          <div className="text-xs text-ink-soft mb-2">
            {report.totals?.clubs || 0} klub · {report.totals?.players || 0} o&apos;yinchi · {report.warningCount || 0} ogohlantirish
          </div>
          {report.errors?.length > 0 && (
            <div className="mb-3">
              <div className="text-xs font-extrabold text-red-700 mb-1">Xatolar (tuzatib, faylni qayta yuklang):</div>
              <ul className="m-0 pl-5 text-xs text-red-700 max-h-56 overflow-y-auto">
                {report.errors.map((e, i) => <li key={i}><b>{e.sheet}{e.row ? `, ${e.row}-qator` : ''}:</b> {e.msg}</li>)}
              </ul>
              {report.errorCount > report.errors.length && <div className="text-[11px] text-ink-muted mt-1">…va yana {report.errorCount - report.errors.length} ta xato</div>}
            </div>
          )}
          {report.warnings?.length > 0 && (
            <div className="mb-3">
              <div className="text-xs font-extrabold text-amber-700 mb-1">Ogohlantirishlar (yuklashga xalaqit bermaydi):</div>
              <ul className="m-0 pl-5 text-xs text-amber-800 max-h-40 overflow-y-auto">
                {report.warnings.map((w, i) => <li key={i}><b>{w.sheet}{w.row ? `, ${w.row}-qator` : ''}:</b> {w.msg}</li>)}
              </ul>
            </div>
          )}
          {report.clubs?.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead><tr className="text-left text-ink-muted"><th className="py-1 pr-3">Klub</th><th className="pr-3">Liga</th><th className="pr-3">Holat</th><th className="pr-3">O&apos;yinchi</th><th className="pr-3">GK</th><th className="pr-3">Eng yuqori</th><th>11lik o&apos;rtacha</th></tr></thead>
                <tbody>
                  {report.clubs.map((c) => (
                    <tr key={c.clubId} className="border-t border-surface-line">
                      <td className="py-1 pr-3 font-bold">{c.name} <span className="text-ink-subtle font-normal">({c.clubId})</span></td>
                      <td className="pr-3">{c.leagueId}</td>
                      <td className="pr-3">{c.existing ? 'tarkib almashadi' : 'yangi klub'}</td>
                      <td className="pr-3 tabular-nums">{c.players}</td>
                      <td className="pr-3 tabular-nums">{c.gk}</td>
                      <td className="pr-3 tabular-nums">{c.topOvr}</td>
                      <td className="tabular-nums">{c.avgOvr}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      )}

      {report?.ok && (
        <Panel title="3. Logotiplar (ixtiyoriy)">
          <p className="text-xs text-ink-muted m-0 mb-3">
            PNG/JPG/WEBP fayllarni tanlang. <b>Fayl nomi club_id bilan bir xil</b> bo&apos;lsin (masalan <code>fc_example.png</code>).
            Orqa fon avtomatik shaffof qilinadi va 96×96 ga keltiriladi.
          </p>
          <input ref={logoRef} type="file" accept="image/*" multiple onChange={onLogos} disabled={busy} className="text-sm" />
          {logoNotes.length > 0 && <ul className="m-0 mt-2 pl-5 text-xs text-amber-800">{logoNotes.map((n, i) => <li key={i}>{n}</li>)}</ul>}
          {logoCount > 0 && (
            <div className="flex flex-wrap gap-3 mt-3">
              {Object.entries(logos).map(([id, l]) => (
                <div key={id} className="flex flex-col items-center gap-1 text-[11px] text-ink-soft" title={l.removed ? 'Orqa fon olib tashlandi' : 'Fon allaqachon shaffof edi'}>
                  <span className="rounded-control border border-surface-line p-1" style={{ background: 'repeating-conic-gradient(#e5e7eb 0% 25%, #fff 0% 50%) 50% / 12px 12px' }}>
                    <img src={l.dataUrl} alt={id} width={48} height={48} />
                  </span>
                  <span className="max-w-[72px] truncate">{id}</span>
                </div>
              ))}
            </div>
          )}
        </Panel>
      )}

      {report?.ok && (
        <Panel title="4. O'yinga qo'llash">
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="accent" onClick={apply} disabled={!canApply}>Qo&apos;llash ({report.totals.clubs} klub, {report.totals.players} o&apos;yinchi{logoCount ? `, ${logoCount} logo` : ''})</Button>
            <span className="text-xs text-ink-muted">Qo&apos;llagandan keyin ta&apos;sir qilgan ligalar uchun admin «Wipe Data» qilishi kerak.</span>
          </div>
        </Panel>
      )}

      <Panel title="Hozirgi yuklangan ma'lumotlar" action={status.data?.clubs?.length ? <Button size="sm" variant="ghost" onClick={reset} disabled={busy}>↩ Hammasini asl holatga qaytarish</Button> : null}>
        {status.loading ? <Loading /> : status.error ? <ErrorBox error={status.error} onRetry={status.reload} /> : (
          !status.data.clubs.length ? <Empty>Hali Excel orqali ma&apos;lumot yuklanmagan. O&apos;yin o&apos;rnatilgan ma&apos;lumot bilan ishlayapti.</Empty> : (
            <>
              <div className="text-xs text-ink-soft mb-2">
                Versiya {status.data.version} · {status.data.clubs.length} klub · {status.data.logoCount} logo
                {status.data.updatedAt ? ` · oxirgi yangilanish: ${new Date(status.data.updatedAt).toLocaleString()} (${status.data.by})` : ''}
              </div>
              <div className="overflow-x-auto max-h-72 overflow-y-auto">
                <table className="w-full text-xs">
                  <thead><tr className="text-left text-ink-muted"><th className="py-1 pr-3">Klub</th><th className="pr-3">Liga</th><th className="pr-3">O&apos;yinchi</th><th>Logo</th></tr></thead>
                  <tbody>
                    {status.data.clubs.map((c) => (
                      <tr key={c.id} className="border-t border-surface-line"><td className="py-1 pr-3 font-bold">{c.name} <span className="text-ink-subtle font-normal">({c.id})</span></td><td className="pr-3">{c.leagueId}</td><td className="pr-3 tabular-nums">{c.players}</td><td>{c.hasLogo ? '✅' : '—'}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )
        )}
      </Panel>
    </div>
  );
}
