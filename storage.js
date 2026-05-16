// storage.js — Persistent storage for all projects
const Storage = {
  KEY: 'latexstudio_projects',

  getAll() {
    try { return JSON.parse(localStorage.getItem(this.KEY) || '[]'); }
    catch { return []; }
  },

  save(projects) {
    localStorage.setItem(this.KEY, JSON.stringify(projects));
  },

  get(id) {
    return this.getAll().find(p => p.id === id) || null;
  },

  create(data) {
    const projects = this.getAll();
    const project = {
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      color: ['#4a7fc1','#3a8a5a','#7a5ab8','#c17a30','#8a3a5a'][projects.length % 5],
      step: 1,
      pdfs: [],
      refs: [],
      fields: { subject:'', code:'', year:'', title:'', author:'', professor:'', designNotes:'' },
      style: { font:'serif', color:'blue', margin:'normal' },
      generated: false,
      ...data
    };
    projects.unshift(project);
    this.save(projects);
    return project;
  },

  update(id, data) {
    const projects = this.getAll();
    const idx = projects.findIndex(p => p.id === id);
    if (idx === -1) return null;
    projects[idx] = { ...projects[idx], ...data, updatedAt: new Date().toISOString() };
    this.save(projects);
    return projects[idx];
  },

  delete(id) {
    const projects = this.getAll().filter(p => p.id !== id);
    this.save(projects);
  },

  getCurrentId() {
    return sessionStorage.getItem('current_project');
  },

  setCurrentId(id) {
    sessionStorage.setItem('current_project', id);
  },

  getCurrent() {
    const id = this.getCurrentId();
    return id ? this.get(id) : null;
  },

  updateCurrent(data) {
    const id = this.getCurrentId();
    if (!id) return null;
    return this.update(id, data);
  }
};
