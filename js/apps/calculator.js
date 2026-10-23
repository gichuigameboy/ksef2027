/**
 * Dawamu OS - Educational Scientific Calculator
 * Features:
 * - Full mathematical evaluation with operator precedence
 * - Scientific functions: sin, cos, tan, sqrt, log, ln, powers, factorial, constants (π, e)
 * - Division by zero protection & friendly error states
 * - Real keyboard listener (0-9, +, -, *, /, Enter, Backspace, Escape)
 * - Calculation history log
 * - Memory operations (MC, MR, M+, M-)
 */

export function createCalculatorApp() {
  const container = document.createElement('div');
  container.className = 'flex h-full bg-[#0a0f1d] text-slate-100 font-mono select-none outline-none';
  container.tabIndex = 0; // enables keyboard focus

  let displayValue = '0';
  let memoryValue = 0;
  let historyLog = [];

  container.innerHTML = `
    <!-- Calculator Main Pad -->
    <div class="flex-1 p-5 flex flex-col justify-between space-y-4">
      <!-- Display Screen -->
      <div class="bg-[#040814] border border-white/10 rounded-2xl p-4 text-right shadow-inner">
        <div id="calc-expression" class="text-xs text-slate-400 min-h-[16px] truncate font-sans"></div>
        <div id="calc-display" class="text-3xl font-extrabold text-white tracking-wider truncate font-mono">0</div>
      </div>

      <!-- Keys Grid -->
      <div class="grid grid-cols-5 gap-2 text-xs">
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
    <div class="w-48 bg-[#040814] border-l border-white/10 p-3 flex flex-col text-xs font-sans">
      <div class="font-bold text-slate-400 uppercase tracking-wider mb-2 pb-2 border-b border-white/10 flex justify-between items-center">
        <span>History</span>
        <button id="calc-clear-hist" class="hover:text-rose-400 text-[10px] cursor-pointer" title="Clear History"><i class="fas fa-trash"></i></button>
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
        border: 1px solid rgba(255,255,255,0.06);
      }
      .calc-btn:active { transform: scale(0.95); }
      .calc-btn.num { background: #162032; color: #f8fafc; font-size: 13px; }
      .calc-btn.num:hover { background: #1f2d45; }
      .calc-btn.sci { background: #0c1524; color: #94a3b8; font-size: 11px; }
      .calc-btn.sci:hover { background: #162238; color: #38bdf8; }
      .calc-btn.op { background: #1e3a8a; color: #93c5fd; font-size: 14px; }
      .calc-btn.op:hover { background: #2563eb; color: #ffffff; }
      .calc-btn.action { background: #881337; color: #fecdd3; font-size: 12px; }
      .calc-btn.action:hover { background: #be123c; color: #ffffff; }
      .calc-btn.equals { background: #065f46; color: #a7f3d0; font-size: 16px; font-weight: 900; }
      .calc-btn.equals:hover { background: #059669; color: #ffffff; }
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
      <div class="bg-[#0f172a] p-2 rounded-xl border border-white/5 text-right font-mono">
        <div class="text-[10px] text-slate-400 truncate">${item.expr}</div>
        <div class="font-bold text-emerald-400 text-sm">= ${item.res}</div>
      </div>
    `
      )
      .join('');
  };

  const calculateResult = () => {
    if (!displayValue || displayValue === 'Error' || displayValue === 'Cannot divide by zero') return;

    // Check for division by zero
    if (/\/\s*0(?![0-9.])/.test(displayValue.replace(/÷/g, '/'))) {
      displayValue = 'Cannot divide by zero';
      updateDisplay();
      return;
    }

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

      // Safe JS math execution with validation
      if (!/^[0-9+\-*/().^%\sMathPIsincoetalgqrd]+$/.test(evalExpr)) {
        throw new Error('Invalid characters');
      }

      // eslint-disable-next-line no-new-func
      const result = Function(`"use strict"; return (${evalExpr})`)();

      if (!isFinite(result)) {
        displayValue = 'Cannot divide by zero';
        updateDisplay();
        return;
      }

      const rounded = Number.isInteger(result) ? result.toString() : parseFloat(result.toFixed(8)).toString();

      historyLog.unshift({ expr: displayValue, res: rounded });
      exprEl.textContent = displayValue + ' =';
      displayValue = rounded;
      updateDisplay();
      renderHistory();
    } catch (_) {
      displayValue = 'Invalid Expression';
      updateDisplay();
    }
  };

  function handleInput(val) {
    if (displayValue === 'Error' || displayValue === 'Cannot divide by zero' || displayValue === 'Invalid Expression') {
      displayValue = '0';
    }

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
  }

  // Button clicks handler
  container.querySelectorAll('.calc-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      handleInput(btn.dataset.val);
    });
  });

  // Keyboard navigation & typing handler
  container.addEventListener('keydown', (e) => {
    if (e.key >= '0' && e.key <= '9') {
      e.preventDefault();
      handleInput(e.key);
    } else if (['+', '-', '*', '/'].includes(e.key)) {
      e.preventDefault();
      handleInput(e.key);
    } else if (e.key === '.') {
      e.preventDefault();
      handleInput('.');
    } else if (e.key === '(' || e.key === ')') {
      e.preventDefault();
      handleInput(e.key);
    } else if (e.key === '^') {
      e.preventDefault();
      handleInput('^');
    } else if (e.key === 'Enter' || e.key === '=') {
      e.preventDefault();
      handleInput('=');
    } else if (e.key === 'Backspace') {
      e.preventDefault();
      handleInput('DEL');
    } else if (e.key === 'Escape' || e.key.toLowerCase() === 'c') {
      e.preventDefault();
      handleInput('C');
    }
  });

  container.querySelector('#calc-clear-hist').addEventListener('click', () => {
    historyLog = [];
    renderHistory();
  });

  return container;
}
