/* ═══════════════════════════════════════════════════════════
   CUBIC-BEZIER EASING GENERATOR
   A curve editor for CSS cubic-bezier() timing functions, with a
   live preview and a linear() approximation. The maths lives in
   FHEasing (pure functions, no DOM) so it can be tested outside
   the browser.
   ═══════════════════════════════════════════════════════════ */

globalThis.FHEasing = (() => {
  // CSS Easing Functions Level 1: the keyword equivalents
  const KEYWORDS = {
    'ease': [0.25, 0.1, 0.25, 1],
    'ease-in': [0.42, 0, 1, 1],
    'ease-out': [0, 0, 0.58, 1],
    'ease-in-out': [0.42, 0, 0.58, 1],
    'linear': [0, 0, 1, 1]
  };

  // Widely used named curves (Robert Penner's equations as fitted by
  // easings.net, plus Material Design's standard curve)
  const NAMED = {
    'easeOutCubic': [0.33, 1, 0.68, 1],
    'easeInOutCubic': [0.65, 0, 0.35, 1],
    'easeOutQuart': [0.25, 1, 0.5, 1],
    'easeOutExpo': [0.16, 1, 0.3, 1],
    'easeInBack': [0.36, 0, 0.66, -0.56],
    'easeOutBack': [0.34, 1.56, 0.64, 1],
    'easeInOutBack': [0.68, -0.6, 0.32, 1.6],
    'Material standard': [0.4, 0, 0.2, 1]
  };

  const round = (n, dp = 3) => {
    const r = Number(n.toFixed(dp));
    return Object.is(r, -0) ? 0 : r;
  };
  const fmt = (n, dp = 3) => String(round(n, dp));

  // One axis of a cubic Bézier from (0,0) to (1,1) with control
  // values p1, p2, in polynomial form: ((a·t + b)·t + c)·t
  function coeffs(p1, p2) {
    const c = 3 * p1;
    const b = 3 * (p2 - p1) - c;
    return [1 - c - b, b, c];
  }

  function validate(x1, y1, x2, y2) {
    if (![x1, y1, x2, y2].every(Number.isFinite)) throw new TypeError('All four values must be numbers.');
    if (x1 < 0 || x1 > 1 || x2 < 0 || x2 > 1) throw new RangeError('x1 and x2 must be between 0 and 1.');
  }

  // Returns progress = f(time) for time in [0, 1].
  // With x1, x2 in [0, 1] the x(t) polynomial is monotonic, so each
  // time has exactly one t: Newton–Raphson finds it quickly, and
  // bisection takes over where the slope is too flat for Newton.
  function bezier(x1, y1, x2, y2) {
    validate(x1, y1, x2, y2);
    const [ax, bx, cx] = coeffs(x1, x2);
    const [ay, by, cy] = coeffs(y1, y2);
    const sampleX = t => ((ax * t + bx) * t + cx) * t;
    const sampleY = t => ((ay * t + by) * t + cy) * t;
    const slopeX = t => (3 * ax * t + 2 * bx) * t + cx;
    const EPS = 1e-10;

    function solveT(x) {
      if (x <= 0) return 0;
      if (x >= 1) return 1;
      let t = x;
      for (let i = 0; i < 8; i++) {
        const err = sampleX(t) - x;
        if (Math.abs(err) < EPS) return t;
        const d = slopeX(t);
        if (Math.abs(d) < 1e-6) break;
        t -= err / d;
        if (t < 0 || t > 1) break;
      }
      let lo = 0, hi = 1;
      t = x;
      for (let i = 0; i < 100 && hi - lo > 1e-12; i++) {
        const v = sampleX(t);
        if (Math.abs(v - x) < EPS) return t;
        if (v < x) lo = t; else hi = t;
        t = (lo + hi) / 2;
      }
      return t;
    }

    const ease = time => {
      if (time <= 0) return 0;
      if (time >= 1) return 1;
      return sampleY(solveT(time));
    };
    ease.solveT = solveT;
    ease.sampleX = sampleX;
    ease.sampleY = sampleY;
    return ease;
  }

  const toCubicCss = ([x1, y1, x2, y2]) => `cubic-bezier(${[x1, y1, x2, y2].map(v => fmt(v)).join(', ')})`;

  // The CSS keyword these values are equivalent to, if any
  function matchKeyword(values) {
    for (const [name, k] of Object.entries(KEYWORDS)) {
      if (k.every((v, i) => Math.abs(v - values[i]) < 1e-9)) return name;
    }
    return null;
  }

  // Approximates the curve on [0, 1] with as few linear() stops as keep
  // every densely sampled point within `tolerance` (Ramer–Douglas–Peucker
  // on vertical error), loosening the tolerance if that needs more than
  // maxStops. Candidates are evenly spaced in time and, when the easing
  // exposes its Bézier, evenly spaced along the curve too, so near-vertical
  // stretches (where progress jumps in very little time) are not missed.
  function linearStops(fn, { samples = 1000, tolerance = 0.001, maxStops = 40 } = {}) {
    const pts = [];
    for (let i = 0; i <= samples; i++) pts.push([i / samples, fn(i / samples)]);
    if (fn.sampleX) for (let i = 1; i < samples; i++) pts.push([fn.sampleX(i / samples), fn.sampleY(i / samples)]);
    pts.sort((a, b) => a[0] - b[0]);
    const xs = [], ys = [];
    pts.forEach(([x, y]) => { if (!xs.length || x > xs[xs.length - 1]) { xs.push(x); ys.push(y); } });
    const last = xs.length - 1;
    let tol = tolerance, keep;
    for (;;) {
      keep = new Uint8Array(last + 1);
      keep[0] = keep[last] = 1;
      const stack = [[0, last]];
      while (stack.length) {
        const [a, b] = stack.pop();
        let worst = -1, dist = tol;
        for (let k = a + 1; k < b; k++) {
          const lerp = ys[a] + (ys[b] - ys[a]) * (xs[k] - xs[a]) / (xs[b] - xs[a]);
          const d = Math.abs(ys[k] - lerp);
          if (d > dist) { dist = d; worst = k; }
        }
        if (worst !== -1) { keep[worst] = 1; stack.push([a, worst], [worst, b]); }
      }
      const count = keep.reduce((s, v) => s + v, 0);
      if (count <= maxStops) break;
      tol *= 1.25;
    }
    const stops = [];
    keep.forEach((k, i) => {
      if (!k) return;
      const s = { value: round(ys[i], 3), at: round(xs[i] * 100, 2) };
      const prev = stops[stops.length - 1];
      if (!prev || s.at > prev.at || s.value !== prev.value) stops.push(s);
    });
    return stops;
  }

  // linear(0, 0.394 10%, …, 1): first and last stops sit at 0% and
  // 100% by default, so they don't need a percentage
  function toLinearCss(stops) {
    return `linear(${stops.map((s, i) =>
      (i === 0 && s.at === 0) || (i === stops.length - 1 && s.at === 100)
        ? fmt(s.value)
        : `${fmt(s.value)} ${fmt(s.at, 2)}%`).join(', ')})`;
  }

  // Evaluates a stop list the way a browser evaluates linear()
  function evalStops(stops, time) {
    const pct = time * 100;
    if (pct <= stops[0].at) return stops[0].value;
    for (let i = 1; i < stops.length; i++) {
      const a = stops[i - 1], b = stops[i];
      if (pct <= b.at) return b.at === a.at ? b.value : a.value + (b.value - a.value) * (pct - a.at) / (b.at - a.at);
    }
    return stops[stops.length - 1].value;
  }

  return { KEYWORDS, NAMED, bezier, toCubicCss, matchKeyword, linearStops, toLinearCss, evalStops, round, fmt };
})();

