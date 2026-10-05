import React from 'react';
import { fetchAdminPending, skipPendingMatch } from '../utils/careerApi';
import { useFetch, Panel, Loading, ErrorBox, Empty } from './adminUi';

// Admin Skip Logic: admin kunlarni o'tkazib yuborganda, real o'yinchisi bor o'yinlar
// hal qilinmaydi. Ular o'yinchi o'sha kunga "yetib kelguncha" KUTISH (pending) holatida turadi.
export default function PendingTab() {
  const { loading, data, error, reload } = useFetch(fetchAdminPending, []);
  if (loading) return <Loading />;
  if (error) return <ErrorBox error={error} onRetry={reload} />;
  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-control border border-accent-soft bg-accent-tint text-accent-dark text-xs px-4 py-3 leading-relaxed">
        <b>Skip logikasi:</b> admin kunlarni o'tkazganda, jamoasida real o'yinchi bor o'yinlar simulyatsiya qilinmaydi va <b>kutish (pending)</b> holatida qoladi.
        O'yinchi o'sha kunga yetib kelib o'yinni o'zi o'ynaydi. O'yinlar AVTOMATIK hal qilinmaydi - mavsumning oxirgi turi o'ynalmagan o'yin bor ekan o'tkazilmaydi. Faqat zarur bo'lsa, "Skip" bilan o'yinni qo'lda hal qilishingiz mumkin.
      </div>
      <Panel title={`Kutilayotgan o'yinlar (${data.pending.length})`} action={<button type="button" onClick={reload} className="text-xs font-bold text-accent-dark bg-transparent border-0 cursor-pointer font-sans">Yangilash</button>}>
        {data.pending.length === 0 ? <Empty>Kutilayotgan o'yin yo'q — hamma narsa hal qilingan. ✅</Empty> : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse min-w-[640px]">
              <thead><tr className="text-left text-ink-muted"><th className="py-1.5">Liga</th><th>Tur</th><th>Sana</th><th>O'yin</th><th>Kutayotgan o'yinchi</th><th className="text-center">Kutish</th><th className="text-center">Amal</th></tr></thead>
              <tbody>
                {data.pending.map((p, i) => (
                  <tr key={i} className="border-t border-surface-line">
                    <td className="py-2 font-semibold">{p.league}</td><td>{p.round}</td><td className="tabular-nums">{p.date}</td>
                    <td className="whitespace-nowrap">{p.homeLogo} {p.home} <span className="text-ink-subtle">vs</span> {p.away} {p.awayLogo}</td>
                    <td>{p.users.length ? p.users.map((u) => <span key={u} className="inline-block bg-amber-50 border border-amber-200 text-amber-800 rounded-full px-2 py-0.5 font-bold mr-1">@{u}</span>) : '—'}</td>
                    <td className="text-center tabular-nums font-bold">{p.waitingDays} kun</td>
                    <td className="text-center">
                      <button type="button" onClick={async () => { if (!window.confirm(`${p.home} vs ${p.away} o'yinini o'yinchisiz hal qilasizmi? (Qaytarib bo'lmaydi)`)) return; await skipPendingMatch(p.leagueId, p.round, p.competition); reload(); }} className="text-xs font-bold text-red-700 bg-red-50 border border-red-200 rounded-md px-2 py-1 cursor-pointer">Skip</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}
