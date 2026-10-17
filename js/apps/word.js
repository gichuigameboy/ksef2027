/**
 * Dawamu OS - Professional Word Processor (Dawamu Word 365)
 * 
 * Features:
 * - Multi-tab Ribbon (File, Home, Insert, Layout, Review, View)
 * - Typography engine (Fonts, sizes, headings, subscript, superscript, colors, highlights)
 * - Formatting (Alignment, line spacing, indent, bullet lists, numbered lists, checklists)
 * - Insert capabilities: Tables, Images, Scientific & Math symbols (π, √, °, ±, etc.), Blockquotes, Date/Time, Links
 * - Page Setup: Portrait/Landscape, Margins (Normal/Narrow/Wide), Paper themes (White, Ivory, Dark, Eye-Care)
 * - Review tools: Live Word/Char/Para metrics, Find & Replace tool, Text-to-Speech read aloud
 * - Interactive Top Ruler with inch markings
 * - Document Storage Manager: Save multiple documents to local storage, Open, Delete, Export (.html, .doc, .txt, .md, PDF print)
 * - Zoom controls (50% to 150%) & Fullscreen focus mode
 */

export function createWordApp() {
  const root = document.createElement('div');
  root.className = 'flex flex-col h-full bg-[#eef1f5] font-sans text-slate-800 select-none overflow-hidden';

  // State
  let activeRibbonTab = 'home';
  let zoomLevel = 1.0;
  let showRuler = true;
  let currentDocId = 'doc_' + Date.now();
  let currentDocTitle = 'Term 3 Academic Essay.docx';
  let autoSaveTimeout = null;
  let findMatches = [];
  let currentMatchIndex = -1;

  // Preloaded Templates
  const TEMPLATES = {
    blank: {
      title: 'Untitled Document.docx',
      content: '<p><br></p>'
    },
    essay: {
      title: 'KCSE English Essay - The Pearl.docx',
      content: `
        <h1 style="color:#185abd; font-size:24px; font-weight:800; margin-bottom:4px;">An Analysis of Greed and Corruption in 'The Pearl'</h1>
        <p style="font-size:12px; color:#64748b; margin-bottom:20px;"><b>Author:</b> Brian Ochieng &nbsp;|&nbsp; <b>Form:</b> Form 2 East &nbsp;|&nbsp; <b>Subject:</b> English Literature</p>
        <hr style="border:none; border-top:1px solid #cbd5e1; margin-bottom:20px;">
        
        <h2 style="color:#1e3a8a; font-size:18px; font-weight:700;">1. Introduction</h2>
        <p>In John Steinbeck's novella <i>The Pearl</i>, the discovery of the "Pearl of the World" promises salvation and prosperity for Kino and his modest family. However, this magnificent object quickly mutates into a catalyst for destruction, revealing the inherent greed that infects the surrounding community.</p>
        
        <h2 style="color:#1e3a8a; font-size:18px; font-weight:700; margin-top:16px;">2. The Illusion of Hope</h2>
        <p>Kino's initial aspirations are noble. He envisions an official church wedding with Juana, clean new clothing, and crucially, an education for his son Coyotito. In Kino's mind, literacy represents freedom from historical oppression:</p>
        
        <blockquote style="margin:12px 24px; padding:10px 18px; border-left:4px solid #185abd; background:#f1f5f9; font-style:italic; color:#334155;">
          "My son will read and open the books, and my son will write and will know writing. And these things will make us free."
        </blockquote>
        
        <p>Yet the pearl does not bring freedom; instead, it attracts predators. From the doctor who previously refused to treat Coyotito's scorpion bite, to the pearl buyers operating in an exploitative monopoly, the town turns against Kino.</p>
        
        <h2 style="color:#1e3a8a; font-size:18px; font-weight:700; margin-top:16px;">3. Conclusion</h2>
        <p>Steinbeck utilizes the pearl as an allegorical mirror reflecting the destructive power of material obsession. When Kino ultimately flings the pearl back into the Gulf, he acknowledges that some treasures exact too heavy a human toll.</p>
      `
    },
    lab: {
      title: 'Physics Lab Report - Simple Pendulum.docx',
      content: `
        <h1 style="color:#185abd; font-size:22px; font-weight:800;">Science Laboratory Report: Acceleration Due to Gravity (g)</h1>
        <p style="font-size:12px; color:#64748b;"><b>Student:</b> Kevin Mwangi &nbsp;|&nbsp; <b>Date:</b> October 2026 &nbsp;|&nbsp; <b>Physics Lab 2</b></p>
        <hr style="border:none; border-top:1px solid #cbd5e1; margin:16px 0;">
        
        <h2 style="color:#1e3a8a; font-size:16px;">I. Objective</h2>
        <p>To determine the local acceleration due to gravity <b>(g)</b> at Dawamu Campus using a simple pendulum of variable length.</p>
        
        <h2 style="color:#1e3a8a; font-size:16px; margin-top:14px;">II. Theoretical Equation</h2>
        <p>The period of oscillation <i>T</i> of a simple pendulum of length <i>L</i> is given by:</p>
        <div style="background:#f8fafc; border:1px solid #e2e8f0; padding:10px; border-radius:8px; font-family:monospace; text-align:center; font-weight:bold; color:#0f172a; margin:10px 0;">
          T = 2π √(L / g) &nbsp;⇒&nbsp; T² = (4π² / g) · L
        </div>
        
        <h2 style="color:#1e3a8a; font-size:16px; margin-top:14px;">III. Recorded Experimental Data</h2>
        <table style="width:100%; border-collapse:collapse; margin:12px 0; font-size:13px;">
          <thead>
            <tr style="background:#185abd; color:white;">
              <th style="border:1px solid #cbd5e1; padding:6px 10px;">Length L (m)</th>
              <th style="border:1px solid #cbd5e1; padding:6px 10px;">Time for 20 Osc (s)</th>
              <th style="border:1px solid #cbd5e1; padding:6px 10px;">Period T (s)</th>
              <th style="border:1px solid #cbd5e1; padding:6px 10px;">T² (s²)</th>
            </tr>
          </thead>
          <tbody>
            <tr><td style="border:1px solid #cbd5e1; padding:6px 10px; text-align:center;">0.40</td><td style="border:1px solid #cbd5e1; padding:6px 10px; text-align:center;">25.4</td><td style="border:1px solid #cbd5e1; padding:6px 10px; text-align:center;">1.27</td><td style="border:1px solid #cbd5e1; padding:6px 10px; text-align:center;">1.61</td></tr>
            <tr style="background:#f8fafc;"><td style="border:1px solid #cbd5e1; padding:6px 10px; text-align:center;">0.60</td><td style="border:1px solid #cbd5e1; padding:6px 10px; text-align:center;">31.0</td><td style="border:1px solid #cbd5e1; padding:6px 10px; text-align:center;">1.55</td><td style="border:1px solid #cbd5e1; padding:6px 10px; text-align:center;">2.40</td></tr>
            <tr><td style="border:1px solid #cbd5e1; padding:6px 10px; text-align:center;">0.80</td><td style="border:1px solid #cbd5e1; padding:6px 10px; text-align:center;">35.8</td><td style="border:1px solid #cbd5e1; padding:6px 10px; text-align:center;">1.79</td><td style="border:1px solid #cbd5e1; padding:6px 10px; text-align:center;">3.20</td></tr>
            <tr style="background:#f8fafc;"><td style="border:1px solid #cbd5e1; padding:6px 10px; text-align:center;">1.00</td><td style="border:1px solid #cbd5e1; padding:6px 10px; text-align:center;">40.2</td><td style="border:1px solid #cbd5e1; padding:6px 10px; text-align:center;">2.01</td><td style="border:1px solid #cbd5e1; padding:6px 10px; text-align:center;">4.04</td></tr>
          </tbody>
        </table>
        
        <h2 style="color:#1e3a8a; font-size:16px; margin-top:14px;">IV. Conclusion</h2>
        <p>From the gradient of the T² against L graph, the calculated value for gravitational acceleration was found to be <b>g = 9.78 ± 0.08 m/s²</b>, which closely matches the standard experimental value.</p>
      `
    },
    letter: {
      title: 'Formal Letter - Request for Science Fair.docx',
      content: `
        <div style="text-align:right; font-size:13px; line-height:1.5;">
          Brian Ochieng<br>
          Chairperson, Dawamu STEM Club<br>
          Dawamu Senior School<br>
          P.O. Box 45000, Nairobi<br>
          11th October 2026
        </div>
        
        <div style="margin-top:20px; font-size:13px; line-height:1.5;">
          The Senior Principal,<br>
          Dawamu Secondary Academy,<br>
          Private Bag, Karen.
        </div>
        
        <p style="margin-top:20px; font-size:13px;">Dear Sir,</p>
        
        <p style="font-weight:bold; text-decoration:underline; font-size:14px; text-align:center; margin:16px 0;">
          RE: FORMAL PROPOSAL TO HOST INTER-HOUSE SCIENCE & ROBOTICS EXPO 2026
        </p>
        
        <p>I am writing on behalf of the Dawamu STEM & Science Society to formally request permission to host the annual Inter-House Science and Coding Exposition during the upcoming midterm weekend.</p>
        
        <p>Our objective is to encourage student-led innovation in renewable solar energy, agricultural automation, and Python coding. All four houses (Kifaru, Simba, Ndovu, and Chui) have submitted enthusiastic entries.</p>
        
        <p>We have coordinated with Mr. Njoroge (Head of Science) to supervise the event and ensure complete lab safety standards.</p>
        
        <p>Thank you for your continuous support of academic excellence.</p>
        
        <div style="margin-top:28px; font-size:13px; line-height:1.6;">
          Yours faithfully,<br><br>
          <b>Brian Ochieng</b><br>
          Student Leader, Dawamu STEM Club
        </div>
      `
    }
  };

  root.innerHTML = `
    <!-- Top Window / App Bar -->
    <div class="bg-[#185abd] text-white px-3 py-1.5 flex items-center justify-between shrink-0 shadow-sm">
      <div class="flex items-center gap-2.5">
        <div class="w-7 h-7 bg-white/20 rounded flex items-center justify-center text-white">
          <i class="fas fa-file-word text-base"></i>
        </div>
        <div class="flex items-center gap-2">
          <input id="word-doc-title" type="text" value="${currentDocTitle}" spellcheck="false"
                 class="bg-transparent text-white font-semibold text-xs outline-none border-b border-transparent hover:border-white/40 focus:border-white px-1 py-0.5 w-64 transition-all">
          <span class="text-[10px] bg-blue-800/80 text-blue-200 px-2 py-0.5 rounded-full border border-blue-400/30 flex items-center gap-1">
            <i class="fas fa-cloud-check text-emerald-300"></i> Auto-Saved
          </span>
        </div>
      </div>

      <!-- Quick Action Icons -->
      <div class="flex items-center gap-1.5 text-xs text-blue-100">
        <button id="btn-quick-save" class="app-top-btn" title="Save Document (Ctrl+S)"><i class="fas fa-save"></i></button>
        <button id="btn-quick-undo" class="app-top-btn" title="Undo (Ctrl+Z)"><i class="fas fa-undo"></i></button>
        <button id="btn-quick-redo" class="app-top-btn" title="Redo (Ctrl+Y)"><i class="fas fa-redo"></i></button>
        <div class="h-4 w-[1px] bg-blue-400/40 mx-1"></div>
        <button id="btn-quick-print" class="app-top-btn" title="Print / PDF"><i class="fas fa-print"></i></button>
        <button id="btn-quick-export" class="app-top-btn" title="Download Document"><i class="fas fa-download"></i></button>
      </div>
    </div>

    <!-- Ribbon Tabs Bar -->
    <div class="bg-[#f0f4f9] border-b border-slate-300 px-3 flex items-center gap-1 shrink-0 text-xs">
      <button class="ribbon-tab-btn bg-[#185abd] text-white font-bold px-3 py-1.5 rounded-t" data-tab="file">
        <i class="fas fa-folder-open mr-1"></i> File
      </button>
      <button class="ribbon-tab-btn px-3 py-1.5 font-semibold text-slate-700 hover:text-blue-700 active-tab" data-tab="home">Home</button>
      <button class="ribbon-tab-btn px-3 py-1.5 font-semibold text-slate-700 hover:text-blue-700" data-tab="insert">Insert</button>
      <button class="ribbon-tab-btn px-3 py-1.5 font-semibold text-slate-700 hover:text-blue-700" data-tab="layout">Layout</button>
      <button class="ribbon-tab-btn px-3 py-1.5 font-semibold text-slate-700 hover:text-blue-700" data-tab="review">Review</button>
      <button class="ribbon-tab-btn px-3 py-1.5 font-semibold text-slate-700 hover:text-blue-700" data-tab="view">View</button>
    </div>

    <!-- Ribbon Action Panels Container -->
    <div id="ribbon-panels" class="bg-[#f8fafc] border-b border-slate-300 px-3 py-2 flex items-center shrink-0 min-h-[58px] overflow-x-auto shadow-inner text-xs">
      <!-- Injected via renderRibbonPanel() -->
    </div>

    <!-- Floating Find & Replace Bar -->
    <div id="find-replace-bar" class="hidden bg-[#ffffff] border-b border-slate-300 px-4 py-2 flex items-center gap-2 text-xs shadow-md z-30 shrink-0">
      <div class="flex items-center gap-1 bg-slate-100 border border-slate-300 rounded px-2 py-1">
        <i class="fas fa-search text-slate-400"></i>
        <input id="find-input" type="text" placeholder="Find in document..." class="bg-transparent outline-none text-xs w-40">
        <span id="find-count" class="text-[10px] text-slate-500 font-mono">0/0</span>
      </div>
      <button id="btn-find-prev" class="p-1 hover:bg-slate-200 rounded" title="Previous"><i class="fas fa-chevron-up"></i></button>
      <button id="btn-find-next" class="p-1 hover:bg-slate-200 rounded" title="Next"><i class="fas fa-chevron-down"></i></button>
      <div class="h-4 w-[1px] bg-slate-300 mx-1"></div>
      <div class="flex items-center gap-1 bg-slate-100 border border-slate-300 rounded px-2 py-1">
        <input id="replace-input" type="text" placeholder="Replace with..." class="bg-transparent outline-none text-xs w-36">
      </div>
      <button id="btn-replace-one" class="px-2 py-1 bg-slate-200 hover:bg-slate-300 rounded font-semibold text-[11px]">Replace</button>
      <button id="btn-replace-all" class="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold text-[11px]">Replace All</button>
      <button id="btn-find-close" class="ml-auto text-slate-400 hover:text-slate-700 p-1"><i class="fas fa-times"></i></button>
    </div>

    <!-- Horizontal Top Ruler -->
    <div id="word-ruler" class="bg-[#e2e8f0] border-b border-slate-300 h-5 flex items-center justify-center shrink-0 relative overflow-hidden select-none">
      <div class="flex items-center text-[9px] font-mono text-slate-500 tracking-widest pointer-events-none" style="width:794px;">
        <span class="w-[99px] text-center border-r border-slate-400">1"</span>
        <span class="w-[99px] text-center border-r border-slate-400">2"</span>
        <span class="w-[99px] text-center border-r border-slate-400">3"</span>
        <span class="w-[99px] text-center border-r border-slate-400">4"</span>
        <span class="w-[99px] text-center border-r border-slate-400">5"</span>
        <span class="w-[99px] text-center border-r border-slate-400">6"</span>
        <span class="w-[99px] text-center border-r border-slate-400">7"</span>
        <span class="w-[99px] text-center">8"</span>
      </div>
    </div>

    <!-- Main Document Canvas Viewport -->
    <div id="word-canvas-viewport" class="flex-1 overflow-y-auto overflow-x-auto bg-[#cbd5e1] p-8 flex justify-center">
      <div id="word-paper-container" class="transition-transform duration-100 origin-top">
        <div id="word-paper" contenteditable="true" spellcheck="true"
             class="bg-white text-slate-900 shadow-2xl rounded-sm outline-none transition-all"
             style="width:794px; min-height:1123px; padding:72px 90px; font-family:'Georgia', serif; font-size:14px; line-height:1.75;">
        </div>
      </div>
    </div>

    <!-- Bottom Status Bar -->
    <div class="bg-[#185abd] text-blue-100 px-4 py-1.5 flex items-center justify-between text-[11px] shrink-0 font-sans shadow-md">
      <div class="flex items-center gap-3">
        <span id="page-count-badge"><i class="fas fa-file-alt mr-1"></i>Page 1 of 1</span>
        <span class="text-blue-300">|</span>
        <button id="btn-word-stats" class="hover:underline cursor-pointer" title="View Detailed Statistics">
          <span id="live-word-count">0 words</span>
        </button>
        <span class="text-blue-300">|</span>
        <span id="live-char-count">0 characters</span>
      </div>

      <div class="flex items-center gap-3">
        <span class="flex items-center gap-1.5 text-blue-200">
          <i class="fas fa-spell-check text-emerald-300"></i> English (UK/Kenya)
        </span>
        <span class="text-blue-300">|</span>
        <!-- Zoom Controls -->
        <div class="flex items-center gap-1.5">
          <button id="btn-zoom-out" class="w-5 h-5 rounded hover:bg-white/20 flex items-center justify-center font-bold">-</button>
          <span id="zoom-text" class="w-10 text-center font-mono">100%</span>
          <button id="btn-zoom-in" class="w-5 h-5 rounded hover:bg-white/20 flex items-center justify-center font-bold">+</button>
        </div>
      </div>
    </div>

    <!-- Statistics Modal -->
    <div id="stats-modal" class="hidden absolute inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div class="bg-white rounded-2xl p-6 w-80 shadow-2xl border border-slate-200 text-slate-800">
        <div class="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
          <h3 class="font-bold text-sm text-[#185abd] flex items-center gap-2">
            <i class="fas fa-chart-bar"></i> Document Statistics
          </h3>
          <button id="btn-close-stats" class="text-slate-400 hover:text-slate-700"><i class="fas fa-times"></i></button>
        </div>
        <div class="space-y-2 text-xs">
          <div class="flex justify-between py-1 border-b border-slate-100"><span>Words:</span><b id="stat-words" class="font-mono">0</b></div>
          <div class="flex justify-between py-1 border-b border-slate-100"><span>Characters (with spaces):</span><b id="stat-chars" class="font-mono">0</b></div>
          <div class="flex justify-between py-1 border-b border-slate-100"><span>Characters (no spaces):</span><b id="stat-chars-nospaces" class="font-mono">0</b></div>
          <div class="flex justify-between py-1 border-b border-slate-100"><span>Paragraphs:</span><b id="stat-paras" class="font-mono">0</b></div>
          <div class="flex justify-between py-1 border-b border-slate-100"><span>Estimated Pages:</span><b id="stat-pages" class="font-mono">1</b></div>
          <div class="flex justify-between py-1"><span>Reading Time:</span><b id="stat-time" class="font-mono text-emerald-600">~1 min</b></div>
        </div>
        <button id="btn-ok-stats" class="w-full mt-5 bg-[#185abd] hover:bg-[#124285] text-white py-2 rounded-xl text-xs font-bold transition-all">Close</button>
      </div>
    </div>

    <!-- Symbols Insert Modal -->
    <div id="symbols-modal" class="hidden absolute inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div class="bg-white rounded-2xl p-6 w-96 shadow-2xl border border-slate-200 text-slate-800">
        <div class="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
          <h3 class="font-bold text-sm text-[#185abd] flex items-center gap-2">
            <i class="fas fa-square-root-alt"></i> Insert Scientific & Math Symbol
          </h3>
          <button id="btn-close-symbols" class="text-slate-400 hover:text-slate-700"><i class="fas fa-times"></i></button>
        </div>
        <div class="grid grid-cols-6 gap-2 text-center text-base" id="symbols-grid">
          ${['π','θ','√','∑','±','≠','≤','≥','∞','°','α','β','γ','δ','Δ','λ','μ','Ω','≈','∫','∂','÷','×','‰','℃','℉','™','©','®','§','→','⇌'].map(s => `
            <button class="symbol-btn p-2 hover:bg-blue-50 hover:text-blue-600 border border-slate-200 rounded-lg font-serif transition-colors">${s}</button>
          `).join('')}
        </div>
      </div>
    </div>

    <!-- File Management Modal / Drawer -->
    <div id="file-modal" class="hidden absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
      <div class="bg-[#ffffff] rounded-2xl w-[600px] max-h-[500px] flex flex-col shadow-2xl border border-slate-300 overflow-hidden">
        <div class="bg-[#185abd] text-white px-5 py-3 flex items-center justify-between">
          <div class="font-bold text-sm flex items-center gap-2">
            <i class="fas fa-folder"></i> Dawamu Documents Storage
          </div>
          <button id="btn-close-file-modal" class="text-white/70 hover:text-white"><i class="fas fa-times"></i></button>
        </div>
        <div class="p-5 flex-1 overflow-y-auto">
          <div class="mb-4 flex items-center justify-between">
            <span class="text-xs font-bold text-slate-600 uppercase tracking-wider">Saved Student Documents</span>
            <button id="btn-save-as-new" class="text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm">
              <i class="fas fa-plus"></i> Save Current as New
            </button>
          </div>
          <div id="saved-docs-list" class="space-y-2 text-xs">
            <!-- Populated via loadSavedDocsList() -->
          </div>
        </div>
      </div>
    </div>
  `;

  // Inject Custom Styles
  const styleEl = document.createElement('style');
  styleEl.textContent = `
    .app-top-btn {
      padding: 4px 7px;
      border-radius: 4px;
      transition: all 0.15s;
      cursor: pointer;
    }
    .app-top-btn:hover { background: rgba(255,255,255,0.2); }
    .ribbon-tab-btn.active-tab {
      background: #f8fafc;
      border-bottom: 2px solid #185abd;
      color: #185abd;
    }
    .ribbon-action-btn {
      display: inline-flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4px 6px;
      border-radius: 6px;
      background: transparent;
      border: 1px solid transparent;
      color: #334155;
      font-size: 11px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.15s;
    }
    .ribbon-action-btn:hover { background: #e2e8f0; border-color: #cbd5e1; color: #0f172a; }
    .ribbon-action-btn:active { background: #cbd5e1; }
    .ribbon-mini-btn {
      padding: 3px 6px;
      border-radius: 4px;
      font-size: 11px;
      color: #334155;
      cursor: pointer;
      transition: all 0.12s;
    }
    .ribbon-mini-btn:hover { background: #e2e8f0; }
    .ribbon-group-divider {
      height: 38px;
      width: 1px;
      background: #cbd5e1;
      margin: 0 6px;
    }
    #word-paper h1 { font-size: 26px; font-weight: 800; margin: 16px 0 8px 0; color: #1e293b; }
    #word-paper h2 { font-size: 20px; font-weight: 700; margin: 14px 0 6px 0; color: #185abd; }
    #word-paper h3 { font-size: 16px; font-weight: 600; margin: 10px 0 4px 0; color: #334155; }
    #word-paper p  { margin: 6px 0; }
    #word-paper ul { list-style-type: disc; padding-left: 28px; margin: 6px 0; }
    #word-paper ol { list-style-type: decimal; padding-left: 28px; margin: 6px 0; }
    #word-paper table { width: 100%; border-collapse: collapse; margin: 12px 0; }
    #word-paper table td, #word-paper table th { border: 1px solid #cbd5e1; padding: 6px 10px; }
    #word-paper table th { background: #f1f5f9; font-weight: 700; }
  `;
  root.appendChild(styleEl);

  // References
  const paper = root.querySelector('#word-paper');
  const paperContainer = root.querySelector('#word-paper-container');
  const ribbonPanels = root.querySelector('#ribbon-panels');
  const titleInput = root.querySelector('#word-doc-title');
  const liveWordCount = root.querySelector('#live-word-count');
  const liveCharCount = root.querySelector('#live-char-count');
  const pageCountBadge = root.querySelector('#page-count-badge');
  const zoomText = root.querySelector('#zoom-text');
  const findReplaceBar = root.querySelector('#find-replace-bar');

  // Load default template (Academic Essay)
  paper.innerHTML = TEMPLATES.essay.content;
  currentDocTitle = TEMPLATES.essay.title;
  titleInput.value = currentDocTitle;

  /* ═══════════════════════════════════════════════════
     RIBBON PANELS RENDERER
  ═══════════════════════════════════════════════════ */
  function renderRibbonPanel() {
    if (activeRibbonTab === 'home') {
      ribbonPanels.innerHTML = `
        <!-- Clipboard Group -->
        <div class="flex items-center gap-1">
          <button class="ribbon-mini-btn" data-cmd="paste" title="Paste"><i class="fas fa-paste text-blue-600"></i></button>
          <button class="ribbon-mini-btn" data-cmd="copy" title="Copy"><i class="fas fa-copy"></i></button>
          <button class="ribbon-mini-btn" data-cmd="cut" title="Cut"><i class="fas fa-cut"></i></button>
        </div>

        <div class="ribbon-group-divider"></div>

        <!-- Typography: Font & Size -->
        <div class="flex flex-col gap-1">
          <div class="flex items-center gap-1">
            <select id="sel-font-family" class="bg-white border border-slate-300 rounded px-2 py-0.5 text-xs text-slate-700 outline-none w-32 cursor-pointer">
              <option value="Georgia, serif">Georgia</option>
              <option value="'Times New Roman', serif">Times New Roman</option>
              <option value="Arial, sans-serif">Arial</option>
              <option value="'Calibri', sans-serif">Calibri</option>
              <option value="'Garamond', serif">Garamond</option>
              <option value="'Courier New', monospace">Courier New</option>
              <option value="'Comic Sans MS', cursive">Comic Sans</option>
            </select>

            <select id="sel-font-size" class="bg-white border border-slate-300 rounded px-2 py-0.5 text-xs text-slate-700 outline-none w-14 cursor-pointer">
              <option value="10px">10</option>
              <option value="12px">12</option>
              <option value="14px" selected>14</option>
              <option value="16px">16</option>
              <option value="18px">18</option>
              <option value="20px">20</option>
              <option value="24px">24</option>
              <option value="28px">28</option>
              <option value="36px">36</option>
              <option value="48px">48</option>
            </select>

            <button class="ribbon-mini-btn font-bold" id="btn-grow-font" title="Increase Font Size">A<sup>+</sup></button>
            <button class="ribbon-mini-btn font-bold" id="btn-shrink-font" title="Decrease Font Size">A<sup>-</sup></button>
          </div>

          <!-- Bold, Italic, Underline, Strike, Sub, Super, Colors -->
          <div class="flex items-center gap-1">
            <button class="ribbon-mini-btn font-bold" data-cmd="bold" title="Bold (Ctrl+B)"><i class="fas fa-bold"></i></button>
            <button class="ribbon-mini-btn italic" data-cmd="italic" title="Italic (Ctrl+I)"><i class="fas fa-italic"></i></button>
            <button class="ribbon-mini-btn underline" data-cmd="underline" title="Underline (Ctrl+U)"><i class="fas fa-underline"></i></button>
            <button class="ribbon-mini-btn line-through" data-cmd="strikeThrough" title="Strikethrough"><i class="fas fa-strikethrough"></i></button>
            <button class="ribbon-mini-btn" data-cmd="subscript" title="Subscript">x<sub>2</sub></button>
            <button class="ribbon-mini-btn" data-cmd="superscript" title="Superscript">x<sup>2</sup></button>

            <!-- Text Color -->
            <label class="flex items-center gap-0.5 cursor-pointer px-1 py-0.5 hover:bg-slate-200 rounded" title="Text Color">
              <i class="fas fa-font text-red-600 text-xs"></i>
              <input type="color" id="input-fore-color" value="#000000" class="w-4 h-4 border-0 cursor-pointer p-0 bg-transparent">
            </label>

            <!-- Highlight Color -->
            <label class="flex items-center gap-0.5 cursor-pointer px-1 py-0.5 hover:bg-slate-200 rounded" title="Text Highlight">
              <i class="fas fa-highlighter text-amber-500 text-xs"></i>
              <input type="color" id="input-hilite-color" value="#fef08a" class="w-4 h-4 border-0 cursor-pointer p-0 bg-transparent">
            </label>

            <button class="ribbon-mini-btn" data-cmd="removeFormat" title="Clear All Formatting"><i class="fas fa-eraser text-slate-500"></i></button>
          </div>
        </div>

        <div class="ribbon-group-divider"></div>

        <!-- Paragraph & Alignment -->
        <div class="flex flex-col gap-1">
          <div class="flex items-center gap-1">
            <button class="ribbon-mini-btn" data-cmd="justifyLeft" title="Align Left"><i class="fas fa-align-left"></i></button>
            <button class="ribbon-mini-btn" data-cmd="justifyCenter" title="Center"><i class="fas fa-align-center"></i></button>
            <button class="ribbon-mini-btn" data-cmd="justifyRight" title="Align Right"><i class="fas fa-align-right"></i></button>
            <button class="ribbon-mini-btn" data-cmd="justifyFull" title="Justify"><i class="fas fa-align-justify"></i></button>
            <div class="h-3 w-[1px] bg-slate-300 mx-0.5"></div>
            <!-- Line spacing selector -->
            <select id="sel-line-height" class="bg-white border border-slate-300 rounded px-1.5 py-0.5 text-[11px] text-slate-700 outline-none cursor-pointer" title="Line Spacing">
              <option value="1.2">1.0</option>
              <option value="1.5">1.15</option>
              <option value="1.75" selected>1.5</option>
              <option value="2.0">Double (2.0)</option>
            </select>
          </div>

          <div class="flex items-center gap-1">
            <button class="ribbon-mini-btn" data-cmd="insertUnorderedList" title="Bullets"><i class="fas fa-list-ul"></i></button>
            <button class="ribbon-mini-btn" data-cmd="insertOrderedList" title="Numbered List"><i class="fas fa-list-ol"></i></button>
            <button class="ribbon-mini-btn" data-cmd="outdent" title="Decrease Indent"><i class="fas fa-outdent"></i></button>
            <button class="ribbon-mini-btn" data-cmd="indent" title="Increase Indent"><i class="fas fa-indent"></i></button>
          </div>
        </div>

        <div class="ribbon-group-divider"></div>

        <!-- Styles Gallery -->
        <div class="flex items-center gap-1.5">
          <button class="px-2.5 py-1.5 bg-white border border-slate-300 hover:border-blue-500 rounded text-center" data-style="p">
            <div class="text-[11px] font-semibold text-slate-700">Normal</div>
          </button>
          <button class="px-2.5 py-1.5 bg-white border border-slate-300 hover:border-blue-500 rounded text-center" data-style="h1">
            <div class="text-[12px] font-extrabold text-[#185abd]">Heading 1</div>
          </button>
          <button class="px-2.5 py-1.5 bg-white border border-slate-300 hover:border-blue-500 rounded text-center" data-style="h2">
            <div class="text-[11px] font-bold text-[#1e3a8a]">Heading 2</div>
          </button>
          <button class="px-2.5 py-1.5 bg-white border border-slate-300 hover:border-blue-500 rounded text-center" data-style="h3">
            <div class="text-[10px] font-bold text-slate-600">Heading 3</div>
          </button>
        </div>
      `;
    } else if (activeRibbonTab === 'insert') {
      ribbonPanels.innerHTML = `
        <!-- Table -->
        <button id="btn-insert-table" class="ribbon-action-btn">
          <i class="fas fa-table text-blue-600 text-base mb-1"></i>
          <span>Table</span>
        </button>

        <!-- Image -->
        <button id="btn-insert-image" class="ribbon-action-btn">
          <i class="fas fa-image text-emerald-600 text-base mb-1"></i>
          <span>Picture</span>
        </button>

        <div class="ribbon-group-divider"></div>

        <!-- Symbols -->
        <button id="btn-open-symbols" class="ribbon-action-btn">
          <i class="fas fa-square-root-alt text-purple-600 text-base mb-1"></i>
          <span>Math Symbol</span>
        </button>

        <!-- Blockquote / Callout -->
        <button id="btn-insert-callout" class="ribbon-action-btn">
          <i class="fas fa-quote-right text-amber-600 text-base mb-1"></i>
          <span>Callout Box</span>
        </button>

        <!-- Horizontal Rule -->
        <button id="btn-insert-hr" class="ribbon-action-btn">
          <i class="fas fa-minus text-slate-600 text-base mb-1"></i>
          <span>Divider Line</span>
        </button>

        <div class="ribbon-group-divider"></div>

        <!-- Date & Time -->
        <button id="btn-insert-date" class="ribbon-action-btn">
          <i class="fas fa-calendar-alt text-sky-600 text-base mb-1"></i>
          <span>Date Stamp</span>
        </button>

        <!-- Hyperlink -->
        <button id="btn-insert-link" class="ribbon-action-btn">
          <i class="fas fa-link text-indigo-600 text-base mb-1"></i>
          <span>Link (Ctrl+K)</span>
        </button>

        <!-- Page Break -->
        <button id="btn-insert-break" class="ribbon-action-btn">
          <i class="fas fa-file-invoice text-rose-600 text-base mb-1"></i>
          <span>Page Break</span>
        </button>
      `;
    } else if (activeRibbonTab === 'layout') {
      ribbonPanels.innerHTML = `
        <!-- Margins -->
        <div class="flex flex-col items-center gap-1">
          <span class="text-[10px] text-slate-500 uppercase font-bold">Margins</span>
          <select id="sel-margins" class="bg-white border border-slate-300 rounded px-2 py-1 text-xs text-slate-700 outline-none cursor-pointer">
            <option value="normal">Normal (1.0 inch)</option>
            <option value="narrow">Narrow (0.5 inch)</option>
            <option value="wide">Wide (1.5 inch)</option>
          </select>
        </div>

        <div class="ribbon-group-divider"></div>

        <!-- Orientation -->
        <div class="flex flex-col items-center gap-1">
          <span class="text-[10px] text-slate-500 uppercase font-bold">Orientation</span>
          <select id="sel-orientation" class="bg-white border border-slate-300 rounded px-2 py-1 text-xs text-slate-700 outline-none cursor-pointer">
            <option value="portrait">Portrait (A4)</option>
            <option value="landscape">Landscape (A4)</option>
          </select>
        </div>

        <div class="ribbon-group-divider"></div>

        <!-- Paper Themes -->
        <div class="flex flex-col items-center gap-1">
          <span class="text-[10px] text-slate-500 uppercase font-bold">Page Color</span>
          <div class="flex items-center gap-1.5">
            <button class="w-6 h-6 rounded-full border border-slate-300 bg-white" data-paper-bg="#ffffff" title="Classic White"></button>
            <button class="w-6 h-6 rounded-full border border-slate-300 bg-[#fdfbf7]" data-paper-bg="#fdfbf7" title="Ivory Cream"></button>
            <button class="w-6 h-6 rounded-full border border-slate-300 bg-[#fef3c7]" data-paper-bg="#fef3c7" title="Warm Eye-Care"></button>
            <button class="w-6 h-6 rounded-full border border-slate-300 bg-[#1e293b]" data-paper-bg="#1e293b" title="Dark Slate Mode"></button>
          </div>
        </div>
      `;
    } else if (activeRibbonTab === 'review') {
      ribbonPanels.innerHTML = `
        <!-- Statistics -->
        <button id="btn-open-stats-modal" class="ribbon-action-btn">
          <i class="fas fa-chart-bar text-blue-600 text-base mb-1"></i>
          <span>Word Count</span>
        </button>

        <!-- Find & Replace -->
        <button id="btn-toggle-find" class="ribbon-action-btn">
          <i class="fas fa-search text-emerald-600 text-base mb-1"></i>
          <span>Find & Replace</span>
        </button>

        <div class="ribbon-group-divider"></div>

        <!-- Text-to-Speech Read Aloud -->
        <button id="btn-read-aloud" class="ribbon-action-btn">
          <i class="fas fa-volume-up text-purple-600 text-base mb-1"></i>
          <span>Read Aloud</span>
        </button>

        <!-- Change Case -->
        <div class="flex flex-col items-center gap-1">
          <span class="text-[10px] text-slate-500 uppercase font-bold">Change Case</span>
          <div class="flex items-center gap-1">
            <button class="ribbon-mini-btn font-semibold" id="btn-case-upper">UPPER</button>
            <button class="ribbon-mini-btn font-semibold" id="btn-case-lower">lower</button>
            <button class="ribbon-mini-btn font-semibold" id="btn-case-title">Title Case</button>
          </div>
        </div>
      `;
    } else if (activeRibbonTab === 'view') {
      ribbonPanels.innerHTML = `
        <!-- Ruler Toggle -->
        <button id="btn-toggle-ruler" class="ribbon-action-btn ${showRuler ? 'bg-blue-100 border-blue-400 text-blue-700' : ''}">
          <i class="fas fa-ruler-horizontal text-base mb-1"></i>
          <span>Ruler</span>
        </button>

        <div class="ribbon-group-divider"></div>

        <!-- Zoom Presets -->
        <div class="flex flex-col items-center gap-1">
          <span class="text-[10px] text-slate-500 uppercase font-bold">Zoom Preset</span>
          <div class="flex items-center gap-1">
            <button class="ribbon-mini-btn font-mono" data-zoom="0.75">75%</button>
            <button class="ribbon-mini-btn font-mono" data-zoom="1.0">100%</button>
            <button class="ribbon-mini-btn font-mono" data-zoom="1.25">125%</button>
            <button class="ribbon-mini-btn font-mono" data-zoom="1.5">150%</button>
          </div>
        </div>

        <div class="ribbon-group-divider"></div>

        <!-- Focus Mode -->
        <button id="btn-focus-mode" class="ribbon-action-btn">
          <i class="fas fa-expand-alt text-amber-600 text-base mb-1"></i>
          <span>Focus Mode</span>
        </button>
      `;
    } else if (activeRibbonTab === 'file') {
      ribbonPanels.innerHTML = `
        <!-- New Document -->
        <div class="flex items-center gap-2">
          <button class="ribbon-action-btn" id="btn-file-new-blank">
            <i class="fas fa-plus-circle text-blue-600 text-base mb-1"></i>
            <span>Blank</span>
          </button>
          <button class="ribbon-action-btn" id="btn-file-new-essay">
            <i class="fas fa-book-open text-purple-600 text-base mb-1"></i>
            <span>Essay</span>
          </button>
          <button class="ribbon-action-btn" id="btn-file-new-lab">
            <i class="fas fa-flask text-emerald-600 text-base mb-1"></i>
            <span>Lab Report</span>
          </button>
          <button class="ribbon-action-btn" id="btn-file-new-letter">
            <i class="fas fa-envelope text-amber-600 text-base mb-1"></i>
            <span>Formal Letter</span>
          </button>
        </div>

        <div class="ribbon-group-divider"></div>

        <!-- Document Storage -->
        <button id="btn-open-saved-docs" class="ribbon-action-btn">
          <i class="fas fa-folder text-indigo-600 text-base mb-1"></i>
          <span>Open Saved</span>
        </button>

        <button id="btn-export-html" class="ribbon-action-btn">
          <i class="fas fa-file-code text-rose-600 text-base mb-1"></i>
          <span>Export HTML</span>
        </button>

        <button id="btn-export-txt" class="ribbon-action-btn">
          <i class="fas fa-file-alt text-slate-600 text-base mb-1"></i>
          <span>Export TXT</span>
        </button>

        <button id="btn-print-doc" class="ribbon-action-btn">
          <i class="fas fa-print text-emerald-600 text-base mb-1"></i>
          <span>Print / PDF</span>
        </button>
      `;
    }

    wireRibbonEvents();
  }

  /* ═══════════════════════════════════════════════════
     EVENT WIRING
  ═══════════════════════════════════════════════════ */
  function wireRibbonEvents() {
    // Basic execCommands
    ribbonPanels.querySelectorAll('[data-cmd]').forEach(btn => {
      btn.addEventListener('click', () => {
        paper.focus();
        document.execCommand(btn.dataset.cmd, false, null);
        updateDocumentMetrics();
      });
    });

    // Font Family
    const selFont = ribbonPanels.querySelector('#sel-font-family');
    if (selFont) {
      selFont.addEventListener('change', (e) => {
        paper.focus();
        document.execCommand('fontName', false, e.target.value);
      });
    }

    // Font Size
    const selSize = ribbonPanels.querySelector('#sel-font-size');
    if (selSize) {
      selSize.addEventListener('change', (e) => {
        paper.focus();
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
          const span = document.createElement('span');
          span.style.fontSize = e.target.value;
          const range = sel.getRangeAt(0);
          span.appendChild(range.extractContents());
          range.insertNode(span);
        } else {
          paper.style.fontSize = e.target.value;
        }
      });
    }

    // Grow / Shrink Font
    ribbonPanels.querySelector('#btn-grow-font')?.addEventListener('click', () => {
      const cur = parseInt(paper.style.fontSize || '14');
      paper.style.fontSize = (cur + 2) + 'px';
    });
    ribbonPanels.querySelector('#btn-shrink-font')?.addEventListener('click', () => {
      const cur = parseInt(paper.style.fontSize || '14');
      if (cur > 8) paper.style.fontSize = (cur - 2) + 'px';
    });

    // Text & Hilite Color
    ribbonPanels.querySelector('#input-fore-color')?.addEventListener('input', (e) => {
      paper.focus();
      document.execCommand('foreColor', false, e.target.value);
    });
    ribbonPanels.querySelector('#input-hilite-color')?.addEventListener('input', (e) => {
      paper.focus();
      document.execCommand('hiliteColor', false, e.target.value);
    });

    // Line Height
    ribbonPanels.querySelector('#sel-line-height')?.addEventListener('change', (e) => {
      paper.style.lineHeight = e.target.value;
    });

    // Heading Styles
    ribbonPanels.querySelectorAll('[data-style]').forEach(btn => {
      btn.addEventListener('click', () => {
        paper.focus();
        document.execCommand('formatBlock', false, btn.dataset.style);
      });
    });

    // Insert Table
    ribbonPanels.querySelector('#btn-insert-table')?.addEventListener('click', () => {
      const rows = prompt('Number of rows:', '3') || 3;
      const cols = prompt('Number of columns:', '3') || 3;
      let html = '<table style="width:100%; border-collapse:collapse; margin:12px 0;"><thead><tr>';
      for (let c = 0; c < cols; c++) html += `<th style="border:1px solid #cbd5e1; padding:6px 10px; background:#f1f5f9;">Header ${c+1}</th>`;
      html += '</tr></thead><tbody>';
      for (let r = 0; r < rows; r++) {
        html += '<tr>';
        for (let c = 0; c < cols; c++) html += `<td style="border:1px solid #cbd5e1; padding:6px 10px;">Cell</td>`;
        html += '</tr>';
      }
      html += '</tbody></table><p><br></p>';
      document.execCommand('insertHTML', false, html);
      updateDocumentMetrics();
    });

    // Insert Image
    ribbonPanels.querySelector('#btn-insert-image')?.addEventListener('click', () => {
      const url = prompt('Enter Image URL or Path (e.g., assets/dawamu-logo.png):', 'assets/dawamu-logo.png');
      if (url) {
        document.execCommand('insertHTML', false, `<div style="text-align:center; margin:16px 0;"><img src="${url}" alt="Document Image" style="max-width:85%; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.1);"><br><small style="color:#64748b;">Figure: Image illustration</small></div><p><br></p>`);
      }
    });

    // Insert Callout Box
    ribbonPanels.querySelector('#btn-insert-callout')?.addEventListener('click', () => {
      document.execCommand('insertHTML', false, `
        <div style="margin:14px 0; padding:12px 18px; border-left:4px solid #185abd; background:#f0f7ff; border-radius:0 8px 8px 0; color:#1e293b;">
          <b>Note:</b> Enter your key takeaway or teacher reference here.
        </div><p><br></p>
      `);
    });

    // Insert Divider
    ribbonPanels.querySelector('#btn-insert-hr')?.addEventListener('click', () => {
      document.execCommand('insertHorizontalRule');
    });

    // Insert Date
    ribbonPanels.querySelector('#btn-insert-date')?.addEventListener('click', () => {
      const dateStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
      document.execCommand('insertText', false, dateStr);
    });

    // Insert Link
    ribbonPanels.querySelector('#btn-insert-link')?.addEventListener('click', () => {
      const url = prompt('Enter Hyperlink URL (e.g. https://en.wikipedia.org):', 'https://');
      if (url) document.execCommand('createLink', false, url);
    });

    // Page Break
    ribbonPanels.querySelector('#btn-insert-break')?.addEventListener('click', () => {
      document.execCommand('insertHTML', false, `
        <div style="page-break-after:always; border-bottom:2px dashed #94a3b8; margin:24px 0; text-align:center; font-size:10px; color:#94a3b8; user-select:none;">
          --- PAGE BREAK ---
        </div><p><br></p>
      `);
    });

    // Symbols Modal
    ribbonPanels.querySelector('#btn-open-symbols')?.addEventListener('click', () => {
      root.querySelector('#symbols-modal').classList.remove('hidden');
    });

    // Layout Margins
    ribbonPanels.querySelector('#sel-margins')?.addEventListener('change', (e) => {
      if (e.target.value === 'narrow') paper.style.padding = '36px 45px';
      else if (e.target.value === 'wide') paper.style.padding = '100px 120px';
      else paper.style.padding = '72px 90px';
    });

    // Layout Orientation
    ribbonPanels.querySelector('#sel-orientation')?.addEventListener('change', (e) => {
      if (e.target.value === 'landscape') {
        paper.style.width = '1120px';
        paper.style.minHeight = '794px';
      } else {
        paper.style.width = '794px';
        paper.style.minHeight = '1123px';
      }
    });

    // Paper Backgrounds
    ribbonPanels.querySelectorAll('[data-paper-bg]').forEach(btn => {
      btn.addEventListener('click', () => {
        const bg = btn.dataset.paperBg;
        paper.style.backgroundColor = bg;
        if (bg === '#1e293b') {
          paper.style.color = '#f8fafc';
        } else {
          paper.style.color = '#0f172a';
        }
      });
    });

    // Review Tools
    ribbonPanels.querySelector('#btn-open-stats-modal')?.addEventListener('click', openStatsModal);
    ribbonPanels.querySelector('#btn-toggle-find')?.addEventListener('click', () => {
      findReplaceBar.classList.toggle('hidden');
      if (!findReplaceBar.classList.contains('hidden')) {
        root.querySelector('#find-input').focus();
      }
    });

    // Text to Speech Read Aloud
    ribbonPanels.querySelector('#btn-read-aloud')?.addEventListener('click', () => {
      if ('speechSynthesis' in window) {
        if (window.speechSynthesis.speaking) {
          window.speechSynthesis.cancel();
          return;
        }
        const text = paper.innerText || '';
        if (!text.trim()) return;
        const utter = new SpeechSynthesisUtterance(text);
        utter.rate = 1.0;
        utter.pitch = 1.0;
        window.speechSynthesis.speak(utter);
      } else {
        alert('Speech Synthesis is not supported in this runtime.');
      }
    });

    // Case Changes
    ribbonPanels.querySelector('#btn-case-upper')?.addEventListener('click', () => {
      transformSelection(t => t.toUpperCase());
    });
    ribbonPanels.querySelector('#btn-case-lower')?.addEventListener('click', () => {
      transformSelection(t => t.toLowerCase());
    });
    ribbonPanels.querySelector('#btn-case-title')?.addEventListener('click', () => {
      transformSelection(t => t.replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.substr(1).toLowerCase()));
    });

    // View Options
    ribbonPanels.querySelector('#btn-toggle-ruler')?.addEventListener('click', () => {
      showRuler = !showRuler;
      root.querySelector('#word-ruler').style.display = showRuler ? 'flex' : 'none';
      renderRibbonPanel();
    });

    ribbonPanels.querySelectorAll('[data-zoom]').forEach(btn => {
      btn.addEventListener('click', () => {
        setZoom(parseFloat(btn.dataset.zoom));
      });
    });

    ribbonPanels.querySelector('#btn-focus-mode')?.addEventListener('click', () => {
      const topBar = root.querySelector('.bg-\\[\\#185abd\\]');
      const tabs = root.querySelector('.bg-\\[\\#f0f4f9\\]');
      const panels = root.querySelector('#ribbon-panels');
      const ruler = root.querySelector('#word-ruler');
      const isHidden = panels.style.display === 'none';
      panels.style.display = isHidden ? 'flex' : 'none';
      tabs.style.display = isHidden ? 'flex' : 'none';
      ruler.style.display = isHidden && showRuler ? 'flex' : 'none';
    });

    // File Action Buttons
    ribbonPanels.querySelector('#btn-file-new-blank')?.addEventListener('click', () => loadTemplate('blank'));
    ribbonPanels.querySelector('#btn-file-new-essay')?.addEventListener('click', () => loadTemplate('essay'));
    ribbonPanels.querySelector('#btn-file-new-lab')?.addEventListener('click', () => loadTemplate('lab'));
    ribbonPanels.querySelector('#btn-file-new-letter')?.addEventListener('click', () => loadTemplate('letter'));
    ribbonPanels.querySelector('#btn-open-saved-docs')?.addEventListener('click', openSavedDocsModal);
    ribbonPanels.querySelector('#btn-export-html')?.addEventListener('click', exportHtml);
    ribbonPanels.querySelector('#btn-export-txt')?.addEventListener('click', exportTxt);
    ribbonPanels.querySelector('#btn-print-doc')?.addEventListener('click', printDoc);
  }

  // Ribbon Tab Switching
  root.querySelectorAll('.ribbon-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      root.querySelectorAll('.ribbon-tab-btn').forEach(b => {
        if (b.dataset.tab !== 'file') b.classList.remove('active-tab');
      });
      activeRibbonTab = btn.dataset.tab;
      if (btn.dataset.tab !== 'file') btn.classList.add('active-tab');
      renderRibbonPanel();
    });
  });

  // Top App Bar Buttons
  root.querySelector('#btn-quick-save').addEventListener('click', saveDocument);
  root.querySelector('#btn-quick-undo').addEventListener('click', () => { document.execCommand('undo'); updateDocumentMetrics(); });
  root.querySelector('#btn-quick-redo').addEventListener('click', () => { document.execCommand('redo'); updateDocumentMetrics(); });
  root.querySelector('#btn-quick-print').addEventListener('click', printDoc);
  root.querySelector('#btn-quick-export').addEventListener('click', exportHtml);

  // Zoom Controls
  function setZoom(val) {
    zoomLevel = Math.max(0.5, Math.min(2.0, val));
    paperContainer.style.transform = `scale(${zoomLevel})`;
    zoomText.textContent = `${Math.round(zoomLevel * 100)}%`;
  }
  root.querySelector('#btn-zoom-in').addEventListener('click', () => setZoom(zoomLevel + 0.1));
  root.querySelector('#btn-zoom-out').addEventListener('click', () => setZoom(zoomLevel - 0.1));

  // Symbols Modal Wiring
  root.querySelector('#btn-close-symbols').addEventListener('click', () => {
    root.querySelector('#symbols-modal').classList.add('hidden');
  });
  root.querySelectorAll('.symbol-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      paper.focus();
      document.execCommand('insertText', false, btn.innerText);
      root.querySelector('#symbols-modal').classList.add('hidden');
    });
  });

  // Stats Modal Wiring
  function openStatsModal() {
    const text = paper.innerText || '';
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    const charsNoSpaces = text.replace(/\s+/g, '').length;
    const paras = paper.querySelectorAll('p, h1, h2, h3, blockquote, li').length || 1;
    const pages = Math.max(1, Math.ceil(paper.scrollHeight / 1123));

    root.querySelector('#stat-words').textContent = words.toLocaleString();
    root.querySelector('#stat-chars').textContent = chars.toLocaleString();
    root.querySelector('#stat-chars-nospaces').textContent = charsNoSpaces.toLocaleString();
    root.querySelector('#stat-paras').textContent = paras.toLocaleString();
    root.querySelector('#stat-pages').textContent = pages;
    root.querySelector('#stat-time').textContent = `~${Math.max(1, Math.round(words / 200))} min read`;

    root.querySelector('#stats-modal').classList.remove('hidden');
  }

  root.querySelector('#btn-word-stats').addEventListener('click', openStatsModal);
  root.querySelector('#btn-close-stats').addEventListener('click', () => root.querySelector('#stats-modal').classList.add('hidden'));
  root.querySelector('#btn-ok-stats').addEventListener('click', () => root.querySelector('#stats-modal').classList.add('hidden'));

  // Live Metrics Update
  function updateDocumentMetrics() {
    const text = paper.innerText || '';
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    const estPages = Math.max(1, Math.ceil(paper.scrollHeight / 1123));

    liveWordCount.textContent = `${words} word${words !== 1 ? 's' : ''}`;
    liveCharCount.textContent = `${chars} characters`;
    pageCountBadge.innerHTML = `<i class="fas fa-file-alt mr-1"></i>Page 1 of ${estPages}`;

    // Auto-save debounced
    clearTimeout(autoSaveTimeout);
    autoSaveTimeout = setTimeout(saveDocumentSilently, 1000);
  }

  paper.addEventListener('input', updateDocumentMetrics);

  // Text Case Transformation
  function transformSelection(fn) {
    const sel = window.getSelection();
    if (!sel.rangeCount) return;
    const text = sel.toString();
    if (text) document.execCommand('insertText', false, fn(text));
  }

  // Find & Replace Engine
  const findInput = root.querySelector('#find-input');
  const replaceInput = root.querySelector('#replace-input');
  const findCount = root.querySelector('#find-count');

  function doFind() {
    const query = findInput.value.trim();
    if (!query) {
      findCount.textContent = '0/0';
      return;
    }
    // Remove previous marks
    paper.querySelectorAll('mark.doc-search-hit').forEach(m => {
      const parent = m.parentNode;
      parent.replaceChild(document.createTextNode(m.innerText), m);
      parent.normalize();
    });

    const walker = document.createTreeWalker(paper, NodeFilter.SHOW_TEXT, null, false);
    let node;
    const hits = [];
    while (node = walker.nextNode()) {
      const idx = node.nodeValue.toLowerCase().indexOf(query.toLowerCase());
      if (idx !== -1) hits.push({ node, idx });
    }

    findMatches = hits;
    findCount.textContent = hits.length > 0 ? `1/${hits.length}` : '0/0';
    currentMatchIndex = 0;
  }

  findInput.addEventListener('input', doFind);
  root.querySelector('#btn-find-close').addEventListener('click', () => findReplaceBar.classList.add('hidden'));

  root.querySelector('#btn-replace-one').addEventListener('click', () => {
    const findText = findInput.value.trim();
    const repText = replaceInput.value;
    if (findText && paper.innerHTML.includes(findText)) {
      paper.innerHTML = paper.innerHTML.replace(findText, repText);
      updateDocumentMetrics();
      doFind();
    }
  });

  root.querySelector('#btn-replace-all').addEventListener('click', () => {
    const findText = findInput.value.trim();
    const repText = replaceInput.value;
    if (findText) {
      const regex = new RegExp(findText, 'gi');
      paper.innerHTML = paper.innerHTML.replace(regex, repText);
      updateDocumentMetrics();
      doFind();
    }
  });

  // Storage / Saved Docs
  function saveDocumentSilently() {
    try {
      const doc = {
        id: currentDocId,
        title: titleInput.value.trim() || 'Untitled.docx',
        content: paper.innerHTML,
        lastModified: new Date().toISOString()
      };
      localStorage.setItem('dawamu_word_current', JSON.stringify(doc));
      let docsList = JSON.parse(localStorage.getItem('dawamu_word_library') || '[]');
      const existingIdx = docsList.findIndex(d => d.id === currentDocId);
      if (existingIdx >= 0) docsList[existingIdx] = doc;
      else docsList.unshift(doc);
      localStorage.setItem('dawamu_word_library', JSON.stringify(docsList));
    } catch(e) {}
  }

  function saveDocument() {
    saveDocumentSilently();
    alert('Document "' + titleInput.value + '" saved to Dawamu OS Storage.');
  }

  function loadTemplate(tplKey) {
    const tpl = TEMPLATES[tplKey];
    if (tpl && confirm(`Load template "${tpl.title}"? Current unsaved edits will be replaced.`)) {
      currentDocId = 'doc_' + Date.now();
      paper.innerHTML = tpl.content;
      titleInput.value = tpl.title;
      updateDocumentMetrics();
    }
  }

  function openSavedDocsModal() {
    const listEl = root.querySelector('#saved-docs-list');
    let docs = [];
    try { docs = JSON.parse(localStorage.getItem('dawamu_word_library') || '[]'); } catch(e){}

    if (docs.length === 0) {
      listEl.innerHTML = `<div class="p-8 text-center text-slate-400 italic">No saved documents yet. Click "Save Current as New" to store this document.</div>`;
    } else {
      listEl.innerHTML = docs.map(d => `
        <div class="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-blue-400 bg-slate-50 hover:bg-white transition-all">
          <div class="flex items-center gap-3 cursor-pointer flex-1" data-load-id="${d.id}">
            <div class="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
              <i class="fas fa-file-word"></i>
            </div>
            <div>
              <div class="font-bold text-slate-800">${d.title}</div>
              <div class="text-[10px] text-slate-500">${new Date(d.lastModified).toLocaleDateString([], { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })}</div>
            </div>
          </div>
          <button class="text-rose-500 hover:text-rose-700 p-2" data-del-id="${d.id}" title="Delete"><i class="fas fa-trash-alt"></i></button>
        </div>
      `).join('');

      listEl.querySelectorAll('[data-load-id]').forEach(btn => {
        btn.addEventListener('click', () => {
          const doc = docs.find(d => d.id === btn.dataset.loadId);
          if (doc) {
            currentDocId = doc.id;
            titleInput.value = doc.title;
            paper.innerHTML = doc.content;
            updateDocumentMetrics();
            root.querySelector('#file-modal').classList.add('hidden');
          }
        });
      });

      listEl.querySelectorAll('[data-del-id]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (confirm('Delete this saved document?')) {
            docs = docs.filter(d => d.id !== btn.dataset.delId);
            localStorage.setItem('dawamu_word_library', JSON.stringify(docs));
            openSavedDocsModal();
          }
        });
      });
    }

    root.querySelector('#file-modal').classList.remove('hidden');
  }

  root.querySelector('#btn-close-file-modal').addEventListener('click', () => {
    root.querySelector('#file-modal').classList.add('hidden');
  });

  root.querySelector('#btn-save-as-new').addEventListener('click', () => {
    currentDocId = 'doc_' + Date.now();
    saveDocument();
    openSavedDocsModal();
  });

  // Export HTML
  function exportHtml() {
    const title = titleInput.value.replace(/\.[^/.]+$/, '');
    const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <style>
    body { font-family: 'Georgia', serif; font-size: 14px; line-height: 1.8; color: #1e293b; max-width: 800px; margin: 40px auto; padding: 0 40px; }
    h1 { font-size: 26px; color: #185abd; }
    h2 { font-size: 20px; color: #1e3a8a; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; }
    table td, table th { border: 1px solid #cbd5e1; padding: 8px 12px; }
    table th { background: #f1f5f9; }
    blockquote { border-left: 4px solid #185abd; padding: 10px 16px; background: #f8fafc; font-style: italic; }
  </style>
</head>
<body>
  ${paper.innerHTML}
</body>
</html>`;
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${title}.html`;
    a.click();
  }

  // Export Plain Text
  function exportTxt() {
    const title = titleInput.value.replace(/\.[^/.]+$/, '');
    const text = paper.innerText || '';
    const blob = new Blob([text], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${title}.txt`;
    a.click();
  }

  // Print Document
  function printDoc() {
    const w = window.open('', '_blank');
    const title = titleInput.value;
    w.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>${title}</title>
  <style>
    @media print {
      body { margin: 0; padding: 20mm; }
    }
    body { font-family: 'Georgia', serif; font-size: 14px; line-height: 1.75; color: #000; }
    h1 { font-size: 24px; color: #185abd; }
    h2 { font-size: 18px; color: #1e3a8a; }
    table { width: 100%; border-collapse: collapse; margin: 12px 0; }
    table td, table th { border: 1px solid #94a3b8; padding: 6px 10px; }
    blockquote { border-left: 4px solid #185abd; padding: 8px 14px; font-style: italic; }
  </style>
</head>
<body>
  ${paper.innerHTML}
</body>
</html>`);
    w.document.close();
    w.print();
  }

  // Keyboard Shortcuts: Ctrl+S, Ctrl+F, Ctrl+B, Ctrl+I, Ctrl+U, Ctrl+Z
  root.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      saveDocument();
    } else if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
      e.preventDefault();
      findReplaceBar.classList.remove('hidden');
      findInput.focus();
    }
  });

  // Initial Ribbon Render & Metrics
  renderRibbonPanel();
  updateDocumentMetrics();

  return root;
}
