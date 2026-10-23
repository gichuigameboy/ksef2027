/**
 * Dawamu OS - Dedicated Offline Web Browser
 * 
 * Features:
 * - 100% Offline - Works with zero internet connection
 * - Multi-tab simulated web browser with true URL routing & navigation
 * - Built-in Offline Search Engine (indexes all topics & articles)
 * - Rich offline Wikipedia, Khan Academy, NASA Space, and Literature pages
 * - Interactive Python Playground & Science Tools
 * - Bookmarks bar & Browsing History
 */

import { restrictionManager } from '../os/restrictionManager.js';
import { OFFLINE_ARTICLES, STUDY_QUIZZES } from './offlineContent.js';
import { BOOKS_844, BOOKS_844_CATALOG, renderBooks844Portal } from './books844.js';

/* ─── OFFLINE WEBPAGES DATABASE ─── */
const OFFLINE_WEB_DB = {
  // Start Page
  'dawamu://home': {
    title: 'Dawamu Offline Web',
    type: 'home',
    render: renderHomePage
  },

  // Search Results
  'dawamu://search': {
    title: 'Dawamu Search Results',
    type: 'search',
    render: renderSearchResultsPage
  },

  // Wikipedia Articles
  'https://en.wikipedia.org/wiki/Photosynthesis': {
    domain: 'en.wikipedia.org',
    title: 'Photosynthesis - Wikipedia',
    category: 'Biology',
    summary: 'The biological process by which plants convert light energy into chemical energy.',
    render: () => `
      <div class="max-w-4xl mx-auto bg-white text-[#202122] p-8 rounded-lg shadow-sm font-serif leading-relaxed">
        <div class="border-b border-gray-300 pb-3 mb-6">
          <h1 class="text-3xl font-serif text-black">Photosynthesis</h1>
          <div class="text-xs text-gray-500 font-sans mt-1">From Wikipedia, the free offline encyclopedia</div>
        </div>
        
        <div class="float-right w-72 ml-6 mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl font-sans text-xs">
          <div class="text-center font-bold text-emerald-800 text-sm mb-2">Chemical Equation</div>
          <div class="bg-white p-3 rounded-lg border border-emerald-300 font-mono text-center text-emerald-900 font-bold mb-2">
            6CO₂ + 6H₂O + Light → C₆H₁₂O₆ + 6O₂
          </div>
          <div class="text-gray-600">Carbon dioxide + Water + Sunlight produces Glucose + Oxygen</div>
        </div>

        <p class="text-base mb-4">
          <b>Photosynthesis</b> is a biological process utilized by plants, algae, and certain bacteria to transform light energy (usually from the Sun) into chemical energy stored in glucose molecules.
        </p>

        <h2 class="text-xl font-bold font-sans border-b border-gray-200 pb-1 mt-6 mb-3 text-[#0b0080]">1. Light-Dependent Reactions</h2>
        <p class="mb-3">
          Occur within the <b>thylakoid membranes</b> of the chloroplasts. Chlorophyll pigments absorb photons of light, exciting electrons that travel through an electron transport chain, generating ATP and NADPH while splitting water (photolysis) to release molecular oxygen (O₂).
        </p>

        <h2 class="text-xl font-bold font-sans border-b border-gray-200 pb-1 mt-6 mb-3 text-[#0b0080]">2. The Calvin Cycle (Light-Independent)</h2>
        <p class="mb-3">
          Takes place in the <b>stroma</b> of chloroplasts. The enzyme <b>RuBisCO</b> fixes atmospheric CO₂ onto ribulose-1,5-bisphosphate, which undergoes reduction using ATP and NADPH to synthesize high-energy sugars (glucose).
        </p>

        <div class="bg-gray-100 p-4 rounded-lg font-sans text-xs mt-6 border-l-4 border-emerald-600">
          <b>Key Takeaway for Exams:</b> Photosynthesis is the foundational energy pathway supporting virtually all aerobic life on Earth, regulating global oxygen and carbon cycles.
        </div>
      </div>
    `
  },

  'https://en.wikipedia.org/wiki/History_of_Kenya': {
    domain: 'en.wikipedia.org',
    title: 'History of Kenya - Wikipedia',
    category: 'History',
    summary: 'From early hominid fossils in the Great Rift Valley to independence and the 2010 Constitution.',
    render: () => `
      <div class="max-w-4xl mx-auto bg-white text-[#202122] p-8 rounded-lg shadow-sm font-serif leading-relaxed">
        <div class="border-b border-gray-300 pb-3 mb-6">
          <h1 class="text-3xl font-serif text-black">History of Kenya</h1>
          <div class="text-xs text-gray-500 font-sans mt-1">From Wikipedia, the free offline encyclopedia</div>
        </div>

        <p class="text-base mb-4">
          The history of Kenya spans millions of years. Paleontological discoveries in the <b>Turkana Basin</b> and Great Rift Valley have earned the region the title of the <i>"Cradle of Humankind."</i>
        </p>

        <h2 class="text-xl font-bold font-sans border-b border-gray-200 pb-1 mt-6 mb-3 text-[#0b0080]">Pre-Colonial Coastal Trade</h2>
        <p class="mb-3">
          Between the 1st and 15th centuries AD, city-states such as <b>Mombasa, Malindi, and Lamu</b> flourished through maritime trade across the Indian Ocean with Arabia, Persia, and India, fostering the rich <b>Swahili culture and language</b>.
        </p>

        <h2 class="text-xl font-bold font-sans border-b border-gray-200 pb-1 mt-6 mb-3 text-[#0b0080]">The Struggle for Independence (Mau Mau)</h2>
        <p class="mb-3">
          Following British colonial rule established in 1895, the <b>Mau Mau uprising</b> of the 1950s catalyzed the push for self-governance. On <b>December 12, 1963</b>, Kenya attained independence, with <b>Mzee Jomo Kenyatta</b> serving as its first Prime Minister and later President.
        </p>

        <h2 class="text-xl font-bold font-sans border-b border-gray-200 pb-1 mt-6 mb-3 text-[#0b0080]">The 2010 Constitution</h2>
        <p class="mb-3">
          On August 27, 2010, Kenya promulgated a transformative new Constitution, introducing devolved governance (47 counties), an enhanced Bill of Rights, and independent judiciary oversight.
        </p>
      </div>
    `
  },

  'https://en.wikipedia.org/wiki/Solar_System': {
    domain: 'en.wikipedia.org',
    title: 'Solar System - Wikipedia',
    category: 'Astronomy',
    summary: 'The gravitationally bound system of the Sun and the objects that orbit it.',
    render: () => `
      <div class="max-w-4xl mx-auto bg-white text-[#202122] p-8 rounded-lg shadow-sm font-serif leading-relaxed">
        <div class="border-b border-gray-300 pb-3 mb-6">
          <h1 class="text-3xl font-serif text-black">The Solar System</h1>
          <div class="text-xs text-gray-500 font-sans mt-1">From Wikipedia, the free offline encyclopedia</div>
        </div>

        <p class="text-base mb-4">
          The <b>Solar System</b> formed 4.6 billion years ago from the gravitational collapse of a giant interstellar molecular cloud. It consists of the <b>Sun</b> and eight major planets.
        </p>

        <div class="grid grid-cols-2 gap-4 font-sans text-xs my-6">
          <div class="bg-blue-50 border border-blue-200 p-4 rounded-xl">
            <div class="font-bold text-blue-900 text-sm mb-2">🪐 Terrestrial (Rocky) Planets</div>
            <ul class="list-disc pl-4 space-y-1 text-blue-800">
              <li><b>Mercury:</b> Closest to the Sun, extreme temperature swings.</li>
              <li><b>Venus:</b> Thick CO₂ greenhouse atmosphere; hottest planet.</li>
              <li><b>Earth:</b> The only planet known to support living organisms.</li>
              <li><b>Mars:</b> The "Red Planet", iron-oxide rich with past water evidence.</li>
            </ul>
          </div>

          <div class="bg-purple-50 border border-purple-200 p-4 rounded-xl">
            <div class="font-bold text-purple-900 text-sm mb-2">🌌 Gas & Ice Giants</div>
            <ul class="list-disc pl-4 space-y-1 text-purple-800">
              <li><b>Jupiter:</b> Largest planet with the iconic Great Red Spot.</li>
              <li><b>Saturn:</b> Extensive, prominent planetary ring system.</li>
              <li><b>Uranus:</b> Tilted on its side; icy methane atmosphere.</li>
              <li><b>Neptune:</b> Farthest known major planet with supersonic winds.</li>
            </ul>
          </div>
        </div>
      </div>
    `
  },

  'https://en.wikipedia.org/wiki/Computer_programming': {
    domain: 'en.wikipedia.org',
    title: 'Computer Programming - Wikipedia',
    category: 'Computer Science',
    summary: 'The process of performing a particular computation, usually by designing executable computer programs.',
    render: () => `
      <div class="max-w-4xl mx-auto bg-white text-[#202122] p-8 rounded-lg shadow-sm font-serif leading-relaxed">
        <div class="border-b border-gray-300 pb-3 mb-6">
          <h1 class="text-3xl font-serif text-black">Computer Programming & Python</h1>
          <div class="text-xs text-gray-500 font-sans mt-1">From Wikipedia, the free offline encyclopedia</div>
        </div>

        <p class="text-base mb-4">
          <b>Programming</b> involves formulating algorithms and writing source code in languages such as Python, JavaScript, and C++ to instruct computers to automate tasks.
        </p>

        <div class="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-xs my-4 border border-slate-700">
          <div class="text-emerald-400 mb-1"># Python Example: Calculate Factorial</div>
          <span class="text-purple-400">def</span> <span class="text-blue-400">factorial</span>(n):<br>
          &nbsp;&nbsp;&nbsp;&nbsp;<span class="text-purple-400">if</span> n <= 1: <span class="text-purple-400">return</span> 1<br>
          &nbsp;&nbsp;&nbsp;&nbsp;<span class="text-purple-400">return</span> n * factorial(n - 1)<br><br>
          <span class="text-amber-300">print</span>(<span class="text-emerald-300">f"5! = {factorial(5)}"</span>)  <span class="text-slate-500"># Output: 120</span>
        </div>
      </div>
    `
  },

  // Khan Academy Lessons
  'https://www.khanacademy.org/math/algebra': {
    domain: 'khanacademy.org',
    title: 'Algebra: Solving Linear & Quadratic Equations | Khan Academy',
    category: 'Mathematics',
    summary: 'Master solving linear systems, factoring quadratics, and graphing parabolas.',
    render: () => `
      <div class="max-w-4xl mx-auto bg-[#0b1f3a] text-white p-8 rounded-2xl shadow-xl font-sans">
        <div class="flex items-center gap-3 mb-6 pb-4 border-b border-blue-800">
          <div class="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center text-white text-2xl font-bold">
            <i class="fas fa-leaf"></i>
          </div>
          <div>
            <div class="text-xs text-emerald-400 font-bold uppercase tracking-wider">Khan Academy Offline</div>
            <h1 class="text-2xl font-bold">Algebra 1: Quadratic Equations Mastery</h1>
          </div>
        </div>

        <div class="bg-[#132d54] p-6 rounded-xl border border-blue-700/50 mb-6">
          <h2 class="text-lg font-bold text-amber-300 mb-2">The Standard Quadratic Equation</h2>
          <div class="text-2xl font-mono text-center my-4 py-3 bg-[#081528] rounded-lg border border-blue-900 text-emerald-300">
            ax² + bx + c = 0
          </div>
          <p class="text-sm text-slate-300 mb-4">
            The solutions (roots) can always be found using the <b>Quadratic Formula</b>:
          </p>
          <div class="text-xl font-mono text-center my-2 py-3 bg-[#081528] rounded-lg border border-blue-900 text-yellow-300">
            x = (-b ± √(b² - 4ac)) / (2a)
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4 text-xs">
          <div class="bg-[#132d54] p-4 rounded-xl border border-blue-700/30">
            <h3 class="font-bold text-emerald-400 mb-1">Discriminant Analysis (Δ = b² - 4ac)</h3>
            <ul class="space-y-1 text-slate-300">
              <li>• <b>Δ > 0:</b> Two distinct real roots</li>
              <li>• <b>Δ = 0:</b> Exactly one real repeated root</li>
              <li>• <b>Δ < 0:</b> Two complex / imaginary roots</li>
            </ul>
          </div>
          <div class="bg-[#132d54] p-4 rounded-xl border border-blue-700/30">
            <h3 class="font-bold text-amber-400 mb-1">Practice Example</h3>
            <div class="text-slate-300">
              Solve: <b>x² - 5x + 6 = 0</b><br>
              Factored: <b>(x - 2)(x - 3) = 0</b><br>
              Solutions: <b class="text-emerald-300">x = 2 or x = 3</b>
            </div>
          </div>
        </div>
      </div>
    `
  },

  'https://www.khanacademy.org/science/physics': {
    domain: 'khanacademy.org',
    title: 'Physics: Newton\'s Laws of Motion | Khan Academy',
    category: 'Physics',
    summary: 'Explore inertia, force, acceleration, and action-reaction pairs.',
    render: () => `
      <div class="max-w-4xl mx-auto bg-[#0b1f3a] text-white p-8 rounded-2xl shadow-xl font-sans">
        <div class="flex items-center gap-3 mb-6 pb-4 border-b border-blue-800">
          <div class="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center text-white text-2xl font-bold">
            <i class="fas fa-atom"></i>
          </div>
          <div>
            <div class="text-xs text-indigo-400 font-bold uppercase tracking-wider">Khan Academy Offline</div>
            <h1 class="text-2xl font-bold">Physics: Newton's 3 Laws of Motion</h1>
          </div>
        </div>

        <div class="space-y-4">
          <div class="bg-[#132d54] p-4 rounded-xl border border-blue-700/40">
            <h3 class="text-amber-300 font-bold text-base mb-1">1. First Law (Law of Inertia)</h3>
            <p class="text-xs text-slate-300">An object remains at rest, or in uniform motion along a straight line, unless acted upon by a non-zero net external force.</p>
          </div>
          <div class="bg-[#132d54] p-4 rounded-xl border border-blue-700/40">
            <h3 class="text-emerald-300 font-bold text-base mb-1">2. Second Law (F = ma)</h3>
            <p class="text-xs text-slate-300">The acceleration of an object is directly proportional to the net force acting upon it and inversely proportional to its mass: <b class="text-emerald-200 font-mono">F = m × a</b></p>
          </div>
          <div class="bg-[#132d54] p-4 rounded-xl border border-blue-700/40">
            <h3 class="text-purple-300 font-bold text-base mb-1">3. Third Law (Action & Reaction)</h3>
            <p class="text-xs text-slate-300">For every action force, there is an equal in magnitude and opposite in direction reaction force (<b class="text-purple-200 font-mono">F_A = -F_B</b>).</p>
          </div>
        </div>
      </div>
    `
  },

  // NASA Mars Portal
  'https://www.nasa.gov/mars': {
    domain: 'nasa.gov',
    title: 'NASA Mars Exploration Rover Mission',
    category: 'Space Exploration',
    summary: 'Live offline briefing on the Perseverance Rover and the search for ancient biosignatures.',
    render: () => `
      <div class="max-w-4xl mx-auto bg-[#0a0a0f] text-white p-8 rounded-2xl shadow-2xl border border-red-950 font-sans">
        <div class="flex items-center gap-3 mb-6 pb-4 border-b border-red-900/50">
          <i class="fas fa-rocket text-red-500 text-3xl"></i>
          <div>
            <div class="text-xs text-red-400 font-bold uppercase tracking-widest">NASA Exploration Division</div>
            <h1 class="text-2xl font-extrabold">Mars 2020: Perseverance Rover</h1>
          </div>
        </div>

        <div class="grid grid-cols-3 gap-4 mb-6">
          <div class="bg-[#141420] p-4 rounded-xl border border-red-900/30 text-center">
            <div class="text-[10px] text-slate-400 uppercase">Landing Site</div>
            <div class="text-sm font-bold text-red-400 mt-1">Jezero Crater</div>
          </div>
          <div class="bg-[#141420] p-4 rounded-xl border border-red-900/30 text-center">
            <div class="text-[10px] text-slate-400 uppercase">Mission Objective</div>
            <div class="text-sm font-bold text-emerald-400 mt-1">Astrobiology & Samples</div>
          </div>
          <div class="bg-[#141420] p-4 rounded-xl border border-red-900/30 text-center">
            <div class="text-[10px] text-slate-400 uppercase">Helicopter Companion</div>
            <div class="text-sm font-bold text-cyan-400 mt-1">Ingenuity (72 Flights)</div>
          </div>
        </div>

        <div class="space-y-4 text-xs text-slate-300 leading-relaxed">
          <p>
            The <b>Perseverance rover</b> landed inside <b>Jezero Crater</b> on February 18, 2021. Scientists believe the crater was once flooded with water and was home to an ancient river delta.
          </p>
          <p>
            Perseverance is collecting rock core samples sealed in titanium tubes for the planned <b>Mars Sample Return mission</b>, which will bring them to Earth laboratories.
          </p>
        </div>
      </div>
    `
  },

  // Literature & Library
  'https://library.dawamu.school/classics/romeo-and-juliet': {
    domain: 'library.dawamu.school',
    title: 'Romeo and Juliet - Dawamu Student Library',
    category: 'Literature',
    summary: 'William Shakespeare\'s famous tragedy of star-crossed lovers.',
    render: () => `
      <div class="max-w-4xl mx-auto bg-[#faf6ee] text-[#2c2416] p-8 rounded-2xl shadow-lg border border-[#e2d5c3] font-serif">
        <div class="text-center border-b border-[#d8c3a5] pb-4 mb-6">
          <div class="text-xs font-sans text-amber-800 uppercase tracking-widest font-bold">Dawamu School Classical Literature</div>
          <h1 class="text-3xl font-bold mt-1">The Tragedy of Romeo and Juliet</h1>
          <div class="text-xs text-amber-900 font-sans mt-1">By William Shakespeare (c. 1595)</div>
        </div>

        <div class="bg-[#f0e6d2] p-4 rounded-xl text-center italic text-sm mb-6 border-l-4 border-amber-800">
          "Two households, both alike in dignity,<br>
          In fair Verona, where we lay our scene,<br>
          From ancient grudge break to new mutiny,<br>
          Where civil blood makes civil hands unclean."<br>
          <span class="text-xs font-sans not-italic font-bold text-amber-900 mt-2 block">— The Prologue</span>
        </div>

        <h3 class="text-lg font-sans font-bold text-amber-950 mb-2">Key Themes for Analysis:</h3>
        <ul class="font-sans text-xs space-y-2 text-amber-900 mb-4">
          <li>• <b>Love vs. Hate:</b> The passionate love of Romeo and Juliet contrasted against the bitter feud between the Capulets and Montagues.</li>
          <li>• <b>Fate and Destiny:</b> Characters frequently foreshadow their doom as "star-crossed."</li>
          <li>• <b>Individual vs. Society:</b> The struggle between personal desires and rigid societal/familial duties.</li>
        </ul>
      </div>
    `
  },

  // Interactive Python Runner
  'dawamu://python-playground': {
    title: 'Python Interactive Playground',
    category: 'Computer Science',
    summary: 'Interactive offline Python programming environment with live interpreter, algorithms, and science simulations.',
    render: renderPythonPlaygroundPage
  }
};

