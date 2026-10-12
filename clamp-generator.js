/* ═══════════════════════════════════════════════════════════
   CSS CLAMP() GENERATOR
   Fluid font sizes, a fluid type scale and a WCAG 1.4.4 zoom
   check. The maths lives in FHClamp (pure functions, no DOM)
   so it can be tested outside the browser.
   ═══════════════════════════════════════════════════════════ */

globalThis.FHClamp = (() => {
  const round = (n, dp = 4) => Number(n.toFixed(dp));
  const fmt = n => String(round(n)).replace(/^-0$/, '0');

  // Linear interpolation between (minVw, minPx) and (maxVw, maxPx):
  // size = interceptPx + slope × viewportWidth
  function fluid({ minPx, maxPx, minVw, maxVw, rootPx = 16 }) {
    if (!(maxVw > minVw)) throw new Error('The maximum viewport must be wider than the minimum.');
    if (!(minPx > 0 && maxPx > 0 && rootPx > 0)) throw new Error('Sizes must be positive.');
    const slope = (maxPx - minPx) / (maxVw - minVw);
    const interceptPx = minPx - slope * minVw;
    return { minPx, maxPx, minVw, maxVw, rootPx, slope, interceptPx };
  }

  // clamp() lower and upper bounds must be in order, even when the
  // size shrinks as the viewport grows
  function toCss(f) {
    const lo = Math.min(f.minPx, f.maxPx) / f.rootPx;
    const hi = Math.max(f.minPx, f.maxPx) / f.rootPx;
    const vw = f.slope * 100;
    const rem = f.interceptPx / f.rootPx;
    // Lead with the positive term so the expression never reads "+ -x"
    const terms = [[rem, 'rem'], [vw, 'vw']].filter(([v]) => round(v) !== 0);
    if (!terms.length) terms.push([0, 'rem']);
    if (terms.length === 2 && terms[0][0] < 0 && terms[1][0] > 0) terms.reverse();
    const preferred = terms.map(([v, unit], i) =>
      i === 0 ? `${fmt(v)}${unit}` : `${v < 0 ? '-' : '+'} ${fmt(Math.abs(v))}${unit}`).join(' ');
    return `clamp(${fmt(lo)}rem, ${preferred}, ${fmt(hi)}rem)`;
  }

  // Rendered size in CSS px at a given viewport width (CSS px)
  function sizeAt(f, viewportPx) {
    const lo = Math.min(f.minPx, f.maxPx), hi = Math.max(f.minPx, f.maxPx);
    return Math.min(hi, Math.max(lo, f.interceptPx + f.slope * viewportPx));
  }

  // WCAG 1.4.4 Resize Text: at every window width, some browser zoom
  // level up to 500% must make the text at least twice its unzoomed
  // size. Zooming by z shrinks the CSS viewport to W/z, so vw-based
  // sizes grow less than z — this finds where that breaks.
  function zoomCheck(f, { fromPx = 320, toPx = 3840, maxZoom = 5 } = {}) {
    let worst = { width: null, best: Infinity };
    for (let W = fromPx; W <= toPx; W += 10) {
      const base = sizeAt(f, W);
      let best = 0;
      for (let z = 1; z <= maxZoom + 1e-9; z += 0.05) best = Math.max(best, (z * sizeAt(f, W / z)) / base);
      if (best < worst.best) worst = { width: W, best };
    }
    const ratio = Math.max(f.minPx, f.maxPx) / Math.min(f.minPx, f.maxPx);
    return { passes: worst.best >= 2 - 1e-9, worstWidth: worst.width, bestScale: round(worst.best, 2), ratio: round(ratio, 2) };
  }

  // Fluid modular scale: step 0 is the base size; each step multiplies
  // by a ratio that itself changes between the two viewports
  function scale({ minPx, maxPx, minVw, maxVw, rootPx, minRatio, maxRatio, stepsDown = 2, stepsUp = 5 }) {
    const steps = [];
    for (let s = -stepsDown; s <= stepsUp; s++) {
      const f = fluid({ minPx: minPx * minRatio ** s, maxPx: maxPx * maxRatio ** s, minVw, maxVw, rootPx });
      steps.push({ step: s, css: toCss(f), f });
    }
    return steps;
  }

  return { fluid, toCss, sizeAt, zoomCheck, scale };
})();

