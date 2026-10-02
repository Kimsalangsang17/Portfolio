(function () {
  const canvas = document.getElementById('net');
  const heroEl = document.getElementById('hero');

  if (!canvas || !heroEl) return;

  const ctx = canvas.getContext('2d');
  let w;
  let h;
  let dpr;

  const colorDot = [
    'rgb(81, 162, 233)',
    'rgb(81, 162, 233)',
    'rgb(81, 162, 233)',
    'rgb(81, 162, 233)',
    'rgb(255, 77, 90)'
  ];

  const mouse = { x: -9999, y: -9999, active: false };
  let dotsConfig;
  let dots = [];
  let stars = [];

  function getDotsConfig(windowSize) {
    if (windowSize > 1600) return { nb: 220, distance: 70, d_radius: 300 };
    if (windowSize > 1300) return { nb: 190, distance: 60, d_radius: 280 };
    if (windowSize > 1100) return { nb: 160, distance: 55, d_radius: 250 };
    if (windowSize > 800) return { nb: 110, distance: 0, d_radius: 0 };
    if (windowSize > 600) return { nb: 80, distance: 0, d_radius: 0 };
    return { nb: 50, distance: 0, d_radius: 0 };
  }

  function makeDot(isFirst) {
    return {
      x: Math.random() * w,
      y: Math.random() * h,
      vx: -0.5 + Math.random(),
      vy: -0.5 + Math.random(),
      radius: isFirst ? 1.5 : Math.random() * 1.5,
      colour: isFirst ? 'rgb(81, 162, 233)' : colorDot[Math.floor(Math.random() * colorDot.length)]
    };
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    dotsConfig = getDotsConfig(window.innerWidth);
    dots = [];
    for (let i = 0; i < dotsConfig.nb; i++) {
      dots.push(makeDot(i === 0));
    }

    mouse.x = w / 2;
    mouse.y = h / 2;
  }

  function drawDot(dot) {
    ctx.beginPath();
    ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2, false);

    const dotDistance = Math.hypot(dot.x - mouse.x, dot.y - mouse.y);
    const distanceRatio = dotDistance / (window.innerWidth / 1.7);
    const alpha = Math.max(0, 1 - distanceRatio);

    ctx.fillStyle = dot.colour.slice(0, -1) + `,${alpha})`;
    ctx.fill();
  }

  function updateDots() {
    for (let i = 1; i < dots.length; i++) {
      const dot = dots[i];

      if (dot.y < 0 || dot.y > h) dot.vy = -dot.vy;
      if (dot.x < 0 || dot.x > w) dot.vx = -dot.vx;

      dot.x += dot.vx;
      dot.y += dot.vy;
    }

    dots[0].x = mouse.x;
    dots[0].y = mouse.y;
  }

  function drawLines() {
    if (!dotsConfig.distance) return;

    for (let i = 0; i < dots.length; i++) {
      for (let j = i + 1; j < dots.length; j++) {
        const a = dots[i];
        const b = dots[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;

        if (Math.abs(dx) < dotsConfig.distance && Math.abs(dy) < dotsConfig.distance) {
          const distFromMouse = Math.hypot(a.x - mouse.x, a.y - mouse.y);

          if (distFromMouse < dotsConfig.d_radius) {
            let ratio = distFromMouse / dotsConfig.d_radius - 0.3;
            if (ratio < 0) ratio = 0;

            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.lineWidth = 0.3;
            ctx.strokeStyle = `rgba(81, 162, 233, ${1 - ratio})`;
            ctx.stroke();
          }
        }
      }
    }
  }

  function spawnStarsAtCursor() {
    const spawnCount = 2 + Math.floor(Math.random() * 3);

    for (let i = 0; i < spawnCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 30;
      stars.push({
        x: mouse.x + Math.cos(angle) * radius,
        y: mouse.y + Math.sin(angle) * radius,
        r: Math.random() * 1.3 + 0.3,
        tw: Math.random() * Math.PI * 2,
        speed: 0.02 + Math.random() * 0.03,
        life: 1,
        decay: 0.02 + Math.random() * 0.02,
        hue: Math.random() < 0.15
          ? 'rgba(255,77,90,'
          : 'rgba(81,162,233,'
      });
    }

    if (stars.length > 200) stars.splice(0, stars.length - 200);
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

  function frame() {
    ctx.clearRect(0, 0, w, h);

    updateDots();
    drawLines();
    dots.forEach(drawDot);
    drawStars();

    requestAnimationFrame(frame);
  }

  heroEl.addEventListener('mousemove', (event) => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
    mouse.active = true;
    spawnStarsAtCursor();
  });

  heroEl.addEventListener('mouseleave', () => {
    mouse.active = false;
  });

  heroEl.addEventListener('touchmove', (event) => {
    if (event.touches[0]) {
      mouse.x = event.touches[0].clientX;
      mouse.y = event.touches[0].clientY;
      spawnStarsAtCursor();
    }
  }, { passive: true });

  window.addEventListener('resize', resize);
  resize();
  requestAnimationFrame(frame);
})();

