import React, { useCallback, useEffect, useState } from 'react';

export function useFetch(fn, deps = []) {
  const [state, setState] = useState({ loading: true, data: null, error: null });
  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true }));
    try {
      const data = await fn();
      setState({ loading: false, data, error: data && data.ok === false ? data.error || 'Xatolik' : null });
    } catch (e) {
      setState({ loading: false, data: null, error: e.message || 'Tarmoq xatosi' });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  useEffect(() => { load(); }, [load]);
  return { ...state, reload: load };
}

export const Panel = ({ title, action, children, className = '' }) => (
  <section className={`bg-surface-card border border-surface-line rounded-card shadow-soft p-4 sm:p-5 ${className}`}>
    {(title || action) && (
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="text-sm font-extrabold text-ink">{title}</div>
        {action}
      </div>
    )}
    {children}
  </section>
);

export const Loading = ({ label = 'Yuklanmoqda…' }) => (
  <div className="flex items-center justify-center gap-2 py-10 text-sm text-ink-muted">
    <span className="w-4 h-4 rounded-full border-2 border-surface-line border-t-brand motion-safe:animate-spin" />{label}
  </div>
);

export const ErrorBox = ({ error, onRetry }) => (
  <div className="rounded-control border border-red-200 bg-red-50 text-red-700 text-sm px-4 py-3 flex items-center justify-between gap-3">
    <span>{error}</span>
    {onRetry && <button type="button" onClick={onRetry} className="bg-white border border-red-200 text-red-700 rounded-md px-3 py-1 text-xs font-bold cursor-pointer font-sans">Qayta urinish</button>}
  </div>
);

export const Empty = ({ children }) => <div className="text-center text-sm text-ink-muted py-8">{children}</div>;

export const Stat = ({ label, value, tone = 'neutral' }) => {
  const tones = { neutral: 'bg-surface border-surface-line', brand: 'bg-brand-tint border-brand-soft', accent: 'bg-accent-tint border-accent-soft', amber: 'bg-amber-50 border-amber-200' };
  return (
    <div className={`rounded-control border px-3 py-2.5 ${tones[tone]}`}>
      <div className="text-lg font-black tabular-nums text-ink leading-none">{value}</div>
      <div className="text-[10px] font-extrabold uppercase tracking-wide text-ink-muted mt-1">{label}</div>
    </div>
  );
};

export const inputCls = 'font-sans text-sm text-ink bg-surface-card border border-surface-line rounded-control px-3 py-2 placeholder:text-ink-subtle focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20';
