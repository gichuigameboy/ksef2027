/**
 * ChromeOS Student Edition - Homework & Notes Docs App
 */

import { stateStore } from '../os/state.js';

export function createDocsApp() {
  const container = document.createElement('div');
  container.className = 'flex h-full bg-slate-900 text-slate-100 font-sans';

  let currentDocId = null;
  const docs = stateStore.getState().documents;
  if (docs.length > 0) currentDocId = docs[0].id;

  container.innerHTML = `
    <!-- Documents Sidebar -->
    <div class="w-64 bg-slate-950 border-r border-slate-800 p-3 flex flex-col gap-3">
      <div class="flex items-center justify-between">
        <h3 class="font-bold text-xs text-slate-300 uppercase tracking-wider">My Notes & Homework</h3>
        <button id="doc-new-btn" class="bg-blue-600 hover:bg-blue-500 text-white text-xs px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1">
          <i class="fas fa-plus text-xs"></i> New
        </button>
      </div>

      <div id="docs-list" class="flex-1 overflow-y-auto space-y-1">
      </div>

      <div class="text-[11px] text-slate-500 border-t border-slate-800 pt-2 flex items-center justify-between">
        <span id="doc-save-status" class="text-emerald-400 font-semibold"><i class="fas fa-check-circle"></i> Auto-saved</span>
        <button id="doc-export-btn" class="hover:text-white" title="Export as Text File"><i class="fas fa-download"></i> Export</button>
      </div>
    </div>

    <!-- Main Editor Area -->
    <div class="flex-1 flex flex-col bg-slate-900">
      <!-- Formatting Toolbar -->
      <div class="bg-slate-800 border-b border-slate-700/80 p-2 flex items-center gap-1 flex-wrap text-xs text-slate-200">
        <input type="text" id="doc-title-input" class="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1 font-semibold text-sm text-white focus:border-blue-500 outline-none mr-2 w-56" placeholder="Document Title...">

        <div class="h-4 w-[1px] bg-slate-700 mx-1"></div>

        <button class="fmt-btn p-1.5 hover:bg-slate-700 rounded" data-cmd="bold" title="Bold (Ctrl+B)"><i class="fas fa-bold"></i></button>
        <button class="fmt-btn p-1.5 hover:bg-slate-700 rounded" data-cmd="italic" title="Italic (Ctrl+I)"><i class="fas fa-italic"></i></button>
        <button class="fmt-btn p-1.5 hover:bg-slate-700 rounded" data-cmd="underline" title="Underline (Ctrl+U)"><i class="fas fa-underline"></i></button>
        <button class="fmt-btn p-1.5 hover:bg-slate-700 rounded" data-cmd="strikeThrough" title="Strikethrough"><i class="fas fa-strikethrough"></i></button>

        <div class="h-4 w-[1px] bg-slate-700 mx-1"></div>

        <button class="fmt-btn p-1.5 hover:bg-slate-700 rounded font-bold" data-cmd="formatBlock" data-val="H2" title="Heading 2">H2</button>
        <button class="fmt-btn p-1.5 hover:bg-slate-700 rounded font-semibold" data-cmd="formatBlock" data-val="P" title="Paragraph">P</button>

        <div class="h-4 w-[1px] bg-slate-700 mx-1"></div>

        <button class="fmt-btn p-1.5 hover:bg-slate-700 rounded" data-cmd="insertUnorderedList" title="Bullet List"><i class="fas fa-list-ul"></i></button>
        <button class="fmt-btn p-1.5 hover:bg-slate-700 rounded" data-cmd="insertOrderedList" title="Numbered List"><i class="fas fa-list-ol"></i></button>

        <div class="h-4 w-[1px] bg-slate-700 mx-1"></div>

        <button class="fmt-btn p-1.5 hover:bg-slate-700 rounded" data-cmd="removeFormat" title="Clear Formatting"><i class="fas fa-eraser"></i></button>
      </div>

      <!-- Contenteditable Area -->
      <div class="flex-1 p-8 overflow-y-auto bg-slate-900">
        <div id="doc-editor" contenteditable="true" class="max-w-3xl mx-auto min-h-[450px] bg-slate-950 border border-slate-800 rounded-2xl p-8 outline-none text-slate-100 leading-relaxed text-sm shadow-xl focus:border-blue-500/50">
        </div>
      </div>
    </div>
  `;

  const docsListEl = container.querySelector('#docs-list');
  const titleInput = container.querySelector('#doc-title-input');
  const editorEl = container.querySelector('#doc-editor');
  const saveStatusEl = container.querySelector('#doc-save-status');

  const renderDocsList = () => {
    const list = stateStore.getState().documents;
    docsListEl.innerHTML = list
      .map(
        (doc) => `
      <div class="doc-item group p-2 rounded-xl cursor-pointer flex items-center justify-between text-xs transition-colors ${doc.id === currentDocId ? 'bg-blue-600/30 border border-blue-500/40 text-white font-semibold' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'}" data-doc-id="${doc.id}">
        <div class="flex items-center gap-2 truncate">
          <i class="fas fa-file-alt text-blue-400"></i>
          <span class="truncate">${doc.title}</span>
        </div>
        <button class="doc-del-btn opacity-0 group-hover:opacity-100 hover:text-red-400 p-1" data-doc-id="${doc.id}" title="Delete Note">
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
      editorEl.innerHTML = '';
    }
    renderDocsList();
  };

  let saveDebounceTimer;
  const triggerAutoSave = () => {
    saveStatusEl.innerHTML = `<i class="fas fa-spinner fa-spin text-amber-400"></i> Saving...`;
    clearTimeout(saveDebounceTimer);
    saveDebounceTimer = setTimeout(() => {
      if (!currentDocId) {
        const saved = stateStore.saveDocument(null, titleInput.value || 'Untitled Homework', editorEl.innerHTML);
        currentDocId = saved.id;
      } else {
        stateStore.saveDocument(currentDocId, titleInput.value || 'Untitled Homework', editorEl.innerHTML);
      }
      saveStatusEl.innerHTML = `<i class="fas fa-check-circle text-emerald-400"></i> Auto-saved`;
      renderDocsList();
    }, 600);
  };

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

  // New Doc Button
  container.querySelector('#doc-new-btn').addEventListener('click', () => {
    const newDoc = stateStore.saveDocument(null, 'New Homework Note', '<p>Start typing your lesson notes here...</p>');
    loadDoc(newDoc.id);
  });

  // Export File Button
  container.querySelector('#doc-export-btn').addEventListener('click', () => {
    const text = editorEl.innerText;
    const blob = new Blob([text], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${titleInput.value || 'homework-note'}.txt`;
    a.click();
  });

  // Docs list click & delete handler
  docsListEl.addEventListener('click', (e) => {
    const delBtn = e.target.closest('.doc-del-btn');
    if (delBtn) {
      e.stopPropagation();
      const id = delBtn.dataset.docId;
      stateStore.deleteDocument(id);
      if (currentDocId === id) {
        const remaining = stateStore.getState().documents;
        loadDoc(remaining.length > 0 ? remaining[0].id : null);
      } else {
        renderDocsList();
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