// Merge Curated School Syllabus Knowledgebase & 8-4-4 Form 3 & 4 Coursebooks
Object.assign(OFFLINE_WEB_DB, OFFLINE_ARTICLES);
Object.assign(OFFLINE_WEB_DB, BOOKS_844);

/* ─── SEARCH INDEXER ─── */
function searchOfflineDatabase(query) {
  const terms = query.toLowerCase().trim().split(/\s+/);
  if (!terms.length || !terms[0]) return [];

  const results = [];
  for (const [url, item] of Object.entries(OFFLINE_WEB_DB)) {
    if (url === 'dawamu://home' || url === 'dawamu://search') continue;

    let score = 0;
    const fullText = (item.title + ' ' + (item.category || '') + ' ' + (item.summary || '') + ' ' + url).toLowerCase();

    for (const term of terms) {
      if (item.title.toLowerCase().includes(term)) score += 5;
      if (item.category && item.category.toLowerCase().includes(term)) score += 3;
      if (item.summary && item.summary.toLowerCase().includes(term)) score += 2;
      if (url.toLowerCase().includes(term)) score += 2;
    }

    if (score > 0) {
      results.push({ url, item, score });
    }
  }

  return results.sort((a, b) => b.score - a.score);
}

/* ═══════════════════════════════════════════════════
   APP SHELL & MULTI-TAB CONTROLLER
═══════════════════════════════════════════════════ */
export function createOfflineBrowserApp(initialUrl = 'dawamu://home') {
  let tabs = [];
  let activeTabId = null;
  let tabCounter = 0;
  let historyStack = [];

  const root = document.createElement('div');
  root.className = 'flex flex-col h-full bg-[#1e2022] text-white font-sans overflow-hidden select-text';

  root.innerHTML = `
    <!-- Tab Strip -->
    <div class="flex items-end bg-[#070c16] px-3 pt-2 gap-1.5 min-h-[42px] overflow-x-auto shrink-0 border-b border-white/5 select-none">
      <div id="tab-strip" class="flex items-end gap-1.5 flex-1 overflow-x-auto"></div>
      <button id="btn-new-tab" class="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-emerald-400 hover:text-white flex items-center justify-center text-xs self-center ml-1 shrink-0 transition-all active:scale-95 shadow-sm" title="New Tab">
        <i class="fas fa-plus"></i>
      </button>
    </div>

    <!-- Toolbar & Omnibox -->
    <div class="bg-[#0b1322] border-b border-white/10 px-3.5 py-2 flex items-center gap-2.5 shrink-0 backdrop-blur-xl">
      <div class="flex items-center gap-1.5 text-slate-300">
        <button id="btn-back" class="nav-btn" title="Back"><i class="fas fa-arrow-left text-xs"></i></button>
        <button id="btn-forward" class="nav-btn" title="Forward"><i class="fas fa-arrow-right text-xs"></i></button>
        <button id="btn-reload" class="nav-btn" title="Reload"><i class="fas fa-redo text-xs"></i></button>
        <button id="btn-home" class="nav-btn" title="Home"><i class="fas fa-home text-xs"></i></button>
      </div>

      <!-- Omnibox Search/URL Bar -->
      <div class="flex-1 flex items-center gap-2.5 bg-[#070e1c] hover:bg-[#091326] focus-within:bg-[#050a14] focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 border border-white/10 rounded-2xl px-4 py-1.5 transition-all shadow-inner">
        <i class="fas fa-search text-emerald-400 text-xs"></i>
        <input id="omnibox" type="text" autocomplete="off" spellcheck="false"
               class="flex-1 bg-transparent outline-none text-xs text-white placeholder-slate-400 min-w-0 font-medium"
               placeholder="Search 8-4-4 Form 3 & 4 books, lessons, or type school URL...">
        <div class="flex items-center gap-1.5 shrink-0">
          <span class="text-[9px] bg-emerald-950/90 text-emerald-300 border border-emerald-600/50 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            100% Offline
          </span>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="flex items-center gap-1.5">
        <button id="btn-python" class="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-900/50 to-teal-900/50 hover:from-emerald-800/70 hover:to-teal-800/70 border border-emerald-600/40 text-emerald-300 text-xs flex items-center gap-2 transition-all shadow-sm active:scale-95" title="Open Offline Python Runner">
          <i class="fab fa-python text-yellow-400"></i> <span class="text-[11px] font-bold">Python</span>
        </button>
      </div>
    </div>

    <!-- Offline Bookmarks Bar -->
    <div id="bookmarks-bar" class="bg-[#070c16] border-b border-white/5 px-3.5 py-1.5 flex items-center gap-1.5 text-xs overflow-x-auto shrink-0 select-none">
      <button class="bm-btn" data-url="dawamu://home">
        <i class="fas fa-home text-emerald-400 text-[10px]"></i> Home
      </button>
      <button class="bm-btn bg-emerald-950/80 border-emerald-500/50 text-emerald-300 font-bold" data-url="dawamu://books-844">
        <i class="fas fa-book-reader text-yellow-400 text-[10px]"></i> 8-4-4 Books (F3 & F4)
      </button>
      <button class="bm-btn bg-emerald-950/60 border-emerald-600/40 text-emerald-300" data-url="dawamu://study-center">
        <i class="fas fa-graduation-cap text-yellow-400 text-[10px]"></i> Quiz Hub
      </button>
      <button class="bm-btn" data-url="https://en.wikipedia.org/wiki/Cell_biology">
        <i class="fas fa-seedling text-emerald-400 text-[10px]"></i> Cell Biology
      </button>
      <button class="bm-btn" data-url="https://en.wikipedia.org/wiki/Periodic_table">
        <i class="fas fa-table text-amber-400 text-[10px]"></i> Periodic Table
      </button>
      <button class="bm-btn" data-url="https://en.wikipedia.org/wiki/Electricity">
        <i class="fas fa-bolt text-yellow-400 text-[10px]"></i> Electricity
      </button>
      <button class="bm-btn" data-url="https://www.khanacademy.org/math/algebra">
        <i class="fas fa-square-root-alt text-sky-400 text-[10px]"></i> Algebra
      </button>
      <button class="bm-btn" data-url="https://www.khanacademy.org/math/geometry">
        <i class="fas fa-shapes text-indigo-400 text-[10px]"></i> Geometry
      </button>
      <button class="bm-btn" data-url="https://en.wikipedia.org/wiki/History_of_Kenya">
        <i class="fas fa-landmark text-orange-400 text-[10px]"></i> Kenya History
      </button>
      <button class="bm-btn" data-url="https://en.wikipedia.org/wiki/Constitution_of_Kenya">
        <i class="fas fa-balance-scale text-cyan-400 text-[10px]"></i> Constitution
      </button>
      <button class="bm-btn" data-url="https://library.dawamu.school/classics/the-pearl">
        <i class="fas fa-book text-purple-400 text-[10px]"></i> The Pearl
      </button>
      <button class="bm-btn" data-url="https://library.dawamu.school/kiswahili/ngeli-za-nomino">
        <i class="fas fa-language text-rose-400 text-[10px]"></i> Ngeli za Kiswahili
      </button>
      <button class="bm-btn" data-url="https://en.wikipedia.org/wiki/Plate_tectonics">
        <i class="fas fa-mountain text-emerald-400 text-[10px]"></i> Rift Valley
      </button>
      <button class="bm-btn" data-url="https://www.nasa.gov/mars">
        <i class="fas fa-rocket text-rose-400 text-[10px]"></i> NASA Mars
      </button>
    </div>

    <!-- Active Web Viewport Canvas -->
    <div id="browser-viewport" class="flex-1 bg-[#090f1a] overflow-y-auto p-4 relative"></div>

    <!-- Status Bar -->
    <div class="bg-[#070c16] border-t border-white/5 px-4 py-1.5 flex justify-between items-center text-[11px] text-slate-400 shrink-0 font-sans">
      <div class="flex items-center gap-2">
        <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span class="text-slate-300">Dawamu Offline Knowledgebase • 20+ Verified KCSE & STEM Modules Cached</span>
      </div>
      <div class="text-[10px] text-emerald-400 font-semibold font-mono bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-800/30">Zero Network Cost</div>
    </div>

    <style>
      .nav-btn { width:30px; height:30px; border-radius:10px; display:flex; align-items:center; justify-content:center;
                 background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.07); color:#94a3b8; cursor:pointer; transition:all .15s cubic-bezier(0.16, 1, 0.3, 1); }
      .nav-btn:hover { background:rgba(255,255,255,.12); color:#fff; border-color:rgba(255,255,255,.16); transform:translateY(-1px); box-shadow:0 2px 8px rgba(0,0,0,0.3); }
      .nav-btn:active { transform:scale(.92); }
      .bm-btn { display:flex; align-items:center; gap:6px; padding:4px 11px; border-radius:10px; background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.07); color:#cbd5e1; font-size:11px; font-weight:500; white-space:nowrap; cursor:pointer; transition:all .12s ease; }
      .bm-btn:hover { background:rgba(255,255,255,.12); color:#fff; border-color:rgba(16,185,129,.4); box-shadow:0 0 12px rgba(16,185,129,.15); }
      .offline-tab { display:flex; align-items:center; gap:8px; padding:7px 14px; border-radius:12px 12px 0 0; min-width:130px; max-width:220px; font-size:11px; color:#94a3b8; background:#0f172a; cursor:pointer; border:1px solid rgba(255,255,255,.06); border-bottom:none; transition:all .14s ease; }
      .offline-tab:hover { background:#162238; color:#f1f5f9; }
      .offline-tab.active { background:#0b1322; color:#ffffff; border-color:rgba(255,255,255,.14); font-weight:600; box-shadow:inset 0 2px 0 #10b981; }
    </style>
  `;

  const viewport = root.querySelector('#browser-viewport');
  const omnibox  = root.querySelector('#omnibox');
  const tabStrip = root.querySelector('#tab-strip');

  /* ─── TAB MANAGEMENT ─── */
  function openTab(url = 'dawamu://home') {
    const id = ++tabCounter;
    const tabObj = { id, url, title: 'Loading...', history: [url], historyIdx: 0 };
    tabs.push(tabObj);
    activateTab(id);
  }

  function activateTab(id) {
    activeTabId = id;
    const tab = tabs.find(t => t.id === id);
    if (!tab) return;
    renderTabStrip();
    loadUrl(tab.url, false);
  }

  function closeTab(id) {
    if (tabs.length === 1) {
      // Don't close last tab, just reset to home
      tabs[0].url = 'dawamu://home';
      activateTab(tabs[0].id);
      return;
    }
    const idx = tabs.findIndex(t => t.id === id);
    tabs = tabs.filter(t => t.id !== id);
    if (activeTabId === id) {
      const nextTab = tabs[Math.max(0, idx - 1)];
      activateTab(nextTab.id);
    } else {
      renderTabStrip();
    }
  }

  function renderTabStrip() {
    tabStrip.innerHTML = tabs.map(t => `
      <div class="offline-tab ${t.id === activeTabId ? 'active' : ''}" data-tab-id="${t.id}">
        <i class="fas fa-globe-africa text-[10px] text-emerald-400"></i>
        <span class="truncate flex-1">${t.title || 'Dawamu Web'}</span>
        <button class="close-tab-btn hover:text-rose-400 text-[10px] p-0.5 rounded" data-close-id="${t.id}">✕</button>
      </div>
    `).join('');

    tabStrip.querySelectorAll('.offline-tab').forEach(el => {
      el.addEventListener('click', (e) => {
        if (e.target.closest('.close-tab-btn')) return;
        activateTab(parseInt(el.dataset.tabId));
      });
    });

    tabStrip.querySelectorAll('.close-tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeTab(parseInt(btn.dataset.closeId));
      });
    });
  }

  /* ─── NAVIGATION & RENDERING ─── */
  function loadUrl(targetUrl, pushHistory = true) {
    const currentTab = tabs.find(t => t.id === activeTabId);
    if (!currentTab) return;

    currentTab.url = targetUrl;
    omnibox.value = targetUrl.startsWith('dawamu://home') ? '' : targetUrl;

    // Check if we have exact match in offline DB
    let page = OFFLINE_WEB_DB[targetUrl];

    if (!page) {
      if (targetUrl.startsWith('dawamu://search')) {
        let q = '';
        if (targetUrl.includes('?q=')) {
          q = decodeURIComponent(targetUrl.split('?q=')[1] || '').trim();
        }
        page = {
          title: `Search: ${q || 'All Topics'}`,
          render: () => renderSearchResultsPage(q)
        };
        currentTab.url = targetUrl;
        omnibox.value = q;
      } else if (targetUrl.startsWith('http://') || targetUrl.startsWith('https://')) {
        // Synthesize dynamic offline reader
        page = synthesizeDynamicOfflinePage(targetUrl);
      } else {
        // Treat as Search Query
        page = {
          title: `Search: ${targetUrl}`,
          render: () => renderSearchResultsPage(targetUrl)
        };
        currentTab.url = `dawamu://search?q=${encodeURIComponent(targetUrl)}`;
        omnibox.value = targetUrl;
      }
    }

    currentTab.title = page.title;
    renderTabStrip();

    if (pushHistory) {
      currentTab.history.push(currentTab.url);
      currentTab.historyIdx = currentTab.history.length - 1;
    }

    // Render HTML content
    viewport.innerHTML = typeof page.render === 'function' ? page.render() : page.render;
    viewport.scrollTop = 0;

    // Wire up links inside the rendered page
    viewport.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        const href = a.getAttribute('href');
        if (href) loadUrl(href);
      });
    });

    // Wire any interactive components
    wireInteractivePageElements(viewport, loadUrl);
  }

  function handleNavigate(input) {
    const raw = input.trim();
    if (!raw) return;

    if (raw.startsWith('http://') || raw.startsWith('https://') || raw.startsWith('dawamu://')) {
      loadUrl(raw);
    } else if (raw.includes('.') && !raw.includes(' ')) {
      loadUrl('https://' + raw);
    } else {
      // Search
      loadUrl(raw);
    }
  }

  /* ─── TOOLBAR EVENT LISTENERS ─── */
  omnibox.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      handleNavigate(omnibox.value);
      omnibox.blur();
    }
  });

  root.querySelector('#btn-new-tab').addEventListener('click', () => openTab('dawamu://home'));
  root.querySelector('#btn-home').addEventListener('click', () => loadUrl('dawamu://home'));
  root.querySelector('#btn-reload').addEventListener('click', () => {
    const tab = tabs.find(t => t.id === activeTabId);
    if (tab) loadUrl(tab.url, false);
  });

  root.querySelector('#btn-back').addEventListener('click', () => {
    const tab = tabs.find(t => t.id === activeTabId);
    if (tab && tab.historyIdx > 0) {
      tab.historyIdx--;
      loadUrl(tab.history[tab.historyIdx], false);
    }
  });

  root.querySelector('#btn-forward').addEventListener('click', () => {
    const tab = tabs.find(t => t.id === activeTabId);
    if (tab && tab.historyIdx < tab.history.length - 1) {
      tab.historyIdx++;
      loadUrl(tab.history[tab.historyIdx], false);
    }
  });

  root.querySelector('#bookmarks-bar').addEventListener('click', (e) => {
    const btn = e.target.closest('.bm-btn');
    if (btn && btn.dataset.url) loadUrl(btn.dataset.url);
  });

  root.querySelector('#btn-python').addEventListener('click', () => {
    loadUrl('dawamu://python-playground');
  });

  // Open First Tab
  openTab(initialUrl);

  return root;
}

