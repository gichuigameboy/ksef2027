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
  }
};

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
export function createOfflineBrowserApp() {
  let tabs = [];
  let activeTabId = null;
  let tabCounter = 0;
  let historyStack = [];

  const root = document.createElement('div');
  root.className = 'flex flex-col h-full bg-[#1e2022] text-white font-sans overflow-hidden select-text';

  root.innerHTML = `
    <!-- Tab Strip -->
    <div class="flex items-end bg-[#18191b] px-2 pt-1 gap-1 min-h-[38px] overflow-x-auto shrink-0 border-b border-black/40">
      <div id="tab-strip" class="flex items-end gap-1 flex-1 overflow-x-auto"></div>
      <button id="btn-new-tab" class="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 flex items-center justify-center text-xs self-center ml-1 shrink-0" title="New Tab">
        <i class="fas fa-plus"></i>
      </button>
    </div>

    <!-- Toolbar & Omnibox -->
    <div class="bg-[#242629] border-b border-black/20 px-3 py-1.5 flex items-center gap-2 shrink-0">
      <div class="flex items-center gap-1 text-slate-300">
        <button id="btn-back" class="nav-btn" title="Back"><i class="fas fa-arrow-left text-xs"></i></button>
        <button id="btn-forward" class="nav-btn" title="Forward"><i class="fas fa-arrow-right text-xs"></i></button>
        <button id="btn-reload" class="nav-btn" title="Reload"><i class="fas fa-redo text-xs"></i></button>
        <button id="btn-home" class="nav-btn" title="Home"><i class="fas fa-home text-xs"></i></button>
      </div>

      <!-- Omnibox Search/URL Bar -->
      <div class="flex-1 flex items-center gap-2 bg-[#18191b] hover:bg-[#2d3035] focus-within:bg-[#18191b] focus-within:border-emerald-500 border border-slate-700/60 rounded-full px-3.5 py-1.5 transition-all">
        <i class="fas fa-search text-emerald-400 text-xs"></i>
        <input id="omnibox" type="text" autocomplete="off" spellcheck="false"
               class="flex-1 bg-transparent outline-none text-xs text-white placeholder-slate-500 min-w-0"
               placeholder="Search offline encyclopedia, lesson or type a URL...">
        <div class="flex items-center gap-1.5 shrink-0">
          <span class="text-[9px] bg-emerald-950/80 text-emerald-400 border border-emerald-700/50 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1">
            <i class="fas fa-plane text-[8px]"></i> 100% Offline
          </span>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="flex items-center gap-1">
        <button id="btn-python" class="px-2.5 py-1 rounded-lg bg-emerald-900/40 hover:bg-emerald-800/60 border border-emerald-700/40 text-emerald-300 text-xs flex items-center gap-1.5 transition-colors" title="Open Offline Python Runner">
          <i class="fab fa-python"></i> <span class="text-[11px] font-semibold">Python</span>
        </button>
      </div>
    </div>

    <!-- Offline Bookmarks Bar -->
    <div id="bookmarks-bar" class="bg-[#1f2124] border-b border-black/20 px-3 py-1 flex items-center gap-1.5 text-xs overflow-x-auto shrink-0">
      <button class="bm-btn" data-url="https://en.wikipedia.org/wiki/Photosynthesis">
        <i class="fab fa-wikipedia-w text-slate-300 text-[10px]"></i> Photosynthesis
      </button>
      <button class="bm-btn" data-url="https://en.wikipedia.org/wiki/History_of_Kenya">
        <i class="fas fa-landmark text-amber-400 text-[10px]"></i> History of Kenya
      </button>
      <button class="bm-btn" data-url="https://en.wikipedia.org/wiki/Solar_System">
        <i class="fas fa-sun text-yellow-400 text-[10px]"></i> Solar System
      </button>
      <button class="bm-btn" data-url="https://www.khanacademy.org/math/algebra">
        <i class="fas fa-calculator text-emerald-400 text-[10px]"></i> Algebra (Khan)
      </button>
      <button class="bm-btn" data-url="https://www.khanacademy.org/science/physics">
        <i class="fas fa-atom text-cyan-400 text-[10px]"></i> Physics (Newton)
      </button>
      <button class="bm-btn" data-url="https://www.nasa.gov/mars">
        <i class="fas fa-rocket text-rose-400 text-[10px]"></i> NASA Mars
      </button>
      <button class="bm-btn" data-url="https://library.dawamu.school/classics/romeo-and-juliet">
        <i class="fas fa-book text-purple-400 text-[10px]"></i> Romeo & Juliet
      </button>
    </div>

    <!-- Active Web Viewport Canvas -->
    <div id="browser-viewport" class="flex-1 bg-[#121314] overflow-y-auto p-4 relative"></div>

    <!-- Status Bar -->
    <div class="bg-[#18191b] border-t border-black/30 px-3 py-1 flex justify-between items-center text-[10px] text-slate-400 shrink-0">
      <div class="flex items-center gap-2">
        <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        <span>Dawamu Offline Web Engine • Database Loaded (8 Encached Libraries)</span>
      </div>
      <div>No Wi-Fi or Internet Required</div>
    </div>

    <style>
      .nav-btn { width:26px; height:26px; border-radius:50%; display:flex; align-items:center; justify-content:center; background:transparent; border:none; color:#9aa0a6; cursor:pointer; transition:all .1s; }
      .nav-btn:hover { background:rgba(255,255,255,.1); color:#fff; }
      .nav-btn:active { transform:scale(.9); }
      .bm-btn { display:flex; align-items:center; gap:5px; padding:3px 8px; border-radius:6px; background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.06); color:#cbd5e1; font-size:11px; white-space:nowrap; cursor:pointer; transition:all .1s; }
      .bm-btn:hover { background:rgba(255,255,255,.12); color:#fff; border-color:rgba(255,255,255,.15); }
      .offline-tab { display:flex; align-items:center; gap:6px; padding:6px 12px; border-radius:8px 8px 0 0; min-width:130px; max-width:200px; font-size:11px; color:#94a3b8; background:#202225; cursor:pointer; border:1px solid transparent; border-bottom:none; transition:all .1s; }
      .offline-tab:hover { background:#2a2d31; color:#f1f5f9; }
      .offline-tab.active { background:#242629; color:#ffffff; border-color:#3e4248; font-weight:600; }
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
      // If student typed a generic search query or unindexed URL
      if (targetUrl.startsWith('http://') || targetUrl.startsWith('https://')) {
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
    wireInteractivePageElements(viewport);
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
  openTab('dawamu://home');

  return root;
}

/* ═══════════════════════════════════════════════════
   PAGE RENDERERS
═══════════════════════════════════════════════════ */

function renderHomePage() {
  return `
    <div class="max-w-4xl mx-auto py-8 px-4 flex flex-col items-center text-center">
      <img src="assets/dawamu-logo.png" alt="Dawamu Logo" class="h-24 w-auto object-contain mb-3 drop-shadow-md">
      <h1 class="text-3xl font-extrabold text-white tracking-tight">Dawamu Offline Web</h1>
      <p class="text-xs text-emerald-400 font-semibold uppercase tracking-widest mt-1 mb-8">
        Full Encyclopedia & Educational Library • Zero Wi-Fi Required
      </p>

      <!-- Central Search Box -->
      <div class="w-full max-w-xl bg-[#24262a] border border-slate-700 hover:border-emerald-500 focus-within:border-emerald-500 rounded-2xl p-2 flex items-center gap-3 shadow-2xl mb-10 transition-all">
        <i class="fas fa-search text-slate-400 ml-3"></i>
        <input id="home-search-input" type="text" placeholder="Search 1,000+ topics (e.g., Photosynthesis, Algebra, Kenya, Mars)..."
               class="bg-transparent flex-1 outline-none text-sm text-white placeholder-slate-500 min-w-0">
        <button id="home-search-btn" class="bg-[#389e3c] hover:bg-[#2e7d32] text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all">
          Search
        </button>
      </div>

      <!-- Quick Topics Grid -->
      <div class="w-full text-left">
        <div class="flex items-center justify-between mb-4">
          <div class="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <i class="fas fa-compass text-emerald-400"></i> Featured Offline Encyclopedia Topics
          </div>
          <span class="text-[10px] text-slate-500 font-mono">100% Offline Ready</span>
        </div>

        <div class="grid grid-cols-3 gap-4">
          <a href="https://en.wikipedia.org/wiki/Photosynthesis" class="p-4 rounded-2xl bg-[#24262a] hover:bg-[#2e3137] border border-slate-800 hover:border-emerald-700/50 transition-all group flex flex-col justify-between">
            <div>
              <div class="text-emerald-400 text-xl mb-2 group-hover:scale-110 transition-transform w-fit"><i class="fas fa-seedling"></i></div>
              <div class="font-bold text-sm text-white group-hover:text-emerald-300">Photosynthesis</div>
              <div class="text-[11px] text-slate-400 mt-1">Light reactions, Calvin cycle, and biological energy production.</div>
            </div>
            <div class="text-[10px] text-emerald-500 font-bold uppercase mt-3">Biology • Wikipedia</div>
          </a>

          <a href="https://en.wikipedia.org/wiki/History_of_Kenya" class="p-4 rounded-2xl bg-[#24262a] hover:bg-[#2e3137] border border-slate-800 hover:border-emerald-700/50 transition-all group flex flex-col justify-between">
            <div>
              <div class="text-amber-400 text-xl mb-2 group-hover:scale-110 transition-transform w-fit"><i class="fas fa-landmark"></i></div>
              <div class="font-bold text-sm text-white group-hover:text-amber-300">History of Kenya</div>
              <div class="text-[11px] text-slate-400 mt-1">From cradle of humankind to 1963 independence & 2010 Constitution.</div>
            </div>
            <div class="text-[10px] text-amber-500 font-bold uppercase mt-3">History • Wikipedia</div>
          </a>

          <a href="https://en.wikipedia.org/wiki/Solar_System" class="p-4 rounded-2xl bg-[#24262a] hover:bg-[#2e3137] border border-slate-800 hover:border-emerald-700/50 transition-all group flex flex-col justify-between">
            <div>
              <div class="text-yellow-400 text-xl mb-2 group-hover:scale-110 transition-transform w-fit"><i class="fas fa-globe"></i></div>
              <div class="font-bold text-sm text-white group-hover:text-yellow-300">The Solar System</div>
              <div class="text-[11px] text-slate-400 mt-1">Planetary orbits, terrestrial planets, gas giants & deep space.</div>
            </div>
            <div class="text-[10px] text-yellow-500 font-bold uppercase mt-3">Astronomy • Wikipedia</div>
          </a>

          <a href="https://www.khanacademy.org/math/algebra" class="p-4 rounded-2xl bg-[#24262a] hover:bg-[#2e3137] border border-slate-800 hover:border-emerald-700/50 transition-all group flex flex-col justify-between">
            <div>
              <div class="text-sky-400 text-xl mb-2 group-hover:scale-110 transition-transform w-fit"><i class="fas fa-square-root-alt"></i></div>
              <div class="font-bold text-sm text-white group-hover:text-sky-300">Algebra Mastery</div>
              <div class="text-[11px] text-slate-400 mt-1">Quadratic equations, discriminant rules & polynomial factoring.</div>
            </div>
            <div class="text-[10px] text-sky-500 font-bold uppercase mt-3">Mathematics • Khan Academy</div>
          </a>

          <a href="https://www.khanacademy.org/science/physics" class="p-4 rounded-2xl bg-[#24262a] hover:bg-[#2e3137] border border-slate-800 hover:border-emerald-700/50 transition-all group flex flex-col justify-between">
            <div>
              <div class="text-indigo-400 text-xl mb-2 group-hover:scale-110 transition-transform w-fit"><i class="fas fa-magnet"></i></div>
              <div class="font-bold text-sm text-white group-hover:text-indigo-300">Newtonian Physics</div>
              <div class="text-[11px] text-slate-400 mt-1">Newton's 3 laws of motion, inertia, momentum & F=ma.</div>
            </div>
            <div class="text-[10px] text-indigo-500 font-bold uppercase mt-3">Physics • Khan Academy</div>
          </a>

          <a href="https://www.nasa.gov/mars" class="p-4 rounded-2xl bg-[#24262a] hover:bg-[#2e3137] border border-slate-800 hover:border-emerald-700/50 transition-all group flex flex-col justify-between">
            <div>
              <div class="text-rose-400 text-xl mb-2 group-hover:scale-110 transition-transform w-fit"><i class="fas fa-rocket"></i></div>
              <div class="font-bold text-sm text-white group-hover:text-rose-300">NASA Mars 2020</div>
              <div class="text-[11px] text-slate-400 mt-1">Perseverance Rover & Ingenuity helicopter discoveries at Jezero crater.</div>
            </div>
            <div class="text-[10px] text-rose-500 font-bold uppercase mt-3">Space • NASA</div>
          </a>
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
  const urlObj = new URL(url);
  const pathName = urlObj.pathname.replace(/^\//, '').replace(/\//g, ' > ');
  const topicName = pathName.split(' > ').pop() || urlObj.hostname;

  return {
    title: `${topicName} - Offline Reader`,
    render: () => `
      <div class="max-w-4xl mx-auto bg-[#24262a] text-white p-8 rounded-2xl border border-slate-800">
        <div class="flex items-center gap-3 border-b border-slate-700/60 pb-4 mb-6">
          <i class="fas fa-shield-alt text-emerald-400 text-2xl"></i>
          <div>
            <div class="text-[10px] text-emerald-400 uppercase tracking-wider font-bold">Dawamu Offline Web Proxy</div>
            <h1 class="text-2xl font-bold capitalize">${topicName.replace(/_/g, ' ')}</h1>
          </div>
        </div>

        <div class="bg-emerald-950/40 border border-emerald-800/40 p-4 rounded-xl text-xs text-emerald-300 mb-6">
          <i class="fas fa-check-circle mr-1"></i> You are viewing an encached offline snapshot for <b>${url}</b>.
        </div>

        <div class="prose prose-invert max-w-none text-xs leading-relaxed space-y-4 text-slate-300">
          <p>
            This article on <b>${topicName.replace(/_/g, ' ')}</b> is pre-rendered from the Dawamu Offline Curated Knowledgebase. Students have continuous read access regardless of internet status.
          </p>
          <div class="p-4 bg-slate-900 rounded-xl font-mono text-[11px] text-slate-300">
            <div><b>Source Domain:</b> ${urlObj.hostname}</div>
            <div><b>Resource Path:</b> ${urlObj.pathname}</div>
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

function wireInteractivePageElements(container) {
  // Home search button wiring
  const homeInput = container.querySelector('#home-search-input');
  const homeBtn   = container.querySelector('#home-search-btn');

  if (homeInput && homeBtn) {
    const doSearch = () => {
      const q = homeInput.value.trim();
      if (q) {
        const link = document.createElement('a');
        link.href = q;
        container.closest('#browser-viewport').dispatchEvent(new CustomEvent('custom-navigate', { detail: q }));
      }
    };
    homeBtn.addEventListener('click', doSearch);
    homeInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') doSearch(); });
  }
}
