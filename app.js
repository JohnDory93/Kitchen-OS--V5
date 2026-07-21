(() => {
  'use strict';

  const STORAGE_KEY = 'kitchenos-v5.1-workspaces';
  const MODE_KEY = 'kitchenos-v5.1-mode';

  const defaults = {
    kitchen: [
      { id:'temperature', name:'Temperature', symbol:'°', description:'Opening, closing and checks', enabled:true, status:'2 open' },
      { id:'cleaning', name:'Cleaning', symbol:'✦', description:'Daily and scheduled cleaning', enabled:true, status:'1 late', late:true },
      { id:'deliveries', name:'Deliveries', symbol:'↓', description:'Receive and verify goods', enabled:true, status:'Today' },
      { id:'cooking', name:'Cooking', symbol:'◒', description:'Cooking temperature records', enabled:true, status:'Ready' },
      { id:'cooling', name:'Cooling', symbol:'❄', description:'Cooling and blast-chill records', enabled:true, status:'Ready' },
      { id:'prep', name:'Prep List', symbol:'≡', description:'What needs preparing today', enabled:true, status:'6 items' },
      { id:'maintenance', name:'Maintenance', symbol:'◇', description:'Report an operational issue', enabled:true, status:'1 open' },
      { id:'handover', name:'Handover', symbol:'↗', description:'Only relevant shift information', enabled:true, status:'New' }
    ],
    service: [
      { id:'opening', name:'Opening', symbol:'↗', description:'Opening checklist', enabled:true, status:'1 open' },
      { id:'cleaning', name:'Cleaning', symbol:'✦', description:'Daily and scheduled cleaning', enabled:true, status:'Ready' },
      { id:'temperature', name:'Temperature', symbol:'°', description:'Display and service fridges', enabled:true, status:'Ready' },
      { id:'closing', name:'Closing', symbol:'↘', description:'Closing checklist', enabled:true, status:'Later' },
      { id:'handover', name:'Handover', symbol:'↗', description:'Relevant shift information', enabled:true, status:'New' },
      { id:'maintenance', name:'Maintenance', symbol:'◇', description:'Report an operational issue', enabled:true, status:'Ready' }
    ]
  };

  let state = loadState();
  let mode = localStorage.getItem(MODE_KEY) || 'manager';
  if (!['manager','kitchen','service'].includes(mode)) mode = 'manager';

  const appShell = document.getElementById('appShell');
  const pages = [...document.querySelectorAll('[data-page]')];
  const navItems = [...document.querySelectorAll('[data-target]')];
  const modeChip = document.getElementById('modeChip');
  const modeMenu = document.getElementById('modeMenu');
  const modeChipLabel = document.getElementById('modeChipLabel');
  const workspaceSubtitle = document.getElementById('workspaceSubtitle');
  const moduleModal = document.getElementById('moduleModal');
  const reportModal = document.getElementById('reportModal');
  const toast = document.getElementById('toast');
  let currentModule = null;

  function cloneDefaults() { return JSON.parse(JSON.stringify(defaults)); }
  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (saved?.kitchen && saved?.service) return saved;
    } catch (_) {}
    return cloneDefaults();
  }
  function saveState() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }

  function showPage(name) {
    pages.forEach(page => page.classList.toggle('active', page.dataset.page === name));
    navItems.forEach(item => item.classList.toggle('active', item.dataset.target === name));
  }

  function setMode(nextMode) {
    mode = nextMode;
    localStorage.setItem(MODE_KEY, mode);
    appShell.dataset.mode = mode;
    modeChipLabel.textContent = `${mode[0].toUpperCase()}${mode.slice(1)} preview`;
    workspaceSubtitle.textContent = mode === 'manager' ? 'Manager control centre' : `${mode[0].toUpperCase()}${mode.slice(1)} workspace`;
    closeModeMenu();
    showPage(mode === 'manager' ? 'dashboard' : mode);
  }

  function renderModules(department) {
    const container = document.getElementById(`${department}Modules`);
    const modules = state[department].filter(item => item.enabled);
    container.innerHTML = modules.map(item => `
      <button class="module-card" data-open-module="${department}" data-module-id="${escapeHtml(item.id)}">
        <span class="module-status ${item.late ? 'late' : ''}">${escapeHtml(item.status || 'Ready')}</span>
        <span class="module-symbol">${escapeHtml(item.symbol)}</span>
        <strong>${escapeHtml(item.name)}</strong>
        <small>${escapeHtml(item.description)}</small>
      </button>`).join('');
    container.querySelectorAll('[data-open-module]').forEach(button => button.addEventListener('click', () => openModule(department, button.dataset.moduleId)));
  }

  function renderEditors() {
    ['kitchen','service'].forEach(department => {
      const editor = document.getElementById(`${department}Editor`);
      editor.innerHTML = state[department].map((item, index) => `
        <div class="module-toggle-row">
          <span class="mini-symbol">${escapeHtml(item.symbol)}</span>
          <span><strong>${escapeHtml(item.name)}</strong><small>Position ${index + 1}</small></span>
          <label class="switch"><input type="checkbox" data-toggle-module="${department}" data-module-id="${escapeHtml(item.id)}" ${item.enabled ? 'checked' : ''}><span class="slider"></span></label>
        </div>`).join('');
      editor.querySelectorAll('[data-toggle-module]').forEach(input => input.addEventListener('change', () => {
        const item = state[department].find(module => module.id === input.dataset.moduleId);
        if (item) item.enabled = input.checked;
        saveState(); renderModules(department); showToast(`${item?.name || 'Module'} ${input.checked ? 'shown' : 'hidden'} in ${department}`);
      }));
    });
  }

  function openModule(department, id) {
    const item = state[department].find(module => module.id === id);
    if (!item) return;
    currentModule = item;
    document.getElementById('modalSymbol').textContent = item.symbol;
    document.getElementById('modalEyebrow').textContent = `${department} workflow`;
    document.getElementById('modalTitle').textContent = item.name;
    document.getElementById('modalDescription').textContent = `${item.description}. This is the workspace architecture; the complete ${item.name.toLowerCase()} flow will be built next.`;
    openModal(moduleModal);
  }

  function openModal(modal) { modal.classList.add('open'); modal.setAttribute('aria-hidden','false'); }
  function closeModal(modal) { modal.classList.remove('open'); modal.setAttribute('aria-hidden','true'); }
  function openModeMenu() { modeMenu.classList.add('open'); modeMenu.setAttribute('aria-hidden','false'); modeChip.setAttribute('aria-expanded','true'); }
  function closeModeMenu() { modeMenu.classList.remove('open'); modeMenu.setAttribute('aria-hidden','true'); modeChip.setAttribute('aria-expanded','false'); }
  function showToast(message) { toast.textContent = message; toast.classList.add('show'); clearTimeout(showToast.timer); showToast.timer = setTimeout(() => toast.classList.remove('show'), 1800); }
  function escapeHtml(value) { return String(value).replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[char])); }

  navItems.forEach(item => item.addEventListener('click', () => showPage(item.dataset.target)));
  document.querySelectorAll('[data-go-page]').forEach(button => button.addEventListener('click', () => showPage(button.dataset.goPage)));
  document.querySelector('[data-department-home]').addEventListener('click', () => showPage(mode));
  modeChip.addEventListener('click', event => { event.stopPropagation(); modeMenu.classList.contains('open') ? closeModeMenu() : openModeMenu(); });
  document.querySelectorAll('[data-switch-mode]').forEach(button => button.addEventListener('click', () => setMode(button.dataset.switchMode)));
  document.addEventListener('click', event => { if (!modeMenu.contains(event.target) && event.target !== modeChip) closeModeMenu(); });

  document.querySelectorAll('[data-close-modal]').forEach(button => button.addEventListener('click', () => closeModal(moduleModal)));
  document.querySelectorAll('[data-open-report]').forEach(button => button.addEventListener('click', () => openModal(reportModal)));
  document.querySelectorAll('[data-close-report]').forEach(button => button.addEventListener('click', () => closeModal(reportModal)));
  document.getElementById('markDemoComplete').addEventListener('click', () => { closeModal(moduleModal); showToast(`${currentModule?.name || 'Task'} saved`); });

  document.querySelectorAll('[data-setup-tab]').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('[data-setup-tab]').forEach(item => item.classList.toggle('active', item === button));
    document.querySelectorAll('[data-setup-content]').forEach(content => content.classList.toggle('active', content.dataset.setupContent === button.dataset.setupTab));
  }));

  document.getElementById('resetSetup').addEventListener('click', () => {
    state = cloneDefaults(); saveState(); renderModules('kitchen'); renderModules('service'); renderEditors(); showToast('Workspace defaults restored');
  });

  document.getElementById('addCustomModule').addEventListener('click', () => {
    const name = window.prompt('Module name');
    if (!name?.trim()) return;
    const department = window.prompt('Add to Kitchen or Service?', 'Kitchen')?.trim().toLowerCase();
    if (!['kitchen','service'].includes(department)) { showToast('Choose Kitchen or Service'); return; }
    const id = `custom-${Date.now()}`;
    state[department].push({ id, name:name.trim(), symbol:'+', description:'Custom operational module', enabled:true, status:'Ready' });
    saveState(); renderModules(department); renderEditors(); showToast(`${name.trim()} added to ${department}`);
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') { closeModeMenu(); closeModal(moduleModal); closeModal(reportModal); }
  });

  const today = new Intl.DateTimeFormat(undefined,{weekday:'long',day:'numeric',month:'long'}).format(new Date());
  document.getElementById('todayLabel').textContent = today;
  renderModules('kitchen'); renderModules('service'); renderEditors(); setMode(mode);
})();
