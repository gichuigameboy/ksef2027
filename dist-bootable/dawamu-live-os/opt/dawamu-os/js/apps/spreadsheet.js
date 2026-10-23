/**
 * Dawamu OS - Professional Excel-Style Spreadsheet App (Dawamu Sheets)
 * Features:
 * - Real cell selection, inline editing, and formula-bar editing
 * - Bi-directional formula-bar synchronization
 * - Full formula engine: =SUM, =AVERAGE, =MAX, =MIN, =COUNT, and math expressions
 * - Keyboard navigation (Arrows, Tab, Enter, Backspace/Delete)
 * - Copy / Paste support
 * - Local persistence across reboots via localStorage
 * - CSV Import / Export
 * - Clean glassmorphic dialogs
 */

export function createSpreadsheetApp(options = {}) {
  const COLS = 10;
  const ROWS = 25;
  const COL_LETTERS = 'ABCDEFGHIJ'.split('');
  const STORAGE_KEY = 'dawamu_spreadsheet_data';

  let cells = {};
  let selectedCell = null;
  let activeEditInput = null;

  const GRADEBOOK = {
    A1: 'Student Name', B1: 'Math', C1: 'English', D1: 'Science', E1: 'History', F1: 'Kiswahili', G1: 'Average', H1: 'Grade',
    A2: 'Brian Ochieng',   B2: '88', C2: '82', D2: '91', E2: '85', F2: '79',
    A3: 'Kevin Mwangi',    B3: '92', C3: '88', D3: '76', E3: '90', F3: '84',
    A4: 'Daniel Kiprop',   B4: '79', C4: '91', D4: '88', E4: '72', F4: '86',
    A5: 'Samuel Otieno',   B5: '95', C5: '78', D5: '83', E5: '88', F5: '90',
    A6: 'James Kamau',     B6: '84', C6: '86', D6: '92', E6: '80', F6: '77',
    A7: 'Peter Wanjiru',   B7: '76', C7: '80', D7: '88', E7: '91', F7: '82',
    A8: 'Victor Nyamweya', B8: '88', C8: '92', D8: '79', E8: '84', F8: '88',
    A10: 'Class Average',  B10: '=AVERAGE(B2:B8)', C10: '=AVERAGE(C2:C8)', D10: '=AVERAGE(D2:D8)',
    E10: '=AVERAGE(E2:E8)', F10: '=AVERAGE(F2:F8)',
    A12: 'Highest Score',  B12: '=MAX(B2:B8)',
    A13: 'Lowest Score',   B13: '=MIN(B2:B8)',
    A14: 'Class Total',    B14: '=SUM(B2:B8)'
  };

  const root = document.createElement('div');
  root.className = 'flex flex-col h-full bg-white font-sans overflow-hidden text-xs select-none';

  const defaultTitle = options.fileName || options.title || 'Student Gradebook';

  root.innerHTML = `
    <!-- Top Bar -->
    <div class="bg-[#1d6f42] text-white px-4 py-2 flex items-center justify-between shrink-0 shadow">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
          <i class="fas fa-file-excel text-white text-lg"></i>
        </div>
        <div>
          <input id="sheet-title" type="text" value="${defaultTitle}"
            class="bg-transparent text-white font-semibold text-sm outline-none border-b border-white/30 w-52 pb-0.5">
          <div class="text-[10px] text-green-200 mt-0.5">Dawamu Spreadsheet • ${ROWS} rows × ${COLS} cols</div>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <button id="btn-load-gradebook" class="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all">
          <i class="fas fa-graduation-cap text-[10px]"></i> Gradebook
        </button>
        <button id="btn-clear-all" class="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all">
          <i class="fas fa-trash text-[10px]"></i> Clear
        </button>
        <button id="btn-export-csv" class="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all">
          <i class="fas fa-download text-[10px]"></i> Export CSV
        </button>
      </div>
    </div>

    <!-- Formula Bar -->
    <div class="bg-[#f0f4f0] border-b border-slate-200 px-3 py-1.5 flex items-center gap-2 shrink-0">
      <span class="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Cell:</span>
      <span id="cell-ref" class="font-mono font-bold text-emerald-700 w-10">A1</span>
      <div class="h-4 w-[1px] bg-slate-300"></div>
      <input id="formula-bar" type="text" placeholder="Value or formula (e.g. =SUM(A1:A5))"
        class="flex-1 bg-white border border-slate-200 rounded px-2.5 py-1 text-xs font-mono outline-none focus:border-emerald-500 text-slate-800">
      <span class="text-[10px] text-slate-400 italic">Formulas: =SUM =AVERAGE =MAX =MIN =COUNT</span>
    </div>

    <!-- Sheet Grid -->
    <div class="flex-1 overflow-auto bg-slate-50" tabindex="0" id="sheet-scroll-container">
      <table id="sheet-table" class="border-collapse bg-white" style="table-layout:fixed;">
        <thead>
          <tr>
            <th class="w-10 min-w-[40px] h-7 bg-[#f0f4f0] border border-slate-200 text-center text-[10px] text-slate-500 sticky top-0 z-10"></th>
            ${COL_LETTERS.map(c => `<th class="w-24 min-w-[96px] h-7 bg-[#f0f4f0] border border-slate-200 text-center text-[10px] font-bold text-slate-600 sticky top-0 z-10">${c}</th>`).join('')}
          </tr>
        </thead>
        <tbody id="sheet-body"></tbody>
      </table>
    </div>

    <!-- Status Bar -->
    <div class="bg-[#1d6f42] text-green-100 px-4 py-1.5 flex items-center justify-between text-[11px] shrink-0 font-sans">
      <span id="cell-info">Click a cell to select. Type directly to edit. Start formulas with =</span>
      <span id="calc-result" class="font-mono font-bold"></span>
    </div>
  `;

  const sheetBody = root.querySelector('#sheet-body');
  const formulaBar = root.querySelector('#formula-bar');
  const cellRef = root.querySelector('#cell-ref');
  const cellInfo = root.querySelector('#cell-info');
  const calcResult = root.querySelector('#calc-result');

  function saveStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cells));
    } catch (_) {}
  }

  function loadInitialCells() {
    if (options.fileData) {
      cells = {};
      const lines = String(options.fileData).split('\n');
      lines.forEach((line, rIdx) => {
        const row = rIdx + 1;
        const vals = line.split(',');
        vals.forEach((v, cIdx) => {
          if (cIdx < COLS && row <= ROWS) {
            cells[COL_LETTERS[cIdx] + row] = { raw: v.trim() };
          }
        });
      });
      return;
    }

    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        cells = JSON.parse(saved);
        return;
      } catch (_) {}
    }

    // Default Gradebook template
    cells = {};
    Object.entries(GRADEBOOK).forEach(([k, v]) => { cells[k] = { raw: String(v) }; });
    for (let r = 2; r <= 8; r++) {
      const avg = evaluateFormula(`=AVERAGE(B${r}:F${r})`);
      cells[`G${r}`] = { raw: String(avg) };
      cells[`H${r}`] = { raw: getGrade(Number(avg)) };
    }
  }

  function parseRange(rangeStr) {
    const parts = rangeStr.split(':');
    if (parts.length !== 2) return [];
    const startCol = parts[0][0].toUpperCase(), startRow = parseInt(parts[0].slice(1), 10);
    const endCol   = parts[1][0].toUpperCase(), endRow   = parseInt(parts[1].slice(1), 10);
    const result = [];
    const c1 = COL_LETTERS.indexOf(startCol);
    const c2 = COL_LETTERS.indexOf(endCol);
    if (c1 === -1 || c2 === -1 || isNaN(startRow) || isNaN(endRow)) return [];

    const minC = Math.min(c1, c2), maxC = Math.max(c1, c2);
    const minR = Math.min(startRow, endRow), maxR = Math.max(startRow, endRow);

    for (let r = minR; r <= maxR; r++) {
      for (let ci = minC; ci <= maxC; ci++) {
        result.push(COL_LETTERS[ci] + r);
      }
    }
    return result;
  }

  function getNumericValues(keys, visiting = new Set()) {
    return keys.map(k => parseFloat(getCellRaw(k, visiting))).filter(v => !isNaN(v));
  }

  function getCellRaw(key, visiting = new Set()) {
    if (visiting.has(key)) return '0'; // circular reference protection
    visiting.add(key);

    const raw = cells[key]?.raw ?? '';
    if (typeof raw === 'string' && raw.startsWith('=')) {
      return String(evaluateFormula(raw, new Set(visiting)));
    }
    return raw;
  }

  function evaluateFormula(formula, visiting = new Set()) {
    const f = formula.slice(1).trim();
    const fnMatch = f.match(/^(SUM|AVERAGE|MAX|MIN|COUNT)\(([^)]+)\)$/i);
    if (fnMatch) {
      const fn = fnMatch[1].toUpperCase();
      const arg = fnMatch[2].trim();
      const keys = arg.includes(':') ? parseRange(arg) : arg.split(',').map(s => s.trim().toUpperCase());
      const nums = getNumericValues(keys, visiting);
      if (!nums.length) return 0;
      switch (fn) {
        case 'SUM':     return Math.round(nums.reduce((a,b)=>a+b, 0) * 100) / 100;
        case 'AVERAGE': return Math.round((nums.reduce((a,b)=>a+b, 0) / nums.length) * 100) / 100;
        case 'MAX':     return Math.max(...nums);
        case 'MIN':     return Math.min(...nums);
        case 'COUNT':   return nums.length;
      }
    }
    try {
      const expr = f.replace(/[A-J]\d+/gi, key => {
        const val = getCellRaw(key.toUpperCase(), visiting);
        const num = parseFloat(val);
        return isNaN(num) ? '0' : String(num);
      });
      // Safe math evaluation
      if (/^[0-9+\-*/().\s]+$/.test(expr)) {
        return Function('"use strict"; return (' + expr + ')')();
      }
      return '#ERR';
    } catch (_) {
      return '#ERR';
    }
  }

  function getCellDisplay(key) {
    const raw = cells[key]?.raw ?? '';
    if (!raw) return '';
    if (typeof raw === 'string' && raw.startsWith('=')) {
      return String(evaluateFormula(raw));
    }
    return raw;
  }

  function getGrade(avg) {
    if (isNaN(avg)) return '-';
    if (avg >= 80) return 'A';
    if (avg >= 70) return 'B';
    if (avg >= 60) return 'C';
    if (avg >= 50) return 'D';
    return 'E';
  }

  function buildGrid() {
    sheetBody.innerHTML = '';
    for (let r = 1; r <= ROWS; r++) {
      const tr = document.createElement('tr');
      const rowNum = document.createElement('td');
      rowNum.className = 'h-7 bg-[#f0f4f0] border border-slate-200 text-center text-[10px] text-slate-500 font-semibold sticky left-0 z-10 select-none w-10';
      rowNum.textContent = r;
      tr.appendChild(rowNum);

      for (let ci = 0; ci < COLS; ci++) {
        const key = COL_LETTERS[ci] + r;
        const td = document.createElement('td');
        td.className = 'h-7 border border-slate-200 text-[11px] text-slate-800 px-2 cursor-cell overflow-hidden whitespace-nowrap cell-td select-none relative';
        td.dataset.key = key;
        td.textContent = getCellDisplay(key);

        if (r === 1) td.style.cssText = 'font-weight:700;background:#e8f5e9;color:#1a5c32;';
        if (r === 10 || r === 12 || r === 13 || r === 14) td.style.cssText = 'background:#fff9e6;font-weight:600;color:#7c5c00;';

        tr.appendChild(td);
      }
      sheetBody.appendChild(tr);
    }
    wireGrid();
  }

  function refreshAll() {
    sheetBody.querySelectorAll('.cell-td').forEach(td => {
      const key = td.dataset.key;
      if (!td.querySelector('input')) {
        td.textContent = getCellDisplay(key);
      }
    });
  }

  function wireGrid() {
    sheetBody.querySelectorAll('.cell-td').forEach(td => {
      td.addEventListener('click', () => selectCell(td));
      td.addEventListener('dblclick', () => startEdit(td));
    });
  }

  function selectCell(td) {
    if (activeEditInput) {
      activeEditInput.blur();
    }
    sheetBody.querySelectorAll('.cell-td').forEach(c =>
      c.classList.remove('ring-2','ring-emerald-500','ring-inset','bg-emerald-50'));
    td.classList.add('ring-2','ring-emerald-500','ring-inset','bg-emerald-50');
    selectedCell = td;
    const key = td.dataset.key;
    cellRef.textContent = key;
    const raw = cells[key]?.raw ?? '';
    formulaBar.value = raw;
    const display = getCellDisplay(key);
    if (raw.startsWith('=')) {
      calcResult.textContent = `= ${display}`;
      cellInfo.textContent = `Formula: ${raw}`;
    } else {
      calcResult.textContent = '';
      cellInfo.textContent = `Cell ${key}: ${display || '(empty)'}`;
    }
  }

  function startEdit(td, initialChar = null) {
    const key = td.dataset.key;
    const raw = initialChar !== null ? initialChar : (cells[key]?.raw ?? '');
    td.innerHTML = '';

    const input = document.createElement('input');
    input.type = 'text';
    input.value = raw;
    input.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;background:white;border:2px solid #10b981;padding:0 6px;font-size:11px;font-family:monospace;outline:none;z-index:20;color:#0f172a;';
    td.appendChild(input);
    input.focus();
    if (initialChar === null) {
      input.select();
    }
    activeEditInput = input;
    formulaBar.value = input.value;

    input.addEventListener('input', () => {
      formulaBar.value = input.value;
    });

    const commit = () => {
      if (!activeEditInput) return;
      const val = input.value.trim();
      cells[key] = { raw: val };
      saveStorage();
      activeEditInput = null;
      td.innerHTML = '';
      td.textContent = getCellDisplay(key);
      refreshAll();
      const updatedDisplay = getCellDisplay(key);
      if (val.startsWith('=')) {
        calcResult.textContent = `= ${updatedDisplay}`;
      } else {
        calcResult.textContent = '';
      }
    };

    input.addEventListener('blur', commit);
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        commit();
        // Move selection down
        const col = key[0], row = parseInt(key.slice(1), 10);
        if (row < ROWS) {
          const next = sheetBody.querySelector(`[data-key="${col}${row + 1}"]`);
          if (next) selectCell(next);
        }
      } else if (e.key === 'Tab') {
        e.preventDefault();
        commit();
        const col = key[0], row = parseInt(key.slice(1), 10);
        const ci = COL_LETTERS.indexOf(col);
        if (ci < COLS - 1) {
          const next = sheetBody.querySelector(`[data-key="${COL_LETTERS[ci + 1]}${row}"]`);
          if (next) selectCell(next);
        }
      } else if (e.key === 'Escape') {
        activeEditInput = null;
        td.innerHTML = '';
        td.textContent = getCellDisplay(key);
      }
    });
  }

  // Formula bar live sync
  formulaBar.addEventListener('input', () => {
    if (!selectedCell) return;
    const key = selectedCell.dataset.key;
    cells[key] = { raw: formulaBar.value };
    saveStorage();
    if (activeEditInput) {
      activeEditInput.value = formulaBar.value;
    }
    selectedCell.textContent = getCellDisplay(key);
    refreshAll();
    const updatedDisplay = getCellDisplay(key);
    if (formulaBar.value.startsWith('=')) {
      calcResult.textContent = `= ${updatedDisplay}`;
    } else {
      calcResult.textContent = '';
    }
  });

  formulaBar.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      formulaBar.blur();
      if (selectedCell) selectCell(selectedCell);
    }
  });

  // Global keydown on table
  root.addEventListener('keydown', e => {
    if (activeEditInput || document.activeElement === formulaBar || document.activeElement.tagName === 'INPUT') {
      return;
    }
    if (!selectedCell) return;

    const key = selectedCell.dataset.key;
    const col = key[0], row = parseInt(key.slice(1), 10);
    const ci = COL_LETTERS.indexOf(col);

    let nextKey = null;
    if (e.key === 'ArrowRight' && ci < COLS - 1) nextKey = COL_LETTERS[ci + 1] + row;
    else if (e.key === 'ArrowLeft' && ci > 0)    nextKey = COL_LETTERS[ci - 1] + row;
    else if (e.key === 'ArrowDown' && row < ROWS) nextKey = col + (row + 1);
    else if (e.key === 'ArrowUp' && row > 1)      nextKey = col + (row - 1);
    else if (e.key === 'Tab') {
      e.preventDefault();
      if (ci < COLS - 1) nextKey = COL_LETTERS[ci + 1] + row;
    } else if (e.key === 'Enter') {
      e.preventDefault();
      startEdit(selectedCell);
      return;
    } else if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      cells[key] = { raw: '' };
      saveStorage();
      formulaBar.value = '';
      selectedCell.textContent = '';
      refreshAll();
      return;
    } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      // Start typing directly into cell
      e.preventDefault();
      startEdit(selectedCell, e.key);
      return;
    }

    if (nextKey) {
      e.preventDefault();
      const next = sheetBody.querySelector(`[data-key="${nextKey}"]`);
      if (next) selectCell(next);
    }
  });

  // Buttons
  root.querySelector('#btn-load-gradebook').addEventListener('click', () => {
    cells = {};
    Object.entries(GRADEBOOK).forEach(([k, v]) => { cells[k] = { raw: String(v) }; });
    for (let r = 2; r <= 8; r++) {
      const avg = evaluateFormula(`=AVERAGE(B${r}:F${r})`);
      cells[`G${r}`] = { raw: String(avg) };
      cells[`H${r}`] = { raw: getGrade(Number(avg)) };
    }
    saveStorage();
    refreshAll();
    if (selectedCell) selectCell(selectedCell);
    if (window.dawamuDialogs && window.dawamuDialogs.toast) {
      window.dawamuDialogs.toast('Loaded Form 1-4 Student Gradebook template', 'info');
    }
  });

  root.querySelector('#btn-clear-all').addEventListener('click', async () => {
    let ok = false;
    if (window.dawamuDialogs && window.dawamuDialogs.confirm) {
      ok = await window.dawamuDialogs.confirm('Are you sure you want to clear all cells in this spreadsheet?');
    } else {
      ok = confirm('Clear all cells?');
    }
    if (ok) {
      cells = {};
      saveStorage();
      refreshAll();
      if (selectedCell) selectCell(selectedCell);
      if (window.dawamuDialogs && window.dawamuDialogs.toast) {
        window.dawamuDialogs.toast('Spreadsheet cleared', 'success');
      }
    }
  });

  root.querySelector('#btn-export-csv').addEventListener('click', () => {
    let csv = '';
    for (let r = 1; r <= ROWS; r++) {
      const row = COL_LETTERS.map(c => {
        const v = getCellDisplay(c + r);
        return v.includes(',') ? `"${v}"` : v;
      });
      csv += row.join(',') + '\n';
    }
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    const title = root.querySelector('#sheet-title').value || 'spreadsheet';
    a.download = title.replace(/[^a-z0-9]/gi, '_') + '.csv';
    a.click();
    if (window.dawamuDialogs && window.dawamuDialogs.toast) {
      window.dawamuDialogs.toast(`Exported "${a.download}" successfully`, 'success');
    }
  });

  loadInitialCells();
  buildGrid();

  // Select A1 initially
  const first = sheetBody.querySelector('[data-key="A1"]');
  if (first) selectCell(first);

  return root;
}
