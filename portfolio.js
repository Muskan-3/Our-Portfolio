let words = document.querySelectorAll(".word");
words.forEach((word) => {
    let letters = word.textContent.split("");
    word.textContent="";
    letters.forEach((letter)=>{
        let span = document.createElement("span");
        span.textContent = letter;
        span.className = "letter";
        word.append(span);
    });
});

let currentWordIndex =0;
let maxWordIndex = words.length -1;
words[currentWordIndex].style.opacity="1";

let changeText = ()=>{
    let currentWord =words[currentWordIndex];
    let nextWord = currentWordIndex === maxWordIndex ? words[0] : words[currentWordIndex + 1];

    Array.from(currentWord.children).forEach((letter,i)=>{
        setTimeout(()=>{
            letter.className = "letter out";
        },i*80);
    });
    nextWord.style.opacity = "1";
    Array.from(nextWord.children).forEach((letter,i)=>{
        letter.className = "letter behind";
        setTimeout(()=>{
            letter.className ="letter in";
        },340 + i * 80);
    });
    currentWordIndex = currentWordIndex===maxWordIndex ? 0 : currentWordIndex+1;
};
changeText();
setInterval(changeText,3000)

// Smooth reveal for team cards
document.addEventListener('DOMContentLoaded', () => {
  const cards = document.querySelectorAll('.team-card');

  cards.forEach(c => c.classList.add('reveal'));

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('show');
        io.unobserve(entry.target);
      }
    });
  }, { rootMargin: '60px 0px', threshold: 0.1 });

  cards.forEach(card => io.observe(card));
});

// skills section
// Animate skills progress bars on scroll
const skillsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.progress span').forEach(bar => {
        bar.style.width = bar.getAttribute('style').match(/width:\s*(\d+%)/)[1];
      });
    }
  });
});

document.querySelectorAll('.skill-card').forEach(card => {
  skillsObserver.observe(card);
});


