// app.js — Main controller: navigation, step flow, project management

const Export = {
  downloadZip() {
    const files = Steps._files;
    if (!files) return;
    // Simple sequential download (no JSZip dependency needed for start)
    Object.entries(files).forEach(([name, content], i) => {
      setTimeout(() => {
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = name; a.click();
        URL.revokeObjectURL(url);
      }, i * 400);
    });
    Steps.toast('Descarregant fitxers...');
  },
  copyTex() { Steps.copyFile('tex'); }
};

const App = {
  currentStep: 1,

  init() {
    // Splash
    setTimeout(() => {
      document.getElementById('splash').classList.add('fade-out');
      document.getElementById('app').classList.remove('hidden');
      this.showProjects();
    }, 1200);

    // PWA install hook (Android)
    window.addEventListener('beforeinstallprompt', e => { this._installEvent = e; });
  },

  // ── Projects screen ──────────────────────────────────

  showProjects() {
    this.setNav('Projectes', '', false, false);
    this.switchScreen('projects');
    this.renderProjectsList();
  },

  renderProjectsList() {
    const projects = Storage.getAll();
    const empty = document.getElementById('projects-empty');
    const list = document.getElementById('projects-list');
    if (!projects.length) {
      empty.classList.remove('hidden');
      list.classList.add('hidden');
    } else {
      empty.classList.add('hidden');
      list.classList.remove('hidden');
      list.innerHTML = projects.map(p => {
        const subj = p.fields?.subject || 'Sense títol';
        const date = new Date(p.updatedAt).toLocaleDateString('ca-ES', { day:'numeric', month:'short' });
        const stepLabel = p.generated ? 'Complet' : `Pas ${p.step || 1} de 4`;
        return `<div class="project-card" onclick="App.openProject('${p.id}')">
          <div class="project-card-dot" style="background:${p.color}"></div>
          <div class="project-card-info">
            <div class="project-card-title">${subj}</div>
            <div class="project-card-meta">${p.fields?.title || ''} · ${date} · ${stepLabel}</div>
          </div>
          <div class="project-card-arrow">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </div>
        </div>`;
      }).join('');
    }
  },

  newProject() {
    const project = Storage.create({});
    Storage.setCurrentId(project.id);
    this.openSteps(project, 1);
  },

  openProject(id) {
    const project = Storage.get(id);
    if (!project) return;
    Storage.setCurrentId(id);
    this.openSteps(project, project.step || 1);
  },

  // ── Steps screen ─────────────────────────────────────

  openSteps(project, step) {
    const subj = project.fields?.subject || 'Nou projecte';
    this.setNav(subj, '', true, true);
    this.switchScreen('steps');
    this.currentStep = step;
    Steps.loadIntoForm(project);
    this.updateStepper(step);
    this.showPanel(step);
    this.updateBottomBar(step);
  },

  prevStep() {
    if (this.currentStep <= 1) { this.navBack(); return; }
    this.goStep(this.currentStep - 1);
  },

  nextStep() {
    const next = this.currentStep + 1;
    if (next > 4) return;
    this.goStep(next);
  },

  goStep(step) {
    if (step < 1 || step > 4) return;
    const dir = step > this.currentStep ? 'forward' : 'back';
    const oldPanel = document.getElementById(`panel-${this.currentStep}`);
    const newPanel = document.getElementById(`panel-${step}`);

    // On entering step 3 — render preview
    if (step === 3) {
      const project = Storage.getCurrent();
      if (project) Steps.renderPreview(project);
    }
    // On entering step 4 — generate LaTeX
    if (step === 4) {
      const project = Storage.getCurrent();
      if (project) Steps.renderExport(project);
    }

    oldPanel.classList.remove('active');
    oldPanel.classList.add(dir === 'forward' ? 'slide-left' : '');
    setTimeout(() => {
      oldPanel.classList.remove('slide-left');
      newPanel.classList.add('active');
      this.currentStep = step;
      Storage.updateCurrent({ step });
      this.updateStepper(step);
      this.updateBottomBar(step);
      // Update nav subtitle
      const project = Storage.getCurrent();
      const subj = project?.fields?.subject || 'Nou projecte';
      this.setNav(subj, '', true, true);
    }, 50);
    newPanel.classList.remove('slide-left');
    setTimeout(() => { newPanel.classList.add('active'); }, 10);
  },

  updateStepper(step) {
    for (let i = 1; i <= 4; i++) {
      const el = document.getElementById(`step-${i}`);
      el.classList.remove('active', 'done');
      if (i < step) el.classList.add('done');
      else if (i === step) el.classList.add('active');
    }
    for (let i = 1; i <= 3; i++) {
      const line = document.getElementById(`line-${i}-${i+1}`);
      if (line) line.classList.toggle('done', i < step);
    }
  },

  showPanel(step) {
    for (let i = 1; i <= 4; i++) {
      const p = document.getElementById(`panel-${i}`);
      p.classList.toggle('active', i === step);
    }
  },

  updateBottomBar(step) {
    const prev = document.getElementById('btn-prev');
    const next = document.getElementById('btn-next');
    prev.style.display = step === 1 ? 'none' : 'flex';
    const labels = ['', 'Veure referència →', 'Previsualitzar →', 'Generar LaTeX →', ''];
    next.textContent = labels[step] || '';
    next.style.display = step === 4 ? 'none' : 'flex';
    // On step 4, no bottom bar needed
    document.querySelector('.bottom-bar').style.display = step === 4 ? 'none' : 'flex';
  },

  // ── Navigation ───────────────────────────────────────

  switchScreen(name) {
    document.querySelectorAll('.screen').forEach(s => {
      s.classList.remove('active');
      s.classList.add('slide-left');
    });
    const target = document.getElementById(`screen-${name}`);
    if (!target) return;
    target.classList.remove('slide-left');
    requestAnimationFrame(() => target.classList.add('active'));
  },

  navBack() {
    this.showProjects();
  },

  navAction() {
    // Future: project options menu
  },

  setNav(title, subtitle, showBack, showAction) {
    document.getElementById('nav-title').textContent = title;
    const sub = document.getElementById('nav-subtitle');
    if (subtitle) { sub.textContent = subtitle; sub.classList.remove('hidden'); }
    else { sub.classList.add('hidden'); }
    document.getElementById('btn-back-nav').classList.toggle('hidden', !showBack);
    document.getElementById('btn-nav-action').classList.toggle('hidden', !showAction);
  }
};

// Boot
document.addEventListener('DOMContentLoaded', () => App.init());

// Service Worker registration
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