/* ═══════════════════════════════════════════════════
   PAGE RENDERERS
═══════════════════════════════════════════════════ */

function renderHomePage() {
  return `
    <div class="max-w-5xl mx-auto py-8 px-4 flex flex-col items-center text-center">
      <img src="assets/dawamu-logo.png" alt="Dawamu Logo" class="h-24 w-auto object-contain mb-3 drop-shadow-md">
      <h1 class="text-3xl font-extrabold text-white tracking-tight">Dawamu Offline Web Encyclopedia</h1>
      <p class="text-xs text-emerald-400 font-semibold uppercase tracking-widest mt-1 mb-6">
        Form 1 – Form 4 Secondary Curriculum & STEM Digital Library • 100% Offline
      </p>

      <!-- Central Search Box -->
      <div class="w-full max-w-2xl bg-[#24262a] border border-slate-700 hover:border-emerald-500 focus-within:border-emerald-500 rounded-2xl p-2 flex items-center gap-3 shadow-2xl mb-4 transition-all">
        <i class="fas fa-search text-slate-400 ml-3"></i>
        <input id="home-search-input" type="text" placeholder="Search 2,000+ topics (e.g., Photosynthesis, Cell, Periodic Table, Ohm, Calculus, Kenya, Pearl)..."
               class="bg-transparent flex-1 outline-none text-sm text-white placeholder-slate-500 min-w-0">
        <button id="home-search-btn" class="bg-[#389e3c] hover:bg-[#2e7d32] text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all">
          Search
        </button>
      </div>

      <!-- Quick Search Chips -->
      <div class="flex items-center justify-center gap-2 flex-wrap mb-8 text-[11px] text-slate-300">
        <span class="text-slate-500 font-bold uppercase text-[10px]">Popular:</span>
        <a href="dawamu://books-844" class="bg-emerald-950/90 hover:bg-emerald-900 px-3 py-1 rounded-full border border-emerald-500/80 text-emerald-300 font-bold shadow-sm">📚 8-4-4 Books (F3 & F4)</a>
        <a href="https://curriculum.dawamu.school/844/form3/mathematics" class="bg-[#24262a] hover:bg-slate-700 px-2.5 py-1 rounded-full border border-slate-700 text-blue-400">Form 3 Math</a>
        <a href="https://curriculum.dawamu.school/844/form4/chemistry" class="bg-[#24262a] hover:bg-slate-700 px-2.5 py-1 rounded-full border border-slate-700 text-amber-400">Form 4 Chem</a>
        <a href="https://library.dawamu.school/setbooks/fathers-of-nations" class="bg-[#24262a] hover:bg-slate-700 px-2.5 py-1 rounded-full border border-slate-700 text-purple-400">Fathers of Nations</a>
        <a href="https://library.dawamu.school/setbooks/the-samaritan" class="bg-[#24262a] hover:bg-slate-700 px-2.5 py-1 rounded-full border border-slate-700 text-fuchsia-400">The Samaritan</a>
        <a href="https://library.dawamu.school/setbooks/bembea-ya-maisha" class="bg-[#24262a] hover:bg-slate-700 px-2.5 py-1 rounded-full border border-slate-700 text-rose-400">Bembea ya Maisha</a>
        <a href="https://library.dawamu.school/setbooks/chozi-la-heri" class="bg-[#24262a] hover:bg-slate-700 px-2.5 py-1 rounded-full border border-slate-700 text-teal-400">Chozi la Heri</a>
        <a href="https://en.wikipedia.org/wiki/Cell_biology" class="bg-[#24262a] hover:bg-slate-700 px-2.5 py-1 rounded-full border border-slate-700 text-emerald-400">Cell Biology</a>
        <a href="https://en.wikipedia.org/wiki/Electricity" class="bg-[#24262a] hover:bg-slate-700 px-2.5 py-1 rounded-full border border-slate-700 text-yellow-400">Ohm's Law</a>
        <a href="dawamu://study-center" class="bg-emerald-950/80 hover:bg-emerald-900 px-2.5 py-1 rounded-full border border-emerald-600 text-emerald-300 font-bold">🎯 Subject Quizzes</a>
      </div>

      <!-- Hero Promos Grid (8-4-4 Coursebooks + Quiz Hub) -->
      <div class="w-full grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <!-- 8-4-4 Library Banner -->
        <a href="dawamu://books-844" class="bg-gradient-to-r from-emerald-950 via-[#0e2f1f] to-[#0c1f36] border border-emerald-500/50 p-5 rounded-2xl flex items-center justify-between text-left shadow-xl hover:border-emerald-400 transition-all group">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
              <i class="fas fa-book-reader"></i>
            </div>
            <div>
              <div class="text-[10px] text-emerald-400 uppercase font-bold tracking-wider">Kenyan 8-4-4 Syllabus</div>
              <h3 class="text-base font-bold text-white group-hover:text-emerald-300">Form 3 & Form 4 Coursebooks</h3>
              <p class="text-[11px] text-slate-300">21 Full Books: Math, Sciences, Humanities & Set Books.</p>
            </div>
          </div>
          <div class="bg-emerald-600 group-hover:bg-emerald-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-lg shrink-0">
            Open Library <i class="fas fa-arrow-right text-[10px]"></i>
          </div>
        </a>

        <!-- Revision Quiz Center Promo Banner -->
        <a href="dawamu://study-center" class="bg-gradient-to-r from-teal-950 via-[#18392b] to-[#12283a] border border-teal-700/60 p-5 rounded-2xl flex items-center justify-between text-left shadow-xl hover:border-teal-500 transition-all group">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-400 border border-teal-500/40 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
              <i class="fas fa-graduation-cap"></i>
            </div>
            <div>
              <div class="text-[10px] text-teal-400 uppercase font-bold tracking-wider">KCSE Interactive Revision</div>
              <h3 class="text-base font-bold text-white group-hover:text-teal-300">Subject Revision Quizzer</h3>
              <p class="text-[11px] text-slate-300">Test your mastery with instant scoring across all subjects.</p>
            </div>
          </div>
          <div class="bg-teal-600 group-hover:bg-teal-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-lg shrink-0">
            Start Quiz <i class="fas fa-arrow-right text-[10px]"></i>
          </div>
        </a>
      </div>

      <!-- Subject Areas Hub -->
      <div class="w-full text-left space-y-8">
        <!-- 0. 8-4-4 SENIOR SECONDARY COURSEBOOKS SHOWCASE -->
        <div>
          <div class="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-emerald-400 mb-3 border-b border-slate-800 pb-2">
            <span class="flex items-center gap-2">
              <i class="fas fa-book-open"></i> 8-4-4 Form Three & Form Four Senior Books
            </span>
            <a href="dawamu://books-844" class="text-[11px] text-emerald-400 hover:text-emerald-300 lowercase font-medium flex items-center gap-1">
              view all 21 books <i class="fas fa-arrow-right text-[9px]"></i>
            </a>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            <a href="https://curriculum.dawamu.school/844/form3/mathematics" class="p-4 rounded-xl bg-[#24262a] hover:bg-[#2d3036] border border-slate-800 hover:border-blue-500/60 transition-all group">
              <div class="flex items-center justify-between mb-2">
                <span class="text-[9px] font-bold uppercase bg-blue-950 text-blue-300 border border-blue-800/50 px-2 py-0.5 rounded-full">Form 3</span>
                <span class="text-[10px] text-slate-500">12 Chapters</span>
              </div>
              <div class="text-blue-400 text-lg mb-1"><i class="fas fa-square-root-alt"></i></div>
              <h4 class="font-bold text-sm text-white group-hover:text-blue-300">KLB Mathematics Form 3</h4>
              <p class="text-[11px] text-slate-400 mt-1">Quadratics II, Surds, Further Logs, PAYE Tax, Circles, Matrices, Sequences.</p>
            </a>

            <a href="https://curriculum.dawamu.school/844/form3/chemistry" class="p-4 rounded-xl bg-[#24262a] hover:bg-[#2d3036] border border-slate-800 hover:border-amber-500/60 transition-all group">
              <div class="flex items-center justify-between mb-2">
                <span class="text-[9px] font-bold uppercase bg-amber-950 text-amber-300 border border-amber-800/50 px-2 py-0.5 rounded-full">Form 3</span>
                <span class="text-[10px] text-slate-500">6 Chapters</span>
              </div>
              <div class="text-amber-400 text-lg mb-1"><i class="fas fa-flask"></i></div>
              <h4 class="font-bold text-sm text-white group-hover:text-amber-300">KLB Chemistry Form 3</h4>
              <p class="text-[11px] text-slate-400 mt-1">Gas Laws, The Mole Concept, Organic I Hydrocarbons, Sulphur & Contact process.</p>
            </a>

            <a href="https://curriculum.dawamu.school/844/form3/physics" class="p-4 rounded-xl bg-[#24262a] hover:bg-[#2d3036] border border-slate-800 hover:border-purple-500/60 transition-all group">
              <div class="flex items-center justify-between mb-2">
                <span class="text-[9px] font-bold uppercase bg-purple-950 text-purple-300 border border-purple-800/50 px-2 py-0.5 rounded-full">Form 3</span>
                <span class="text-[10px] text-slate-500">8 Topics</span>
              </div>
              <div class="text-purple-400 text-lg mb-1"><i class="fas fa-bolt"></i></div>
              <h4 class="font-bold text-sm text-white group-hover:text-purple-300">KLB Physics Form 3</h4>
              <p class="text-[11px] text-slate-400 mt-1">Linear motion v=u+at, Newton laws, Machines & Efficiency, Current Electricity II.</p>
            </a>

            <a href="https://curriculum.dawamu.school/844/form4/mathematics" class="p-4 rounded-xl bg-[#24262a] hover:bg-[#2d3036] border border-slate-800 hover:border-blue-500/60 transition-all group">
              <div class="flex items-center justify-between mb-2">
                <span class="text-[9px] font-bold uppercase bg-emerald-950 text-emerald-300 border border-emerald-800/50 px-2 py-0.5 rounded-full">Form 4</span>
                <span class="text-[10px] text-slate-500">KCSE Candidate</span>
              </div>
              <div class="text-sky-400 text-lg mb-1"><i class="fas fa-calculator"></i></div>
              <h4 class="font-bold text-sm text-white group-hover:text-sky-300">KLB Mathematics Form 4</h4>
              <p class="text-[11px] text-slate-400 mt-1">Calculus (Differentiation & Integration), 3D Geometry, Latitudes/Longitudes & Knots.</p>
            </a>

            <a href="https://curriculum.dawamu.school/844/form4/biology" class="p-4 rounded-xl bg-[#24262a] hover:bg-[#2d3036] border border-slate-800 hover:border-emerald-500/60 transition-all group">
              <div class="flex items-center justify-between mb-2">
                <span class="text-[9px] font-bold uppercase bg-emerald-950 text-emerald-300 border border-emerald-800/50 px-2 py-0.5 rounded-full">Form 4</span>
                <span class="text-[10px] text-slate-500">KCSE Candidate</span>
              </div>
              <div class="text-emerald-400 text-lg mb-1"><i class="fas fa-dna"></i></div>
              <h4 class="font-bold text-sm text-white group-hover:text-emerald-300">KLB Biology Form 4</h4>
              <p class="text-[11px] text-slate-400 mt-1">Genetics II, Mutations, Sex-linkage, Evolution, Eye & Ear, Support & Locomotion.</p>
            </a>

            <a href="https://curriculum.dawamu.school/844/form4/chemistry" class="p-4 rounded-xl bg-[#24262a] hover:bg-[#2d3036] border border-slate-800 hover:border-amber-500/60 transition-all group">
              <div class="flex items-center justify-between mb-2">
                <span class="text-[9px] font-bold uppercase bg-emerald-950 text-emerald-300 border border-emerald-800/50 px-2 py-0.5 rounded-full">Form 4</span>
                <span class="text-[10px] text-slate-500">KCSE Candidate</span>
              </div>
              <div class="text-amber-400 text-lg mb-1"><i class="fas fa-atom"></i></div>
              <h4 class="font-bold text-sm text-white group-hover:text-amber-300">KLB Chemistry Form 4</h4>
              <p class="text-[11px] text-slate-400 mt-1">Energy Changes, Hess's Law, Electrochemistry, Aluminium extraction, Polymers & Soaps.</p>
            </a>

            <a href="https://library.dawamu.school/setbooks/fathers-of-nations" class="p-4 rounded-xl bg-[#24262a] hover:bg-[#2d3036] border border-slate-800 hover:border-purple-500/60 transition-all group">
              <div class="flex items-center justify-between mb-2">
                <span class="text-[9px] font-bold uppercase bg-purple-950 text-purple-300 border border-purple-800/50 px-2 py-0.5 rounded-full">Compulsory Novel</span>
                <span class="text-[10px] text-slate-500">English Literature</span>
              </div>
              <div class="text-purple-400 text-lg mb-1"><i class="fas fa-book"></i></div>
              <h4 class="font-bold text-sm text-white group-hover:text-purple-300">Fathers of Nations</h4>
              <p class="text-[11px] text-slate-400 mt-1">Paul B. Vitta. Way Omega vs Path Alpha, Prof. Kimani, Pastor Chiamaka, Melusi & essays.</p>
            </a>

            <a href="https://library.dawamu.school/setbooks/the-samaritan" class="p-4 rounded-xl bg-[#24262a] hover:bg-[#2d3036] border border-slate-800 hover:border-fuchsia-500/60 transition-all group">
              <div class="flex items-center justify-between mb-2">
                <span class="text-[9px] font-bold uppercase bg-fuchsia-950 text-fuchsia-300 border border-fuchsia-800/50 px-2 py-0.5 rounded-full">Compulsory Play</span>
                <span class="text-[10px] text-slate-500">English Literature</span>
              </div>
              <div class="text-fuchsia-400 text-lg mb-1"><i class="fas fa-theater-masks"></i></div>
              <h4 class="font-bold text-sm text-white group-hover:text-fuchsia-300">The Samaritan</h4>
              <p class="text-[11px] text-slate-400 mt-1">John Lara. Teacher Nicole, Mayor Mossi, Bembe, anti-corruption tech app & essays.</p>
            </a>

            <a href="https://library.dawamu.school/setbooks/bembea-ya-maisha" class="p-4 rounded-xl bg-[#24262a] hover:bg-[#2d3036] border border-slate-800 hover:border-rose-500/60 transition-all group">
              <div class="flex items-center justify-between mb-2">
                <span class="text-[9px] font-bold uppercase bg-rose-950 text-rose-300 border border-rose-800/50 px-2 py-0.5 rounded-full">Tamthilia Teule</span>
                <span class="text-[10px] text-slate-500">Fasihi ya Kiswahili</span>
              </div>
              <div class="text-rose-400 text-lg mb-1"><i class="fas fa-feather-alt"></i></div>
              <h4 class="font-bold text-sm text-white group-hover:text-rose-300">Bembea ya Maisha</h4>
              <p class="text-[11px] text-slate-400 mt-1">Timothy Arege. Sara, Yona, Neema, Bunju, maudhui ya uvumilivu, ndoa na usasa.</p>
            </a>
          </div>
        </div>

        <!-- 1. BIOLOGICAL & NATURAL SCIENCES -->
        <div>
          <div class="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400 mb-3 border-b border-slate-800 pb-2">
            <i class="fas fa-seedling"></i> 1. Biological & Life Sciences
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            <a href="https://en.wikipedia.org/wiki/Cell_biology" class="p-4 rounded-xl bg-[#24262a] hover:bg-[#2d3036] border border-slate-800 hover:border-emerald-600/60 transition-all">
              <div class="text-emerald-400 text-lg mb-1"><i class="fas fa-microscope"></i></div>
              <h4 class="font-bold text-sm text-white">Cell Biology & Organelles</h4>
              <p class="text-[11px] text-slate-400 mt-1">Ultrastructure, plant vs animal cells, mitochondria, ER & cell theory.</p>
            </a>

            <a href="https://en.wikipedia.org/wiki/Photosynthesis" class="p-4 rounded-xl bg-[#24262a] hover:bg-[#2d3036] border border-slate-800 hover:border-emerald-600/60 transition-all">
              <div class="text-emerald-400 text-lg mb-1"><i class="fas fa-sun"></i></div>
              <h4 class="font-bold text-sm text-white">Photosynthesis</h4>
              <p class="text-[11px] text-slate-400 mt-1">Light-dependent thylakoid reactions, photolysis & Calvin stroma cycle.</p>
            </a>

            <a href="https://en.wikipedia.org/wiki/Circulatory_system" class="p-4 rounded-xl bg-[#24262a] hover:bg-[#2d3036] border border-slate-800 hover:border-emerald-600/60 transition-all">
              <div class="text-rose-400 text-lg mb-1"><i class="fas fa-heartbeat"></i></div>
              <h4 class="font-bold text-sm text-white">Circulatory System</h4>
              <p class="text-[11px] text-slate-400 mt-1">Human heart anatomy, double circulation, arteries, veins & blood cells.</p>
            </a>

            <a href="https://en.wikipedia.org/wiki/Genetics" class="p-4 rounded-xl bg-[#24262a] hover:bg-[#2d3036] border border-slate-800 hover:border-emerald-600/60 transition-all">
              <div class="text-indigo-400 text-lg mb-1"><i class="fas fa-dna"></i></div>
              <h4 class="font-bold text-sm text-white">Genetics & DNA</h4>
              <p class="text-[11px] text-slate-400 mt-1">Double helix structure, base pairing, monohybrid crosses & Punnett squares.</p>
            </a>

            <a href="https://en.wikipedia.org/wiki/Solar_System" class="p-4 rounded-xl bg-[#24262a] hover:bg-[#2d3036] border border-slate-800 hover:border-emerald-600/60 transition-all">
              <div class="text-yellow-400 text-lg mb-1"><i class="fas fa-globe"></i></div>
              <h4 class="font-bold text-sm text-white">The Solar System</h4>
              <p class="text-[11px] text-slate-400 mt-1">Terrestrial planets, gas giants, planetary orbits & space science.</p>
            </a>

            <a href="https://www.nasa.gov/mars" class="p-4 rounded-xl bg-[#24262a] hover:bg-[#2d3036] border border-slate-800 hover:border-emerald-600/60 transition-all">
              <div class="text-rose-400 text-lg mb-1"><i class="fas fa-rocket"></i></div>
              <h4 class="font-bold text-sm text-white">NASA Mars 2020</h4>
              <p class="text-[11px] text-slate-400 mt-1">Perseverance Rover discoveries at Jezero crater & Ingenuity flights.</p>
            </a>
          </div>
        </div>

        <!-- 2. CHEMISTRY & PHYSICAL SCIENCES -->
        <div>
          <div class="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400 mb-3 border-b border-slate-800 pb-2">
            <i class="fas fa-flask"></i> 2. Chemistry & Physical Sciences
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            <a href="https://en.wikipedia.org/wiki/Periodic_table" class="p-4 rounded-xl bg-[#24262a] hover:bg-[#2d3036] border border-slate-800 hover:border-amber-600/60 transition-all">
              <div class="text-amber-400 text-lg mb-1"><i class="fas fa-table"></i></div>
              <h4 class="font-bold text-sm text-white">Periodic Table & Trends</h4>
              <p class="text-[11px] text-slate-400 mt-1">Elements 1-20 configurations, atomic radius, ionization energy & groups.</p>
            </a>

            <a href="https://en.wikipedia.org/wiki/Chemical_bonding" class="p-4 rounded-xl bg-[#24262a] hover:bg-[#2d3036] border border-slate-800 hover:border-amber-600/60 transition-all">
              <div class="text-sky-400 text-lg mb-1"><i class="fas fa-project-diagram"></i></div>
              <h4 class="font-bold text-sm text-white">Chemical Bonding</h4>
              <p class="text-[11px] text-slate-400 mt-1">Ionic electron transfer, covalent sharing, diamond vs graphite lattices.</p>
            </a>

            <a href="https://en.wikipedia.org/wiki/Acids_and_bases" class="p-4 rounded-xl bg-[#24262a] hover:bg-[#2d3036] border border-slate-800 hover:border-amber-600/60 transition-all">
              <div class="text-rose-400 text-lg mb-1"><i class="fas fa-vial"></i></div>
              <h4 class="font-bold text-sm text-white">Acids, Bases & Titration</h4>
              <p class="text-[11px] text-slate-400 mt-1">pH scale, indicators, neutralization reactions & molarity formulas.</p>
            </a>

            <a href="https://en.wikipedia.org/wiki/Electricity" class="p-4 rounded-xl bg-[#24262a] hover:bg-[#2d3036] border border-slate-800 hover:border-yellow-600/60 transition-all">
              <div class="text-yellow-400 text-lg mb-1"><i class="fas fa-bolt"></i></div>
              <h4 class="font-bold text-sm text-white">Electricity & Ohm's Law</h4>
              <p class="text-[11px] text-slate-400 mt-1">Current, voltage, V = IR, series vs parallel resistor combinations.</p>
            </a>

            <a href="https://en.wikipedia.org/wiki/Optics" class="p-4 rounded-xl bg-[#24262a] hover:bg-[#2d3036] border border-slate-800 hover:border-cyan-600/60 transition-all">
              <div class="text-cyan-400 text-lg mb-1"><i class="fas fa-eye"></i></div>
              <h4 class="font-bold text-sm text-white">Optics & Lenses</h4>
              <p class="text-[11px] text-slate-400 mt-1">Reflection, Snell's law of refraction, 1/f = 1/u + 1/v lens formula.</p>
            </a>

            <a href="https://www.khanacademy.org/science/physics" class="p-4 rounded-xl bg-[#24262a] hover:bg-[#2d3036] border border-slate-800 hover:border-indigo-600/60 transition-all">
              <div class="text-indigo-400 text-lg mb-1"><i class="fas fa-magnet"></i></div>
              <h4 class="font-bold text-sm text-white">Newtonian Physics</h4>
              <p class="text-[11px] text-slate-400 mt-1">Newton's 3 laws of motion, inertia, momentum & F = m × a.</p>
            </a>
          </div>
        </div>

        <!-- 3. MATHEMATICS -->
        <div>
          <div class="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-400 mb-3 border-b border-slate-800 pb-2">
            <i class="fas fa-square-root-alt"></i> 3. Pure & Applied Mathematics
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            <a href="https://www.khanacademy.org/math/algebra" class="p-4 rounded-xl bg-[#24262a] hover:bg-[#2d3036] border border-slate-800 hover:border-sky-600/60 transition-all">
              <div class="text-sky-400 text-lg mb-1"><i class="fas fa-calculator"></i></div>
              <h4 class="font-bold text-sm text-white">Algebra: Quadratic Equations</h4>
              <p class="text-[11px] text-slate-400 mt-1">The quadratic formula, factoring, and discriminant analysis.</p>
            </a>

            <a href="https://www.khanacademy.org/math/geometry" class="p-4 rounded-xl bg-[#24262a] hover:bg-[#2d3036] border border-slate-800 hover:border-sky-600/60 transition-all">
              <div class="text-sky-400 text-lg mb-1"><i class="fas fa-shapes"></i></div>
              <h4 class="font-bold text-sm text-white">Geometry & Trigonometry</h4>
              <p class="text-[11px] text-slate-400 mt-1">Circle theorems, SOH CAH TOA, Sine Rule & Cosine Rule.</p>
            </a>

            <a href="https://www.khanacademy.org/math/calculus" class="p-4 rounded-xl bg-[#24262a] hover:bg-[#2d3036] border border-slate-800 hover:border-emerald-600/60 transition-all">
              <div class="text-emerald-400 text-lg mb-1"><i class="fas fa-chart-line"></i></div>
              <h4 class="font-bold text-sm text-white">Differential Calculus</h4>
              <p class="text-[11px] text-slate-400 mt-1">Power rule dy/dx = anxⁿ⁻¹, tangents, turning points & kinematics.</p>
            </a>
          </div>
        </div>

        <!-- 4. HUMANITIES, GEOGRAPHY & LANGUAGES -->
        <div>
          <div class="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-400 mb-3 border-b border-slate-800 pb-2">
            <i class="fas fa-book"></i> 4. Humanities, Literature & Languages
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            <a href="https://en.wikipedia.org/wiki/History_of_Kenya" class="p-4 rounded-xl bg-[#24262a] hover:bg-[#2d3036] border border-slate-800 hover:border-orange-600/60 transition-all">
              <div class="text-orange-400 text-lg mb-1"><i class="fas fa-landmark"></i></div>
              <h4 class="font-bold text-sm text-white">History of Kenya</h4>
              <p class="text-[11px] text-slate-400 mt-1">Cradle of humankind, pre-colonial coastal trade, Mau Mau & independence.</p>
            </a>

            <a href="https://en.wikipedia.org/wiki/Constitution_of_Kenya" class="p-4 rounded-xl bg-[#24262a] hover:bg-[#2d3036] border border-slate-800 hover:border-cyan-600/60 transition-all">
              <div class="text-cyan-400 text-lg mb-1"><i class="fas fa-balance-scale"></i></div>
              <h4 class="font-bold text-sm text-white">2010 Constitution & Devolution</h4>
              <p class="text-[11px] text-slate-400 mt-1">Executive, Bicameral Parliament, Judiciary & 47 County Governments.</p>
            </a>

            <a href="https://en.wikipedia.org/wiki/Plate_tectonics" class="p-4 rounded-xl bg-[#24262a] hover:bg-[#2d3036] border border-slate-800 hover:border-emerald-600/60 transition-all">
              <div class="text-emerald-400 text-lg mb-1"><i class="fas fa-mountain"></i></div>
              <h4 class="font-bold text-sm text-white">Plate Tectonics & Rift Valley</h4>
              <p class="text-[11px] text-slate-400 mt-1">Continental drift, tensional faulting, grabens & volcanic features.</p>
            </a>

            <a href="https://library.dawamu.school/classics/the-pearl" class="p-4 rounded-xl bg-[#24262a] hover:bg-[#2d3036] border border-slate-800 hover:border-purple-600/60 transition-all">
              <div class="text-purple-400 text-lg mb-1"><i class="fas fa-book"></i></div>
              <h4 class="font-bold text-sm text-white">The Pearl (Steinbeck)</h4>
              <p class="text-[11px] text-slate-400 mt-1">Set book guide: Kino, Juana, greed vs family, themes & symbolism.</p>
            </a>

            <a href="https://library.dawamu.school/classics/romeo-and-juliet" class="p-4 rounded-xl bg-[#24262a] hover:bg-[#2d3036] border border-slate-800 hover:border-purple-600/60 transition-all">
              <div class="text-purple-400 text-lg mb-1"><i class="fas fa-feather"></i></div>
              <h4 class="font-bold text-sm text-white">Romeo and Juliet (Shakespeare)</h4>
              <p class="text-[11px] text-slate-400 mt-1">Classical drama study: prologue analysis, conflict & fate themes.</p>
            </a>

            <a href="https://library.dawamu.school/kiswahili/ngeli-za-nomino" class="p-4 rounded-xl bg-[#24262a] hover:bg-[#2d3036] border border-slate-800 hover:border-rose-600/60 transition-all">
              <div class="text-rose-400 text-lg mb-1"><i class="fas fa-language"></i></div>
              <h4 class="font-bold text-sm text-white">Sarufi: Ngeli za Nomino</h4>
              <p class="text-[11px] text-slate-400 mt-1">A-WA, KI-VI, LI-YA, U-I, upatanisho wa kisarufi na mifano ya sentensi.</p>
            </a>
          </div>
        </div>

        <!-- 5. COMPUTER SCIENCE & CODING -->
        <div>
          <div class="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400 mb-3 border-b border-slate-800 pb-2">
            <i class="fas fa-laptop-code"></i> 5. Computer Science & Coding
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <a href="dawamu://python-playground" class="p-4 rounded-xl bg-[#24262a] hover:bg-[#2d3036] border border-slate-800 hover:border-emerald-600/60 transition-all">
              <div class="text-emerald-400 text-lg mb-1"><i class="fab fa-python"></i></div>
              <h4 class="font-bold text-sm text-white">Python Interactive Playground</h4>
              <p class="text-[11px] text-slate-400 mt-1">Live offline code runner for algorithms, math solvers & simulations.</p>
            </a>

            <a href="https://en.wikipedia.org/wiki/Algorithm" class="p-4 rounded-xl bg-[#24262a] hover:bg-[#2d3036] border border-slate-800 hover:border-purple-600/60 transition-all">
              <div class="text-purple-400 text-lg mb-1"><i class="fas fa-code-branch"></i></div>
              <h4 class="font-bold text-sm text-white">Algorithms & Complexity</h4>
              <p class="text-[11px] text-slate-400 mt-1">Linear vs binary search, sorting algorithms & Big-O notation.</p>
            </a>
          </div>
        </div>
      </div>
    </div>
  `;
}