if (typeof document !== 'undefined') document.addEventListener('DOMContentLoaded', () => {
  const C = globalThis.FHClamp;
  const $ = id => document.getElementById(id);
  const fields = ['min-size', 'max-size', 'min-vw', 'max-vw', 'root-size', 'min-ratio', 'max-ratio'];
  const DEFAULTS = { 'min-size': 16, 'max-size': 20, 'min-vw': 360, 'max-vw': 1240, 'root-size': 16, 'min-ratio': 1.2, 'max-ratio': 1.25 };
  const BREAKPOINTS = [320, 375, 768, 1024, 1280, 1440, 1920];
  const num = id => parseFloat($(id).value);

  function render() {
    const err = $('clamp-error');
    let f;
    try {
      f = C.fluid({ minPx: num('min-size'), maxPx: num('max-size'), minVw: num('min-vw'), maxVw: num('max-vw'), rootPx: num('root-size') });
      err.hidden = true;
    } catch (e) {
      err.textContent = e.message;
      err.hidden = false;
      return;
    }

    const value = C.toCss(f);
    $('clamp-value').textContent = value;
    $('clamp-code').value = `font-size: ${value};`;

    // Breakpoint table
    $('clamp-table').innerHTML = BREAKPOINTS.map(w => {
      const px = C.sizeAt(f, w);
      return `<tr><td>${w}px</td><td>${px.toFixed(2)}px</td><td>${(px / f.rootPx).toFixed(3)}rem</td></tr>`;
    }).join('');

    // Zoom check
    const z = C.zoomCheck(f);
    const zoom = $('zoom-result');
    zoom.className = 'wcag-badge ' + (z.passes ? 'pass' : 'fail');
    zoom.textContent = z.passes ? 'PASS ✓' : 'FAIL ✗';
    $('zoom-detail').textContent = z.passes
      ? `200% text resize is reachable at every window width (worst case ${z.bestScale}× at ${z.worstWidth}px). Max ÷ min is ${z.ratio}.`
      : `At a ${z.worstWidth}px window, browser zoom can only enlarge this text ${z.bestScale}×, short of the 2× WCAG 1.4.4 needs. Max ÷ min is ${z.ratio} — bring it closer to 2.5 or below.`;

    updatePreview(f);

    // Type scale
    const steps = C.scale({
      minPx: f.minPx, maxPx: f.maxPx, minVw: f.minVw, maxVw: f.maxVw, rootPx: f.rootPx,
      minRatio: num('min-ratio') || 1, maxRatio: num('max-ratio') || 1
    });
    $('scale-code').value = ':root {\n' + steps.map(s => `  --step-${s.step < 0 ? 'n' + -s.step : s.step}: ${s.css};`).join('\n') + '\n}';
    $('scale-preview').innerHTML = steps.slice().reverse().map(s =>
      `<div class="scale-row"><span class="scale-label">step ${s.step}</span><span class="scale-sample" data-step="${s.step}">Fluid type</span></div>`).join('');
    scaleSteps = steps;
    updatePreview(f);
  }

  let scaleSteps = [];
  function updatePreview(f) {
    const w = num('preview-vw');
    $('preview-vw-out').textContent = `${w}px`;
    const px = C.sizeAt(f, w);
    const sample = $('clamp-sample');
    sample.style.fontSize = px + 'px';
    $('preview-size-out').textContent = `${px.toFixed(2)}px`;
    document.querySelectorAll('.scale-sample').forEach(el => {
      const step = scaleSteps.find(s => String(s.step) === el.dataset.step);
      if (step) el.style.fontSize = C.sizeAt(step.f, w) + 'px';
    });
  }

  fields.forEach(id => $(id).addEventListener('input', render));
  $('preview-vw').addEventListener('input', () => {
    try {
      updatePreview(C.fluid({ minPx: num('min-size'), maxPx: num('max-size'), minVw: num('min-vw'), maxVw: num('max-vw'), rootPx: num('root-size') }));
    } catch { /* invalid inputs: render() shows the error */ }
  });
  $('reset-clamp').addEventListener('click', () => {
    Object.entries(DEFAULTS).forEach(([id, v]) => { $(id).value = v; });
    render();
  });
  render();
});
