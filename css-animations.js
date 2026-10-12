/* ═══════════════════════════════════════════════════════════
   CSS ANIMATIONS GALLERY
   Every preview is rendered from the same CSS string the user
   copies — previews can never drift from the shipped code.
   ═══════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  const CATEGORIES = {
    entrance:  'Entrances',
    attention: 'Attention',
    hover:     'Hover Effects',
    loader:    'Loaders',
    text:      'Text Effects',
    ambient:   'Ambient',
    form:      'Forms & Inputs',
    accordion: 'Accordions',
    image:     'Images & Carousels',
    menu:      'Menus & Dropdowns',
    feedback:  'UI Feedback'
  };

  /* ── THE LIBRARY ─────────────────────────────────────────── */
  const ANIMATIONS = [

    /* ═══ ENTRANCES ═══ */
    {
      id: 'fade-in', name: 'Fade In', cat: 'entrance', tags: ['fade', 'reveal', 'opacity'],
      html: '<div class="demo-box fh-fade-in">FH</div>',
      usage: '<div class="fh-fade-in">Your content</div>',
      note: 'The workhorse of UI motion. Animates opacity only — the cheapest property a browser can animate.',
      css: `.fh-fade-in {
  animation: fh-fadeIn 0.8s ease-out both;
}
@keyframes fh-fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}`
    },
    {
      id: 'fade-in-up', name: 'Fade In Up', cat: 'entrance', tags: ['fade', 'slide', 'reveal', 'scroll'],
      html: '<div class="demo-box fh-fade-in-up">FH</div>',
      usage: '<div class="fh-fade-in-up">Your content</div>',
      note: 'The most common scroll-reveal entrance. Pair it with an IntersectionObserver to trigger when the element scrolls into view.',
      css: `.fh-fade-in-up {
  animation: fh-fadeInUp 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;
}
@keyframes fh-fadeInUp {
  from { opacity: 0; transform: translateY(28px); }
  to   { opacity: 1; transform: translateY(0); }
}`
    },
    {
      id: 'fade-in-down', name: 'Fade In Down', cat: 'entrance', tags: ['fade', 'slide', 'dropdown'],
      html: '<div class="demo-box fh-fade-in-down">FH</div>',
      usage: '<div class="fh-fade-in-down">Your content</div>',
      note: 'Natural for dropdown menus, toasts and notification banners that enter from the top.',
      css: `.fh-fade-in-down {
  animation: fh-fadeInDown 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;
}
@keyframes fh-fadeInDown {
  from { opacity: 0; transform: translateY(-28px); }
  to   { opacity: 1; transform: translateY(0); }
}`
    },
    {
      id: 'fade-in-left', name: 'Fade In Left', cat: 'entrance', tags: ['fade', 'slide', 'sidebar'],
      html: '<div class="demo-box fh-fade-in-left">FH</div>',
      usage: '<div class="fh-fade-in-left">Your content</div>',
      note: 'Good for sidebars and staggered list items. Stagger with animation-delay: 0.05s per item.',
      css: `.fh-fade-in-left {
  animation: fh-fadeInLeft 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;
}
@keyframes fh-fadeInLeft {
  from { opacity: 0; transform: translateX(-32px); }
  to   { opacity: 1; transform: translateX(0); }
}`
    },
    {
      id: 'fade-in-right', name: 'Fade In Right', cat: 'entrance', tags: ['fade', 'slide', 'panel'],
      html: '<div class="demo-box fh-fade-in-right">FH</div>',
      usage: '<div class="fh-fade-in-right">Your content</div>',
      note: 'Mirror of Fade In Left — ideal for right-hand drawers and chat panels.',
      css: `.fh-fade-in-right {
  animation: fh-fadeInRight 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;
}
@keyframes fh-fadeInRight {
  from { opacity: 0; transform: translateX(32px); }
  to   { opacity: 1; transform: translateX(0); }
}`
    },
    {
      id: 'zoom-in', name: 'Zoom In', cat: 'entrance', tags: ['zoom', 'scale', 'modal'],
      html: '<div class="demo-box fh-zoom-in">FH</div>',
      usage: '<div class="fh-zoom-in">Your content</div>',
      note: 'A classic for modals and image lightboxes. Scale + opacity both run on the GPU compositor.',
      css: `.fh-zoom-in {
  animation: fh-zoomIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
}
@keyframes fh-zoomIn {
  from { opacity: 0; transform: scale(0.6); }
  to   { opacity: 1; transform: scale(1); }
}`
    },
    {
      id: 'bounce-in', name: 'Bounce In', cat: 'entrance', tags: ['bounce', 'scale', 'playful', 'badge'],
      html: '<div class="demo-box fh-bounce-in">FH</div>',
      usage: '<div class="fh-bounce-in">Your content</div>',
      note: 'The overshoot gives a playful, springy feel. Great for success states, badges and empty-state illustrations.',
      css: `.fh-bounce-in {
  animation: fh-bounceIn 0.75s cubic-bezier(0.68, -0.55, 0.265, 1.55) both;
}
@keyframes fh-bounceIn {
  0%   { opacity: 0; transform: scale(0.3); }
  50%  { opacity: 1; transform: scale(1.05); }
  70%  { transform: scale(0.92); }
  100% { opacity: 1; transform: scale(1); }
}`
    },
    {
      id: 'flip-in-x', name: 'Flip In X', cat: 'entrance', tags: ['flip', '3d', 'card'],
      html: '<div class="demo-box fh-flip-in-x">FH</div>',
      usage: '<div class="fh-flip-in-x">Your content</div>',
      note: 'A 3D flip around the horizontal axis. The perspective() value controls how dramatic the depth feels.',
      css: `.fh-flip-in-x {
  animation: fh-flipInX 0.8s ease-out both;
}
@keyframes fh-flipInX {
  0%   { opacity: 0; transform: perspective(600px) rotateX(90deg); }
  40%  { transform: perspective(600px) rotateX(-18deg); }
  70%  { transform: perspective(600px) rotateX(8deg); }
  100% { opacity: 1; transform: perspective(600px) rotateX(0); }
}`
    },
    {
      id: 'blur-in', name: 'Blur In', cat: 'entrance', tags: ['blur', 'focus', 'cinematic', 'hero'],
      html: '<div class="demo-box fh-blur-in">FH</div>',
      usage: '<div class="fh-blur-in">Your content</div>',
      note: 'A cinematic focus-pull. filter: blur() is heavier than transform, so reserve it for hero moments, not lists.',
      css: `.fh-blur-in {
  animation: fh-blurIn 0.9s ease-out both;
}
@keyframes fh-blurIn {
  from { opacity: 0; filter: blur(12px); }
  to   { opacity: 1; filter: blur(0); }
}`
    },
    {
      id: 'roll-in', name: 'Roll In', cat: 'entrance', tags: ['roll', 'rotate', 'playful'],
      html: '<div class="demo-box fh-roll-in">FH</div>',
      usage: '<div class="fh-roll-in">Your content</div>',
      note: 'High-energy entrance for playful brands. Use sparingly — one rolling element per view is plenty.',
      css: `.fh-roll-in {
  animation: fh-rollIn 0.8s cubic-bezier(0.22, 1, 0.36, 1) both;
}
@keyframes fh-rollIn {
  from { opacity: 0; transform: translateX(-60px) rotate(-120deg); }
  to   { opacity: 1; transform: translateX(0) rotate(0); }
}`
    },

    /* ═══ ATTENTION ═══ */
    {
      id: 'pulse', name: 'Pulse', cat: 'attention', loop: true, tags: ['pulse', 'notification', 'cta'],
      html: '<div class="demo-box fh-pulse">FH</div>',
      usage: '<button class="fh-pulse">Notifications</button>',
      note: 'A gentle, continuous pulse that draws the eye without shouting. Common on live indicators and primary CTAs.',
      css: `.fh-pulse {
  animation: fh-pulse 1.6s ease-in-out infinite;
}
@keyframes fh-pulse {
  0%, 100% { transform: scale(1); }
  50%      { transform: scale(1.07); }
}`
    },
    {
      id: 'heartbeat', name: 'Heartbeat', cat: 'attention', loop: true, tags: ['heart', 'like', 'pulse'],
      html: '<div class="demo-box fh-heartbeat">♥</div>',
      usage: '<span class="fh-heartbeat">♥</span>',
      note: 'A double-thump rhythm like a real heartbeat. The go-to for like buttons and favourite icons.',
      css: `.fh-heartbeat {
  animation: fh-heartbeat 1.4s ease-in-out infinite;
  transform-origin: center;
}
@keyframes fh-heartbeat {
  0%, 28%, 70%, 100% { transform: scale(1); }
  14% { transform: scale(1.15); }
  42% { transform: scale(1.15); }
}`
    },
    {
      id: 'shake', name: 'Shake', cat: 'attention', tags: ['shake', 'error', 'invalid', 'form'],
      html: '<div class="demo-box fh-shake">✕</div>',
      usage: '<input class="fh-shake" /> <!-- add class on invalid submit -->',
      note: 'The universal “no” gesture. Add this class via JavaScript when a form fails validation, then remove it on animationend.',
      css: `.fh-shake {
  animation: fh-shake 0.6s ease-in-out both;
}
@keyframes fh-shake {
  0%, 100%  { transform: translateX(0); }
  20%, 60%  { transform: translateX(-8px); }
  40%, 80%  { transform: translateX(8px); }
}`
    },
    {
      id: 'wobble', name: 'Wobble', cat: 'attention', tags: ['wobble', 'playful'],
      html: '<div class="demo-box fh-wobble">FH</div>',
      usage: '<div class="fh-wobble">Your content</div>',
      note: 'Looser and sillier than shake — suits onboarding hints and playful mascots.',
      css: `.fh-wobble {
  animation: fh-wobble 0.9s ease-in-out both;
}
@keyframes fh-wobble {
  0%, 100% { transform: translateX(0) rotate(0); }
  15% { transform: translateX(-14px) rotate(-6deg); }
  30% { transform: translateX(10px) rotate(4deg); }
  45% { transform: translateX(-8px) rotate(-3deg); }
  60% { transform: translateX(5px) rotate(2deg); }
  75% { transform: translateX(-2px) rotate(-1deg); }
}`
    },
    {
      id: 'tada', name: 'Tada', cat: 'attention', tags: ['celebrate', 'success', 'achievement'],
      html: '<div class="demo-box fh-tada">✦</div>',
      usage: '<div class="fh-tada">Achievement unlocked!</div>',
      note: 'A celebratory flourish for achievements, confirmations and gamified moments.',
      css: `.fh-tada {
  animation: fh-tada 0.9s ease-in-out both;
}
@keyframes fh-tada {
  0%   { transform: scale(1) rotate(0); }
  10%, 20% { transform: scale(0.92) rotate(-3deg); }
  30%, 50%, 70%, 90% { transform: scale(1.08) rotate(3deg); }
  40%, 60%, 80% { transform: scale(1.08) rotate(-3deg); }
  100% { transform: scale(1) rotate(0); }
}`
    },
    {
      id: 'jello', name: 'Jello', cat: 'attention', tags: ['jello', 'wobble', 'playful'],
      html: '<div class="demo-box fh-jello">FH</div>',
      usage: '<div class="fh-jello">Your content</div>',
      note: 'A skew-based jiggle that feels like gelatine. Fun on hover for playful, character-driven brands.',
      css: `.fh-jello {
  animation: fh-jello 0.9s both;
  transform-origin: center;
}
@keyframes fh-jello {
  0%, 100% { transform: skew(0, 0); }
  22% { transform: skew(-12deg, -12deg); }
  33% { transform: skew(9deg, 9deg); }
  44% { transform: skew(-6deg, -6deg); }
  55% { transform: skew(4deg, 4deg); }
  66% { transform: skew(-2deg, -2deg); }
  77% { transform: skew(1deg, 1deg); }
}`
    },
    {
      id: 'swing', name: 'Swing', cat: 'attention', tags: ['swing', 'hanging', 'sign'],
      html: '<div class="demo-box fh-swing">FH</div>',
      usage: '<div class="fh-swing">Your content</div>',
      note: 'Pivots from the top edge like a hanging sign. transform-origin does all the work here.',
      css: `.fh-swing {
  animation: fh-swing 1s ease-in-out both;
  transform-origin: top center;
}
@keyframes fh-swing {
  20%  { transform: rotate(14deg); }
  40%  { transform: rotate(-10deg); }
  60%  { transform: rotate(6deg); }
  80%  { transform: rotate(-4deg); }
  100% { transform: rotate(0); }
}`
    },
    {
      id: 'bounce', name: 'Bounce', cat: 'attention', tags: ['bounce', 'arrow', 'scroll'],
      html: '<div class="demo-box fh-bounce">↓</div>',
      usage: '<span class="fh-bounce">↓ Scroll</span>',
      note: 'The decaying rebound feels physical because each bounce is smaller than the last. Classic on scroll-down arrows.',
      css: `.fh-bounce {
  animation: fh-bounceY 1s cubic-bezier(0.28, 0.84, 0.42, 1) both;
}
@keyframes fh-bounceY {
  0%, 100% { transform: translateY(0); }
  25% { transform: translateY(-22px); }
  50% { transform: translateY(0); }
  70% { transform: translateY(-10px); }
  85% { transform: translateY(0); }
  95% { transform: translateY(-4px); }
}`
    },

    /* ═══ HOVER EFFECTS ═══ */
    {
      id: 'hover-lift', name: 'Lift', cat: 'hover', hover: true, tags: ['card', 'elevation', 'shadow'],
      html: '<div class="demo-btn fh-hover-lift">Hover me</div>',
      usage: '<div class="card fh-hover-lift">Card content</div>',
      note: 'The standard card hover in modern SaaS design: rise slightly, cast a deeper shadow. Transition both properties together.',
      css: `.fh-hover-lift {
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}
.fh-hover-lift:hover {
  transform: translateY(-6px);
  box-shadow: 0 14px 28px -10px rgba(0, 0, 0, 0.45);
}`
    },
    {
      id: 'hover-grow', name: 'Grow', cat: 'hover', hover: true, tags: ['scale', 'button', 'thumbnail'],
      html: '<div class="demo-btn fh-hover-grow">Hover me</div>',
      usage: '<button class="fh-hover-grow">Click me</button>',
      note: 'The springy cubic-bezier overshoots slightly, which reads as eager rather than mechanical.',
      css: `.fh-hover-grow {
  transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.fh-hover-grow:hover {
  transform: scale(1.08);
}`
    },
    {
      id: 'hover-glow', name: 'Glow', cat: 'hover', hover: true, tags: ['glow', 'neon', 'cta'],
      html: '<div class="demo-btn fh-hover-glow">Hover me</div>',
      usage: '<button class="fh-hover-glow">Get started</button>',
      note: 'A soft neon halo for dark UIs. Match the glow colour to your brand accent.',
      css: `.fh-hover-glow {
  transition: box-shadow 0.3s ease, border-color 0.3s ease;
}
.fh-hover-glow:hover {
  box-shadow: 0 0 24px rgba(139, 92, 246, 0.65);
  border-color: rgba(139, 92, 246, 0.8);
}`
    },
    {
      id: 'hover-shine', name: 'Shine Sweep', cat: 'hover', hover: true, tags: ['shine', 'sheen', 'premium', 'button'],
      html: '<div class="demo-btn fh-hover-shine">Hover me</div>',
      usage: '<button class="fh-hover-shine">Buy now</button>',
      note: 'A light streak sweeps across the element, like light catching glass. The parent needs overflow: hidden.',
      css: `.fh-hover-shine {
  position: relative;
  overflow: hidden;
}
.fh-hover-shine::after {
  content: '';
  position: absolute;
  top: 0; left: -80%;
  width: 50%; height: 100%;
  background: linear-gradient(105deg,
    transparent, rgba(255, 255, 255, 0.35), transparent);
  transform: skewX(-20deg);
  transition: left 0.55s ease;
}
.fh-hover-shine:hover::after {
  left: 130%;
}`
    },
    {
      id: 'hover-border', name: 'Border Draw', cat: 'hover', hover: true, tags: ['border', 'outline', 'frame'],
      html: '<div class="demo-btn fh-hover-border">Hover me</div>',
      usage: '<button class="fh-hover-border">Learn more</button>',
      note: 'An accent border snaps into place from slightly outside the element. border-radius: inherit keeps it matching any shape.',
      css: `.fh-hover-border {
  position: relative;
}
.fh-hover-border::before {
  content: '';
  position: absolute;
  inset: 0;
  border: 2px solid #06b6d4;
  border-radius: inherit;
  opacity: 0;
  transform: scale(1.15);
  transition: transform 0.3s ease, opacity 0.3s ease;
  pointer-events: none;
}
.fh-hover-border:hover::before {
  opacity: 1;
  transform: scale(1);
}`
    },
    {
      id: 'hover-underline', name: 'Underline Slide', cat: 'hover', hover: true, tags: ['link', 'underline', 'nav'],
      html: '<span class="demo-text fh-hover-underline" style="font-size:1rem;">Hover this link</span>',
      usage: '<a href="#" class="fh-hover-underline">About us</a>',
      note: 'The underline grows from the left instead of just appearing — the detail that separates polished nav links from defaults.',
      css: `.fh-hover-underline {
  position: relative;
  text-decoration: none;
}
.fh-hover-underline::after {
  content: '';
  position: absolute;
  left: 0; bottom: -4px;
  width: 100%; height: 2px;
  background: currentColor;
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}
.fh-hover-underline:hover::after {
  transform: scaleX(1);
}`
    },
    {
      id: 'hover-tilt', name: '3D Tilt', cat: 'hover', hover: true, tags: ['3d', 'perspective', 'card'],
      html: '<div class="demo-btn fh-hover-tilt">Hover me</div>',
      usage: '<div class="card fh-hover-tilt">Card content</div>',
      note: 'A fixed-angle 3D tilt with zero JavaScript. For cursor-tracking tilt you need JS — but this covers 80% of the effect.',
      css: `.fh-hover-tilt {
  transition: transform 0.3s ease;
}
.fh-hover-tilt:hover {
  transform: perspective(600px) rotateX(8deg) rotateY(-10deg) scale(1.03);
}`
    },
    {
      id: 'hover-gradient', name: 'Gradient Shift', cat: 'hover', hover: true, tags: ['gradient', 'button', 'cta'],
      html: '<div class="demo-btn fh-hover-gradient" style="border:none;">Hover me</div>',
      usage: '<button class="fh-hover-gradient">Get started</button>',
      note: 'The gradient slides rather than swaps — animating background-position is smooth, while animating background colours directly is not.',
      css: `.fh-hover-gradient {
  background: linear-gradient(120deg, #8b5cf6, #06b6d4, #10b981);
  background-size: 220% 100%;
  background-position: 0% 50%;
  transition: background-position 0.5s ease;
  color: #fff;
}
.fh-hover-gradient:hover {
  background-position: 100% 50%;
}`
    },

    /* ═══ LOADERS ═══ */
    {
      id: 'spinner-ring', name: 'Ring Spinner', cat: 'loader', loop: true, tags: ['spinner', 'loading', 'ring'],
      html: '<div class="fh-spinner"></div>',
      usage: '<div class="fh-spinner" role="status" aria-label="Loading"></div>',
      note: 'The classic. One element, four lines of keyframes. Add role="status" and an aria-label so screen readers announce it.',
      css: `.fh-spinner {
  width: 44px;
  height: 44px;
  border: 4px solid rgba(139, 92, 246, 0.2);
  border-top-color: #8b5cf6;
  border-radius: 50%;
  animation: fh-spin 0.8s linear infinite;
}
@keyframes fh-spin {
  to { transform: rotate(360deg); }
}`
    },
    {
      id: 'dual-ring', name: 'Dual Ring', cat: 'loader', loop: true, tags: ['spinner', 'loading', 'ring'],
      html: '<div class="fh-dual-ring"></div>',
      usage: '<div class="fh-dual-ring" role="status" aria-label="Loading"></div>',
      note: 'Two opposing arcs spinning together. Colour the top and bottom borders with your two brand colours.',
      css: `.fh-dual-ring {
  width: 44px;
  height: 44px;
  border: 4px solid transparent;
  border-top-color: #8b5cf6;
  border-bottom-color: #06b6d4;
  border-radius: 50%;
  animation: fh-spinDual 1s linear infinite;
}
@keyframes fh-spinDual {
  to { transform: rotate(360deg); }
}`
    },
    {
      id: 'dots-bounce', name: 'Bouncing Dots', cat: 'loader', loop: true, tags: ['dots', 'typing', 'chat', 'loading'],
      html: '<div class="fh-dots-bounce"><span></span><span></span><span></span></div>',
      usage: '<div class="fh-dots-bounce" role="status" aria-label="Loading">\n  <span></span><span></span><span></span>\n</div>',
      note: 'The “someone is typing” pattern. The staggered animation-delay on each dot creates the wave.',
      css: `.fh-dots-bounce {
  display: flex;
  gap: 8px;
  align-items: flex-end;
}
.fh-dots-bounce span {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #06b6d4;
  animation: fh-dotBounce 0.6s ease-in-out infinite alternate;
}
.fh-dots-bounce span:nth-child(2) { animation-delay: 0.15s; }
.fh-dots-bounce span:nth-child(3) { animation-delay: 0.3s; }
@keyframes fh-dotBounce {
  from { transform: translateY(0);     opacity: 0.6; }
  to   { transform: translateY(-14px); opacity: 1; }
}`
    },
    {
      id: 'dots-pulse', name: 'Pulsing Dots', cat: 'loader', loop: true, tags: ['dots', 'loading', 'subtle'],
      html: '<div class="fh-dots-pulse"><span></span><span></span><span></span></div>',
      usage: '<div class="fh-dots-pulse" role="status" aria-label="Loading">\n  <span></span><span></span><span></span>\n</div>',
      note: 'Calmer than bouncing dots — good inside buttons while a form submits.',
      css: `.fh-dots-pulse {
  display: flex;
  gap: 8px;
}
.fh-dots-pulse span {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #8b5cf6;
  animation: fh-dotPulse 1s ease-in-out infinite;
}
.fh-dots-pulse span:nth-child(2) { animation-delay: 0.2s; }
.fh-dots-pulse span:nth-child(3) { animation-delay: 0.4s; }
@keyframes fh-dotPulse {
  0%, 100% { transform: scale(0.6); opacity: 0.4; }
  50%      { transform: scale(1);   opacity: 1; }
}`
    },
    {
      id: 'bar-loader', name: 'Indeterminate Bar', cat: 'loader', loop: true, tags: ['bar', 'progress', 'loading'],
      html: '<div class="fh-bar-loader"></div>',
      usage: '<div class="fh-bar-loader" role="progressbar" aria-label="Loading"></div>',
      note: 'For when you can’t know the progress percentage. A gradient segment sweeps the track endlessly.',
      css: `.fh-bar-loader {
  width: 160px;
  height: 6px;
  border-radius: 3px;
  background: rgba(139, 92, 246, 0.15);
  overflow: hidden;
  position: relative;
}
.fh-bar-loader::before {
  content: '';
  position: absolute;
  top: 0; left: 0;
  height: 100%;
  width: 40%;
  border-radius: 3px;
  background: linear-gradient(90deg, #8b5cf6, #06b6d4);
  animation: fh-barSlide 1.2s ease-in-out infinite;
}
@keyframes fh-barSlide {
  0%   { left: -40%; }
  100% { left: 100%; }
}`
    },
    {
      id: 'skeleton', name: 'Skeleton Shimmer', cat: 'loader', loop: true, tags: ['skeleton', 'placeholder', 'shimmer', 'loading'],
      html: '<div class="stage-col"><div class="fh-skeleton"></div><div class="fh-skeleton" style="width:120px;"></div><div class="fh-skeleton" style="width:70px;"></div></div>',
      usage: '<div class="fh-skeleton" style="width: 180px;"></div>\n<div class="fh-skeleton" style="width: 120px;"></div>',
      note: 'Skeleton screens make loads feel faster than spinners because they preview the page structure. Size each bar like the content it replaces.',
      css: `.fh-skeleton {
  width: 180px;
  height: 16px;
  border-radius: 6px;
  background: linear-gradient(90deg,
    rgba(148, 163, 184, 0.12) 25%,
    rgba(148, 163, 184, 0.28) 50%,
    rgba(148, 163, 184, 0.12) 75%);
  background-size: 200% 100%;
  animation: fh-shimmer 1.4s linear infinite;
}
@keyframes fh-shimmer {
  from { background-position: 200% 0; }
  to   { background-position: -200% 0; }
}`
    },
    {
      id: 'ripple-loader', name: 'Ripple', cat: 'loader', loop: true, tags: ['ripple', 'radar', 'loading'],
      html: '<div class="fh-ripple"></div>',
      usage: '<div class="fh-ripple" role="status" aria-label="Loading"></div>',
      note: 'Two expanding rings offset by half the duration. Feels organic, like drops hitting water.',
      css: `.fh-ripple {
  position: relative;
  width: 56px;
  height: 56px;
}
.fh-ripple::before,
.fh-ripple::after {
  content: '';
  position: absolute;
  inset: 0;
  border: 3px solid #06b6d4;
  border-radius: 50%;
  animation: fh-rippleWave 1.6s cubic-bezier(0, 0.2, 0.8, 1) infinite;
}
.fh-ripple::after {
  animation-delay: 0.8s;
}
@keyframes fh-rippleWave {
  from { transform: scale(0.1); opacity: 1; }
  to   { transform: scale(1);   opacity: 0; }
}`
    },
    {
      id: 'orbit-loader', name: 'Orbit', cat: 'loader', loop: true, tags: ['orbit', 'planet', 'loading'],
      html: '<div class="fh-orbit"></div>',
      usage: '<div class="fh-orbit" role="status" aria-label="Loading"></div>',
      note: 'A satellite circling a dashed orbit. The dot is a pseudo-element, so it is still just one div.',
      css: `.fh-orbit {
  position: relative;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  border: 2px dashed rgba(139, 92, 246, 0.35);
  animation: fh-spinOrbit 2.4s linear infinite;
}
.fh-orbit::before {
  content: '';
  position: absolute;
  top: -7px;
  left: 50%;
  width: 12px;
  height: 12px;
  margin-left: -6px;
  border-radius: 50%;
  background: #06b6d4;
}
@keyframes fh-spinOrbit {
  to { transform: rotate(360deg); }
}`
    },

    /* ═══ TEXT EFFECTS ═══ */
    {
      id: 'typewriter', name: 'Typewriter', cat: 'text', tags: ['typing', 'terminal', 'hero'],
      html: '<span class="demo-text fh-typewriter">Hello, world.</span>',
      usage: '<span class="fh-typewriter">Hello, world.</span>',
      note: 'steps(13) matches the 13 characters of “Hello, world.” — change both the ch width and step count to match your own text.',
      css: `.fh-typewriter {
  display: inline-block;
  overflow: hidden;
  white-space: nowrap;
  font-family: monospace;
  border-right: 2px solid currentColor;
  width: 13ch;
  animation:
    fh-typing 2.2s steps(13) both,
    fh-caret 0.7s step-end infinite;
}
@keyframes fh-typing {
  from { width: 0; }
  to   { width: 13ch; }
}
@keyframes fh-caret {
  50% { border-color: transparent; }
}`
    },
    {
      id: 'text-gradient', name: 'Gradient Flow', cat: 'text', loop: true, tags: ['gradient', 'headline', 'hero'],
      html: '<span class="demo-text fh-text-gradient">Gradient</span>',
      usage: '<h1 class="fh-text-gradient">Your headline</h1>',
      note: 'A gradient endlessly flowing through the letters. background-clip: text does the masking; the 300% size gives it room to travel.',
      css: `.fh-text-gradient {
  background: linear-gradient(90deg,
    #8b5cf6, #06b6d4, #10b981, #8b5cf6);
  background-size: 300% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
  animation: fh-gradientFlow 4s linear infinite;
}
@keyframes fh-gradientFlow {
  to { background-position: 300% 0; }
}`
    },
    {
      id: 'text-wave', name: 'Letter Wave', cat: 'text', loop: true, tags: ['wave', 'letters', 'playful'],
      html: '<span class="demo-text fh-text-wave"><span>W</span><span>A</span><span>V</span><span>E</span><span>S</span><span>!</span></span>',
      usage: '<span class="fh-text-wave">\n  <span>W</span><span>A</span><span>V</span><span>E</span>\n</span>',
      note: 'Each letter sits in its own span with a staggered delay. Add more nth-child rules for longer words.',
      css: `.fh-text-wave span {
  display: inline-block;
  animation: fh-wave 1.4s ease-in-out infinite;
}
.fh-text-wave span:nth-child(2) { animation-delay: 0.1s; }
.fh-text-wave span:nth-child(3) { animation-delay: 0.2s; }
.fh-text-wave span:nth-child(4) { animation-delay: 0.3s; }
.fh-text-wave span:nth-child(5) { animation-delay: 0.4s; }
.fh-text-wave span:nth-child(6) { animation-delay: 0.5s; }
@keyframes fh-wave {
  0%, 40%, 100% { transform: translateY(0); }
  20%           { transform: translateY(-10px); }
}`
    },
    {
      id: 'text-glitch', name: 'Glitch', cat: 'text', loop: true, tags: ['glitch', 'cyberpunk', 'distortion'],
      html: '<span class="demo-text fh-glitch" data-text="GLITCH">GLITCH</span>',
      usage: '<span class="fh-glitch" data-text="GLITCH">GLITCH</span>',
      note: 'The element needs a data-text attribute matching its content — the pseudo-elements clone it into the offset colour layers.',
      css: `.fh-glitch {
  position: relative;
  animation: fh-glitchSkew 2.5s infinite;
}
.fh-glitch::before,
.fh-glitch::after {
  content: attr(data-text);
  position: absolute;
  top: 0; left: 0;
  width: 100%;
}
.fh-glitch::before {
  color: #06b6d4;
  clip-path: inset(0 0 55% 0);
  animation: fh-glitchTop 2.5s infinite;
}
.fh-glitch::after {
  color: #ef4444;
  clip-path: inset(45% 0 0 0);
  animation: fh-glitchBottom 2.5s infinite;
}
@keyframes fh-glitchSkew {
  0%, 90%, 100% { transform: skewX(0); }
  92% { transform: skewX(4deg); }
  94% { transform: skewX(-4deg); }
  96% { transform: skewX(2deg); }
}
@keyframes fh-glitchTop {
  0%, 88%, 100% { transform: translate(0); }
  90% { transform: translate(-4px, -2px); }
  94% { transform: translate(4px, 1px); }
}
@keyframes fh-glitchBottom {
  0%, 88%, 100% { transform: translate(0); }
  90% { transform: translate(4px, 2px); }
  94% { transform: translate(-4px, -1px); }
}`
    },
    {
      id: 'neon-flicker', name: 'Neon Flicker', cat: 'text', loop: true, tags: ['neon', 'glow', 'sign'],
      html: '<span class="demo-text fh-neon">NEON</span>',
      usage: '<span class="fh-neon">OPEN</span>',
      note: 'Stacked text-shadows build the glow; the flicker comes from brief opacity dips at irregular intervals, like a failing tube.',
      css: `.fh-neon {
  color: #f8fafc;
  text-shadow:
    0 0 6px #06b6d4,
    0 0 12px #06b6d4,
    0 0 24px #06b6d4,
    0 0 48px #0891b2;
  animation: fh-neonFlicker 2.4s linear infinite;
}
@keyframes fh-neonFlicker {
  0%, 18%, 22%, 26%, 100% { opacity: 1; }
  20%, 24% { opacity: 0.45; }
  60%      { opacity: 0.92; }
}`
    },
    {
      id: 'tracking-in', name: 'Tracking In', cat: 'text', tags: ['letter-spacing', 'cinematic', 'title'],
      html: '<span class="demo-text fh-tracking-in">FOCUS</span>',
      usage: '<h1 class="fh-tracking-in">Your title</h1>',
      note: 'Letters contract from wide spacing into place — a favourite for cinematic hero titles.',
      css: `.fh-tracking-in {
  animation: fh-trackingIn 0.9s cubic-bezier(0.215, 0.61, 0.355, 1) both;
}
@keyframes fh-trackingIn {
  from { letter-spacing: 0.6em; opacity: 0; }
  to   { letter-spacing: normal; opacity: 1; }
}`
    },
    {
      id: 'text-focus', name: 'Focus In', cat: 'text', tags: ['blur', 'focus', 'reveal'],
      html: '<span class="demo-text fh-text-focus">Sharp</span>',
      usage: '<h2 class="fh-text-focus">Your heading</h2>',
      note: 'Text sharpens from a blur, like a camera pulling focus. Heavier than transform-based effects — use it on headings, not paragraphs.',
      css: `.fh-text-focus {
  animation: fh-textFocus 1s cubic-bezier(0.55, 0.085, 0.68, 0.53) both;
}
@keyframes fh-textFocus {
  from { filter: blur(10px); opacity: 0; }
  to   { filter: blur(0);    opacity: 1; }
}`
    },

    /* ═══ AMBIENT ═══ */
    {
      id: 'float', name: 'Float', cat: 'ambient', loop: true, tags: ['float', 'hover', 'illustration'],
      html: '<div class="demo-box fh-float">FH</div>',
      usage: '<img class="fh-float" src="illustration.svg" alt="" />',
      note: 'A slow, weightless bob for hero illustrations and decorative elements. Vary duration per element so groups don’t sync up.',
      css: `.fh-float {
  animation: fh-floatY 3.2s ease-in-out infinite;
}
@keyframes fh-floatY {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-12px); }
}`
    },
    {
      id: 'gradient-pan', name: 'Gradient Pan', cat: 'ambient', loop: true, tags: ['gradient', 'background', 'hero'],
      html: '<div class="fh-gradient-pan" style="width:150px;height:80px;border-radius:14px;"></div>',
      usage: '<section class="hero fh-gradient-pan">…</section>',
      note: 'A living background for hero sections. Animating background-position over an oversized gradient is far cheaper than animating the colours themselves.',
      css: `.fh-gradient-pan {
  background: linear-gradient(135deg,
    #8b5cf6, #06b6d4, #10b981, #8b5cf6);
  background-size: 300% 300%;
  animation: fh-gradientPan 6s ease-in-out infinite;
}
@keyframes fh-gradientPan {
  0%, 100% { background-position: 0% 50%; }
  50%      { background-position: 100% 50%; }
}`
    },
    {
      id: 'aurora', name: 'Aurora Blob', cat: 'ambient', loop: true, tags: ['blob', 'morph', 'organic'],
      html: '<div class="fh-aurora"></div>',
      usage: '<div class="fh-aurora"></div>',
      note: 'Morphing the two-value border-radius syntax creates organic, lava-lamp shapes. Add filter: blur(40px) for a soft background glow.',
      css: `.fh-aurora {
  width: 90px;
  height: 90px;
  background: linear-gradient(135deg, #8b5cf6, #06b6d4);
  animation: fh-auroraMorph 7s ease-in-out infinite;
}
@keyframes fh-auroraMorph {
  0%, 100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
  25%      { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }
  50%      { border-radius: 50% 60% 30% 60% / 30% 60% 70% 40%; }
  75%      { border-radius: 60% 40% 60% 30% / 70% 30% 50% 60%; }
}`
    },
    {
      id: 'pulse-ring', name: 'Pulse Ring', cat: 'ambient', loop: true, tags: ['ping', 'radar', 'live', 'avatar'],
      html: '<div class="fh-pulse-ring"></div>',
      usage: '<div class="avatar fh-pulse-ring"></div>',
      note: 'A radar ping radiating outward — the standard “live” indicator. The z-index: 0 on the parent keeps the ring behind the content but above the page.',
      css: `.fh-pulse-ring {
  position: relative;
  z-index: 0;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #8b5cf6, #06b6d4);
}
.fh-pulse-ring::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: inherit;
  z-index: -1;
  animation: fh-ping 1.6s cubic-bezier(0, 0, 0.2, 1) infinite;
}
@keyframes fh-ping {
  from { transform: scale(1);   opacity: 0.7; }
  to   { transform: scale(1.9); opacity: 0; }
}`
    },
    {
      id: 'spin-slow', name: 'Slow Spin', cat: 'ambient', loop: true, tags: ['rotate', 'decoration', 'badge'],
      html: '<div class="demo-box fh-spin-slow">✦</div>',
      usage: '<img class="fh-spin-slow" src="badge.svg" alt="" />',
      note: 'A patient rotation for decorative badges, seals and background shapes. Linear easing keeps it hypnotic rather than mechanical.',
      css: `.fh-spin-slow {
  animation: fh-spinSlow 6s linear infinite;
}
@keyframes fh-spinSlow {
  to { transform: rotate(360deg); }
}`
    },

    /* ═══ FORMS & INPUTS ═══ */
    {
      id: 'input-glow', name: 'Focus Glow', cat: 'form', hover: true, hintText: 'click the field',
      tags: ['input', 'focus', 'form', 'glow'],
      html: '<input type="text" class="fh-input-glow" placeholder="Click me…" style="width:80%;" />',
      usage: '<input type="text" class="fh-input-glow" placeholder="Your email" />',
      note: 'The soft ring makes focus unmistakable without an harsh outline. Never remove focus styling — replace it with something better, like this.',
      css: `.fh-input-glow {
  border: 1px solid #3a4358;
  border-radius: 10px;
  padding: 12px 16px;
  background: transparent;
  color: inherit;
  outline: none;
  transition: border-color 0.25s ease, box-shadow 0.25s ease;
}
.fh-input-glow:focus {
  border-color: #06b6d4;
  box-shadow: 0 0 0 4px rgba(6, 182, 212, 0.15);
}`
    },
    {
      id: 'float-label', name: 'Floating Label', cat: 'form', hover: true, hintText: 'click, then type',
      tags: ['label', 'input', 'form', 'material'],
      html: '<div class="fh-float-field" style="width:80%;"><input type="text" placeholder=" " /><label>Email address</label></div>',
      usage: '<div class="fh-float-field">\n  <input type="text" placeholder=" " />\n  <label>Email address</label>\n</div>',
      note: 'The placeholder=" " (one space) is the trick — :placeholder-shown can then detect whether the field is empty, no JavaScript needed.',
      css: `.fh-float-field {
  position: relative;
}
.fh-float-field input {
  width: 100%;
  border: 1px solid #3a4358;
  border-radius: 10px;
  padding: 18px 14px 6px;
  background: transparent;
  color: inherit;
  outline: none;
}
.fh-float-field input:focus { border-color: #06b6d4; }
.fh-float-field label {
  position: absolute;
  left: 14px;
  top: 50%;
  translate: 0 -50%;
  color: #94a3b8;
  pointer-events: none;
  text-transform: none;
  transition: all 0.2s ease;
}
.fh-float-field input:focus + label,
.fh-float-field input:not(:placeholder-shown) + label {
  top: 10px;
  translate: 0 0;
  font-size: 0.68em;
  color: #06b6d4;
}`
    },
    {
      id: 'toggle-switch', name: 'Toggle Switch', cat: 'form', hover: true, hintText: 'click to flip',
      tags: ['toggle', 'switch', 'checkbox', 'settings'],
      html: '<input type="checkbox" class="fh-toggle" checked aria-label="Demo toggle" />',
      usage: '<input type="checkbox" class="fh-toggle" />',
      note: 'A real checkbox restyled — so keyboard, forms and screen readers all keep working. The springy easing sells the flip.',
      css: `.fh-toggle {
  appearance: none;
  width: 52px;
  height: 28px;
  padding: 0;
  border: none;
  border-radius: 14px;
  background: #3a4358;
  position: relative;
  cursor: pointer;
  transition: background 0.25s ease;
}
.fh-toggle::before {
  content: '';
  position: absolute;
  top: 3px;
  left: 3px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #fff;
  transition: left 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.fh-toggle:checked { background: #06b6d4; }
.fh-toggle:checked::before { left: 27px; }`
    },
    {
      id: 'checkbox-pop', name: 'Checkbox Pop', cat: 'form', hover: true, hintText: 'click the box',
      tags: ['checkbox', 'check', 'form', 'tick'],
      html: '<input type="checkbox" class="fh-check" checked aria-label="Demo checkbox" />',
      usage: '<input type="checkbox" class="fh-check" />',
      note: 'The tick scales in with an overshoot — the same pattern used by the checklists on this site\'s Dev Essentials page.',
      css: `.fh-check {
  appearance: none;
  width: 26px;
  height: 26px;
  padding: 0;
  border: 2px solid #3a4358;
  border-radius: 8px;
  cursor: pointer;
  display: grid;
  place-content: center;
  transition: background 0.2s ease, border-color 0.2s ease;
}
.fh-check::before {
  content: '';
  width: 12px;
  height: 12px;
  clip-path: polygon(14% 44%, 0 65%, 50% 100%, 100% 16%, 80% 0%, 43% 62%);
  background: #04110b;
  transform: scale(0);
  transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.fh-check:checked { background: #10b981; border-color: #10b981; }
.fh-check:checked::before { transform: scale(1); }`
    },
    {
      id: 'btn-press', name: 'Button Press', cat: 'form', hover: true, hintText: 'press and hold',
      tags: ['button', 'press', 'active', 'tactile'],
      html: '<button class="fh-btn-press">Press me</button>',
      usage: '<button class="fh-btn-press">Save changes</button>',
      note: 'The :active state compresses the button and flattens its shadow — a 120ms cue that the click registered. Tactile feedback, zero JavaScript.',
      css: `.fh-btn-press {
  padding: 12px 26px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 10px;
  background: linear-gradient(135deg, #8b5cf6, #06b6d4);
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 6px 16px -6px rgba(139, 92, 246, 0.5);
  transition: transform 0.12s ease, box-shadow 0.12s ease;
}
.fh-btn-press:hover { transform: translateY(-1px); }
.fh-btn-press:active {
  transform: translateY(1px) scale(0.97);
  box-shadow: 0 2px 6px -2px rgba(139, 92, 246, 0.4);
}`
    },
    {
      id: 'field-error', name: 'Validation Shake', cat: 'form',
      tags: ['error', 'invalid', 'form', 'validation'],
      html: '<input type="text" class="fh-field-error" value="not-an-email" style="width:80%;border-radius:10px;padding:12px 16px;background:transparent;color:inherit;" />',
      usage: '<input class="fh-field-error" /> <!-- add the class on failed validation -->',
      note: 'Add the class from JavaScript when validation fails, and remove it on the animationend event so it can shake again next time.',
      css: `.fh-field-error {
  border: 1px solid #ef4444;
  box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.12);
  animation: fh-fieldShake 0.4s ease-in-out;
}
@keyframes fh-fieldShake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-6px); }
  50% { transform: translateX(6px); }
  75% { transform: translateX(-3px); }
}`
    },

    /* ═══ ACCORDIONS ═══ */
    {
      id: 'accordion-smooth', name: 'Smooth Accordion', cat: 'accordion', hover: true, hintText: 'click the header',
      tags: ['accordion', 'collapse', 'expand', 'faq'],
      html: '<div class="fh-accordion" style="width:88%;"><input type="checkbox" id="fh-acc-demo" checked /><label class="fh-acc-head" for="fh-acc-demo">What is this?</label><div class="fh-acc-body"><div><p>A pure-CSS accordion with a real height animation.</p></div></div></div>',
      usage: '<div class="fh-accordion">\n  <input type="checkbox" id="q1" />\n  <label class="fh-acc-head" for="q1">Question?</label>\n  <div class="fh-acc-body"><div>\n    <p>Answer content…</p>\n  </div></div>\n</div>',
      note: 'Height auto can\'t be transitioned — but grid-template-rows 0fr → 1fr can. That\'s the modern trick for smooth accordions with no fixed max-height guesswork.',
      css: `.fh-accordion {
  border: 1px solid #3a4358;
  border-radius: 10px;
  overflow: hidden;
}
.fh-accordion input { display: none; }
.fh-acc-head {
  display: block;
  padding: 12px 16px;
  font-weight: 600;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.04);
}
.fh-acc-body {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.35s cubic-bezier(0.22, 1, 0.36, 1);
}
.fh-acc-body > div { overflow: hidden; }
.fh-acc-body p { padding: 12px 16px; margin: 0; opacity: 0.75; }
.fh-accordion input:checked ~ .fh-acc-body {
  grid-template-rows: 1fr;
}`
    },
    {
      id: 'chevron-rotate', name: 'Chevron Rotate', cat: 'accordion', hover: true, hintText: 'click to open',
      tags: ['chevron', 'details', 'arrow', 'faq'],
      html: '<details class="fh-details" style="width:88%;"><summary>Click to expand <span class="fh-acc-chevron">▾</span></summary><p>The arrow turned smoothly — not just flipped.</p></details>',
      usage: '<details class="fh-details">\n  <summary>Question? <span class="fh-acc-chevron">▾</span></summary>\n  <p>Answer…</p>\n</details>',
      note: 'Native <details> gives you the open/close behaviour and accessibility for free — the [open] attribute selector drives the rotation.',
      css: `.fh-details {
  border: 1px solid #3a4358;
  border-radius: 10px;
  padding: 0 16px;
}
.fh-details summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  padding: 12px 0;
  cursor: pointer;
  font-weight: 600;
  list-style: none;
}
.fh-details summary::-webkit-details-marker { display: none; }
.fh-details p { padding: 0 0 12px; margin: 0; opacity: 0.75; }
.fh-acc-chevron {
  display: inline-block;
  transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}
.fh-details[open] .fh-acc-chevron { transform: rotate(180deg); }`
    },
    {
      id: 'acc-content-fade', name: 'Content Fade-In', cat: 'accordion', hover: true, hintText: 'click to open',
      tags: ['accordion', 'fade', 'details', 'reveal'],
      html: '<details class="fh-details fh-acc-reveal" style="width:88%;"><summary>Open me</summary><p>This content faded and slid into place.</p></details>',
      usage: '<details class="fh-details fh-acc-reveal">\n  <summary>Question?</summary>\n  <p>Answer…</p>\n</details>',
      note: 'Layer this on any accordion: the panel content animates in each time it opens, making the reveal feel deliberate instead of abrupt.',
      css: `.fh-details {
  border: 1px solid #3a4358;
  border-radius: 10px;
  padding: 0 16px;
}
.fh-details summary {
  padding: 12px 0;
  cursor: pointer;
  font-weight: 600;
  list-style: none;
}
.fh-details summary::-webkit-details-marker { display: none; }
.fh-details p { padding: 0 0 12px; margin: 0; opacity: 0.75; }
.fh-acc-reveal[open] p {
  animation: fh-accFade 0.35s ease both;
}
@keyframes fh-accFade {
  from { opacity: 0; transform: translateY(-6px); }
  to { opacity: 0.75; transform: translateY(0); }
}`
    },
    {
      id: 'plus-minus', name: 'Plus / Minus Morph', cat: 'accordion', hover: true, hintText: 'click to open',
      tags: ['plus', 'minus', 'icon', 'morph', 'faq'],
      html: '<details class="fh-details" style="width:88%;"><summary>Watch the icon <span class="fh-plusminus"></span></summary><p>The plus rotated into a minus.</p></details>',
      usage: '<details class="fh-details">\n  <summary>Question? <span class="fh-plusminus"></span></summary>\n  <p>Answer…</p>\n</details>',
      note: 'Two bars drawn with pseudo-elements; on open, the vertical bar rotates into the horizontal one and fades — a tiny morph that reads as premium.',
      css: `.fh-details {
  border: 1px solid #3a4358;
  border-radius: 10px;
  padding: 0 16px;
}
.fh-details summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  padding: 12px 0;
  cursor: pointer;
  font-weight: 600;
  list-style: none;
}
.fh-details summary::-webkit-details-marker { display: none; }
.fh-details p { padding: 0 0 12px; margin: 0; opacity: 0.75; }
.fh-plusminus {
  position: relative;
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}
.fh-plusminus::before,
.fh-plusminus::after {
  content: '';
  position: absolute;
  inset: 0;
  margin: auto;
  background: #06b6d4;
  border-radius: 2px;
  transition: transform 0.3s ease, opacity 0.3s ease;
}
.fh-plusminus::before { width: 14px; height: 2px; }
.fh-plusminus::after { width: 2px; height: 14px; }
.fh-details[open] .fh-plusminus::after { transform: rotate(90deg); opacity: 0; }
.fh-details[open] .fh-plusminus::before { transform: rotate(180deg); }`
    },

    /* ═══ IMAGES & CAROUSELS ═══ */
    {
      id: 'img-zoom', name: 'Hover Zoom', cat: 'image', hover: true,
      tags: ['image', 'zoom', 'gallery', 'card'],
      html: '<div class="fh-img-zoom" style="width:150px;height:96px;"><img class="fh-img" src="assets/placeholder-1.png" alt="Preview" /></div>',
      usage: '<div class="fh-img-zoom">\n  <img src="photo.jpg" alt="…" />\n</div>',
      note: 'The image scales inside a clipped frame — the frame stays put, so the layout never shifts. The slow ease-out sells the quality.',
      css: `.fh-img-zoom {
  overflow: hidden;
  border-radius: 12px;
}
.fh-img-zoom img,
.fh-img-zoom .fh-img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
}
.fh-img-zoom:hover img,
.fh-img-zoom:hover .fh-img { transform: scale(1.12); }`
    },
    {
      id: 'ken-burns', name: 'Ken Burns', cat: 'image', loop: true,
      tags: ['image', 'pan', 'zoom', 'hero', 'cinematic'],
      html: '<div class="fh-kenburns" style="width:150px;height:96px;"><img class="fh-img" src="assets/placeholder-1.png" alt="Preview" /></div>',
      usage: '<div class="fh-kenburns">\n  <img src="hero.jpg" alt="…" />\n</div>',
      note: 'The slow drift documentary films use on still photos. Keep it subtle and slow (12s+) — it should be felt, not noticed.',
      css: `.fh-kenburns {
  overflow: hidden;
  border-radius: 12px;
}
.fh-kenburns img,
.fh-kenburns .fh-img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  animation: fh-kenburns 14s ease-in-out infinite alternate;
}
@keyframes fh-kenburns {
  from { transform: scale(1) translate(0, 0); }
  to   { transform: scale(1.18) translate(-2%, 2%); }
}`
    },
    {
      id: 'desaturate', name: 'Grey → Colour', cat: 'image', hover: true,
      tags: ['image', 'grayscale', 'filter', 'team', 'logo'],
      html: '<div class="fh-desaturate" style="width:150px;height:96px;border-radius:12px;overflow:hidden;"><img class="fh-img" src="assets/placeholder-1.png" alt="Preview" /></div>',
      usage: '<div class="fh-desaturate">\n  <img src="logo.png" alt="…" />\n</div>',
      note: 'A classic for logo walls and team photos: muted at rest, full colour on attention. filter transitions run on the GPU.',
      css: `.fh-desaturate img,
.fh-desaturate .fh-img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: grayscale(1);
  transition: filter 0.4s ease;
}
.fh-desaturate:hover img,
.fh-desaturate:hover .fh-img { filter: grayscale(0); }`
    },
    {
      id: 'caption-slide', name: 'Caption Slide-Up', cat: 'image', hover: true,
      tags: ['caption', 'overlay', 'gallery', 'portfolio'],
      html: '<div class="fh-caption-card" style="width:150px;height:96px;"><img class="fh-img" src="assets/placeholder-1.png" alt="Preview" style="height:100%;" /><div class="fh-caption">Project title</div></div>',
      usage: '<div class="fh-caption-card">\n  <img src="work.jpg" alt="…" />\n  <div class="fh-caption">Project title</div>\n</div>',
      note: 'The portfolio staple: the caption hides below the frame and rides up on hover over a gradient scrim that keeps text readable.',
      css: `.fh-caption-card {
  position: relative;
  overflow: hidden;
  border-radius: 12px;
}
.fh-caption-card img { display: block; width: 100%; height: 100%; object-fit: cover; }
.fh-caption {
  position: absolute;
  inset: auto 0 0 0;
  padding: 14px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.85));
  color: #fff;
  font-size: 0.8em;
  font-weight: 600;
  transform: translateY(100%);
  transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
}
.fh-caption-card:hover .fh-caption { transform: translateY(0); }`
    },
    {
      id: 'css-carousel', name: 'CSS Carousel', cat: 'image', hover: true, hintText: 'drag / scroll sideways',
      tags: ['carousel', 'slider', 'scroll-snap', 'gallery'],
      html: '<div class="fh-carousel" style="width:150px;height:90px;"><img class="fh-img" src="assets/placeholder-1.png" alt="Slide 1" /><img class="fh-img" src="assets/placeholder-2.png" alt="Slide 2" /><img class="fh-img" src="assets/placeholder-3.png" alt="Slide 3" /></div>',
      usage: '<div class="fh-carousel">\n  <img src="1.jpg" alt="…" />\n  <img src="2.jpg" alt="…" />\n  <img src="3.jpg" alt="…" />\n</div>',
      note: 'A working carousel with zero JavaScript: scroll-snap docks each slide as the user swipes or scrolls. Pair with anchor links for dot navigation, or a few lines of JS for autoplay.',
      css: `.fh-carousel {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  border-radius: 12px;
}
.fh-carousel > * {
  flex: 0 0 88%;
  min-height: 100%;
  border-radius: 10px;
  scroll-snap-align: center;
  object-fit: cover;
}`
    },
    {
      id: 'blur-load', name: 'Blur-Up Reveal', cat: 'image',
      tags: ['image', 'blur', 'loading', 'lqip'],
      html: '<div style="width:150px;height:96px;border-radius:12px;overflow:hidden;"><img class="fh-img fh-blur-load" src="assets/placeholder-1.png" alt="Preview" /></div>',
      usage: '<img class="fh-blur-load" src="photo.jpg" alt="…" />',
      note: 'The Medium-style loading effect: images sharpen into place instead of popping. Add the class when the image\'s load event fires.',
      css: `.fh-blur-load {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  animation: fh-blurReveal 0.9s ease both;
}
@keyframes fh-blurReveal {
  from { filter: blur(14px); transform: scale(1.06); opacity: 0.6; }
  to   { filter: blur(0);    transform: scale(1);    opacity: 1; }
}`
    },

    /* ═══ MENUS & DROPDOWNS ═══ */
    {
      id: 'dropdown-fade', name: 'Dropdown Fade', cat: 'menu', hover: true, hintText: 'hover the button',
      tags: ['dropdown', 'menu', 'nav', 'fade'],
      html: '<div class="fh-menu stage-top"><button class="fh-menu-btn">Menu ▾</button><div class="fh-menu-list"><a href="#!">Profile</a><a href="#!">Settings</a><a href="#!">Sign out</a></div></div>',
      usage: '<div class="fh-menu">\n  <button class="fh-menu-btn">Menu ▾</button>\n  <div class="fh-menu-list">\n    <a href="#">Profile</a>\n    <a href="#">Settings</a>\n  </div>\n</div>',
      note: 'A gentle pure-opacity fade — no movement at all, the calmest option. visibility joins the transition so the hidden menu can\'t be tabbed into by accident, and :focus-within keeps it keyboard-accessible.',
      css: `.fh-menu {
  position: relative;
  display: inline-block;
}
.fh-menu-btn {
  padding: 10px 18px;
  border: 1px solid #3a4358;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.05);
  color: inherit;
  font-weight: 600;
  cursor: pointer;
}
.fh-menu-list {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  min-width: 150px;
  background: #101828;
  border: 1px solid #3a4358;
  border-radius: 10px;
  padding: 6px;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease, visibility 0.3s;
}
.fh-menu:hover .fh-menu-list,
.fh-menu:focus-within .fh-menu-list {
  opacity: 1;
  visibility: visible;
}
.fh-menu-list a {
  display: block;
  padding: 8px 10px;
  border-radius: 6px;
  color: inherit;
  text-decoration: none;
  font-size: 0.9em;
}
.fh-menu-list a:hover { background: rgba(6, 182, 212, 0.12); }`
    },
    {
      id: 'dropdown-scale', name: 'Dropdown Grow', cat: 'menu', hover: true, hintText: 'hover the button',
      tags: ['dropdown', 'menu', 'scale', 'grow', 'origin'],
      html: '<div class="fh-menu-scale stage-top"><button class="fh-menu-btn2">Options ▾</button><div class="fh-menu-pop"><a href="#!">Duplicate</a><a href="#!">Archive</a><a href="#!">Delete</a></div></div>',
      usage: '<div class="fh-menu-scale">\n  <button>Options ▾</button>\n  <div class="fh-menu-pop">…links…</div>\n</div>',
      note: 'The opposite personality to the fade: the menu springs out of the button corner with a visible overshoot. transform-origin: top left is the spatial cue about where it came from.',
      css: `.fh-menu-scale {
  position: relative;
  display: inline-block;
}
.fh-menu-btn2 {
  padding: 10px 18px;
  border: 1px solid #3a4358;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.05);
  color: inherit;
  font-weight: 600;
  cursor: pointer;
}
.fh-menu-pop {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  min-width: 150px;
  background: #101828;
  border: 1px solid #3a4358;
  border-radius: 10px;
  padding: 6px;
  opacity: 0;
  transform: scale(0.55);
  transform-origin: top left;
  visibility: hidden;
  transition: opacity 0.2s ease,
              transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
              visibility 0.3s;
}
.fh-menu-scale:hover .fh-menu-pop,
.fh-menu-scale:focus-within .fh-menu-pop {
  opacity: 1;
  transform: scale(1);
  visibility: visible;
}
.fh-menu-pop a {
  display: block;
  padding: 8px 10px;
  border-radius: 6px;
  color: inherit;
  text-decoration: none;
  font-size: 0.9em;
}
.fh-menu-pop a:hover { background: rgba(139, 92, 246, 0.15); }`
    },
    {
      id: 'menu-stagger', name: 'Staggered Items', cat: 'menu', hover: true, hintText: 'hover the button',
      tags: ['menu', 'stagger', 'cascade', 'nav'],
      html: '<div class="fh-menu-stag stage-top"><button class="fh-menu-btn3">Products ▾</button><div class="fh-stag-list"><a href="#!">Analytics</a><a href="#!">Automation</a><a href="#!">Payments</a></div></div>',
      usage: '<div class="fh-menu-stag">\n  <button>Products ▾</button>\n  <div class="fh-stag-list">…links…</div>\n</div>',
      note: 'Each item waits 50ms longer than the one above, so the menu cascades open. Delays reset to zero on close so it snaps shut instantly.',
      css: `.fh-menu-stag {
  position: relative;
  display: inline-block;
}
.fh-menu-btn3 {
  padding: 10px 18px;
  border: 1px solid #3a4358;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.05);
  color: inherit;
  font-weight: 600;
  cursor: pointer;
}
.fh-stag-list {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  min-width: 160px;
  background: #101828;
  border: 1px solid #3a4358;
  border-radius: 10px;
  padding: 6px;
  visibility: hidden;
  transition: visibility 0.3s;
}
.fh-stag-list a {
  display: block;
  padding: 8px 10px;
  border-radius: 6px;
  color: inherit;
  text-decoration: none;
  font-size: 0.9em;
  opacity: 0;
  translate: 0 -6px;
  transition: opacity 0.25s ease, translate 0.25s ease;
}
.fh-stag-list a:hover { background: rgba(6, 182, 212, 0.12); }
.fh-menu-stag:hover .fh-stag-list,
.fh-menu-stag:focus-within .fh-stag-list { visibility: visible; }
.fh-menu-stag:hover .fh-stag-list a,
.fh-menu-stag:focus-within .fh-stag-list a {
  opacity: 1;
  translate: 0 0;
}
.fh-menu-stag:hover .fh-stag-list a:nth-child(2) { transition-delay: 0.05s; }
.fh-menu-stag:hover .fh-stag-list a:nth-child(3) { transition-delay: 0.1s; }`
    },
    {
      id: 'burger-morph', name: 'Hamburger Morph', cat: 'menu', hover: true, hintText: 'click it',
      tags: ['hamburger', 'menu', 'mobile', 'morph', 'x'],
      html: '<label class="fh-burger" aria-label="Toggle menu"><input type="checkbox" /><span></span><span></span><span></span></label>',
      usage: '<label class="fh-burger" aria-label="Toggle menu">\n  <input type="checkbox" />\n  <span></span><span></span><span></span>\n</label>',
      note: 'The three bars morph into an X using :has() on a hidden checkbox — pure CSS state. In production, sync the checkbox with your menu\'s open state.',
      css: `.fh-burger {
  width: 46px;
  height: 46px;
  display: grid;
  place-content: center;
  gap: 5px;
  border: 1px solid #3a4358;
  border-radius: 10px;
  cursor: pointer;
}
.fh-burger input { display: none; }
.fh-burger span {
  width: 20px;
  height: 2px;
  background: currentColor;
  border-radius: 2px;
  transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.2s ease;
}
.fh-burger:has(input:checked) span:nth-of-type(1) {
  transform: translateY(7px) rotate(45deg);
}
.fh-burger:has(input:checked) span:nth-of-type(2) { opacity: 0; }
.fh-burger:has(input:checked) span:nth-of-type(3) {
  transform: translateY(-7px) rotate(-45deg);
}`
    },

    /* ═══ UI FEEDBACK ═══ */
    {
      id: 'toast-slide', name: 'Toast Slide-In', cat: 'feedback',
      tags: ['toast', 'notification', 'snackbar', 'alert'],
      html: '<div class="fh-toast">✓ Changes saved</div>',
      usage: '<div class="fh-toast">✓ Changes saved</div>',
      note: 'The standard confirmation pattern — slides in with a slight overshoot so it feels placed, not teleported. Remove the element (or add a fade-out class) after ~2.5s.',
      css: `.fh-toast {
  display: inline-block;
  padding: 12px 20px;
  background: #101828;
  border: 1px solid rgba(16, 185, 129, 0.5);
  border-radius: 10px;
  color: #10b981;
  font-weight: 600;
  box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.5);
  animation: fh-toastIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}
@keyframes fh-toastIn {
  from { opacity: 0; transform: translateY(16px) scale(0.95); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}`
    },
    {
      id: 'modal-pop', name: 'Modal Pop-In', cat: 'feedback',
      tags: ['modal', 'dialog', 'popup', 'overlay'],
      html: '<div class="fh-modal-demo"><div class="fh-modal">Confirm action?<div class="fh-modal-row"><span class="fh-modal-ok">Confirm</span><span class="fh-modal-no">Cancel</span></div></div></div>',
      usage: '<div class="fh-modal-backdrop">\n  <div class="fh-modal">…dialog content…</div>\n</div>',
      note: 'Dialog scales up as the backdrop fades — the pair reads as one motion. In production use the native <dialog> element and trigger this on open.',
      css: `.fh-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: grid;
  place-items: center;
  animation: fh-backdropIn 0.25s ease both;
}
.fh-modal {
  background: #101828;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 14px;
  padding: 22px 26px;
  color: inherit;
  font-weight: 600;
  box-shadow: 0 24px 60px -12px rgba(0, 0, 0, 0.6);
  animation: fh-modalIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}
@keyframes fh-backdropIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes fh-modalIn {
  from { opacity: 0; transform: translateY(14px) scale(0.9); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
/* demo-only helpers */
.fh-modal-row { display: flex; gap: 8px; margin-top: 12px; }
.fh-modal-ok, .fh-modal-no {
  font-size: 0.75em;
  padding: 6px 12px;
  border-radius: 7px;
}
.fh-modal-ok { background: #06b6d4; color: #001018; }
.fh-modal-no { border: 1px solid #3a4358; }`
    },
    {
      id: 'tooltip-fade', name: 'Tooltip Fade', cat: 'feedback', hover: true, hintText: 'hover the button',
      tags: ['tooltip', 'hint', 'hover', 'label'],
      html: '<div class="fh-tip-wrap stage-top" style="margin-top:56px;"><button class="fh-menu-btn">Hover me</button><span class="fh-tooltip">Helpful context here</span></div>',
      usage: '<div class="fh-tip-wrap">\n  <button>Delete</button>\n  <span class="fh-tooltip">This cannot be undone</span>\n</div>',
      note: 'The short delay (0.15s) is deliberate — tooltips that appear instantly flicker annoyingly as the cursor crosses the page. The arrow is a rotated square.',
      css: `.fh-tip-wrap {
  position: relative;
  display: inline-block;
}
.fh-tooltip {
  position: absolute;
  bottom: calc(100% + 9px);
  left: 50%;
  translate: -50% 4px;
  background: #101828;
  border: 1px solid #3a4358;
  border-radius: 8px;
  padding: 7px 12px;
  font-size: 0.75em;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transition: opacity 0.25s ease 0.15s, translate 0.25s ease 0.15s, visibility 0.25s 0.15s;
}
.fh-tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  margin-left: -5px;
  margin-top: -5px;
  width: 10px;
  height: 10px;
  background: #101828;
  border-right: 1px solid #3a4358;
  border-bottom: 1px solid #3a4358;
  transform: rotate(45deg);
}
.fh-tip-wrap:hover .fh-tooltip,
.fh-tip-wrap:focus-within .fh-tooltip {
  opacity: 1;
  visibility: visible;
  translate: -50% 0;
}`
    },
    {
      id: 'tab-underline', name: 'Tab Underline Slide', cat: 'feedback', hover: true, hintText: 'hover the tabs',
      tags: ['tabs', 'underline', 'nav', 'indicator'],
      html: '<div class="fh-tabs"><span class="fh-tab active">Overview</span><span class="fh-tab">Pricing</span><span class="fh-tab">Docs</span></div>',
      usage: '<nav class="fh-tabs">\n  <a class="fh-tab active" href="#">Overview</a>\n  <a class="fh-tab" href="#">Pricing</a>\n</nav>',
      note: 'Each tab carries its own scaling underline — hover any tab and the line grows from centre. Swap the .active class in JS for the selected state.',
      css: `.fh-tabs {
  display: flex;
  gap: 4px;
}
.fh-tab {
  position: relative;
  padding: 10px 16px;
  font-weight: 600;
  color: #94a3b8;
  cursor: pointer;
  transition: color 0.2s ease;
}
.fh-tab::after {
  content: '';
  position: absolute;
  left: 12px;
  right: 12px;
  bottom: 4px;
  height: 2px;
  border-radius: 2px;
  background: #06b6d4;
  transform: scaleX(0);
  transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1);
}
.fh-tab:hover,
.fh-tab.active { color: inherit; }
.fh-tab:hover::after,
.fh-tab.active::after { transform: scaleX(1); }`
    },
    {
      id: 'progress-fill', name: 'Progress Bar Fill', cat: 'feedback',
      tags: ['progress', 'bar', 'loading', 'percent'],
      html: '<div class="fh-progress"><div class="fh-progress-fill"></div></div>',
      usage: '<div class="fh-progress">\n  <div class="fh-progress-fill" style="--target: 72%"></div>\n</div>',
      note: 'The fill animates to a CSS variable, so JavaScript only sets --target and the easing is pure CSS. Great for onboarding steps and upload progress.',
      css: `.fh-progress {
  width: 170px;
  height: 10px;
  border-radius: 5px;
  background: rgba(255, 255, 255, 0.08);
  overflow: hidden;
}
.fh-progress-fill {
  --target: 72%;
  height: 100%;
  width: var(--target);
  border-radius: 5px;
  background: linear-gradient(90deg, #8b5cf6, #06b6d4);
  animation: fh-progressFill 1.1s cubic-bezier(0.22, 1, 0.36, 1) both;
}
@keyframes fh-progressFill {
  from { width: 0; }
}`
    },
    {
      id: 'badge-ping', name: 'Notification Ping', cat: 'feedback', loop: true,
      tags: ['badge', 'notification', 'ping', 'unread', 'dot'],
      html: '<div class="fh-bell"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="22" height="22"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></svg><span class="fh-badge-ping"></span></div>',
      usage: '<button class="fh-bell">\n  🔔\n  <span class="fh-badge-ping"></span>\n</button>',
      note: 'The unread-notification dot with a radiating ping — impossible to miss without being loud. The ::after ring animates; the dot itself stays still.',
      css: `.fh-bell {
  position: relative;
  display: inline-grid;
  place-content: center;
  width: 46px;
  height: 46px;
  border: 1px solid #3a4358;
  border-radius: 12px;
}
.fh-badge-ping {
  position: absolute;
  top: 9px;
  right: 9px;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #ef4444;
}
.fh-badge-ping::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: #ef4444;
  animation: fh-badgePing 1.4s cubic-bezier(0, 0, 0.2, 1) infinite;
}
@keyframes fh-badgePing {
  from { transform: scale(1);   opacity: 0.8; }
  to   { transform: scale(2.6); opacity: 0; }
}`
    }
  ];

  /* ── INJECT PREVIEW STYLES (same CSS the user copies) ────── */
  const styleTag = document.createElement('style');
  styleTag.textContent = ANIMATIONS.map(a => a.css).join('\n\n');
  document.head.appendChild(styleTag);

  /* ── STATE ───────────────────────────────────────────────── */
  const grid = document.getElementById('anim-grid');
  const chipsWrap = document.getElementById('filter-chips');
  const searchInput = document.getElementById('anim-search');
  const noResults = document.getElementById('no-results');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Category landing pages lock the gallery to one category and have
  // no chip bar — e.g. <main class="gallery-main" data-fixed-cat="loader">
  const fixedCat = document.querySelector('[data-fixed-cat]')?.getAttribute('data-fixed-cat') || null;
  let activeCat = fixedCat || 'all';

  if (reducedMotion) {
    const note = document.getElementById('reduced-motion-note');
    if (note) note.hidden = false;
  }

  // Header badge always matches the real library size
  const badge = document.getElementById('anim-count-badge');
  if (badge) badge.textContent = `${ANIMATIONS.length} Animations`;

  /* ── FILTER CHIPS ────────────────────────────────────────── */
  function buildChips() {
    if (!chipsWrap || fixedCat) return;   // no chip bar on category pages
    const counts = {};
    ANIMATIONS.forEach(a => { counts[a.cat] = (counts[a.cat] || 0) + 1; });

    const chips = [
      { key: 'all', label: 'All', count: ANIMATIONS.length },
      ...Object.entries(CATEGORIES).map(([key, label]) => ({ key, label, count: counts[key] || 0 }))
    ];

    chipsWrap.innerHTML = '';
    chips.forEach(c => {
      const btn = document.createElement('button');
      btn.className = 'chip' + (c.key === activeCat ? ' active' : '');
      btn.setAttribute('data-cat', c.key);
      btn.innerHTML = `${c.label}<span class="chip-count">${c.count}</span>`;
      btn.addEventListener('click', () => {
        activeCat = c.key;
        chipsWrap.querySelectorAll('.chip').forEach(ch => ch.classList.toggle('active', ch.getAttribute('data-cat') === c.key));
        applyFilters();
      });
      chipsWrap.appendChild(btn);
    });
  }

  /* ── CARD RENDERING ──────────────────────────────────────── */
  function stageHint(anim) {
    return anim.hover
      ? `<span class="hover-hint">${anim.hintText || 'hover the stage'}</span>`
      : '';
  }

  // Cards are built ONCE, then pages append the relevant slice
  const cardEls = new Map();

  // One observer for auto-replay; cards stay observed across
  // detach/re-attach as pages change
  const replayObserver = (!reducedMotion && 'IntersectionObserver' in window)
    ? new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          const anim = ANIMATIONS.find(a => a.id === entry.target.getAttribute('data-id'));
          if (anim && !anim.loop && !anim.hover) replay(entry.target, anim);
        });
      }, { threshold: 0.35 })
    : null;

  function buildCards() {
    ANIMATIONS.forEach(anim => {
      const card = document.createElement('article');
      card.className = 'anim-card';
      card.setAttribute('data-id', anim.id);
      card.setAttribute('data-cat', anim.cat);

      const replayBtn = (!anim.loop && !anim.hover)
        ? '<button class="btn-replay" title="Replay animation" aria-label="Replay animation">↺</button>'
        : '';

      card.innerHTML = `
        <div class="anim-stage">${anim.html}${stageHint(anim)}</div>
        <div class="anim-info">
          <h3>${anim.name}</h3>
          <span class="anim-cat-tag">${CATEGORIES[anim.cat]}</span>
        </div>
        <div class="anim-actions">
          <button class="btn-view-code">&lt;/&gt; Code</button>
          <button class="btn-copy-anim">Copy CSS</button>
          ${replayBtn}
        </div>
      `;

      card.querySelector('.btn-copy-anim').addEventListener('click', () => {
        copyToClipboard(anim.css, anim.name + ' CSS');
      });
      card.querySelector('.btn-view-code').addEventListener('click', () => openModal(anim));

      const rb = card.querySelector('.btn-replay');
      if (rb) rb.addEventListener('click', () => replay(card, anim));

      if (replayObserver) replayObserver.observe(card);
      cardEls.set(anim.id, card);
    });
  }

  function replay(card, anim) {
    const stage = card.querySelector('.anim-stage');
    stage.innerHTML = '';
    void stage.offsetWidth; // force reflow so the animation restarts
    stage.innerHTML = anim.html + stageHint(anim);
  }

  /* ── SEARCH + FILTER ─────────────────────────────────────── */
  function animMatches(anim, cat, q) {
    const matchesCat = cat === 'all' || anim.cat === cat;
    const haystack = (anim.name + ' ' + anim.tags.join(' ') + ' ' + CATEGORIES[anim.cat]).toLowerCase();
    return matchesCat && (!q || haystack.includes(q));
  }

  /* Grey out categories the current search leaves empty,
     and keep every chip's count live */
  function updateChipStates(q) {
    if (!chipsWrap) return;   // category pages have no chip bar
    chipsWrap.querySelectorAll('.chip').forEach(chip => {
      const key = chip.getAttribute('data-cat');
      const count = ANIMATIONS.filter(a => animMatches(a, key, q)).length;
      const countEl = chip.querySelector('.chip-count');
      if (countEl) countEl.textContent = count;
      const disable = count === 0 && key !== activeCat;
      chip.classList.toggle('disabled', disable);
      chip.setAttribute('aria-disabled', String(disable));
    });
  }

  /* ── PAGINATION (max 3 rows per page) ────────────────────── */
  const pagWrap = document.getElementById('anim-pagination');
  let filtered = ANIMATIONS.slice();
  let currentPage = 1;
  let pageSize = 12;

  function computePageSize() {
    // 3 rows × however many columns the responsive grid resolves to
    const cols = getComputedStyle(grid).gridTemplateColumns.split(' ').length || 1;
    return Math.max(cols * 3, 6);
  }

  function pageCount() {
    return Math.max(1, Math.ceil(filtered.length / pageSize));
  }

  function renderPagination() {
    const total = pageCount();
    pagWrap.innerHTML = '';
    if (total <= 1) return;

    const makeBtn = (label, page, opts = {}) => {
      const btn = document.createElement('button');
      btn.className = 'page-btn' + (opts.current ? ' active' : '');
      btn.textContent = label;
      if (opts.disabled) btn.disabled = true;
      if (opts.aria) btn.setAttribute('aria-label', opts.aria);
      if (opts.current) btn.setAttribute('aria-current', 'page');
      btn.addEventListener('click', () => goToPage(page));
      pagWrap.appendChild(btn);
    };

    makeBtn('←', currentPage - 1, { disabled: currentPage === 1, aria: 'Previous page' });
    for (let i = 1; i <= total; i++) {
      makeBtn(String(i), i, { current: i === currentPage, aria: 'Page ' + i });
    }
    makeBtn('→', currentPage + 1, { disabled: currentPage === total, aria: 'Next page' });
  }

  function renderPage() {
    currentPage = Math.min(Math.max(1, currentPage), pageCount());
    grid.innerHTML = '';
    filtered
      .slice((currentPage - 1) * pageSize, currentPage * pageSize)
      .forEach(anim => grid.appendChild(cardEls.get(anim.id)));
    renderPagination();
    noResults.hidden = filtered.length !== 0;
  }

  function goToPage(page) {
    currentPage = page;
    renderPage();
    // keep the gallery in view when flipping pages
    grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function applyFilters() {
    const q = searchInput.value.trim().toLowerCase();
    filtered = ANIMATIONS.filter(anim => animMatches(anim, activeCat, q));
    currentPage = 1;
    renderPage();
    updateChipStates(q);
  }

  let searchTimer;
  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(applyFilters, 120);
  });

  // Columns change with viewport width → recompute rows-per-page
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const next = computePageSize();
      if (next !== pageSize) {
        pageSize = next;
        renderPage();
      }
    }, 250);
  });

  /* ── CODE MODAL ──────────────────────────────────────────── */
  const modal = document.getElementById('code-modal');
  const modalTitle = document.getElementById('modal-title');
  const modalHtml = document.getElementById('modal-html-code');
  const modalCss = document.getElementById('modal-css-code');
  const modalNote = document.getElementById('modal-note');
  const modalClose = document.getElementById('modal-close');
  let currentAnim = null;
  let lastFocused = null;

  function openModal(anim) {
    currentAnim = anim;
    lastFocused = document.activeElement;
    modalTitle.textContent = anim.name + ' — copy-paste code';
    modalHtml.textContent = anim.usage;
    modalCss.textContent = anim.css;
    modalNote.textContent = anim.note;
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    modalClose.focus();
  }

  function closeModal() {
    modal.hidden = true;
    document.body.style.overflow = '';
    currentAnim = null;
    if (lastFocused) lastFocused.focus();
  }

  modalClose.addEventListener('click', closeModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !modal.hidden) closeModal(); });

  document.getElementById('modal-copy-html').addEventListener('click', () => {
    if (currentAnim) copyToClipboard(currentAnim.usage, currentAnim.name + ' HTML');
  });
  document.getElementById('modal-copy-css').addEventListener('click', () => {
    if (currentAnim) copyToClipboard(currentAnim.css, currentAnim.name + ' CSS');
  });

  /* ── CSS FUNDAMENTALS DEMOS ──────────────────────────────── */
  function initFundamentals() {
    // Colour demo: three sliders, one colour, three formats
    const hue = document.getElementById('fund-hue');
    const sat = document.getElementById('fund-sat');
    const light = document.getElementById('fund-light');
    if (hue && sat && light) {
      const swatch = document.getElementById('fund-swatch');
      const outHsl = document.getElementById('fund-out-hsl');
      const outHex = document.getElementById('fund-out-hex');
      const outRgb = document.getElementById('fund-out-rgb');

      function hslToRgb(h, s, l) {
        s /= 100; l /= 100;
        const k = n => (n + h / 30) % 12;
        const a = s * Math.min(l, 1 - l);
        const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
        return [f(0), f(8), f(4)].map(v => Math.round(v * 255));
      }

      function updateColour() {
        const h = +hue.value, s = +sat.value, l = +light.value;
        document.getElementById('fund-hue-val').textContent = h;
        document.getElementById('fund-sat-val').textContent = s;
        document.getElementById('fund-light-val').textContent = l;
        const [r, g, b] = hslToRgb(h, s, l);
        const hex = '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
        swatch.style.background = `hsl(${h}, ${s}%, ${l}%)`;
        outHsl.textContent = `hsl(${h}, ${s}%, ${l}%)`;
        outHex.textContent = hex;
        outRgb.textContent = `rgb(${r}, ${g}, ${b})`;
      }

      [hue, sat, light].forEach(el => el.addEventListener('input', updateColour));
      [outHsl, outHex, outRgb].forEach(btn => {
        btn.addEventListener('click', () => copyToClipboard(btn.textContent, 'Colour value'));
      });
      updateColour();
    }

    // Stacking context trap demo
    const trap = document.getElementById('stack-trap');
    const stackDemo = document.getElementById('stack-demo');
    if (trap && stackDemo) {
      trap.addEventListener('change', () => {
        stackDemo.classList.toggle('fixed', trap.checked);
      });
    }

    // Theme tokens demo: swap data-theme on the demo scope only
    const themeDemo = document.getElementById('theme-demo');
    if (themeDemo) {
      themeDemo.querySelectorAll('[data-set-theme]').forEach(btn => {
        btn.addEventListener('click', () => {
          themeDemo.setAttribute('data-theme', btn.getAttribute('data-set-theme'));
          themeDemo.querySelectorAll('.theme-pick').forEach(b => b.classList.toggle('active', b === btn));
        });
      });
    }

    // Positioning demo: radios apply position classes to the box
    const posBox = document.getElementById('pos-box');
    const posNote = document.getElementById('pos-note');
    if (posBox && posNote) {
      const NOTES = {
        static: 'static — the default: the box sits in the normal flow; top/left do nothing.',
        relative: 'relative — nudged 14px down, 40px right from its own spot. Its gap stays reserved: the siblings never moved.',
        absolute: 'absolute — out of the flow entirely, anchored to .parent\'s corner. The siblings closed the gap.'
      };
      document.querySelectorAll('input[name="pos-mode"]').forEach(radio => {
        radio.addEventListener('change', () => {
          posBox.classList.remove('mode-relative', 'mode-absolute');
          if (radio.value !== 'static') posBox.classList.add('mode-' + radio.value);
          posNote.textContent = NOTES[radio.value];
        });
      });
    }
  }

  /* ── TUTORIALS & GUIDES DROPDOWN ─────────────────────────── */
  function initLearnDropdown() {
    const wrap = document.getElementById('learn-dropdown');
    const btn = document.getElementById('learn-dd-btn');
    const menu = document.getElementById('learn-dd-menu');
    if (!wrap || !btn || !menu) return;

    function setOpen(open) {
      menu.hidden = !open;
      btn.setAttribute('aria-expanded', String(open));
    }

    btn.addEventListener('click', () => setOpen(menu.hidden));

    // A chosen link closes the menu (the browser handles the jump)
    menu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => setOpen(false));
    });

    document.addEventListener('click', (e) => {
      if (!menu.hidden && !wrap.contains(e.target)) setOpen(false);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !menu.hidden) {
        setOpen(false);
        btn.focus();
      }
    });
  }

  /* ── INIT ────────────────────────────────────────────────── */
  initLearnDropdown();
  buildChips();
  buildCards();
  pageSize = computePageSize();
  applyFilters();
  initFundamentals();
  initStickyToolbar(document.querySelector('.gallery-toolbar'));

});
