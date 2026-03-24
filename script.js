/* ═══════════════════════════════════════════════════════════
   ASEVIN — Premium Web Studio Scripts
   Author: Jovan Špinjo
   ═══════════════════════════════════════════════════════════ */

'use strict';


/* ── PARTICLE CANVAS ────────────────────────────────────────── */
(function initParticles() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  const isMobile = window.innerWidth < 768;
  /* On mobile skip particles entirely — too heavy */
  if (isMobile) { canvas.style.display = 'none'; return; }
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x  = Math.random() * W;
      this.y  = Math.random() * H;
      this.r  = Math.random() * 1.6 + 0.4;
      this.vx = (Math.random() - 0.5) * 0.35;
      this.vy = (Math.random() - 0.5) * 0.35;
      this.alpha = Math.random() * 0.45 + 0.05;
      this.color = Math.random() > 0.5 ? '124,91,245' : '91,156,246';
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.color},${this.alpha})`;
      ctx.fill();
    }
  }

  const COUNT = Math.min(90, Math.floor(W * H / 14000));
  for (let i = 0; i < COUNT; i++) particles.push(new Particle());

  // Connect nearby particles
  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 110) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(124,91,245,${0.12 * (1 - dist / 110)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);
    drawConnections();
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(loop);
  }
  loop();
})();

/* ── NAVBAR ─────────────────────────────────────────────────── */
const navbar    = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
  document.getElementById('scrollTop').classList.toggle('visible', window.scrollY > 400);
});

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('active');
  navLinks.classList.toggle('open');
  document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
});

// Close mobile menu on link click
navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navLinks.classList.remove('open');
    document.body.style.overflow = '';
  });
});

/* ── SCROLL TOP ─────────────────────────────────────────────── */
document.getElementById('scrollTop').addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ── SMOOTH SCROLL for anchors ──────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const navH = navbar.offsetHeight;
    const top  = target.getBoundingClientRect().top + window.scrollY - navH - 12;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* ── INTERSECTION OBSERVER — scroll reveal ──────────────────── */
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right').forEach(el => {
  revealObserver.observe(el);
});

/* ── COUNTER ANIMATION ──────────────────────────────────────── */
function animateCounter(el, target, duration = 1600) {
  let start = null;
  const step = ts => {
    if (!start) start = ts;
    const progress = Math.min((ts - start) / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(ease * target);
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = target;
  };
  requestAnimationFrame(step);
}

const counterObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const nums = entry.target.querySelectorAll('.stat-num[data-target]');
      nums.forEach(el => {
        animateCounter(el, parseInt(el.dataset.target));
        delete el.dataset.target;
      });
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

const statsEl = document.querySelector('.hero-stats');
if (statsEl) counterObserver.observe(statsEl);

/* ── PORTFOLIO FILTER ────────────────────────────────────────── */
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;
    document.querySelectorAll('.portfolio-card').forEach((card, i) => {
      const show = filter === 'all' || card.dataset.category === filter;
      card.style.transition = `opacity 0.4s ease ${i * 0.05}s, transform 0.4s ease ${i * 0.05}s`;
      if (show) {
        card.style.opacity = '1';
        card.style.transform = 'scale(1)';
        card.style.pointerEvents = '';
        card.style.display = '';
      } else {
        card.style.opacity = '0';
        card.style.transform = 'scale(0.95)';
        card.style.pointerEvents = 'none';
        setTimeout(() => { if (card.style.opacity === '0') card.style.display = 'none'; }, 450);
      }
    });
  });
});

/* ── FAQ ACCORDION ───────────────────────────────────────────── */
document.querySelectorAll('.faq-question').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.parentElement;
    const isOpen = item.classList.contains('open');

    // Close all
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));

    if (!isOpen) item.classList.add('open');
  });
});

/* ── CONTACT FORM VALIDATION ─────────────────────────────────── */
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  const fields = {
    name:    { el: document.getElementById('name'),    err: document.getElementById('nameError'),    min: 2, msg: 'Unesite vaše ime (min. 2 karaktera)' },
    email:   { el: document.getElementById('email'),   err: document.getElementById('emailError'),   regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, msg: 'Unesite ispravnu email adresu' },
    service: { el: document.getElementById('service'), err: document.getElementById('serviceError'), msg: 'Izaberite uslugu' },
    message: { el: document.getElementById('message'), err: document.getElementById('messageError'), min: 10, msg: 'Poruka mora imati najmanje 10 karaktera' },
  };

  function validate(field) {
    const { el, err, min, regex, msg } = field;
    const val = el.value.trim();
    let valid = true;

    if (!val) { valid = false; }
    else if (min && val.length < min) { valid = false; }
    else if (regex && !regex.test(val)) { valid = false; }

    if (!valid) {
      el.classList.add('error');
      err.textContent = msg;
    } else {
      el.classList.remove('error');
      err.textContent = '';
    }
    return valid;
  }

  // Live validation
  Object.values(fields).forEach(f => {
    f.el.addEventListener('blur', () => validate(f));
    f.el.addEventListener('input', () => {
      if (f.el.classList.contains('error')) validate(f);
    });
  });

  contactForm.addEventListener('submit', async e => {
    e.preventDefault();
    const allValid = Object.values(fields).map(f => validate(f)).every(Boolean);
    if (!allValid) return;

    const btn     = document.getElementById('submitBtn');
    const btnText = document.getElementById('btnText');
    const btnArrow= document.getElementById('btnArrow');
    const spinner = document.getElementById('btnSpinner');
    const success = document.getElementById('formSuccess');

    btn.disabled = true;
    btnText.textContent = 'Slanje...';
    btnArrow.classList.add('hidden');
    spinner.classList.remove('hidden');

    try {
      const formData = new FormData(contactForm);
      const response = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(formData).toString(),
      });

      if (!response.ok) throw new Error('Network response was not ok');

      btn.classList.add('hidden');
      success.classList.remove('hidden');
      contactForm.reset();

      setTimeout(() => {
        btn.classList.remove('hidden');
        success.classList.add('hidden');
        btn.disabled = false;
        btnText.textContent = 'Pošalji poruku';
        btnArrow.classList.remove('hidden');
        spinner.classList.add('hidden');
      }, 6000);
    } catch {
      btn.disabled = false;
      btnText.textContent = 'Pošalji poruku';
      btnArrow.classList.remove('hidden');
      spinner.classList.add('hidden');
      alert('Greška pri slanju. Pokušaj ponovo ili me kontaktiraj direktno.');
    }
  });
}

/* ── PORTFOLIO MODAL DATA ────────────────────────────────────── */
const projects = [
  {
    title: 'Belle Éclat',
    category: 'Kozmetika',
    img: 'belle-eclat.jpg',
    biznis: 'Kozmetički salon',
    problem: 'Salon je radio isključivo na preporuke — bez ikakvog online prisustva. Klijenti nisu mogli da pronađu radno vreme, cenovnik ni kontakt na internetu, a broj novih klijenata je stagnirao.',
    solution: 'Napravljen je moderan, mobilno optimizovan sajt sa jasnom strukturom usluga i cenovnikom. Sajt se učitava ispod 2 sekunde, a dizajn je prilagođen premium estetici brenda. U prvom mesecu broj upita porastao je za 40%.',
    tags: ['HTML/CSS', 'JavaScript', 'Netlify'],
    live: 'https://bele-clat.netlify.app',
  },
  {
    title: 'Maison Ember',
    category: 'Restoran',
    img: 'maison-ember.jpg',
    biznis: 'Fine dining restoran',
    problem: 'Restoran je imao odličnu atmosferu i kuhinju, ali nikakav online identitet. Potencijalni gosti su se oslanjali isključivo na usmenu preporuku, a rezervacije su se uzimale samo telefonom — što je često rezultiralo propuštenim pozivima i izgubljenim gostima.',
    solution: 'Kreiran je elegantan sajt koji odražava premium atmosferu restorana — tamna estetika, visokokvalitetne fotografije i jasna pozivnica za rezervaciju. Uvedena je sekcija za online rezervacije i prikazan meni. Nakon lansiranja, broj rezervacija porastao je za 55% u prvom mesecu.',
    tags: ['HTML/CSS', 'JavaScript', 'Netlify'],
    live: 'https://restoran-ember.netlify.app',
  },
  {
    title: 'Mirabelle',
    category: 'Poslastičarnica',
    img: 'cakeW.png',
    biznis: 'Brendirana online poslastičarnica',
    problem: 'Cakeeren je imao jak vizuelni identitet i odlične proizvode, ali sve narudžbine su išle preko DM-ova na Instagramu — haotično, sporo, bez pregleda šta je naručeno i kad. Klijenti su često odustajali jer nije bilo jasnog cenovnika ni načina da naruče na licu mesta.',
    solution: 'Napravljen je sajt koji funkcioniše kao digitalna vitrina i narudžbenica u isto vreme. Svaki proizvod ima svoju stranicu sa fotografijom, opisom i cenom. Narudžbine stižu direktno na email — bez posrednika, bez konfuzije. Dizajn je topao, sladak i potpuno u skladu sa brendom.',
    tags: ['HTML/CSS', 'JavaScript', 'Netlify'],
    live: 'https://kaizennnnnnnnn.github.io/CAKEEREN/',
  },
  {
    title: 'Forma Studio',
    category: 'Nameštaj',
    img: 'furnitureW.png',
    biznis: 'Prodavnica nameštaja i enterijera',
    problem: 'Prodavnica je imala odličan showroom, ali niko ko pretražuje nameštaj online nije ni znao da postoji. Bez sajta, sav potencijalni promet je odlazio kod konkurencije koja je imala online prisustvo — bez obzira na kvalitet proizvoda.',
    solution: 'Kreiran je elegantan sajt koji odražava premium osećaj brenda — tamna paleta, velike fotografije, čist layout. Svaka kolekcija je prikazana sa fokusom na detalje i materijale. Posetioci odmah vide šta prodavnica nudi i lako stupaju u kontakt ili zakazuju posetu showroom-u.',
    tags: ['HTML/CSS', 'JavaScript', 'Netlify'],
    live: 'https://kaizennnnnnnnn.github.io/furniture-website/',
  },
];

window.openModal = function(index) {
  const p = projects[index];
  const overlay = document.getElementById('modalOverlay');
  const content = document.getElementById('modalContent');

  const imgHTML = p.img
    ? `<img src="${p.img}" alt="${p.title}" style="width:100%;display:block;object-fit:cover;object-position:top;border-radius:12px;" />`
    : `<div style="width:100%;background:${p.gradient || 'linear-gradient(135deg,#6366f1,#8b5cf6)'};border-radius:12px;
        display:flex;align-items:center;justify-content:center;min-height:220px;">
        <div style="opacity:.35;display:flex;flex-direction:column;gap:10px;width:55%;">
          <div style="height:10px;background:rgba(255,255,255,.7);border-radius:999px;"></div>
          <div style="height:10px;background:rgba(255,255,255,.7);border-radius:999px;width:65%;"></div>
          <div style="height:60px;background:rgba(255,255,255,.3);border-radius:8px;margin-top:4px;"></div>
        </div>
      </div>`;

  content.innerHTML = `
    <div class="modal-img">
      ${imgHTML}
    </div>
    <div class="modal-category">${p.category}</div>
    <h2>${p.title}</h2>
    <p><strong>Vrsta biznisa:</strong> ${p.biznis}</p>
    <div class="modal-problem">
      <p><strong>Problem:</strong> ${p.problem}</p>
    </div>
    <div class="modal-solution">
      <p><strong>Rešenje:</strong> ${p.solution}</p>
    </div>
    <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:16px;margin-bottom:4px;">
      ${p.tags.map(t => `<span style="font-size:.75rem;padding:4px 12px;border-radius:999px;
        background:rgba(124,91,245,.1);border:1px solid rgba(124,91,245,.2);
        color:#7c5bf5;font-weight:600;">${t}</span>`).join('')}
    </div>
    <div class="modal-actions">
      ${p.live !== '#' ? `<a href="${p.live}" class="btn btn-primary" target="_blank">Live Demo →</a>` : ''}
      <button onclick="closeModal()" class="btn btn-ghost">Zatvori</button>
    </div>
  `;

  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
};

window.closeModal = function() {
  document.getElementById('modalOverlay').classList.remove('open');
  document.body.style.overflow = '';
};

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') window.closeModal();
});

/* ── TILT EFFECT on portfolio cards ─────────────────────────── */
if (window.matchMedia('(pointer: fine)').matches) {
  document.querySelectorAll('.portfolio-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const cx   = rect.left + rect.width  / 2;
      const cy   = rect.top  + rect.height / 2;
      const rx   = ((e.clientY - cy) / (rect.height / 2)) * 4;
      const ry   = ((e.clientX - cx) / (rect.width  / 2)) * -4;
      card.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-6px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

/* ── ACTIVE NAV LINK on scroll ──────────────────────────────── */
const sections = document.querySelectorAll('section[id]');
const navItems = document.querySelectorAll('.nav-link:not(.nav-cta)');

const activeObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.getAttribute('id');
      navItems.forEach(link => {
        link.style.color = link.getAttribute('href') === `#${id}` ? 'var(--text)' : '';
      });
    }
  });
}, { threshold: 0.35 });

