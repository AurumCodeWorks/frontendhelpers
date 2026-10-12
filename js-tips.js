/* ═══════════════════════════════════════════════════════════
   JS TRICKS & TIPS
   Each tip = code + the reasoning behind it. Demos run real
   code (predefined functions — nothing is eval'd).
   ═══════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  const CATEGORIES = {
    syntax: 'Modern Syntax',
    arrays: 'Arrays & Objects',
    async:  'Async Patterns',
    dom:    'DOM & Browser',
    perf:   'Performance',
    util:   'Utilities & Intl'
  };

  const LEVELS = { beginner: 'Beginner', intermediate: 'Intermediate', pro: 'Pro' };

  /* ── THE LIBRARY ─────────────────────────────────────────── */
  const TIPS = [

    /* ═══ MODERN SYNTAX ═══ */
    {
      id: 'optional-chaining', title: 'Optional chaining + nullish coalescing', file: 'optional-chaining.js',
      cat: 'syntax', level: 'beginner',
      why: 'This pair kills the single most common JavaScript crash: <code>Cannot read properties of undefined</code>. The subtlety pros know: <code>??</code> only falls back on <code>null</code>/<code>undefined</code>, while <code>||</code> also discards perfectly valid values like <code>0</code>, <code>false</code> and <code>\'\'</code> — a classic source of silent bugs in forms and settings.',
      code: `const user = { profile: { name: 'Ada' } };

// Old way — one missing link and it throws
// const city = user.profile.address.city;   // 💥 TypeError

// Optional chaining short-circuits to undefined instead
const city = user.profile?.address?.city;    // undefined

// ?? only falls back on null/undefined — 0 and '' survive
const display = city ?? 'Unknown city';

// Works on methods and array indexes too
user.sendEmail?.();     // no-op if the method doesn't exist
const first = user.friends?.[0];`,
      demo: () => {
        const user = { profile: { name: 'Ada' } };
        const city = user.profile?.address?.city;
        return [
          'user.profile?.address?.city  →  ' + String(city) + '  (no crash)',
          "city ?? 'Unknown city'  →  " + (city ?? 'Unknown city'),
          "0 || 'fallback'  →  " + (0 || 'fallback') + "   (|| throws away a valid 0!)",
          "0 ?? 'fallback'  →  " + (0 ?? 'fallback') + '   (?? keeps it)'
        ];
      }
    },
    {
      id: 'destructuring', title: 'Destructuring with defaults and renaming', file: 'destructuring.js',
      cat: 'syntax', level: 'beginner',
      why: 'Destructured function signatures are self-documenting — callers see exactly which fields matter, arguments become order-independent, and defaults live next to the names they belong to. This is why nearly every modern library API accepts a single options object instead of five positional arguments.',
      code: `const config = { theme: 'dark', lang: 'en' };

// Pull values out, rename them, set defaults — one line
const { theme: colourScheme, retries = 3 } = config;

// In function signatures: a self-documenting API
function createUser({ name, role = 'viewer' }) {
  return \`\${name} (\${role})\`;
}
createUser({ name: 'Ada' });   // 'Ada (viewer)'

// Array destructuring: swap without a temp variable
let a = 1, b = 2;
[a, b] = [b, a];`,
      demo: () => {
        const config = { theme: 'dark', lang: 'en' };
        const { theme: colourScheme, retries = 3 } = config;
        const createUser = ({ name, role = 'viewer' }) => `${name} (${role})`;
        let a = 1, b = 2;
        [a, b] = [b, a];
        return [
          'colourScheme (renamed from theme)  →  ' + colourScheme,
          'retries (missing, defaulted)  →  ' + retries,
          "createUser({ name: 'Ada' })  →  " + createUser({ name: 'Ada' }),
          'after [a, b] = [b, a]  →  a=' + a + ', b=' + b
        ];
      }
    },
    {
      id: 'spread-rest', title: 'Spread and rest: immutable updates', file: 'spread-rest.js',
      cat: 'syntax', level: 'beginner',
      why: 'React, Redux and most state libraries detect changes by comparing object references — mutating an object in place makes changes invisible to them. Spread creates a <strong>new</strong> object cheaply, which is why <code>{ ...state, key: value }</code> is the backbone of modern state management. Note it is a shallow copy: nested objects are still shared.',
      code: `const base = { theme: 'dark', lang: 'en' };

// Immutable update — a NEW object, original untouched
const updated = { ...base, lang: 'fr' };

// Merge and clone arrays without mutation
const merged = [...listA, ...listB];

// Rest: collect "everything else"
const { theme, ...withoutTheme } = updated;

// Variadic functions without the arguments object
function sum(...numbers) {
  return numbers.reduce((total, n) => total + n, 0);
}`,
      demo: () => {
        const base = { theme: 'dark', lang: 'en' };
        const updated = { ...base, lang: 'fr' };
        const { theme, ...withoutTheme } = updated;
        const sum = (...numbers) => numbers.reduce((t, n) => t + n, 0);
        return [
          'updated  →  ' + JSON.stringify(updated),
          'base is untouched  →  ' + JSON.stringify(base),
          'withoutTheme (rest)  →  ' + JSON.stringify(withoutTheme),
          'sum(1, 2, 3, 4)  →  ' + sum(1, 2, 3, 4)
        ];
      }
    },
    {
      id: 'guard-clauses', title: 'Guard clauses over nested ifs', file: 'guard-clauses.js',
      cat: 'syntax', level: 'beginner',
      why: 'Every level of nesting is another condition the reader must hold in their head. Guard clauses handle the failure cases immediately and exit, so the happy path reads top-to-bottom at zero indentation. Code reviewers at most companies will flag deep nesting — this is the refactor they are asking for.',
      code: `// ❌ Nested: the happy path is buried three levels deep
function shipOrder(order) {
  if (order) {
    if (order.paid) {
      if (order.items.length > 0) {
        // ship it
      }
    }
  }
}

// ✅ Guard clauses: fail fast, then read flat
function shipOrderClean(order) {
  if (!order) return;
  if (!order.paid) return;
  if (order.items.length === 0) return;

  // ship it — zero indentation, zero mental stack
}`
    },
    {
      id: 'console-tricks', title: 'Console beyond console.log', file: 'console-tricks.js',
      cat: 'syntax', level: 'beginner',
      why: 'Debugging speed is a compounding skill. <code>{ user }</code> logs the variable\'s <strong>name</strong> along with its value, <code>console.table</code> turns arrays of objects into sortable tables, and <code>console.time</code> gives you real measurements instead of guesses. Open this page\'s DevTools and try them.',
      code: `const user = { name: 'Ada', role: 'admin' };

// Wrap in braces: logs the variable NAME with its value
console.log({ user });      // { user: { name: 'Ada', … } }

// Arrays of objects become a sortable table
console.table([
  { route: '/home',  visits: 1024 },
  { route: '/tools', visits: 862 }
]);

// Measure anything
console.time('render');
// …work…
console.timeEnd('render');  // render: 12.4ms

// Logs ONLY when the condition fails
console.assert(user.role === 'admin', 'Expected an admin!');`
    },

    /* ═══ ARRAYS & OBJECTS ═══ */
    {
      id: 'at-negative', title: 'Grab the last item with .at(-1)', file: 'last-item.js',
      cat: 'arrays', level: 'beginner',
      why: '<code>arr[arr.length - 1]</code> forces the reader to parse an expression to understand an intent. <code>.at(-1)</code> states the intent directly, works on strings too, and chains cleanly on temporary values — <code>getList().at(-1)</code> needs no intermediate variable.',
      code: `const queue = ['first', 'second', 'third'];

// Old way — repeat the array name, do the maths
const last = queue[queue.length - 1];

// Modern way — reads like English
queue.at(-1);    // 'third'
queue.at(-2);    // 'second'

// Works on strings too
'FrontendHelpers'.at(-1);   // 's'`,
      demo: () => {
        const queue = ['first', 'second', 'third'];
        return [
          'queue.at(-1)  →  ' + queue.at(-1),
          'queue.at(-2)  →  ' + queue.at(-2),
          "'FrontendHelpers'.at(-1)  →  " + 'FrontendHelpers'.at(-1)
        ];
      }
    },
    {
      id: 'set-dedupe', title: 'Deduplicate with Set', file: 'dedupe.js',
      cat: 'arrays', level: 'beginner',
      why: 'A <code>Set</code> physically cannot hold duplicates, so spreading one back into an array is the cleanest dedupe there is. The deeper win: <code>set.has()</code> is O(1) while <code>array.includes()</code> scans every element — for repeated membership checks on big lists, the difference is dramatic.',
      code: `const tags = ['css', 'js', 'css', 'html', 'js'];

// A Set can only hold unique values — spread it back out
const unique = [...new Set(tags)];   // ['css', 'js', 'html']

// Bonus: O(1) membership checks vs O(n) for .includes()
const allowedRoles = new Set(['admin', 'editor']);
allowedRoles.has('admin');   // true — instant at any size`,
      demo: () => {
        const tags = ['css', 'js', 'css', 'html', 'js'];
        const unique = [...new Set(tags)];
        return [
          'input   →  ' + JSON.stringify(tags),
          'deduped →  ' + JSON.stringify(unique),
          "new Set(['admin','editor']).has('admin')  →  true"
        ];
      }
    },
    {
      id: 'flatmap', title: 'flatMap: map and flatten in one pass', file: 'flatmap.js',
      cat: 'arrays', level: 'intermediate',
      why: 'When every item maps to a list, <code>map().flat()</code> walks the data twice and allocates an intermediate array. <code>flatMap</code> does it in one pass. The pro trick: returning <code>[]</code> for unwanted items makes it a combined <em>filter + map</em> — one traversal instead of two chained ones.',
      code: `const posts = [
  { title: 'Intro',     tags: ['css', 'basics'] },
  { title: 'Deep dive', tags: ['js'] }
];

// map + flat in a single pass
const allTags = posts.flatMap(post => post.tags);
// ['css', 'basics', 'js']

// Trick: return [] to filter and map at the same time
const longTags = posts.flatMap(post =>
  post.tags.filter(tag => tag.length > 2)
);
// ['css', 'basics']`,
      demo: () => {
        const posts = [
          { title: 'Intro', tags: ['css', 'basics'] },
          { title: 'Deep dive', tags: ['js'] }
        ];
        return [
          'allTags  →  ' + JSON.stringify(posts.flatMap(p => p.tags)),
          'longTags →  ' + JSON.stringify(posts.flatMap(p => p.tags.filter(t => t.length > 2)))
        ];
      }
    },
    {
      id: 'group-by', title: 'Group a list with Object.groupBy', file: 'group-by.js',
      cat: 'arrays', level: 'intermediate',
      why: 'Grouping used to be the number-one reason to import Lodash. <code>Object.groupBy</code> (Chrome 117+, Firefox 119+, Safari 17.4+) does it natively in one call. Keep the <code>reduce</code> fallback in your toolkit for older targets — and note the tidy <code>??=</code> operator that creates each bucket on first use.',
      code: `const files = [
  { name: 'logo.svg', type: 'image'  },
  { name: 'app.js',   type: 'script' },
  { name: 'hero.png', type: 'image'  }
];

// One call, grouped buckets (baseline 2024)
const grouped = Object.groupBy(files, file => file.type);
// { image: [logo.svg, hero.png], script: [app.js] }

// Fallback for older browsers — same result
const manual = files.reduce((acc, file) => {
  (acc[file.type] ??= []).push(file);
  return acc;
}, {});`,
      demo: () => {
        const files = [
          { name: 'logo.svg', type: 'image' },
          { name: 'app.js', type: 'script' },
          { name: 'hero.png', type: 'image' }
        ];
        const manual = files.reduce((acc, f) => { (acc[f.type] ??= []).push(f.name); return acc; }, {});
        const lines = ['reduce fallback  →  ' + JSON.stringify(manual)];
        if (typeof Object.groupBy === 'function') {
          const grouped = Object.groupBy(files, f => f.type);
          const summary = Object.fromEntries(Object.entries(grouped).map(([k, v]) => [k, v.map(f => f.name)]));
          lines.unshift('Object.groupBy  →  ' + JSON.stringify(summary));
        } else {
          lines.unshift('Object.groupBy not supported in this browser — fallback below still works:');
        }
        return lines;
      }
    },
    {
      id: 'structured-clone', title: 'Deep clone with structuredClone', file: 'deep-clone.js',
      cat: 'arrays', level: 'intermediate',
      why: 'The old <code>JSON.parse(JSON.stringify(obj))</code> hack silently corrupts data: Dates become strings, <code>Map</code>/<code>Set</code> become empty objects, <code>undefined</code> fields vanish. <code>structuredClone</code> is built into every modern browser, handles all of those plus circular references, and is usually faster too.',
      code: `const state = {
  user: { name: 'Ada' },
  updated: new Date(),
  ids: new Set([1, 2, 3])
};

// ❌ The JSON hack corrupts silently:
//    Dates → strings, Sets → {}, undefined → gone
const broken = JSON.parse(JSON.stringify(state));

// ✅ True deep clone, native since 2022
const copy = structuredClone(state);

copy.user.name = 'Grace';
state.user.name;   // still 'Ada' — fully independent`,
      demo: () => {
        const state = { user: { name: 'Ada' }, updated: new Date(), ids: new Set([1, 2, 3]) };
        const broken = JSON.parse(JSON.stringify(state));
        const copy = structuredClone(state);
        copy.user.name = 'Grace';
        return [
          'JSON hack: Set survives?  →  ' + (broken.ids instanceof Set ? 'yes' : 'NO — became ' + JSON.stringify(broken.ids)),
          'structuredClone: Set survives?  →  ' + (copy.ids instanceof Set ? 'yes (' + copy.ids.size + ' items)' : 'no'),
          "after copy.user.name = 'Grace', original  →  " + state.user.name
        ];
      }
    },
    {
      id: 'reduce-shaping', title: 'reduce: shape data, don’t just sum it', file: 'reduce.js',
      cat: 'arrays', level: 'intermediate',
      why: 'The pattern to internalise is <strong>indexing by id</strong>: turn an array into a lookup object once, then every subsequent access is O(1) instead of an O(n) <code>.find()</code>. On a list you query hundreds of times — rows by id, users by email — this is one of the highest-value micro-optimisations there is, and it makes the code clearer too.',
      code: `const orders = [
  { id: 'a1', total: 40 },
  { id: 'b2', total: 25 },
  { id: 'c3', total: 60 }
];

// Index by id → O(1) lookups instead of .find() everywhere
const byId = orders.reduce((acc, order) => {
  acc[order.id] = order;
  return acc;
}, {});

byId['b2'];   // { id: 'b2', total: 25 } — instantly

// Aggregate in the same shape
const revenue = orders.reduce((sum, o) => sum + o.total, 0);`,
      demo: () => {
        const orders = [{ id: 'a1', total: 40 }, { id: 'b2', total: 25 }, { id: 'c3', total: 60 }];
        const byId = orders.reduce((acc, o) => { acc[o.id] = o; return acc; }, {});
        const revenue = orders.reduce((s, o) => s + o.total, 0);
        return [
          "byId['b2']  →  " + JSON.stringify(byId['b2']),
          'revenue  →  ' + revenue
        ];
      }
    },
    {
      id: 'array-from-range', title: 'Generate ranges with Array.from', file: 'ranges.js',
      cat: 'arrays', level: 'intermediate',
      why: 'JavaScript has no built-in range() — this idiom is the standard substitute. The <code>{ length: n }</code> object is enough for <code>Array.from</code> to iterate, and the mapping function receives the index. You will use it constantly: pagination buttons, skeleton placeholders, calendar grids, test fixtures.',
      code: `// A number range, no loop in sight
const range = Array.from({ length: 5 }, (_, i) => i + 1);
// [1, 2, 3, 4, 5]

// Practical: skeleton placeholders while data loads
const slots = Array.from({ length: 6 }, (_, i) =>
  \`<div class="skeleton" id="slot-\${i}"></div>\`
);

// Also converts any iterable into a real array
Array.from(document.querySelectorAll('a'),
  link => link.href);`,
      demo: () => {
        const range = Array.from({ length: 5 }, (_, i) => i + 1);
        const evens = Array.from({ length: 5 }, (_, i) => i * 2);
        return [
          'range 1–5  →  ' + JSON.stringify(range),
          'first five evens  →  ' + JSON.stringify(evens),
          'links on this page  →  ' + document.querySelectorAll('a').length + ' converted in one call'
        ];
      }
    },

    /* ═══ ASYNC PATTERNS ═══ */
    {
      id: 'all-settled', title: 'Promise.allSettled: no all-or-nothing', file: 'all-settled.js',
      cat: 'async', level: 'intermediate',
      why: '<code>Promise.all</code> rejects the moment <strong>one</strong> promise fails — the other results are thrown away. That is right for dependent data, but wrong for dashboards, widget grids and batch jobs where partial success is useful. <code>allSettled</code> always resolves, handing you every outcome to handle individually.',
      code: `const results = await Promise.allSettled([
  fetch('/api/user'),
  fetch('/api/posts'),
  fetch('/api/flaky-service')
]);

results.forEach(result => {
  if (result.status === 'fulfilled') {
    render(result.value);
  } else {
    logError(result.reason);
    // …the OTHER two requests still succeeded
  }
});

// Promise.all would have rejected everything here`,
      demo: async () => {
        const results = await Promise.allSettled([
          Promise.resolve('user data'),
          Promise.resolve('post list'),
          Promise.reject(new Error('service down'))
        ]);
        return results.map((r, i) =>
          '[' + i + '] ' + r.status + (r.status === 'fulfilled' ? '  →  ' + r.value : '  →  ' + r.reason.message)
        );
      }
    },
    {
      id: 'abort-timeout', title: 'Fetch with a timeout via AbortController', file: 'fetch-timeout.js',
      cat: 'async', level: 'pro',
      why: '<code>fetch</code> has <strong>no timeout by default</strong> — a hung server can leave your UI spinning forever. <code>AbortController</code> is the platform\'s cancellation primitive: the same pattern also cancels stale requests in type-ahead search, so a slow response for “ca” can never overwrite results for “cats”.',
      code: `async function fetchWithTimeout(url, ms = 5000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);

  try {
    const response = await fetch(url, {
      signal: controller.signal
    });
    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}

// Same primitive, different job: cancel the PREVIOUS
// search when the user types again — no stale results`
    },
    {
      id: 'parallel-await', title: 'Parallel await beats sequential await', file: 'parallel-await.js',
      cat: 'async', level: 'intermediate',
      why: 'Three sequential awaits on 200ms requests take 600ms; in parallel they take 200ms. This is the most common real-world async performance bug — the awaits look identical, but the sequential version quietly serialises independent work. Press <em>Run</em> to measure the difference live in your browser.',
      code: `// ❌ Sequential — each await blocks the next (≈600ms)
const user  = await fetchUser();    // 200ms
const posts = await fetchPosts();   // 200ms
const tags  = await fetchTags();    // 200ms

// ✅ Parallel — all three start immediately (≈200ms)
const [u, p, t] = await Promise.all([
  fetchUser(),
  fetchPosts(),
  fetchTags()
]);

// Rule: if B doesn't need A's result, don't await A first`,
      demo: async () => {
        const sleep = ms => new Promise(r => setTimeout(r, ms));
        const t0 = performance.now();
        await sleep(120); await sleep(120); await sleep(120);
        const sequential = Math.round(performance.now() - t0);
        const t1 = performance.now();
        await Promise.all([sleep(120), sleep(120), sleep(120)]);
        const parallel = Math.round(performance.now() - t1);
        return [
          '3 × 120ms task, sequential  →  ' + sequential + 'ms',
          '3 × 120ms task, parallel    →  ' + parallel + 'ms',
          'measured just now, in your browser'
        ];
      }
    },
    {
      id: 'safe-await', title: 'Go-style [value, error] tuples', file: 'safe-await.js',
      cat: 'async', level: 'pro',
      why: 'try/catch around every await pushes the happy path into nested blocks and makes it easy to forget error handling entirely. Wrapping once turns every async call into a flat, explicit two-value check — you can see at the call site that the error case was considered. Popularised by Go, now common in production JS codebases.',
      code: `// Wrap any promise into [value, error] — never throws
const attempt = promise =>
  promise
    .then(value => [value, null])
    .catch(error => [null, error]);

const [user, error] = await attempt(fetchUser());

if (error) {
  showToast('Could not load your profile');
} else {
  render(user);
}
// Flat, explicit, impossible to forget the error case`,
      demo: async () => {
        const attempt = p => p.then(v => [v, null]).catch(e => [null, e]);
        const [v1, e1] = await attempt(Promise.resolve(42));
        const [v2, e2] = await attempt(Promise.reject(new Error('boom')));
        return [
          'attempt(resolve(42))  →  value: ' + v1 + ', error: ' + e1,
          "attempt(reject('boom'))  →  value: " + v2 + ', error: ' + (e2 && e2.message)
        ];
      }
    },

    /* ═══ DOM & BROWSER ═══ */
    {
      id: 'event-delegation', title: 'Event delegation: one listener, infinite rows', file: 'delegation.js',
      cat: 'dom', level: 'intermediate',
      why: 'Events bubble up the DOM, so one parent listener hears every child click — including elements added <strong>after</strong> the listener was attached. That solves the two classic bugs at once: memory bloat from hundreds of listeners, and dynamically added rows that mysteriously do nothing. <code>closest()</code> finds which actionable element was actually hit.',
      code: `// ❌ 500 rows = 500 listeners — and rows added
//    later have no listener at all

// ✅ ONE listener on the parent catches every click
document.querySelector('#table').addEventListener('click', e => {
  const btn = e.target.closest('[data-action="delete"]');
  if (!btn) return;

  removeRow(btn.closest('tr'));
});

// Rows added tomorrow work automatically —
// their clicks bubble up to the same parent`
    },
    {
      id: 'intersection-observer', title: 'IntersectionObserver for scroll effects', file: 'observer.js',
      cat: 'dom', level: 'intermediate',
      why: 'Scroll listeners fire hundreds of times per second on the main thread, and reading element positions inside them forces synchronous layout — the recipe for scroll jank. <code>IntersectionObserver</code> does the visibility maths off the main thread and calls you only when it matters. The animation gallery on this site uses exactly this to replay cards as you scroll.',
      code: `// Fires only when elements enter the viewport —
// no scroll listeners, no layout thrash
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);  // reveal once
    }
  });
}, { threshold: 0.2 });

document.querySelectorAll('.reveal')
  .forEach(el => observer.observe(el));

// CSS does the rest:
// .reveal { opacity: 0; transform: translateY(20px); }
// .reveal.is-visible { opacity: 1; transform: none; }`
    },
    {
      id: 'dataset', title: 'data-* attributes: state the DOM can see', file: 'dataset.js',
      cat: 'dom', level: 'beginner',
      why: 'Storing state in <code>data-*</code> attributes means CSS can react to it without a single line of style-juggling JavaScript — <code>button[data-state="loading"]</code> is a selector. One write updates both behaviour and appearance. Remember values always come back as <strong>strings</strong>: <code>dataset.count</code> of “3” needs a <code>Number()</code>.',
      code: `// <button data-product-id="42" data-in-stock="true">
const button = document.querySelector('button');

button.dataset.productId;  // '42' (kebab-case ↔ camelCase)
button.dataset.inStock;    // 'true' — always a STRING

// Write state back into the DOM
button.dataset.state = 'loading';

// …and let CSS react with zero extra JS:
// button[data-state="loading"] { opacity: 0.5; }`
    },
    {
      id: 'match-media', title: 'matchMedia: media queries in JavaScript', file: 'match-media.js',
      cat: 'dom', level: 'intermediate',
      why: 'A <code>resize</code> listener fires continuously while dragging a window; <code>matchMedia</code>\'s <code>change</code> event fires exactly once, at the moment the query flips. It also reads user preferences CSS can see but JS logic often ignores — reduced motion, colour scheme, pointer type. Press <em>Run</em> to query your actual browser state.',
      code: `const mobile = window.matchMedia('(max-width: 768px)');

// Read once…
if (mobile.matches) enableSwipeGestures();

// …or react exactly when the breakpoint flips
mobile.addEventListener('change', e => {
  e.matches ? enableSwipeGestures() : enableHoverMenus();
});

// Any media feature works, not just width
const reducedMotion =
  window.matchMedia('(prefers-reduced-motion: reduce)');
if (reducedMotion.matches) skipAnimations();`,
      demo: () => [
        '(max-width: 768px)  →  ' + window.matchMedia('(max-width: 768px)').matches + '   (your window, right now)',
        '(prefers-color-scheme: dark)  →  ' + window.matchMedia('(prefers-color-scheme: dark)').matches,
        '(prefers-reduced-motion: reduce)  →  ' + window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        '(pointer: coarse)  →  ' + window.matchMedia('(pointer: coarse)').matches + '   (touch device?)'
      ]
    },
    {
      id: 'clipboard-api', title: 'Clipboard API done properly', file: 'clipboard.js',
      cat: 'dom', level: 'beginner',
      why: 'The async Clipboard API replaced the old <code>document.execCommand(\'copy\')</code> hack, but it has two conditions juniors miss: it needs a secure context (HTTPS or localhost) and a user gesture. Wrap it in try/catch with a human fallback and it degrades gracefully — every Copy button on this site uses exactly this pattern.',
      code: `async function copy(text) {
  try {
    await navigator.clipboard.writeText(text);
    showToast('Copied!');
  } catch {
    // Needs HTTPS + a user gesture — offer a fallback
    showToast('Press Ctrl+C to copy');
  }
}

// Reading is gated harder (permission prompt):
const pasted = await navigator.clipboard.readText();`
    },
    {
      id: 'storage-wrapper', title: 'A safe localStorage wrapper', file: 'storage.js',
      cat: 'dom', level: 'beginner',
      why: 'Raw <code>localStorage</code> has three traps: it only stores strings (objects become <code>"[object Object]"</code>), <code>getItem</code> returns <code>null</code> that then crashes <code>JSON.parse</code> chains, and in some private-browsing modes <code>setItem</code> <strong>throws</strong>. Ten lines of wrapper remove all three permanently.',
      code: `const storage = {
  get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch {
      return fallback;   // corrupt JSON or blocked storage
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch { /* quota full / private mode — stay calm */ }
  }
};

storage.set('prefs', { theme: 'dark', fontSize: 18 });
storage.get('prefs', {});   // a real object, not a string`,
      demo: () => {
        try {
          const key = 'fh-demo-storage';
          localStorage.setItem(key, JSON.stringify({ theme: 'dark', fontSize: 18 }));
          const back = JSON.parse(localStorage.getItem(key));
          localStorage.removeItem(key);
          return [
            'set → get roundtrip  →  ' + JSON.stringify(back),
            'typeof result  →  ' + typeof back + '  (a real object, not a string)',
            '(demo key written and cleaned up)'
          ];
        } catch {
          return ['localStorage is blocked in this context — which is exactly why the wrapper try/catches.'];
        }
      }
    },

    /* ═══ PERFORMANCE ═══ */
    {
      id: 'debounce', title: 'Debounce: wait until they stop', file: 'debounce.js',
      cat: 'perf', level: 'intermediate',
      why: 'Typing “hello” fires five input events; without debouncing that is five API calls, four of them wasted. Debounce collapses the burst into <strong>one</strong> call after the user pauses. The trade-off is latency — results arrive <em>delay</em> ms after the last keystroke — so tune it: ~300ms for search, ~500ms for autosave.',
      code: `function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

// 5 keystrokes → ONE request, 300ms after typing stops
const search = debounce(query => {
  fetch('/api/search?q=' + encodeURIComponent(query));
}, 300);

input.addEventListener('input', e => search(e.target.value));`
    },
    {
      id: 'raf-throttle', title: 'Throttle to the frame rate with rAF', file: 'raf-throttle.js',
      cat: 'perf', level: 'pro',
      why: 'Scroll and pointer events can fire far more often than the screen repaints — any work beyond once per frame is thrown away, yet still burns CPU. <code>requestAnimationFrame</code> throttling runs your handler at most once per paint, perfectly synced to the display. Prefer this over <code>setTimeout</code> throttles for anything visual.',
      code: `function rafThrottle(fn) {
  let scheduled = false;
  return (...args) => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      fn(...args);
      scheduled = false;
    });
  };
}

// Runs at most once per frame — never wasted work
window.addEventListener('scroll',
  rafThrottle(() => updateReadingProgress()),
  { passive: true });`
    },
    {
      id: 'memoize', title: 'Memoization: never compute twice', file: 'memoize.js',
      cat: 'perf', level: 'pro',
      why: 'If a function is <strong>pure</strong> — same input, same output — recomputing it is pure waste. A <code>Map</code> cache trades memory for speed. Press <em>Run</em>: naive fib(20) makes ~22,000 calls; memoised, 21. The same idea powers React\'s <code>useMemo</code> and every build-tool cache you have ever waited for.',
      code: `function memoize(fn) {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (!cache.has(key)) {
      cache.set(key, fn(...args));
    }
    return cache.get(key);
  };
}

// Only PURE functions qualify:
// same input → same output, no side effects
const layout = memoize(computeExpensiveLayout);`,
      demo: () => {
        let plainCalls = 0;
        const fibPlain = n => { plainCalls++; return n < 2 ? n : fibPlain(n - 1) + fibPlain(n - 2); };
        fibPlain(20);
        let memoCalls = 0;
        const cache = new Map();
        const fibMemo = n => {
          if (cache.has(n)) return cache.get(n);
          memoCalls++;
          const v = n < 2 ? n : fibMemo(n - 1) + fibMemo(n - 2);
          cache.set(n, v);
          return v;
        };
        fibMemo(20);
        return [
          'fib(20) naive     →  ' + plainCalls.toLocaleString() + ' function calls',
          'fib(20) memoised  →  ' + memoCalls + ' function calls',
          'same answer, ~' + Math.round(plainCalls / memoCalls) + '× less work'
        ];
      }
    },

    /* ═══ UTILITIES & INTL ═══ */
    {
      id: 'intl-format', title: 'Intl: currency and dates without libraries', file: 'intl-format.js',
      cat: 'util', level: 'beginner',
      why: 'Hand-rolled price formatting with <code>toFixed(2)</code> breaks the moment you meet thousands separators, other currencies or other locales. <code>Intl</code> ships with the browser, knows every locale\'s rules, and replaces entire formatting libraries at zero bundle cost. This is the modern answer to “should I install a date library?” — usually, no.',
      code: `// Currency, correctly, zero dependencies
new Intl.NumberFormat('en-GB', {
  style: 'currency', currency: 'GBP'
}).format(1499.99);          // £1,499.99

// Compact notation for dashboards and counters
new Intl.NumberFormat('en', {
  notation: 'compact'
}).format(1250000);          // 1.3M

// Dates that respect the reader's locale
new Intl.DateTimeFormat('en-GB', {
  dateStyle: 'long'
}).format(new Date());       // 17 July 2026`,
      demo: () => [
        "currency  →  " + new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(1499.99),
        'compact  →  ' + new Intl.NumberFormat('en', { notation: 'compact' }).format(1250000),
        'today  →  ' + new Intl.DateTimeFormat('en-GB', { dateStyle: 'long' }).format(new Date()),
        'in French  →  ' + new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(new Date())
      ]
    },
    {
      id: 'relative-time', title: '“3 hours ago” with Intl.RelativeTimeFormat', file: 'time-ago.js',
      cat: 'util', level: 'intermediate',
      why: 'Relative timestamps were the last big reason teams kept Moment.js (and its 70KB) around. <code>Intl.RelativeTimeFormat</code> handles the grammar — including special forms like “yesterday” via <code>numeric: \'auto\'</code> — in every locale, natively. The <code>timeAgo</code> helper below picks the sensible unit for any date.',
      code: `const rtf = new Intl.RelativeTimeFormat('en', {
  numeric: 'auto'
});

rtf.format(-1, 'day');    // 'yesterday'
rtf.format(-3, 'hour');   // '3 hours ago'
rtf.format(2, 'week');    // 'in 2 weeks'

// Pick the right unit automatically
function timeAgo(date) {
  const s = (date - Date.now()) / 1000;
  const units = [['year', 31536000], ['month', 2592000],
    ['day', 86400], ['hour', 3600], ['minute', 60]];
  for (const [unit, size] of units) {
    if (Math.abs(s) >= size)
      return rtf.format(Math.round(s / size), unit);
  }
  return 'just now';
}`,
      demo: () => {
        const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
        const timeAgo = date => {
          const s = (date - Date.now()) / 1000;
          const units = [['year', 31536000], ['month', 2592000], ['day', 86400], ['hour', 3600], ['minute', 60]];
          for (const [unit, size] of units) {
            if (Math.abs(s) >= size) return rtf.format(Math.round(s / size), unit);
          }
          return 'just now';
        };
        return [
          "rtf.format(-1, 'day')  →  " + rtf.format(-1, 'day'),
          "rtf.format(-3, 'hour')  →  " + rtf.format(-3, 'hour'),
          'timeAgo(3 hours ago)  →  ' + timeAgo(Date.now() - 3 * 3600 * 1000),
          'timeAgo(40 days ago)  →  ' + timeAgo(Date.now() - 40 * 86400 * 1000)
        ];
      }
    },
    {
      id: 'random-uuid', title: 'Real unique IDs with crypto.randomUUID', file: 'uuid.js',
      cat: 'util', level: 'beginner',
      why: '<code>Math.random()</code> is not collision-safe — with enough generated IDs, duplicates <em>will</em> happen, and the resulting bugs (two list rows sharing a key, overwritten records) are miserable to trace. <code>crypto.randomUUID()</code> produces cryptographically strong v4 UUIDs natively. One caveat: it requires a secure context (HTTPS or localhost).',
      code: `// Cryptographically strong, collision-safe, built in
const id = crypto.randomUUID();
// '36b8f84d-df4e-4d49-b662-bcde71a8764f'

// ❌ The old hack — collisions are a real risk:
const risky = Math.random().toString(36).slice(2);

// Need raw random bytes instead?
const bytes = crypto.getRandomValues(new Uint8Array(8));`,
      demo: () => {
        try {
          return [
            'crypto.randomUUID()  →  ' + crypto.randomUUID(),
            'and again  →  ' + crypto.randomUUID(),
            'fresh every call, guaranteed unique'
          ];
        } catch {
          return ['crypto.randomUUID needs a secure context (HTTPS or localhost).'];
        }
      }
    },

    /* ═══ ADVANCED ═══ */
    {
      id: 'event-loop', title: 'The event loop: microtasks vs macrotasks', file: 'event-loop.js',
      cat: 'async', level: 'pro',
      why: 'This is the interview question that separates "uses async" from "understands async". After every synchronous chunk finishes, JavaScript drains the <strong>entire microtask queue</strong> (promise callbacks, <code>queueMicrotask</code>) before running even one macrotask (<code>setTimeout</code>, events). That\'s why <code>setTimeout(fn, 0)</code> is never really 0 — and why a flood of chained promises can starve rendering. Press <em>Run</em>: the real order, from your browser.',
      code: `console.log('1: synchronous');

setTimeout(() => {
  console.log('4: macrotask (setTimeout 0)');
}, 0);

Promise.resolve().then(() => {
  console.log('3: microtask (promise .then)');
});

console.log('2: synchronous again');

// Order: 1, 2, 3, 4 — ALL microtasks run before
// the next macrotask, no matter the timeout value`,
      demo: () => new Promise(resolve => {
        const order = [];
        order.push('1: synchronous');
        setTimeout(() => {
          order.push('4: macrotask (setTimeout 0)');
          resolve(order.concat('— microtasks always beat macrotasks'));
        }, 0);
        Promise.resolve().then(() => order.push('3: microtask (promise .then)'));
        order.push('2: synchronous again');
      })
    },
    {
      id: 'proxy-reactive', title: 'Proxy: reactive state in 15 lines', file: 'proxy-state.js',
      cat: 'syntax', level: 'pro',
      why: 'A <code>Proxy</code> intercepts property access on an object — which is exactly how Vue\'s reactivity and many state libraries work under the hood. The set trap fires on every assignment, so "change state, UI updates itself" needs no framework at all. The trade-off: proxies intercept the <em>wrapper</em>, so <code>state.user.name = x</code> on nested objects needs recursive wrapping — which is precisely what reactivity libraries sell you.',
      code: `function reactive(target, onChange) {
  return new Proxy(target, {
    set(obj, key, value) {
      const old = obj[key];
      obj[key] = value;
      if (old !== value) onChange(key, value);
      return true;   // signal success (strict mode cares)
    }
  });
}

const state = reactive({ count: 0 }, (key, value) => {
  render(\`\${key} changed to \${value}\`);
});

state.count = 1;   // render() fires automatically
state.count = 2;   // and again — no framework involved`,
      demo: () => {
        const log = [];
        const reactive = (target, onChange) => new Proxy(target, {
          set(obj, key, value) {
            const old = obj[key];
            obj[key] = value;
            if (old !== value) onChange(key, value);
            return true;
          }
        });
        const state = reactive({ count: 0 }, (k, v) => log.push(`render fired: ${k} → ${v}`));
        state.count = 1;
        state.count = 2;
        state.count = 2;
        return log.concat('assigning the same value twice → only 2 renders (change detection)');
      }
    },
    {
      id: 'generators', title: 'Generators: lazy, even infinite, sequences', file: 'generators.js',
      cat: 'syntax', level: 'pro',
      why: 'A generator produces values <strong>on demand</strong> — it pauses at every <code>yield</code> until someone asks for the next value. That makes "infinite" sequences safe: nothing is computed until consumed. Pros reach for them for ID factories, pagination cursors, and processing huge datasets without building huge arrays. <code>function*</code> looks alien for a week, then becomes a superpower.',
      code: `function* fibonacci() {
  let [a, b] = [0, 1];
  while (true) {          // infinite — and totally safe
    yield a;
    [a, b] = [b, a + b];
  }
}

// take(n): consume just n values from any generator
function take(gen, n) {
  const out = [];
  for (const value of gen) {
    out.push(value);
    if (out.length === n) break;
  }
  return out;
}

take(fibonacci(), 8);   // [0, 1, 1, 2, 3, 5, 8, 13]`,
      demo: () => {
        function* fibonacci() {
          let [a, b] = [0, 1];
          while (true) { yield a; [a, b] = [b, a + b]; }
        }
        const take = (gen, n) => {
          const out = [];
          for (const v of gen) { out.push(v); if (out.length === n) break; }
          return out;
        };
        return [
          'take(fibonacci(), 8)  →  [' + take(fibonacci(), 8).join(', ') + ']',
          'take(fibonacci(), 12) →  [' + take(fibonacci(), 12).join(', ') + ']',
          'the infinite loop never ran ahead of what was consumed'
        ];
      }
    },
    {
      id: 'pipe-curry', title: 'Pipe: composing small functions', file: 'pipe.js',
      cat: 'util', level: 'intermediate',
      why: 'Deeply nested calls read inside-out: <code>c(b(a(x)))</code> makes the reader start in the middle. <code>pipe</code> flips that into reading order — data flows left to right through a list of small, testable, reusable steps. This is the functional style underneath RxJS, lodash/fp and most data pipelines, in three lines of vanilla JS.',
      code: `const pipe = (...fns) =>
  (input) => fns.reduce((value, fn) => fn(value), input);

// Small, single-purpose, individually testable steps
const trim      = s => s.trim();
const lower     = s => s.toLowerCase();
const hyphenate = s => s.replace(/\\s+/g, '-');

const slugify = pipe(trim, lower, hyphenate);

slugify('  Hello Wonderful World  ');
// 'hello-wonderful-world'

// Reads top-to-bottom like a recipe — compare:
// hyphenate(lower(trim(input)))  ← inside-out`,
      demo: () => {
        const pipe = (...fns) => (input) => fns.reduce((v, fn) => fn(v), input);
        const trim = s => s.trim();
        const lower = s => s.toLowerCase();
        const hyphenate = s => s.replace(/\s+/g, '-');
        const slugify = pipe(trim, lower, hyphenate);
        return [
          "slugify('  Hello Wonderful World  ')  →  '" + slugify('  Hello Wonderful World  ') + "'",
          "pipe(trim, lower)('  MiXeD  ')  →  '" + pipe(trim, lower)('  MiXeD  ') + "'",
          'same steps, recomposed — that\'s the point'
        ];
      }
    }
  ];

  /* ── SYNTAX HIGHLIGHTER (tiny, single-pass) ──────────────── */
  const TOKEN_RE = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|(`(?:\\[\s\S]|[^\\`])*`|'(?:\\.|[^'\\\n])*'|"(?:\\.|[^"\\\n])*")|\b(async|await|break|case|catch|class|const|continue|default|delete|else|export|extends|finally|for|from|function|if|import|in|instanceof|let|new|of|return|static|switch|throw|try|typeof|var|void|while|yield)\b|\b(true|false|null|undefined|this|super|NaN|Infinity)\b|\b(0x[\da-fA-F]+|\d+(?:\.\d+)?)\b/g;

  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function highlight(code) {
    return escapeHtml(code).replace(TOKEN_RE, (match, comment, string, keyword, literal, number) => {
      if (comment) return '<span class="tok-comment">' + comment + '</span>';
      if (string)  return '<span class="tok-string">' + string + '</span>';
      if (keyword) return '<span class="tok-keyword">' + keyword + '</span>';
      if (literal) return '<span class="tok-literal">' + literal + '</span>';
      if (number)  return '<span class="tok-number">' + number + '</span>';
      return match;
    });
  }

  /* ── STATE ───────────────────────────────────────────────── */
  const list = document.getElementById('tips-list');
  const catChips = document.getElementById('tip-cat-chips');
  const levelChips = document.getElementById('tip-level-chips');
  const searchInput = document.getElementById('tip-search');
  const noResults = document.getElementById('no-results');
  let activeCat = 'all';
  let activeLevel = 'all';

  const badge = document.getElementById('tips-count-badge');
  if (badge) badge.textContent = `${TIPS.length} Snippets`;

  /* ── CHIPS ───────────────────────────────────────────────── */
  function buildChipRow(container, items, getActive, setActive) {
    container.innerHTML = '';
    items.forEach(item => {
      const btn = document.createElement('button');
      btn.className = 'chip' + (item.key === getActive() ? ' active' : '');
      btn.setAttribute('data-key', item.key);
      btn.innerHTML = item.label + (item.count !== undefined ? `<span class="chip-count">${item.count}</span>` : '');
      btn.addEventListener('click', () => {
        setActive(item.key);
        container.querySelectorAll('.chip').forEach(ch =>
          ch.classList.toggle('active', ch.getAttribute('data-key') === item.key));
        applyFilters();
      });
      container.appendChild(btn);
    });
  }

  function buildChips() {
    const catCounts = {};
    const levelCounts = {};
    TIPS.forEach(t => {
      catCounts[t.cat] = (catCounts[t.cat] || 0) + 1;
      levelCounts[t.level] = (levelCounts[t.level] || 0) + 1;
    });

    buildChipRow(catChips, [
      { key: 'all', label: 'All', count: TIPS.length },
      ...Object.entries(CATEGORIES).map(([key, label]) => ({ key, label, count: catCounts[key] || 0 }))
    ], () => activeCat, k => { activeCat = k; });

    buildChipRow(levelChips, [
      { key: 'all', label: 'All levels' },
      ...Object.entries(LEVELS).map(([key, label]) => ({ key, label, count: levelCounts[key] || 0 }))
    ], () => activeLevel, k => { activeLevel = k; });
  }

  /* ── CARD RENDERING ──────────────────────────────────────── */
  function buildCards() {
    list.innerHTML = '';
    TIPS.forEach(tip => {
      const card = document.createElement('article');
      card.className = 'tip-card';
      card.setAttribute('data-id', tip.id);

      const runBtn = tip.demo
        ? '<button class="btn-run-tip">▶ Run</button>'
        : '';

      card.innerHTML = `
        <div class="editor-bar">
          <span class="editor-dot red"></span>
          <span class="editor-dot yellow"></span>
          <span class="editor-dot green"></span>
          <span class="editor-file">${tip.file}</span>
          <span class="editor-badges">
            <span class="tip-cat-tag">${CATEGORIES[tip.cat]}</span>
            <span class="level-badge ${tip.level}">${LEVELS[tip.level]}</span>
          </span>
        </div>
        <pre class="tip-code"><code>${highlight(tip.code)}</code></pre>
        <div class="tip-body">
          <div class="tip-title-row">
            <h3>${tip.title}</h3>
          </div>
          <p class="tip-why"><strong>Why pros use it:</strong> ${tip.why}</p>
          <div class="tip-actions">
            <button class="btn-copy-tip">Copy Snippet</button>
            ${runBtn}
          </div>
          <div class="tip-console" hidden></div>
        </div>
      `;

      card.querySelector('.btn-copy-tip').addEventListener('click', () => {
        copyToClipboard(tip.code, tip.title);
      });

      const rb = card.querySelector('.btn-run-tip');
      if (rb) {
        rb.addEventListener('click', async () => {
          if (rb.disabled) return;   // async demos can't double-fire
          rb.disabled = true;
          const out = card.querySelector('.tip-console');
          out.hidden = false;
          out.innerHTML = '<span class="console-label">Output — live from your browser</span>';
          try {
            const lines = await tip.demo();
            out.appendChild(document.createTextNode(lines.join('\n')));
          } catch (err) {
            out.appendChild(document.createTextNode('Error: ' + err.message));
          } finally {
            rb.disabled = false;
          }
        });
      }

      list.appendChild(card);
    });
  }

  /* ── SEARCH + FILTER ─────────────────────────────────────── */
  function tipMatches(tip, cat, level, q) {
    const matchesCat = cat === 'all' || tip.cat === cat;
    const matchesLevel = level === 'all' || tip.level === level;
    const haystack = (tip.title + ' ' + tip.file + ' ' + tip.code + ' ' + CATEGORIES[tip.cat]).toLowerCase();
    return matchesCat && matchesLevel && (!q || haystack.includes(q));
  }

  function countMatches(cat, level, q) {
    return TIPS.filter(t => tipMatches(t, cat, level, q)).length;
  }

  /* Grey out any chip that, combined with the OTHER active
     filters, would leave zero results — and keep its count live */
  function updateChipStates(q) {
    catChips.querySelectorAll('.chip').forEach(chip => {
      const key = chip.getAttribute('data-key');
      const count = countMatches(key, activeLevel, q);
      const countEl = chip.querySelector('.chip-count');
      if (countEl) countEl.textContent = count;
      const disable = count === 0 && key !== activeCat;
      chip.classList.toggle('disabled', disable);
      chip.setAttribute('aria-disabled', String(disable));
    });
    levelChips.querySelectorAll('.chip').forEach(chip => {
      const key = chip.getAttribute('data-key');
      const count = countMatches(activeCat, key, q);
      const countEl = chip.querySelector('.chip-count');
      if (countEl) countEl.textContent = count;
      const disable = count === 0 && key !== activeLevel;
      chip.classList.toggle('disabled', disable);
      chip.setAttribute('aria-disabled', String(disable));
    });
  }

  function applyFilters() {
    const q = searchInput.value.trim().toLowerCase();
    let visible = 0;

    list.querySelectorAll('.tip-card').forEach(card => {
      const tip = TIPS.find(t => t.id === card.getAttribute('data-id'));
      const show = tipMatches(tip, activeCat, activeLevel, q);
      card.classList.toggle('hidden', !show);
      if (show) visible++;
    });

    noResults.hidden = visible !== 0;
    updateChipStates(q);
  }

  let searchTimer;
  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(applyFilters, 120);
  });

  /* ── INIT ────────────────────────────────────────────────── */
  buildChips();
  buildCards();
  applyFilters();
  initStickyToolbar(document.querySelector('.tips-toolbar'));

});
