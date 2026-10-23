/**
 * Dawamu OS - Educational Scientific Calculator
 * Features:
 * - Robust Recursive Descent Math Parser (100% CSP-Safe, zero eval / Function)
 * - Operator precedence: Powers (^ right-associative), Multiplicative (*, /, %), Additive (+, -)
 * - Automatic parenthesis auto-completion upon calculation
 * - KCSE Trigonometry with DEG / RAD toggle (sin, cos, tan, asin, acos, atan)
 * - Advanced functions: sqrt (√), cbrt, log (log10), ln, abs, powers (x^y), factorials (n!)
 * - Smart percentage handling (50% -> 0.5, 200 * 15% -> 30)
 * - Division by zero protection & clean error states
 * - Global window keyboard listener (0-9, +, -, *, /, x, Enter, =, Backspace, Escape)
 * - Calculation history log with click-to-load
 * - Memory operations (MC, MR, M+, M-) with active indicator
 */

function evaluateMathExpression(rawExpr, isDegree = true) {
  if (!rawExpr || typeof rawExpr !== 'string') throw new Error('Empty expression');

  let s = rawExpr.trim();
  // Normalize symbols
  s = s.replace(/÷/g, '/').replace(/×/g, '*').replace(/−/g, '-');
  s = s.replace(/π/g, 'pi');
  s = s.replace(/√/g, 'sqrt');

  // Strip trailing uncompleted binary operators like '5 +' -> '5'
  s = s.replace(/[\+\-\*\/\^]+$/, '');
  if (!s) return 0;

  // Auto-close open parentheses
  let openParen = 0;
  for (const ch of s) {
    if (ch === '(') openParen++;
    else if (ch === ')') openParen--;
  }
  if (openParen > 0) {
    s += ')'.repeat(openParen);
  }

  // Tokenize
  const tokens = [];
  let i = 0;
  const isAlpha = (c) => /[a-zA-Z]/.test(c);
  const isDigit = (c) => /[0-9.]/.test(c);

  while (i < s.length) {
    const c = s[i];
    if (/\s/.test(c)) {
      i++;
      continue;
    }
    if (isDigit(c)) {
      let numStr = '';
      while (i < s.length && isDigit(s[i])) {
        numStr += s[i];
        i++;
      }
      tokens.push({ type: 'num', value: parseFloat(numStr) });
      continue;
    }
    if (isAlpha(c)) {
      let word = '';
      while (i < s.length && isAlpha(s[i])) {
        word += s[i];
        i++;
      }
      tokens.push({ type: 'word', value: word.toLowerCase() });
      continue;
    }
    if (['(', ')', '+', '-', '*', '/', '^', '%', '!'].includes(c)) {
      tokens.push({ type: 'op', value: c });
      i++;
      continue;
    }
    throw new Error(`Unexpected character: ${c}`);
  }

  if (tokens.length === 0) return 0;

  // Insert implicit multiplication: e.g. 2(3), 2pi, 5sqrt(9), (2+3)(4+1)
  const expanded = [];
  for (let j = 0; j < tokens.length; j++) {
    const curr = tokens[j];
    const prev = j > 0 ? tokens[j - 1] : null;

    if (prev) {
      const prevIsVal = (prev.type === 'num') ||
                        (prev.type === 'word' && (prev.value === 'pi' || prev.value === 'e')) ||
                        (prev.type === 'op' && (prev.value === ')' || prev.value === '!'));

      const currIsVal = (curr.type === 'num') ||
                        (curr.type === 'word') ||
                        (curr.type === 'op' && curr.value === '(');

      if (prevIsVal && currIsVal) {
        expanded.push({ type: 'op', value: '*' });
      }
    }
    expanded.push(curr);
  }

  // Recursive Descent Parser
  let pos = 0;
  function peek() {
    return expanded[pos] || null;
  }
  function consume(val) {
    const t = peek();
    if (!t) return null;
    if (val !== undefined && t.value !== val) return null;
    pos++;
    return t;
  }

  function parseExpression() {
    return parseAdditive();
  }

  function parseAdditive() {
    let left = parseMultiplicative();
    while (true) {
      const t = peek();
      if (t && t.type === 'op' && (t.value === '+' || t.value === '-')) {
        consume();
        const right = parseMultiplicative();
        left = (t.value === '+') ? left + right : left - right;
      } else {
        break;
      }
    }
    return left;
  }

  function parseMultiplicative() {
    let left = parsePower();
    while (true) {
      const t = peek();
      if (t && t.type === 'op' && (t.value === '*' || t.value === '/' || t.value === '%')) {
        consume();
        const right = parsePower();
        if (t.value === '*') {
          left = left * right;
        } else if (t.value === '/') {
          if (right === 0) throw new Error('Cannot divide by zero');
          left = left / right;
        } else if (t.value === '%') {
          if (right === 0) throw new Error('Cannot divide by zero');
          left = left % right;
        }
      } else {
        break;
      }
    }
    return left;
  }

  function parsePower() {
    let base = parseUnary();
    const t = peek();
    if (t && t.type === 'op' && t.value === '^') {
      consume();
      const exp = parsePower(); // right-associative: 2^3^2 = 2^(3^2) = 512
      return Math.pow(base, exp);
    }
    return base;
  }

  function parseUnary() {
    const t = peek();
    if (t && t.type === 'op') {
      if (t.value === '-') {
        consume();
        return -parseUnary();
      }
      if (t.value === '+') {
        consume();
        return parseUnary();
      }
    }
    return parsePostfix();
  }

  function parsePostfix() {
    let val = parsePrimary();
    while (true) {
      const t = peek();
      if (t && t.type === 'op' && t.value === '%') {
        // Postfix percentage: e.g. 50% = 0.5
        const next = expanded[pos + 1];
        if (!next || (next.type === 'op' && ['+', '-', '*', '/', ')'].includes(next.value))) {
          consume();
          val = val / 100;
          continue;
        }
      }
      if (t && t.type === 'op' && t.value === '!') {
        consume();
        if (val < 0 || !Number.isInteger(val)) throw new Error('Factorial requires non-negative integer');
        if (val > 170) val = Infinity;
        else {
          let f = 1;
          for (let k = 2; k <= val; k++) f *= k;
          val = f;
        }
        continue;
      }
      break;
    }
    return val;
  }

  function parsePrimary() {
    const t = peek();
    if (!t) throw new Error('Unexpected end of input');

    if (t.type === 'num') {
      consume();
      return t.value;
    }

    if (t.type === 'word') {
      const fn = t.value;
      consume();
      if (fn === 'pi') return Math.PI;
      if (fn === 'e') return Math.E;

      // Expect '('
      if (!consume('(')) throw new Error(`Expected '(' after function ${fn}`);
      const arg = parseExpression();
      if (!consume(')')) throw new Error(`Expected ')' after argument for ${fn}`);

      switch (fn) {
        case 'sin': {
          const rad = isDegree ? (arg * Math.PI) / 180 : arg;
          const res = Math.sin(rad);
          return Math.abs(res) < 1e-15 ? 0 : res;
        }
        case 'cos': {
          const rad = isDegree ? (arg * Math.PI) / 180 : arg;
          const res = Math.cos(rad);
          return Math.abs(res) < 1e-15 ? 0 : res;
        }
        case 'tan': {
          if (isDegree && (Math.abs(arg % 180) === 90)) throw new Error('Tangent undefined');
          const rad = isDegree ? (arg * Math.PI) / 180 : arg;
          const res = Math.tan(rad);
          return Math.abs(res) < 1e-15 ? 0 : res;
        }
        case 'asin': {
          if (arg < -1 || arg > 1) throw new Error('Domain error for asin');
          const rad = Math.asin(arg);
          return isDegree ? (rad * 180) / Math.PI : rad;
        }
        case 'acos': {
          if (arg < -1 || arg > 1) throw new Error('Domain error for acos');
          const rad = Math.acos(arg);
          return isDegree ? (rad * 180) / Math.PI : rad;
        }
        case 'atan': {
          const rad = Math.atan(arg);
          return isDegree ? (rad * 180) / Math.PI : rad;
        }
        case 'sqrt':
          if (arg < 0) throw new Error('Negative square root');
          return Math.sqrt(arg);
        case 'cbrt':
          return Math.cbrt(arg);
        case 'log':
          if (arg <= 0) throw new Error('Non-positive log');
          return Math.log10(arg);
        case 'ln':
          if (arg <= 0) throw new Error('Non-positive ln');
          return Math.log(arg);
        case 'abs':
          return Math.abs(arg);
        default:
          throw new Error(`Unknown function: ${fn}`);
      }
    }

    if (t.type === 'op' && t.value === '(') {
      consume('(');
      const val = parseExpression();
      if (!consume(')')) throw new Error("Expected ')'");
      return val;
    }

    throw new Error(`Unexpected token: ${t.value}`);
  }

  const result = parseExpression();
  if (pos < expanded.length) {
    throw new Error(`Extra input at token: ${expanded[pos].value}`);
  }
  return result;
}

