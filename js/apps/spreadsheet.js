/**
 * Dawamu OS - Excel-style Spreadsheet App
 */

export function createSpreadsheetApp() {
  const COLS = 10;
  const ROWS = 25;
  const COL_LETTERS = 'ABCDEFGHIJ'.split('');

  let cells = {};
  let selectedCell = null;

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

  root.innerHTML = `
    <div class="bg-[#1d6f42] text-white px-4 py-2 flex items-center justify-between shrink-0 shadow">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
          <i class="fas fa-file-excel text-white text-lg"></i>
        </div>
        <div>
          <input id="sheet-title" type="text" value="Student Gradebook"
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

    <div class="bg-[#f0f4f0] border-b border-slate-200 px-3 py-1.5 flex items-center gap-2 shrink-0">
      <span class="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Cell:</span>
      <span id="cell-ref" class="font-mono font-bold text-emerald-700 w-10">A1</span>
      <div class="h-4 w-[1px] bg-slate-300"></div>
      <input id="formula-bar" type="text" placeholder="Value or formula (e.g. =SUM(A1:A5))" readonly
        class="flex-1 bg-white border border-slate-200 rounded px-2.5 py-1 text-xs font-mono outline-none focus:border-emerald-500 text-slate-800">
      <span class="text-[10px] text-slate-400 italic">Formulas: =SUM =AVERAGE =MAX =MIN =COUNT</span>
    </div>

    <div class="flex-1 overflow-auto">
      <table id="sheet-table" class="border-collapse" style="table-layout:fixed;">
        <thead>
          <tr>
            <th class="w-10 min-w-[40px] h-7 bg-[#f0f4f0] border border-slate-200 text-center text-[10px] text-slate-500 sticky top-0 z-10"></th>
            ${COL_LETTERS.map(c => `<th class="w-24 min-w-[96px] h-7 bg-[#f0f4f0] border border-slate-200 text-center text-[10px] font-bold text-slate-600 sticky top-0 z-10">${c}</th>`).join('')}
          </tr>
        </thead>
        <tbody id="sheet-body"></tbody>
      </table>
    </div>

    <div class="bg-[#1d6f42] text-green-100 px-4 py-1 flex items-center justify-between text-[11px] shrink-0">
      <span id="cell-info">Click a cell to select. Double-click to edit. Type formulas starting with =</span>
      <span id="calc-result" class="font-mono"></span>
    </div>
  `;

  const sheetBody = root.querySelector('#sheet-body');
  const formulaBar = root.querySelector('#formula-bar');
  const cellRef = root.querySelector('#cell-ref');
  const cellInfo = root.querySelector('#cell-info');
  const calcResult = root.querySelector('#calc-result');

  function parseRange(rangeStr) {
    const parts = rangeStr.split(':');
    if (parts.length !== 2) return [];
    const startCol = parts[0][0], startRow = parseInt(parts[0].slice(1));
    const endCol = parts[1][0],   endRow   = parseInt(parts[1].slice(1));
    const result = [];
    for (let r = startRow; r <= endRow; r++) {
      for (let ci = COL_LETTERS.indexOf(startCol); ci <= COL_LETTERS.indexOf(endCol); ci++) {
        result.push(COL_LETTERS[ci] + r);
      }
    }
    return result;
  }

  function getNumericValues(keys) {
    return keys.map(k => parseFloat(getCellRaw(k))).filter(v => !isNaN(v));
  }

  function getCellRaw(key) {
    const raw = cells[key]?.raw ?? '';
    if (typeof raw === 'string' && raw.startsWith('=')) {
      return String(evaluateFormula(raw));
    }
    return raw;
  }

  function evaluateFormula(formula) {
    const f = formula.slice(1).trim();
    const fnMatch = f.match(/^(SUM|AVERAGE|MAX|MIN|COUNT)\(([^)]+)\)$/i);
    if (fnMatch) {
      const fn = fnMatch[1].toUpperCase();
      const arg = fnMatch[2].trim();
      const keys = arg.includes(':') ? parseRange(arg) : arg.split(',').map(s => s.trim());
      const nums = getNumericValues(keys);
      if (!nums.length) return 0;
      switch (fn) {
        case 'SUM':     return Math.round(nums.reduce((a,b)=>a+b,0)*100)/100;
        case 'AVERAGE': return Math.round(nums.reduce((a,b)=>a+b,0)/nums.length*100)/100;
        case 'MAX':     return Math.max(...nums);
        case 'MIN':     return Math.min(...nums);
        case 'COUNT':   return nums.length;
      }
    }
    try {
      const expr = f.replace(/[A-Z]\d+/g, key => getCellRaw(key) || '0');
      // eslint-disable-next-line no-new-func
      return Function('"use strict"; return (' + expr + ')')();
    } catch { return '#ERR'; }
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
        td.className = 'h-7 border border-slate-200 text-[11px] text-slate-800 px-1.5 cursor-cell overflow-hidden whitespace-nowrap cell-td';
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
      td.textContent = getCellDisplay(td.dataset.key);
    });
  }

  function wireGrid() {
    sheetBody.querySelectorAll('.cell-td').forEach(td => {
      td.addEventListener('click', () => selectCell(td));
      td.addEventListener('dblclick', () => startEdit(td));
    });
  }

  function selectCell(td) {
    sheetBody.querySelectorAll('.cell-td').forEach(c =>
      c.classList.remove('ring-2','ring-emerald-500','ring-inset','bg-emerald-50'));
    td.classList.add('ring-2','ring-emerald-500','ring-inset','bg-emerald-50');
    selectedCell = td;
    const key = td.dataset.key;
    cellRef.textContent = key;
    const raw = cells[key]?.raw ?? '';
    formulaBar.value = raw;
    formulaBar.readOnly = true;
    const display = getCellDisplay(key);
    if (raw.startsWith('=')) {
      calcResult.textContent = `= ${display}`;
      cellInfo.textContent = `Formula: ${raw}`;
    } else {
      calcResult.textContent = '';
      cellInfo.textContent = `Cell ${key}: ${display || '(empty)'}`;
    }
  }

  function startEdit(td) {
    const key = td.dataset.key;
    const raw = cells[key]?.raw ?? '';
    const input = document.createElement('input');
    input.type = 'text';
    input.value = raw;
    input.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;box-sizing:border-box;background:white;border:2px solid #3b82f6;padding:0 4px;font-size:11px;font-family:monospace;outline:none;z-index:20;';
    td.style.position = 'relative';
    td.appendChild(input);
    input.focus();
    input.select();
    formulaBar.value = raw;
    formulaBar.readOnly = false;

    const commit = () => {
      const val = input.value.trim();
      cells[key] = { raw: val };
      td.innerHTML = '';
      td.style.position = '';
      td.textContent = getCellDisplay(key);
      refreshAll();
      formulaBar.readOnly = true;
    };

    input.addEventListener('blur', commit);
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === 'Tab') { e.preventDefault(); commit(); }
      if (e.key === 'Escape') { td.removeChild(input); td.style.position = ''; formulaBar.readOnly = true; }
    });
    formulaBar.addEventListener('input', () => { input.value = formulaBar.value; });
  }

  function loadGradebook() {
    cells = {};
    Object.entries(GRADEBOOK).forEach(([k,v]) => { cells[k] = { raw: String(v) }; });
    for (let r = 2; r <= 8; r++) {
      const avg = evaluateFormula(`=AVERAGE(B${r}:F${r})`);
      cells[`G${r}`] = { raw: String(avg) };
      cells[`H${r}`] = { raw: getGrade(Number(avg)) };
    }
    refreshAll();
  }

  root.querySelector('#btn-load-gradebook').addEventListener('click', () => {
    loadGradebook();
    cellInfo.textContent = 'Gradebook loaded. Double-click any cell to edit.';
  });

  root.querySelector('#btn-clear-all').addEventListener('click', () => {
    if (confirm('Clear all cells?')) { cells = {}; refreshAll(); cellInfo.textContent = 'Sheet cleared.'; }
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
    a.download = title.replace(/[^a-z0-9]/gi,'_') + '.csv';
    a.click();
    cellInfo.textContent = 'Exported as CSV.';
  });

  root.addEventListener('keydown', e => {
    if (!selectedCell) return;
    const key = selectedCell.dataset.key;
    const col = key[0], row = parseInt(key.slice(1)), ci = COL_LETTERS.indexOf(col);
    let nextKey = null;
    if (e.key === 'ArrowRight' && ci < COLS-1) nextKey = COL_LETTERS[ci+1] + row;
    if (e.key === 'ArrowLeft'  && ci > 0)       nextKey = COL_LETTERS[ci-1] + row;
    if (e.key === 'ArrowDown'  && row < ROWS)    nextKey = col + (row+1);
    if (e.key === 'ArrowUp'    && row > 1)       nextKey = col + (row-1);
    if (e.key === 'Enter') { startEdit(selectedCell); return; }
    if (nextKey) {
      e.preventDefault();
      const next = sheetBody.querySelector(`[data-key="${nextKey}"]`);
      if (next) selectCell(next);
    }
  });

  buildGrid();
  loadGradebook();
  return root;
}