if (typeof document !== 'undefined') document.addEventListener('DOMContentLoaded', () => {
  const E = globalThis.FHEasing;
  const $ = id => document.getElementById(id);
  const svg = $('cb-svg');
  if (!svg) return;

  const U = 200;                     // SVG units per 1.0 of time/progress
  const Y_MIN = -0.6, Y_MAX = 1.6;   // editable overshoot range
  const DEFAULT = E.KEYWORDS.ease;
  const FIELDS = ['cb-x1', 'cb-y1', 'cb-x2', 'cb-y2'];
  const sx = x => x * U;
  const sy = y => (1 - y) * U;
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  let values = DEFAULT.slice();
  let fn = E.bezier(...values);

  // ── Preset chips (with a tiny drawing of each curve) ──
  function chip(name, v) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip cb-preset';
    b.dataset.values = v.join(',');
    b.setAttribute('aria-pressed', 'false');
    b.title = E.toCubicCss(v);
    const d = `M0 20 C${v[0] * 20} ${(1 - v[1]) * 20} ${v[2] * 20} ${(1 - v[3]) * 20} 20 0`;
    b.innerHTML = `<svg class="cb-chip-curve" viewBox="-2 -6 24 32" aria-hidden="true"><path d="${d}"/></svg>${name}`;
    b.addEventListener('click', () => { set(v.slice()); autoPlay(); });
    return b;
  }
  Object.entries(E.KEYWORDS).forEach(([n, v]) => $('cb-keywords').appendChild(chip(n, v)));
  Object.entries(E.NAMED).forEach(([n, v]) => $('cb-named').appendChild(chip(n, v)));

  // ── Rendering ──
  function set(next, { fromInput = null } = {}) {
    values = [clamp(next[0], 0, 1), clamp(next[1], Y_MIN, Y_MAX), clamp(next[2], 0, 1), clamp(next[3], Y_MIN, Y_MAX)];
    fn = E.bezier(...values);
    FIELDS.forEach((id, i) => { if (id !== fromInput) $(id).value = E.fmt(values[i]); });
    render();
  }

  function render() {
    const [x1, y1, x2, y2] = values;
    $('cb-curve').setAttribute('d', `M0 ${sy(0)} C${sx(x1)} ${sy(y1)} ${sx(x2)} ${sy(y2)} ${sx(1)} ${sy(1)}`);
    $('cb-arm-1').setAttribute('x2', sx(x1)); $('cb-arm-1').setAttribute('y2', sy(y1));
    $('cb-arm-2').setAttribute('x2', sx(x2)); $('cb-arm-2').setAttribute('y2', sy(y2));
    [[1, x1, y1], [2, x2, y2]].forEach(([n, x, y]) => {
      const h = $(`cb-handle-${n}`);
      h.setAttribute('transform', `translate(${sx(x)} ${sy(y)})`);
      h.setAttribute('aria-label', `Control point ${n}: x ${E.fmt(x, 2)}, y ${E.fmt(y, 2)}. Arrow keys move it; hold Shift for bigger steps.`);
    });

    const cubic = E.toCubicCss(values);
    $('cb-transition-code').value = `transition-timing-function: ${cubic};`;
    $('cb-animation-code').value = `animation-timing-function: ${cubic};`;

    const stops = E.linearStops(fn);
    let maxErr = 0;
    for (let i = 0; i <= 2000; i++) maxErr = Math.max(maxErr, Math.abs(E.evalStops(stops, i / 2000) - fn(i / 2000)));
    $('cb-linear-code').value = `transition-timing-function: ${E.toLinearCss(stops)};`;
    $('cb-linear-note').textContent = `${stops.length} stops, never more than ${maxErr.toFixed(4)} away from the curve.`;

    const kw = E.matchKeyword(values);
    $('cb-keyword').innerHTML = kw
      ? `Same as the keyword <code>${kw}</code>, so you can write that instead.`
      : 'No CSS keyword matches this curve.';

    $('cb-table').innerHTML = [0.25, 0.5, 0.75].map(t => {
      const p = fn(t);
      const diff = (p - t) * 100;
      return `<tr><td>${t * 100}%</td><td>${(p * 100).toFixed(1)}%</td><td>${diff >= 0 ? '+' : '−'}${Math.abs(diff).toFixed(1)} pts</td></tr>`;
    }).join('');

    document.querySelectorAll('.cb-preset').forEach(b => {
      const on = b.dataset.values.split(',').map(Number).every((v, i) => Math.abs(v - values[i]) < 1e-9);
      b.classList.toggle('active', on);
      b.setAttribute('aria-pressed', String(on));
    });
  }

  // ── Number inputs ──
  FIELDS.forEach((id, i) => {
    const el = $(id);
    el.addEventListener('input', () => {
      const v = parseFloat(el.value);
      if (!Number.isFinite(v)) return;
      const next = values.slice();
      next[i] = v;
      const lo = i % 2 === 0 ? 0 : Y_MIN, hi = i % 2 === 0 ? 1 : Y_MAX;
      $('cb-clamp-note').hidden = v >= lo && v <= hi;
      if (v < lo || v > hi) $('cb-clamp-note').textContent = i % 2 === 0
        ? 'CSS only allows x between 0 and 1, so the value has been clamped.'
        : `This editor keeps y between ${Y_MIN} and ${Y_MAX}, so the value has been clamped.`;
      set(next, { fromInput: id });
    });
    el.addEventListener('change', () => { el.value = E.fmt(values[i]); });
  });

  // ── Dragging (pointer events: mouse, pen and touch) ──
  let dragging = 0;
  function toCurve(e) {
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(svg.getScreenCTM().inverse());
    return [Math.round(clamp(p.x / U, 0, 1) * 100) / 100, Math.round(clamp(1 - p.y / U, Y_MIN, Y_MAX) * 100) / 100];
  }
  function moveHandle(n, [x, y]) {
    const next = values.slice();
    next[(n - 1) * 2] = x;
    next[(n - 1) * 2 + 1] = y;
    set(next);
  }
  svg.addEventListener('pointerdown', e => {
    if (e.button !== 0) return;
    const pt = toCurve(e);
    const handle = e.target.closest('.cb-handle');
    if (handle) dragging = Number(handle.dataset.n);
    else {
      // Grab whichever handle is nearer to where the pointer landed
      const d1 = Math.hypot(pt[0] - values[0], pt[1] - values[1]);
      const d2 = Math.hypot(pt[0] - values[2], pt[1] - values[3]);
      dragging = d1 <= d2 ? 1 : 2;
      moveHandle(dragging, pt);
    }
    $(`cb-handle-${dragging}`).focus({ preventScroll: true });
    svg.setPointerCapture(e.pointerId);
    svg.classList.add('is-dragging');
    e.preventDefault();
  });
  svg.addEventListener('pointermove', e => { if (dragging) moveHandle(dragging, toCurve(e)); });
  const endDrag = () => {
    if (!dragging) return;
    dragging = 0;
    svg.classList.remove('is-dragging');
    autoPlay();
  };
  svg.addEventListener('pointerup', endDrag);
  svg.addEventListener('pointercancel', endDrag);

  // ── Keyboard nudging ──
  document.querySelectorAll('.cb-handle').forEach(h => h.addEventListener('keydown', e => {
    const step = e.shiftKey ? 0.1 : 0.01;
    const move = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, step], ArrowDown: [0, -step] }[e.key];
    if (!move) return;
    e.preventDefault();
    const n = Number(h.dataset.n);
    const i = (n - 1) * 2;
    moveHandle(n, [Math.round((values[i] + move[0]) * 100) / 100, Math.round((values[i + 1] + move[1]) * 100) / 100]);
  }));

  // ── Preview ──
  const boxes = [$('cb-box-curve'), $('cb-box-linear')];
  const dot = $('cb-dot');
  let raf = 0;
  function play() {
    const duration = clamp(parseFloat($('cb-duration').value) || 1000, 50, 20000);
    const track = $('cb-track-curve');
    const dist = track.clientWidth * 0.8 - boxes[0].offsetWidth;
    const easing = E.toCubicCss(values);
    boxes.forEach((box, i) => {
      box.getAnimations().forEach(a => a.cancel());
      box.animate([{ transform: 'translateX(0)' }, { transform: `translateX(${dist}px)` }],
        { duration, easing: i === 0 ? easing : 'linear', fill: 'forwards' });
    });
    cancelAnimationFrame(raf);
    const start = performance.now();
    const f = fn;
    dot.classList.add('is-on');
    const tick = now => {
      const t = Math.min(1, (now - start) / duration);
      dot.setAttribute('cx', sx(t));
      dot.setAttribute('cy', sy(f(t)));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    $('cb-play').textContent = '↻ Replay';
  }
  function autoPlay() { if (!reduceMotion.matches) play(); }
  const syncMotionNote = () => { $('cb-motion-note').hidden = !reduceMotion.matches; };
  reduceMotion.addEventListener('change', syncMotionNote);
  syncMotionNote();
  $('cb-play').addEventListener('click', play);
  $('cb-duration').addEventListener('change', autoPlay);

  $('reset-cb').addEventListener('click', () => {
    $('cb-duration').value = 1000;
    $('cb-clamp-note').hidden = true;
    set(DEFAULT.slice());
    autoPlay();
  });

  set(values);
  autoPlay();
});
