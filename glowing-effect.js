/* ═══════════════════════════════════════════════════════════
   ASEVIN — Glowing Card Border Effect (vanilla JS port)
   Applies to: service cards, portfolio cards, process steps,
               testimonial cards
   ═══════════════════════════════════════════════════════════ */

(function initGlowingEffect() {
  'use strict';

  const PROXIMITY     = 72;
  const INACTIVE_ZONE = 0.01;
  const SPREAD        = 40;
  const LERP_FACTOR   = 0.09;   // smoothness of angle tracking

  const SELECTORS = [
    { sel: '.service-card',     radius: 'var(--radius-lg)' },
    { sel: '.portfolio-card',   radius: 'var(--radius-lg)' },
    { sel: '.step-content',     radius: 'var(--radius)'    },
    { sel: '.testimonial-card', radius: 'var(--radius-lg)' },
  ];

  /* ── Inject glow divs ─────────────────────────────────────── */
  const targets = [];

  SELECTORS.forEach(({ sel, radius }) => {
    document.querySelectorAll(sel).forEach(el => {
      const glowEl = document.createElement('div');
      glowEl.className = 'glow-border';
      glowEl.style.setProperty('--card-radius', radius);
      el.insertBefore(glowEl, el.firstChild);

      targets.push({
        el,
        glowEl,
        currentAngle: 0,
        targetAngle:  0,
        animating:    false,
      });
    });
  });

  if (targets.length === 0) return;

  /* ── Smooth angle animation ───────────────────────────────── */
  function startAngleAnim(entry) {
    if (entry.animating) return;
    entry.animating = true;

    function tick() {
      const diff = ((entry.targetAngle - entry.currentAngle + 180) % 360) - 180;

      if (Math.abs(diff) < 0.25) {
        entry.currentAngle = entry.targetAngle;
        entry.animating    = false;
        entry.glowEl.style.setProperty('--start', String(entry.currentAngle));
        return;
      }

      entry.currentAngle += diff * LERP_FACTOR;
      entry.glowEl.style.setProperty('--start', String(entry.currentAngle));
      requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  /* ── Update all cards on mouse / scroll ───────────────────── */
  let lastX    = window.innerWidth  / 2;
  let lastY    = window.innerHeight / 2;
  let rafPending = false;

  function updateGlows() {
    rafPending = false;

    targets.forEach(entry => {
      const { el, glowEl } = entry;
      const { left, top, width, height } = el.getBoundingClientRect();
      const cx = left + width  * 0.5;
      const cy = top  + height * 0.5;

      /* inactive zone check (mouse dead-centre → hide) */
      const distFromCenter  = Math.hypot(lastX - cx, lastY - cy);
      const inactiveRadius  = 0.5 * Math.min(width, height) * INACTIVE_ZONE;

      if (distFromCenter < inactiveRadius) {
        glowEl.style.setProperty('--active', '0');
        return;
      }

      /* proximity check */
      const inRange =
        lastX > left   - PROXIMITY &&
        lastX < left   + width  + PROXIMITY &&
        lastY > top    - PROXIMITY &&
        lastY < top    + height + PROXIMITY;

      glowEl.style.setProperty('--active', inRange ? '1' : '0');
      if (!inRange) return;

      /* angle toward mouse */
      const angle = (180 * Math.atan2(lastY - cy, lastX - cx)) / Math.PI + 90;
      entry.targetAngle = angle;
      startAngleAnim(entry);
    });
  }

  function schedule() {
    if (!rafPending) {
      rafPending = true;
      requestAnimationFrame(updateGlows);
    }
  }

  document.addEventListener('pointermove', e => {
    lastX = e.clientX;
    lastY = e.clientY;
    schedule();
  }, { passive: true });

  window.addEventListener('scroll', schedule, { passive: true });
})();
