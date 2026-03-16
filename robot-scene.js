/* ═══════════════════════════════════════════════════════════
   ASEVIN — Spline robot: mouse head-tracking + watermark hide
   ═══════════════════════════════════════════════════════════ */
(function initRobotScene() {
  'use strict';


  let headObj    = null;
  let baseRotX   = 0, baseRotY   = 0;
  let targetRotX = 0, targetRotY = 0;
  let currRotX   = 0, currRotY   = 0;

  /* ── Scan ALL properties of an object looking for Spline app ── */
  function extractApp(source) {
    if (!source) return null;

    /* Direct check */
    if (typeof source.getAllObjects === 'function') return source;
    if (typeof source.findObjectByName === 'function') return source;

    /* Shallow property scan */
    const keys = Object.keys(source);
    for (const k of keys) {
      try {
        const v = source[k];
        if (v && typeof v === 'object') {
          if (typeof v.getAllObjects === 'function') return v;
          if (typeof v.findObjectByName === 'function') return v;
        }
      } catch (_) {}
    }
    return null;
  }

  /* ── Find head object inside app ──────────────────────────── */
  function initWithApp(app) {
    if (!app || headObj) return false;

    let all = [];
    try {
      if (typeof app.getAllObjects === 'function') {
        all = app.getAllObjects();
      }
    } catch (_) {}

    if (!all || !all.length) {
      console.warn('[Spline] getAllObjects returned empty — trying findObjectByName');
      const keywords = ['Head','head','Neck','neck','Face','face','Robot','robot'];
      for (const k of keywords) {
        try {
          const o = app.findObjectByName(k);
          if (o) { all = [o]; break; }
        } catch (_) {}
      }
    }

    if (!all || !all.length) {
      console.warn('[Spline] No objects found at all');
      return false;
    }

    console.log('[Spline] Objects:', all.map(o => o.name || '(no name)'));

    const keywords = ['head','neck','face','skull'];
    let found = null;
    for (const kw of keywords) {
      found = all.find(o => o.name && o.name.toLowerCase().includes(kw));
      if (found) { console.log('[Spline] Head match:', found.name); break; }
    }

    if (!found) {
      found = all[0];
      console.warn('[Spline] No head keyword — using first object:', found && found.name);
    }

    headObj = found;
    if (headObj) {
      baseRotX = headObj.rotation.x || 0;
      baseRotY = headObj.rotation.y || 0;
      console.log('[Spline] Ready. baseRotX=' + baseRotX + ' baseRotY=' + baseRotY);
    }
    return !!headObj;
  }

  /* ── RAF smoothing loop ───────────────────────────────────── */
  (function tick() {
    if (headObj) {
      currRotX += (targetRotX - currRotX) * 0.06;
      currRotY += (targetRotY - currRotY) * 0.06;
      headObj.rotation.x = baseRotX + currRotX;
      headObj.rotation.y = baseRotY + currRotY;
    }
    requestAnimationFrame(tick);
  })();

  /* ── Mouse tracking ───────────────────────────────────────── */
  document.addEventListener('mousemove', function (e) {
    var x =  (e.clientX / window.innerWidth)  * 2 - 1;
    var y = -(e.clientY / window.innerHeight) * 2 + 1;
    targetRotY =  x * 0.45;
    targetRotX = -y * 0.22;
  }, { passive: true });

  /* ── Wait for spline-viewer to exist in DOM ───────────────── */
  function setup() {
    var viewer = document.querySelector('#robotScene spline-viewer');
    if (!viewer) { setTimeout(setup, 300); return; }

    /* Watermark killer */
    function hideWatermark() {
      var shadow = viewer.shadowRoot;
      if (!shadow || shadow.querySelector('#ak-wm')) return;
      var s = document.createElement('style');
      s.id = 'ak-wm';
      s.textContent = 'a,#logo,[id*="logo"],[class*="logo"],[href*="spline"]{display:none!important}';
      shadow.appendChild(s);
    }
    [300, 800, 2000, 4000].forEach(function(t){ setTimeout(hideWatermark, t); });

    /* ── load event ── */
    viewer.addEventListener('load', function (e) {
      console.log('[Spline] load event fired, e.detail=', e && e.detail);
      hideWatermark();
      setTimeout(hideWatermark, 600);

      /* Try event detail */
      var appFromEvt = extractApp(e && e.detail);
      if (appFromEvt && initWithApp(appFromEvt)) return;

      /* Try viewer properties */
      var appFromViewer = extractApp(viewer);
      if (appFromViewer && initWithApp(appFromViewer)) return;

      /* Poll if still not found */
      var tries = 0;
      var poll = setInterval(function () {
        if (headObj || tries++ > 50) { clearInterval(poll); return; }
        var a = extractApp(viewer);
        if (a) initWithApp(a);
      }, 300);
    });

    /* ── Independent poll (catches cached/fast loads) ── */
    var ind = 0;
    var indPoll = setInterval(function () {
      if (headObj || ind++ > 100) { clearInterval(indPoll); return; }
      var a = extractApp(viewer);
      if (a) {
        console.log('[Spline] App found via independent poll after ' + (ind * 400) + 'ms');
        initWithApp(a);
      }
    }, 400);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setup);
  } else {
    setup();
  }
})();