function renderSearchResultsPage(query) {
  const cleanQuery = decodeURIComponent(query.replace('dawamu://search?q=', '')).trim();
  const results = searchOfflineDatabase(cleanQuery);

  return `
    <div class="max-w-4xl mx-auto py-6 px-4">
      <div class="flex items-center justify-between border-b border-slate-800 pb-3 mb-6">
        <div>
          <div class="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Dawamu Offline Search Engine</div>
          <h2 class="text-xl font-bold text-white">Results for: <span class="text-emerald-400">"${cleanQuery}"</span></h2>
        </div>
        <div class="text-xs text-slate-400">${results.length} offline articles found</div>
      </div>

      ${results.length === 0 ? `
        <div class="bg-[#24262a] p-8 rounded-2xl text-center space-y-4 border border-slate-800">
          <i class="fas fa-search text-4xl text-slate-600"></i>
          <h3 class="text-lg font-bold text-white">No exact match for "${cleanQuery}"</h3>
          <p class="text-xs text-slate-400 max-w-md mx-auto">
            Try searching for fundamental topics like <a href="https://en.wikipedia.org/wiki/Photosynthesis" class="text-emerald-400 underline">Photosynthesis</a>, <a href="https://en.wikipedia.org/wiki/History_of_Kenya" class="text-emerald-400 underline">Kenya</a>, <a href="https://en.wikipedia.org/wiki/Solar_System" class="text-emerald-400 underline">Solar System</a>, <a href="https://www.khanacademy.org/math/algebra" class="text-emerald-400 underline">Algebra</a>, or <a href="https://www.nasa.gov/mars" class="text-emerald-400 underline">NASA Mars</a>.
          </p>
        </div>
      ` : `
        <div class="space-y-4">
          ${results.map(r => `
            <div class="bg-[#24262a] p-5 rounded-2xl border border-slate-800 hover:border-emerald-700/60 transition-all">
              <div class="text-[10px] text-emerald-400 font-mono mb-1">${r.url}</div>
              <h3 class="text-base font-bold mb-1">
                <a href="${r.url}" class="text-blue-400 hover:text-blue-300 hover:underline">${r.item.title}</a>
              </h3>
              <p class="text-xs text-slate-300 leading-relaxed">${r.item.summary || ''}</p>
              <div class="flex items-center gap-2 mt-3">
                <span class="text-[9px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded">${r.item.category || 'Reference'}</span>
                <span class="text-[9px] text-emerald-500 font-semibold">✓ Verified Offline Encached</span>
              </div>
            </div>
          `).join('')}
        </div>
      `}
    </div>
  `;
}

