/**
 * =======================================
 * Glory Strategic Alliance — Main JS
 * =======================================
 */

/* --- Sticky Nav Scroll Transition --- */
const navbar = document.querySelector('.navbar');
const hamburger = document.querySelector('.hamburger');
const mobileNav = document.querySelector('.mobile-nav');
const navOverlay = document.querySelector('.nav-overlay');

window.addEventListener('scroll', () => {
  if (window.scrollY > 80) {
    navbar?.classList.add('scrolled');
  } else {
    navbar?.classList.remove('scrolled');
  }
});

// Trigger on load for inner pages
if (window.scrollY > 80) {
  navbar?.classList.add('scrolled');
}

// Inner pages always show solid nav
if (document.body.dataset.page && document.body.dataset.page !== 'home') {
  navbar?.classList.add('scrolled');
}

/* --- Hamburger Menu --- */
function openMobileNav() {
  hamburger?.classList.add('open');
  hamburger?.setAttribute('aria-expanded', 'true');
  mobileNav?.classList.add('open');
  navOverlay?.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeMobileNav() {
  hamburger?.classList.remove('open');
  hamburger?.setAttribute('aria-expanded', 'false');
  mobileNav?.classList.remove('open');
  navOverlay?.classList.remove('open');
  document.body.style.overflow = '';
}

hamburger?.addEventListener('click', () => {
  if (mobileNav?.classList.contains('open')) {
    closeMobileNav();
  } else {
    openMobileNav();
  }
});

navOverlay?.addEventListener('click', closeMobileNav);

// Close on nav link click
document.querySelectorAll('.mobile-nav a').forEach(link => {
  link.addEventListener('click', closeMobileNav);
});

/* --- Active Nav Link --- */
function setActiveNav() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-nav a').forEach(link => {
    const href = link.getAttribute('href') || '';
    if (href === currentPage || (currentPage === 'index.html' && href === 'index.html')) {
      link.classList.add('active');
    }
    if (currentPage === '' && href === 'index.html') {
      link.classList.add('active');
    }
  });
}
setActiveNav();

/* --- Scroll Reveal (IntersectionObserver) --- */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* --- Counter Animation (Hero Stats) --- */
function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  const suffix = el.dataset.suffix || '';
  const duration = 2000;
  const start = performance.now();

  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    const current = Math.round(eased * target);
    el.textContent = current + suffix;
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.hero-stat-number[data-target]').forEach(el => {
  counterObserver.observe(el);
});

/* --- Contact Form AJAX Submit --- */
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formStatus = document.getElementById('formStatus');
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;

    submitBtn.innerHTML = '<span>Sending…</span>';
    submitBtn.disabled = true;

    try {
      const response = await fetch('contact.php', {
        method: 'POST',
        body: new FormData(contactForm),
      });

      const result = await response.json();

      formStatus.className = 'form-status ' + (result.success ? 'success' : 'error');
      formStatus.textContent = result.message;

      if (result.success) {
        contactForm.reset();
      }
    } catch {
      formStatus.className = 'form-status error';
      formStatus.textContent = 'Something went wrong. Please try again or email us directly.';
    } finally {
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    }
  });
}

/* --- Smooth scroll for anchor links --- */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
