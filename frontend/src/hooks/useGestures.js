import { useRef, useEffect } from 'react';

/**
 * Attach pointer-based gesture handlers to a ref.
 * Works for both touch and mouse (Pointer Events).
 *
 * @param {object} handlers
 * @param {function} handlers.onSwipe  (dx, dy) => void  - fired on flick
 * @param {function} handlers.onDrag  (dx, dy) => void  - fired while moving
 * @param {function} handlers.onPinch (scale) => void  - fired while pinching
 * @param {number} [swipeThreshold=40] px before a swipe registers
 */
export default function useGestures(ref, handlers, { swipeThreshold = 40 } = {}) {
  const startRef = useRef(null);
  const lastRef = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onDown = (e) => {
      // Do not intercept input fields, buttons, selects, or form controls
      if (e.target && e.target.closest('input, textarea, button, select, a, label, form, [role="button"]')) {
        return;
      }
      const p = e.touches ? e.touches[0] : e;
      startRef.current = { x: p.clientX, y: p.clientY, t: e.timeStamp };
      lastRef.current = { x: p.clientX, y: p.clientY };
    };

    const onMove = (e) => {
      if (!startRef.current) return;
      const p = e.touches ? e.touches[0] : e;
      const s = startRef.current;
      const dx = p.clientX - s.x;
      const dy = p.clientY - s.y;

      // Pinch detection (two fingers)
      if (e.touches && e.touches.length === 2) {
        const [a, b] = e.touches;
        const dist = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
        if (startRef.current.pinchDist) {
          handlers.onPinch?.(dist / startRef.current.pinchDist);
        }
        startRef.current.pinchDist = dist;
      } else {
        startRef.current.pinchDist = null;
        handlers.onDrag?.(dx, dy);
      }
      lastRef.current = { x: p.clientX, y: p.clientY };
    };

    const onUp = (e) => {
      if (!startRef.current) return;
      const s = startRef.current;
      const l = lastRef.current || s;
      const dx = l.x - s.x;
      const dy = l.y - s.y;
      const absX = Math.abs(dx);
      const absY = Math.abs(dy);

      if (Math.max(absX, absY) >= swipeThreshold) {
        if (absX > absY) {
          handlers.onSwipe?.(dx > 0 ? 'right' : 'left', dx, dy);
        } else {
          handlers.onSwipe?.(dy > 0 ? 'down' : 'up', dx, dy);
        }
      }
      startRef.current = null;
    };

    el.addEventListener('pointerdown', onDown, { passive: false });
    el.addEventListener('pointermove', onMove, { passive: true });
    el.addEventListener('pointerup', onUp, { passive: true });
    el.addEventListener('pointercancel', onUp, { passive: true });
    el.addEventListener('pointerleave', onUp, { passive: true });

    return () => {
      el.removeEventListener('pointerdown', onDown);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerup', onUp);
      el.removeEventListener('pointercancel', onUp);
      el.removeEventListener('pointerleave', onUp);
    };
  }, [ref, handlers, swipeThreshold]);
}