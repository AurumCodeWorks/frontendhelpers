/* ═══════════════════════════════════════════════════════════
   COLOUR CONVERTER
   Hex, rgb(), hsl(), hwb(), oklch(), oklab() and named colours,
   with WCAG contrast, an sRGB gamut check and CSS fallbacks.
   The maths lives in FHColour (pure functions, no DOM) so it can
   be tested outside the browser. Conversions follow CSS Color 4:
   sRGB ↔ linear sRGB ↔ OKLab (Björn Ottosson's matrices) ↔ OKLCH.
   ═══════════════════════════════════════════════════════════ */

globalThis.FHColour = (() => {
  // ── Named colours (CSS Color 4, all 148 plus transparent) ──
  const NAMED_SRC = 'aliceblue:f0f8ff antiquewhite:faebd7 aqua:00ffff aquamarine:7fffd4 azure:f0ffff beige:f5f5dc bisque:ffe4c4 black:000000 blanchedalmond:ffebcd blue:0000ff blueviolet:8a2be2 brown:a52a2a burlywood:deb887 cadetblue:5f9ea0 chartreuse:7fff00 chocolate:d2691e coral:ff7f50 cornflowerblue:6495ed cornsilk:fff8dc crimson:dc143c cyan:00ffff darkblue:00008b darkcyan:008b8b darkgoldenrod:b8860b darkgray:a9a9a9 darkgreen:006400 darkgrey:a9a9a9 darkkhaki:bdb76b darkmagenta:8b008b darkolivegreen:556b2f darkorange:ff8c00 darkorchid:9932cc darkred:8b0000 darksalmon:e9967a darkseagreen:8fbc8f darkslateblue:483d8b darkslategray:2f4f4f darkslategrey:2f4f4f darkturquoise:00ced1 darkviolet:9400d3 deeppink:ff1493 deepskyblue:00bfff dimgray:696969 dimgrey:696969 dodgerblue:1e90ff firebrick:b22222 floralwhite:fffaf0 forestgreen:228b22 fuchsia:ff00ff gainsboro:dcdcdc ghostwhite:f8f8ff gold:ffd700 goldenrod:daa520 gray:808080 green:008000 greenyellow:adff2f grey:808080 honeydew:f0fff0 hotpink:ff69b4 indianred:cd5c5c indigo:4b0082 ivory:fffff0 khaki:f0e68c lavender:e6e6fa lavenderblush:fff0f5 lawngreen:7cfc00 lemonchiffon:fffacd lightblue:add8e6 lightcoral:f08080 lightcyan:e0ffff lightgoldenrodyellow:fafad2 lightgray:d3d3d3 lightgreen:90ee90 lightgrey:d3d3d3 lightpink:ffb6c1 lightsalmon:ffa07a lightseagreen:20b2aa lightskyblue:87cefa lightslategray:778899 lightslategrey:778899 lightsteelblue:b0c4de lightyellow:ffffe0 lime:00ff00 limegreen:32cd32 linen:faf0e6 magenta:ff00ff maroon:800000 mediumaquamarine:66cdaa mediumblue:0000cd mediumorchid:ba55d3 mediumpurple:9370db mediumseagreen:3cb371 mediumslateblue:7b68ee mediumspringgreen:00fa9a mediumturquoise:48d1cc mediumvioletred:c71585 midnightblue:191970 mintcream:f5fffa mistyrose:ffe4e1 moccasin:ffe4b5 navajowhite:ffdead navy:000080 oldlace:fdf5e6 olive:808000 olivedrab:6b8e23 orange:ffa500 orangered:ff4500 orchid:da70d6 palegoldenrod:eee8aa palegreen:98fb98 paleturquoise:afeeee palevioletred:db7093 papayawhip:ffefd5 peachpuff:ffdab9 peru:cd853f pink:ffc0cb plum:dda0dd powderblue:b0e0e6 purple:800080 rebeccapurple:663399 red:ff0000 rosybrown:bc8f8f royalblue:4169e1 saddlebrown:8b4513 salmon:fa8072 sandybrown:f4a460 seagreen:2e8b57 seashell:fff5ee sienna:a0522d silver:c0c0c0 skyblue:87ceeb slateblue:6a5acd slategray:708090 slategrey:708090 snow:fffafa springgreen:00ff7f steelblue:4682b4 tan:d2b48c teal:008080 thistle:d8bfd8 tomato:ff6347 turquoise:40e0d0 violet:ee82ee wheat:f5deb3 white:ffffff whitesmoke:f5f5f5 yellow:ffff00 yellowgreen:9acd32';
  const NAMED = {};
  const NAME_FOR_HEX = {};
  NAMED_SRC.split(' ').forEach(pair => {
    const [name, hex] = pair.split(':');
    NAMED[name] = hex;
    // First name wins for duplicates (aqua before cyan, gray before grey)
    if (!NAME_FOR_HEX[hex]) NAME_FOR_HEX[hex] = name;
  });

  const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));
  // Rounds to dp places, dropping a negative zero
  const fix = (n, dp) => {
    const s = n.toFixed(dp);
    return /^-0(\.0+)?$/.test(s) ? s.slice(1) : s;
  };
  // Trims trailing zeros: 61.0 → 61, 0.500 → 0.5
  const trim = s => (s.includes('.') ? s.replace(/\.?0+$/, '') : s);
  const num = (n, dp) => trim(fix(n, dp));
  const normHue = h => ((h % 360) + 360) % 360;

  // ── Transfer functions (CSS Color 4, sign-preserving) ──
  function srgbToLinear(c) {
    const a = Math.abs(c);
    return a <= 0.04045 ? c / 12.92 : Math.sign(c) * ((a + 0.055) / 1.055) ** 2.4;
  }
  function linearToSrgb(c) {
    const a = Math.abs(c);
    return a > 0.0031308 ? Math.sign(c) * (1.055 * a ** (1 / 2.4) - 0.055) : 12.92 * c;
  }

  // ── OKLab (Björn Ottosson, https://bottosson.github.io/posts/oklab/) ──
  function linearSrgbToOklab([r, g, b]) {
    const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
    const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
    const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
    return [
      0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s,
      1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s,
      0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s
    ];
  }
  function oklabToLinearSrgb([L, a, b]) {
    const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
    const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
    const s = (L - 0.0894841775 * a - 1.2914855480 * b) ** 3;
    return [
      4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
      -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
      -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s
    ];
  }

  // Chroma at or below this is treated as achromatic: it rounds to
  // 0.0000 at the 4 dp shown, and the hue becomes powerless (0)
  const ACHROMATIC = 0.00005;

  function oklabToOklch([L, a, b]) {
    const C = Math.hypot(a, b);
    if (C <= ACHROMATIC) return [L, 0, 0];
    return [L, C, normHue(Math.atan2(b, a) * 180 / Math.PI)];
  }
  function oklchToOklab([L, C, H]) {
    const h = H * Math.PI / 180;
    return [L, C * Math.cos(h), C * Math.sin(h)];
  }

  const srgbToOklab = rgb => linearSrgbToOklab(rgb.map(srgbToLinear));
  const oklabToSrgb = lab => oklabToLinearSrgb(lab).map(linearToSrgb);
  const srgbToOklch = rgb => oklabToOklch(srgbToOklab(rgb));
  const oklchToSrgb = lch => oklabToSrgb(oklchToOklab(lch));

  // ── HSL / HWB (CSS Color 4 sample code; sRGB channels 0–1) ──
  function hslToSrgb([h, s, l]) {
    h = normHue(h); s /= 100; l /= 100;
    const f = n => {
      const k = (n + h / 30) % 12;
      const a = s * Math.min(l, 1 - l);
      return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    };
    return [f(0), f(8), f(4)];
  }
  function srgbToHsl([r, g, b]) {
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const l = (min + max) / 2, d = max - min;
    let h = 0, s = 0;
    if (d !== 0) {
      s = (l === 0 || l === 1) ? 0 : (max - l) / Math.min(l, 1 - l);
      if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
      else if (max === g) h = (b - r) / d + 2;
      else h = (r - g) / d + 4;
      h *= 60;
    }
    if (s < 0) { h += 180; s = -s; }
    return [normHue(h), s * 100, l * 100];
  }
  function hwbToSrgb([h, w, bl]) {
    w /= 100; bl /= 100;
    if (w + bl >= 1) { const grey = w / (w + bl); return [grey, grey, grey]; }
    return hslToSrgb([h, 100, 50]).map(c => c * (1 - w - bl) + w);
  }
  function srgbToHwb(rgb) {
    const [h] = srgbToHsl(rgb);
    const w = Math.min(...rgb), bl = 1 - Math.max(...rgb);
    // Achromatic: hue is powerless
    return [w + bl >= 0.99999 ? 0 : h, w * 100, bl * 100];
  }

  // ── Gamut ──
  // Tolerance of one 8-bit step: clipping anything closer to the sRGB
  // edge than that is invisible, and it stops the rounded OKLCH values
  // of edge colours like #00ffff or #00ff00 being flagged as outside
  const GAMUT_EPS = 1 / 255;
  const inGamut = rgb => rgb.every(c => c >= -GAMUT_EPS && c <= 1 + GAMUT_EPS);
  const clip = rgb => rgb.map(c => clamp(c, 0, 1));

  // Simple gamut map: keep OKLCH lightness and hue, binary-search the
  // largest chroma that fits in sRGB, then clip the tiny remainder.
  // (A simplification of the CSS Color 4 algorithm, which also stops
  // early once the clipped colour is within a JND of 0.02.)
  function gamutMapOklch([L, C, H]) {
    if (L >= 1) return { rgb: [1, 1, 1], lch: [1, 0, 0] };
    if (L <= 0) return { rgb: [0, 0, 0], lch: [0, 0, 0] };
    if (inGamut(oklchToSrgb([L, C, H]))) return { rgb: clip(oklchToSrgb([L, C, H])), lch: [L, C, H] };
    let lo = 0, hi = C;
    while (hi - lo > 1e-6) {
      const mid = (lo + hi) / 2;
      if (inGamut(oklchToSrgb([L, mid, H]))) lo = mid; else hi = mid;
    }
    return { rgb: clip(oklchToSrgb([L, lo, H])), lch: [L, lo, H] };
  }

  // ── Parsing ──
  const NUM = '[+-]?(?:\\d+\\.?\\d*|\\.\\d+)(?:e[+-]?\\d+)?';
  const TOKEN = new RegExp(`^(${NUM})(%|deg|grad|rad|turn)?$`);

  // Returns { n, unit } or { none: true }; throws on junk
  function token(t, what) {
    if (t === 'none') return { n: 0, unit: '', none: true };
    const m = TOKEN.exec(t);
    if (!m) throw new Error(`“${t}” isn't a valid ${what}.`);
    return { n: parseFloat(m[1]), unit: m[2] || '' };
  }
  function hueOf(t) {
    const { n, unit } = token(t, 'hue');
    if (unit === '%') throw new Error('Hues are angles, not percentages.');
    const deg = { '': 1, deg: 1, grad: 0.9, rad: 180 / Math.PI, turn: 360 }[unit];
    return n * deg;
  }
  // Percentage → fraction of `full`; bare number taken as-is
  function scalar(t, what, full) {
    const { n, unit } = token(t, what);
    if (unit === '%') return n / 100 * full;
    if (unit) throw new Error(`“${t}” isn't a valid ${what}.`);
    return n;
  }
  function alphaOf(t) {
    if (t === undefined) return 1;
    return clamp(scalar(t, 'alpha value', 1), 0, 1);
  }

  // Splits "a b c / d" or "a, b, c, d" into [a, b, c] and alpha
  function args(body, fn) {
    body = body.trim();
    let parts, alpha;
    if (body.includes(',')) {
      parts = body.split(',').map(s => s.trim());
      if (parts.length === 4) alpha = parts.pop();
    } else {
      const [main, a, extra] = body.split('/');
      if (extra !== undefined) throw new Error(`${fn}() has more than one “/”.`);
      parts = main.trim().split(/\s+/).filter(Boolean);
      if (a !== undefined) {
        alpha = a.trim();
        if (!alpha) throw new Error(`${fn}() has a “/” but no alpha value after it.`);
      }
    }
    if (parts.length !== 3 || parts.some(p => !p)) throw new Error(`${fn}() needs three values (plus an optional alpha).`);
    return { parts, alpha };
  }

  function hexToRgb(hex) {
    let h = hex;
    if (h.length <= 4) h = h.split('').map(c => c + c).join('');
    const v = [0, 2, 4, 6].map(i => (i < h.length ? parseInt(h.slice(i, i + 2), 16) : 255));
    return { rgb: v.slice(0, 3).map(c => c / 255), alpha: v[3] / 255 };
  }

  // parse(text) → { format, rgb (sRGB 0–1, may be outside 0–1 for
  // oklch/oklab input), alpha, lch? (exact OKLCH when entered that way) }
  function parse(input) {
    const s = String(input).trim().toLowerCase();
    if (!s) throw new Error('Enter a colour, e.g. #3a86ff or oklch(62% 0.19 260).');

    const hex = /^#?([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/.exec(s);
    if (hex) return { format: 'hex', ...hexToRgb(hex[1]) };

    if (s === 'transparent') return { format: 'named', rgb: [0, 0, 0], alpha: 0 };
    if (NAMED[s]) return { format: 'named', ...hexToRgb(NAMED[s]) };

    const fn = /^([a-z]+)\((.*)\)$/.exec(s);
    if (!fn) {
      if (/^#/.test(s)) throw new Error('Hex colours need 3, 4, 6 or 8 digits (0–9, a–f).');
      if (/^[a-z]+$/.test(s)) throw new Error(`“${s}” isn't a CSS named colour.`);
      throw new Error('Not a colour this tool recognises. Try hex, rgb(), hsl(), hwb(), oklch(), oklab() or a CSS colour name.');
    }
    const name = fn[1];
    const { parts, alpha: a } = args(fn[2], name);
    const alpha = alphaOf(a);

    switch (name) {
      case 'rgb': case 'rgba': {
        const rgb = parts.map(p => clamp(scalar(p, 'rgb channel', 255), 0, 255) / 255);
        return { format: 'rgb', rgb, alpha };
      }
      case 'hsl': case 'hsla': {
        const h = hueOf(parts[0]);
        const sat = clamp(scalar(parts[1], 'saturation', 100), 0, 100);
        const lig = clamp(scalar(parts[2], 'lightness', 100), 0, 100);
        return { format: 'hsl', rgb: hslToSrgb([h, sat, lig]), alpha };
      }
      case 'hwb': {
        const h = hueOf(parts[0]);
        const w = clamp(scalar(parts[1], 'whiteness', 100), 0, 100);
        const bl = clamp(scalar(parts[2], 'blackness', 100), 0, 100);
        return { format: 'hwb', rgb: hwbToSrgb([h, w, bl]), alpha };
      }
      case 'oklch': {
        const L = clamp(scalar(parts[0], 'lightness', 1), 0, 1);
        const C = Math.max(0, scalar(parts[1], 'chroma', 0.4));
        const H = normHue(hueOf(parts[2]));
        const lch = C <= ACHROMATIC ? [L, 0, 0] : [L, C, H];
        return { format: 'oklch', rgb: oklchToSrgb(lch), alpha, lch };
      }
      case 'oklab': {
        const L = clamp(scalar(parts[0], 'lightness', 1), 0, 1);
        const A = scalar(parts[1], 'a value', 0.4);
        const B = scalar(parts[2], 'b value', 0.4);
        return { format: 'oklab', rgb: oklabToSrgb([L, A, B]), alpha, lch: oklabToOklch([L, A, B]) };
      }
      default:
        throw new Error(`${name}() isn't supported here. Use rgb(), hsl(), hwb(), oklch() or oklab().`);
    }
  }

  // ── Formatting ──
  const alphaPart = a => (a < 1 ? ` / ${num(a, 3)}` : '');
  const byte = c => Math.round(clamp(c, 0, 1) * 255);
  const hex2 = n => n.toString(16).padStart(2, '0');

  function toHex(rgb, alpha = 1) {
    return '#' + rgb.map(byte).map(hex2).join('') + (alpha < 1 ? hex2(Math.round(alpha * 255)) : '');
  }
  function toRgb(rgb, alpha = 1) {
    return `rgb(${rgb.map(byte).join(' ')}${alphaPart(alpha)})`;
  }
  function toRgbLegacy(rgb, alpha = 1) {
    const v = rgb.map(byte).join(', ');
    return alpha < 1 ? `rgba(${v}, ${num(alpha, 3)})` : `rgb(${v})`;
  }
  function toHsl(rgb, alpha = 1) {
    const [h, s, l] = srgbToHsl(clip(rgb));
    return `hsl(${num(s < 0.05 ? 0 : h, 1)} ${num(s, 1)}% ${num(l, 1)}%${alphaPart(alpha)})`;
  }
  function toHwb(rgb, alpha = 1) {
    const [h, w, b] = srgbToHwb(clip(rgb));
    return `hwb(${num(h, 1)} ${num(w, 1)}% ${num(b, 1)}%${alphaPart(alpha)})`;
  }
  // L as a percentage (2 dp), C 4 dp, H 2 dp; the L%-plus-number-C
  // form is the original syntax every oklch()-capable browser accepts
  // `extra` adds decimal places; convert() uses it only in the rare
  // cases where the standard precision wouldn't round-trip to the hex
  function formatOklch([L, C, H], alpha = 1, extra = 0) {
    const c = fix(C, 4 + extra);
    const achromatic = Number(c) === 0;
    return `oklch(${fix(L * 100, 2 + extra)}% ${achromatic ? '0' : c} ${achromatic ? '0' : fix(normHue(H), 2 + extra)}${alphaPart(alpha)})`;
  }
  function formatOklab([L, a, b], alpha = 1, extra = 0) {
    return `oklab(${fix(L * 100, 2 + extra)}% ${fix(a, 4 + extra)} ${fix(b, 4 + extra)}${alphaPart(alpha)})`;
  }
  function nameFor(rgb, alpha = 1) {
    if (alpha === 0) return 'transparent';
    if (alpha < 1) return null;
    return NAME_FOR_HEX[toHex(rgb).slice(1)] || null;
  }

  // ── WCAG 2.2 contrast ──
  function relativeLuminance(rgb) {
    const lin = rgb.map(c => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
    return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
  }
  function contrastRatio(a, b) {
    const la = relativeLuminance(a), lb = relativeLuminance(b);
    return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
  }
  // WCAG thresholds must not be rounded up: 4.499 is a fail
  const formatRatio = r => `${(Math.floor(r * 100) / 100).toFixed(2)}:1`;

  // The sRGB colour a parsed value renders as (gamut-mapped if needed)
  function displayRgb(p) {
    if (p.lch && !inGamut(p.rgb)) return gamutMapOklch(p.lch).rgb;
    return clip(p.rgb);
  }
  // Shortest precision (standard, or up to 2 extra places) whose text
  // converts back to exactly the same hex. Near-zero channels are very
  // sensitive (sRGB's linear segment multiplies errors by 12.92), so
  // about 1 colour in 1,000 needs one more digit.
  function roundTrip(format, value, hex, alpha) {
    for (let extra = 0; extra < 3; extra++) {
      const text = format(value, alpha, extra);
      if (toHex(displayRgb(parse(text)), alpha) === hex) return text;
    }
    return format(value, alpha, 2);
  }

  // ── Everything at once ──
  // Hex/rgb/hsl/hwb/contrast describe the sRGB colour actually shown
  // (gamut-mapped if needed, quantised to 8 bits like a hex code);
  // oklch/oklab describe the colour as entered.
  function convert(input) {
    const p = parse(input);
    const entered = p.lch || srgbToOklch(p.rgb);
    const wide = !!p.lch && !inGamut(p.rgb);
    const rgb8 = displayRgb(p).map(c => byte(c) / 255);
    const hex = toHex(rgb8, p.alpha);
    const lab = p.lch ? oklchToOklab(entered) : srgbToOklab(p.rgb);
    const white = contrastRatio(rgb8, [1, 1, 1]);
    const black = contrastRatio(rgb8, [0, 0, 0]);
    return {
      format: p.format,
      alpha: p.alpha,
      inGamut: !wide,
      rgb: rgb8,
      lch: entered,
      hex,
      rgbCss: toRgb(rgb8, p.alpha),
      rgbLegacy: toRgbLegacy(rgb8, p.alpha),
      hsl: toHsl(rgb8, p.alpha),
      hwb: toHwb(rgb8, p.alpha),
      // Typed as OKLCH/OKLab: echo it at standard precision. Typed as
      // sRGB: guarantee the text converts back to the same hex.
      oklch: p.lch ? formatOklch(entered, p.alpha) : roundTrip(formatOklch, entered, hex, p.alpha),
      oklab: p.lch ? formatOklab(lab, p.alpha) : roundTrip(formatOklab, lab, hex, p.alpha),
      mappedOklch: wide ? formatOklch(srgbToOklch(rgb8), p.alpha) : null,
      name: nameFor(rgb8, p.alpha),
      contrast: { white, black }
    };
  }

  function cssSnippet(c, prop = 'color', selector = '.element') {
    const hex = c.hex;
    return `${selector} {\n  ${prop}: ${hex}; /* fallback for browsers without oklch() */\n  ${prop}: ${c.oklch};\n}\n\n` +
      `/* As a custom property, use @supports: a later declaration\n   always wins, even in browsers that can't render it */\n` +
      `:root { --colour: ${hex}; }\n@supports (color: oklch(0% 0 0)) {\n  :root { --colour: ${c.oklch}; }\n}`;
  }

  return {
    NAMED, srgbToLinear, linearToSrgb, linearSrgbToOklab, oklabToLinearSrgb,
    oklabToOklch, oklchToOklab, srgbToOklab, oklabToSrgb, srgbToOklch, oklchToSrgb,
    hslToSrgb, srgbToHsl, hwbToSrgb, srgbToHwb, inGamut, gamutMapOklch,
    parse, toHex, toRgb, toRgbLegacy, toHsl, toHwb, formatOklch, formatOklab, nameFor,
    relativeLuminance, contrastRatio, formatRatio, convert, cssSnippet
  };
})();