// cursor
/* ===== Advanced Canvas Cursor (Spotlight + Blob + Halo + Labels) ===== */
(() => {
  const isTouch = window.matchMedia('(pointer: coarse)').matches;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (isTouch) return;

  // Canvas setup
  const canvas = document.getElementById('cursor-canvas');
  const ctx = canvas.getContext('2d', { alpha: true });
  let w = canvas.width = window.innerWidth;
  let h = canvas.height = window.innerHeight;

  const DPR = Math.min(2, window.devicePixelRatio || 1);
  const resize = () => {
    w = canvas.width = Math.floor(window.innerWidth * DPR);
    h = canvas.height = Math.floor(window.innerHeight * DPR);
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  };
  resize();
  window.addEventListener('resize', resize);

  // State
  let mx = window.innerWidth / 2, my = window.innerHeight / 2; // mouse
  let bx = mx, by = my;      // blob target (lerped)
  let vx = 0, vy = 0;        // velocity
  let lastX = mx, lastY = my;
  let lastT = performance.now();
  let hidden = false;

  // Label element
  const label = document.getElementById('cursor-label');
  let labelText = '';
  let hoverEl = null;

  // Particle halo
  const PARTICLES = prefersReduced ? 0 : 28;
  const halo = Array.from({ length: PARTICLES }, (_, i) => ({
    angle: (i / PARTICLES) * Math.PI * 2,
    rBase: 16 + Math.random() * 10,
    rJitter: 6 + Math.random() * 6,
    speed: 0.8 + Math.random() * 0.6,
  }));

  // Ripple store
  const ripples = [];

  // Helpers
  const lerp = (a, b, n) => a + (b - a) * n;
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const easeOut = t => 1 - Math.pow(1 - t, 3);

  // Colors from CSS var
  const getAccent = () => {
    const s = getComputedStyle(document.documentElement);
    return s.getPropertyValue('--hover-color') || s.getPropertyValue('--cursor-accent') || '#12f7ff';
  };

  // Events
  const markActive = () => {
    clearTimeout(markActive._t);
    document.documentElement.classList.remove('cursor-hidden');
    markActive._t = setTimeout(() => document.documentElement.classList.add('cursor-hidden'), 1600);
  };

  window.addEventListener('mousemove', (e) => {
    mx = e.clientX; my = e.clientY;
    markActive();

    // Hover labeling
    const el = e.target.closest('[data-cursor], [data-cursor-label]');
    hoverEl = el || null;
    const txt = hoverEl?.getAttribute('data-cursor-label') || '';
    if (txt !== labelText) {
      labelText = txt;
      label.textContent = labelText;
    }
    if (labelText) {
      label.style.opacity = '1';
      label.style.transform = `translate(${mx}px, ${my - 18}px) translate(-50%,-180%)`;
    } else {
      label.style.opacity = '0';
    }
  });

  window.addEventListener('mouseout', () => { hidden = true; document.documentElement.classList.add('cursor-hidden'); });
  window.addEventListener('mouseover', () => { hidden = false; markActive(); });

  window.addEventListener('mousedown', () => {
    // click ripple
    ripples.push({ x: mx, y: my, t0: performance.now() });
  });

  // Disable on focus for text inputs
  const disableCursor = (on) => {
    document.documentElement.style.cursor = on ? 'auto' : 'none';
    canvas.style.display = on ? 'none' : 'block';
    label.style.display = on ? 'none' : 'block';
  };
  document.addEventListener('focusin', (e) => {
    if (e.target.matches('input, textarea, [contenteditable="true"]')) disableCursor(true);
  });
  document.addEventListener('focusout', (e) => {
    if (e.target.matches('input, textarea, [contenteditable="true"]')) disableCursor(false);
  });

  // Magnetic effect
  const applyMagnet = () => {
    if (!hoverEl || hoverEl.getAttribute('data-cursor') !== 'magnetic') return;
    const rect = hoverEl.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (mx - cx) * 0.18;
    const dy = (my - cy) * 0.18;
    hoverEl.style.transition = 'transform .12s ease';
    hoverEl.style.transform = `translate(${dx}px, ${dy}px)`;
  };

  // Draw loop
  const draw = (t) => {
    const dt = clamp((t - lastT) / 16.7, 0.2, 3); // normalize to 60fps
    lastT = t;

    // velocity & smoothing
    vx = mx - lastX; vy = my - lastY;
    lastX = mx; lastY = my;
    const speed = Math.hypot(vx, vy);
    const follow = speed > 2 ? 0.18 : 0.12;
    bx = lerp(bx, mx, follow);
    by = lerp(by, my, follow);

    // clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!hidden) {
      // spotlight (radial gradient with glassy rim)
      const accent = getAccent().trim();
      const g = ctx.createRadialGradient(mx, my, 0, mx, my, 90);
      g.addColorStop(0, 'rgba(255,255,255,0.08)');
      g.addColorStop(0.6, 'rgba(255,255,255,0.03)');
      g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(mx, my, 90, 0, Math.PI * 2);
      ctx.fill();

      // morphing blob ring
      const baseR = 20;
      const deform = Math.min(10, speed * 0.5);
      const points = 24;
      ctx.beginPath();
      for (let i = 0; i <= points; i++) {
        const θ = (i / points) * Math.PI * 2;
        const noise = Math.sin(θ * 3 + t * 0.004) * deform + Math.cos(θ * 5 + t * 0.003) * (deform * 0.5);
        const r = baseR + noise;
        const x = bx + Math.cos(θ) * r;
        const y = by + Math.sin(θ) * r;
        i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.strokeStyle = accent;
      ctx.globalAlpha = 0.95;
      ctx.lineWidth = 1.2;
      ctx.shadowBlur = 18;
      ctx.shadowColor = 'rgba(18,247,255,.35)';
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;

      // inner dot
      ctx.beginPath();
      ctx.arc(mx, my, 2.2, 0, Math.PI * 2);
      ctx.fillStyle = accent;
      ctx.shadowBlur = 12;
      ctx.shadowColor = 'rgba(7, 118, 255, 0.45)';
      ctx.fill();
      ctx.shadowBlur = 0;

      // halo particles
      if (!prefersReduced && PARTICLES) {
        ctx.fillStyle = accent;
        ctx.globalAlpha = 0.7;
        halo.forEach(p => {
          p.angle += (p.speed + speed * 0.002) * 0.02 * dt;
          const rad = p.rBase + Math.sin(t * 0.003 + p.angle * 2) * p.rJitter;
          const x = bx + Math.cos(p.angle) * rad;
          const y = by + Math.sin(p.angle) * rad;
          ctx.beginPath();
          ctx.arc(x, y, 1.2, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.globalAlpha = 1;
      }

      // ripples
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        const life = (t - r.t0) / 420;
        if (life >= 1) { ripples.splice(i, 1); continue; }
        const k = easeOut(life);
        ctx.beginPath();
        ctx.arc(r.x, r.y, 6 + k * 40, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(18,247,255,${1 - k})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    // Magnetic pull
    applyMagnet();

    requestAnimationFrame(draw);
  };
  requestAnimationFrame(draw);
})();
