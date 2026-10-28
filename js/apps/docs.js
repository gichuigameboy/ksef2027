/**
 * Dawamu OS - Homework Notes & Rich Text Editor App
 * Features:
 * - Local note creation, editing, and deletion with persistent storage (stateStore)
 * - Search filter for saved notes
 * - Formatting toolbar (Bold, Italic, Underline, Headings, Lists)
 * - Auto-saving with debounce indicator
 * - Support for opening external notes passed from File Explorer
 * - Export notes to plain text (.txt)
 * - Confirmation dialogs and status feedback
 */

import { stateStore } from '../os/state.js';

export function createDocsApp(options = {}) {
  const container = document.createElement('div');
  container.className = 'flex h-full bg-[#0a0f1d] text-slate-100 font-sans select-none overflow-hidden';

  let currentDocId = null;
  let noteSearchQuery = '';

  // Check if options passed a specific file
  if (options.fileName) {
    const list = stateStore.getState().documents;
    const existing = list.find(d => d.title.toLowerCase() === options.fileName.toLowerCase());
    if (existing) {
      currentDocId = existing.id;
    } else {
      const initialContent = typeof options.fileData === 'string'
        ? options.fileData
        : (typeof options.fileData?.content === 'string'
          ? options.fileData.content
          : `<p><b>${options.fileName}</b></p><p>Start typing your homework notes here...</p>`);
      const created = stateStore.saveDocument(
        null,
        options.fileName,
        initialContent
      );
      currentDocId = created.id;
    }
  } else {
    const docs = stateStore.getState().documents;
    if (docs.length > 0) currentDocId = docs[0].id;
  }

  container.innerHTML = `
    <!-- Documents Sidebar -->
    <div class="w-64 bg-[#040814] border-r border-white/10 p-3 flex flex-col gap-3 shrink-0">
      <div class="flex items-center justify-between">
        <h3 class="font-bold text-xs text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <i class="fas fa-sticky-note text-amber-400"></i> Study Notes
        </h3>
        <button id="doc-new-btn" class="bg-blue-600 hover:bg-blue-500 text-white text-xs px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 cursor-pointer transition-all active:scale-95">
          <i class="fas fa-plus text-[10px]"></i> New
        </button>
      </div>

      <!-- Search Notes Filter -->
      <div class="bg-slate-900 border border-white/10 rounded-xl px-2.5 py-1 flex items-center gap-2">
        <i class="fas fa-search text-slate-500 text-[10px]"></i>
        <input id="notes-search-input" type="text" placeholder="Search study notes..." class="bg-transparent outline-none text-xs text-white placeholder-slate-500 w-full">
      </div>

      <!-- Notes List -->
      <div id="docs-list" class="flex-1 overflow-y-auto space-y-1"></div>

      <!-- Sidebar Footer -->
      <div class="text-[11px] text-slate-400 border-t border-white/10 pt-2 flex items-center justify-between">
        <span id="doc-save-status" class="text-emerald-400 font-semibold flex items-center gap-1">
          <i class="fas fa-check-circle"></i> Auto-saved
        </span>
        <button id="doc-export-btn" class="hover:text-white cursor-pointer text-xs" title="Export as Text File">
          <i class="fas fa-download"></i> Export
        </button>
      </div>
    </div>

    <!-- Main Editor Area -->
    <div class="flex-1 flex flex-col bg-[#0b1326] overflow-hidden select-text">
      <!-- Formatting Toolbar -->
      <div class="bg-[#0e172e] border-b border-white/10 p-2 flex items-center gap-1 flex-wrap text-xs text-slate-200 shrink-0">
        <input type="text" id="doc-title-input" class="bg-[#040814] border border-white/10 rounded-lg px-3 py-1 font-semibold text-xs text-white focus:border-blue-500 outline-none mr-2 w-56" placeholder="Document Title...">

        <div class="h-4 w-[1px] bg-slate-700 mx-1"></div>

        <button class="fmt-btn p-1.5 hover:bg-slate-700/60 rounded cursor-pointer" data-cmd="bold" title="Bold (Ctrl+B)"><i class="fas fa-bold"></i></button>
        <button class="fmt-btn p-1.5 hover:bg-slate-700/60 rounded cursor-pointer" data-cmd="italic" title="Italic (Ctrl+I)"><i class="fas fa-italic"></i></button>
        <button class="fmt-btn p-1.5 hover:bg-slate-700/60 rounded cursor-pointer" data-cmd="underline" title="Underline (Ctrl+U)"><i class="fas fa-underline"></i></button>
        <button class="fmt-btn p-1.5 hover:bg-slate-700/60 rounded cursor-pointer" data-cmd="strikeThrough" title="Strikethrough"><i class="fas fa-strikethrough"></i></button>

        <div class="h-4 w-[1px] bg-slate-700 mx-1"></div>

        <button class="fmt-btn px-2 py-1 hover:bg-slate-700/60 rounded font-bold cursor-pointer" data-cmd="formatBlock" data-val="H2" title="Heading 2">H2</button>
        <button class="fmt-btn px-2 py-1 hover:bg-slate-700/60 rounded font-semibold cursor-pointer" data-cmd="formatBlock" data-val="P" title="Paragraph">P</button>

        <div class="h-4 w-[1px] bg-slate-700 mx-1"></div>

        <button class="fmt-btn p-1.5 hover:bg-slate-700/60 rounded cursor-pointer" data-cmd="insertUnorderedList" title="Bullet List"><i class="fas fa-list-ul"></i></button>
        <button class="fmt-btn p-1.5 hover:bg-slate-700/60 rounded cursor-pointer" data-cmd="insertOrderedList" title="Numbered List"><i class="fas fa-list-ol"></i></button>

        <div class="h-4 w-[1px] bg-slate-700 mx-1"></div>

        <button class="fmt-btn p-1.5 hover:bg-slate-700/60 rounded cursor-pointer" data-cmd="removeFormat" title="Clear Formatting"><i class="fas fa-eraser"></i></button>

        <div class="ml-auto text-[10px] text-slate-400 pr-2" id="doc-metrics">0 words • 0 chars</div>
      </div>

      <!-- Contenteditable Editor Canvas -->
      <div class="flex-1 p-6 overflow-y-auto bg-[#070b16]">
        <div id="doc-editor" contenteditable="true" spellcheck="false"
             class="max-w-3xl mx-auto min-h-[450px] bg-[#0c1428] border border-white/10 rounded-2xl p-8 outline-none text-slate-100 leading-relaxed text-sm shadow-2xl focus:border-blue-500/50">
        </div>
      </div>
    </div>
  `;

  const docsListEl = container.querySelector('#docs-list');
  const titleInput = container.querySelector('#doc-title-input');
  const editorEl = container.querySelector('#doc-editor');
  const saveStatusEl = container.querySelector('#doc-save-status');
  const searchInput = container.querySelector('#notes-search-input');
  const metricsEl = container.querySelector('#doc-metrics');

  const updateMetrics = () => {
    const text = editorEl.innerText || '';
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    metricsEl.textContent = `${words} word${words !== 1 ? 's' : ''} • ${chars} char${chars !== 1 ? 's' : ''}`;
  };

  const renderDocsList = () => {
    const allDocs = stateStore.getState().documents;
    const q = noteSearchQuery.toLowerCase();
    const filtered = allDocs.filter(d => d.title.toLowerCase().includes(q));

    if (filtered.length === 0) {
      docsListEl.innerHTML = `<div class="text-slate-500 text-xs italic text-center py-6">No notes found</div>`;
      return;
    }

    docsListEl.innerHTML = filtered
      .map(
        (doc) => `
      <div class="doc-item group p-2 rounded-xl cursor-pointer flex items-center justify-between text-xs transition-colors ${doc.id === currentDocId ? 'bg-blue-600/30 border border-blue-500/40 text-white font-semibold' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'}" data-doc-id="${doc.id}">
        <div class="flex items-center gap-2 truncate">
          <i class="fas fa-file-alt text-blue-400"></i>
          <span class="truncate">${doc.title}</span>
        </div>
        <button class="doc-del-btn opacity-0 group-hover:opacity-100 hover:text-rose-400 p-1 cursor-pointer" data-doc-id="${doc.id}" title="Delete Note">
          <i class="fas fa-trash-alt text-[10px]"></i>
        </button>
      </div>
    `
      )
      .join('');
  };

  const loadDoc = (docId) => {
    const list = stateStore.getState().documents;
    let doc = list.find((d) => d.id === docId);
    if (!doc && list.length > 0) {
      doc = list[0];
    }

    if (doc) {
      currentDocId = doc.id;
      titleInput.value = doc.title;
      editorEl.innerHTML = doc.content;
    } else {
      currentDocId = null;
      titleInput.value = '';
      editorEl.innerHTML = '<p class="text-slate-500 italic">No notes created yet. Click "+ New" in the sidebar to begin.</p>';
    }
    updateMetrics();
    renderDocsList();
  };

  let saveDebounceTimer;
  const triggerAutoSave = () => {
    saveStatusEl.innerHTML = `<i class="fas fa-spinner fa-spin text-amber-400"></i> Saving...`;
    updateMetrics();
    clearTimeout(saveDebounceTimer);
    saveDebounceTimer = setTimeout(() => {
      const title = titleInput.value.trim() || 'Untitled Homework';
      const content = editorEl.innerHTML;
      if (!currentDocId) {
        const saved = stateStore.saveDocument(null, title, content);
        currentDocId = saved.id;
      } else {
        stateStore.saveDocument(currentDocId, title, content);
      }
      saveStatusEl.innerHTML = `<i class="fas fa-check-circle text-emerald-400"></i> Auto-saved`;
      renderDocsList();
    }, 500);
  };

  // Search filter
  searchInput.addEventListener('input', () => {
    noteSearchQuery = searchInput.value.trim();
    renderDocsList();
  });

  // Attach Formatting Controls
  container.querySelectorAll('.fmt-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const cmd = btn.dataset.cmd;
      const val = btn.dataset.val || null;
      document.execCommand(cmd, false, val);
      editorEl.focus();
      triggerAutoSave();
    });
  });

  // Editor Input Auto-Save
  editorEl.addEventListener('input', triggerAutoSave);
  titleInput.addEventListener('input', triggerAutoSave);

  // Keyboard shortcut Ctrl+S
  container.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
      e.preventDefault();
      triggerAutoSave();
      if (window.dawamuDialogs && window.dawamuDialogs.toast) {
        window.dawamuDialogs.toast('Note saved to Dawamu OS Storage', 'success');
      }
    }
  });

  // New Doc Button
  container.querySelector('#doc-new-btn').addEventListener('click', () => {
    const newDoc = stateStore.saveDocument(null, 'New Homework Note', '<p>Start typing your lesson notes here...</p>');
    loadDoc(newDoc.id);
    titleInput.focus();
    titleInput.select();
  });

  // Export File Button
  container.querySelector('#doc-export-btn').addEventListener('click', () => {
    const text = editorEl.innerText;
    const blob = new Blob([text], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${(titleInput.value || 'homework-note').replace(/[^a-z0-9_-]/gi, '_')}.txt`;
    a.click();
    if (window.dawamuDialogs && window.dawamuDialogs.toast) {
      window.dawamuDialogs.toast(`Exported "${a.download}" successfully`, 'success');
    }
  });

  // Docs list click & delete handler
  docsListEl.addEventListener('click', async (e) => {
    const delBtn = e.target.closest('.doc-del-btn');
    if (delBtn) {
      e.stopPropagation();
      const id = delBtn.dataset.docId;
      const doc = stateStore.getState().documents.find(d => d.id === id);
      const title = doc?.title || 'this note';
      let confirmed = false;
      if (window.dawamuDialogs && window.dawamuDialogs.confirm) {
        confirmed = await window.dawamuDialogs.confirm(`Delete "${title}"? This cannot be undone.`);
      } else {
        confirmed = confirm(`Delete "${title}"?`);
      }
      if (confirmed) {
        stateStore.deleteDocument(id);
        if (currentDocId === id) {
          const remaining = stateStore.getState().documents;
          loadDoc(remaining.length > 0 ? remaining[0].id : null);
        } else {
          renderDocsList();
        }
        if (window.dawamuDialogs && window.dawamuDialogs.toast) {
          window.dawamuDialogs.toast(`Deleted note "${title}"`, 'info');
        }
      }
      return;
    }

    const item = e.target.closest('.doc-item');
    if (item) {
      loadDoc(item.dataset.docId);
    }
  });

  // Initial load
  loadDoc(currentDocId);

  return container;
}
