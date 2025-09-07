/* portfolio.js
   - Rotating words (per-letter)
   - Team reveal (IntersectionObserver)
   - Skills progress animation on intersection
   - Accessible mobile nav toggle
   - Contact form (honeypot, endpoint or mailto fallback)
   - Advanced canvas cursor (disabled on touch via CSS)
*/

(function () {
  'use strict';

  /* --------------------------
     Small helpers (shared)
  ---------------------------*/
  const qs = sel => document.querySelector(sel);
  const qsa = sel => Array.from(document.querySelectorAll(sel));
  function on(el, ev, fn, opts) { if (el) el.addEventListener(ev, fn, opts); }
  function debounce(fn, wait = 120) {
    let t = 0;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), wait);
    };
  }

  /* ===========================
     NAV (mobile toggle + a11y)
     =========================== */
  (function navToggle() {
    const menuBtn = qs('#menu-icon');
    const navList = qs('#navlist');

    if (!menuBtn || !navList) return;

    const toggle = () => {
      const isOpen = navList.classList.toggle('show');
      menuBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    };

    on(menuBtn, 'click', (e) => {
      e.stopPropagation();
      toggle();
    });

    // close when clicking a link
    qsa('#navlist a').forEach(a => on(a, 'click', () => {
      navList.classList.remove('show');
      menuBtn.setAttribute('aria-expanded', 'false');
    }));

    // close on escape & outside click
    on(document, 'click', (e) => {
      if (!navList.classList.contains('show')) return;
      if (!e.target.closest('#navlist') && !e.target.closest('#menu-icon')) {
        navList.classList.remove('show');
        menuBtn.setAttribute('aria-expanded', 'false');
      }
    });

    on(document, 'keydown', (e) => {
      if (e.key === 'Escape') {
        navList.classList.remove('show');
        menuBtn.setAttribute('aria-expanded', 'false');
      }
    });
  })();

  /* ===========================
     Rotating words (per-letter)
     =========================== */
  (function rotatingWords() {
    const words = qsa('.word');
    if (!words.length) return;

    // convert each word into letter spans
    words.forEach(word => {
      const letters = word.textContent.split('');
      word.textContent = '';
      letters.forEach(letter => {
        const span = document.createElement('span');
        span.textContent = letter;
        span.className = 'letter';
        word.append(span);
      });
    });

    let currentWordIndex = 0;
    const maxWordIndex = words.length - 1;
    words[currentWordIndex].style.opacity = '1';

    const changeText = () => {
      const currentWord = words[currentWordIndex];
      const nextWord = currentWordIndex === maxWordIndex ? words[0] : words[currentWordIndex + 1];

      Array.from(currentWord.children).forEach((letter, i) => {
        setTimeout(() => letter.className = 'letter out', i * 80);
      });

      nextWord.style.opacity = '1';
      Array.from(nextWord.children).forEach((letter, i) => {
        letter.className = 'letter behind';
        setTimeout(() => letter.className = 'letter in', 340 + i * 80);
      });

      currentWordIndex = currentWordIndex === maxWordIndex ? 0 : currentWordIndex + 1;
    };

    // initial run + interval
    changeText();
    setInterval(changeText, 3000);
  })();

  /* ===========================
     Team reveal (IntersectionObserver)
     =========================== */
  (function teamReveal() {
    const cards = qsa('.team-card');
    if (!cards.length) return;

    cards.forEach(c => c.classList.add('reveal'));

    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('show');
          obs.unobserve(entry.target);
        }
      });
    }, { rootMargin: '60px 0px', threshold: 0.12 });

    cards.forEach(card => io.observe(card));
  })();

  /* ===========================
     Skills progress animation
     - Prefer data-width; fallback to inline style parsing
     =========================== */
  (function skillsProgress() {
    const cards = qsa('.skill-card');
    if (!cards.length) return;

    const skillsObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const spans = entry.target.querySelectorAll('.progress span');
        spans.forEach(span => {
          const dataWidth = span.getAttribute('data-width') || span.dataset.width;
          if (dataWidth) {
            span.style.width = dataWidth;
            return;
          }
          const inline = span.getAttribute('style') || '';
          const m = inline.match(/width\s*:\s*(\d+%)/);
          if (m && m[1]) { span.style.width = m[1]; }
          else { span.style.width = '70%'; }
        });
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.16 });

    cards.forEach(c => skillsObserver.observe(c));
  })();

  /* ===========================
     Contact form: proper handler
     - Honeypot, client validation, endpoint POST or mailto fallback
     =========================== */
  (function contactFormHandler() {
    const form = qs('#contactForm');
    if (!form) return;
    const statusEl = qs('#formStatus');
    const submitBtn = qs('#contactSubmit');

    // local helpers
    const setError = (name, msg) => {
      const el = qs(`[data-error-for="${name}"]`);
      if (el) el.textContent = msg || '';
    };
    const clearAllErrors = () => qsa('.error').forEach(e => e.textContent = '');

    function validateForm(fd) {
      let ok = true;
      clearAllErrors();

      if (fd.get('_honeypot')) { return { ok: false, spam: true }; }

      const name = (fd.get('name') || '').trim();
      const email = (fd.get('email') || '').trim();
      const phone = (fd.get('phone') || '').trim();
      const subject = (fd.get('subject') || '').trim();
      const message = (fd.get('message') || '').trim();
      const consent = fd.get('consent');

      if (!name) { setError('name', 'Please enter your name'); ok = false; }
      if (!email || !/^\S+@\S+\.\S+$/.test(email)) { setError('email', 'Please enter a valid email'); ok = false; }
      if (phone && !/^\+?\d{7,15}$/.test(phone.replace(/[\s-]/g, ''))) { setError('phone', 'Please enter a valid phone'); ok = false; }
      if (!subject) { setError('subject', 'Please add a subject'); ok = false; }
      if (!message || message.length < 8) { setError('message', 'Please add a short message (8+ characters)'); ok = false; }
      if (!consent) { setError('consent', 'You must agree to be contacted'); ok = false; }

      return { ok };
    }

    function setLoading(on) {
      if (!submitBtn) return;
      if (on) {
        submitBtn.classList.add('loading');
        submitBtn.setAttribute('disabled', 'disabled');
      } else {
        submitBtn.classList.remove('loading');
        submitBtn.removeAttribute('disabled');
      }
    }

    async function sendPayload(endpoint, payload) {
      return fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload),
      });
    }

    form.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      if (!statusEl) return;
      statusEl.textContent = '';
      statusEl.className = 'form-status';
      const fd = new FormData(form);

      const validated = validateForm(fd);
      if (validated && validated.spam) {
        form.reset();
        return;
      }
      if (!validated.ok) {
        statusEl.textContent = 'Please fix errors above and try again.';
        statusEl.classList.add('error');
        return;
      }

      const payload = {
        name: fd.get('name').trim(),
        email: fd.get('email').trim(),
        phone: (fd.get('phone') || '').trim(),
        subject: fd.get('subject').trim(),
        message: fd.get('message').trim(),
        source: window.location.href,
        date: new Date().toISOString()
      };

      const endpoint = form.getAttribute('data-endpoint')?.trim();

      try {
        setLoading(true);
        statusEl.textContent = 'Sending…';
        statusEl.classList.remove('error', 'success');

        if (endpoint) {
          const res = await sendPayload(endpoint, payload);
          if (res.ok) {
            statusEl.textContent = 'Thanks — your message has been sent.';
            statusEl.classList.add('success');
            form.reset();
          } else {
            let json;
            try { json = await res.json(); } catch (e) { /* ignore */ }
            const msg = json?.message || `Server returned ${res.status}`;
            statusEl.textContent = `Could not send: ${msg}`;
            statusEl.classList.add('error');
          }
        } else {
          // Mailto fallback
          const subject = encodeURIComponent(payload.subject || 'Message from website');
          const bodyLines = [
            `Name: ${payload.name}`,
            `Email: ${payload.email}`,
            `Phone: ${payload.phone}`,
            '',
            payload.message
          ];
          const body = encodeURIComponent(bodyLines.join('\n'));
          const mailto = `mailto:utsavrajdocx@gmil.com?subject=${subject}&body=${body}`;
          window.open(mailto, '_blank');
          statusEl.textContent = 'Opened your mail client. If nothing opened, please email utsavrajdocx@gmil.com directly.';
          statusEl.classList.add('success');
          form.reset();
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Contact submit error', err);
        statusEl.textContent = 'An error occurred while sending. Try again later.';
        statusEl.classList.add('error');
      } finally {
        setLoading(false);
      }
    });

    // Focus first invalid field: observe changes to error nodes
    const mo = new MutationObserver(() => {
      const firstErr = form.querySelector('.error:not(:empty)');
      if (firstErr) {
        const name = firstErr.getAttribute('data-error-for');
        const field = form.querySelector(`[name="${name}"]`);
        if (field) field.focus();
      }
    });
    mo.observe(form, { subtree: true, characterData: true, childList: true });
  })();

  /* ===========================
     Advanced Canvas Cursor
     (keeps original feature but safe-guards)
     =========================== */
  (function canvasCursor() {
    const canvas = qs('#cursor-canvas');
    const label = qs('#cursor-label');
    if (!canvas || !label) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    let DPR = Math.min(2, window.devicePixelRatio || 1);

    let w = canvas.width = Math.floor(window.innerWidth * DPR);
    let h = canvas.height = Math.floor(window.innerHeight * DPR);
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    if (isTouch) return;

    window.addEventListener('resize', debounce(() => {
      DPR = Math.min(2, window.devicePixelRatio || 1);
      w = canvas.width = Math.floor(window.innerWidth * DPR);
      h = canvas.height = Math.floor(window.innerHeight * DPR);
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }, 200));

    // state
    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    let bx = mx, by = my;
    let lastX = mx, lastY = my;
    let lastT = performance.now();
    let hidden = false;
    let labelText = '';
    let hoverEl = null;
    const ripples = [];

    const PARTICLES = prefersReduced ? 0 : 20;
    const halo = Array.from({ length: PARTICLES }, (_, i) => ({
      angle: (i / PARTICLES) * Math.PI * 2,
      rBase: 16 + Math.random() * 8,
      rJitter: 5 + Math.random() * 5,
      speed: 0.7 + Math.random() * 0.6,
    }));

    const lerp = (a, b, n) => a + (b - a) * n;
    const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
    const easeOut = t => 1 - Math.pow(1 - t, 3);

    const getAccent = () => {
      const s = getComputedStyle(document.documentElement);
      return (s.getPropertyValue('--hover-color') || '#12f7ff').trim();
    };

    const markActive = (() => {
      let _t = 0;
      return () => {
        clearTimeout(_t);
        document.documentElement.classList.remove('cursor-hidden');
        _t = setTimeout(() => document.documentElement.classList.add('cursor-hidden'), 1600);
      };
    })();

    window.addEventListener('mousemove', (e) => {
      mx = e.clientX; my = e.clientY;
      markActive();
      const el = e.target.closest('[data-cursor], [data-cursor-label]') || null;
      hoverEl = el;
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
    window.addEventListener('mousedown', () => ripples.push({ x: mx, y: my, t0: performance.now() }));

    // magnetic effect
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

    const draw = (t) => {
      const dt = clamp((t - lastT) / 16.7, 0.2, 3);
      lastT = t;

      const vx = mx - lastX; const vy = my - lastY;
      lastX = mx; lastY = my;
      const speed = Math.hypot(vx, vy);
      const follow = speed > 2 ? 0.18 : 0.12;
      bx = lerp(bx, mx, follow); by = lerp(by, my, follow);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (!hidden) {
        const accent = getAccent();
        const g = ctx.createRadialGradient(mx, my, 0, mx, my, 90);
        g.addColorStop(0, 'rgba(255,255,255,0.08)');
        g.addColorStop(0.6, 'rgba(255,255,255,0.03)');
        g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(mx, my, 90, 0, Math.PI * 2); ctx.fill();

        const baseR = 18;
        const deform = Math.min(10, speed * 0.5);
        const points = 20;
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
        ctx.shadowBlur = 14;
        ctx.shadowColor = accent;
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;

        ctx.beginPath();
        ctx.arc(mx, my, 2.2, 0, Math.PI * 2);
        ctx.fillStyle = accent;
        ctx.shadowBlur = 10;
        ctx.shadowColor = accent;
        ctx.fill();
        ctx.shadowBlur = 0;

        if (!prefersReduced && PARTICLES) {
          ctx.fillStyle = accent;
          ctx.globalAlpha = 0.75;
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

      applyMagnet();
      requestAnimationFrame(draw);
    };

    requestAnimationFrame(draw);
  })();

})(); // end IIFE
