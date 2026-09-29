/**
 * ChromeOS Student Edition - Focus Timer & Study Sound Synthesizer
 */

import { stateStore } from '../os/state.js';

export function createFocusTimerApp() {
  const container = document.createElement('div');
  container.className = 'flex flex-col h-full bg-slate-900 text-slate-100 font-sans p-6 justify-between overflow-y-auto';

  let timerMode = 'focus'; // 'focus' | 'shortBreak' | 'longBreak'
  let totalSeconds = 25 * 60;
  let remainingSeconds = 25 * 60;
  let timerInterval = null;
  let isRunning = false;

  // Web Audio Synth State
  let audioCtx = null;
  let currentSound = 'none'; // 'none' | 'rain' | 'waves' | 'noise'
  let noiseNode = null;
  let gainNode = null;

  container.innerHTML = `
    <!-- Top Mode Selector Pills -->
    <div class="flex justify-center gap-2 text-xs">
      <button class="mode-btn px-4 py-2 rounded-full font-bold transition-all bg-blue-600 text-white" data-mode="focus" data-mins="25">
        <i class="fas fa-brain"></i> Focus (25m)
      </button>
      <button class="mode-btn px-4 py-2 rounded-full font-bold transition-all bg-slate-800 text-slate-400 hover:bg-slate-700" data-mode="shortBreak" data-mins="5">
        <i class="fas fa-coffee"></i> Short Break (5m)
      </button>
      <button class="mode-btn px-4 py-2 rounded-full font-bold transition-all bg-slate-800 text-slate-400 hover:bg-slate-700" data-mode="longBreak" data-mins="15">
        <i class="fas fa-couch"></i> Long Break (15m)
      </button>
    </div>

    <!-- Timer Ring & Display -->
    <div class="flex flex-col items-center justify-center relative my-4">
      <svg class="w-64 h-64 transform -rotate-90">
        <circle cx="128" cy="128" r="110" stroke="#1e293b" stroke-width="12" fill="transparent" />
        <circle id="timer-progress-ring" cx="128" cy="128" r="110" stroke="#3b82f6" stroke-width="12" fill="transparent"
          stroke-dasharray="691" stroke-dashoffset="0" stroke-linecap="round" class="transition-all duration-1000 ease-linear" />
      </svg>

      <div class="absolute inset-0 flex flex-col items-center justify-center text-center">
        <div id="timer-display" class="text-5xl font-extrabold text-white tracking-widest font-mono">25:00</div>
        <div id="timer-subtext" class="text-xs font-semibold text-blue-400 mt-2 uppercase tracking-wider">Deep Work Block</div>
      </div>
    </div>

    <!-- Play/Pause Controls -->
    <div class="flex items-center justify-center gap-4">
      <button id="timer-start-btn" class="bg-blue-600 hover:bg-blue-500 text-white text-sm font-extrabold px-8 py-3 rounded-full shadow-lg transition-transform active:scale-95 flex items-center gap-2">
        <i class="fas fa-play"></i> Start Session
      </button>
      <button id="timer-reset-btn" class="bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-bold p-3 rounded-full transition-colors" title="Reset Timer">
        <i class="fas fa-undo"></i>
      </button>
    </div>

    <!-- Study Ambient Sound Synthesizer -->
    <div class="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3 mt-4">
      <div class="flex items-center justify-between text-xs">
        <span class="font-bold text-slate-300 flex items-center gap-1.5">
          <i class="fas fa-headphones text-purple-400"></i> Ambient Study Sounds (Synthesizer)
        </span>
        <span id="sound-status-label" class="text-[10px] text-slate-500 font-mono">Audio Off</span>
      </div>

      <div class="grid grid-cols-4 gap-2 text-xs">
        <button class="sound-btn bg-slate-900 border border-slate-800 p-2 rounded-xl hover:border-purple-500 text-slate-400 font-semibold" data-sound="rain">
          🌧️ Rain
        </button>
        <button class="sound-btn bg-slate-900 border border-slate-800 p-2 rounded-xl hover:border-purple-500 text-slate-400 font-semibold" data-sound="waves">
          🌊 Ocean
        </button>
        <button class="sound-btn bg-slate-900 border border-slate-800 p-2 rounded-xl hover:border-purple-500 text-slate-400 font-semibold" data-sound="noise">
          💨 White Noise
        </button>
        <button class="sound-btn bg-slate-900 border border-slate-800 p-2 rounded-xl hover:border-red-500 text-rose-400 font-semibold" data-sound="none">
          🚫 Mute
        </button>
      </div>

      <div class="flex items-center gap-3 text-xs text-slate-400 pt-1">
        <i class="fas fa-volume-down text-purple-400"></i>
        <input type="range" id="sound-vol-slider" min="0" max="100" value="50" class="w-full accent-purple-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer">
      </div>
    </div>

    <!-- Daily Focus Stats -->
    <div class="flex justify-between items-center text-xs text-slate-400 border-t border-slate-800 pt-3">
      <span>Daily Focus Completed: <b id="stat-sessions" class="text-emerald-400 font-bold">4 Sessions</b></span>
      <span>Total Time: <b id="stat-minutes" class="text-blue-400 font-bold">100 Mins</b></span>
    </div>
  `;

  const displayEl = container.querySelector('#timer-display');
  const startBtn = container.querySelector('#timer-start-btn');
  const resetBtn = container.querySelector('#timer-reset-btn');
  const progressRing = container.querySelector('#timer-progress-ring');
  const subtextEl = container.querySelector('#timer-subtext');

  const updateDisplay = () => {
    const mins = Math.floor(remainingSeconds / 60);
    const secs = remainingSeconds % 60;
    displayEl.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

    // Update Progress Ring (perimeter = 2 * PI * 110 ≈ 691)
    const strokeDash = 691;
    const progress = remainingSeconds / totalSeconds;
    const offset = strokeDash - progress * strokeDash;
    progressRing.style.strokeDashoffset = offset;
  };

  const startTimer = () => {
    if (isRunning) return;
    isRunning = true;
    startBtn.innerHTML = `<i class="fas fa-pause"></i> Pause Session`;
    startBtn.className = 'bg-amber-600 hover:bg-amber-500 text-white text-sm font-extrabold px-8 py-3 rounded-full shadow-lg transition-transform active:scale-95 flex items-center gap-2';

    timerInterval = setInterval(() => {
      if (remainingSeconds > 0) {
        remainingSeconds--;
        updateDisplay();
      } else {
        stopTimer();
        if (timerMode === 'focus') {
          stateStore.addFocusSession(Math.round(totalSeconds / 60));
          updateStats();
          alert('🎉 Focus Session Completed! Take a well-deserved 5-minute break.');
        }
      }
    }, 1000);
  };

  const stopTimer = () => {
    isRunning = false;
    clearInterval(timerInterval);
    startBtn.innerHTML = `<i class="fas fa-play"></i> Resume Session`;
    startBtn.className = 'bg-blue-600 hover:bg-blue-500 text-white text-sm font-extrabold px-8 py-3 rounded-full shadow-lg transition-transform active:scale-95 flex items-center gap-2';
  };

  const resetTimer = () => {
    stopTimer();
    remainingSeconds = totalSeconds;
    startBtn.innerHTML = `<i class="fas fa-play"></i> Start Session`;
    startBtn.className = 'bg-blue-600 hover:bg-blue-500 text-white text-sm font-extrabold px-8 py-3 rounded-full shadow-lg transition-transform active:scale-95 flex items-center gap-2';
    updateDisplay();
  };

  const updateStats = () => {
    const stats = stateStore.getState().focusTimerStats;
    container.querySelector('#stat-sessions').textContent = `${stats.sessionsCompleted} Sessions`;
    container.querySelector('#stat-minutes').textContent = `${stats.totalMinutes} Mins`;
  };

  // Mode Selection Listeners
  container.querySelectorAll('.mode-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.mode-btn').forEach((b) => {
        b.className = 'mode-btn px-4 py-2 rounded-full font-bold transition-all bg-slate-800 text-slate-400 hover:bg-slate-700';
      });
      btn.className = 'mode-btn px-4 py-2 rounded-full font-bold transition-all bg-blue-600 text-white';

      timerMode = btn.dataset.mode;
      const mins = parseInt(btn.dataset.mins, 10);
      totalSeconds = mins * 60;

      if (timerMode === 'focus') subtextEl.textContent = 'Deep Work Block';
      if (timerMode === 'shortBreak') subtextEl.textContent = 'Rest & Stretch';
      if (timerMode === 'longBreak') subtextEl.textContent = 'Relaxation Break';

      resetTimer();
    });
  });

  startBtn.addEventListener('click', () => {
    if (isRunning) stopTimer();
    else startTimer();
  });

  resetBtn.addEventListener('click', resetTimer);

  // Web Audio Synthesizer Setup
  const initAudio = () => {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
  };

  const playSynthSound = (soundType) => {
    initAudio();
    stopAudio();

    if (soundType === 'none') {
      container.querySelector('#sound-status-label').textContent = 'Audio Off';
      return;
    }

    container.querySelector('#sound-status-label').textContent = `Playing ${soundType.toUpperCase()}`;

    // Create White Noise buffer
    const bufferSize = audioCtx.sampleRate * 2;
    const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    noiseNode = audioCtx.createBufferSource();
    noiseNode.buffer = noiseBuffer;
    noiseNode.loop = true;

    gainNode = audioCtx.createGain();
    const vol = container.querySelector('#sound-vol-slider').value / 100;
    gainNode.gain.setValueAtTime(vol * 0.15, audioCtx.currentTime);

    const filter = audioCtx.createBiquadFilter();
    if (soundType === 'rain') {
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1000, audioCtx.currentTime);
    } else if (soundType === 'waves') {
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(400, audioCtx.currentTime);
    } else {
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(3000, audioCtx.currentTime);
    }

    noiseNode.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    noiseNode.start();
  };

  const stopAudio = () => {
    if (noiseNode) {
      try { noiseNode.stop(); } catch (e) {}
      noiseNode = null;
    }
  };

  container.querySelectorAll('.sound-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const sound = btn.dataset.sound;
      playSynthSound(sound);
    });
  });

  container.querySelector('#sound-vol-slider').addEventListener('input', (e) => {
    if (gainNode && audioCtx) {
      gainNode.gain.setValueAtTime((e.target.value / 100) * 0.15, audioCtx.currentTime);
    }
  });

  updateDisplay();
  updateStats();

  return container;
}
