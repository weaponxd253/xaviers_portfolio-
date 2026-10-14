const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf8');

function loadPage() {
  document.documentElement.innerHTML = new DOMParser()
    .parseFromString(html, 'text/html')
    .documentElement.innerHTML;
  localStorage.clear();
  jest.isolateModules(() => require('./script'));
}

describe('Portfolio page', () => {
  beforeEach(loadPage);

  test('has every main section', () => {
    ['home', 'about', 'work', 'skills', 'projects', 'contact'].forEach(id => {
      expect(document.getElementById(id)).not.toBeNull();
    });
  });

  test('every in-page nav link points at an existing section', () => {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      const id = link.getAttribute('href').slice(1);
      expect(document.getElementById(id)).not.toBeNull();
    });
  });

  test('every local image and document exists', () => {
    const localRefs = [
      ...[...document.querySelectorAll('img')].map(img => img.getAttribute('src')),
      ...[...document.querySelectorAll('a[href]')]
        .map(a => a.getAttribute('href'))
        .filter(href => !/^(https?:|mailto:|#)/.test(href)),
    ];
    expect(localRefs.length).toBeGreaterThan(0);
    localRefs.forEach(ref => {
      expect(fs.existsSync(path.resolve(__dirname, ref))).toBe(true);
    });
  });

  test('resume download points at a PDF', () => {
    const resume = document.querySelector('a[download]');
    expect(resume.getAttribute('href')).toMatch(/\.pdf$/);
  });

  test('external links open safely in a new tab', () => {
    document.querySelectorAll('a[target="_blank"]').forEach(link => {
      expect(link.getAttribute('rel')).toContain('noopener');
    });
  });

  test('every image has alt text', () => {
    document.querySelectorAll('img').forEach(img => {
      expect(img.getAttribute('alt')).toBeTruthy();
    });
  });
});

describe('Interactions', () => {
  beforeEach(loadPage);

  afterEach(() => {
    delete window.matchMedia;
  });

  test('theme follows the device setting until the visitor picks one', () => {
    window.matchMedia = query => ({ matches: query === '(prefers-color-scheme: light)' });
    loadPage();

    expect(document.body.classList.contains('light-theme')).toBe(true);
    expect(localStorage.getItem('portfolio-theme')).toBeNull();
  });

  test('theme icon and label describe what a click will do', () => {
    const switcher = document.getElementById('themeSwitcher');
    const icon = document.getElementById('themeSwitcherIcon');
    expect(icon.textContent).toBe('☀️');
    expect(switcher.getAttribute('aria-label')).toBe('Switch to light theme');

    switcher.click();
    expect(icon.textContent).toBe('🌙');
    expect(switcher.getAttribute('aria-label')).toBe('Switch to dark theme');
  });

  test('theme switcher toggles light mode and remembers it', () => {
    const switcher = document.getElementById('themeSwitcher');
    expect(document.body.classList.contains('light-theme')).toBe(false);
    expect(localStorage.getItem('portfolio-theme')).toBeNull();

    switcher.click();
    expect(document.body.classList.contains('light-theme')).toBe(true);
    expect(localStorage.getItem('portfolio-theme')).toBe('light');

    switcher.click();
    expect(document.body.classList.contains('light-theme')).toBe(false);
    expect(localStorage.getItem('portfolio-theme')).toBe('dark');
  });

  test('mobile nav toggle opens and closes the menu', () => {
    const toggle = document.getElementById('navToggle');
    const menu = document.getElementById('navMenu');

    toggle.click();
    expect(menu.classList.contains('open')).toBe(true);
    expect(toggle.getAttribute('aria-expanded')).toBe('true');

    toggle.click();
    expect(menu.classList.contains('open')).toBe(false);
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
  });
});
