/* ═══════════════════════════════════════════════════════════
   ASEVIN — Spline robot: mouse head-tracking + watermark hide
   ═══════════════════════════════════════════════════════════ */
(function initRobotScene() {
  'use strict';

  /* ── Wait for element + custom element upgrade ────────────── */
  function run() {
    const viewer = document.querySelector('#robotScene spline-viewer');
    if (!viewer) { setTimeout(run, 200); return; }

    let headObj  = null;
    let baseRotX = 0, baseRotY = 0;
    let targetRotX = 0, targetRotY = 0;
    let currRotX   = 0, currRotY   = 0;

    /* ── Try all known ways to get the Spline Application ─── */
    function getApp() {
      return viewer._app
          || viewer.app
          || viewer.runtime
          || (viewer.shadowRoot && viewer.shadowRoot._app)
          || null;
    }

    /* ── Find the head object ─────────────────────────────── */
    function initWithApp(app) {
      if (!app || headObj) return false;

      let all = [];
      try {
        all = typeof app.getAllObjects === 'function' ? app.getAllObjects() : [];
      } catch (_) { return false; }

      if (!all.length) return false;

      /* Always log so we know exact names */
      console.log('[Spline] Objects in scene:', all.map(o => o.name || '(unnamed)'));

      const keywords = ['head', 'neck', 'face', 'skull', 'robot', 'corpo', 'body', 'torso'];
      let found = null;
      for (const kw of keywords) {
        found = all.find(o => o.name && o.name.toLowerCase().includes(kw));
        if (found) { console.log('[Spline] Matched keyword "' + kw + '" → "' + found.name + '"'); break; }
      }

      /* Fallback: first object in the list */
      if (!found) {
        found = all[0];
        console.warn('[Spline] No keyword match — using first object: "' + (found && found.name) + '"');
      }

      headObj = found;
      if (headObj) {
        baseRotX = headObj.rotation.x || 0;
        baseRotY = headObj.rotation.y || 0;
        console.log('[Spline] Tracking "' + headObj.name + '", baseRot X=' + baseRotX + ' Y=' + baseRotY);
      }
      return !!headObj;
    }

    /* ── RAF smoothing loop ───────────────────────────────── */
    (function tick() {
      if (headObj) {
        currRotX += (targetRotX - currRotX) * 0.06;
        currRotY += (targetRotY - currRotY) * 0.06;
        headObj.rotation.x = baseRotX + currRotX;
        headObj.rotation.y = baseRotY + currRotY;
      }
      requestAnimationFrame(tick);
    })();

    /* ── Watermark killer ─────────────────────────────────── */
    function hideWatermark() {
      const shadow = viewer.shadowRoot;
      if (!shadow || shadow.querySelector('#asevin-kill-logo')) return;
      const s = document.createElement('style');
      s.id = 'asevin-kill-logo';
      s.textContent = [
        'a,#logo,[id*="logo"],[class*="logo"],[href*="spline.design"]{',
        'display:none!important;opacity:0!important;pointer-events:none!important}',
      ].join('');
      shadow.appendChild(s);
    }
    [300, 900, 2000, 4000].forEach(t => setTimeout(hideWatermark, t));

    /* ── Load event ───────────────────────────────────────── */
    viewer.addEventListener('load', function onLoad(e) {
      hideWatermark();
      setTimeout(hideWatermark, 600);
      setTimeout(hideWatermark, 2000);

      /* e.detail may be the Application directly */
      const appFromEvt = (e && e.detail && typeof e.detail.getAllObjects === 'function')
        ? e.detail : null;

      if (appFromEvt && initWithApp(appFromEvt)) return;

      /* Otherwise poll for the app property */
      let tries = 0;
      const poll = setInterval(function () {
        if (headObj || tries++ > 40) { clearInterval(poll); return; }
        initWithApp(getApp());
      }, 250);
    });

    /* ── Independent poll (catches scenes that load fast) ─── */
    let indTries = 0;
    const indPoll = setInterval(function () {
      if (headObj || indTries++ > 80) { clearInterval(indPoll); return; }
      initWithApp(getApp());
    }, 500);

    /* ── Mouse → target rotation ──────────────────────────── */
    document.addEventListener('mousemove', function (e) {
      const x =  (e.clientX / window.innerWidth)  * 2 - 1;  // -1…+1 L→R
      const y = -(e.clientY / window.innerHeight) * 2 + 1;  // -1…+1 B→T
      targetRotY =  x * 0.45;   // ~±26°
      targetRotX = -y * 0.22;   // ~±13°
    }, { passive: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