(function () {
  const canvas = document.querySelector('.canvas-2');
  const wrapper = document.querySelector('.bg-wrapper');

  if (!canvas || !wrapper) return;

  const ctx = canvas.getContext('2d');
  const colorDot = [
    'rgb(81, 162, 233)',
    'rgb(81, 162, 233)',
    'rgb(81, 162, 233)',
    'rgb(255, 77, 90)'
  ];

  let dots = [];
  let dotsCount;

  function getDotsCount(windowSize) {
    if (windowSize > 1600) return 100;
    if (windowSize > 1300) return 75;
    if (windowSize > 1100) return 50;
    return 0;
  }

  function makeDot() {
    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: -0.5 + Math.random(),
      vy: -0.5 + Math.random(),
      radius: Math.random() * 1.5,
      colour: colorDot[Math.floor(Math.random() * colorDot.length)]
    };
  }

  function resize() {
    canvas.width = wrapper.scrollWidth;
    canvas.height = wrapper.scrollHeight;

    dotsCount = getDotsCount(window.innerWidth);
    dots = [];
    for (let i = 0; i < dotsCount; i++) {
      dots.push(makeDot());
    }
  }

  function drawDot(dot) {
    ctx.beginPath();
    ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = dot.colour.slice(0, -1) + ',0.6)';
    ctx.fill();
  }

  function updateDots() {
    for (const dot of dots) {
      if (dot.y < 0 || dot.y > canvas.height) dot.vy = -dot.vy;
      if (dot.x < 0 || dot.x > canvas.width) dot.vx = -dot.vx;

      dot.x += dot.vx;
      dot.y += dot.vy;
    }
  }

  function frame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    updateDots();
    dots.forEach(drawDot);

    requestAnimationFrame(frame);
  }

  window.addEventListener('resize', resize);
  resize();
  requestAnimationFrame(frame);
})();

const aboutLink = document.querySelector('a.heading__link[href="#about"]');
const navigationBar = document.querySelector('.navigation-bar');
const heroSection = document.querySelector('#hero');

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
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveNavigationLink(entry.target);
        }
      });
    },
    { threshold: 0, rootMargin: '-45% 0px -45% 0px' }
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

const contactForm = document.querySelector('.contact__form');

if (contactForm) {
  const submitButton = contactForm.querySelector('#form-submit');
  const formStatus = contactForm.querySelector('.contact__form-status');

  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Sending...';
    }
    if (formStatus) formStatus.textContent = '';

    try {
      const response = await fetch(contactForm.action, {
        method: 'POST',
        body: new FormData(contactForm),
        headers: { Accept: 'application/json' }
      });

      if (!response.ok) throw new Error('Form submission failed.');

      contactForm.reset();
      if (formStatus) formStatus.textContent = 'Your message has been sent.';
    } catch {
      if (formStatus) formStatus.textContent = 'Could not send your message. Please try again.';
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = 'Submit';
      }
    }
  });
}