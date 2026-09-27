(function () {
  const canvas = document.getElementById('net');

  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let w;
  let h;
  let dpr;
  let particles = [];
  let stars = [];

  const mouse = { x: -9999, y: -9999, active: false };
  const linkDistance = 130;
  const mouseLinkDistance = 180;
  const mouseRepelDistance = 140;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    initParticles();
  }

  function initParticles() {
    const area = w * h;
    const count = Math.min(140, Math.max(50, Math.round(area / 14000)));
    particles = [];

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        r: Math.random() * 1.6 + 0.6
      });
    }
  }

  function spawnStarsAtCursor() {
    const spawnCount = 2 + Math.floor(Math.random() * 3);

    for (let i = 0; i < spawnCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 140;
      stars.push({
        x: mouse.x + Math.cos(angle) * radius,
        y: mouse.y + Math.sin(angle) * radius,
        r: Math.random() * 1.3 + 0.3,
        tw: Math.random() * Math.PI * 2,
        speed: 0.02 + Math.random() * 0.03,
        life: 1,
        decay: 0.004 + Math.random() * 0.006,
        hue: Math.random() < 0.15
          ? 'rgba(240,104,126,'
          : Math.random() < 0.5
            ? 'rgba(255,255,255,'
            : 'rgba(120,170,220,'
      });
    }

    if (stars.length > 400) stars.splice(0, stars.length - 400);
  }

  function drawStars() {
    for (let i = stars.length - 1; i >= 0; i--) {
      const star = stars[i];
      star.tw += star.speed;
      star.life -= star.decay;

      if (star.life <= 0) {
        stars.splice(i, 1);
        continue;
      }

      const twinkle = 0.5 + Math.sin(star.tw) * 0.5;
      const alpha = star.life * twinkle;
      ctx.beginPath();
      ctx.fillStyle = `${star.hue}${Math.max(0, alpha).toFixed(2)})`;
      ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function updateMouse(x, y) {
    mouse.x = x;
    mouse.y = y;
    mouse.active = true;
    spawnStarsAtCursor();
  }

  window.addEventListener('mousemove', (event) => {
    updateMouse(event.clientX, event.clientY);
  });

  window.addEventListener('mouseleave', () => {
    mouse.active = false;
  });

  window.addEventListener('touchmove', (event) => {
    if (event.touches[0]) {
      updateMouse(event.touches[0].clientX, event.touches[0].clientY);
    }
  }, { passive: true });

  window.addEventListener('touchend', () => {
    mouse.active = false;
  });

  function frame() {
    ctx.clearRect(0, 0, w, h);
    drawStars();

    for (const particle of particles) {
      particle.x += particle.vx;
      particle.y += particle.vy;

      if (particle.x < 0 || particle.x > w) particle.vx *= -1;
      if (particle.y < 0 || particle.y > h) particle.vy *= -1;

      if (mouse.active) {
        const dx = particle.x - mouse.x;
        const dy = particle.y - mouse.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < mouseRepelDistance && distance > 0.01) {
          const force = (mouseRepelDistance - distance) / mouseRepelDistance;
          particle.x += (dx / distance) * force * 1.6;
          particle.y += (dy / distance) * force * 1.6;
        }
      }
    }

    ctx.lineWidth = 1;

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const first = particles[i];
        const second = particles[j];
        const distance = Math.hypot(first.x - second.x, first.y - second.y);

        if (distance < linkDistance) {
          ctx.strokeStyle = `rgba(111,168,220,${(1 - distance / linkDistance) * 0.35})`;
          ctx.beginPath();
          ctx.moveTo(first.x, first.y);
          ctx.lineTo(second.x, second.y);
          ctx.stroke();
        }
      }
    }

    if (mouse.active) {
      for (const particle of particles) {
        const distance = Math.hypot(particle.x - mouse.x, particle.y - mouse.y);

        if (distance < mouseLinkDistance) {
          ctx.strokeStyle = `rgba(240,104,126,${(1 - distance / mouseLinkDistance) * 0.55})`;
          ctx.beginPath();
          ctx.moveTo(mouse.x, mouse.y);
          ctx.lineTo(particle.x, particle.y);
          ctx.stroke();
        }
      }

      const gradient = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 8);
      gradient.addColorStop(0, 'rgba(17, 7, 9, 0.9)');
      gradient.addColorStop(1, 'rgba(240,104,126,0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, 8, 0, Math.PI * 2);
      ctx.fill();
    }

    for (const particle of particles) {
      ctx.beginPath();
      ctx.fillStyle = 'rgba(140,190,235,0.85)';
      ctx.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2);
      ctx.fill();
    }

    requestAnimationFrame(frame);
  }

  window.addEventListener('resize', resize);
  resize();
  requestAnimationFrame(frame);
})();

const aboutLink = document.querySelector('a.heading__link[href="#about"]');
const navigationBar = document.querySelector('.navigation-bar');
const heroSection = document.querySelector('#hero');

// --- Nav bar visibility: passive but always shown once past Home ---
if (navigationBar && heroSection) {
  const navVisibilityObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        navigationBar.classList.toggle('navigation-bar--visible', entry.intersectionRatio < 0.6);
      });
    },
    { threshold: [0, 0.6, 1] }
  );

  navVisibilityObserver.observe(heroSection);
}

// --- Active nav link highlighting: IntersectionObserver-based (no longer scrollY-dependent) ---
const navigationLinks = [...document.querySelectorAll('.navigation__item a')];
const sectionLinks = navigationLinks
  .map((link) => ({
    link,
    section: document.querySelector(link.getAttribute('href'))
  }))
  .filter(({ section }) => section);

function setActiveNavigationLink(activeSection) {
  sectionLinks.forEach(({ link, section }) => {
    link.parentElement.classList.toggle('navigation__item--active', section === activeSection);
  });
}

if (sectionLinks.length) {
  const activeSectionObserver = new IntersectionObserver(
    (entries) => {
      // pick the entry most visible in the viewport right now
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (visible) {
        setActiveNavigationLink(visible.target);
      }
    },
    { threshold: [0.25, 0.5, 0.75], rootMargin: '-30% 0px -30% 0px' }
  );

  sectionLinks.forEach(({ section }) => activeSectionObserver.observe(section));
}

if (aboutLink) {
  aboutLink.addEventListener('click', function (e) {
    e.preventDefault();

    const targetId = this.getAttribute('href');
    const targetElement = document.querySelector(targetId);

    if (targetElement) {
      targetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });

      history.pushState(null, '', targetId);
    }
  });
}

document.querySelectorAll('[data-carousel]').forEach((carousel) => {
  const slides = [...carousel.querySelectorAll('.project-carousel__slide')];
  let activeIndex = 0;

  if (!slides.length) return;

  function showSlide(index) {
    activeIndex = (index + slides.length) % slides.length;

    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle('project-carousel__slide--active', slideIndex === activeIndex);
    });
  }

  showSlide(0);
  window.setInterval(() => showSlide(activeIndex + 1), 3000);
});