sections.forEach(s => activeObserver.observe(s));

/* ── RIPPLE EFFECT on buttons ────────────────────────────────── */
document.querySelectorAll('.btn-primary').forEach(btn => {
  btn.addEventListener('click', function(e) {
    const rect   = this.getBoundingClientRect();
    const ripple = document.createElement('span');
    const size   = Math.max(rect.width, rect.height) * 2;
    ripple.style.cssText = `
      position:absolute;width:${size}px;height:${size}px;
      left:${e.clientX - rect.left - size/2}px;
      top:${e.clientY - rect.top - size/2}px;
      background:rgba(255,255,255,0.2);border-radius:50%;
      transform:scale(0);animation:ripple 0.6s linear;
      pointer-events:none;
    `;
    this.appendChild(ripple);
    setTimeout(() => ripple.remove(), 700);
  });
});

// Inject ripple keyframe
const style = document.createElement('style');
style.textContent = '@keyframes ripple{to{transform:scale(1);opacity:0;}}';
document.head.appendChild(style);

/* ── TYPING EFFECT (hero subtitle accent) ─────────────────────
   Optional — subtle text shimmer on hover over gradient text    */
document.querySelectorAll('.gradient-text').forEach(el => {
  el.addEventListener('mouseenter', () => {
    el.style.backgroundSize = '200% 100%';
    el.style.animation = 'shimmer 1.2s ease forwards';
  });
  el.addEventListener('mouseleave', () => {
    el.style.animation = '';
  });
});

const shimmerStyle = document.createElement('style');
shimmerStyle.textContent = `
  @keyframes shimmer {
    0%   { background-position: 0% 50%; }
    50%  { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
`;
document.head.appendChild(shimmerStyle);

/* ── PAGE LOAD animation ─────────────────────────────────────── */
window.addEventListener('load', () => {
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity 0.5s ease';
  requestAnimationFrame(() => {
    document.body.style.opacity = '1';
  });
});

console.log('%c Asevin Studio ⚡', 'color:#7c5bf5;font-size:20px;font-weight:800;');
console.log('%c Built by Jovan Špinjo', 'color:#94a3b8;font-size:13px;');