export function createCalculatorApp() {
  const container = document.createElement('div');
  container.className = 'flex h-full bg-[#0a0f1d] text-slate-100 font-mono select-none outline-none';
  container.tabIndex = 0; // enables keyboard focus

  let displayValue = '0';
  let memoryValue = 0;
  let historyLog = [];
  let isDegreeMode = true; // KCSE default: DEG
  let justCalculated = false;

  container.innerHTML = `
    <!-- Calculator Main Pad -->
    <div class="flex-1 p-5 flex flex-col justify-between space-y-4">
      <!-- Display Screen -->
      <div class="bg-[#040814] border border-white/10 rounded-2xl p-4 text-right shadow-inner flex flex-col justify-between">
        <div class="flex items-center justify-between text-xs text-slate-400 min-h-[18px]">
          <div class="flex items-center gap-2">
            <button id="calc-angle-mode" type="button" class="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold tracking-wider cursor-pointer hover:bg-emerald-500/30 transition-all" title="Toggle Degrees / Radians">DEG</button>
            <span id="calc-mem-indicator" class="hidden px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[9px] font-bold">M</span>
          </div>
          <div id="calc-expression" class="truncate font-sans text-right flex-1 pl-2 text-slate-400"></div>
        </div>
        <div id="calc-display" class="text-3xl font-extrabold text-white tracking-wider truncate font-mono mt-1">0</div>
      </div>

      <!-- Keys Grid -->
      <div class="grid grid-cols-5 gap-2 text-xs">
        <!-- Memory & Sci Row 1 -->
        <button class="calc-btn sci" data-val="MC" title="Memory Clear">MC</button>
        <button class="calc-btn sci" data-val="MR" title="Memory Recall">MR</button>
        <button class="calc-btn sci" data-val="M+" title="Memory Add">M+</button>
        <button class="calc-btn sci" data-val="M-" title="Memory Subtract">M-</button>
        <button class="calc-btn action" data-val="C" title="Clear Display (Esc)">C</button>

        <!-- Sci Row 2 -->
        <button class="calc-btn sci" data-val="sin">sin</button>
        <button class="calc-btn sci" data-val="cos">cos</button>
        <button class="calc-btn sci" data-val="tan">tan</button>
        <button class="calc-btn sci" data-val="sqrt">√</button>
        <button class="calc-btn action" data-val="DEL" title="Backspace"><i class="fas fa-backspace"></i></button>

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
        <button class="calc-btn equals" data-val="=" title="Calculate (= / Enter)">=</button>
      </div>
    </div>

    <!-- History Sidebar -->
    <div class="w-48 bg-[#040814] border-l border-white/10 p-3 flex flex-col text-xs font-sans">
      <div class="font-bold text-slate-400 uppercase tracking-wider mb-2 pb-2 border-b border-white/10 flex justify-between items-center">
        <span>History</span>
        <button id="calc-clear-hist" class="hover:text-rose-400 text-[10px] cursor-pointer p-1" title="Clear History"><i class="fas fa-trash"></i></button>
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
        user-select: none;
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
  const angleBtn = container.querySelector('#calc-angle-mode');
  const memIndicator = container.querySelector('#calc-mem-indicator');

  const updateDisplay = () => {
    displayEl.textContent = displayValue;
    if (memIndicator) {
      if (memoryValue !== 0) {
        memIndicator.classList.remove('hidden');
      } else {
        memIndicator.classList.add('hidden');
      }
    }
  };

  const renderHistory = () => {
    if (historyLog.length === 0) {
      historyListEl.innerHTML = `<div class="text-slate-500 text-[11px] text-center pt-4">No calculations yet</div>`;
      return;
    }
    historyListEl.innerHTML = historyLog
      .map(
        (item, idx) => `
      <div class="bg-[#0f172a] hover:bg-[#1e293b] p-2 rounded-xl border border-white/5 text-right font-mono cursor-pointer transition-colors" data-hist-idx="${idx}" title="Click to use this result">
        <div class="text-[10px] text-slate-400 truncate">${item.expr}</div>
        <div class="font-bold text-emerald-400 text-sm">= ${item.res}</div>
      </div>
    `
      )
      .join('');

    // Clicking history item loads its result back into display
    historyListEl.querySelectorAll('[data-hist-idx]').forEach((el) => {
      el.addEventListener('click', () => {
        const idx = parseInt(el.dataset.histIdx, 10);
        const item = historyLog[idx];
        if (item) {
          displayValue = item.res;
          exprEl.textContent = item.expr + ' =';
          justCalculated = true;
          updateDisplay();
        }
      });
    });
  };

  const calculateResult = () => {
    if (!displayValue || displayValue === 'Error' || displayValue === 'Cannot divide by zero' || displayValue === 'Invalid Expression') return;

    try {
      const res = evaluateMathExpression(displayValue, isDegreeMode);

      if (!isFinite(res)) {
        displayValue = 'Cannot divide by zero';
        updateDisplay();
        return;
      }

      // Clean floating point precision anomalies (e.g. 0.1 + 0.2 = 0.3)
      let formatted;
      if (Number.isInteger(res)) {
        formatted = res.toString();
      } else {
        // Round to 10 decimal digits and strip trailing zeros
        formatted = parseFloat(res.toFixed(10)).toString();
      }

      historyLog.unshift({ expr: displayValue, res: formatted });
      if (historyLog.length > 30) historyLog.pop();

      exprEl.textContent = `${displayValue} =`;
      displayValue = formatted;
      justCalculated = true;
      updateDisplay();
      renderHistory();
    } catch (err) {
      if (err.message && err.message.toLowerCase().includes('divide by zero')) {
        displayValue = 'Cannot divide by zero';
      } else {
        displayValue = 'Invalid Expression';
      }
      updateDisplay();
    }
  };

  function handleInput(val) {
    if (displayValue === 'Error' || displayValue === 'Cannot divide by zero' || displayValue === 'Invalid Expression') {
      displayValue = '0';
      justCalculated = false;
    }

    if (val === 'C') {
      displayValue = '0';
      exprEl.textContent = '';
      justCalculated = false;
    } else if (val === 'DEL') {
      justCalculated = false;
      if (displayValue.endsWith('sin(') || displayValue.endsWith('cos(') || displayValue.endsWith('tan(') || displayValue.endsWith('log(')) {
        displayValue = displayValue.slice(0, -4);
      } else if (displayValue.endsWith('ln(') || displayValue.endsWith('√(')) {
        displayValue = displayValue.slice(0, -3);
      } else {
        displayValue = displayValue.length > 1 ? displayValue.slice(0, -1) : '0';
      }
      if (!displayValue) displayValue = '0';
    } else if (val === '=') {
      calculateResult();
      return;
    } else if (['sin', 'cos', 'tan', 'log', 'ln'].includes(val)) {
      if (justCalculated || displayValue === '0') {
        displayValue = `${val}(`;
      } else {
        displayValue = `${displayValue}${val}(`;
      }
      justCalculated = false;
    } else if (val === 'sqrt') {
      if (justCalculated || displayValue === '0') {
        displayValue = '√(';
      } else {
        displayValue = `${displayValue}√(`;
      }
      justCalculated = false;
    } else if (val === 'pi') {
      if (justCalculated || displayValue === '0') {
        displayValue = 'π';
      } else {
        displayValue = `${displayValue}π`;
      }
      justCalculated = false;
    } else if (val === 'MC') {
      memoryValue = 0;
    } else if (val === 'MR') {
      displayValue = memoryValue.toString();
      justCalculated = false;
    } else if (val === 'M+') {
      try {
        const curr = evaluateMathExpression(displayValue, isDegreeMode);
        if (isFinite(curr)) memoryValue += curr;
      } catch (_) {}
    } else if (val === 'M-') {
      try {
        const curr = evaluateMathExpression(displayValue, isDegreeMode);
        if (isFinite(curr)) memoryValue -= curr;
      } catch (_) {}
    } else if (val === '+/-') {
      if (displayValue.startsWith('-')) {
        displayValue = displayValue.slice(1);
      } else if (displayValue !== '0') {
        displayValue = `-${displayValue}`;
      }
      justCalculated = false;
    } else if (['+', '-', '*', '/', '^'].includes(val)) {
      justCalculated = false;
      const lastChar = displayValue.slice(-1);
      if (['+', '-', '*', '/', '^'].includes(lastChar)) {
        // Replace previous operator
        displayValue = displayValue.slice(0, -1) + val;
      } else {
        displayValue += val;
      }
    } else {
      // Numbers or decimal
      if (justCalculated) {
        if (val === '.') {
          displayValue = '0.';
        } else {
          displayValue = val;
        }
        justCalculated = false;
      } else if (displayValue === '0' && val !== '.') {
        displayValue = val;
      } else {
        displayValue += val;
      }
    }
    updateDisplay();
  }

  // Angle Mode (DEG / RAD) toggle
  angleBtn.addEventListener('click', () => {
    isDegreeMode = !isDegreeMode;
    angleBtn.textContent = isDegreeMode ? 'DEG' : 'RAD';
    angleBtn.className = isDegreeMode
      ? 'px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold tracking-wider cursor-pointer hover:bg-emerald-500/30 transition-all'
      : 'px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold tracking-wider cursor-pointer hover:bg-indigo-500/30 transition-all';
  });

  // Button clicks handler
  container.querySelectorAll('.calc-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      handleInput(btn.dataset.val);
      container.focus();
    });
  });

  // Physical Keyboard listener on the calculator container and parent window
  const onKeyDown = (e) => {
    if (e.__dawamuCalcHandled) return;
    e.__dawamuCalcHandled = true;

    // If the active focused window in Dawamu OS is not calculator, ignore
    if (window.dawamuOS?.state && window.dawamuOS.state.activeWindowId && window.dawamuOS.state.activeWindowId !== 'calculator') {
      return;
    }

    if (e.key >= '0' && e.key <= '9') {
      e.preventDefault();
      handleInput(e.key);
    } else if (['+', '-', '*', '/'].includes(e.key)) {
      e.preventDefault();
      handleInput(e.key);
    } else if (e.key === 'x' || e.key === 'X') {
      e.preventDefault();
      handleInput('*');
    } else if (e.key === '.') {
      e.preventDefault();
      handleInput('.');
    } else if (e.key === '(' || e.key === ')') {
      e.preventDefault();
      handleInput(e.key);
    } else if (e.key === '^') {
      e.preventDefault();
      handleInput('^');
    } else if (e.key === '%') {
      e.preventDefault();
      handleInput('%');
    } else if (e.key === '!' || e.key === '#') {
      e.preventDefault();
      handleInput('!');
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
  };

  container.addEventListener('keydown', onKeyDown);
  window.addEventListener('keydown', (e) => {
    const calcWin = document.getElementById('window-calculator');
    if (calcWin && calcWin.classList.contains('focused')) {
      onKeyDown(e);
    }
  });

  container.querySelector('#calc-clear-hist').addEventListener('click', () => {
    historyLog = [];
    renderHistory();
  });

  // Auto-focus container when mounted or clicked
  container.addEventListener('mousedown', () => {
    container.focus();
  });

  return container;
}
