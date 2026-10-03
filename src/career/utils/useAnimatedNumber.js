import { useEffect, useRef, useState } from 'react';

// Smoothly tweens a number toward `target` (ticking counters, progress bars).
// Unlike useCountUp (which always starts from 0 and rounds to integers) this:
//   * starts from the previously shown value, so +0.12 ticks from 72.00 -> 72.12
//   * keeps full float precision (format it yourself with toFixed)
//   * can start from an explicit `from` on first mount (e.g. 0 for "+0.12" chips)
//   * snaps instantly when the user prefers reduced motion
export default function useAnimatedNumber(target, { duration = 900, from } = {}) {
  const initial = from !== undefined ? from : target;
  const [value, setValue] = useState(initial);
  const valueRef = useRef(initial);

  useEffect(() => {
    if (target == null || Number.isNaN(target)) return undefined;

    const reduce = typeof window !== 'undefined' && window.matchMedia
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      valueRef.current = target;
      setValue(target);
      return undefined;
    }

    const start = valueRef.current;
    if (start === target) return undefined;

    let raf;
    const t0 = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      const next = p >= 1 ? target : start + (target - start) * eased;
      valueRef.current = next;
      setValue(next);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return value;
}