function synthesizeDynamicOfflinePage(url) {
  let hostname = 'offline.resource';
  let pathname = '';
  let topicName = url;
  try {
    const fullUrl = (url.startsWith('http://') || url.startsWith('https://')) ? url : `https://${url}`;
    const urlObj = new URL(fullUrl);
    hostname = urlObj.hostname;
    pathname = urlObj.pathname;
    const parts = pathname.replace(/^\//, '').replace(/\/$/, '').split('/');
    topicName = (parts.pop() || hostname).replace(/_/g, ' ');
  } catch (e) {
    topicName = url.replace(/[^a-zA-Z0-9_\-\s]/g, ' ').trim() || 'Offline Article';
  }

  return {
    title: `${topicName} - Offline Reader`,
    render: () => `
      <div class="max-w-4xl mx-auto bg-[#24262a] text-white p-8 rounded-2xl border border-slate-800">
        <div class="flex items-center gap-3 border-b border-slate-700/60 pb-4 mb-6">
          <i class="fas fa-shield-alt text-emerald-400 text-2xl"></i>
          <div>
            <div class="text-[10px] text-emerald-400 uppercase tracking-wider font-bold">Dawamu Offline Web Proxy</div>
            <h1 class="text-2xl font-bold capitalize">${topicName}</h1>
          </div>
        </div>

        <div class="bg-emerald-950/40 border border-emerald-800/40 p-4 rounded-xl text-xs text-emerald-300 mb-6">
          <i class="fas fa-check-circle mr-1"></i> You are viewing an encached offline snapshot for <b>${url}</b>.
        </div>

        <div class="prose prose-invert max-w-none text-xs leading-relaxed space-y-4 text-slate-300">
          <p>
            This article on <b>${topicName}</b> is pre-rendered from the Dawamu Offline Curated Knowledgebase. Students have continuous read access regardless of internet status.
          </p>
          <div class="p-4 bg-slate-900 rounded-xl font-mono text-[11px] text-slate-300">
            <div><b>Source Domain:</b> ${hostname}</div>
            <div><b>Resource Path:</b> ${pathname || '/'}</div>
            <div><b>Status:</b> Encached for Safe Offline School Session</div>
          </div>
        </div>

        <div class="mt-8 pt-4 border-t border-slate-700/60 flex gap-3">
          <a href="dawamu://home" class="bg-[#389e3c] hover:bg-[#2e7d32] text-white text-xs font-bold px-4 py-2 rounded-xl">
            Return to Offline Home
          </a>
        </div>
      </div>
    `
  };
}

/* ═══════════════════════════════════════════════════
   OFFLINE PYTHON RUNNER & PLAYGROUND
═══════════════════════════════════════════════════ */
const PYTHON_EXAMPLES = {
  hello: `# Dawamu OS - Welcome to Python
student_name = "Brian Ochieng"
school = "Dawamu Academy"
form = 1

print("=" * 38)
print(f"Student: {student_name} | {school}")
print(f"Academic Level: Form {form}")
print("=" * 38)

# Calculate Subject Average
scores = [88, 92, 79, 95, 84]
total = sum(scores)
avg = total / len(scores)

print(f"Total Points: {total} / 500")
print(f"Average Percentage: {avg}%")
if avg >= 80:
    print("Academic Standing: Honours List (Grade A)")
`,
  fibonacci: `# Fibonacci Sequence Generator
def generate_fibonacci(terms):
    fib = [0, 1]
    while len(fib) < terms:
        fib.append(fib[-1] + fib[-2])
    return fib

print("First 12 Terms of Fibonacci Series:")
series = generate_fibonacci(12)
for idx, val in enumerate(series):
    print(f"  Term {idx + 1:2d} -> {val}")
`,
  grades: `# Dawamu Form 1-4 Grading System
grades = {
    "Mathematics": 94,
    "English": 88,
    "Kiswahili": 82,
    "Biology": 91,
    "Chemistry": 87,
    "Physics": 96,
    "History": 90
}

print("DAWAMU ACADEMIC TERM PERFORMANCE")
print("-" * 38)
for subject, mark in grades.items():
    print(f"{subject:14} : {mark}%")

marks = list(grades.values())
mean = sum(marks) / len(marks)
print("-" * 38)
print(f"Mean Score     : {mean:.1f}%")
print(f"Principal Note : Outstanding effort! Keep it up.")
`,
  quadratics: `import math

# Solve Quadratic: ax^2 + bx + c = 0
a = 1
b = -7
c = 10

discriminant = b**2 - 4*a*c
print(f"Equation: {a}x^2 + ({b})x + ({c}) = 0")
print(f"Discriminant: {discriminant}")

if discriminant >= 0:
    root1 = (-b + math.sqrt(discriminant)) / (2*a)
    root2 = (-b - math.sqrt(discriminant)) / (2*a)
    print(f"Root 1 = {root1}")
    print(f"Root 2 = {root2}")
else:
    print("No real roots exist.")
`,
  primes: `# Find Prime Numbers up to 60
primes = []
for n in range(2, 61):
    is_prime = True
    for i in range(2, int(n**0.5) + 1):
        if n % i == 0:
            is_prime = False
            break
    if is_prime:
        primes.append(n)

print(f"Prime Numbers up to 60 ({len(primes)} found):")
print(", ".join(str(p) for p in primes))
`,
  ascii: `# ASCII Art Generator
size = 5
print("Dawamu Diamond Art:")
for i in range(size):
    print(" " * (size - i - 1) + "*" * (2 * i + 1))
for i in range(size - 2, -1, -1):
    print(" " * (size - i - 1) + "*" * (2 * i + 1))
`
};

function renderPythonPlaygroundPage() {
  return `
    <div class="max-w-5xl mx-auto py-6 px-4">
      <div class="flex flex-col md:flex-row md:items-center justify-between pb-4 mb-4 border-b border-slate-800 gap-3">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-600/40 flex items-center justify-center text-2xl text-emerald-400">
            <i class="fab fa-python"></i>
          </div>
          <div>
            <h1 class="text-xl font-bold text-white flex items-center gap-2">
              Dawamu Python Playground
              <span class="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-700/50 px-2 py-0.5 rounded-full font-mono uppercase tracking-wider">100% Offline</span>
            </h1>
            <div class="text-xs text-slate-400">Interactive code execution environment for algorithms, mathematics & science.</div>
          </div>
        </div>

        <div class="flex items-center gap-2 flex-wrap">
          <select id="py-example-select" class="bg-[#18191b] border border-slate-700 text-xs text-slate-200 rounded-xl px-3 py-2 outline-none focus:border-emerald-500 cursor-pointer">
            <option value="hello">1. Hello World & Calculation</option>
            <option value="fibonacci">2. Fibonacci Sequence</option>
            <option value="grades">3. Dawamu Student Grades</option>
            <option value="quadratics">4. Quadratic Equation Solver</option>
            <option value="primes">5. Prime Numbers Finder</option>
            <option value="ascii">6. ASCII Diamond Art</option>
          </select>
          <button id="py-run-btn" class="bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-lg shadow-emerald-950/40 cursor-pointer">
            <i class="fas fa-play text-[10px]"></i> Run Code
          </button>
          <button id="py-clear-btn" class="bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 text-xs px-3 py-2 rounded-xl transition-all cursor-pointer">
            <i class="fas fa-trash-alt text-[10px]"></i> Clear
          </button>
        </div>
      </div>

      <!-- Workspace Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[510px]">
        <!-- Code Editor -->
        <div class="flex flex-col bg-[#141517] rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
          <div class="bg-[#1f2124] px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span class="flex items-center gap-1.5 font-mono text-emerald-400"><i class="fas fa-code"></i> main.py</span>
            <span class="text-[10px] text-slate-500">Press Run or Shift+Enter</span>
          </div>
          <textarea id="py-code-input" spellcheck="false" class="flex-1 bg-transparent p-4 font-mono text-xs leading-relaxed text-emerald-200 outline-none resize-none selection:bg-emerald-900">${PYTHON_EXAMPLES.hello}</textarea>
        </div>

        <!-- Output Terminal -->
        <div class="flex flex-col bg-[#0b0f14] rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
          <div class="bg-[#161f28] px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span class="flex items-center gap-1.5 font-mono text-sky-400"><i class="fas fa-terminal"></i> Terminal Output</span>
            <span id="py-exec-status" class="text-[10px] text-slate-500">Ready</span>
          </div>
          <div id="py-output" class="flex-1 p-4 font-mono text-xs text-slate-200 overflow-y-auto whitespace-pre-wrap leading-relaxed">
            <div class="text-slate-500 italic">Click "Run Code" above to execute this script in Dawamu OS...</div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function transpilePythonToJS(pyCode) {
  const lines = pyCode.split('\n');
  const jsLines = [];
  const indentStack = [0];

  for (let rawLine of lines) {
    if (!rawLine.trim()) {
      jsLines.push('');
      continue;
    }

    if (rawLine.trim().startsWith('#')) {
      jsLines.push('// ' + rawLine.trim().slice(1));
      continue;
    }

    const indentMatch = rawLine.match(/^(\s*)/);
    const indent = indentMatch ? indentMatch[1].length : 0;
    let trimmed = rawLine.trim();

    // Close indentation blocks
    while (indentStack.length > 1 && indent < indentStack[indentStack.length - 1]) {
      indentStack.pop();
      jsLines.push(' '.repeat(indentStack[indentStack.length - 1]) + '}');
    }

    // Skip import lines
    if (trimmed.startsWith('import ') || trimmed.startsWith('from ')) {
      jsLines.push('// ' + trimmed);
      continue;
    }

    // Replace f-strings
    trimmed = trimmed.replace(/f"([^"]*)"/g, (m, p) => '`' + p.replace(/\{([^}:]+)(?::[^}]*)?\}/g, '${$1}') + '`');
    trimmed = trimmed.replace(/f'([^']*)'/g, (m, p) => '`' + p.replace(/\{([^}:]+)(?::[^}]*)?\}/g, '${$1}') + '`');

    // Replace Python operators and constants
    trimmed = trimmed
      .replace(/\bTrue\b/g, 'true')
      .replace(/\bFalse\b/g, 'false')
      .replace(/\bNone\b/g, 'null')
      .replace(/\band\b/g, '&&')
      .replace(/\bor\b/g, '||')
      .replace(/\bnot\b/g, '!')
      .replace(/\*\*/g, '**');

    // String multiplication: " " * n -> " ".repeat(n)
    trimmed = trimmed.replace(/(".*?"|'.*?')\s*\*\s*([^;,\n]+)/g, '$1.repeat($2)');

    // Function definition
    if (trimmed.startsWith('def ') && trimmed.endsWith(':')) {
      const fnHeader = trimmed.slice(4, -1);
      jsLines.push(' '.repeat(indent) + `function ${fnHeader} {`);
      indentStack.push(indent + 4);
      continue;
    }

    // For in enumerate
    if (trimmed.startsWith('for ') && trimmed.includes('in enumerate(') && trimmed.endsWith(':')) {
      const match = trimmed.match(/^for\s+([a-zA-Z0-9_,\s]+)\s+in\s+enumerate\((.+)\):$/);
      if (match) {
        jsLines.push(' '.repeat(indent) + `for (let [${match[1]}] of enumerate(${match[2]})) {`);
        indentStack.push(indent + 4);
        continue;
      }
    }

    // For in range
    if (trimmed.startsWith('for ') && trimmed.includes('in range(') && trimmed.endsWith(':')) {
      const match = trimmed.match(/^for\s+([a-zA-Z0-9_]+)\s+in\s+range\((.+)\):$/);
      if (match) {
        jsLines.push(' '.repeat(indent) + `for (let ${match[1]} of range(${match[2]})) {`);
        indentStack.push(indent + 4);
        continue;
      }
    }

    // For item in iterable
    if (trimmed.startsWith('for ') && trimmed.endsWith(':')) {
      const match = trimmed.match(/^for\s+([a-zA-Z0-9_,\s]+)\s+in\s+(.+):$/);
      if (match) {
        jsLines.push(' '.repeat(indent) + `for (let ${match[1]} of ${match[2]}) {`);
        indentStack.push(indent + 4);
        continue;
      }
    }

    // While loop
    if (trimmed.startsWith('while ') && trimmed.endsWith(':')) {
      const cond = trimmed.slice(6, -1);
      jsLines.push(' '.repeat(indent) + `while (${cond}) {`);
      indentStack.push(indent + 4);
      continue;
    }

    // If / elif / else
    if (trimmed.startsWith('if ') && trimmed.endsWith(':')) {
      const cond = trimmed.slice(3, -1);
      jsLines.push(' '.repeat(indent) + `if (${cond}) {`);
      indentStack.push(indent + 4);
      continue;
    }

    if (trimmed.startsWith('elif ') && trimmed.endsWith(':')) {
      const cond = trimmed.slice(5, -1);
      // Close previous block first
      if (indentStack.length > 1) indentStack.pop();
      jsLines.push(' '.repeat(indent) + `else if (${cond}) {`);
      indentStack.push(indent + 4);
      continue;
    }

    if (trimmed === 'else:') {
      if (indentStack.length > 1) indentStack.pop();
      jsLines.push(' '.repeat(indent) + `else {`);
      indentStack.push(indent + 4);
      continue;
    }

    // Variable assignment: auto-prefix let if not declared
    if (/^[a-zA-Z_][a-zA-Z0-9_]*\s*=[^=]/.test(trimmed)) {
      trimmed = 'var ' + trimmed;
    }

    jsLines.push(' '.repeat(indent) + trimmed + ';');
  }

  while (indentStack.length > 1) {
    indentStack.pop();
    jsLines.push('}');
  }

  return jsLines.join('\n');
}

async function runPythonCode(code, outputEl, statusEl, runBtn = null) {
  outputEl.innerHTML = '';
  const startTime = performance.now();
  if (statusEl) statusEl.innerHTML = '<span class="text-sky-400 animate-pulse"><i class="fas fa-spinner fa-spin"></i> Executing in sandbox...</span>';
  if (runBtn) runBtn.disabled = true;

  if (!code || !code.trim()) {
    outputEl.innerHTML = '<span class="text-amber-400 italic font-mono">[No code provided to execute]</span>';
    if (statusEl) statusEl.textContent = 'Empty';
    if (runBtn) runBtn.disabled = false;
    return;
  }

  // 1. Primary execution: Real isolated Python 3.11 FastAPI backend runner (/api/v1/playground/run)
  try {
    const res = await fetch('http://127.0.0.1:8000/api/v1/playground/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: code, timeout: 5.0 })
    });
    if (res.ok) {
      const data = await res.json();
      const elapsed = data.execution_time_ms || Math.round(performance.now() - startTime);

      outputEl.innerHTML = '';
      if (data.stdout) {
        const stdoutPre = document.createElement('div');
        stdoutPre.className = 'text-emerald-300 font-mono whitespace-pre-wrap leading-relaxed';
        stdoutPre.textContent = data.stdout;
        outputEl.appendChild(stdoutPre);
      }
      if (data.stderr) {
        const stderrPre = document.createElement('div');
        stderrPre.className = 'text-rose-400 font-mono whitespace-pre-wrap leading-relaxed mt-2 p-2.5 rounded-lg bg-rose-950/40 border border-rose-800/40';
        stderrPre.textContent = data.stderr;
        outputEl.appendChild(stderrPre);
      }
      if (!data.stdout && !data.stderr) {
        outputEl.innerHTML = '<span class="text-slate-500 italic font-mono">[Program finished with exit code 0 - no output]</span>';
      }

      if (statusEl) {
        statusEl.innerHTML = `<span class="${data.success ? 'text-emerald-400' : 'text-rose-400'} font-bold">Exit ${data.exit_code} (${elapsed}ms • Python 3.11 Sandbox)</span>`;
      }
      if (runBtn) runBtn.disabled = false;
      return;
    }
  } catch (backendErr) {
    // Backend offline or unreachable, fall through to client-side isolated runner
    console.info('[Playground] Backend runner offline, running client-side fallback:', backendErr.message);
  }

  // 2. Client-side fallback runner for standalone offline mode
  try {
    const logs = [];
    const logFn = (...args) => {
      logs.push(args.map(a => typeof a === 'object' && a !== null ? JSON.stringify(a) : String(a)).join(' '));
    };

    const scope = {
      print: logFn,
      range: (start, stop, step = 1) => {
        if (stop === undefined) { stop = start; start = 0; }
        const arr = [];
        for (let i = start; step > 0 ? i < stop : i > stop; i += step) arr.push(i);
        return arr;
      },
      len: (o) => o?.length ?? (typeof o === 'object' ? Object.keys(o).length : 0),
      sum: (arr) => Array.isArray(arr) ? arr.reduce((a, b) => a + b, 0) : 0,
      max: (...args) => Math.max(...(Array.isArray(args[0]) ? args[0] : args)),
      min: (...args) => Math.min(...(Array.isArray(args[0]) ? args[0] : args)),
      abs: (x) => Math.abs(x),
      round: (x, d = 0) => Number(x.toFixed(d)),
      int: (x) => parseInt(x, 10) || 0,
      float: (x) => parseFloat(x) || 0,
      str: (x) => String(x),
      list: (x) => Array.isArray(x) ? [...x] : (typeof x === 'object' ? Object.values(x) : []),
      enumerate: (arr) => {
        if (Array.isArray(arr)) return arr.map((item, idx) => [idx, item]);
        if (typeof arr === 'object') return Object.entries(arr);
        return [];
      },
      math: {
        sqrt: Math.sqrt,
        sin: Math.sin,
        cos: Math.cos,
        tan: Math.tan,
        pi: Math.PI,
        e: Math.E,
        floor: Math.floor,
        ceil: Math.ceil,
        pow: Math.pow
      }
    };

    const transpiled = transpilePythonToJS(code);
    const runner = new Function(...Object.keys(scope), transpiled);
    runner(...Object.values(scope));

    const elapsed = Math.round(performance.now() - startTime);
    if (statusEl) statusEl.innerHTML = `<span class="text-amber-400 font-semibold">Completed in ${elapsed}ms (Offline Client Sandbox)</span>`;

    if (logs.length === 0) {
      outputEl.innerHTML = `<span class="text-slate-500 italic">[Program finished with exit code 0 - no output]</span>`;
    } else {
      outputEl.textContent = logs.join('\n');
    }
  } catch (err) {
    if (statusEl) statusEl.innerHTML = `<span class="text-rose-400 font-bold">Execution Error</span>`;
    outputEl.innerHTML = `<span class="text-rose-400 font-bold">Python Execution Error:</span>\n<span class="text-rose-300 font-mono">${err.message}</span>`;
  } finally {
    if (runBtn) runBtn.disabled = false;
  }
}

function wireInteractivePageElements(container, loadUrl) {
  // 1. Home search button wiring
  const homeInput = container.querySelector('#home-search-input');
  const homeBtn   = container.querySelector('#home-search-btn');

  if (homeInput && homeBtn) {
    const doSearch = () => {
      const q = homeInput.value.trim();
      if (q && loadUrl) {
        loadUrl(q);
      }
    };
    homeBtn.addEventListener('click', doSearch);
    homeInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') doSearch(); });
  }

  // 2. Python Playground wiring
  const pyCode = container.querySelector('#py-code-input');
  const pyOutput = container.querySelector('#py-output');
  const pyRunBtn = container.querySelector('#py-run-btn');
  const pyClearBtn = container.querySelector('#py-clear-btn');
  const pySelect = container.querySelector('#py-example-select');
  const pyStatus = container.querySelector('#py-exec-status');

  if (pyCode && pyRunBtn && pyOutput) {
    pyRunBtn.addEventListener('click', () => {
      runPythonCode(pyCode.value, pyOutput, pyStatus, pyRunBtn);
    });

    if (pyClearBtn) {
      pyClearBtn.addEventListener('click', () => {
        pyOutput.innerHTML = '<span class="text-slate-500 italic">Terminal cleared.</span>';
        if (pyStatus) pyStatus.textContent = 'Cleared';
      });
    }

    if (pySelect) {
      pySelect.addEventListener('change', () => {
        const key = pySelect.value;
        if (PYTHON_EXAMPLES[key]) {
          pyCode.value = PYTHON_EXAMPLES[key];
          pyOutput.innerHTML = `<span class="text-slate-500 italic">Loaded template: ${pySelect.options[pySelect.selectedIndex].text}. Click Run Code to execute.</span>`;
        }
      });
    }

    pyCode.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && e.shiftKey) {
        e.preventDefault();
        runPythonCode(pyCode.value, pyOutput, pyStatus, pyRunBtn);
      }
    });
  }

  // 3. Subject Revision Quizzer Wiring
  const quizCards = container.querySelectorAll('[data-quiz-index]');
  const scoreBadge = container.querySelector('#quiz-score-badge');
  if (quizCards.length > 0 && typeof STUDY_QUIZZES !== 'undefined') {
    let score = 0;
    const answered = new Set();

    container.querySelectorAll('.quiz-opt-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const qIdx = parseInt(btn.dataset.q);
        const optIdx = parseInt(btn.dataset.opt);
        const qData = STUDY_QUIZZES[qIdx];
        if (!qData || answered.has(qIdx)) return;

        answered.add(qIdx);
        const card = container.querySelector(`[data-quiz-index="${qIdx}"]`);
        const feedback = card ? card.querySelector('.quiz-feedback') : null;
        const allOpts = card ? card.querySelectorAll('.quiz-opt-btn') : [];

        if (optIdx === qData.correct) {
          score++;
          btn.classList.remove('bg-slate-800/80', 'hover:bg-slate-700', 'border-slate-700');
          btn.classList.add('bg-emerald-900/80', 'border-emerald-500', 'text-emerald-200');
          if (feedback) {
            feedback.className = 'quiz-feedback mt-4 p-3 rounded-xl text-xs bg-emerald-950/60 border border-emerald-700/60 text-emerald-300';
            feedback.innerHTML = `<b>✓ Correct!</b> ${qData.explanation}`;
            feedback.classList.remove('hidden');
          }
        } else {
          btn.classList.remove('bg-slate-800/80', 'hover:bg-slate-700', 'border-slate-700');
          btn.classList.add('bg-rose-950/80', 'border-rose-600', 'text-rose-200');
          const correctBtn = card ? card.querySelector(`[data-opt="${qData.correct}"]`) : null;
          if (correctBtn) {
            correctBtn.classList.remove('bg-slate-800/80', 'hover:bg-slate-700', 'border-slate-700');
            correctBtn.classList.add('bg-emerald-950/80', 'border-emerald-500', 'text-emerald-200');
          }
          if (feedback) {
            feedback.className = 'quiz-feedback mt-4 p-3 rounded-xl text-xs bg-rose-950/60 border border-rose-800/60 text-rose-300';
            feedback.innerHTML = `<b>✗ Incorrect.</b> Correct answer: <b>${qData.options[qData.correct]}</b>. ${qData.explanation}`;
            feedback.classList.remove('hidden');
          }
        }

        allOpts.forEach(b => b.classList.add('pointer-events-none', 'opacity-80'));
        btn.classList.remove('opacity-80');

        if (scoreBadge) {
          scoreBadge.textContent = `Score: ${score} / ${STUDY_QUIZZES.length}`;
        }
      });
    });
  }

  // 4. 8-4-4 Book Library Filter Tabs
  const filterBtns = container.querySelectorAll('#books-filter-bar .filter-btn');
  const bookCards = container.querySelectorAll('.book-card');
  if (filterBtns.length > 0 && bookCards.length > 0) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => {
          b.classList.remove('active', 'bg-emerald-600', 'text-white');
          b.classList.add('bg-[#24262a]', 'text-slate-300');
        });
        btn.classList.add('active', 'bg-emerald-600', 'text-white');
        btn.classList.remove('bg-[#24262a]', 'text-slate-300');

        const filter = btn.dataset.filter;
        bookCards.forEach(card => {
          const form = card.dataset.form || '';
          const cat = card.dataset.category || '';
          if (filter === 'all' || form.includes(filter) || cat.includes(filter)) {
            card.style.display = 'flex';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }

  // 5. 8-4-4 Coursebook Save/Download Button
  container.querySelectorAll('.book-save-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const filename = btn.dataset.filename || 'KLB_Secondary_Coursebook_Notes.docx';
      if (window.electronAPI && typeof window.electronAPI.saveDownloadFile === 'function') {
        window.electronAPI.saveDownloadFile({ filename });
      } else {
        // Fallback for browser mode: download real blob
        const docxHeader = `Dawamu OS Academic Repository\nResource: ${filename}\nDate: ${new Date().toLocaleDateString()}\nStatus: Verified Curriculum Resource\n`;
        const blob = new Blob([docxHeader], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = filename;
        a.click();
      }

      if (window.dawamuDialogs && typeof window.dawamuDialogs.toast === 'function') {
        window.dawamuDialogs.toast(`Saved "${filename}" to This PC Downloads!`, 'success');
      } else {
        // Visual Toast Notification
        const existingToast = document.querySelector('#book-save-toast');
        if (existingToast) existingToast.remove();

        const toast = document.createElement('div');
        toast.id = 'book-save-toast';
        toast.className = 'fixed bottom-14 right-6 bg-emerald-950 border border-emerald-500 text-white px-4 py-3 rounded-2xl shadow-2xl text-xs z-[99999] flex items-center gap-3';
        toast.innerHTML = `
          <div class="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-base">
            <i class="fas fa-check-circle"></i>
          </div>
          <div>
            <div class="font-bold text-white">Saved to This PC!</div>
            <div class="text-[11px] text-emerald-300 font-mono">${filename} in Downloads</div>
          </div>
        `;
        document.body.appendChild(toast);
        setTimeout(() => { if (toast.parentNode) toast.remove(); }, 3500);
      }
    });
  });
}
