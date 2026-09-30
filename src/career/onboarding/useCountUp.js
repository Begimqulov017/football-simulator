import { useEffect, useState } from 'react';

// 0 dan `target` gacha silliq sanaydi (rating/potential ochilish animatsiyasi).
export default function useCountUp(target, { duration = 1200, start = true } = {}) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start || target == null) { setValue(0); return undefined; }
    const reduce = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { setValue(target); return undefined; }
    let raf;
    const t0 = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, start]);
  return value;
}
