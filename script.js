document.addEventListener('DOMContentLoaded', () => {

  /* Shared utilities (showToast, copyToClipboard, copy-button binding,
     scroll-to-top, cookie banner) live in common.js — loaded first. */

  // Collapse rapid keystrokes into one update (heavy analysers)
  function debounce(fn, ms = 150) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), ms);
    };
  }

  /* ── SHARED HELPERS (used by more than one tool) ──────────── */

  // WCAG 2.2 relative luminance — used by the contrast checker
  // and by the palette generator to pick readable swatch text
  function relativeLuminance(hex) {
    const r = parseInt(hex.slice(1,3), 16) / 255;
    const g = parseInt(hex.slice(3,5), 16) / 255;
    const b = parseInt(hex.slice(5,7), 16) / 255;

    const linearise = (c) => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);

    return 0.2126 * linearise(r) + 0.7152 * linearise(g) + 0.0722 * linearise(b);
  }

  /* Shareable tool state — visual tools register how to read and
     restore their settings, so a configuration can travel as a URL.
     Keyed by tool-card id; see initShareLinks() at the bottom. */
  const SHAREABLE = {};

  // User text that ends up in innerHTML must be escaped first
  const escapeHtml = str => String(str).replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

  // Letters that Unicode normalisation can't decompose into ASCII
  const TRANSLITERATE = { 'ß': 'ss', 'æ': 'ae', 'œ': 'oe', 'ø': 'o', 'ł': 'l', 'đ': 'd', 'ð': 'd', 'þ': 'th', 'ı': 'i' };

  // Used by the URL slug generator and the keyword density analyser
  const STOP_WORDS = new Set(['a', 'an', 'the', 'and', 'or', 'but', 'for', 'nor', 'so', 'yet', 'to', 'of', 'in', 'on', 'at', 'by', 'up', 'as', 'is', 'are', 'was', 'were', 'be', 'been', 'with', 'from', 'into', 'your', 'my', 'our', 'their', 'this', 'that', 'it', 'its']);

  /* ═══════════════════════════════════════════════════════════
     TOOL JUMP BAR (sticky chips + scroll-spy, like pages 2–3)
     ═══════════════════════════════════════════════════════════ */
  const toolChips = Array.from(document.querySelectorAll('.tool-chips .chip'));
  const toolCards = Array.from(document.querySelectorAll('.tool-card'));

  initStickyToolbar(document.querySelector('.tools-toolbar'));

  function setActiveChip(cardId) {
    toolChips.forEach(chip => {
      chip.classList.toggle('active', chip.getAttribute('href') === '#' + cardId);
    });
  }

  // Position-based scroll-spy: the active tool is the last card
  // whose top has passed the header line. (Intersection ratios
  // misbehave for tall cards — a short neighbour always wins.)
  let spyScheduled = false;
  function updateSpy() {
    if (!toolCards.length) return;
    let current = toolCards[0].id;
    for (const card of toolCards) {
      if (card.getBoundingClientRect().top <= 210) current = card.id;
    }
    setActiveChip(current);
  }
  window.addEventListener('scroll', () => {
    if (spyScheduled) return;
    spyScheduled = true;
    requestAnimationFrame(() => { updateSpy(); spyScheduled = false; });
  }, { passive: true });
  window.addEventListener('scrollend', updateSpy, { passive: true });
  // Instant feedback on chip click — the spy confirms once scrolling settles
  toolChips.forEach(chip => chip.addEventListener('click', () => setActiveChip(chip.getAttribute('href').slice(1))));
  updateSpy();

  // Keyboard shortcuts: 1–9 jump to the first nine tools
  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
    const idx = parseInt(e.key) - 1;
    if (idx >= 0 && idx < toolCards.length) {
      toolCards[idx].scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });


  /* ═══════════════════════════════════════════════════════════
     1. META TAG PREVIEWER
     ═══════════════════════════════════════════════════════════ */
  function initMetaPreviewer() {
    const metaTitleInput = document.getElementById('meta-title');
    if (!metaTitleInput) return;   // tool not on this page
    const metaDescInput = document.getElementById('meta-desc');
    const metaSiteInput = document.getElementById('meta-site');
    const metaUrlInput = document.getElementById('meta-url');
    const metaImgInput = document.getElementById('meta-img');
    const titleCounter = document.getElementById('title-counter');
    const descCounter = document.getElementById('desc-counter');
    const prevGUrl = document.getElementById('prev-g-url');
    const prevGTitle = document.getElementById('prev-g-title');
    const prevGDesc = document.getElementById('prev-g-desc');
    const prevFbTitle = document.getElementById('prev-fb-title');
    const prevFbDesc = document.getElementById('prev-fb-desc');
    const prevFbDomain = document.getElementById('prev-fb-domain');
    const prevFbImg = document.getElementById('prev-fb-img');
    const prevTwTitle = document.getElementById('prev-tw-title');
    const prevTwDesc = document.getElementById('prev-tw-desc');
    const prevTwDomain = document.getElementById('prev-tw-domain');
    const prevTwImg = document.getElementById('prev-tw-img');
    const outputMetaCode = document.getElementById('output-meta-code');

    // Preview tab switching
    document.querySelectorAll('.preview-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.preview-tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.preview-box').forEach(box => box.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById('prev-' + btn.getAttribute('data-preview')).classList.add('active');
      });
    });

    function getDomain(url) {
      try { return new URL(url).hostname; }
      catch { return 'frontendhelpers.com'; }
    }

    function updateMetaTool() {
      const t = metaTitleInput.value, d = metaDescInput.value, u = metaUrlInput.value, img = metaImgInput.value;
      const domain = getDomain(u);

      // Counters with progress bars
      const titlePct = Math.min((t.length / 60) * 100, 100);
      const descPct = Math.min((d.length / 160) * 100, 100);
      titleCounter.textContent = `${t.length} / 60 chars`;
      titleCounter.className = 'char-counter' + (t.length > 60 ? ' warning' : t.length >= 40 ? ' success' : '');
      descCounter.textContent = `${d.length} / 160 chars`;
      descCounter.className = 'char-counter' + (d.length > 160 ? ' warning' : d.length >= 110 ? ' success' : '');
    
      const titleFill = document.getElementById('title-progress');
      const descFill = document.getElementById('desc-progress');
      if (titleFill) {
        titleFill.style.width = titlePct + '%';
        titleFill.className = 'char-progress-fill' + (t.length > 60 ? ' danger' : t.length >= 50 ? ' warning' : '');
      }
      if (descFill) {
        descFill.style.width = descPct + '%';
        descFill.className = 'char-progress-fill' + (d.length > 160 ? ' danger' : d.length >= 140 ? ' warning' : '');
      }
    
      // Input validation glow
      metaTitleInput.className = t.length > 0 && t.length <= 60 ? 'valid' : t.length > 60 ? 'invalid' : '';
      metaDescInput.className = d.length > 0 && d.length <= 160 ? 'valid' : d.length > 160 ? 'invalid' : '';
      metaUrlInput.className = u && u.startsWith('http') ? 'valid' : u.length > 0 ? 'invalid' : '';

      // Google preview — including URL line (BUG FIX)
      prevGUrl.innerHTML = `${escapeHtml(u || 'https://yourwebsite.com')} <span class="arrow">&#9662;</span>`;
      prevGTitle.textContent = t || 'Enter Page Title';
      prevGDesc.textContent = d || 'Enter page meta description here...';

      // Facebook preview
      prevFbTitle.textContent = t || 'Enter Page Title';
      prevFbDesc.textContent = d || 'Enter page meta description here...';
      prevFbDomain.textContent = domain.toUpperCase();
      prevFbImg.src = img || 'https://placehold.co/600x315/1a1f26/ffffff?text=Preview+Image';

      // Twitter preview
      prevTwTitle.textContent = t || 'Enter Page Title';
      prevTwDesc.textContent = d || 'Enter page meta description here...';
      prevTwDomain.textContent = domain;
      prevTwImg.src = img || 'https://placehold.co/600x315/1a1f26/ffffff?text=Preview+Image';

      // Output code
      outputMetaCode.value = `<!-- HTML Meta Tags -->
<title>${t}</title>
<meta name="description" content="${d}">

<!-- Open Graph / Facebook -->
<meta property="og:url" content="${u}">
<meta property="og:type" content="website">
<meta property="og:title" content="${t}">
<meta property="og:description" content="${d}">
<meta property="og:image" content="${img}">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta property="twitter:domain" content="${domain}">
<meta property="twitter:url" content="${u}">
<meta name="twitter:title" content="${t}">
<meta name="twitter:description" content="${d}">
<meta name="twitter:image" content="${img}">`;

      // Site name → og:site_name (shown as the source on share cards)
      const siteName = metaSiteInput.value.trim();
      if (siteName) {
        outputMetaCode.value = outputMetaCode.value.replace(
          '<meta property="og:image"',
          `<meta property="og:site_name" content="${siteName}">\n<meta property="og:image"`
        );
      }
    }

    [metaTitleInput, metaDescInput, metaSiteInput, metaUrlInput, metaImgInput].forEach(inp => {
      inp.addEventListener('input', updateMetaTool);
    });
    updateMetaTool();

    // Meta reset
    const resetMetaBtn = document.getElementById('reset-meta');
    if (resetMetaBtn) {
      resetMetaBtn.addEventListener('click', () => {
        metaTitleInput.value = '';
        metaDescInput.value = '';
        metaSiteInput.value = '';
        metaUrlInput.value = '';
        metaImgInput.value = '';
        metaTitleInput.className = '';
        metaDescInput.className = '';
        metaUrlInput.className = '';
        updateMetaTool();
        showToast('↺ Meta Previewer reset');
      });
    }
  }

  /* ═══════════════════════════════════════════════════════════
     2. SCHEMA GENERATOR
     ═══════════════════════════════════════════════════════════ */
  function initSchema() {
    const schemaInputs = {
      type: document.getElementById('schema-type'),
      name: document.getElementById('schema-name'),
      url: document.getElementById('schema-url'),
      logo: document.getElementById('schema-logo'),
      email: document.getElementById('schema-email'),
      phone: document.getElementById('schema-phone'),
      street: document.getElementById('schema-street'),
      locality: document.getElementById('schema-locality'),
      zip: document.getElementById('schema-zip'),
      country: document.getElementById('schema-country'),
      price: document.getElementById('schema-price'),
    };
    const outputSchemaCode = document.getElementById('output-schema-code');
    if (!outputSchemaCode) return;   // tool not on this page

    function updateSchemaTool() {
      const s = {};
      for (const [k, el] of Object.entries(schemaInputs)) s[k] = el.value;

      const obj = { "@context": "https://schema.org", "@type": s.type };
      if (s.name) obj.name = s.name;
      if (s.url) obj.url = s.url;
      if (s.logo) obj.logo = s.logo;
      if (s.email) obj.email = s.email;
      if (s.phone) obj.telephone = s.phone;
      if (s.price) obj.priceRange = s.price;

      if (s.street || s.locality || s.zip || s.country) {
        obj.address = { "@type": "PostalAddress" };
        if (s.street) obj.address.streetAddress = s.street;
        if (s.locality) obj.address.addressLocality = s.locality;
        if (s.zip) obj.address.postalCode = s.zip;
        if (s.country) obj.address.addressCountry = s.country;
      }

      outputSchemaCode.value = `<script type="application/ld+json">\n${JSON.stringify(obj, null, 2)}\n<\/script>`;
    }

    // BUG FIX: use 'change' for <select>, 'input' for the rest
    for (const [k, el] of Object.entries(schemaInputs)) {
      el.addEventListener(el.tagName === 'SELECT' ? 'change' : 'input', updateSchemaTool);
    }
    updateSchemaTool();
  }

  /* ═══════════════════════════════════════════════════════════
     3. PX ↔ REM CALCULATOR
     ═══════════════════════════════════════════════════════════ */
  function initPxRem() {
    const baseSizeInput = document.getElementById('base-size');
    if (!baseSizeInput) return;   // tool not on this page
    const calcPxInput = document.getElementById('calc-px');
    const calcRemInput = document.getElementById('calc-rem');
    const quickTableBody = document.getElementById('quick-table-body');

    function pxToRem() {
      const base = parseFloat(baseSizeInput.value) || 16;
      calcRemInput.value = Number((parseFloat(calcPxInput.value) || 0) / base).toFixed(4);
    }

    function remToPx() {
      const base = parseFloat(baseSizeInput.value) || 16;
      calcPxInput.value = Number((parseFloat(calcRemInput.value) || 0) * base).toFixed(2);
    }

    function buildConversionTable() {
      const base = parseFloat(baseSizeInput.value) || 16;
      quickTableBody.innerHTML = [10,12,14,16,18,20,24,28,32,40,48,64]
        .map(s => `<tr><td><strong>${s}px</strong></td><td>${(s/base).toFixed(4)}rem</td></tr>`).join('');
    }

    baseSizeInput.addEventListener('input', () => { pxToRem(); buildConversionTable(); });
    calcPxInput.addEventListener('input', pxToRem);
    calcRemInput.addEventListener('input', remToPx);
    pxToRem();
    buildConversionTable();
  }

  /* ═══════════════════════════════════════════════════════════
     4. CSS GRADIENT GENERATOR
     ═══════════════════════════════════════════════════════════ */
  function initGradient() {
    let gradientType = 'linear';
    let gradientAngle = 135;
    let colorStops = [
      { color: '#8b5cf6', position: 0 },
      { color: '#06b6d4', position: 100 }
    ];

    const angleSlider = document.getElementById('grad-angle');
    if (!angleSlider) return;   // tool not on this page
    const angleValue = document.getElementById('angle-value');
    const angleGroup = document.getElementById('angle-group');
    const stopsContainer = document.getElementById('color-stops-list');
    const addStopBtn = document.getElementById('add-stop');
    const gradientSwatch = document.getElementById('gradient-swatch');
    const outputGradientCode = document.getElementById('output-gradient-code');
    const presetsContainer = document.getElementById('gradient-presets');

    // Gradient type toggle
    document.querySelectorAll('[data-grad-type]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-grad-type]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        gradientType = btn.getAttribute('data-grad-type');
        angleGroup.style.display = gradientType === 'linear' ? 'flex' : 'none';
        updateGradient();
      });
    });

    angleSlider.addEventListener('input', () => {
      gradientAngle = parseInt(angleSlider.value);
      angleValue.textContent = gradientAngle;
      updateGradient();
    });

    function renderStops() {
      stopsContainer.innerHTML = '';
      colorStops.forEach((stop, i) => {
        const row = document.createElement('div');
        row.className = 'color-stop-row';
        row.innerHTML = `
        <input type="color" value="${stop.color}" data-idx="${i}" class="stop-color-input" />
        <input type="range" min="0" max="100" value="${stop.position}" data-idx="${i}" class="stop-pos-input styled-range" />
        <span class="stop-percent">${stop.position}%</span>
        ${colorStops.length > 2 ? `<button class="btn-remove-stop" data-idx="${i}">×</button>` : ''}
      `;
        stopsContainer.appendChild(row);
      });

      // Bind events
      stopsContainer.querySelectorAll('.stop-color-input').forEach(inp => {
        inp.addEventListener('input', (e) => {
          colorStops[+e.target.dataset.idx].color = e.target.value;
          updateGradient();
        });
      });

      stopsContainer.querySelectorAll('.stop-pos-input').forEach(inp => {
        inp.addEventListener('input', (e) => {
          const idx = +e.target.dataset.idx;
          colorStops[idx].position = +e.target.value;
          e.target.nextElementSibling.textContent = e.target.value + '%';
          updateGradient();
        });
      });

      stopsContainer.querySelectorAll('.btn-remove-stop').forEach(btn => {
        btn.addEventListener('click', (e) => {
          colorStops.splice(+e.target.dataset.idx, 1);
          renderStops();
          updateGradient();
        });
      });
    }

    addStopBtn.addEventListener('click', () => {
      const lastPos = colorStops[colorStops.length - 1].position;
      const newPos = Math.min(lastPos + 10, 100);
      const randomHue = Math.floor(Math.random() * 360);
      colorStops.push({ color: `hsl(${randomHue}, 70%, 60%)`, position: newPos });
      // Convert HSL to hex for the color input
      const tmp = document.createElement('div');
      tmp.style.color = colorStops[colorStops.length - 1].color;
      document.body.appendChild(tmp);
      const computed = getComputedStyle(tmp).color;
      document.body.removeChild(tmp);
      const match = computed.match(/\d+/g);
      if (match) {
        colorStops[colorStops.length - 1].color = '#' + match.slice(0, 3).map(n => (+n).toString(16).padStart(2, '0')).join('');
      }
      renderStops();
      updateGradient();
    });

    function buildGradientCSS() {
      const stops = colorStops.map(s => `${s.color} ${s.position}%`).join(', ');
      return gradientType === 'linear'
        ? `linear-gradient(${gradientAngle}deg, ${stops})`
        : `radial-gradient(circle, ${stops})`;
    }

    function updateGradient() {
      const css = buildGradientCSS();
      gradientSwatch.style.background = css;
      outputGradientCode.value = `background: ${css};`;
    }

    // Presets
    const presets = [
      { stops: [{ color: '#667eea', position: 0 }, { color: '#764ba2', position: 100 }], angle: 135 },
      { stops: [{ color: '#f093fb', position: 0 }, { color: '#f5576c', position: 100 }], angle: 135 },
      { stops: [{ color: '#4facfe', position: 0 }, { color: '#00f2fe', position: 100 }], angle: 135 },
      { stops: [{ color: '#43e97b', position: 0 }, { color: '#38f9d7', position: 100 }], angle: 135 },
      { stops: [{ color: '#fa709a', position: 0 }, { color: '#fee140', position: 100 }], angle: 135 },
      { stops: [{ color: '#a18cd1', position: 0 }, { color: '#fbc2eb', position: 100 }], angle: 135 },
      { stops: [{ color: '#fccb90', position: 0 }, { color: '#d57eeb', position: 100 }], angle: 135 },
      { stops: [{ color: '#e0c3fc', position: 0 }, { color: '#8ec5fc', position: 100 }], angle: 135 },
    ];

    presets.forEach((preset, i) => {
      const swatch = document.createElement('div');
      swatch.className = 'preset-swatch';
      const stops = preset.stops.map(s => `${s.color} ${s.position}%`).join(', ');
      swatch.style.background = `linear-gradient(135deg, ${stops})`;
      swatch.addEventListener('click', () => {
        colorStops = JSON.parse(JSON.stringify(preset.stops));
        gradientAngle = preset.angle;
        angleSlider.value = gradientAngle;
        angleValue.textContent = gradientAngle;
        renderStops();
        updateGradient();
      });
      presetsContainer.appendChild(swatch);
    });

    renderStops();
    updateGradient();

    SHAREABLE['tool-gradient'] = {
      read: () => ({
        type: gradientType,
        angle: gradientAngle,
        stops: colorStops.map(s => s.color.replace('#', '') + '-' + s.position).join('_')
      }),
      apply: (q) => {
        const stops = q.get('stops');
        if (stops) {
          const parsed = stops.split('_').map(s => {
            const [hex, pos] = s.split('-');
            return /^[0-9a-fA-F]{6}$/.test(hex) ? { color: '#' + hex, position: Math.min(Math.max(+pos || 0, 0), 100) } : null;
          }).filter(Boolean);
          if (parsed.length >= 2) colorStops = parsed;
        }
        const type = q.get('type');
        if (type === 'linear' || type === 'radial') {
          gradientType = type;
          document.querySelectorAll('[data-grad-type]').forEach(btn =>
            btn.classList.toggle('active', btn.getAttribute('data-grad-type') === type));
          angleGroup.style.display = type === 'linear' ? 'flex' : 'none';
        }
        const angle = parseInt(q.get('angle'), 10);
        if (!isNaN(angle)) {
          gradientAngle = Math.min(Math.max(angle, 0), 360);
          angleSlider.value = gradientAngle;
          angleValue.textContent = gradientAngle;
        }
        renderStops();
        updateGradient();
      }
    };

    // Gradient reset
    const resetGradBtn = document.getElementById('reset-gradient');
    if (resetGradBtn) {
      resetGradBtn.addEventListener('click', () => {
        colorStops = [
          { color: '#8b5cf6', position: 0 },
          { color: '#06b6d4', position: 100 }
        ];
        gradientAngle = 135;
        gradientType = 'linear';
        angleSlider.value = 135;
        angleValue.textContent = '135';
        angleGroup.style.display = 'flex';
        document.querySelectorAll('[data-grad-type]').forEach(b => b.classList.remove('active'));
        document.getElementById('grad-type-linear').classList.add('active');
        renderStops();
        updateGradient();
        showToast('↺ Gradient Generator reset');
      });
    }
  }

  /* ═══════════════════════════════════════════════════════════
     5. BOX SHADOW GENERATOR
     ═══════════════════════════════════════════════════════════ */
  function initBoxShadow() {
    const shadowX = document.getElementById('shadow-x');
    if (!shadowX) return;   // tool not on this page
    const shadowY = document.getElementById('shadow-y');
    const shadowBlur = document.getElementById('shadow-blur');
    const shadowSpread = document.getElementById('shadow-spread');
    const shadowColor = document.getElementById('shadow-color');
    const shadowOpacity = document.getElementById('shadow-opacity');
    const shadowInset = document.getElementById('shadow-inset');
    const shadowPreview = document.getElementById('shadow-preview');
    const outputShadowCode = document.getElementById('output-shadow-code');
    const shadowColorHex = document.getElementById('shadow-color-hex');

    function hexToRgb(hex) {
      const r = parseInt(hex.slice(1,3), 16);
      const g = parseInt(hex.slice(3,5), 16);
      const b = parseInt(hex.slice(5,7), 16);
      return { r, g, b };
    }

    function updateShadow() {
      const x = shadowX.value, y = shadowY.value, b = shadowBlur.value, s = shadowSpread.value;
      const rgb = hexToRgb(shadowColor.value);
      const a = (shadowOpacity.value / 100).toFixed(2);
      const inset = shadowInset.checked ? 'inset ' : '';

      document.getElementById('shadow-x-val').textContent = x;
      document.getElementById('shadow-y-val').textContent = y;
      document.getElementById('shadow-blur-val').textContent = b;
      document.getElementById('shadow-spread-val').textContent = s;
      document.getElementById('shadow-opacity-val').textContent = shadowOpacity.value;
      shadowColorHex.textContent = shadowColor.value;

      const css = `${inset}${x}px ${y}px ${b}px ${s}px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${a})`;
      shadowPreview.style.boxShadow = css;
      outputShadowCode.value = `box-shadow: ${css};`;
    }

    [shadowX, shadowY, shadowBlur, shadowSpread, shadowColor, shadowOpacity].forEach(el => {
      el.addEventListener('input', updateShadow);
    });
    shadowInset.addEventListener('change', updateShadow);
    updateShadow();

    SHAREABLE['tool-shadow'] = {
      read: () => ({
        x: shadowX.value, y: shadowY.value, blur: shadowBlur.value,
        spread: shadowSpread.value, sc: shadowColor.value.replace('#', ''),
        op: shadowOpacity.value, inset: shadowInset.checked ? '1' : '0'
      }),
      apply: (q) => {
        const num = (key, el) => { const v = parseInt(q.get(key), 10); if (!isNaN(v)) el.value = v; };
        num('x', shadowX); num('y', shadowY); num('blur', shadowBlur);
        num('spread', shadowSpread); num('op', shadowOpacity);
        const sc = q.get('sc');
        if (sc && /^[0-9a-fA-F]{6}$/.test(sc)) shadowColor.value = '#' + sc;
        if (q.get('inset') !== null) shadowInset.checked = q.get('inset') === '1';
        updateShadow();
      }
    };

    // Shadow reset
    const resetShadowBtn = document.getElementById('reset-shadow');
    if (resetShadowBtn) {
      resetShadowBtn.addEventListener('click', () => {
        shadowX.value = 4; shadowY.value = 8; shadowBlur.value = 24;
        shadowSpread.value = 0; shadowColor.value = '#000000'; shadowOpacity.value = 25;
        shadowInset.checked = false;
        updateShadow();
        showToast('↺ Box Shadow reset');
      });
    }
  }

  /* ═══════════════════════════════════════════════════════════
     6. WCAG COLOR CONTRAST CHECKER
     ═══════════════════════════════════════════════════════════ */
  function initContrast() {
    const fgPicker = document.getElementById('fg-color-picker');
    if (!fgPicker) return;   // tool not on this page
    const fgInput = document.getElementById('fg-color');
    const bgPicker = document.getElementById('bg-color-picker');
    const bgInput = document.getElementById('bg-color');
    const swapBtn = document.getElementById('swap-colors');
    const ratioDisplay = document.getElementById('contrast-ratio');
    const contrastPreview = document.getElementById('contrast-preview');

    // Sync color picker and text input
    fgPicker.addEventListener('input', () => { fgInput.value = fgPicker.value; updateContrast(); });
    fgInput.addEventListener('input', () => {
      if (/^#[0-9a-fA-F]{6}$/.test(fgInput.value)) { fgPicker.value = fgInput.value; updateContrast(); }
    });
    bgPicker.addEventListener('input', () => { bgInput.value = bgPicker.value; updateContrast(); });
    bgInput.addEventListener('input', () => {
      if (/^#[0-9a-fA-F]{6}$/.test(bgInput.value)) { bgPicker.value = bgInput.value; updateContrast(); }
    });

    swapBtn.addEventListener('click', () => {
      const tmpFg = fgInput.value;
      fgInput.value = bgInput.value;
      fgPicker.value = bgInput.value;
      bgInput.value = tmpFg;
      bgPicker.value = tmpFg;
      updateContrast();
    });

    function contrastRatio(hex1, hex2) {
      const l1 = relativeLuminance(hex1);
      const l2 = relativeLuminance(hex2);
      const lighter = Math.max(l1, l2);
      const darker = Math.min(l1, l2);
      return (lighter + 0.05) / (darker + 0.05);
    }

    function setBadge(id, pass) {
      const el = document.getElementById(id);
      el.textContent = pass ? 'PASS ✓' : 'FAIL ✗';
      el.className = 'wcag-badge ' + (pass ? 'pass' : 'fail');
    }

    function updateContrast() {
      const fg = fgInput.value;
      const bg = bgInput.value;

      if (!/^#[0-9a-fA-F]{6}$/.test(fg) || !/^#[0-9a-fA-F]{6}$/.test(bg)) return;

      const ratio = contrastRatio(fg, bg);
      ratioDisplay.textContent = ratio.toFixed(2);

      // WCAG thresholds
      setBadge('aa-normal', ratio >= 4.5);
      setBadge('aa-large', ratio >= 3);
      setBadge('aaa-normal', ratio >= 7);
      setBadge('aaa-large', ratio >= 4.5);

      // Live preview
      contrastPreview.style.backgroundColor = bg;
      contrastPreview.style.color = fg;
    }

    updateContrast();

    SHAREABLE['tool-contrast'] = {
      read: () => ({ fg: fgInput.value.replace('#', ''), bg: bgInput.value.replace('#', '') }),
      apply: (q) => {
        const set = (key, textEl, pickerEl) => {
          const v = q.get(key);
          if (v && /^[0-9a-fA-F]{6}$/.test(v)) { textEl.value = '#' + v; pickerEl.value = '#' + v; }
        };
        set('fg', fgInput, fgPicker);
        set('bg', bgInput, bgPicker);
        updateContrast();
      }
    };

    // Contrast reset
    const resetContrastBtn = document.getElementById('reset-contrast');
    if (resetContrastBtn) {
      resetContrastBtn.addEventListener('click', () => {
        fgInput.value = '#ffffff'; fgPicker.value = '#ffffff';
        bgInput.value = '#1a1a2e'; bgPicker.value = '#1a1a2e';
        updateContrast();
        showToast('↺ Contrast Checker reset');
      });
    }
  }

  /* ═══════════════════════════════════════════════════════════
     7. URL SLUG GENERATOR
     ═══════════════════════════════════════════════════════════ */
  function initSlug() {
    const slugInput = document.getElementById('slug-input');
    if (!slugInput) return;   // tool not on this page
    const slugSeparator = document.getElementById('slug-separator');
    const slugStopwords = document.getElementById('slug-stopwords');
    const outputSlug = document.getElementById('output-slug');
    const outputSlugUrl = document.getElementById('output-slug-url');

    function updateSlug() {
      const sep = slugSeparator.value;
      let words = slugInput.value
        .toLowerCase()
        .replace(/[ßæœøłđðþı]/g, c => TRANSLITERATE[c])
        .normalize('NFKD')                      // split accented chars
        .replace(/[̀-ͯ]/g, '')        // drop the accents
        .replace(/['’]/g, '')              // don't split "don't"
        .split(/[^a-z0-9]+/)
        .filter(Boolean);

      if (slugStopwords.checked) {
        const kept = words.filter(w => !STOP_WORDS.has(w));
        if (kept.length) words = kept;          // never empty the slug entirely
      }

      const slug = words.join(sep);
      outputSlug.value = slug;
      outputSlugUrl.value = slug ? 'https://yourwebsite.com/blog/' + slug : '';
    }

    [slugInput, slugStopwords].forEach(el => el.addEventListener('input', updateSlug));
    slugSeparator.addEventListener('change', updateSlug);
    updateSlug();
  }

  /* ═══════════════════════════════════════════════════════════
     8. UTM CAMPAIGN LINK BUILDER
     ═══════════════════════════════════════════════════════════ */
  function initUtm() {
    const utmFields = {
      url: document.getElementById('utm-url'),
      source: document.getElementById('utm-source'),
      medium: document.getElementById('utm-medium'),
      campaign: document.getElementById('utm-campaign'),
      term: document.getElementById('utm-term'),
      content: document.getElementById('utm-content')
    };
    const outputUtm = document.getElementById('output-utm');
    if (!outputUtm) return;   // tool not on this page
    const utmHint = document.getElementById('utm-hint');

    function updateUtm() {
      const base = utmFields.url.value.trim();
      if (!base) { outputUtm.value = ''; utmHint.textContent = 'Enter a destination URL to build the link.'; return; }

      let url;
      try {
        url = new URL(base);
      } catch {
        outputUtm.value = '';
        utmHint.textContent = '⚠ That URL isn\'t valid yet — include the protocol, e.g. https://';
        return;
      }

      const params = [
        ['utm_source', utmFields.source.value],
        ['utm_medium', utmFields.medium.value],
        ['utm_campaign', utmFields.campaign.value],
        ['utm_term', utmFields.term.value],
        ['utm_content', utmFields.content.value]
      ];
      params.forEach(([key, value]) => {
        const v = value.trim().toLowerCase().replace(/\s+/g, '-');
        if (v) url.searchParams.set(key, v);
        else url.searchParams.delete(key);
      });

      outputUtm.value = url.toString();
      const missing = [];
      if (!utmFields.source.value.trim()) missing.push('source');
      if (!utmFields.medium.value.trim()) missing.push('medium');
      utmHint.textContent = missing.length
        ? '⚠ Analytics tools expect utm_' + missing.join(' and utm_') + ' on every tagged link.'
        : '✓ Spaces become hyphens and everything is lowercased, so your reports stay tidy.';
    }

    Object.values(utmFields).forEach(el => el.addEventListener('input', updateUtm));
    updateUtm();
  }

  /* ═══════════════════════════════════════════════════════════
     9. ROBOTS.TXT GENERATOR
     ═══════════════════════════════════════════════════════════ */
  function initRobots() {
    const robotsAgent = document.getElementById('robots-agent');
    if (!robotsAgent) return;   // tool not on this page
    const robotsMode = document.getElementById('robots-mode');
    const robotsDisallow = document.getElementById('robots-disallow');
    const robotsSitemap = document.getElementById('robots-sitemap');
    const outputRobots = document.getElementById('output-robots');

    function updateRobots() {
      const agent = robotsAgent.value.trim() || '*';
      const lines = ['User-agent: ' + agent];

      if (robotsMode.value === 'block') {
        lines.push('Disallow: /');
      } else {
        const paths = robotsDisallow.value
          .split('\n')
          .map(p => p.trim())
          .filter(Boolean)
          .map(p => (p.startsWith('/') ? p : '/' + p));
        if (paths.length) {
          paths.forEach(p => lines.push('Disallow: ' + p));
        } else {
          lines.push('Disallow:');   // explicit "allow everything"
        }
      }

      const sitemap = robotsSitemap.value.trim();
      if (sitemap) {
        lines.push('');
        lines.push('Sitemap: ' + sitemap);
      }

      outputRobots.value = lines.join('\n');
    }

    [robotsAgent, robotsDisallow, robotsSitemap].forEach(el => el.addEventListener('input', updateRobots));
    robotsMode.addEventListener('change', updateRobots);
    updateRobots();
  }

  /* ═══════════════════════════════════════════════════════════
     10. KEYWORD DENSITY & READING TIME
     ═══════════════════════════════════════════════════════════ */
  function initDensity() {
    const densityText = document.getElementById('density-text');
    if (!densityText) return;   // tool not on this page
    const densityTarget = document.getElementById('density-target');
    const densityTableBody = document.getElementById('density-table-body');
    const targetDensityBox = document.getElementById('target-density');
    const targetDensityText = document.getElementById('target-density-text');

    function updateDensity() {
      const text = densityText.value;
      const words = (text.toLowerCase().match(/[\p{L}\p{N}'’-]+/gu) || []);
      const sentences = (text.match(/[.!?]+(\s|$)/g) || []).length;
      const readingMins = words.length ? Math.max(1, Math.round(words.length / 200)) : 0;

      document.getElementById('stat-words').textContent = words.length.toLocaleString();
      document.getElementById('stat-chars').textContent = text.length.toLocaleString();
      document.getElementById('stat-sentences').textContent = sentences.toLocaleString();
      document.getElementById('stat-reading').textContent = readingMins + ' min';

      // Top words, stop words excluded
      if (!words.length) {
        densityTableBody.innerHTML = '<tr><td colspan="3">Paste some content to analyse it.</td></tr>';
      } else {
        const counts = new Map();
        words.forEach(w => {
          if (STOP_WORDS.has(w) || w.length < 3) return;
          counts.set(w, (counts.get(w) || 0) + 1);
        });
        const top = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);
        densityTableBody.innerHTML = top.length
          ? top.map(([w, c]) => `<tr><td><strong>${escapeHtml(w)}</strong></td><td>${c}</td><td>${((c / words.length) * 100).toFixed(1)}%</td></tr>`).join('')
          : '<tr><td colspan="3">Only short/stop words found so far.</td></tr>';
      }

      // Target keyword (phrase-aware)
      const target = densityTarget.value.trim().toLowerCase();
      if (target && words.length) {
        const haystack = ' ' + words.join(' ') + ' ';
        const needle = ' ' + (target.match(/[\p{L}\p{N}'’-]+/gu) || []).join(' ') + ' ';
        let count = 0;
        if (needle.trim()) {
          let pos = haystack.indexOf(needle);
          while (pos !== -1) { count++; pos = haystack.indexOf(needle, pos + 1); }
        }
        const density = ((count * (needle.trim().split(' ').length)) / words.length * 100).toFixed(2);
        targetDensityBox.hidden = false;
        targetDensityText.innerHTML = `“<strong>${escapeHtml(densityTarget.value.trim())}</strong>” appears <strong>${count}×</strong> — ${density}% density. Healthy long-form copy usually lands between 0.5% and 2% without forcing it.`;
      } else {
        targetDensityBox.hidden = true;
      }
    }

    const updateDensityDebounced = debounce(updateDensity, 150);
    [densityText, densityTarget].forEach(el => el.addEventListener('input', updateDensityDebounced));
    updateDensity();
  }

  /* ═══════════════════════════════════════════════════════════
     11. HTML ENTITY ENCODER / DECODER
     ═══════════════════════════════════════════════════════════ */
  function initEntities() {
    const entityInput = document.getElementById('entity-input');
    if (!entityInput) return;   // tool not on this page
    const outputEntities = document.getElementById('output-entities');
    const entityOutputLabel = document.getElementById('entity-output-label');
    const entityEncodeBtn = document.getElementById('entity-mode-encode');
    const entityDecodeBtn = document.getElementById('entity-mode-decode');
    let entityMode = 'encode';

    function encodeEntities(str) {
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    function decodeEntities(str) {
      // The parser route handles named AND numeric entities correctly
      const doc = new DOMParser().parseFromString(str, 'text/html');
      return doc.documentElement.textContent || '';
    }

    function updateEntities() {
      outputEntities.value = entityMode === 'encode'
        ? encodeEntities(entityInput.value)
        : decodeEntities(entityInput.value);
      entityOutputLabel.textContent = entityMode === 'encode' ? 'Encoded HTML' : 'Decoded text';
    }

    function setEntityMode(mode) {
      entityMode = mode;
      entityEncodeBtn.classList.toggle('active', mode === 'encode');
      entityDecodeBtn.classList.toggle('active', mode === 'decode');
      updateEntities();
    }

    entityEncodeBtn.addEventListener('click', () => setEntityMode('encode'));
    entityDecodeBtn.addEventListener('click', () => setEntityMode('decode'));
    entityInput.addEventListener('input', updateEntities);
    updateEntities();
  }

  /* ═══════════════════════════════════════════════════════════
     12. ASPECT RATIO & IMAGE SIZE CALCULATOR
     ═══════════════════════════════════════════════════════════ */
  function initAspectRatio() {
    const ratioW = document.getElementById('ratio-w');
    if (!ratioW) return;   // tool not on this page
    const ratioH = document.getElementById('ratio-h');
    const ratioTargetW = document.getElementById('ratio-target-w');
    const ratioSimple = document.getElementById('ratio-simple');
    const ratioDecimal = document.getElementById('ratio-decimal');
    const ratioScaled = document.getElementById('ratio-scaled');
    const outputRatioCss = document.getElementById('output-ratio-css');
    const outputRatioHtml = document.getElementById('output-ratio-html');

    const KNOWN_RATIOS = [
      [16, 9], [9, 16], [4, 3], [3, 4], [3, 2], [2, 3],
      [21, 9], [1, 1], [1.91, 1], [5, 4], [2, 1]
    ];

    function gcd(a, b) { return b ? gcd(b, a % b) : a; }

    function updateRatio() {
      const w = parseFloat(ratioW.value);
      const h = parseFloat(ratioH.value);
      const tw = parseFloat(ratioTargetW.value);

      if (!(w > 0) || !(h > 0)) {
        ratioSimple.textContent = '—';
        ratioDecimal.textContent = '—';
        ratioScaled.textContent = '—';
        outputRatioCss.value = '';
        outputRatioHtml.value = '';
        return;
      }

      const g = gcd(Math.round(w), Math.round(h));
      let rw = Math.round(w) / g;
      let rh = Math.round(h) / g;

      // Ugly exact ratios (e.g. 1000:667) — snap the label to a
      // recognisable ratio when it's within half a percent
      if (rw > 50 || rh > 50) {
        const dec = w / h;
        const near = KNOWN_RATIOS.find(([a, b]) => Math.abs(dec - a / b) / (a / b) < 0.005);
        if (near) { rw = near[0]; rh = near[1]; ratioSimple.textContent = `≈ ${rw} : ${rh}`; }
        else ratioSimple.textContent = `${Math.round(w) / g} : ${Math.round(h) / g}`;
      } else {
        ratioSimple.textContent = `${rw} : ${rh}`;
      }

      ratioDecimal.textContent = (w / h).toFixed(3);

      const th = tw > 0 ? Math.round(tw * h / w) : 0;
      ratioScaled.textContent = tw > 0 ? `${Math.round(tw)} × ${th}` : '—';

      outputRatioCss.value = `.media {
  aspect-ratio: ${rw} / ${rh};
  width: 100%;
  height: auto;
}`;
      outputRatioHtml.value = tw > 0
        ? `<img src="photo.jpg" width="${Math.round(tw)}" height="${th}" alt="" />`
        : '';
    }

    [ratioW, ratioH, ratioTargetW].forEach(el => el.addEventListener('input', updateRatio));
    updateRatio();
  }

  /* ═══════════════════════════════════════════════════════════
     13. TEXT CASE CONVERTER
     ═══════════════════════════════════════════════════════════ */
  function initCaseConverter() {
    const caseInput = document.getElementById('case-input');
    if (!caseInput) return;   // tool not on this page

    function caseWords(str) {
      return str
        .replace(/([\p{Ll}\p{N}])(\p{Lu})/gu, '$1 $2')   // split camelCase
        .split(/[^\p{L}\p{N}]+/u)
        .filter(Boolean)
        .map(w => w.toLowerCase());
    }

    function updateCases() {
      const words = caseWords(caseInput.value);
      const cap = w => w.charAt(0).toUpperCase() + w.slice(1);
      const outputs = {
        'case-camel': words.map((w, i) => i === 0 ? w : cap(w)).join(''),
        'case-pascal': words.map(cap).join(''),
        'case-snake': words.join('_'),
        'case-kebab': words.join('-'),
        'case-title': words.map(cap).join(' '),
        'case-upper': words.join(' ').toUpperCase()
      };
      for (const [id, value] of Object.entries(outputs)) {
        document.getElementById(id).textContent = value || '—';
      }
    }

    caseInput.addEventListener('input', updateCases);
    updateCases();
  }

  /* ═══════════════════════════════════════════════════════════
     14. LOREM IPSUM GENERATOR
     ═══════════════════════════════════════════════════════════ */
  function initLorem() {
    const loremCount = document.getElementById('lorem-count');
    if (!loremCount) return;   // tool not on this page
    const loremUnit = document.getElementById('lorem-unit');
    const loremStart = document.getElementById('lorem-start');
    const loremRegen = document.getElementById('lorem-regen');
    const outputLorem = document.getElementById('output-lorem');

    const LOREM_WORDS = ('lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure in reprehenderit voluptate velit esse cillum eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum').split(' ');

    const randWord = () => LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)];

    function loremSentence() {
      const len = 8 + Math.floor(Math.random() * 7);
      const words = Array.from({ length: len }, randWord);
      return words[0].charAt(0).toUpperCase() + words[0].slice(1) + ' ' + words.slice(1).join(' ') + '.';
    }

    function loremParagraph() {
      return Array.from({ length: 4 + Math.floor(Math.random() * 3) }, loremSentence).join(' ');
    }

    function generateLorem() {
      const n = Math.min(Math.max(parseInt(loremCount.value) || 1, 1), 50);
      const unit = loremUnit.value;
      let text;
      if (unit === 'words') {
        text = Array.from({ length: n }, randWord).join(' ') + '.';
      } else if (unit === 'sentences') {
        text = Array.from({ length: n }, loremSentence).join(' ');
      } else {
        text = Array.from({ length: n }, loremParagraph).join('\n\n');
      }
      if (loremStart.checked) {
        const classic = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit';
        text = classic + text.slice(classic.length).replace(/^[^\s]*/, ',');
        text = text.charAt(0).toUpperCase() + text.slice(1);
      }
      outputLorem.value = text;
    }

    [loremCount, loremUnit].forEach(el => el.addEventListener('change', generateLorem));
    loremStart.addEventListener('change', generateLorem);
    loremRegen.addEventListener('click', () => { generateLorem(); showToast('↻ Fresh lorem generated'); });
    generateLorem();
  }

  /* ═══════════════════════════════════════════════════════════
     15. HTML TABLE GENERATOR
     ═══════════════════════════════════════════════════════════ */
  function initTableGenerator() {
    const tableRows = document.getElementById('table-rows');
    if (!tableRows) return;   // tool not on this page
    const tableCols = document.getElementById('table-cols');
    const tableHeader = document.getElementById('table-header');
    const tableZebra = document.getElementById('table-zebra');
    const outputTableHtml = document.getElementById('output-table-html');
    const outputTableCss = document.getElementById('output-table-css');
    const tablePreview = document.getElementById('table-preview');

    function updateTable() {
      const rows = Math.min(Math.max(parseInt(tableRows.value) || 1, 1), 30);
      const cols = Math.min(Math.max(parseInt(tableCols.value) || 1, 1), 12);
      const lines = ['<table class="data-table">'];

      if (tableHeader.checked) {
        lines.push('  <thead>', '    <tr>');
        for (let c = 1; c <= cols; c++) lines.push(`      <th scope="col">Header ${c}</th>`);
        lines.push('    </tr>', '  </thead>');
      }

      lines.push('  <tbody>');
      for (let r = 1; r <= rows; r++) {
        lines.push('    <tr>');
        for (let c = 1; c <= cols; c++) lines.push(`      <td>Row ${r}, Cell ${c}</td>`);
        lines.push('    </tr>');
      }
      lines.push('  </tbody>', '</table>');
      outputTableHtml.value = lines.join('\n');

      let css = `.data-table {
  width: 100%;
  border-collapse: collapse;
}
.data-table th,
.data-table td {
  padding: 10px 14px;
  text-align: left;
  border-bottom: 1px solid #d7dbe3;
}
.data-table th {
  font-weight: 600;
  background: #f4f6f9;
}`;
      if (tableZebra.checked) {
        css += `
.data-table tbody tr:nth-child(even) {
  background: #f9fafc;
}`;
      }
      outputTableCss.value = css;

      // Live preview: exactly the markup + starter CSS, rendered on a
      // white "plain page" backdrop (the CSS is scoped to the preview)
      tablePreview.innerHTML =
        '<style>' + css.replaceAll('.data-table', '#table-preview .data-table') + '</style>' +
        outputTableHtml.value;
    }

    [tableRows, tableCols].forEach(el => el.addEventListener('input', updateTable));
    [tableHeader, tableZebra].forEach(el => el.addEventListener('change', updateTable));
    updateTable();
  }

  /* ═══════════════════════════════════════════════════════════
     16. COLOUR PALETTE GENERATOR
     ═══════════════════════════════════════════════════════════ */
  function initPalette() {
    const palettePicker = document.getElementById('palette-picker');
    if (!palettePicker) return;   // tool not on this page
    const paletteHex = document.getElementById('palette-hex');
    const paletteScale = document.getElementById('palette-scale');
    const paletteAccents = document.getElementById('palette-accents');
    const outputPaletteTokens = document.getElementById('output-palette-tokens');

    function hexToHslParts(hex) {
      const r = parseInt(hex.slice(1, 3), 16) / 255;
      const g = parseInt(hex.slice(3, 5), 16) / 255;
      const b = parseInt(hex.slice(5, 7), 16) / 255;
      const max = Math.max(r, g, b), min = Math.min(r, g, b);
      const l = (max + min) / 2;
      if (max === min) return [0, 0, Math.round(l * 100)];
      const d = max - min;
      const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      let h;
      if (max === r) h = ((g - b) / d + (g < b ? 6 : 0));
      else if (max === g) h = (b - r) / d + 2;
      else h = (r - g) / d + 4;
      return [Math.round(h * 60), Math.round(s * 100), Math.round(l * 100)];
    }

    function hslPartsToHex(h, s, l) {
      s /= 100; l /= 100;
      const k = n => (n + h / 30) % 12;
      const a = s * Math.min(l, 1 - l);
      const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
      return '#' + [f(0), f(8), f(4)].map(v => Math.round(v * 255).toString(16).padStart(2, '0')).join('');
    }

    function paletteSwatch(hex, label) {
      const sw = document.createElement('button');
      // Dark text on light swatches, light text on dark ones —
      // reuses the WCAG luminance maths from the contrast checker
      sw.className = 'palette-swatch' + (relativeLuminance(hex) > 0.4 ? ' on-light' : '');
      sw.style.background = hex;
      sw.innerHTML = `<span>${label}</span><code>${hex}</code>`;
      sw.title = 'Copy ' + hex;
      sw.addEventListener('click', () => copyToClipboard(hex, hex));
      return sw;
    }

    function updatePalette() {
      const hex = paletteHex.value;
      if (!/^#[0-9a-fA-F]{6}$/.test(hex)) return;
      const [h, s, l] = hexToHslParts(hex);

      // 50–900 scale: light tints down to deep shades, base kept at 500
      const STEPS = [
        ['50', 96], ['100', 90], ['200', 80], ['300', 68], ['400', Math.min(l + 8, 95)],
        ['500', l], ['600', Math.max(l - 10, 8)], ['700', Math.max(l - 20, 6)],
        ['800', Math.max(l - 30, 5)], ['900', Math.max(l - 38, 4)]
      ];

      paletteScale.innerHTML = '';
      const tokens = [':root {'];
      STEPS.forEach(([name, lightness]) => {
        const stepHex = name === '500' ? hex : hslPartsToHex(h, s, lightness);
        paletteScale.appendChild(paletteSwatch(stepHex, name));
        tokens.push(`  --brand-${name}: ${stepHex};`);
      });

      paletteAccents.innerHTML = '';
      const accents = [
        ['complement', hslPartsToHex((h + 180) % 360, s, l)],
        ['analogous-a', hslPartsToHex((h + 30) % 360, s, l)],
        ['analogous-b', hslPartsToHex((h + 330) % 360, s, l)]
      ];
      accents.forEach(([name, accentHex]) => {
        paletteAccents.appendChild(paletteSwatch(accentHex, name));
        tokens.push(`  --brand-${name}: ${accentHex};`);
      });

      tokens.push('}');
      outputPaletteTokens.value = tokens.join('\n');
    }

    palettePicker.addEventListener('input', () => { paletteHex.value = palettePicker.value; updatePalette(); });
    paletteHex.addEventListener('input', () => {
      if (/^#[0-9a-fA-F]{6}$/.test(paletteHex.value)) { palettePicker.value = paletteHex.value; updatePalette(); }
    });
    updatePalette();

    SHAREABLE['tool-palette'] = {
      read: () => ({ hex: paletteHex.value.replace('#', '') }),
      apply: (q) => {
        const v = q.get('hex');
        if (v && /^[0-9a-fA-F]{6}$/.test(v)) {
          paletteHex.value = '#' + v;
          palettePicker.value = '#' + v;
          updatePalette();
        }
      }
    };
  }

  /* ═══════════════════════════════════════════════════════════
     SHAREABLE TOOL STATE
     Visual tools can be shared as a URL that restores their exact
     settings. Runs after all inits so every tool has registered.
     ═══════════════════════════════════════════════════════════ */
  function initShareLinks() {
    const query = new URLSearchParams(location.search);
    const hasQuery = [...query.keys()].length > 0;

    for (const [cardId, cfg] of Object.entries(SHAREABLE)) {
      const card = document.getElementById(cardId);
      if (!card) continue;

      // Restore state from an incoming shared link
      if (hasQuery) {
        try { cfg.apply(query); } catch { /* ignore malformed params */ }
      }

      const header = card.querySelector('.panel-header');
      if (!header || header.querySelector('.btn-share')) continue;

      const btn = document.createElement('button');
      btn.className = 'btn-share';
      btn.type = 'button';
      btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="13" height="13" aria-hidden="true"><path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7"/><path d="M16 6l-4-4-4 4"/><path d="M12 2v14"/></svg>Share';
      btn.title = 'Copy a link that restores these exact settings';

      btn.addEventListener('click', () => {
        const url = new URL(location.href);
        url.search = '';
        for (const [k, v] of Object.entries(cfg.read())) url.searchParams.set(k, v);
        // Deep-link to this tool when several share a page
        url.hash = cardId;
        copyToClipboard(url.toString(), 'Share link');
      });

      // Sit alongside the reset button where one exists
      const reset = header.querySelector('.btn-reset');
      if (reset) reset.insertAdjacentElement('beforebegin', btn);
      else header.appendChild(btn);
    }
  }

  /* ═══════════════════════════════════════════════════════════
     INIT — each tool no-ops on pages where it is absent, so this
     one cached file serves the hub and every single-tool page
     ═══════════════════════════════════════════════════════════ */
  initMetaPreviewer();
  initSchema();
  initPxRem();
  initGradient();
  initBoxShadow();
  initContrast();
  initSlug();
  initUtm();
  initRobots();
  initDensity();
  initEntities();
  initAspectRatio();
  initCaseConverter();
  initLorem();
  initTableGenerator();
  initPalette();

  initShareLinks();

});