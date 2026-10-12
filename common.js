/* ═══════════════════════════════════════════════════════════
   FRONTENDHELPERS — SHARED RUNTIME (loaded on every page)
   Toast notifications, clipboard, scroll-to-top, cookie consent
   ═══════════════════════════════════════════════════════════ */

// Toast notification system (global — page scripts call this too)
function showToast(message) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  // Cap the stack — rapid copying shouldn't wallpaper the screen
  while (container.children.length >= 4) container.firstChild.remove();
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 2500);
}

// Sticky toolbar helper: toggles .is-stuck on a sticky element
// the moment it actually pins below the header, so it can stay
// fully transparent while resting in the page flow.
function initStickyToolbar(toolbar, headerOffset = 62) {
  if (!toolbar) return;

  if ('IntersectionObserver' in window) {
    const sentinel = document.createElement('div');
    sentinel.setAttribute('aria-hidden', 'true');
    sentinel.style.position = 'absolute';
    sentinel.style.height = '0';
    sentinel.style.width = '0';
    sentinel.style.pointerEvents = 'none';
    sentinel.style.overflow = 'hidden';
    toolbar.parentNode.insertBefore(sentinel, toolbar);
    new IntersectionObserver(([entry]) => {
      toolbar.classList.toggle('is-stuck', !entry.isIntersecting);
    }, { rootMargin: `-${headerOffset}px 0px 0px 0px` }).observe(sentinel);
  }

  // Anchor landing offset: measure the real pinned stack (header +
  // toolbar, which wraps to different heights per viewport) so every
  // jump target sits neatly just below it. Consumed by CSS as
  // scroll-margin-top: var(--anchor-offset).
  const header = document.querySelector('.header');
  function setAnchorOffset() {
    const toolbarSticky = getComputedStyle(toolbar).position === 'sticky';
    const offset = (header ? header.offsetHeight : 0)
      + (toolbarSticky ? toolbar.offsetHeight : 0) + 16;
    document.documentElement.style.setProperty('--anchor-offset', offset + 'px');
  }
  setAnchorOffset();
  // The toolbar's height changes when the web font swaps in
  // (fallback metrics wrap the chips differently) and when the
  // viewport resizes — track the element itself, not just resize
  if ('ResizeObserver' in window) {
    new ResizeObserver(setAnchorOffset).observe(toolbar);
  } else {
    window.addEventListener('resize', setAnchorOffset, { passive: true });
  }
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(setAnchorOffset);
  }
}

// Microsoft Clarity (session analytics) is only loaded once the visitor
// has accepted cookies — never before, unlike Consent Mode-aware gtag.
const FH_CLARITY_ID = 'xpli7xsyy2';
function loadClarity() {
  if (window.clarity) return;
  (function (c, l, a, r, i, t, y) {
    c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
    t = l.createElement(r); t.async = 1; t.src = 'https://www.clarity.ms/tag/' + i;
    y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
  })(window, document, 'clarity', 'script', FH_CLARITY_ID);
  window.clarity('consentv2', { analytics_storage: 'granted', ad_storage: 'granted' });
}

// Copy to clipboard with toast feedback
function copyToClipboard(text, label) {
  navigator.clipboard.writeText(text).then(() => {
    showToast(`✓ ${label || 'Code'} copied to clipboard`);
  }).catch(() => {
    showToast('⚠ Could not copy — try selecting manually');
  });
}

document.addEventListener('DOMContentLoaded', () => {

  // Bind static copy buttons via data-target attribute
  document.querySelectorAll('.btn-copy[data-target]').forEach(btn => {
    btn.addEventListener('click', () => {
      const el = document.getElementById(btn.getAttribute('data-target'));
      if (el) copyToClipboard(el.value !== undefined ? el.value : el.textContent, btn.textContent.replace('Copy ', ''));
    });
  });

  // Scroll to top
  const scrollBtn = document.getElementById('scroll-top');
  if (scrollBtn) {
    window.addEventListener('scroll', () => {
      const scrolled = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop;
      scrollBtn.classList.toggle('visible', scrolled > 100);
    }, { passive: true });
    scrollBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Cookie consent banner
  (function initCookieBanner() {
    function showBanner() {
      // Remove existing banner if re-opening
      const existing = document.querySelector('.cookie-banner-popup');
      if (existing) existing.remove();

      const banner = document.createElement('div');
      banner.className = 'cookie-banner-popup';
      banner.setAttribute('role', 'region');
      banner.setAttribute('aria-label', 'Cookie consent');
      banner.innerHTML = `
        <div class="cookie-popup-content">
          <p>We'd like to use cookies for analytics (Google Analytics, Microsoft Clarity) and advertising (Google AdSense). They stay off unless you accept. Read our <a href="/cookie-policy">Cookie Policy</a>.</p>
        </div>
        <div class="cookie-popup-actions">
          <button id="accept-cookies" class="btn-copy">Accept all</button>
          <button id="decline-cookies" class="btn-copy">Reject all</button>
        </div>
      `;
      document.body.appendChild(banner);
      setTimeout(() => banner.classList.add('visible'), 100);

      document.getElementById('accept-cookies').addEventListener('click', () => dismiss('accepted'));
      document.getElementById('decline-cookies').addEventListener('click', () => dismiss('declined'));

      function dismiss(val) {
        localStorage.setItem('cookie-consent', val);
        banner.classList.remove('visible');
        setTimeout(() => banner.remove(), 400);
        const status = val === 'accepted' ? 'granted' : 'denied';
        if (typeof gtag === 'function') {
          gtag('consent', 'update', {
            'analytics_storage': status,
            'ad_storage': status,
            'ad_user_data': status,
            'ad_personalization': status
          });
        }
        if (val === 'accepted') {
          loadClarity();
        } else if (typeof window.clarity === 'function') {
          // Withdrawn after previously accepting on this page
          window.clarity('consentv2', { analytics_storage: 'denied', ad_storage: 'denied' });
        }
      }
    }

    // Honour Global Privacy Control (a legally recognised opt-out
    // signal under CPRA and similar US state laws). If the browser
    // sends it and the visitor hasn't made an explicit choice yet,
    // auto-record a rejection of non-essential cookies and don't
    // prompt — analytics/ads stay denied (their default). The visitor
    // can still opt in later via "Cookie Settings".
    if (navigator.globalPrivacyControl === true && !localStorage.getItem('cookie-consent')) {
      localStorage.setItem('cookie-consent', 'declined');
    }

    if (localStorage.getItem('cookie-consent') === 'accepted') loadClarity();

    // Show on first visit (after a short delay)
    if (!localStorage.getItem('cookie-consent')) {
      setTimeout(showBanner, 1200);
    }

    // "Cookie Settings" footer link — lets users change their choice
    window.FH_reopenCookieBanner = showBanner;
    const settingsLink = document.querySelector('#cookie-settings-link');
    if (settingsLink) {
      settingsLink.addEventListener('click', (e) => {
        e.preventDefault();
        showBanner();
      });
    }
  })();

});
