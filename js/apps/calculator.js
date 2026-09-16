/**
 * ChromeOS Student Edition - Scientific Calculator App
 */

export function createCalculatorApp() {
  const container = document.createElement('div');
  container.className = 'flex h-full bg-slate-900 text-slate-100 font-mono';

  let displayValue = '0';
  let memoryValue = 0;
  let historyLog = [];

  container.innerHTML = `
    <!-- Calculator Main Pad -->
    <div class="flex-1 p-5 flex flex-col justify-between space-y-4">
      <!-- Display Screen -->
      <div class="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-right shadow-inner">
        <div id="calc-expression" class="text-xs text-slate-400 min-h-[16px] truncate"></div>
        <div id="calc-display" class="text-3xl font-extrabold text-white tracking-wider truncate">0</div>
      </div>

      <!-- Keys Grid -->
      <div class="grid grid-cols-5 gap-2 text-sm">
        <!-- Memory & Sci Row 1 -->
        <button class="calc-btn sci" data-val="MC">MC</button>
        <button class="calc-btn sci" data-val="MR">MR</button>
        <button class="calc-btn sci" data-val="M+">M+</button>
        <button class="calc-btn sci" data-val="M-">M-</button>
        <button class="calc-btn action" data-val="C">C</button>

        <!-- Sci Row 2 -->
        <button class="calc-btn sci" data-val="sin">sin</button>
        <button class="calc-btn sci" data-val="cos">cos</button>
        <button class="calc-btn sci" data-val="tan">tan</button>
        <button class="calc-btn sci" data-val="sqrt">√</button>
        <button class="calc-btn action" data-val="DEL"><i class="fas fa-backspace"></i></button>

        <!-- Sci Row 3 & Digits -->
        <button class="calc-btn sci" data-val="log">log</button>
        <button class="calc-btn sci" data-val="ln">ln</button>
        <button class="calc-btn sci" data-val="(">(</button>
        <button class="calc-btn sci" data-val=")">)</button>
        <button class="calc-btn op" data-val="/">÷</button>

        <button class="calc-btn sci" data-val="^">x^y</button>
        <button class="calc-btn num" data-val="7">7</button>
        <button class="calc-btn num" data-val="8">8</button>
        <button class="calc-btn num" data-val="9">9</button>
        <button class="calc-btn op" data-val="*">×</button>

        <button class="calc-btn sci" data-val="pi">π</button>
        <button class="calc-btn num" data-val="4">4</button>
        <button class="calc-btn num" data-val="5">5</button>
        <button class="calc-btn num" data-val="6">6</button>
        <button class="calc-btn op" data-val="-">-</button>

        <button class="calc-btn sci" data-val="%">%</button>
        <button class="calc-btn num" data-val="1">1</button>
        <button class="calc-btn num" data-val="2">2</button>
        <button class="calc-btn num" data-val="3">3</button>
        <button class="calc-btn op" data-val="+">+</button>

        <button class="calc-btn sci" data-val="+/-">±</button>
        <button class="calc-btn num col-span-2" data-val="0">0</button>
        <button class="calc-btn num" data-val=".">.</button>
        <button class="calc-btn equals" data-val="=">=</button>
      </div>
    </div>

    <!-- History Sidebar -->
    <div class="w-48 bg-slate-950 border-l border-slate-800 p-3 flex flex-col text-xs">
      <div class="font-bold text-slate-400 uppercase tracking-wider mb-2 pb-2 border-b border-slate-800 flex justify-between items-center">
        <span>History</span>
        <button id="calc-clear-hist" class="hover:text-red-400 text-[10px]"><i class="fas fa-trash"></i></button>
      </div>
      <div id="calc-history-list" class="flex-1 overflow-y-auto space-y-2 text-slate-300">
        <div class="text-slate-500 text-[11px] text-center pt-4">No calculations yet</div>
      </div>
    </div>

    <style>
      .calc-btn {
        padding: 10px 4px;
        border-radius: 12px;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.1s ease;
        text-align: center;
        border: 1px solid rgba(255,255,255,0.05);
      }
      .calc-btn.num { background: #1e293b; color: #f8fafc; }
      .calc-btn.num:hover { background: #334155; }
      .calc-btn.sci { background: #0f172a; color: #94a3b8; font-size: 11px; }
      .calc-btn.sci:hover { background: #1e293b; color: #38bdf8; }
      .calc-btn.op { background: #1e3a8a; color: #60a5fa; }
      .calc-btn.op:hover { background: #2563eb; color: #ffffff; }
      .calc-btn.action { background: #991b1b; color: #fca5a5; }
      .calc-btn.action:hover { background: #dc2626; color: #ffffff; }
      .calc-btn.equals { background: #166534; color: #4ade80; }
      .calc-btn.equals:hover { background: #15803d; color: #ffffff; }
    </style>
  `;

  const displayEl = container.querySelector('#calc-display');
  const exprEl = container.querySelector('#calc-expression');
  const historyListEl = container.querySelector('#calc-history-list');

  const updateDisplay = () => {
    displayEl.textContent = displayValue;
  };

  const renderHistory = () => {
    if (historyLog.length === 0) {
      historyListEl.innerHTML = `<div class="text-slate-500 text-[11px] text-center pt-4">No calculations yet</div>`;
      return;
    }
    historyListEl.innerHTML = historyLog
      .map(
        (item) => `
      <div class="bg-slate-900 p-2 rounded-lg border border-slate-800 text-right">
        <div class="text-[10px] text-slate-400 truncate">${item.expr}</div>
        <div class="font-bold text-emerald-400 text-sm">= ${item.res}</div>
      </div>
    `
      )
      .join('');
  };

  const calculateResult = () => {
    try {
      let evalExpr = displayValue
        .replace(/÷/g, '/')
        .replace(/×/g, '*')
        .replace(/π/g, 'Math.PI')
        .replace(/\^/g, '**')
        .replace(/sin\(/g, 'Math.sin(')
        .replace(/cos\(/g, 'Math.cos(')
        .replace(/tan\(/g, 'Math.tan(')
        .replace(/log\(/g, 'Math.log10(')
        .replace(/ln\(/g, 'Math.log(')
        .replace(/√\(/g, 'Math.sqrt(');

      // Safe JS math execution
      const result = Function(`"use strict"; return (${evalExpr})`)();
      const rounded = Number.isInteger(result) ? result.toString() : parseFloat(result.toFixed(8)).toString();

      historyLog.unshift({ expr: displayValue, res: rounded });
      exprEl.textContent = displayValue + ' =';
      displayValue = rounded;
      updateDisplay();
      renderHistory();
    } catch (e) {
      displayValue = 'Error';
      updateDisplay();
      setTimeout(() => {
        displayValue = '0';
        updateDisplay();
      }, 1500);
    }
  };

  // Button clicks handler
  container.querySelectorAll('.calc-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const val = btn.dataset.val;

      if (val === 'C') {
        displayValue = '0';
        exprEl.textContent = '';
      } else if (val === 'DEL') {
        displayValue = displayValue.length > 1 ? displayValue.slice(0, -1) : '0';
      } else if (val === '=') {
        calculateResult();
        return;
      } else if (['sin', 'cos', 'tan', 'log', 'ln'].includes(val)) {
        displayValue = displayValue === '0' ? `${val}(` : `${displayValue}${val}(`;
      } else if (val === 'sqrt') {
        displayValue = displayValue === '0' ? '√(' : `${displayValue}√(`;
      } else if (val === 'pi') {
        displayValue = displayValue === '0' ? 'π' : `${displayValue}π`;
      } else if (val === 'MC') {
        memoryValue = 0;
      } else if (val === 'MR') {
        displayValue = memoryValue.toString();
      } else if (val === 'M+') {
        memoryValue += parseFloat(displayValue) || 0;
      } else if (val === 'M-') {
        memoryValue -= parseFloat(displayValue) || 0;
      } else if (val === '+/-') {
        displayValue = displayValue.startsWith('-') ? displayValue.slice(1) : '-' + displayValue;
      } else {
        if (displayValue === '0' && !['.', '+', '-', '*', '/', '^'].includes(val)) {
          displayValue = val;
        } else {
          displayValue += val;
        }
      }
      updateDisplay();
    });
  });

  container.querySelector('#calc-clear-hist').addEventListener('click', () => {
    historyLog = [];
    renderHistory();
  });

  return container;
}
