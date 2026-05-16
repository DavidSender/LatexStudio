// latex.js — Template engine: generates .tex, .cls, .sty from project data

const LaTeX = {

  // Color palettes per scheme
  PALETTES: {
    blue: {
      header: '#0f2a4a', accent: '#1a4a8a', light: '#ddeeff',
      box: '#eef4ff', boxborder: '#3366aa',
      defbox: '#e8f0fa', thbox: '#ddeeff', exbox: '#f0f8ee'
    },
    green: {
      header: '#0a2a18', accent: '#1a6b3a', light: '#d8f4e4',
      box: '#eef8f2', boxborder: '#2a7a4a',
      defbox: '#e8f4ee', thbox: '#d8f0e4', exbox: '#fef8e8'
    },
    gray: {
      header: '#1a1a1a', accent: '#3a3a3a', light: '#eeeeee',
      box: '#f4f4f4', boxborder: '#555555',
      defbox: '#f0f0f0', thbox: '#e8e8e8', exbox: '#f8f8f8'
    },
    purple: {
      header: '#1a0a3a', accent: '#5a3a8a', light: '#ede4ff',
      box: '#f4eeff', boxborder: '#7a5aaa',
      defbox: '#eee8fa', thbox: '#e4d8ff', exbox: '#f8f0ee'
    }
  },

  MARGINS: { normal: '2.5cm', wide: '3cm', narrow: '2cm' },

  FONTS: {
    serif:  { main: 'palatino', math: 'mathpazo' },
    sans:   { main: 'helvet',   math: 'sfmath'   },
    mono:   { main: 'courier',  math: 'mathpazo' }
  },

  generate(project) {
    const p = project;
    const pal = this.PALETTES[p.style.color] || this.PALETTES.blue;
    const margin = this.MARGINS[p.style.margin] || '2.5cm';
    const font = this.FONTS[p.style.font] || this.FONTS.serif;
    const slug = (p.fields.subject || 'document').toLowerCase().replace(/\s+/g,'-').replace(/[^\w-]/g,'');

    return {
      cls: this.generateCLS(p, pal, margin, font, slug),
      sty: this.generateSTY(p, pal),
      tex: this.generateTEX(p, slug)
    };
  },

  generateCLS(p, pal, margin, font, slug) {
    const f = p.fields;
    return `%% ${slug}.cls
%% Classe LaTeX generada per LaTeX Studio
%% Assignatura: ${f.subject || ''}  |  Autor: ${f.author || ''}
%% ─────────────────────────────────────────────
\\NeedsTeXFormat{LaTeX2e}
\\ProvidesClass{${slug}}[2025/01/01 Classe personalitzada]

\\LoadClass[12pt,a4paper]{article}

%% ── Codificació i llengua ──
\\RequirePackage[utf8]{inputenc}
\\RequirePackage[T1]{fontenc}
\\RequirePackage[catalan,spanish,english]{babel}
\\selectlanguage{catalan}

%% ── Tipografia ──
\\RequirePackage{${font.main}}
\\RequirePackage{${font.math}}
\\RequirePackage{microtype}

%% ── Pàgina i marges ──
\\RequirePackage[
  a4paper,
  top=${margin}, bottom=${margin},
  left=${margin}, right=${margin}
]{geometry}

%% ── Colors ──
\\RequirePackage[dvipsnames,svgnames,x11names]{xcolor}
\\definecolor{HeaderBg}{HTML}{${pal.header.slice(1)}}
\\definecolor{AccentColor}{HTML}{${pal.accent.slice(1)}}
\\definecolor{LightAccent}{HTML}{${pal.light.slice(1)}}
\\definecolor{DefBoxBg}{HTML}{${pal.defbox.slice(1)}}
\\definecolor{ThBoxBg}{HTML}{${pal.thbox.slice(1)}}
\\definecolor{ExBoxBg}{HTML}{${pal.exbox.slice(1)}}
\\definecolor{BoxBorder}{HTML}{${pal.boxborder.slice(1)}}

%% ── Capçalera i peu de pàgina ──
\\RequirePackage{fancyhdr}
\\pagestyle{fancy}
\\fancyhf{}
\\renewcommand{\\headrulewidth}{0pt}
\\fancyhead[L]{\\color{white}\\rule[-6pt]{0pt}{20pt}%
  \\colorbox{HeaderBg}{\\parbox{\\textwidth}{%
    \\hspace{6pt}\\small\\textbf{${f.subject || 'Assignatura'}} \\hfill ${f.title || 'Títol del tema'} \\hspace{6pt}}}}
\\fancyfoot[C]{\\small\\color{gray}${f.author || ''}}
\\fancyfoot[R]{\\small\\thepage}

%% ── Seccions ──
\\RequirePackage{titlesec}
\\titleformat{\\section}{%
  \\normalfont\\Large\\bfseries\\color{AccentColor}}{%
  \\colorbox{AccentColor}{\\textcolor{white}{\\,\\thesection\\,}}\\quad}{0pt}{}[%
  \\vspace{-4pt}\\textcolor{AccentColor}{\\rule{\\textwidth}{0.8pt}}]
\\titleformat{\\subsection}{\\normalfont\\large\\bfseries\\color{AccentColor}}{\\thesubsection\\;}{0pt}{}
\\titleformat{\\subsubsection}{\\normalfont\\normalsize\\bfseries}{\\thesubsubsection\\;}{0pt}{}

%% ── Hiperlinks ──
\\RequirePackage[colorlinks=true,linkcolor=AccentColor,urlcolor=AccentColor,citecolor=AccentColor]{hyperref}

%% ── Matemàtiques ──
\\RequirePackage{amsmath,amssymb,amsthm}
\\RequirePackage{mathtools}

%% ── Figures ──
\\RequirePackage{graphicx}
\\RequirePackage{float}
\\RequirePackage[font=small,labelfont={bf,color=AccentColor}]{caption}

%% ── Taules ──
\\RequirePackage{booktabs}
\\RequirePackage{array}

%% ── Caixes personalitzades (carregades des de ${slug}.sty) ──
\\RequirePackage{${slug}}

%% ── Espaiats ──
\\setlength{\\parskip}{6pt}
\\setlength{\\parindent}{0pt}
\\renewcommand{\\baselinestretch}{1.2}
`;
  },

  generateSTY(p, pal) {
    const slug = (p.fields.subject || 'document').toLowerCase().replace(/\s+/g,'-').replace(/[^\w-]/g,'');
    return `%% ${slug}.sty
%% Estils i entorns — generat per LaTeX Studio
%% ─────────────────────────────────────────────
\\NeedsTeXFormat{LaTeX2e}
\\ProvidesPackage{${slug}}[2025/01/01 Estils personalitzats]

\\RequirePackage{tcolorbox}
\\tcbuselibrary{skins,breakable,theorems}
\\RequirePackage{mdframed}

%% ── Entorn: Definició ──
\\tcbset{
  defstyle/.style={
    enhanced, breakable,
    colback=DefBoxBg, colframe=BoxBorder,
    fonttitle=\\bfseries\\color{AccentColor},
    title={Definició \\thetcbcounter},
    separator sign={.\\;},
    left=8pt, right=8pt, top=6pt, bottom=6pt,
    boxrule=0.6pt,
    borderline west={2pt}{0pt}{BoxBorder},
    sharp corners=west,
    attach boxed title to top left={yshift=-2mm,xshift=6pt},
    boxed title style={colback=DefBoxBg, colframe=BoxBorder, boxrule=0.5pt}
  }
}
\\newtcolorbox[auto counter,number within=section]{definicio}[1][]{
  defstyle, title={Definició \\thetcbcounter\\if\\relax\\detokenize{#1}\\relax\\else{: #1}\\fi}
}

%% ── Entorn: Teorema ──
\\tcbset{
  thmstyle/.style={
    enhanced, breakable,
    colback=ThBoxBg, colframe=BoxBorder,
    fonttitle=\\bfseries\\color{AccentColor},
    left=8pt, right=8pt, top=6pt, bottom=6pt,
    boxrule=0.6pt,
    borderline west={3pt}{0pt}{AccentColor},
    sharp corners=west,
  }
}
\\newtcolorbox[auto counter,number within=section]{teorema}[1][]{
  thmstyle, title={Teorema \\thetcbcounter\\if\\relax\\detokenize{#1}\\relax\\else{: #1}\\fi}
}

%% ── Entorn: Proposició ──
\\newtcolorbox[auto counter,number within=section]{proposicio}[1][]{
  thmstyle, title={Proposició \\thetcbcounter\\if\\relax\\detokenize{#1}\\relax\\else{: #1}\\fi},
  colback=ExBoxBg, borderline west={2pt}{0pt}{BoxBorder}
}

%% ── Entorn: Exemple ──
\\newtcolorbox[auto counter,number within=section]{exemple}[1][]{
  enhanced, breakable,
  colback=ExBoxBg, colframe=BoxBorder!50,
  fonttitle=\\itshape\\color{AccentColor},
  title={Exemple \\thetcbcounter\\if\\relax\\detokenize{#1}\\relax\\else{: #1}\\fi},
  left=8pt, right=8pt, boxrule=0.4pt,
  borderline west={1.5pt}{0pt}{BoxBorder!60},
  sharp corners=west,
}

%% ── Entorn: Demostració ──
\\renewenvironment{proof}{\\par\\noindent\\textit{Demostració.}\\;}{\\hfill$\\square$\\par}

%% ── Entorn: Nota ──
\\newenvironment{nota}{%
  \\begin{mdframed}[backgroundcolor=LightAccent!30,linecolor=BoxBorder!50,linewidth=0.5pt,leftmargin=0pt,rightmargin=0pt,innertopmargin=6pt,innerbottommargin=6pt]
  \\textbf{\\color{AccentColor}Nota.}\\;
}{\\end{mdframed}}

%% ── Comandes d'utilitat ──
\\newcommand{\\R}{\\mathbb{R}}
\\newcommand{\\N}{\\mathbb{N}}
\\newcommand{\\Z}{\\mathbb{Z}}
\\newcommand{\\Q}{\\mathbb{Q}}
\\newcommand{\\C}{\\mathbb{C}}
\\newcommand{\\norm}[1]{\\left\\|#1\\right\\|}
\\newcommand{\\abs}[1]{\\left|#1\\right|}
\\newcommand{\\inner}[2]{\\langle #1,\\, #2 \\rangle}
`;
  },

  generateTEX(p, slug) {
    const f = p.fields;
    const pdfnames = p.pdfs.map(pdf => `  % ${pdf.name}`).join('\n') || '  % (cap PDF pujat)';
    return `%% ${f.title || 'Document'}.tex
%% Generat per LaTeX Studio
%% ─────────────────────────────────────────────
\\documentclass{${slug}}

\\begin{document}

%% ─── Portada ───────────────────────────────────
\\begin{titlepage}
  \\centering
  \\vspace*{2cm}
  {\\Huge\\bfseries\\color{AccentColor} ${f.subject || 'Assignatura'} \\par}
  \\vspace{0.5cm}
  {\\large\\color{gray} ${f.code || ''} \\par}
  \\vspace{1.5cm}
  {\\LARGE ${f.title || 'Títol del tema'} \\par}
  \\vspace{2cm}
  \\rule{0.5\\textwidth}{0.4pt}\\\\[1em]
  {\\large ${f.author || 'Autor'} \\par}
  \\vspace{0.5cm}
  {\\normalsize ${f.professor ? 'Professor: ' + f.professor : ''} \\par}
  \\vfill
  {\\small Curs ${f.year || '2025--26'} \\par}
\\end{titlepage}

%% ─── Taula de continguts ───────────────────────
\\tableofcontents
\\newpage

%% ─── Contingut generat a partir de: ───────────
${pdfnames}

\\section{Introducció}

Escriu aquí la introducció del tema. El contingut dels teus PDFs s'ha analitzat
i l'estructura bàsica s'ha preparat per a tu.

\\begin{definicio}[Concepte fonamental]
  Escriu aquí la definició del concepte principal d'aquest tema.
\\end{definicio}

\\section{Fonaments teòrics}

\\begin{teorema}[Resultat principal]
  Enunciament del teorema principal.
\\end{teorema}

\\begin{proof}
  Demostració del teorema.
\\end{proof}

\\begin{exemple}
  Exemple il·lustratiu del concepte.
\\end{exemple}

\\begin{nota}
  Observació important a tenir en compte.
\\end{nota}

\\section{Resultats}

\\subsection{Primer resultat}

\\begin{proposicio}
  Enunciament de la proposició.
\\end{proposicio}

\\section{Conclusions}

Escriu aquí les conclusions del tema.

%% ─── Bibliografia ──────────────────────────────
\\newpage
\\begin{thebibliography}{99}
  \\bibitem{ref1} Autor, \\textit{Títol del llibre}. Editorial, Any.
\\end{thebibliography}

\\end{document}
`;
  },

  // Preview HTML — renders a faithful page preview
  generatePreview(project) {
    const p = project;
    const pal = this.PALETTES[p.style.color] || this.PALETTES.blue;
    const f = p.fields;
    const fontStack = {
      serif: '"Palatino Linotype", Palatino, Georgia, serif',
      sans:  '"Helvetica Neue", Helvetica, Arial, sans-serif',
      mono:  '"Courier New", Courier, monospace'
    }[p.style.font] || 'Georgia, serif';

    return `
<div style="background:#fff;color:#1a1a1a;font-family:${fontStack};padding:28px 30px;min-height:400px;line-height:1.6">
  <!-- Capçalera -->
  <div style="background:${pal.header};color:#fff;padding:8px 12px;margin:-28px -30px 20px;display:flex;align-items:center;justify-content:space-between;font-size:11px;letter-spacing:0.04em">
    <span style="font-weight:700">${f.subject || 'Assignatura'}</span>
    <span style="opacity:0.8">${f.title || 'Títol del tema'}</span>
  </div>

  <!-- Títol de secció -->
  <div style="margin-bottom:16px">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:4px">
      <span style="background:${pal.accent};color:#fff;padding:2px 8px;border-radius:3px;font-size:12px;font-weight:700">1</span>
      <span style="font-size:18px;font-weight:700;color:${pal.accent}">Fonaments teòrics</span>
    </div>
    <div style="height:1.5px;background:${pal.accent};opacity:0.3;margin-bottom:10px"></div>
    <p style="font-size:13px;color:#333;line-height:1.7;margin-bottom:12px">
      El contingut del teu PDF s'analitza i s'estructura automàticament. Aquí apareixerà el text dels teus apunts amb el format del template seleccionat.
    </p>
  </div>

  <!-- Caixa de definició -->
  <div style="background:${pal.defbox};border-left:3px solid ${pal.boxborder};border-radius:0 6px 6px 0;padding:10px 14px;margin-bottom:12px">
    <div style="font-size:11px;font-weight:700;color:${pal.accent};text-transform:uppercase;letter-spacing:0.06em;margin-bottom:4px">Definició 1.1</div>
    <p style="font-size:13px;margin:0;line-height:1.6">Aquí va la definició del concepte principal. L'entorn <em>definicio</em> genera automàticament la numeració i el format.</p>
  </div>

  <!-- Caixa de teorema -->
  <div style="background:${pal.thbox};border-left:4px solid ${pal.accent};border-radius:0 6px 6px 0;padding:10px 14px;margin-bottom:12px">
    <div style="font-size:11px;font-weight:700;color:${pal.accent};text-transform:uppercase;letter-spacing:0.06em;margin-bottom:4px">Teorema 1.1</div>
    <p style="font-size:13px;margin:0;font-style:italic;line-height:1.6">Enunciament del resultat principal. L'entorn <em>teorema</em> genera la numeració automàticament.</p>
  </div>

  <!-- Text de cos -->
  <p style="font-size:13px;color:#333;line-height:1.7;margin-bottom:10px">
    Text de cos normal del document. La tipografia <strong>${p.style.font === 'serif' ? 'Palatino' : p.style.font === 'sans' ? 'Helvetica' : 'Courier'}</strong> s'aplicarà a tot el document amb marges de ${this.MARGINS[p.style.margin]}.
  </p>

  <!-- Exemple -->
  <div style="background:#f8f8f8;border:1px solid #e0e0e0;border-left:2px solid ${pal.boxborder};opacity:0.85;border-radius:0 6px 6px 0;padding:8px 14px;margin-bottom:16px">
    <div style="font-size:11px;font-style:italic;color:${pal.accent};margin-bottom:3px">Exemple 1.1</div>
    <p style="font-size:12px;margin:0;line-height:1.5;color:#444">Exemple il·lustratiu del concepte explicat.</p>
  </div>

  <!-- Peu de pàgina -->
  <div style="border-top:1px solid #e8e8e8;margin-top:24px;padding-top:8px;display:flex;justify-content:space-between;font-size:10px;color:#999">
    <span>${f.author || 'Autor'}</span>
    <span>1</span>
  </div>
</div>`;
  },

  getElements(project) {
    const p = project;
    const pal = this.PALETTES[p.style.color] || this.PALETTES.blue;
    return [
      { icon: 'H', bg: p.style.color === 'gray' ? '#333' : pal.accent, name: 'Capçalera del document', tag: 'Aplicat', cls: 'tag-ok' },
      { icon: '§', bg: pal.accent, name: 'Format de seccions', tag: 'Aplicat', cls: 'tag-ok' },
      { icon: 'D', bg: pal.defbox, color: pal.accent, name: 'Caixes de definició', tag: 'Aplicat', cls: 'tag-ok' },
      { icon: 'T', bg: pal.thbox, color: pal.accent, name: 'Caixes de teorema', tag: 'Aplicat', cls: 'tag-ok' },
      { icon: 'E', bg: '#f0f0f0', color: '#555', name: 'Caixes d\'exemple', tag: 'Aplicat', cls: 'tag-ok' },
      { icon: 'f', bg: '#222', color: '#fff', name: `Tipografia ${p.style.font}`, tag: 'Aplicat', cls: 'tag-ok' },
      ...(p.fields.designNotes ? [{ icon: '+', bg: '#443', color: '#d4b060', name: 'Ajustos personalitzats', tag: 'Personalitzat', cls: 'tag-custom' }] : [])
    ];
  }
};
