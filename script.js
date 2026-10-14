const body = document.body;
const themeSwitcher = document.getElementById('themeSwitcher');
const themeSwitcherIcon = document.getElementById('themeSwitcherIcon');
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');

function readSavedTheme() {
  try {
    return localStorage.getItem('portfolio-theme');
  } catch (e) {
    return null;
  }
}

function prefersLight() {
  return Boolean(window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches);
}

// The icon and label show the theme a click switches to, not the current one.
function applyTheme(theme) {
  const isLight = theme === 'light';
  body.classList.toggle('light-theme', isLight);
  themeSwitcherIcon.textContent = isLight ? '🌙' : '☀️';
  themeSwitcher.setAttribute('aria-label', isLight ? 'Switch to dark theme' : 'Switch to light theme');
}

// Follow the visitor's device setting until they pick a theme themselves.
applyTheme(readSavedTheme() || (prefersLight() ? 'light' : 'dark'));

themeSwitcher?.addEventListener('click', () => {
  const nextTheme = body.classList.contains('light-theme') ? 'dark' : 'light';
  applyTheme(nextTheme);
  try {
    localStorage.setItem('portfolio-theme', nextTheme);
  } catch (e) {}
});

navToggle?.addEventListener('click', () => {
  const expanded = navToggle.getAttribute('aria-expanded') === 'true';
  navToggle.setAttribute('aria-expanded', String(!expanded));
  navMenu.classList.toggle('open');
});

document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', event => {
    const href = link.getAttribute('href');
    if (!href || href === '#') return;

    const target = document.querySelector(href);
    if (!target) return;

    event.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    navMenu?.classList.remove('open');
    navToggle?.setAttribute('aria-expanded', 'false');
  });
});

// Highlight the nav link for the section currently on screen.
const navLinks = [...document.querySelectorAll('#navMenu a[href^="#"]')];

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      navLinks.forEach(link => {
        const isCurrent = link.getAttribute('href') === `#${entry.target.id}`;
        link.classList.toggle('active', isCurrent);
        if (isCurrent) {
          link.setAttribute('aria-current', 'true');
        } else {
          link.removeAttribute('aria-current');
        }
      });
    });
  }, { rootMargin: '-45% 0px -50% 0px' });

  document.querySelectorAll('main section[id]').forEach(section => observer.observe(section));
}
