(() => {
  'use strict';

  const pages = [...document.querySelectorAll('[data-page]')];
  const navItems = [...document.querySelectorAll('[data-target]')];
  const modal = document.getElementById('moduleModal');
  const modalTitle = document.getElementById('modalTitle');
  const storageKey = 'kitchenos-v5-foundation';

  function showPage(pageName) {
    pages.forEach(page => page.classList.toggle('active', page.dataset.page === pageName));
    navItems.forEach(item => item.classList.toggle('active', item.dataset.target === pageName));
    localStorage.setItem(storageKey, JSON.stringify({ page: pageName }));
  }

  function openModule(name) {
    modalTitle.textContent = name;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
  }

  function closeModal() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
  }

  navItems.forEach(item => item.addEventListener('click', () => showPage(item.dataset.target)));
  document.querySelector('[data-open-work]').addEventListener('click', () => showPage('work'));
  document.querySelectorAll('[data-module]').forEach(button => button.addEventListener('click', () => openModule(button.dataset.module)));
  document.querySelectorAll('[data-close-modal]').forEach(button => button.addEventListener('click', closeModal));

  document.getElementById('resetDemo').addEventListener('click', () => {
    localStorage.removeItem(storageKey);
    showPage('dashboard');
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeModal();
  });

  const today = new Intl.DateTimeFormat(undefined, {
    weekday: 'long', day: 'numeric', month: 'long'
  }).format(new Date());
  document.getElementById('todayLabel').textContent = today;

  let savedPage = 'dashboard';
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    if (saved?.page && pages.some(page => page.dataset.page === saved.page)) savedPage = saved.page;
  } catch (_) {
    localStorage.removeItem(storageKey);
  }
  showPage(savedPage);
})();
