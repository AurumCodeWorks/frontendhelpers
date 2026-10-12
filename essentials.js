/* ═══════════════════════════════════════════════════════════
   DEV ESSENTIALS
   Checklists with localStorage progress, readiness score,
   request-journey stepper, HTTP status reference.
   ═══════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  const STORAGE_KEY = 'fh-essentials-progress';

  /* ── CHECKLIST DATA (stable ids — don't rename once live) ── */
  const CHECKLISTS = {
    web: [
      { id: 'web-1', text: 'I can name each stage between typing a URL and seeing pixels (DNS → TCP → TLS → request → response → parse → render).' },
      { id: 'web-2', text: 'I know what the common status code families mean (2xx success, 3xx redirect, 4xx client error, 5xx server error).' },
      { id: 'web-3', text: 'I check the Network tab before guessing why something is slow or failing.' },
      { id: 'web-4', text: 'I understand what a CORS error actually is (the server didn\'t opt in) and don\'t try to "fix" it client-side.' },
      { id: 'web-5', text: 'I know the difference between a 301 and a 302 redirect — and when each is right.' },
      { id: 'web-6', text: 'I can explain what a CDN does and why serving assets close to users matters.' }
    ],
    sec: [
      { id: 'sec-1', text: 'Everything user-supplied is escaped before it\'s rendered as HTML.' },
      { id: 'sec-2', text: 'My sites are HTTPS-only, with HTTP redirecting to HTTPS.' },
      { id: 'sec-3', text: 'No secrets (API keys, tokens) ship in client-side code — anything in the browser is public.' },
      { id: 'sec-4', text: 'I set security headers (CSP, X-Frame-Options, nosniff, Referrer-Policy) on every site.' },
      { id: 'sec-5', text: 'Cookies that matter are HttpOnly, Secure and SameSite.' },
      { id: 'sec-6', text: 'I audit dependencies before adding them, and update them regularly.' },
      { id: 'sec-7', text: 'Forms validate on the server too — client-side validation is UX, not security.' },
      { id: 'sec-8', text: 'I never build SQL or shell commands by concatenating user input.' }
    ],
    perf: [
      { id: 'perf-1', text: 'Every image is compressed, correctly sized, and has width and height attributes.' },
      { id: 'perf-2', text: 'Below-the-fold images use loading="lazy".' },
      { id: 'perf-3', text: 'Static assets ship with explicit Cache-Control headers.' },
      { id: 'perf-4', text: 'I run Lighthouse (or PageSpeed Insights) before calling a page done.' },
      { id: 'perf-5', text: 'Fonts use font-display: swap and only the weights actually used.' },
      { id: 'perf-6', text: 'I know my pages\' LCP, INP and CLS — not just "it feels fast on my machine".' },
      { id: 'perf-7', text: 'Third-party scripts are counted as a cost and re-justified periodically.' }
    ],
    a11y: [
      { id: 'a11y-1', text: 'Interactive elements are real &lt;button&gt; and &lt;a&gt; elements, not click-handler divs.' },
      { id: 'a11y-2', text: 'I can navigate my whole site with only the keyboard (Tab, Enter, Escape).' },
      { id: 'a11y-3', text: 'Focus is always visible — I never remove outlines without replacing them.' },
      { id: 'a11y-4', text: 'Every meaningful image has descriptive alt text; decorative ones have alt="".' },
      { id: 'a11y-5', text: 'Headings follow a logical order (one h1, no skipped levels).' },
      { id: 'a11y-6', text: 'Text colour contrast passes WCAG AA (4.5:1 for body text).' },
      { id: 'a11y-7', text: 'Forms have real &lt;label&gt; elements wired to their inputs.' },
      { id: 'a11y-8', text: 'Animations respect prefers-reduced-motion.' }
    ],
    git: [
      { id: 'git-1', text: 'Every project I touch is in version control from the first commit — no "final_v2_REAL" folders.' },
      { id: 'git-2', text: 'My commits are small and focused, with messages that explain why.' },
      { id: 'git-3', text: 'I work on branches and keep main always deployable.' },
      { id: 'git-4', text: 'I can undo mistakes calmly — restore, revert, and reflog instead of panic-deleting.' },
      { id: 'git-5', text: 'My .gitignore keeps node_modules, env files and build output out of history.' },
      { id: 'git-6', text: 'Secrets never enter Git history — once pushed, they\'re considered leaked and get rotated.' }
    ],
    deploy: [
      { id: 'deploy-1', text: 'I\'ve deployed at least one site to a real domain, end to end, myself.' },
      { id: 'deploy-2', text: 'I know what A, CNAME and TXT records do and can edit DNS without fear.' },
      { id: 'deploy-3', text: 'HTTPS works on the live site, including the www / non-www variant.' },
      { id: 'deploy-4', text: 'Deploys are automatic from Git — not drag-and-drop FTP uploads.' },
      { id: 'deploy-5', text: 'A custom 404 page exists and internal links are checked before launch.' },
      { id: 'deploy-6', text: 'robots.txt and sitemap.xml exist and the sitemap is submitted to Search Console.' },
      { id: 'deploy-7', text: 'I can roll back a bad deploy quickly, and I know how before I need it.' }
    ],
    test: [
      { id: 'test-1', text: 'Pure logic (calculations, validators, formatters) has unit tests.' },
      { id: 'test-2', text: 'My site\'s critical path (the thing it exists for) has at least one end-to-end test or scripted check.' },
      { id: 'test-3', text: 'I test behaviour users can see, not internal implementation details.' },
      { id: 'test-4', text: 'Tests run automatically before deploys, not just when I remember.' },
      { id: 'test-5', text: 'When I fix a bug, I add a test that would have caught it.' }
    ],
    priv: [
      { id: 'priv-1', text: 'I collect the minimum data needed — and can say why for each field.' },
      { id: 'priv-2', text: 'Non-essential cookies and analytics wait for consent, denied by default.' },
      { id: 'priv-3', text: 'A privacy policy exists, in plain language, and matches what the site actually does.' },
      { id: 'priv-4', text: 'Third parties receiving user data (analytics, fonts, embeds) are known and listed.' },
      { id: 'priv-5', text: 'I prefer on-device storage (localStorage) over server collection when it does the job.' }
    ]
  };

  /* ── REQUEST JOURNEY STAGES ──────────────────────────────── */
  const STAGES = [
    { name: 'DNS', title: 'DNS lookup — finding the address', desc: 'The browser asks the Domain Name System to translate "frontendhelpers.com" into an IP address — the internet\'s phone book. Results are cached at several layers (browser, OS, resolver), which is why a domain you just visited resolves instantly, and why DNS changes take time to propagate everywhere.' },
    { name: 'TCP', title: 'TCP handshake — opening the line', desc: 'With an IP address in hand, the browser opens a reliable connection to the server: a three-step handshake (SYN, SYN-ACK, ACK). It guarantees data arrives complete and in order. Each new connection costs a round trip — one reason HTTP/2 reuses a single connection for many requests.' },
    { name: 'TLS', title: 'TLS handshake — securing it', desc: 'For HTTPS, browser and server agree on encryption: the server proves its identity with a certificate, and both sides derive keys that encrypt everything that follows. This is what the padlock means — nobody between you and the server can read or tamper with the traffic.' },
    { name: 'Request', title: 'HTTP request — asking for the page', desc: 'The browser sends a request: a method (GET), a path (/), and headers describing what it accepts, its language, cookies, and caching information it already has (like ETags). Headers are the request\'s fine print — and where most debugging answers live.' },
    { name: 'Response', title: 'HTTP response — the answer', desc: 'The server replies with a status code (hopefully 200), response headers (content type, caching rules, security policies) and the body — your HTML. If caching headers said the browser\'s stored copy is still fresh, this step can be skipped entirely: the fastest request is the one never made.' },
    { name: 'Parse', title: 'Parsing — building the DOM', desc: 'The browser reads HTML top to bottom, building the DOM tree, and CSS into the CSSOM. When it hits a plain <script> tag it stops parsing to run it — which is why scripts load with defer, and why a blocking script in <head> can delay first render by hundreds of milliseconds.' },
    { name: 'Render', title: 'Render — pixels on screen', desc: 'DOM and CSSOM combine into a render tree; the browser calculates layout (where everything goes), paints it, and composites layers on the GPU. This whole pipeline must finish in ~16ms per frame for smooth 60fps — and it\'s why animating transform and opacity (compositor-only) beats animating layout properties.' }
  ];

  /* ── HTTP STATUS CODES ───────────────────────────────────── */
  const STATUS_CODES = [
    [100, 'Continue', 'Keep going — the server got the headers, send the body.'],
    [101, 'Switching Protocols', 'Upgrading the connection, e.g. to WebSockets.'],
    [200, 'OK', 'Success. The everyday happy path.'],
    [201, 'Created', 'Success and a new resource now exists (after POST).'],
    [204, 'No Content', 'Success with nothing to return — common for DELETE.'],
    [206, 'Partial Content', 'A chunk of the file, from a range request (video streaming).'],
    [301, 'Moved Permanently', 'New address forever — browsers and Google update their records. SEO-safe redirect.'],
    [302, 'Found', 'Temporary detour — search engines keep the old URL.'],
    [304, 'Not Modified', 'Your cached copy is still good — no body sent. Caching working as intended.'],
    [307, 'Temporary Redirect', 'Like 302, but the method (POST stays POST) is preserved.'],
    [308, 'Permanent Redirect', 'Like 301, but the method is preserved.'],
    [400, 'Bad Request', 'The server couldn\'t understand the request — malformed data or parameters.'],
    [401, 'Unauthorized', 'Really means unauthenticated — log in first.'],
    [403, 'Forbidden', 'Authenticated, but not allowed to see this.'],
    [404, 'Not Found', 'No resource at this URL. Check the path — and ship a friendly 404 page.'],
    [405, 'Method Not Allowed', 'Right URL, wrong verb — e.g. POSTing to a GET-only endpoint.'],
    [408, 'Request Timeout', 'The server gave up waiting for the request to finish.'],
    [409, 'Conflict', 'The request clashes with current state — e.g. editing a stale version.'],
    [410, 'Gone', 'Deliberately removed, permanently — stronger than 404.'],
    [413, 'Payload Too Large', 'Upload exceeds the server\'s size limit.'],
    [415, 'Unsupported Media Type', 'The server doesn\'t accept this content type.'],
    [418, 'I\'m a teapot', 'An April Fools RFC classic — real servers use it as an easter egg.'],
    [422, 'Unprocessable Content', 'Understood the request, but validation failed — common in APIs.'],
    [429, 'Too Many Requests', 'Rate limited — slow down, often with a Retry-After header.'],
    [451, 'Unavailable For Legal Reasons', 'Blocked for legal/censorship reasons.'],
    [500, 'Internal Server Error', 'The server crashed handling this — check the server logs.'],
    [501, 'Not Implemented', 'The server doesn\'t support this functionality.'],
    [502, 'Bad Gateway', 'A proxy/CDN got an invalid response from the origin server.'],
    [503, 'Service Unavailable', 'Overloaded or down for maintenance — usually temporary.'],
    [504, 'Gateway Timeout', 'A proxy/CDN waited too long for the origin to answer.']
  ];

  /* ── PROGRESS STATE ──────────────────────────────────────── */
  function loadProgress() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
    catch { return {}; }
  }

  function saveProgress(state) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* storage blocked — session-only */ }
  }

  let progress = loadProgress();
  const TOTAL = Object.values(CHECKLISTS).reduce((n, list) => n + list.length, 0);

  /* ── RENDER CHECKLISTS ───────────────────────────────────── */
  document.querySelectorAll('.checklist[data-topic]').forEach(container => {
    const topic = container.getAttribute('data-topic');
    const items = CHECKLISTS[topic] || [];
    items.forEach(item => {
      const label = document.createElement('label');
      label.className = 'check-item' + (progress[item.id] ? ' done' : '');
      label.innerHTML = `<input type="checkbox" ${progress[item.id] ? 'checked' : ''} data-check="${item.id}" /><span>${item.text}</span>`;
      label.querySelector('input').addEventListener('change', (e) => {
        if (e.target.checked) progress[item.id] = true;
        else delete progress[item.id];
        label.classList.toggle('done', e.target.checked);
        saveProgress(progress);
        updateScores();
      });
      container.appendChild(label);
    });
  });

  /* ── SCORES ──────────────────────────────────────────────── */
  const scoreCount = document.getElementById('score-count');
  const scoreFill = document.getElementById('score-fill');

  function updateScores() {
    const done = Object.keys(progress).length;
    scoreCount.textContent = `${done} of ${TOTAL} checks`;
    scoreFill.style.width = (TOTAL ? (done / TOTAL) * 100 : 0) + '%';

    document.querySelectorAll('[data-topic-count]').forEach(el => {
      const topic = el.getAttribute('data-topic-count');
      const items = CHECKLISTS[topic] || [];
      const topicDone = items.filter(i => progress[i.id]).length;
      el.textContent = `${topicDone}/${items.length}`;
      el.classList.toggle('done', topicDone === items.length && items.length > 0);
    });
  }

  document.getElementById('reset-progress').addEventListener('click', () => {
    progress = {};
    saveProgress(progress);
    document.querySelectorAll('.check-item input').forEach(cb => { cb.checked = false; });
    document.querySelectorAll('.check-item').forEach(el => el.classList.remove('done'));
    updateScores();
    showToast('↺ Progress reset — fresh start');
  });

  updateScores();

  /* ── REQUEST JOURNEY STEPPER ─────────────────────────────── */
  const stepsWrap = document.getElementById('journey-steps');
  const journeyTitle = document.getElementById('journey-title');
  const journeyDesc = document.getElementById('journey-desc');
  const journeyPos = document.getElementById('journey-pos');
  const prevBtn = document.getElementById('journey-prev');
  const nextBtn = document.getElementById('journey-next');
  let stage = 0;

  STAGES.forEach((s, i) => {
    const btn = document.createElement('button');
    btn.className = 'journey-step';
    btn.textContent = (i + 1) + '. ' + s.name;
    btn.addEventListener('click', () => setStage(i));
    stepsWrap.appendChild(btn);
  });

  function setStage(i) {
    stage = Math.max(0, Math.min(STAGES.length - 1, i));
    journeyTitle.textContent = STAGES[stage].title;
    journeyDesc.textContent = STAGES[stage].desc;
    journeyPos.textContent = (stage + 1) + ' / ' + STAGES.length;
    prevBtn.disabled = stage === 0;
    nextBtn.disabled = stage === STAGES.length - 1;
    stepsWrap.querySelectorAll('.journey-step').forEach((b, idx) => {
      b.classList.toggle('active', idx === stage);
      b.classList.toggle('visited', idx < stage);
    });
  }

  prevBtn.addEventListener('click', () => setStage(stage - 1));
  nextBtn.addEventListener('click', () => setStage(stage + 1));
  setStage(0);

  /* ── STATUS CODE TABLE + SEARCH ──────────────────────────── */
  const statusBody = document.getElementById('status-table-body');
  const statusSearch = document.getElementById('status-search');
  const statusNoResults = document.getElementById('status-no-results');

  statusBody.innerHTML = STATUS_CODES.map(([code, name, meaning]) =>
    `<tr data-search="${code} ${name.toLowerCase()} ${meaning.toLowerCase()}"><td>${code}</td><td><strong>${name}</strong></td><td>${meaning}</td></tr>`
  ).join('');

  let statusTimer;
  statusSearch.addEventListener('input', () => {
    clearTimeout(statusTimer);
    statusTimer = setTimeout(() => {
      const q = statusSearch.value.trim().toLowerCase();
      let visible = 0;
      statusBody.querySelectorAll('tr').forEach(row => {
        const show = !q || row.getAttribute('data-search').includes(q);
        row.classList.toggle('hidden', !show);
        if (show) visible++;
      });
      statusNoResults.hidden = visible !== 0;
    }, 120);
  });

  /* ── STICKY TOOLBAR + SCROLL-SPY + KEYBOARD ──────────────── */
  const chips = Array.from(document.querySelectorAll('.tool-chips .chip'));
  const cards = Array.from(document.querySelectorAll('.topic-card'));

  initStickyToolbar(document.querySelector('.tools-toolbar'));

  function setActiveChip(cardId) {
    chips.forEach(chip => chip.classList.toggle('active', chip.getAttribute('href') === '#' + cardId));
  }

  // Position-based scroll-spy: the active topic is the last card
  // whose top has passed the header line. (Intersection ratios
  // misbehave for tall cards — a short neighbour always wins.)
  let spyScheduled = false;
  function updateSpy() {
    if (!cards.length) return;
    let current = cards[0].id;
    for (const card of cards) {
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
  chips.forEach(chip => chip.addEventListener('click', () => setActiveChip(chip.getAttribute('href').slice(1))));
  updateSpy();

  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
    const idx = parseInt(e.key) - 1;
    if (idx >= 0 && idx < cards.length) {
      cards[idx].scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

});
