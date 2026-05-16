// steps.js — Step-by-step logic: file handling, field sync, style selection

const Steps = {

  addPDF() { document.getElementById('pdf-input').click(); },
  addRef() { document.getElementById('ref-input').click(); },

  handlePDFs(input) {
    const project = Storage.getCurrent();
    if (!project) return;
    const pdfs = [...(project.pdfs || [])];
    Array.from(input.files).forEach(file => {
      if (!pdfs.find(f => f.name === file.name)) {
        pdfs.push({ name: file.name, size: file.size, type: 'pdf' });
      }
    });
    Storage.updateCurrent({ pdfs });
    this.renderPDFs(pdfs);
    input.value = '';
  },

  handleRefs(input) {
    const project = Storage.getCurrent();
    if (!project) return;
    const refs = [...(project.refs || [])];
    Array.from(input.files).forEach(file => {
      if (!refs.find(f => f.name === file.name)) {
        refs.push({ name: file.name, size: file.size, type: file.type.startsWith('image') ? 'image' : 'pdf' });
      }
    });
    Storage.updateCurrent({ refs });
    this.renderRefs(refs);
    input.value = '';
  },

  renderPDFs(pdfs) {
    const list = document.getElementById('pdf-list');
    if (!pdfs || !pdfs.length) { list.innerHTML = ''; return; }
    list.innerHTML = pdfs.map((f, i) => `
      <div class="file-item">
        <div class="file-icon">PDF</div>
        <div class="file-info">
          <div class="file-name">${f.name}</div>
          <div class="file-meta">${this.formatSize(f.size)}</div>
        </div>
        <span class="file-status ok">✓ Llest</span>
        <button class="file-remove" onclick="Steps.removePDF(${i})" aria-label="Eliminar">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>`).join('');
  },

  renderRefs(refs) {
    const list = document.getElementById('ref-list');
    if (!refs || !refs.length) { list.innerHTML = ''; return; }
    list.innerHTML = refs.map((f, i) => `
      <div class="file-item">
        <div class="file-icon" style="background:rgba(74,127,193,0.15);color:#80b4e8">${f.type === 'image' ? 'IMG' : 'PDF'}</div>
        <div class="file-info">
          <div class="file-name">${f.name}</div>
          <div class="file-meta">${this.formatSize(f.size)}</div>
        </div>
        <span class="file-status ok">✓ Referència</span>
        <button class="file-remove" onclick="Steps.removeRef(${i})" aria-label="Eliminar">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>`).join('');
  },

  removePDF(i) {
    const project = Storage.getCurrent();
    const pdfs = [...(project.pdfs || [])];
    pdfs.splice(i, 1);
    Storage.updateCurrent({ pdfs });
    this.renderPDFs(pdfs);
  },

  removeRef(i) {
    const project = Storage.getCurrent();
    const refs = [...(project.refs || [])];
    refs.splice(i, 1);
    Storage.updateCurrent({ refs });
    this.renderRefs(refs);
  },

  saveField() {
    const fields = {
      subject:     document.getElementById('f-subject')?.value || '',
      code:        document.getElementById('f-code')?.value || '',
      year:        document.getElementById('f-year')?.value || '',
      title:       document.getElementById('f-title')?.value || '',
      author:      document.getElementById('f-author')?.value || '',
      professor:   document.getElementById('f-professor')?.value || '',
      designNotes: document.getElementById('f-design-notes')?.value || ''
    };
    Storage.updateCurrent({ fields });
  },

  selectPill(btn, groupId) {
    document.getElementById(groupId).querySelectorAll('.pill').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const key = groupId === 'font-group' ? 'font' : 'margin';
    const style = Storage.getCurrent()?.style || {};
    style[key] = btn.dataset.val;
    Storage.updateCurrent({ style });
  },

  selectColor(btn) {
    document.getElementById('color-group').querySelectorAll('.color-opt').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const style = Storage.getCurrent()?.style || {};
    style.color = btn.dataset.val;
    Storage.updateCurrent({ style });
  },

  loadIntoForm(project) {
    const f = project.fields || {};
    const s = project.style || {};
    if (document.getElementById('f-subject')) document.getElementById('f-subject').value = f.subject || '';
    if (document.getElementById('f-code'))    document.getElementById('f-code').value    = f.code    || '';
    if (document.getElementById('f-year'))    document.getElementById('f-year').value    = f.year    || '';
    if (document.getElementById('f-title'))   document.getElementById('f-title').value   = f.title   || '';
    if (document.getElementById('f-author'))  document.getElementById('f-author').value  = f.author  || '';
    if (document.getElementById('f-professor'))   document.getElementById('f-professor').value   = f.professor   || '';
    if (document.getElementById('f-design-notes')) document.getElementById('f-design-notes').value = f.designNotes || '';
    // Pills
    if (s.font)   { document.getElementById('font-group').querySelectorAll('.pill').forEach(b => { b.classList.toggle('active', b.dataset.val === s.font); }); }
    if (s.margin) { document.getElementById('margin-group').querySelectorAll('.pill').forEach(b => { b.classList.toggle('active', b.dataset.val === s.margin); }); }
    if (s.color)  { document.getElementById('color-group').querySelectorAll('.color-opt').forEach(b => { b.classList.toggle('active', b.dataset.val === s.color); }); }
    this.renderPDFs(project.pdfs || []);
    this.renderRefs(project.refs || []);
  },

  renderPreview(project) {
    const container = document.getElementById('preview-container');
    container.innerHTML = LaTeX.generatePreview(project);
    // Elements list
    const el = document.getElementById('elements-list');
    el.innerHTML = LaTeX.getElements(project).map(e => `
      <div class="element-row">
        <div class="element-left">
          <div class="element-chip" style="background:${e.bg};color:${e.color||'#fff'}">${e.icon}</div>
          <span class="element-name">${e.name}</span>
        </div>
        <span class="element-tag ${e.cls}">${e.tag}</span>
      </div>`).join('');
  },

  renderExport(project) {
    const files = LaTeX.generate(project);
    const slug = (project.fields.subject || 'document').toLowerCase().replace(/\s+/g,'-').replace(/[^\w-]/g,'');

    // Store generated files for download
    this._files = { [`${slug}.tex`]: files.tex, [`${slug}.cls`]: files.cls, [`${slug}.sty`]: files.sty };

    // Output file list
    document.getElementById('output-files').innerHTML = Object.entries(this._files).map(([name, content]) => {
      const ext = name.split('.').pop();
      const size = this.formatSize(new Blob([content]).size);
      return `<div class="output-file">
        <span class="out-ext ext-${ext}">.${ext}</span>
        <span class="out-name">${name}</span>
        <span class="out-size">${size}</span>
        <button class="out-copy" onclick="Steps.copyFile('${ext}')" aria-label="Copiar ${name}">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
        </button>
      </div>`;
    }).join('');

    // Code preview (.tex)
    const texHighlighted = files.tex
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/(\\[a-zA-Z]+)/g, '<span class="code-kw">$1</span>')
      .replace(/(%%.*)/g, '<span class="code-cm">$1</span>');
    document.getElementById('code-preview').innerHTML = texHighlighted;

    Storage.updateCurrent({ generated: true });
  },

  copyFile(ext) {
    const entry = Object.entries(this._files || {}).find(([k]) => k.endsWith('.' + ext));
    if (!entry) return;
    navigator.clipboard.writeText(entry[1]).then(() => this.toast('Copiat al porta-retalls!'));
  },

  formatSize(bytes) {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1024 / 1024).toFixed(1) + ' MB';
  },

  toast(msg) {
    const t = document.createElement('div');
    t.textContent = msg;
    t.style.cssText = 'position:fixed;bottom:100px;left:50%;transform:translateX(-50%);background:#fff;color:#000;padding:8px 16px;border-radius:20px;font-size:13px;font-family:"Helvetica Neue",sans-serif;z-index:999;pointer-events:none;animation:fadeUp 0.3s ease';
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2200);
  }
};