if (typeof document !== 'undefined') document.addEventListener('DOMContentLoaded', () => {
  const F = globalThis.FHColour;
  const $ = id => document.getElementById(id);
  const input = $('cc-input');
  const picker = $('cc-picker');
  const prop = $('cc-prop');
  const status = $('cc-status');
  const DEFAULT = '#3a86ff';
  const OUTPUTS = { hex: 'cc-out-hex', rgbCss: 'cc-out-rgb', rgbLegacy: 'cc-out-rgba', hsl: 'cc-out-hsl', hwb: 'cc-out-hwb', oklch: 'cc-out-oklch', oklab: 'cc-out-oklab' };
  let last = null;

  function badge(el, pass) {
    el.className = 'wcag-badge ' + (pass ? 'pass' : 'fail');
    el.textContent = pass ? 'Pass' : 'Fail';
  }

  function render() {
    let c;
    try {
      c = F.convert(input.value);
    } catch (e) {
      input.setAttribute('aria-invalid', 'true');
      status.textContent = e.message;
      return;
    }
    input.removeAttribute('aria-invalid');
    status.textContent = '';
    last = c;

    Object.entries(OUTPUTS).forEach(([key, id]) => { $(id).textContent = c[key]; });
    $('cc-out-name').textContent = c.name || 'No exact named colour';
    $('cc-copy-name').hidden = !c.name;
    $('cc-detected').textContent = { hex: 'Hex', named: 'Named colour', rgb: 'rgb()', hsl: 'hsl()', hwb: 'hwb()', oklch: 'oklch()', oklab: 'oklab()' }[c.format];

    // Swatch: the colour as entered, with the sRGB fallback beside it
    // when an OKLCH/OKLab colour is out of gamut
    const entered = c.format === 'oklch' || c.format === 'oklab' ? c.oklch : c.hex;
    $('cc-swatch-main').style.background = entered;
    $('cc-swatch-fallback').style.background = c.hex;
    $('cc-swatch-fallback').hidden = c.inGamut;
    $('cc-swatch-main-label').textContent = c.inGamut ? c.hex : 'As entered';
    document.querySelector('.cc-swatch').setAttribute('aria-label', `Colour swatch: ${c.hex}`);
    $('cc-swatch-sample').style.color = c.contrast.white >= c.contrast.black ? '#fff' : '#000';

    // Gamut
    const gamut = $('cc-gamut');
    const gBadge = $('cc-gamut-badge');
    if (c.format === 'oklch' || c.format === 'oklab') {
      gamut.hidden = false;
      gBadge.className = 'wcag-badge ' + (c.inGamut ? 'pass' : 'fail');
      gBadge.textContent = c.inGamut ? 'In sRGB' : 'Out of sRGB';
      $('cc-gamut-detail').textContent = c.inGamut
        ? 'Every sRGB screen can show this colour exactly, so the hex fallback is the same colour.'
        : `sRGB screens can't show this colour. The fallback ${c.hex} (${c.mappedOklch}) keeps its OKLCH lightness and hue and reduces chroma until it fits. Wide-gamut (P3) screens show the original.`;
    } else {
      gamut.hidden = true;
    }

    // Contrast (opaque colour against white and black)
    const { white, black } = c.contrast;
    $('cc-cr-white').textContent = F.formatRatio(white);
    $('cc-cr-black').textContent = F.formatRatio(black);
    badge($('cc-aa-white'), white >= 4.5);
    badge($('cc-aa-black'), black >= 4.5);
    $('cc-contrast-note').textContent = (white >= black
      ? `White text reads better on this colour (${F.formatRatio(white)}).`
      : `Black text reads better on this colour (${F.formatRatio(black)}).`) +
      (c.alpha < 1 ? ' Ratios assume the colour is fully opaque.' : '');

    $('cc-css').value = F.cssSnippet(c, prop.value);
    if (document.activeElement !== picker) picker.value = c.hex.slice(0, 7);
  }

  input.addEventListener('input', render);
  picker.addEventListener('input', () => { input.value = picker.value; render(); });
  prop.addEventListener('change', () => { if (last) $('cc-css').value = F.cssSnippet(last, prop.value); });
  document.querySelectorAll('.cc-example').forEach(btn => btn.addEventListener('click', () => {
    input.value = btn.dataset.colour;
    render();
    input.focus();
  }));
  $('reset-cc').addEventListener('click', () => { input.value = DEFAULT; prop.value = 'color'; render(); });
  render();
});
