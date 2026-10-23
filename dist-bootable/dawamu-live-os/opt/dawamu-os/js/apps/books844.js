/**
 * Dawamu OS - 8-4-4 Senior Secondary Curriculum Library (Form 3 & Form 4)
 * 
 * Comprehensive, syllabus-aligned coursebooks, revision guides and set books for Kenyan Secondary Schools:
 * 
 * FORM 3 COURSEBOOKS:
 * 1. KLB Secondary Mathematics Form 3
 * 2. KLB Secondary Biology Form 3
 * 3. KLB Secondary Chemistry Form 3
 * 4. KLB Secondary Physics Form 3
 * 5. KLB History & Government Form 3
 * 6. KLB Geography Form 3
 * 7. KLB Business Studies Form 3
 * 
 * FORM 4 COURSEBOOKS:
 * 8. KLB Secondary Mathematics Form 4
 * 9. KLB Secondary Biology Form 4
 * 10. KLB Secondary Chemistry Form 4
 * 11. KLB Secondary Physics Form 4
 * 12. KLB History & Government Form 4
 * 13. KLB Geography Form 4
 * 14. KLB Business Studies Form 4
 * 
 * KCSE SET BOOKS (LITERATURE & FASIHI):
 * 15. Fathers of Nations (Paul B. Vitta) - Compulsory Novel
 * 16. The Samaritan (John Lara) - Compulsory Play
 * 17. Bembea ya Maisha (Timothy Arege) - Tamthilia Teule
 * 18. Chozi la Heri (Assumpta K. Matei) - Riwaya Teule
 * 19. Mapambazuko ya Machweo na Hadithi Nyingine - Hadithi Fupi Teule
 * 20. A Doll's House (Henrik Ibsen) - Set Book Guide
 * 21. The Pearl (John Steinbeck) - Set Book Guide
 */

export const BOOKS_844_CATALOG = [
  // ─── FORM 3 ──────────────────────────────────────────────────────────────
  {
    id: 'f3-math',
    title: 'KLB Secondary Mathematics Form 3',
    subject: 'Mathematics',
    form: 'Form 3',
    level: 'Senior Secondary',
    author: 'Kenya Literature Bureau (KLB)',
    category: 'Mathematics',
    color: 'from-blue-600 to-indigo-700',
    accentColor: '#3b82f6',
    icon: 'fas fa-square-root-alt',
    chaptersCount: 12,
    url: 'https://curriculum.dawamu.school/844/form3/mathematics',
    summary: 'Quadratic Expressions II, Approximations & Errors, Trig III, Surds, Further Logarithms, Commercial Arithmetic II, Circles (Chords & Tangents), Matrices, Variations, Sequences & Series, Binomial Expansion.',
    downloadName: 'KLB_Form3_Mathematics_Full_Notes.docx'
  },
  {
    id: 'f3-bio',
    title: 'KLB Secondary Biology Form 3',
    subject: 'Biology',
    form: 'Form 3',
    level: 'Senior Secondary',
    author: 'Kenya Literature Bureau (KLB)',
    category: 'Sciences',
    color: 'from-emerald-600 to-teal-800',
    accentColor: '#10b981',
    icon: 'fas fa-seedling',
    chaptersCount: 4,
    url: 'https://curriculum.dawamu.school/844/form3/biology',
    summary: 'Classification II (Dichotomous keys, 5 kingdoms), Ecology (Energy flow, nutrient cycles, population sampling), Reproduction in Plants & Animals (Menstrual cycle, floral organs), Growth & Development.',
    downloadName: 'KLB_Form3_Biology_Study_Guide.docx'
  },
  {
    id: 'f3-chem',
    title: 'KLB Secondary Chemistry Form 3',
    subject: 'Chemistry',
    form: 'Form 3',
    level: 'Senior Secondary',
    author: 'Kenya Literature Bureau (KLB)',
    category: 'Sciences',
    color: 'from-amber-600 to-orange-700',
    accentColor: '#f59e0b',
    icon: 'fas fa-flask',
    chaptersCount: 6,
    url: 'https://curriculum.dawamu.school/844/form3/chemistry',
    summary: 'Gas Laws (Boyle, Charles, Graham), The Mole Concept & Volumetric Analysis, Organic Chemistry I (Alkanes, Alkenes, Alkynes), Nitrogen & Compounds, Sulphur (Frasch & Contact), Chlorine.',
    downloadName: 'KLB_Form3_Chemistry_Complete_Notes.docx'
  },
  {
    id: 'f3-phy',
    title: 'KLB Secondary Physics Form 3',
    subject: 'Physics',
    form: 'Form 3',
    level: 'Senior Secondary',
    author: 'Kenya Literature Bureau (KLB)',
    category: 'Sciences',
    color: 'from-violet-600 to-purple-800',
    accentColor: '#8b5cf6',
    icon: 'fas fa-bolt',
    chaptersCount: 8,
    url: 'https://curriculum.dawamu.school/844/form3/physics',
    summary: 'Linear Motion, Refraction of Light, Newton Laws of Motion, Work, Energy, Power & Machines, Current Electricity II (Ohm, E=V+Ir), Waves II, Electrostatics II & Capacitors, Heating Effect.',
    downloadName: 'KLB_Form3_Physics_Summary.docx'
  },
  {
    id: 'f3-hist',
    title: 'KLB History & Government Form 3',
    subject: 'History',
    form: 'Form 3',
    level: 'Senior Secondary',
    author: 'Kenya Literature Bureau (KLB)',
    category: 'Humanities',
    color: 'from-rose-600 to-red-800',
    accentColor: '#ef4444',
    icon: 'fas fa-landmark',
    chaptersCount: 5,
    url: 'https://curriculum.dawamu.school/844/form3/history',
    summary: 'European Invasion & Berlin Conference 1884, Colonial Rule in Kenya, Resistance (Nandi, Agiryama) & Collaboration, Colonial Administration (Settlers, Kipande, Taxation), Mau Mau Struggle & Independence 1963.',
    downloadName: 'KLB_Form3_History_Notes.docx'
  },
  {
    id: 'f3-geog',
    title: 'KLB Secondary Geography Form 3',
    subject: 'Geography',
    form: 'Form 3',
    level: 'Senior Secondary',
    author: 'Kenya Literature Bureau (KLB)',
    category: 'Humanities',
    color: 'from-teal-600 to-emerald-800',
    accentColor: '#14b8a6',
    icon: 'fas fa-globe-africa',
    chaptersCount: 5,
    url: 'https://curriculum.dawamu.school/844/form3/geography',
    summary: 'External Land-Forming Processes: Weathering & Mass Wasting, Rivers & Hydrological Action, Glaciation (Cirques, Arêtes), Wind & Water in Arid Areas, Underground Water & Karst Landscapes.',
    downloadName: 'KLB_Form3_Geography_Study_Guide.docx'
  },
  {
    id: 'f3-biz',
    title: 'KLB Business Studies Form 3',
    subject: 'Business Studies',
    form: 'Form 3',
    level: 'Senior Secondary',
    author: 'Kenya Literature Bureau (KLB)',
    category: 'Humanities',
    color: 'from-cyan-600 to-blue-800',
    accentColor: '#06b6d4',
    icon: 'fas fa-chart-line',
    chaptersCount: 6,
    url: 'https://curriculum.dawamu.school/844/form3/business',
    summary: 'Demand & Supply (Elasticity, Equilibrium), Size & Location of Firm (Economies of Scale), Product Markets (Monopoly, Oligopoly), Chain of Distribution, National Income (GDP, GNP), Population & Employment.',
    downloadName: 'KLB_Form3_Business_Studies.docx'
  },

  // ─── FORM 4 ──────────────────────────────────────────────────────────────
  {
    id: 'f4-math',
    title: 'KLB Secondary Mathematics Form 4',
    subject: 'Mathematics',
    form: 'Form 4',
    level: 'KCSE Candidate',
    author: 'Kenya Literature Bureau (KLB)',
    category: 'Mathematics',
    color: 'from-blue-700 to-cyan-800',
    accentColor: '#2563eb',
    icon: 'fas fa-calculator',
    chaptersCount: 6,
    url: 'https://curriculum.dawamu.school/844/form4/mathematics',
    summary: 'Matrices & Transformations (Shear, Stretch, Rotation, Enlargement), Statistics II (Standard Deviation, Ogive, Quartiles), 3D Geometry, Longitudes & Latitudes (Knots, Nautical miles), Linear Programming, Calculus (Differentiation & Integration).',
    downloadName: 'KLB_Form4_Mathematics_KCSE_Master.docx'
  },
  {
    id: 'f4-bio',
    title: 'KLB Secondary Biology Form 4',
    subject: 'Biology',
    form: 'Form 4',
    level: 'KCSE Candidate',
    author: 'Kenya Literature Bureau (KLB)',
    category: 'Sciences',
    color: 'from-emerald-700 to-green-900',
    accentColor: '#059669',
    icon: 'fas fa-dna',
    chaptersCount: 4,
    url: 'https://curriculum.dawamu.school/844/form4/biology',
    summary: 'Genetics II (Mutations, Pedigrees, Sex linkage, Biotechnology), Evolution (Lamarck vs Darwin Natural Selection, Homologous structures), Reception, Response & Coordination (Nervous system, Eye, Ear, Hormones), Support & Movement (Bones, Joints, Muscles).',
    downloadName: 'KLB_Form4_Biology_KCSE_Revision.docx'
  },
  {
    id: 'f4-chem',
    title: 'KLB Secondary Chemistry Form 4',
    subject: 'Chemistry',
    form: 'Form 4',
    level: 'KCSE Candidate',
    author: 'Kenya Literature Bureau (KLB)',
    category: 'Sciences',
    color: 'from-amber-700 to-red-900',
    accentColor: '#d97706',
    icon: 'fas fa-atom',
    chaptersCount: 6,
    url: 'https://curriculum.dawamu.school/844/form4/chemistry',
    summary: 'Energy Changes (Enthalpy, Hess Law, Calorimetry), Reaction Rates & Reversible Reactions (Equilibrium, Le Chatelier), Electrochemistry (Daniell cell, Hall-Heroult Aluminium extraction), Metals (Blast Furnace Iron, Copper), Organic Chemistry II (Alkanols, Esters, Soaps, Polymers), Radioactivity.',
    downloadName: 'KLB_Form4_Chemistry_KCSE_Notes.docx'
  },
  {
    id: 'f4-phy',
    title: 'KLB Secondary Physics Form 4',
    subject: 'Physics',
    form: 'Form 4',
    level: 'KCSE Candidate',
    author: 'Kenya Literature Bureau (KLB)',
    category: 'Sciences',
    color: 'from-indigo-700 to-slate-900',
    accentColor: '#4f46e5',
    icon: 'fas fa-wave-square',
    chaptersCount: 9,
    url: 'https://curriculum.dawamu.school/844/form4/physics',
    summary: 'Thin Lenses (Formula 1/f = 1/u + 1/v, Microscope, Telescope), Uniform Circular Motion, Floating & Sinking (Archimedes), EM Spectrum, Electromagnetic Induction (Faraday, Lenz, Transformers), Mains Electricity, Cathode Rays & CRO, Photoelectric Effect, Radioactivity.',
    downloadName: 'KLB_Form4_Physics_KCSE_Compendium.docx'
  },
  {
    id: 'f4-hist',
    title: 'KLB History & Government Form 4',
    subject: 'History',
    form: 'Form 4',
    level: 'KCSE Candidate',
    author: 'Kenya Literature Bureau (KLB)',
    category: 'Humanities',
    color: 'from-rose-700 to-pink-900',
    accentColor: '#e11d48',
    icon: 'fas fa-balance-scale',
    chaptersCount: 7,
    url: 'https://curriculum.dawamu.school/844/form4/history',
    summary: 'World War I & II, League of Nations & United Nations Organisation (UNO), Cold War & Non-Aligned Movement, Cooperation in Africa (OAU/AU, EAC, COMESA), National Philosophies (African Socialism, Harambee, Nyayoism), Post-Independence Kenya, Devolved Government & Public Finance.',
    downloadName: 'KLB_Form4_History_Master_Guide.docx'
  },
  {
    id: 'f4-geog',
    title: 'KLB Secondary Geography Form 4',
    subject: 'Geography',
    form: 'Form 4',
    level: 'KCSE Candidate',
    author: 'Kenya Literature Bureau (KLB)',
    category: 'Humanities',
    color: 'from-teal-700 to-slate-900',
    accentColor: '#0f766e',
    icon: 'fas fa-mountain',
    chaptersCount: 8,
    url: 'https://curriculum.dawamu.school/844/form4/geography',
    summary: 'Land Reclamation (Mwea Tebere, Zuiderzee Netherlands), Agriculture (Tea, Coffee, Canadian Wheat, Dairy), Forestry (Kenya vs Canada), Mining (Soda Ash Magadi, Titanium Kwale, Gold SA), Energy (Seven Forks HEP, Olkaria Geothermal), Industry (Kenya vs Japan), Transport & Trade.',
    downloadName: 'KLB_Form4_Geography_KCSE_Guide.docx'
  },
  {
    id: 'f4-biz',
    title: 'KLB Business Studies Form 4',
    subject: 'Business Studies',
    form: 'Form 4',
    level: 'KCSE Candidate',
    author: 'Kenya Literature Bureau (KLB)',
    category: 'Humanities',
    color: 'from-sky-700 to-indigo-900',
    accentColor: '#0284c7',
    icon: 'fas fa-coins',
    chaptersCount: 6,
    url: 'https://curriculum.dawamu.school/844/form4/business',
    summary: 'Financial Statements (Trading, Profit & Loss, Balance Sheet, Ratios), Money & Banking (Central Bank, Monetary Policy, Credit Creation), Public Finance (Canons of Taxation, National Budget), Inflation (Demand-pull, Cost-push), International Trade (Terms of Trade, Balance of Payments), Economic Planning.',
    downloadName: 'KLB_Form4_Business_Studies_Notes.docx'
  },

  // ─── KCSE SET BOOKS (LITERATURE & FASIHI) ──────────────────────────────────
  {
    id: 'set-fathers',
    title: 'Fathers of Nations (Paul B. Vitta)',
    subject: 'Literature in English',
    form: 'Form 3 & 4',
    level: 'Compulsory KCSE Novel',
    author: 'Paul B. Vitta (Study Guide by Dawamu Dept. of Languages)',
    category: 'Literature',
    color: 'from-purple-700 to-indigo-900',
    accentColor: '#9333ea',
    icon: 'fas fa-book',
    chaptersCount: 14,
    url: 'https://library.dawamu.school/setbooks/fathers-of-nations',
    summary: 'Way Omega vs Path Alpha at Banjul Summit. Full chapter summaries (Ch 1-14), character sketches (Prof. Kimani, Pastor Chiamaka, Comrade Melusi, Eng. Tahir, Dr. Afolabi), thematic analysis (bad governance, neo-colonialism, betrayal) & sample KCSE essays.',
    downloadName: 'Fathers_of_Nations_Comprehensive_Guide.docx'
  },
  {
    id: 'set-samaritan',
    title: 'The Samaritan (John Lara)',
    subject: 'Literature in English',
    form: 'Form 3 & 4',
    level: 'Compulsory KCSE Play',
    author: 'John Lara (Study Guide by Dawamu Dept. of Languages)',
    category: 'Literature',
    color: 'from-fuchsia-700 to-purple-950',
    accentColor: '#c026d3',
    icon: 'fas fa-theater-masks',
    chaptersCount: 4,
    url: 'https://library.dawamu.school/setbooks/the-samaritan',
    summary: 'Maracas Municipality corruption exposé. Act-by-act analysis, character sketches (Teacher Nicole, Mayor Mossi, Inspector Bembe, Ramdaye, Montano, Alvita), themes of anti-corruption, technology, integrity & KCSE essay samples.',
    downloadName: 'The_Samaritan_KCSE_Guide.docx'
  },
  {
    id: 'set-bembea',
    title: 'Bembea ya Maisha (Timothy Arege)',
    subject: 'Fasihi ya Kiswahili',
    form: 'Kidato cha 3 & 4',
    level: 'Tamthilia Teule ya KCSE',
    author: 'Timothy Arege (Mwongozo wa Idara ya Kiswahili Dawamu)',
    category: 'Kiswahili',
    color: 'from-rose-700 to-red-950',
    accentColor: '#e11d48',
    icon: 'fas fa-feather-alt',
    chaptersCount: 4,
    url: 'https://library.dawamu.school/setbooks/bembea-ya-maisha',
    summary: 'Maudhui ya uvumilivu, ndoa, malezi, mila na usasa. Muhtasari wa maonyesho, wahusika (Sara, Yona, Neema, Bunju, Asna), mbinu za lugha (jazanda ya bembea, kinaya), na maswali ya insha ya KCSE.',
    downloadName: 'Bembea_ya_Maisha_Mwongozo_Kamili.docx'
  },
  {
    id: 'set-chozi',
    title: 'Chozi la Heri (Assumpta K. Matei)',
    subject: 'Fasihi ya Kiswahili',
    form: 'Kidato cha 3 & 4',
    level: 'Riwaya Teule ya KCSE',
    author: 'Dkt. Assumpta K. Matei (Mwongozo wa Fasihi Dawamu)',
    category: 'Kiswahili',
    color: 'from-emerald-800 to-teal-950',
    accentColor: '#047857',
    icon: 'fas fa-book-reader',
    chaptersCount: 8,
    url: 'https://library.dawamu.school/setbooks/chozi-la-heri',
    summary: 'Riwaya ya matumaini baada ya majanga ya kikabila. Muhtasari wa sura zote, uchambuzi wa wahusika (Ridhaa, Mwangeka, Selume, Subira), maudhui ya ukimbizi, amani, na ujenzi upya wa jamii.',
    downloadName: 'Chozi_la_Heri_Mwongozo_wa_Riwaya.docx'
  },
  {
    id: 'set-mapambazuko',
    title: 'Mapambazuko ya Machweo na Hadithi Nyingine',
    subject: 'Fasihi ya Kiswahili',
    form: 'Kidato cha 3 & 4',
    level: 'Hadithi Fupi za KCSE',
    author: 'DWK (Mkusanyiko wa Hadithi Fupi Teule)',
    category: 'Kiswahili',
    color: 'from-orange-700 to-amber-900',
    accentColor: '#ea580c',
    icon: 'fas fa-scroll',
    chaptersCount: 6,
    url: 'https://library.dawamu.school/setbooks/mapambazuko-ya-machweo',
    summary: 'Uchambuzi wa kina wa hadithi teule: Mapambazuko ya Machweo, Fadhila za Punda, Nizikeni Peke Yangu, Harubu ya Maisha. Wahusika, ploti, migogoro, na maswali ya dondoo ya mtihani.',
    downloadName: 'Mapambazuko_ya_Machweo_Mwongozo.docx'
  },
  {
    id: 'set-pearl',
    title: 'The Pearl (John Steinbeck)',
    subject: 'Literature in English',
    form: 'Form 3 & 4',
    level: 'Classic KCSE Set Book',
    author: 'John Steinbeck',
    category: 'Literature',
    color: 'from-blue-800 to-slate-900',
    accentColor: '#1e40af',
    icon: 'fas fa-gem',
    chaptersCount: 6,
    url: 'https://library.dawamu.school/setbooks/the-pearl',
    summary: 'Kino, Juana, Coyotito and the Pearl of the World. Chapter breakdown, the songs of family vs evil, greed, colonialism and destructive illusions of wealth.',
    downloadName: 'The_Pearl_Study_Notes.docx'
  },
  {
    id: 'set-dolls-house',
    title: 'A Doll\'s House (Henrik Ibsen)',
    subject: 'Literature in English',
    form: 'Form 3 & 4',
    level: 'Classic KCSE Play',
    author: 'Henrik Ibsen',
    category: 'Literature',
    color: 'from-amber-800 to-stone-900',
    accentColor: '#92400e',
    icon: 'fas fa-door-closed',
    chaptersCount: 3,
    url: 'https://library.dawamu.school/setbooks/a-dolls-house',
    summary: 'Nora Helmer, Torvald, Krogstad, Mrs. Linde. Act-by-act analysis, the slamming door, deception vs autonomy, marriage as doll house.',
    downloadName: 'A_Dolls_House_Study_Notes.docx'
  }
];

/* ─── HELPER: ACTION BAR FOR BOOKS ─── */
function renderBookHeader(book, formLabel, subjectBadge) {
  return `
    <div class="bg-gradient-to-r ${book.color} text-white p-6 sm:p-8 rounded-2xl mb-8 shadow-xl relative overflow-hidden">
      <div class="absolute -right-10 -bottom-10 text-white/10 text-9xl pointer-events-none">
        <i class="${book.icon}"></i>
      </div>
      <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div class="flex items-center gap-2 mb-2 flex-wrap">
            <span class="bg-white/20 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              ${formLabel}
            </span>
            <span class="bg-black/20 text-white/90 text-[11px] font-semibold px-2.5 py-1 rounded-full">
              ${subjectBadge}
            </span>
            <span class="bg-emerald-500/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <i class="fas fa-check-circle"></i> Official 8-4-4 Syllabus
            </span>
          </div>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">${book.title}</h1>
          <p class="text-xs text-white/80 mt-1 max-w-2xl leading-relaxed">${book.author} • Comprehensive Student Edition & Revision Guide</p>
        </div>

        <div class="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button class="book-save-btn bg-white/20 hover:bg-white/30 backdrop-blur-md text-white text-xs font-bold px-4 py-2.5 rounded-xl border border-white/20 transition-all flex items-center gap-2 active:scale-95" data-filename="${book.downloadName}">
            <i class="fas fa-download"></i> Save to This PC
          </button>
          <a href="dawamu://books-844" class="bg-black/30 hover:bg-black/40 text-white text-xs font-bold px-4 py-2.5 rounded-xl border border-white/10 transition-all flex items-center gap-2">
            <i class="fas fa-th-large"></i> Book Library
          </a>
        </div>
      </div>
    </div>
  `;
}

/* ═══════════════════════════════════════════════════
   PORTAL PAGE: dawamu://books-844
═══════════════════════════════════════════════════ */
export function renderBooks844Portal() {
  return `
    <div class="max-w-6xl mx-auto py-8 px-4 font-sans text-white">
      <!-- Breadcrumbs -->
      <div class="flex items-center gap-2 text-xs text-slate-400 mb-4">
        <a href="dawamu://home" class="hover:text-emerald-400">Home</a>
        <i class="fas fa-chevron-right text-[10px] text-slate-600"></i>
        <span class="text-emerald-400 font-bold">8-4-4 Senior Secondary Books (Form 3 & Form 4)</span>
      </div>

      <!-- Hero Banner -->
      <div class="relative bg-gradient-to-r from-emerald-950 via-[#0a271b] to-[#0c1f36] border border-emerald-500/30 p-8 rounded-3xl shadow-2xl mb-8 overflow-hidden">
        <div class="absolute -right-8 -bottom-8 text-emerald-500/10 text-9xl pointer-events-none">
          <i class="fas fa-book-open"></i>
        </div>
        <div class="relative z-10 max-w-3xl">
          <div class="flex items-center gap-2 mb-3">
            <span class="bg-emerald-500 text-slate-950 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider">
              Kenyan 8-4-4 Secondary
            </span>
            <span class="text-xs text-emerald-300 font-bold">Forms 3 & 4 Complete Curriculum</span>
          </div>
          <h1 class="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
            Form 3 & Form 4 Coursebook Library
          </h1>
          <p class="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
            Access complete, syllabus-aligned KLB coursebooks, revision guides, formula compendiums, and official KCSE set book study guides. 100% offline, zero internet required.
          </p>

          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div class="bg-white/5 border border-white/10 rounded-2xl p-3 backdrop-blur-sm">
              <div class="text-2xl font-black text-emerald-400">21</div>
              <div class="text-[10px] uppercase font-bold text-slate-400">Coursebooks</div>
            </div>
            <div class="bg-white/5 border border-white/10 rounded-2xl p-3 backdrop-blur-sm">
              <div class="text-2xl font-black text-blue-400">120+</div>
              <div class="text-[10px] uppercase font-bold text-slate-400">Chapters & Units</div>
            </div>
            <div class="bg-white/5 border border-white/10 rounded-2xl p-3 backdrop-blur-sm">
              <div class="text-2xl font-black text-amber-400">300+</div>
              <div class="text-[10px] uppercase font-bold text-slate-400">KCSE Questions</div>
            </div>
            <div class="bg-white/5 border border-white/10 rounded-2xl p-3 backdrop-blur-sm">
              <div class="text-2xl font-black text-purple-400">100%</div>
              <div class="text-[10px] uppercase font-bold text-slate-400">Offline & Free</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Filter Tabs -->
      <div class="flex items-center gap-2 overflow-x-auto pb-3 mb-6 select-none" id="books-filter-bar">
        <button class="filter-btn active bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md shrink-0" data-filter="all">
          <i class="fas fa-th-large mr-1.5"></i> All Books (21)
        </button>
        <button class="filter-btn bg-[#24262a] hover:bg-slate-700 text-slate-300 text-xs font-semibold px-4 py-2 rounded-xl border border-slate-700 transition-all shrink-0" data-filter="Form 3">
          <i class="fas fa-user-graduate mr-1.5 text-blue-400"></i> Form 3 (7)
        </button>
        <button class="filter-btn bg-[#24262a] hover:bg-slate-700 text-slate-300 text-xs font-semibold px-4 py-2 rounded-xl border border-slate-700 transition-all shrink-0" data-filter="Form 4">
          <i class="fas fa-graduation-cap mr-1.5 text-emerald-400"></i> Form 4 (7)
        </button>
        <button class="filter-btn bg-[#24262a] hover:bg-slate-700 text-slate-300 text-xs font-semibold px-4 py-2 rounded-xl border border-slate-700 transition-all shrink-0" data-filter="Literature">
          <i class="fas fa-book mr-1.5 text-purple-400"></i> Set Books (7)
        </button>
        <button class="filter-btn bg-[#24262a] hover:bg-slate-700 text-slate-300 text-xs font-semibold px-4 py-2 rounded-xl border border-slate-700 transition-all shrink-0" data-filter="Sciences">
          <i class="fas fa-flask mr-1.5 text-amber-400"></i> Pure Sciences (6)
        </button>
        <button class="filter-btn bg-[#24262a] hover:bg-slate-700 text-slate-300 text-xs font-semibold px-4 py-2 rounded-xl border border-slate-700 transition-all shrink-0" data-filter="Mathematics">
          <i class="fas fa-calculator mr-1.5 text-sky-400"></i> Mathematics (2)
        </button>
        <button class="filter-btn bg-[#24262a] hover:bg-slate-700 text-slate-300 text-xs font-semibold px-4 py-2 rounded-xl border border-slate-700 transition-all shrink-0" data-filter="Humanities">
          <i class="fas fa-globe-africa mr-1.5 text-rose-400"></i> Humanities & Biz (6)
        </button>
      </div>

      <!-- Books Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" id="books-grid">
        ${BOOKS_844_CATALOG.map(book => `
          <div class="book-card bg-[#24262a] hover:bg-[#2a2d33] border border-slate-800 hover:border-slate-700 rounded-2xl p-5 flex flex-col justify-between transition-all group shadow-sm hover:shadow-xl hover:-translate-y-1" data-form="${book.form}" data-category="${book.category}">
            <div>
              <div class="flex items-center justify-between mb-3">
                <span class="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${book.form.includes('Form 3') ? 'bg-blue-950 text-blue-300 border border-blue-700/50' : (book.form.includes('Form 4') ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/50' : 'bg-purple-950 text-purple-300 border border-purple-700/50')}">
                  ${book.form}
                </span>
                <span class="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                  <i class="fas fa-list-ol text-slate-500"></i> ${book.chaptersCount} Chapters
                </span>
              </div>

              <div class="flex items-start gap-3.5 mb-3">
                <div class="w-12 h-12 rounded-xl bg-gradient-to-br ${book.color} flex items-center justify-center text-white text-xl shadow-md shrink-0 group-hover:scale-105 transition-transform">
                  <i class="${book.icon}"></i>
                </div>
                <div>
                  <h3 class="font-bold text-base text-white group-hover:text-emerald-400 transition-colors leading-tight">
                    ${book.title}
                  </h3>
                  <div class="text-[11px] text-slate-400 mt-0.5">${book.author}</div>
                </div>
              </div>

              <p class="text-xs text-slate-300 leading-relaxed mb-4 line-clamp-3">
                ${book.summary}
              </p>
            </div>

            <div class="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-2">
              <a href="${book.url}" class="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2 px-3 rounded-xl text-center transition-all flex items-center justify-center gap-1.5 shadow-md">
                <i class="fas fa-book-reader text-[11px]"></i> Read Book
              </a>
              <button class="book-save-btn bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs py-2 px-3 rounded-xl border border-slate-700 transition-all flex items-center gap-1 shrink-0" data-filename="${book.downloadName}" title="Save to My PC Downloads">
                <i class="fas fa-download text-[11px]"></i>
              </button>
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Quick Study Advice -->
      <div class="mt-12 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <h3 class="text-base font-bold text-white mb-2 flex items-center gap-2">
          <i class="fas fa-lightbulb text-amber-400"></i> KCSE Senior Secondary Study Strategy
        </h3>
        <p class="text-xs text-slate-300 leading-relaxed mb-3">
          Form 3 and Form 4 content accounts for over <b>70% of marks in KCSE National Examinations</b>. Use the integrated chapter revision questions, work through calculations on paper or in the Dawamu Calculator, and save summary notes to your <b>This PC > Documents</b> directory for exam prep.
        </p>
        <div class="flex items-center gap-3 text-xs text-slate-400">
          <span><i class="fas fa-check text-emerald-400 mr-1"></i> Form 3: 7 Coursebooks</span>
          <span><i class="fas fa-check text-emerald-400 mr-1"></i> Form 4: 7 Coursebooks</span>
          <span><i class="fas fa-check text-emerald-400 mr-1"></i> Set Books: 7 Guides</span>
        </div>
      </div>
    </div>
  `;
}

/* ═══════════════════════════════════════════════════
   OFFLINE 8-4-4 BOOKS DATABASE
═══════════════════════════════════════════════════ */
export const BOOKS_844 = {
  // Portal route
  'dawamu://books-844': {
    title: '8-4-4 Form 3 & Form 4 Coursebook Library',
    type: 'books-portal',
    render: renderBooks844Portal
  },

  // ═══════════════════════════════════════════════════
  // FORM 3 COURSEBOOKS
  // ═══════════════════════════════════════════════════

  // 1. MATHEMATICS FORM 3
  'https://curriculum.dawamu.school/844/form3/mathematics': {
    domain: 'curriculum.dawamu.school',
    title: 'KLB Secondary Mathematics Form 3 - Dawamu Curriculum',
    category: 'Mathematics',
    summary: 'Comprehensive Form 3 Mathematics coursebook covering Quadratics II, Surds, Further Logarithms, Commercial Arithmetic II, Circles Chords & Tangents, Matrices, Variations, Sequences & Binomial Expansions.',
    render: () => {
      const book = BOOKS_844_CATALOG.find(b => b.id === 'f3-math');
      return `
        <div class="max-w-4xl mx-auto bg-white text-[#202122] p-8 rounded-2xl shadow-sm font-sans leading-relaxed">
          ${renderBookHeader(book, 'Form 3 Mathematics', 'Core Curriculum')}

          <!-- Table of Contents -->
          <div class="bg-slate-50 border border-slate-200 p-5 rounded-2xl mb-8">
            <h3 class="font-bold text-slate-800 text-sm mb-3 flex items-center gap-2">
              <i class="fas fa-list text-blue-600"></i> Course Syllabus & Chapters
            </h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div class="flex items-center gap-2 text-slate-700"><b>Ch 1:</b> Quadratic Expressions & Equations II</div>
              <div class="flex items-center gap-2 text-slate-700"><b>Ch 2:</b> Approximations & Errors</div>
              <div class="flex items-center gap-2 text-slate-700"><b>Ch 3:</b> Trigonometry III (Sine & Cosine Rules)</div>
              <div class="flex items-center gap-2 text-slate-700"><b>Ch 4:</b> Surds & Radical Operations</div>
              <div class="flex items-center gap-2 text-slate-700"><b>Ch 5:</b> Further Logarithms</div>
              <div class="flex items-center gap-2 text-slate-700"><b>Ch 6:</b> Commercial Arithmetic II (PAYE & Tax)</div>
              <div class="flex items-center gap-2 text-slate-700"><b>Ch 7:</b> Circles: Chords and Tangents</div>
              <div class="flex items-center gap-2 text-slate-700"><b>Ch 8:</b> Matrices (2x2 Inverses & Systems)</div>
              <div class="flex items-center gap-2 text-slate-700"><b>Ch 9:</b> Formulae and Variations</div>
              <div class="flex items-center gap-2 text-slate-700"><b>Ch 10:</b> Sequences and Series (AP & GP)</div>
              <div class="flex items-center gap-2 text-slate-700"><b>Ch 11:</b> Vectors II & Ratio Theorem</div>
              <div class="flex items-center gap-2 text-slate-700"><b>Ch 12:</b> Binomial Expansion & Pascal Triangle</div>
            </div>
          </div>

          <!-- CHAPTER 1: QUADRATIC EXPRESSIONS AND EQUATIONS II -->
          <section class="mb-10">
            <div class="border-b-2 border-blue-600 pb-2 mb-4">
              <span class="text-xs font-bold text-blue-600 uppercase">Chapter 1</span>
              <h2 class="text-xl font-bold text-slate-900">Quadratic Expressions and Equations II</h2>
            </div>
            
            <p class="text-sm mb-4">
              In Form 2, factorisation was introduced. In Form 3, we solve quadratic equations using the <b>Completing the Square Method</b> and the <b>Quadratic Formula</b>, and handle simultaneous equations where one is linear and the other quadratic.
            </p>

            <div class="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-r-xl my-4 text-xs font-mono">
              <div class="font-bold text-blue-900 mb-1">The Quadratic Formula:</div>
              <div class="text-base font-bold text-slate-800">x = [-b ± √(b² - 4ac)] / 2a</div>
              <div class="text-slate-600 mt-1">For any quadratic equation ax² + bx + c = 0 where a ≠ 0. The discriminant Δ = b² - 4ac determines the nature of roots.</div>
            </div>

            <div class="bg-slate-50 border border-slate-200 p-4 rounded-xl text-xs space-y-2 mb-4">
              <div class="font-bold text-slate-800">Worked KCSE Example 1:</div>
              <div class="text-slate-700">Solve by completing the square: <b>2x² - 7x + 3 = 0</b></div>
              <div class="pl-4 border-l-2 border-slate-300 space-y-1 font-mono text-[11px] text-slate-800">
                <div>Step 1: Divide by 2: x² - (7/2)x + 3/2 = 0</div>
                <div>Step 2: Move constant: x² - (7/2)x = -3/2</div>
                <div>Step 3: Add square of half the x-coefficient [(-7/4)² = 49/16]:</div>
                <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;x² - (7/2)x + 49/16 = -3/2 + 49/16 = 25/16</div>
                <div>Step 4: Factor left hand side: (x - 7/4)² = 25/16</div>
                <div>Step 5: Square root both sides: x - 7/4 = ±5/4</div>
                <div>Step 6: x = 7/4 + 5/4 = 12/4 = <b>3</b> &nbsp;OR&nbsp; x = 7/4 - 5/4 = 2/4 = <b>1/2</b></div>
              </div>
            </div>
          </section>

          <!-- CHAPTER 6: COMMERCIAL ARITHMETIC II (INCOME TAX) -->
          <section class="mb-10">
            <div class="border-b-2 border-emerald-600 pb-2 mb-4">
              <span class="text-xs font-bold text-emerald-600 uppercase">Chapter 6</span>
              <h2 class="text-xl font-bold text-slate-900">Commercial Arithmetic II: Taxation & Compound Interest</h2>
            </div>

            <p class="text-sm mb-4">
              Commercial Arithmetic in Form 3 focuses on Kenya Revenue Authority (KRA) graduated tax rates, personal tax reliefs, and compound interest calculations.
            </p>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-xs">
              <div class="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                <h4 class="font-bold text-emerald-900 mb-1">Compound Interest Formula</h4>
                <div class="font-mono text-sm font-bold text-emerald-800 my-1">A = P(1 + r/100)ⁿ</div>
                <p class="text-slate-600">Where <i>A</i> is accumulated amount, <i>P</i> is principal, <i>r</i> is annual interest rate, and <i>n</i> is number of compounding periods.</p>
              </div>

              <div class="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <h4 class="font-bold text-amber-900 mb-1">Pay As You Earn (PAYE) Rule</h4>
                <div class="font-mono text-sm font-bold text-amber-800 my-1">Net Tax = Gross Tax - Total Relief</div>
                <p class="text-slate-600">Personal relief (e.g. KSh 2,400/month or KSh 28,800/yr) is deducted from gross tax before arriving at net PAYE.</p>
              </div>
            </div>

            <div class="bg-slate-50 border border-slate-200 p-4 rounded-xl text-xs">
              <div class="font-bold text-slate-800 mb-1">KCSE Revision Note: Tax Slabs Calculation</div>
              <p class="text-slate-700 leading-relaxed">
                Always ensure you calculate tax band by band! For taxable income of KSh 36,000 per month:
                Band 1 (First 12,298 @ 10%) = KSh 1,229.80; Band 2 (Next 11,587 @ 15%) = KSh 1,738.05; Band 3 (Remaining 12,115 @ 20%) = KSh 2,423.00. 
                Gross Tax = 1,229.80 + 1,738.05 + 2,423.00 = KSh 5,390.85. Deducting Personal Relief of KSh 2,400 gives <b>Net Tax (PAYE) = KSh 2,990.85</b>.
              </p>
            </div>
          </section>

          <!-- CHAPTER 8: MATRICES -->
          <section class="mb-10">
            <div class="border-b-2 border-purple-600 pb-2 mb-4">
              <span class="text-xs font-bold text-purple-600 uppercase">Chapter 8</span>
              <h2 class="text-xl font-bold text-slate-900">Matrices & Simultaneous Equations</h2>
            </div>

            <p class="text-sm mb-3">
              A matrix is a rectangular array of numbers arranged in rows and columns. A 2x2 matrix <b>A = [a, b; c, d]</b> has:
            </p>

            <div class="bg-purple-50 p-4 rounded-xl border border-purple-200 font-mono text-xs mb-4">
              <div>Determinant: <b>det(A) = |A| = ad - bc</b></div>
              <div class="mt-1">Inverse Matrix: <b>A⁻¹ = (1 / |A|) × [d, -b; -c, a]</b> (provided |A| ≠ 0)</div>
              <div class="text-purple-800 mt-2 font-sans font-bold">If det(A) = 0, the matrix is Singular and has no inverse.</div>
            </div>
          </section>

          <!-- CHAPTER 10: SEQUENCES AND SERIES -->
          <section class="mb-8">
            <div class="border-b-2 border-indigo-600 pb-2 mb-4">
              <span class="text-xs font-bold text-indigo-600 uppercase">Chapter 10</span>
              <h2 class="text-xl font-bold text-slate-900">Sequences and Series (AP and GP)</h2>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div class="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <div class="font-bold text-slate-900 font-sans mb-1">Arithmetic Progression (AP)</div>
                <div>n-th term: <b>Tₙ = a + (n - 1)d</b></div>
                <div>Sum of n terms: <b>Sₙ = (n/2)[2a + (n - 1)d]</b></div>
                <div>Or: <b>Sₙ = (n/2)(a + L)</b> (where L is last term)</div>
              </div>
              <div class="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <div class="font-bold text-slate-900 font-sans mb-1">Geometric Progression (GP)</div>
                <div>n-th term: <b>Tₙ = arⁿ⁻¹</b></div>
                <div>Sum: <b>Sₙ = a(rⁿ - 1)/(r - 1)</b> for r > 1</div>
                <div>Sum to Infinity: <b>S∞ = a / (1 - r)</b> for |r| < 1</div>
              </div>
            </div>
          </section>

          <div class="bg-emerald-950 text-emerald-200 p-4 rounded-xl text-xs flex items-center justify-between">
            <div><b>Looking for Form 4 Mathematics?</b> Master Transformations, Calculus, and Statistics next.</div>
            <a href="https://curriculum.dawamu.school/844/form4/mathematics" class="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-lg shrink-0">Open Form 4 Math →</a>
          </div>
        </div>
      `;
    }
  },

  // 2. BIOLOGY FORM 3
  'https://curriculum.dawamu.school/844/form3/biology': {
    domain: 'curriculum.dawamu.school',
    title: 'KLB Secondary Biology Form 3 - Dawamu Curriculum',
    category: 'Biology',
    summary: 'Classification II (Dichotomous keys, 5 kingdoms), Ecology (Energy flow, nutrient cycles, population sampling), Reproduction in Plants & Animals (Menstrual cycle, floral organs), Growth & Development.',
    render: () => {
      const book = BOOKS_844_CATALOG.find(b => b.id === 'f3-bio');
      return `
        <div class="max-w-4xl mx-auto bg-white text-[#202122] p-8 rounded-2xl shadow-sm font-sans leading-relaxed">
          ${renderBookHeader(book, 'Form 3 Biology', 'Natural Sciences')}

          <!-- UNIT 1: CLASSIFICATION II -->
          <section class="mb-10">
            <div class="border-b-2 border-emerald-600 pb-2 mb-4">
              <span class="text-xs font-bold text-emerald-600 uppercase">Unit 1</span>
              <h2 class="text-xl font-bold text-slate-900">Classification II: Five Kingdoms & Dichotomous Keys</h2>
            </div>
            
            <p class="text-sm mb-4">
              Modern taxonomy divides living organisms into <b>Five Kingdoms</b>: Monera (bacteria), Protoctista (amoeba, paramecium, spirogyra), Fungi (mushrooms, yeast), Plantae (bryophytes, pteridophytes, gymnosperms, angiosperms), and Animalia.
            </p>

            <div class="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs mb-4">
              <h4 class="font-bold text-emerald-900 mb-1">Rules for Constructing a Dichotomous Key:</h4>
              <ul class="list-disc pl-5 space-y-1 text-slate-700">
                <li>Use observable, verifiable morphological features (e.g. number of legs, venation, floral parts).</li>
                <li>Avoid vague, subjective descriptions (e.g. "large vs small").</li>
                <li>Start with contrasting statements (couplets): 1a and 1b.</li>
                <li>If there are <i>n</i> specimens, the key must have exactly <b>n - 1</b> couplet steps.</li>
              </ul>
            </div>
          </section>

          <!-- UNIT 2: ECOLOGY -->
          <section class="mb-10">
            <div class="border-b-2 border-teal-600 pb-2 mb-4">
              <span class="text-xs font-bold text-teal-600 uppercase">Unit 2</span>
              <h2 class="text-xl font-bold text-slate-900">Ecology: Energy Flow, Cycles & Sampling</h2>
            </div>

            <p class="text-sm mb-4">
              Ecology is the study of the interrelationships between living organisms and their environment.
            </p>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs mb-4">
              <div class="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <div class="font-bold text-slate-900 mb-1"><i class="fas fa-recycle text-emerald-600 mr-1"></i> The Nitrogen Cycle</div>
                <p class="text-slate-600 leading-relaxed">
                  <b>1. Nitrogen Fixation:</b> Atmospheric N₂ fixed into nitrates by lightning and symbiotic bacteria (<i>Rhizobium</i> in root nodules of legumes) and free-living bacteria (<i>Azotobacter</i>).<br>
                  <b>2. Nitrification:</b> Ammonium ions oxidised to nitrites by <i>Nitrosomonas</i>, then to nitrates by <i>Nitrobacter</i>.<br>
                  <b>3. Denitrification:</b> Anaerobic <i>Pseudomonas denitrificans</i> converts nitrates back into atmospheric N₂.
                </p>
              </div>

              <div class="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <div class="font-bold text-slate-900 mb-1"><i class="fas fa-chart-pie text-blue-600 mr-1"></i> Population Estimation</div>
                <p class="text-slate-600 leading-relaxed">
                  <b>Capture-Mark-Release-Recapture (Lincoln Index):</b><br>
                  <span class="font-mono font-bold text-slate-800">Total Population (P) = (M × C) / R</span><br>
                  Where <b>M</b> = number caught and marked first; <b>C</b> = total number caught in second catch; <b>R</b> = marked number recaptured.
                </p>
              </div>
            </div>
          </section>

          <!-- UNIT 3: REPRODUCTION IN ANIMALS (MENSTRUAL CYCLE) -->
          <section class="mb-10">
            <div class="border-b-2 border-rose-600 pb-2 mb-4">
              <span class="text-xs font-bold text-rose-600 uppercase">Unit 3</span>
              <h2 class="text-xl font-bold text-slate-900">Reproduction: The Human Menstrual Cycle</h2>
            </div>

            <p class="text-sm mb-4">
              The menstrual cycle in human females averages 28 days and is precisely controlled by four interacting hormones:
            </p>

            <div class="overflow-x-auto text-xs">
              <table class="w-full border-collapse border border-slate-200">
                <thead>
                  <tr class="bg-slate-100 text-slate-800 font-bold">
                    <th class="border p-2 text-left">Hormone</th>
                    <th class="border p-2 text-left">Secreted By</th>
                    <th class="border p-2 text-left">Target Organ & Primary Function</th>
                  </tr>
                </thead>
                <tbody class="text-slate-700">
                  <tr>
                    <td class="border p-2 font-bold text-blue-800">FSH (Follicle Stimulating Hormone)</td>
                    <td class="border p-2">Anterior Pituitary Gland</td>
                    <td class="border p-2">Ovary: stimulates development of Graafian follicle and stimulates follicle cells to produce Oestrogen.</td>
                  </tr>
                  <tr class="bg-slate-50">
                    <td class="border p-2 font-bold text-rose-800">Oestrogen</td>
                    <td class="border p-2">Graafian Follicle (Ovary)</td>
                    <td class="border p-2">Uterus: heals and thickens the endometrium wall after menstruation; stimulates pituitary to release LH while inhibiting FSH.</td>
                  </tr>
                  <tr>
                    <td class="border p-2 font-bold text-amber-800">LH (Luteinising Hormone)</td>
                    <td class="border p-2">Anterior Pituitary Gland</td>
                    <td class="border p-2">Ovary: induces <b>ovulation (Day 14)</b>; causes remnants of follicle to develop into the yellow <b>Corpus Luteum</b>.</td>
                  </tr>
                  <tr class="bg-slate-50">
                    <td class="border p-2 font-bold text-emerald-800">Progesterone</td>
                    <td class="border p-2">Corpus Luteum</td>
                    <td class="border p-2">Uterus: maintains thick, vascularised endometrial lining ready for embryo implantation; inhibits FSH and LH.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <div class="bg-slate-900 text-slate-200 p-4 rounded-xl text-xs flex items-center justify-between">
            <div><b>Continue to Form 4 Biology:</b> Genetics II, Evolution, Nervous & Endocrine Coordination, Support & Movement.</div>
            <a href="https://curriculum.dawamu.school/844/form4/biology" class="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-lg shrink-0">Open Form 4 Biology →</a>
          </div>
        </div>
      `;
    }
  },

  // 3. CHEMISTRY FORM 3
  'https://curriculum.dawamu.school/844/form3/chemistry': {
    domain: 'curriculum.dawamu.school',
    title: 'KLB Secondary Chemistry Form 3 - Dawamu Curriculum',
    category: 'Chemistry',
    summary: 'Gas Laws, The Mole Concept & Stoichiometry, Organic Chemistry I (Hydrocarbons), Nitrogen & Compounds (Haber, Ostwald), Sulphur & Compounds (Frasch, Contact process), Chlorine.',
    render: () => {
      const book = BOOKS_844_CATALOG.find(b => b.id === 'f3-chem');
      return `
        <div class="max-w-4xl mx-auto bg-white text-[#202122] p-8 rounded-2xl shadow-sm font-sans leading-relaxed">
          ${renderBookHeader(book, 'Form 3 Chemistry', 'Physical Sciences')}

          <!-- CHAPTER 1: GAS LAWS -->
          <section class="mb-10">
            <div class="border-b-2 border-amber-600 pb-2 mb-4">
              <span class="text-xs font-bold text-amber-600 uppercase">Chapter 1</span>
              <h2 class="text-xl font-bold text-slate-900">The Gas Laws</h2>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs mb-4">
              <div class="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <div class="font-bold text-amber-900">Boyle's Law</div>
                <div class="font-mono text-xs my-1">P₁V₁ = P₂V₂</div>
                <div class="text-[11px] text-slate-600">At constant temperature, volume is inversely proportional to pressure.</div>
              </div>

              <div class="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <div class="font-bold text-amber-900">Charles's Law</div>
                <div class="font-mono text-xs my-1">V₁/T₁ = V₂/T₂</div>
                <div class="text-[11px] text-slate-600">At constant pressure, volume is directly proportional to absolute temp (K = °C + 273).</div>
              </div>

              <div class="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <div class="font-bold text-amber-900">Graham's Law</div>
                <div class="font-mono text-xs my-1">R₁/R₂ = √(M₂/M₁)</div>
                <div class="text-[11px] text-slate-600">Rate of diffusion is inversely proportional to square root of molar mass or density.</div>
              </div>
            </div>
          </section>

          <!-- CHAPTER 2: THE MOLE CONCEPT -->
          <section class="mb-10">
            <div class="border-b-2 border-orange-600 pb-2 mb-4">
              <span class="text-xs font-bold text-orange-600 uppercase">Chapter 2</span>
              <h2 class="text-xl font-bold text-slate-900">The Mole Concept & Volumetric Analysis</h2>
            </div>

            <p class="text-sm mb-4">
              The <b>mole</b> represents 6.022 × 10²³ particles (Avogadro's constant, L). One mole of any gas occupies <b>22.4 dm³ at s.t.p.</b> (or <b>24.0 dm³ at r.t.p.</b>).
            </p>

            <div class="bg-slate-50 border border-slate-200 p-4 rounded-xl text-xs space-y-2 mb-4">
              <div class="font-bold text-slate-900">Key Stoichiometry Relationships:</div>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-[11px]">
                <div class="p-2 bg-white rounded border">Moles = Mass (g) / Molar Mass (g/mol)</div>
                <div class="p-2 bg-white rounded border">Moles = Molarity (M) × Volume (cm³) / 1000</div>
                <div class="p-2 bg-white rounded border">Moles = Gas Volume (dm³) / 22.4 (s.t.p)</div>
              </div>
            </div>
          </section>

          <!-- CHAPTER 3: ORGANIC CHEMISTRY I -->
          <section class="mb-10">
            <div class="border-b-2 border-red-600 pb-2 mb-4">
              <span class="text-xs font-bold text-red-600 uppercase">Chapter 3</span>
              <h2 class="text-xl font-bold text-slate-900">Organic Chemistry I: Hydrocarbons</h2>
            </div>

            <div class="overflow-x-auto text-xs mb-4">
              <table class="w-full border-collapse border border-slate-200">
                <thead>
                  <tr class="bg-slate-100 text-slate-800 font-bold">
                    <th class="border p-2 text-left">Homologous Series</th>
                    <th class="border p-2 text-left">General Formula</th>
                    <th class="border p-2 text-left">Bonding</th>
                    <th class="border p-2 text-left">Characteristic Reaction</th>
                  </tr>
                </thead>
                <tbody class="text-slate-700">
                  <tr>
                    <td class="border p-2 font-bold text-blue-800">Alkanes (e.g. Methane, Ethane)</td>
                    <td class="border p-2 font-mono">CₙH₂ₙ₊₂</td>
                    <td class="border p-2">Saturated (single C-C bonds)</td>
                    <td class="border p-2">Substitution reactions with halogens in UV light</td>
                  </tr>
                  <tr class="bg-slate-50">
                    <td class="border p-2 font-bold text-emerald-800">Alkenes (e.g. Ethene)</td>
                    <td class="border p-2 font-mono">CₙH₂ₙ</td>
                    <td class="border p-2">Unsaturated (double C=C bond)</td>
                    <td class="border p-2">Addition reactions: decolourises brown bromine water instantly</td>
                  </tr>
                  <tr>
                    <td class="border p-2 font-bold text-purple-800">Alkynes (e.g. Ethyne)</td>
                    <td class="border p-2 font-mono">CₙH₂ₙ₋₂</td>
                    <td class="border p-2">Unsaturated (triple C≡C bond)</td>
                    <td class="border p-2">Addition reactions: burns with a luminous smoky flame</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <!-- CHAPTER 5: SULPHUR AND CONTACT PROCESS -->
          <section class="mb-8">
            <div class="border-b-2 border-yellow-600 pb-2 mb-4">
              <span class="text-xs font-bold text-yellow-600 uppercase">Chapter 5</span>
              <h2 class="text-xl font-bold text-slate-900">Sulphur: The Contact Process for H₂SO₄</h2>
            </div>

            <div class="bg-yellow-50 border border-yellow-200 p-4 rounded-xl text-xs space-y-2">
              <div class="font-bold text-yellow-900">The Contact Process Stages:</div>
              <div class="text-slate-700"><b>1.</b> S(s) + O₂(g) → SO₂(g)</div>
              <div class="text-slate-700"><b>2.</b> 2SO₂(g) + O₂(g) ⇌ 2SO₃(g) [Catalyst: V₂O₅, Temp: 450°C, Press: 2-3 atm, Exothermic ΔH = -197 kJ/mol]</div>
              <div class="text-slate-700"><b>3.</b> SO₃ is absorbed in 98% conc. H₂SO₄ (NOT water to prevent explosive misty acid spray): SO₃ + H₂SO₄ → H₂S₂O₇ (Oleum)</div>
              <div class="text-slate-700"><b>4.</b> Dilution of Oleum: H₂S₂O₇(l) + H₂O(l) → 2H₂SO₄(l)</div>
            </div>
          </section>

          <div class="bg-slate-900 text-slate-200 p-4 rounded-xl text-xs flex items-center justify-between">
            <div><b>Looking for Form 4 Chemistry?</b> Study Energy Changes, Electrochemistry, Metals extraction & Polymers next.</div>
            <a href="https://curriculum.dawamu.school/844/form4/chemistry" class="bg-amber-600 hover:bg-amber-500 text-white font-bold px-3 py-1.5 rounded-lg shrink-0">Open Form 4 Chem →</a>
          </div>
        </div>
      `;
    }
  },

  // 4. PHYSICS FORM 3
  'https://curriculum.dawamu.school/844/form3/physics': {
    domain: 'curriculum.dawamu.school',
    title: 'KLB Secondary Physics Form 3 - Dawamu Curriculum',
    category: 'Physics',
    summary: 'Linear Motion equations, Refraction of Light, Newton Laws of Motion, Work, Energy, Power & Machines, Current Electricity II (Ohm, E=V+Ir), Waves II, Electrostatics II & Capacitors, Heating Effect.',
    render: () => {
      const book = BOOKS_844_CATALOG.find(b => b.id === 'f3-phy');
      return `
        <div class="max-w-4xl mx-auto bg-white text-[#202122] p-8 rounded-2xl shadow-sm font-sans leading-relaxed">
          ${renderBookHeader(book, 'Form 3 Physics', 'Physical Sciences')}

          <!-- TOPIC 1: LINEAR MOTION -->
          <section class="mb-10">
            <div class="border-b-2 border-violet-600 pb-2 mb-4">
              <span class="text-xs font-bold text-violet-600 uppercase">Topic 1</span>
              <h2 class="text-xl font-bold text-slate-900">Linear Motion & Equations of Motion</h2>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono mb-4 text-center">
              <div class="p-3 bg-violet-50 border border-violet-200 rounded-xl">
                <div class="text-[10px] text-slate-500 font-sans font-bold">Equation 1</div>
                <div class="font-bold text-violet-900 text-sm mt-1">v = u + at</div>
              </div>
              <div class="p-3 bg-violet-50 border border-violet-200 rounded-xl">
                <div class="text-[10px] text-slate-500 font-sans font-bold">Equation 2</div>
                <div class="font-bold text-violet-900 text-sm mt-1">s = ut + ½at²</div>
              </div>
              <div class="p-3 bg-violet-50 border border-violet-200 rounded-xl">
                <div class="text-[10px] text-slate-500 font-sans font-bold">Equation 3</div>
                <div class="font-bold text-violet-900 text-sm mt-1">v² = u² + 2as</div>
              </div>
              <div class="p-3 bg-violet-50 border border-violet-200 rounded-xl">
                <div class="text-[10px] text-slate-500 font-sans font-bold">Equation 4</div>
                <div class="font-bold text-violet-900 text-sm mt-1">s = [(u+v)/2]t</div>
              </div>
            </div>
            <div class="text-xs text-slate-600">Where <i>u</i> = initial velocity (m/s), <i>v</i> = final velocity (m/s), <i>a</i> = acceleration (m/s²), <i>s</i> = displacement (m), <i>t</i> = time (s).</div>
          </section>

          <!-- TOPIC 4: WORK, ENERGY, POWER & SIMPLE MACHINES -->
          <section class="mb-10">
            <div class="border-b-2 border-indigo-600 pb-2 mb-4">
              <span class="text-xs font-bold text-indigo-600 uppercase">Topic 4</span>
              <h2 class="text-xl font-bold text-slate-900">Simple Machines & Efficiency</h2>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs mb-4">
              <div class="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <div class="font-bold text-slate-900 mb-1">Mechanical Advantage (M.A.)</div>
                <div class="font-mono text-sm font-bold text-indigo-800">M.A. = Load / Effort</div>
                <div class="text-[11px] text-slate-600 mt-1">Has no units. Decreases due to friction and weight of moving parts.</div>
              </div>

              <div class="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <div class="font-bold text-slate-900 mb-1">Velocity Ratio (V.R.)</div>
                <div class="font-mono text-sm font-bold text-indigo-800">V.R. = Dist(E) / Dist(L)</div>
                <div class="text-[11px] text-slate-600 mt-1">Determined purely by geometry of the machine (e.g. number of pulleys in a block & tackle).</div>
              </div>

              <div class="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <div class="font-bold text-slate-900 mb-1">Efficiency (η)</div>
                <div class="font-mono text-sm font-bold text-indigo-800">η = (M.A. / V.R.) × 100%</div>
                <div class="text-[11px] text-slate-600 mt-1">Always less than 100% in real life machines.</div>
              </div>
            </div>
          </section>

          <!-- TOPIC 5: CURRENT ELECTRICITY II -->
          <section class="mb-8">
            <div class="border-b-2 border-purple-600 pb-2 mb-4">
              <span class="text-xs font-bold text-purple-600 uppercase">Topic 5</span>
              <h2 class="text-xl font-bold text-slate-900">Current Electricity II: Internal Resistance & EMF</h2>
            </div>

            <div class="p-4 bg-purple-50 border border-purple-200 rounded-xl text-xs space-y-2 mb-4">
              <div class="font-bold text-purple-900 text-sm">Electromotive Force Equation:</div>
              <div class="font-mono text-base font-bold text-slate-800">E = V + Ir = I(R + r)</div>
              <div class="text-slate-600">
                Where <b>E</b> is EMF of the cell, <b>V</b> is terminal potential difference across external resistance <b>R</b>, and <b>Ir</b> is the internal "lost volts" across internal resistance <b>r</b>.
              </div>
            </div>
          </section>

          <div class="bg-slate-900 text-slate-200 p-4 rounded-xl text-xs flex items-center justify-between">
            <div><b>Continue to Form 4 Physics:</b> Thin Lenses, Electromagnetic Induction, Photoelectric Effect & CRO.</div>
            <a href="https://curriculum.dawamu.school/844/form4/physics" class="bg-violet-600 hover:bg-violet-500 text-white font-bold px-3 py-1.5 rounded-lg shrink-0">Open Form 4 Physics →</a>
          </div>
        </div>
      `;
    }
  },

  // 5. HISTORY & GOVERNMENT FORM 3
  'https://curriculum.dawamu.school/844/form3/history': {
    domain: 'curriculum.dawamu.school',
    title: 'KLB History & Government Form 3 - Dawamu Curriculum',
    category: 'History',
    summary: 'European Invasion & Berlin Conference 1884, Colonial Rule in Kenya, Resistance (Nandi, Agiryama) & Collaboration, Colonial Administration (Settlers, Kipande, Taxation), Mau Mau Struggle & Independence 1963.',
    render: () => {
      const book = BOOKS_844_CATALOG.find(b => b.id === 'f3-hist');
      return `
        <div class="max-w-4xl mx-auto bg-white text-[#202122] p-8 rounded-2xl shadow-sm font-sans leading-relaxed">
          ${renderBookHeader(book, 'Form 3 History & Government', 'Humanities')}

          <!-- CHAPTER 1: EUROPEAN INVASION -->
          <section class="mb-10">
            <div class="border-b-2 border-rose-600 pb-2 mb-4">
              <span class="text-xs font-bold text-rose-600 uppercase">Chapter 1 & 2</span>
              <h2 class="text-xl font-bold text-slate-900">European Scramble, Partition & Resistance in Kenya</h2>
            </div>

            <p class="text-sm mb-4">
              The <b>Berlin Conference of 1884–1885</b> convened by Otto von Bismarck set the ground rules for the partition of Africa, including the doctrine of "effective occupation."
            </p>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs mb-4">
              <div class="p-4 bg-rose-50 border border-rose-200 rounded-xl">
                <h4 class="font-bold text-rose-900 mb-1">Nandi Resistance (1895–1905)</h4>
                <p class="text-slate-700 leading-relaxed">
                  Led by Orkoiyot <b>Koitalel arap Samoei</b>. Fought for 10 years against British building the Uganda Railway through Nandi land. Ended in 1905 when Col. Richard Meinertzhagen treacherously shot Koitalel during a peace truce meeting.
                </p>
              </div>

              <div class="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <h4 class="font-bold text-amber-900 mb-1">Agiryama Resistance (1913–1914)</h4>
                <p class="text-slate-700 leading-relaxed">
                  Led by the prophetess <b>Mekatilili wa Menza</b> and elder Wanje wa Mwadorikola. Opposed British forced conscription of youth into the Carrier Corps during WWI, alienation of fertile Sabaki river lands, and taxation.
                </p>
              </div>
            </div>
          </section>

          <!-- CHAPTER 5: MAU MAU & STRUGGLE FOR INDEPENDENCE -->
          <section class="mb-8">
            <div class="border-b-2 border-red-700 pb-2 mb-4">
              <span class="text-xs font-bold text-red-700 uppercase">Chapter 5</span>
              <h2 class="text-xl font-bold text-slate-900">The Struggle for Independence & Mau Mau Movement</h2>
            </div>

            <div class="space-y-3 text-xs text-slate-700">
              <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <b class="text-slate-900">Mau Mau Armed Wing:</b> The Kenya Land and Freedom Army (KLFA) led by Field Marshal <b>Dedan Kimathi</b> in the Aberdares (Nyandarua) and General China (Waruhiu Itote) on Mt. Kenya.
              </div>
              <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <b class="text-slate-900">State of Emergency (October 20, 1952):</b> Declared by Governor Sir Evelyn Baring. The Kapenguria Six (Jomo Kenyatta, Bildad Kaggia, Kung'u Karumba, Fred Kubai, Paul Ngei, Achieng Oneko) were arrested and convicted in a sham trial.
              </div>
              <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <b class="text-slate-900">Lancaster House Conferences (1960, 1962, 1963):</b> Paved the way for majority rule, drawing the independence constitution. Internal self-government (Madaraka) achieved on <b>June 1, 1963</b>, and full Jamhuri independence on <b>December 12, 1963</b>.
              </div>
            </div>
          </section>
        </div>
      `;
    }
  },

  // 6. GEOGRAPHY FORM 3
  'https://curriculum.dawamu.school/844/form3/geography': {
    domain: 'curriculum.dawamu.school',
    title: 'KLB Secondary Geography Form 3 - Dawamu Curriculum',
    category: 'Geography',
    summary: 'External Land-Forming Processes: Weathering & Mass Wasting, Rivers & Hydrological Action, Glaciation (Cirques, Arêtes), Wind & Water in Arid Areas, Underground Water & Karst Landscapes.',
    render: () => {
      const book = BOOKS_844_CATALOG.find(b => b.id === 'f3-geog');
      return `
        <div class="max-w-4xl mx-auto bg-white text-[#202122] p-8 rounded-2xl shadow-sm font-sans leading-relaxed">
          ${renderBookHeader(book, 'Form 3 Geography', 'Humanities')}

          <!-- TOPIC 1: EXTERNAL LAND-FORMING PROCESSES -->
          <section class="mb-10">
            <div class="border-b-2 border-teal-600 pb-2 mb-4">
              <span class="text-xs font-bold text-teal-600 uppercase">Topic 1</span>
              <h2 class="text-xl font-bold text-slate-900">Weathering & Mass Wasting</h2>
            </div>
            
            <p class="text-sm mb-4">
              Weathering is the mechanical breakdown and chemical decomposition of rocks <i>in situ</i> (without movement).
            </p>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs mb-4">
              <div class="p-3 bg-teal-50 border border-teal-200 rounded-xl">
                <div class="font-bold text-teal-900 mb-1">Mechanical Weathering</div>
                <div class="text-slate-600">Exfoliation (onion-skin peeling in deserts), frost shattering (freeze-thaw in alpine peaks), salt crystallisation.</div>
              </div>
              <div class="p-3 bg-teal-50 border border-teal-200 rounded-xl">
                <div class="font-bold text-teal-900 mb-1">Chemical Weathering</div>
                <div class="text-slate-600">Carbonation (acid rain on limestone), oxidation (rusting of ferrous minerals), hydrolysis, hydration.</div>
              </div>
              <div class="p-3 bg-teal-50 border border-teal-200 rounded-xl">
                <div class="font-bold text-teal-900 mb-1">Mass Wasting</div>
                <div class="text-slate-600">Downslope movement of regolith under gravity: slow (soil creep, solifluction) vs rapid (landslides, mudflows).</div>
              </div>
            </div>
          </section>

          <!-- TOPIC 2: ACTION OF RIVERS -->
          <section class="mb-8">
            <div class="border-b-2 border-emerald-600 pb-2 mb-4">
              <span class="text-xs font-bold text-emerald-600 uppercase">Topic 2</span>
              <h2 class="text-xl font-bold text-slate-900">River Stages and Landforms</h2>
            </div>

            <div class="space-y-3 text-xs">
              <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <b class="text-emerald-800">1. Youthful / Upper Stage:</b> Steep gradient, high vertical erosion. Features: V-shaped valleys, gorges, waterfalls, rapids, interlocking spurs.
              </div>
              <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <b class="text-emerald-800">2. Mature / Middle Stage:</b> Moderate gradient, lateral erosion begins. Features: open U-shaped valley, river meanders, slip-off slopes.
              </div>
              <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <b class="text-emerald-800">3. Old / Lower Stage:</b> Gentle gradient, predominantly deposition. Features: floodplains, ox-bow lakes, natural levees, deferred junctions, and deltas (arcuate, bird's-foot, estuarine).
              </div>
            </div>
          </section>
        </div>
      `;
    }
  },

  // 7. BUSINESS STUDIES FORM 3
  'https://curriculum.dawamu.school/844/form3/business': {
    domain: 'curriculum.dawamu.school',
    title: 'KLB Business Studies Form 3 - Dawamu Curriculum',
    category: 'Business',
    summary: 'Demand & Supply (Elasticity, Equilibrium), Size & Location of Firm (Economies of Scale), Product Markets (Monopoly, Oligopoly), Chain of Distribution, National Income (GDP, GNP), Population & Employment.',
    render: () => {
      const book = BOOKS_844_CATALOG.find(b => b.id === 'f3-biz');
      return `
        <div class="max-w-4xl mx-auto bg-white text-[#202122] p-8 rounded-2xl shadow-sm font-sans leading-relaxed">
          ${renderBookHeader(book, 'Form 3 Business Studies', 'Humanities')}

          <!-- CHAPTER 1: DEMAND AND SUPPLY -->
          <section class="mb-10">
            <div class="border-b-2 border-cyan-600 pb-2 mb-4">
              <span class="text-xs font-bold text-cyan-600 uppercase">Chapter 1</span>
              <h2 class="text-xl font-bold text-slate-900">Demand, Supply and Market Equilibrium</h2>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs mb-4">
              <div class="p-4 bg-cyan-50 border border-cyan-200 rounded-xl">
                <h4 class="font-bold text-cyan-900 mb-1">Law of Demand</h4>
                <p class="text-slate-700 leading-relaxed">
                  Price and quantity demanded are inversely related (<i>ceteris paribus</i>). When price increases, quantity demanded decreases. Demand curve slopes downward from left to right.
                </p>
              </div>

              <div class="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <h4 class="font-bold text-blue-900 mb-1">Law of Supply</h4>
                <p class="text-slate-700 leading-relaxed">
                  Price and quantity supplied are directly related. As price increases, suppliers are willing to supply more. Supply curve slopes upward from left to right.
                </p>
              </div>
            </div>
          </section>

          <!-- CHAPTER 5: NATIONAL INCOME -->
          <section class="mb-8">
            <div class="border-b-2 border-blue-700 pb-2 mb-4">
              <span class="text-xs font-bold text-blue-700 uppercase">Chapter 5</span>
              <h2 class="text-xl font-bold text-slate-900">National Income Concepts & Measurement</h2>
            </div>

            <div class="space-y-2 text-xs">
              <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <b>Gross Domestic Product (GDP):</b> Total monetary value of all finished goods and services produced within the geographic borders of a country during one year.
              </div>
              <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <b>Gross National Product (GNP):</b> GDP + Net Factor Income from Abroad (NFIA) produced by citizens regardless of location.
              </div>
              <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <b>Three Measurement Approaches:</b> (1) Expenditure Method, (2) Income Method, (3) Value Added / Output Method.
              </div>
            </div>
          </section>
        </div>
      `;
    }
  },

  // ═══════════════════════════════════════════════════
  // FORM 4 COURSEBOOKS
  // ═══════════════════════════════════════════════════

  // 8. MATHEMATICS FORM 4
  'https://curriculum.dawamu.school/844/form4/mathematics': {
    domain: 'curriculum.dawamu.school',
    title: 'KLB Secondary Mathematics Form 4 - Dawamu Curriculum',
    category: 'Mathematics',
    summary: 'Matrices & Transformations (Shear, Stretch, Rotation, Enlargement), Statistics II (Standard Deviation, Ogive, Quartiles), 3D Geometry, Longitudes & Latitudes (Knots, Nautical miles), Linear Programming, Calculus (Differentiation & Integration).',
    render: () => {
      const book = BOOKS_844_CATALOG.find(b => b.id === 'f4-math');
      return `
        <div class="max-w-4xl mx-auto bg-white text-[#202122] p-8 rounded-2xl shadow-sm font-sans leading-relaxed">
          ${renderBookHeader(book, 'Form 4 Mathematics', 'KCSE Candidate Master')}

          <!-- CHAPTER 6: CALCULUS (DIFFERENTIATION & INTEGRATION) -->
          <section class="mb-10">
            <div class="border-b-2 border-blue-600 pb-2 mb-4">
              <span class="text-xs font-bold text-blue-600 uppercase">Chapter 6</span>
              <h2 class="text-xl font-bold text-slate-900">Calculus: Differentiation & Integration</h2>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono mb-4">
              <div class="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <div class="font-bold text-blue-900 font-sans mb-1">Differentiation (Gradient)</div>
                <div>Power Rule: <b>d/dx (axⁿ) = anxⁿ⁻¹</b></div>
                <div class="mt-2 text-slate-600 font-sans">
                  <b>Stationary / Turning Points:</b> Set dy/dx = 0.<br>
                  If d²y/dx² < 0 → Maximum Point.<br>
                  If d²y/dx² > 0 → Minimum Point.<br>
                  Kinematics: Velocity <b>v = ds/dt</b>, Acceleration <b>a = dv/dt = d²s/dt²</b>.
                </div>
              </div>

              <div class="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                <div class="font-bold text-emerald-900 font-sans mb-1">Integration (Area Under Curve)</div>
                <div>Indefinite: <b>∫ axⁿ dx = [axⁿ⁺¹ / (n + 1)] + c</b></div>
                <div class="mt-2 text-slate-600 font-sans">
                  <b>Definite Integral:</b> Area = ∫[a to b] y dx = [F(b) - F(a)].<br>
                  Trapezium Rule Approximation:<br>
                  <b>Area ≈ (h/2) [ (y₀ + yₙ) + 2(y₁ + y₂ + ... + yₙ₋₁) ]</b>
                </div>
              </div>
            </div>
          </section>

          <!-- CHAPTER 4: LONGITUDES AND LATITUDES -->
          <section class="mb-10">
            <div class="border-b-2 border-cyan-600 pb-2 mb-4">
              <span class="text-xs font-bold text-cyan-600 uppercase">Chapter 4</span>
              <h2 class="text-xl font-bold text-slate-900">Longitudes and Latitudes (Navigation)</h2>
            </div>

            <div class="bg-cyan-50 border border-cyan-200 p-4 rounded-xl text-xs space-y-2 mb-4 font-mono">
              <div>1. Distance along a Great Circle (Meridian or Equator):</div>
              <div class="text-slate-800 font-bold">&nbsp;&nbsp;&nbsp;D = (θ / 360) × 2πR &nbsp;&nbsp;OR&nbsp;&nbsp; D = 60θ Nautical Miles (nm)</div>
              <div>2. Distance along a Small Circle (Parallel of Latitude θ°):</div>
              <div class="text-slate-800 font-bold">&nbsp;&nbsp;&nbsp;D = (α / 360) × 2πR cosθ &nbsp;&nbsp;OR&nbsp;&nbsp; D = 60α cosθ Nautical Miles (nm)</div>
              <div class="text-cyan-900 font-sans mt-2"><b>Speed:</b> 1 Knot = 1 Nautical mile per hour (1 nm = 1.853 km). <b>Time:</b> 1° longitude difference = 4 minutes.</div>
            </div>
          </section>

          <!-- CHAPTER 2: STATISTICS II -->
          <section class="mb-8">
            <div class="border-b-2 border-indigo-600 pb-2 mb-4">
              <span class="text-xs font-bold text-indigo-600 uppercase">Chapter 2</span>
              <h2 class="text-xl font-bold text-slate-900">Statistics II: Standard Deviation & Ogives</h2>
            </div>

            <div class="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono space-y-1">
              <div>Mean: <b>x̄ = Σfx / Σf = A + (Σfd / Σf)</b> (where A is assumed mean)</div>
              <div>Variance: <b>s² = [Σfd² / Σf] - (Σfd / Σf)²</b></div>
              <div>Standard Deviation: <b>s = √(Variance)</b></div>
              <div class="font-sans text-slate-600 mt-2">Cumulative Frequency Curve (Ogive) allows reading median (Q₂), lower quartile (Q₁), upper quartile (Q₃), and interquartile range (IQR = Q₃ - Q₁).</div>
            </div>
          </section>
        </div>
      `;
    }
  },

  // 9. BIOLOGY FORM 4
  'https://curriculum.dawamu.school/844/form4/biology': {
    domain: 'curriculum.dawamu.school',
    title: 'KLB Secondary Biology Form 4 - Dawamu Curriculum',
    category: 'Biology',
    summary: 'Genetics II (Mutations, Pedigrees, Sex linkage, Biotechnology), Evolution (Lamarck vs Darwin Natural Selection, Homologous structures), Reception, Response & Coordination (Nervous system, Eye, Ear, Hormones), Support & Movement (Bones, Joints, Muscles).',
    render: () => {
      const book = BOOKS_844_CATALOG.find(b => b.id === 'f4-bio');
      return `
        <div class="max-w-4xl mx-auto bg-white text-[#202122] p-8 rounded-2xl shadow-sm font-sans leading-relaxed">
          ${renderBookHeader(book, 'Form 4 Biology', 'KCSE Candidate Master')}

          <!-- UNIT 1: GENETICS II -->
          <section class="mb-10">
            <div class="border-b-2 border-emerald-600 pb-2 mb-4">
              <span class="text-xs font-bold text-emerald-600 uppercase">Unit 1</span>
              <h2 class="text-xl font-bold text-slate-900">Genetics II: Mutations, Sex-Linkage & Pedigrees</h2>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs mb-4">
              <div class="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                <div class="font-bold text-emerald-900 mb-1">Sex-Linked Genes (on X Chromosome)</div>
                <p class="text-slate-700 leading-relaxed">
                  <b>Haemophilia</b> (failure of blood to clot) and <b>Red-Green Colour Blindness</b> are recessive traits on the X chromosome. Males (XY) have only one X chromosome and exhibit the condition if they inherit one mutant allele; females (XX) can be carriers (XᴴXʰ) or sufferers (XʰXʰ).
                </p>
              </div>

              <div class="p-4 bg-teal-50 border border-teal-200 rounded-xl">
                <div class="font-bold text-teal-900 mb-1">Mutations: Gene vs Chromosome</div>
                <p class="text-slate-700 leading-relaxed">
                  <b>Gene Mutations:</b> Base substitution (e.g. Sickle-cell anaemia where valine replaces glutamic acid), insertion, deletion.<br>
                  <b>Chromosomal Mutations:</b> Non-disjunction in meiosis gives aneuploidy: Down's Syndrome (Trisomy 21), Turner's (XO), Klinefelter's (XXY).
                </p>
              </div>
            </div>
          </section>

          <!-- UNIT 3: RECEPTION, RESPONSE & COORDINATION -->
          <section class="mb-10">
            <div class="border-b-2 border-green-700 pb-2 mb-4">
              <span class="text-xs font-bold text-green-700 uppercase">Unit 3</span>
              <h2 class="text-xl font-bold text-slate-900">Reception, Response & Coordination: Nervous System & Eye</h2>
            </div>

            <div class="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2 mb-4">
              <div class="font-bold text-slate-900">Eye Accommodation:</div>
              <div class="text-slate-700"><b>Focusing on Near Objects:</b> Ciliary muscles contract → suspensory ligaments slacken → crystalline lens becomes thick, round, more convex → increases refractive power.</div>
              <div class="text-slate-700"><b>Focusing on Distant Objects:</b> Ciliary muscles relax → suspensory ligaments become taut/tight → lens is pulled thin and flat → decreases refractive power.</div>
            </div>
          </section>

          <!-- UNIT 4: SUPPORT AND MOVEMENT -->
          <section class="mb-8">
            <div class="border-b-2 border-lime-600 pb-2 mb-4">
              <span class="text-xs font-bold text-lime-600 uppercase">Unit 4</span>
              <h2 class="text-xl font-bold text-slate-900">Support & Movement: Skeletons & Antagonistic Muscles</h2>
            </div>

            <p class="text-xs text-slate-700 leading-relaxed">
              Vertebrate movement relies on antagonistic muscle pairs working across synovial joints: to bend the arm at the elbow (hinge joint), the <b>biceps muscle contracts</b> while the <b>triceps relaxes</b>. To straighten the arm, the triceps contracts while biceps relaxes.
            </p>
          </section>
        </div>
      `;
    }
  },

  // 10. CHEMISTRY FORM 4
  'https://curriculum.dawamu.school/844/form4/chemistry': {
    domain: 'curriculum.dawamu.school',
    title: 'KLB Secondary Chemistry Form 4 - Dawamu Curriculum',
    category: 'Chemistry',
    summary: 'Energy Changes (Enthalpy, Hess Law, Calorimetry), Reaction Rates & Reversible Reactions (Equilibrium, Le Chatelier), Electrochemistry (Daniell cell, Hall-Heroult Aluminium extraction), Metals (Blast Furnace Iron, Copper), Organic Chemistry II (Alkanols, Esters, Soaps, Polymers), Radioactivity.',
    render: () => {
      const book = BOOKS_844_CATALOG.find(b => b.id === 'f4-chem');
      return `
        <div class="max-w-4xl mx-auto bg-white text-[#202122] p-8 rounded-2xl shadow-sm font-sans leading-relaxed">
          ${renderBookHeader(book, 'Form 4 Chemistry', 'KCSE Candidate Master')}

          <!-- CHAPTER 1: ENERGY CHANGES -->
          <section class="mb-10">
            <div class="border-b-2 border-amber-600 pb-2 mb-4">
              <span class="text-xs font-bold text-amber-600 uppercase">Chapter 1</span>
              <h2 class="text-xl font-bold text-slate-900">Energy Changes in Chemical Reactions & Hess's Law</h2>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs mb-4">
              <div class="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <div class="font-bold text-amber-900 mb-1">Calorimetry Formula</div>
                <div class="font-mono text-sm font-bold text-slate-800">ΔH = - (mcΔT) / moles</div>
                <p class="text-slate-600 mt-1">Where <i>m</i> = mass of solution (density 1 g/cm³), <i>c</i> = specific heat capacity (4.2 J/g/K), and <i>ΔT</i> = temp change.</p>
              </div>

              <div class="p-4 bg-orange-50 border border-orange-200 rounded-xl">
                <div class="font-bold text-orange-900 mb-1">Hess's Law</div>
                <p class="text-slate-600">
                  The enthalpy change for a chemical reaction is independent of the pathway taken, provided the initial and final states are identical.
                  <br><b>ΔH₁ = ΔH₂ + ΔH₃</b>
                </p>
              </div>
            </div>
          </section>

          <!-- CHAPTER 3: ELECTROCHEMISTRY -->
          <section class="mb-10">
            <div class="border-b-2 border-red-600 pb-2 mb-4">
              <span class="text-xs font-bold text-red-600 uppercase">Chapter 3</span>
              <h2 class="text-xl font-bold text-slate-900">Electrochemistry & Extraction of Aluminium</h2>
            </div>

            <div class="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2 mb-4">
              <div class="font-bold text-slate-900">Extraction of Aluminium (Hall-Héroult Process):</div>
              <ul class="list-disc pl-5 space-y-1 text-slate-700">
                <li><b>Ore:</b> Bauxite (Al₂O₃·2H₂O), purified to pure Alumina (Al₂O₃).</li>
                <li><b>Electrolyte:</b> Molten Al₂O₃ dissolved in molten <b>Cryolite (Na₃AlF₆)</b> to lower the melting point from 2050°C to ~950°C and improve electrical conductivity.</li>
                <li><b>Cathode (Carbon lining):</b> Al³⁺(l) + 3e⁻ → Al(l) (molten aluminium tapped from bottom).</li>
                <li><b>Anode (Carbon rods):</b> 2O²⁻(l) → O₂(g) + 4e⁻. The oxygen reacts with hot carbon anodes producing CO₂; anodes must be periodically replaced.</li>
              </ul>
            </div>
          </section>

          <!-- CHAPTER 5: ORGANIC CHEMISTRY II (SOAPS & DETERGENTS) -->
          <section class="mb-8">
            <div class="border-b-2 border-purple-600 pb-2 mb-4">
              <span class="text-xs font-bold text-purple-600 uppercase">Chapter 5</span>
              <h2 class="text-xl font-bold text-slate-900">Organic Chemistry II: Saponification & Detergents</h2>
            </div>

            <div class="p-4 bg-purple-50 border border-purple-200 rounded-xl text-xs text-slate-700 space-y-2">
              <div><b>Saponification:</b> Alkaline hydrolysis of vegetable oils or animal fats with boiling conc. NaOH:</div>
              <div class="font-mono text-slate-900 font-bold">Fat / Oil + 3NaOH → Glycerol (Propan-1,2,3-triol) + 3 Soap Molecules (Sodium Stearate)</div>
              <div><b>Precipitation:</b> Common salt (NaCl) is added ("salting out") to precipitate the soap.</div>
            </div>
          </section>
        </div>
      `;
    }
  },

  // 11. PHYSICS FORM 4
  'https://curriculum.dawamu.school/844/form4/physics': {
    domain: 'curriculum.dawamu.school',
    title: 'KLB Secondary Physics Form 4 - Dawamu Curriculum',
    category: 'Physics',
    summary: 'Thin Lenses (Formula 1/f = 1/u + 1/v, Microscope, Telescope), Uniform Circular Motion, Floating & Sinking (Archimedes), EM Spectrum, Electromagnetic Induction (Faraday, Lenz, Transformers), Mains Electricity, Cathode Rays & CRO, Photoelectric Effect, Radioactivity.',
    render: () => {
      const book = BOOKS_844_CATALOG.find(b => b.id === 'f4-phy');
      return `
        <div class="max-w-4xl mx-auto bg-white text-[#202122] p-8 rounded-2xl shadow-sm font-sans leading-relaxed">
          ${renderBookHeader(book, 'Form 4 Physics', 'KCSE Candidate Master')}

          <!-- TOPIC 1: THIN LENSES -->
          <section class="mb-10">
            <div class="border-b-2 border-indigo-600 pb-2 mb-4">
              <span class="text-xs font-bold text-indigo-600 uppercase">Topic 1</span>
              <h2 class="text-xl font-bold text-slate-900">Thin Lenses & Optical Instruments</h2>
            </div>

            <div class="p-4 bg-indigo-50 border border-indigo-200 rounded-xl text-xs font-mono space-y-2 mb-4">
              <div class="text-indigo-900 font-sans font-bold">The Lens Formula (Real-is-Positive convention):</div>
              <div class="text-base font-bold text-slate-800">1/f = 1/u + 1/v</div>
              <div class="text-slate-600 font-sans">Linear Magnification: <b>m = v / u = Image Height / Object Height</b>. Power in Dioptres: <b>P = 1 / f(in metres)</b>.</div>
            </div>
          </section>

          <!-- TOPIC 5: ELECTROMAGNETIC INDUCTION -->
          <section class="mb-10">
            <div class="border-b-2 border-violet-600 pb-2 mb-4">
              <span class="text-xs font-bold text-violet-600 uppercase">Topic 5</span>
              <h2 class="text-xl font-bold text-slate-900">Electromagnetic Induction & Transformers</h2>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs mb-4">
              <div class="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <div class="font-bold text-slate-900 mb-1">Faraday's & Lenz's Laws</div>
                <p class="text-slate-600 leading-relaxed">
                  <b>Faraday:</b> Induced EMF is directly proportional to rate of change of magnetic flux linkage.<br>
                  <b>Lenz:</b> Direction of induced current opposes the change producing it.
                </p>
              </div>

              <div class="p-4 bg-slate-50 border border-slate-200 rounded-xl font-mono">
                <div class="font-bold text-slate-900 font-sans mb-1">Ideal Transformer Equation</div>
                <div class="font-bold text-violet-900 text-sm">Vₛ / Vₚ = Nₛ / Nₚ = Iₚ / Iₛ</div>
                <div class="text-[11px] text-slate-600 font-sans mt-1">For 100% efficiency: Power In = Power Out (VₚIₚ = VₛIₛ).</div>
              </div>
            </div>
          </section>

          <!-- TOPIC 8: PHOTOELECTRIC EFFECT -->
          <section class="mb-8">
            <div class="border-b-2 border-purple-600 pb-2 mb-4">
              <span class="text-xs font-bold text-purple-600 uppercase">Topic 8</span>
              <h2 class="text-xl font-bold text-slate-900">The Photoelectric Effect</h2>
            </div>

            <div class="p-4 bg-purple-50 border border-purple-200 rounded-xl text-xs font-mono space-y-2">
              <div class="font-sans font-bold text-purple-900">Einstein's Photoelectric Equation:</div>
              <div class="text-base font-bold text-slate-800">hf = W₀ + ½mv²ₘₐₓ = hf₀ + eVₛ</div>
              <div class="font-sans text-slate-600">
                Where <i>hf</i> = photon energy, <i>W₀ = hf₀</i> = work function (minimum energy required to liberate electron from metal surface), <i>f₀</i> = threshold frequency, <i>Vₛ</i> = stopping potential.
              </div>
            </div>
          </section>
        </div>
      `;
    }
  },

  // 12. HISTORY & GOVERNMENT FORM 4
  'https://curriculum.dawamu.school/844/form4/history': {
    domain: 'curriculum.dawamu.school',
    title: 'KLB History & Government Form 4 - Dawamu Curriculum',
    category: 'History',
    summary: 'World War I & II, League of Nations & United Nations Organisation (UNO), Cold War & Non-Aligned Movement, Cooperation in Africa (OAU/AU, EAC, COMESA), National Philosophies (African Socialism, Harambee, Nyayoism), Post-Independence Kenya, Devolved Government & Public Finance.',
    render: () => {
      const book = BOOKS_844_CATALOG.find(b => b.id === 'f4-hist');
      return `
        <div class="max-w-4xl mx-auto bg-white text-[#202122] p-8 rounded-2xl shadow-sm font-sans leading-relaxed">
          ${renderBookHeader(book, 'Form 4 History & Government', 'KCSE Candidate Master')}

          <!-- CHAPTER 6: DEVOLVED GOVERNMENT IN KENYA -->
          <section class="mb-10">
            <div class="border-b-2 border-rose-600 pb-2 mb-4">
              <span class="text-xs font-bold text-rose-600 uppercase">Chapter 6</span>
              <h2 class="text-xl font-bold text-slate-900">Devolved Government under the 2010 Constitution</h2>
            </div>

            <div class="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs space-y-2 mb-4">
              <div class="font-bold text-rose-900">Structure of 47 County Governments:</div>
              <ul class="list-disc pl-5 space-y-1 text-slate-700">
                <li><b>County Executive:</b> Headed by County Governor, Deputy Governor, and CEC members (max 10).</li>
                <li><b>County Assembly:</b> Elected Ward MCAs, nominated members, and County Speaker. Makes county bylaws and exercises oversight over the Governor.</li>
                <li><b>Devolved Functions:</b> County health services (hospitals, dispensaries), agriculture & livestock, county transport & feeder roads, pre-primary education (ECDE), local trade licences.</li>
                <li><b>Revenue:</b> Minimum 15% equitable share of national audited revenue, plus Equalisation Fund (0.5%) for marginalised areas.</li>
              </ul>
            </div>
          </section>

          <!-- CHAPTER 2: UNITED NATIONS ORGANISATION -->
          <section class="mb-8">
            <div class="border-b-2 border-blue-600 pb-2 mb-4">
              <span class="text-xs font-bold text-blue-600 uppercase">Chapter 2</span>
              <h2 class="text-xl font-bold text-slate-900">International Relations: The United Nations (UN)</h2>
            </div>

            <p class="text-xs text-slate-700 leading-relaxed">
              Established on <b>October 24, 1945</b> in San Francisco after WWII. Key organs: General Assembly, Security Council (15 members; 5 permanent with veto power: USA, Russia, China, UK, France), International Court of Justice (The Hague), and Secretariat headed by the Secretary-General.
            </p>
          </section>
        </div>
      `;
    }
  },

  // 13. GEOGRAPHY FORM 4
  'https://curriculum.dawamu.school/844/form4/geography': {
    domain: 'curriculum.dawamu.school',
    title: 'KLB Secondary Geography Form 4 - Dawamu Curriculum',
    category: 'Geography',
    summary: 'Land Reclamation (Mwea Tebere, Zuiderzee Netherlands), Agriculture (Tea, Coffee, Canadian Wheat, Dairy), Forestry (Kenya vs Canada), Mining (Soda Ash Magadi, Titanium Kwale, Gold SA), Energy (Seven Forks HEP, Olkaria Geothermal), Industry (Kenya vs Japan), Transport & Trade.',
    render: () => {
      const book = BOOKS_844_CATALOG.find(b => b.id === 'f4-geog');
      return `
        <div class="max-w-4xl mx-auto bg-white text-[#202122] p-8 rounded-2xl shadow-sm font-sans leading-relaxed">
          ${renderBookHeader(book, 'Form 4 Geography', 'KCSE Candidate Master')}

          <!-- TOPIC 1: LAND RECLAMATION (MWEA TEBERE) -->
          <section class="mb-10">
            <div class="border-b-2 border-teal-600 pb-2 mb-4">
              <span class="text-xs font-bold text-teal-600 uppercase">Topic 1</span>
              <h2 class="text-xl font-bold text-slate-900">Land Reclamation: Mwea-Tebere vs Zuiderzee Polders</h2>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs mb-4">
              <div class="p-4 bg-teal-50 border border-teal-200 rounded-xl">
                <h4 class="font-bold text-teal-900 mb-1">Mwea-Tebere Irrigation Scheme (Kenya)</h4>
                <p class="text-slate-700 leading-relaxed">
                  Located in Kirinyaga County. Water drawn from rivers <b>Thiba and Nyamindi</b> via gravity canals. Produces Basmati paddy rice. Challenges: Bilharzia and malaria waterborne diseases, siltation of canals, price exploitation by middlemen.
                </p>
              </div>

              <div class="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <h4 class="font-bold text-blue-900 mb-1">Zuiderzee Project (Netherlands)</h4>
                <p class="text-slate-700 leading-relaxed">
                  Enclosing barrier dyke (Afsluitdijk) turned sea into freshwater Lake IJssel. Polders pumped dry with electric pumping stations, desalted using reed vegetation, creating high-tech horticultural agricultural land below sea level.
                </p>
              </div>
            </div>
          </section>

          <!-- TOPIC 5: ENERGY IN KENYA -->
          <section class="mb-8">
            <div class="border-b-2 border-amber-600 pb-2 mb-4">
              <span class="text-xs font-bold text-amber-600 uppercase">Topic 5</span>
              <h2 class="text-xl font-bold text-slate-900">Energy Resources: Hydro & Olkaria Geothermal</h2>
            </div>

            <p class="text-xs text-slate-700 leading-relaxed">
              <b>Geothermal Energy at Olkaria (Naivasha):</b> Harnesses underground volcanic steam at 300°C to drive KenGen turbo-generators. Clean, renewable, unaffected by drought, providing over 40% of Kenya's national grid baseload electricity.
            </p>
          </section>
        </div>
      `;
    }
  },

  // 14. BUSINESS STUDIES FORM 4
  'https://curriculum.dawamu.school/844/form4/business': {
    domain: 'curriculum.dawamu.school',
    title: 'KLB Business Studies Form 4 - Dawamu Curriculum',
    category: 'Business',
    summary: 'Financial Statements (Trading, Profit & Loss, Balance Sheet, Ratios), Money & Banking (Central Bank, Monetary Policy, Credit Creation), Public Finance (Canons of Taxation, National Budget), Inflation (Demand-pull, Cost-push), International Trade (Terms of Trade, Balance of Payments), Economic Planning.',
    render: () => {
      const book = BOOKS_844_CATALOG.find(b => b.id === 'f4-biz');
      return `
        <div class="max-w-4xl mx-auto bg-white text-[#202122] p-8 rounded-2xl shadow-sm font-sans leading-relaxed">
          ${renderBookHeader(book, 'Form 4 Business Studies', 'KCSE Candidate Master')}

          <!-- CHAPTER 1: FINANCIAL STATEMENTS & RATIOS -->
          <section class="mb-10">
            <div class="border-b-2 border-cyan-600 pb-2 mb-4">
              <span class="text-xs font-bold text-cyan-600 uppercase">Chapter 1</span>
              <h2 class="text-xl font-bold text-slate-900">Financial Statements & Accounting Ratios</h2>
            </div>

            <div class="p-4 bg-cyan-50 border border-cyan-200 rounded-xl text-xs font-mono space-y-1 mb-4">
              <div>Cost of Goods Sold (COGS) = Opening Stock + Purchases - Closing Stock</div>
              <div>Gross Profit = Net Sales - COGS</div>
              <div>Margin = (Gross Profit / Net Sales) × 100%</div>
              <div>Mark-up = (Gross Profit / COGS) × 100%</div>
              <div>Current Ratio = Current Assets / Current Liabilities (Ideal 2:1)</div>
              <div>Quick / Acid Test Ratio = (Current Assets - Closing Stock) / Current Liabilities (Ideal 1:1)</div>
            </div>
          </section>

          <!-- CHAPTER 2: MONEY AND BANKING -->
          <section class="mb-8">
            <div class="border-b-2 border-blue-700 pb-2 mb-4">
              <span class="text-xs font-bold text-blue-700 uppercase">Chapter 2</span>
              <h2 class="text-xl font-bold text-slate-900">Money, Banking & Monetary Policy</h2>
            </div>

            <p class="text-xs text-slate-700 leading-relaxed mb-3">
              The <b>Central Bank of Kenya (CBK)</b> controls money supply to combat inflation using monetary instruments:
              <b>1. Open Market Operations (OMO):</b> Selling Treasury Bills to mop up excess liquidity.
              <b>2. Cash Reserve Ratio (CRR):</b> Statutory percentage commercial banks must deposit with CBK.
              <b>3. Central Bank Rate (CBR):</b> Discount rate for commercial bank borrowing.
            </p>
          </section>
        </div>
      `;
    }
  },

  // ═══════════════════════════════════════════════════
  // KCSE LITERATURE & FASIHI SET BOOKS
  // ═══════════════════════════════════════════════════

  // 15. FATHERS OF NATIONS (Paul B. Vitta)
  'https://library.dawamu.school/setbooks/fathers-of-nations': {
    domain: 'library.dawamu.school',
    title: 'Fathers of Nations (Paul B. Vitta) - Official KCSE Study Guide',
    category: 'Literature',
    summary: 'Comprehensive KCSE Study Guide for Fathers of Nations: Banjul Summit, Way Omega vs Path Alpha, characters, themes of corruption and neo-colonialism, chapter breakdowns, sample essays.',
    render: () => {
      const book = BOOKS_844_CATALOG.find(b => b.id === 'set-fathers');
      return `
        <div class="max-w-4xl mx-auto bg-white text-[#202122] p-8 rounded-2xl shadow-sm font-sans leading-relaxed">
          ${renderBookHeader(book, 'Form 3 & 4 Literature', 'Compulsory KCSE Set Book')}

          <div class="bg-purple-50 border border-purple-200 p-5 rounded-2xl mb-8">
            <h3 class="font-bold text-purple-900 text-sm mb-2"><i class="fas fa-info-circle mr-1"></i> About the Novel & Setting</h3>
            <p class="text-xs text-slate-700 leading-relaxed">
              Set in <b>Banjul, The Gambia</b> at the luxurious Pinnacle Hotel. African heads of state gather for a continental summit to debate and adopt <b>Way Omega</b> (a development strategy backed by Western donor nations). Secretly, the Agency for Governance and Development in Africa (AGDA) sponsors four disenfranchised Africans under the guidance of Dr. Abiola Afolabi to introduce <b>Path Alpha</b>, prioritizing grassroots democracy, anti-corruption, and pan-African autonomy.
            </p>
          </div>

          <!-- THE FOUR KEY ADVOCATES OF PATH ALPHA -->
          <section class="mb-10">
            <div class="border-b-2 border-purple-600 pb-2 mb-4">
              <span class="text-xs font-bold text-purple-600 uppercase">Character Studies</span>
              <h2 class="text-xl font-bold text-slate-900">The Four Disillusioned African Patriots</h2>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div class="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <h4 class="font-bold text-purple-900 mb-1">1. Professor Karanja Kimani (Kenya)</h4>
                <p class="text-slate-700 leading-relaxed">
                  Senior economics lecturer at University of Nairobi. Suffers double tragedy: his daughter Atieno dies in a reckless road crash, and his wife Asiya leaves him for a wealthy corrupt politician, Newborn Walomu. Imprisoned after confronting the MP, he represents the victimized intellectual class.
                </p>
              </div>

              <div class="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <h4 class="font-bold text-purple-900 mb-1">2. Pastor Chineke Chiamaka (Nigeria)</h4>
                <p class="text-slate-700 leading-relaxed">
                  Fiery, fearless preacher in Lagos. Imprisoned and banned from preaching after condemning military misrule and police extortion from the pulpit. Represents the silenced religious and prophetic voice against tyranny.
                </p>
              </div>

              <div class="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <h4 class="font-bold text-purple-900 mb-1">3. Comrade Melusi (Zimbabwe)</h4>
                <p class="text-slate-700 leading-relaxed">
                  War veteran who fought alongside the post-independence leader. Cast aside into poverty in the Mucheke slums after independence, while the ruling elite amassed state wealth. Represents the betrayed liberation fighters.
                </p>
              </div>

              <div class="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <h4 class="font-bold text-purple-900 mb-1">4. Engineer Seif Tahir (Libya)</h4>
                <p class="text-slate-700 leading-relaxed">
                  Nuclear engineer who returned to Libya to build the national nuclear research facility, only for the state to abandon the program to please Western powers. Represents wasted technological potential in Africa.
                </p>
              </div>
            </div>
          </section>

          <!-- CORE THEMES -->
          <section class="mb-8">
            <div class="border-b-2 border-indigo-600 pb-2 mb-4">
              <span class="text-xs font-bold text-indigo-600 uppercase">Thematic Analysis</span>
              <h2 class="text-xl font-bold text-slate-900">Major Themes for KCSE Essays</h2>
            </div>

            <div class="space-y-3 text-xs text-slate-700">
              <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <b class="text-slate-900">1. Bad Governance and Dictatorship:</b> The heads of state are out of touch with citizens, dining lavishly at Pinnacle Hotel while ordinary citizens languish in poverty and police harassment.
              </div>
              <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <b class="text-slate-900">2. Betrayal and Disillusionment:</b> Independence failed to bring promised economic liberation. Patriots like Comrade Melusi and Prof. Kimani are sidelined by rapacious politicians.
              </div>
              <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <b class="text-slate-900">3. Neo-Colonialism & Foreign Meddling:</b> Way Omega perpetuates donor dependence. Real transformation demands homegrown African solutions (Path Alpha).
              </div>
            </div>
          </section>

          <div class="bg-purple-950 text-purple-200 p-4 rounded-xl text-xs">
            <b>Sample KCSE Essay Prompt:</b> "Poor leadership is the bane of African progress." Illustrate this statement using illustrations from Paul B. Vitta's <i>Fathers of Nations</i>.
          </div>
        </div>
      `;
    }
  },

  // 16. THE SAMARITAN (John Lara)
  'https://library.dawamu.school/setbooks/the-samaritan': {
    domain: 'library.dawamu.school',
    title: 'The Samaritan (John Lara) - Official KCSE Play Guide',
    category: 'Literature',
    summary: 'Comprehensive KCSE Play Guide for The Samaritan: Maracas Municipality corruption, Teacher Nicole, Mayor Mossi, Inspector Bembe, Alvita & Montano app innovation, themes and sample essays.',
    render: () => {
      const book = BOOKS_844_CATALOG.find(b => b.id === 'set-samaritan');
      return `
        <div class="max-w-4xl mx-auto bg-white text-[#202122] p-8 rounded-2xl shadow-sm font-sans leading-relaxed">
          ${renderBookHeader(book, 'Form 3 & 4 Literature', 'Compulsory KCSE Play')}

          <div class="bg-fuchsia-50 border border-fuchsia-200 p-5 rounded-2xl mb-8">
            <h3 class="font-bold text-fuchsia-900 text-sm mb-2"><i class="fas fa-theater-masks mr-1"></i> Dramatic Context & Plot Synopsis</h3>
            <p class="text-xs text-slate-700 leading-relaxed">
              At Sagrada Secondary School in Maracas Municipality, two students (<b>Montano and Alvita</b>) guided by their principled teacher <b>Nicole</b> innovate an anti-corruption mobile application christened <i>The Samaritan</i>. The app allows anonymous citizens to document and upload photographs and invoices proving embezzlement, nepotism, and substandard roads. Mayor Mossi and his corrupt council scramble in terror to silence Nicole, ultimately facing public arrest and prosecution.
            </p>
          </div>

          <!-- CHARACTER ANALYSIS -->
          <section class="mb-10">
            <div class="border-b-2 border-fuchsia-600 pb-2 mb-4">
              <span class="text-xs font-bold text-fuchsia-600 uppercase">Dramatis Personae</span>
              <h2 class="text-xl font-bold text-slate-900">Key Characters & Symbolism</h2>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div class="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <b class="text-fuchsia-950 font-bold text-sm block mb-1">Teacher Nicole</b>
                <p class="text-slate-700 leading-relaxed">
                  Moral compass of the play. Unbending, courageous, refuses Mossi's bribery and resists police intimidation when Bembe frames her with bogus trumped-up charges.
                </p>
              </div>

              <div class="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <b class="text-rose-950 font-bold text-sm block mb-1">Mayor Mossi</b>
                <p class="text-slate-700 leading-relaxed">
                  Arrogant mayor of Maracas. Confesses to rampant looting but blames greedy civic leaders and contractors. Panics when public exposure on The Samaritan app reaches national media.
                </p>
              </div>

              <div class="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <b class="text-amber-950 font-bold text-sm block mb-1">Inspector Bembe</b>
                <p class="text-slate-700 leading-relaxed">
                  Corrupt police chief who runs extortion cartels, illegal sugar distribution, and uses state coercion to persecute whistleblowers.
                </p>
              </div>

              <div class="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <b class="text-emerald-950 font-bold text-sm block mb-1">Alvita & Montano</b>
                <p class="text-slate-700 leading-relaxed">
                  Brilliant Sagrada students symbolizing the transformative power of African youth armed with modern digital technology.
                </p>
              </div>
            </div>
          </section>

          <!-- CORE THEMES -->
          <section class="mb-8">
            <div class="border-b-2 border-purple-700 pb-2 mb-4">
              <span class="text-xs font-bold text-purple-700 uppercase">Themes</span>
              <h2 class="text-xl font-bold text-slate-900">Key KCSE Examination Themes</h2>
            </div>

            <div class="space-y-2 text-xs text-slate-700">
              <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <b>1. Corruption and Impunity:</b> Substandard infrastructure, ghost workers, inflated supply tenders, and bribery across Maracas Municipality.
              </div>
              <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <b>2. Role of Technology in Civic Accountability:</b> The Samaritan app breaks the information monopoly of corrupt leaders, mobilizing collective citizen action.
              </div>
              <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <b>3. Integrity and Moral Courage:</b> Nicole's unwavering stand proves that principled individuals can defeat systemic tyranny.
              </div>
            </div>
          </section>
        </div>
      `;
    }
  },

  // 17. BEMBEA YA MAISHA (Timothy Arege)
  'https://library.dawamu.school/setbooks/bembea-ya-maisha': {
    domain: 'library.dawamu.school',
    title: 'Bembea ya Maisha (Timothy Arege) - Mwongozo wa KCSE',
    category: 'Kiswahili',
    summary: 'Mwongozo kamili wa tamthilia ya Bembea ya Maisha: maudhui ya ndoa, malezi, uvumilivu, mila na usasa, wahusika (Sara, Yona, Neema, Bunju, Asna), na maswali ya insha ya KCSE.',
    render: () => {
      const book = BOOKS_844_CATALOG.find(b => b.id === 'set-bembea');
      return `
        <div class="max-w-4xl mx-auto bg-white text-[#202122] p-8 rounded-2xl shadow-sm font-sans leading-relaxed">
          ${renderBookHeader(book, 'Kidato cha 3 & 4 Fasihi', 'Tamthilia Teule ya KCSE')}

          <div class="bg-rose-50 border border-rose-200 p-5 rounded-2xl mb-8">
            <h3 class="font-bold text-rose-900 text-sm mb-2"><i class="fas fa-feather-alt mr-1"></i> Utangulizi na Muktadha wa Tamthilia</h3>
            <p class="text-xs text-slate-700 leading-relaxed">
              <b>Bembea ya Maisha</b> ni tamthilia inayochora mabadiliko ya maisha ya familia ya Mzee Yona na mkewe Sara. Kama vile bembea inavyopanda juu na kushuka chini, maisha yao yanakumbwa na furaha na huzuni. Sara anaugua na kulazimika kusafiri mjini kwa binti yake Neema kwa matibabu, huku Yona akijuta jinsi ulevi na shinikizo la kijadi lilivyomfanya amnyanyase mkewe zamani kwa kutopata mtoto wa kiume.
            </p>
          </div>

          <!-- UCHAMBUZI WA WAHUSIKA -->
          <section class="mb-10">
            <div class="border-b-2 border-rose-600 pb-2 mb-4">
              <span class="text-xs font-bold text-rose-600 uppercase">Uchambuzi wa Wahusika</span>
              <h2 class="text-xl font-bold text-slate-900">Wahusika Wakuu</h2>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div class="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <b class="text-rose-950 font-bold text-sm block mb-1">Sara</b>
                <p class="text-slate-700 leading-relaxed">
                  Mke wa Yona. Mvumilivu, mwenye mapenzi ya dhati kwa mumewe na watoto licha ya kuugua maradhi ya moyo. Anasimama kidete kutetea elimu ya binti zake (Neema na Asna).
                </p>
              </div>

              <div class="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <b class="text-slate-950 font-bold text-sm block mb-1">Yona</b>
                <p class="text-slate-700 leading-relaxed">
                  Mwalimu mstaafu. Alitumbukia kwenye unywaji pombe baada ya kukejeliwa na wanakijiji kwa kutokuwa na mtoto wa kiume. Anazinduka na kutambua thamani ya mkewe na mafanikio ya binti zake.
                </p>
              </div>

              <div class="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <b class="text-purple-950 font-bold text-sm block mb-1">Neema</b>
                <p class="text-slate-700 leading-relaxed">
                  Binti mkubwa wa Sara na Yona. Ameelimika, ana kazi nzuri mjini, anawajibika kubeba mzigo wa matibabu ya mama yake licha ya misuguano ya ndoa yake na Bunju.
                </p>
              </div>

              <div class="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <b class="text-blue-950 font-bold text-sm block mb-1">Bunju</b>
                <p class="text-slate-700 leading-relaxed">
                  Mumewe Neema. Mtu mwenye msimamo mkali wa kanuni na bajeti. Anasaidia mkewe lakini anasisitiza kuwajibika kwa uangalifu bila kuangukia madeni.
                </p>
              </div>
            </div>
          </section>

          <!-- MAUDHUI MAKUU YA KCSE -->
          <section class="mb-8">
            <div class="border-b-2 border-red-700 pb-2 mb-4">
              <span class="text-xs font-bold text-red-700 uppercase">Maudhui</span>
              <h2 class="text-xl font-bold text-slate-900">Maudhui Makuu ya Mtihani</h2>
            </div>

            <div class="space-y-2 text-xs text-slate-700">
              <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <b>1. Mabadiliko (Jazanda ya Bembea):</b> Maisha hayana utulivu wa kudumu; leo uko chini kwenye dhiki, kesho unapanda kwenye faraja na mafanikio.
              </div>
              <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <b>2. Nafasi ya Mtoto wa Kike na Elimu:</b> Kinyume na imani potovu za kitamaduni zilizompendelea mtoto wa kiume, binti za Sara (Neema na Asna) ndio wanaoikomboa familia yao.
              </div>
              <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <b>3. Changamoto za Ndoa na Malezi:</b> Migogoro inayoletwa na ulevi, umaskini, na tofauti za malezi ya kijijini na maisha ya kisasa mjini.
              </div>
            </div>
          </section>
        </div>
      `;
    }
  },

  // 18. CHOZI LA HERI (Assumpta K. Matei)
  'https://library.dawamu.school/setbooks/chozi-la-heri': {
    domain: 'library.dawamu.school',
    title: 'Chozi la Heri (Assumpta K. Matei) - Mwongozo wa Riwaya ya KCSE',
    category: 'Kiswahili',
    summary: 'Mwongozo kamili wa Chozi la Heri: migogoro ya kikabila baada ya uchaguzi, wakimbizi msituni Mwanzi, wahusika (Ridhaa, Mwangeka, Selume, Subira), maudhui ya matumaini na maridhiano.',
    render: () => {
      const book = BOOKS_844_CATALOG.find(b => b.id === 'set-chozi');
      return `
        <div class="max-w-4xl mx-auto bg-white text-[#202122] p-8 rounded-2xl shadow-sm font-sans leading-relaxed">
          ${renderBookHeader(book, 'Kidato cha 3 & 4 Fasihi', 'Riwaya Teule ya KCSE')}

          <div class="bg-emerald-50 border border-emerald-200 p-5 rounded-2xl mb-8">
            <h3 class="font-bold text-emerald-900 text-sm mb-2"><i class="fas fa-book-reader mr-1"></i> Muktadha wa Riwaya</h3>
            <p class="text-xs text-slate-700 leading-relaxed">
              <b>Chozi la Heri</b> inaangazia maafa yanayotokana na uongozi mbaya na uhasama wa kisiasa nchini Wahafidhina. Baada ya uchaguzi mkuu, vita vya kikabila vinazuka na kusababisha kuchomwa kwa nyumba na majengo. Familia ya <b>Ridhaa</b> inateketezwa kwa moto, na maelfu ya wananchi wanakuwa wakimbizi katika msitu wa Mwanzi. Hata hivyo, riwaya inaleta ujumbe mzito wa ujenzi upya, maridhiano, na matumaini (chozi la majonzi kuwa chozi la heri).
            </p>
          </div>

          <section class="mb-8">
            <div class="border-b-2 border-emerald-700 pb-2 mb-4">
              <span class="text-xs font-bold text-emerald-700 uppercase">Maudhui ya KCSE</span>
              <h2 class="text-xl font-bold text-slate-900">Maudhui Makuu na Mafunzo</h2>
            </div>

            <div class="space-y-3 text-xs text-slate-700">
              <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <b>1. Madhara ya Vita vya Baada ya Uchaguzi:</b> Mauaji, upotevu wa mali, watoto kuwa mayatima, na uharibifu wa uchumi.
              </div>
              <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <b>2. Matumaini na Uvumilivu:</b> Licha ya majanga, Ridhaa na Mwangeka wanaendelea kuwasaidia mayatima na kujenga jamii mpya inayozingatia amani na utu.
              </div>
            </div>
          </section>
        </div>
      `;
    }
  },

  // 19. MAPAMBAZUKO YA MACHWEO NA HADITHI NYINGINE
  'https://library.dawamu.school/setbooks/mapambazuko-ya-machweo': {
    domain: 'library.dawamu.school',
    title: 'Mapambazuko ya Machweo na Hadithi Nyingine - Mwongozo wa KCSE',
    category: 'Kiswahili',
    summary: 'Uchambuzi wa Hadithi Teule za KCSE: Mapambazuko ya Machweo, Fadhila za Punda, Nizikeni Peke Yangu, Harubu ya Maisha, wahusika, migogoro, na mbinu za lugha.',
    render: () => {
      const book = BOOKS_844_CATALOG.find(b => b.id === 'set-mapambazuko');
      return `
        <div class="max-w-4xl mx-auto bg-white text-[#202122] p-8 rounded-2xl shadow-sm font-sans leading-relaxed">
          ${renderBookHeader(book, 'Kidato cha 3 & 4 Fasihi', 'Hadithi Fupi Teule')}

          <div class="bg-orange-50 border border-orange-200 p-5 rounded-2xl mb-8">
            <h3 class="font-bold text-orange-900 text-sm mb-2"><i class="fas fa-scroll mr-1"></i> Utangulizi wa Diwani ya Hadithi Fupi</h3>
            <p class="text-xs text-slate-700 leading-relaxed">
              Mkusanyiko wa hadithi fupi zenye maudhui ya maisha ya kijana wa kisasa barani Afrika: ufisadi, elimu, ndoto zilizovunjika, unyanyasaji wa watoto na mayatima, na ukombozi wa kijamii.
            </p>
          </div>

          <section class="space-y-4 text-xs">
            <div class="p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <h4 class="font-bold text-slate-900 text-sm mb-1">1. Mapambazuko ya Machweo</h4>
              <p class="text-slate-700 leading-relaxed">
                Inachambua mateso anayopitia Sabina kama yatima mikononi mwa wajomba na walezi wasio na huruma. Licha ya machungu, mwangaza mpya (mapambazuko) unazuka anapopata fursa ya kujiendeleza kimasomo.
              </p>
            </div>

            <div class="p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <h4 class="font-bold text-slate-900 text-sm mb-1">2. Fadhila za Punda</h4>
              <p class="text-slate-700 leading-relaxed">
                Maudhui ya usaliti na uaminifu: jinsi tendo la wema linavyolipwa kwa mabaya, lakini umuhimu wa kuendelea kutenda wema bila kukata tamaa.
              </p>
            </div>
          </section>
        </div>
      `;
    }
  },

  // 20. A DOLL'S HOUSE (Henrik Ibsen)
  'https://library.dawamu.school/setbooks/a-dolls-house': {
    domain: 'library.dawamu.school',
    title: 'A Doll\'s House (Henrik Ibsen) - KCSE Study Guide',
    category: 'Literature',
    summary: 'Complete study guide for A Doll\'s House by Henrik Ibsen: Nora Helmer, Torvald, Krogstad, Mrs. Linde, women\'s emancipation, the slammed door.',
    render: () => {
      const book = BOOKS_844_CATALOG.find(b => b.id === 'set-dolls-house');
      return `
        <div class="max-w-4xl mx-auto bg-white text-[#202122] p-8 rounded-2xl shadow-sm font-sans leading-relaxed">
          ${renderBookHeader(book, 'Form 3 & 4 Literature', 'Classic KCSE Play Guide')}

          <div class="bg-amber-50 border border-amber-200 p-5 rounded-2xl mb-8">
            <h3 class="font-bold text-amber-900 text-sm mb-2"><i class="fas fa-door-closed mr-1"></i> Plot Overview</h3>
            <p class="text-xs text-slate-700 leading-relaxed">
              Set in 19th-century Norway. Nora Helmer secretly forged her dying father's signature to secure a loan from Krogstad to save her husband Torvald's life during a severe illness. Years later, as Torvald becomes bank manager, Krogstad blackmails Nora. When Torvald discovers the secret, instead of gratitude he erupts in selfish rage fearing social disgrace. Realizing her marriage was merely a childish doll-house facade, Nora slams the door and walks out to discover her independent identity.
            </p>
          </div>

          <section class="space-y-3 text-xs text-slate-700 mb-8">
            <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <b>Nora's Awakening:</b> Evolves from Torvald's obedient "little skylark" and "squirrel" into an autonomous woman asserting her right to self-determination.
            </div>
            <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <b>The Slammed Door:</b> One of the most famous stage directions in modern theatre history, symbolising the rejection of patriarchal subjugation.
            </div>
          </section>
        </div>
      `;
    }
  },

  // 21. THE PEARL (John Steinbeck)
  'https://library.dawamu.school/setbooks/the-pearl': {
    domain: 'library.dawamu.school',
    title: 'The Pearl (John Steinbeck) - KCSE Study Guide',
    category: 'Literature',
    summary: 'Comprehensive study guide for The Pearl by John Steinbeck: Kino, Juana, Coyotito, the Pearl of the World, songs, themes of greed and destruction of innocence.',
    render: () => {
      const book = BOOKS_844_CATALOG.find(b => b.id === 'set-pearl');
      return `
        <div class="max-w-4xl mx-auto bg-white text-[#202122] p-8 rounded-2xl shadow-sm font-sans leading-relaxed">
          ${renderBookHeader(book, 'Form 3 & 4 Literature', 'Classic KCSE Novella')}

          <div class="bg-blue-50 border border-blue-200 p-5 rounded-2xl mb-8">
            <h3 class="font-bold text-blue-900 text-sm mb-2"><i class="fas fa-gem mr-1"></i> Novella Summary</h3>
            <p class="text-xs text-slate-700 leading-relaxed">
              In La Paz, Mexico, impoverished pearl diver Kino finds the greatest pearl in the world to pay a doctor after his infant son Coyotito is stung by a scorpion. Instead of liberation and education, the pearl arouses envy, greed, and violence. Kino is hunted, his canoe destroyed, his brush house burned, and Coyotito is tragically shot dead by trackers. Kino and Juana return to the village and cast the cursed pearl back into the depths of the Gulf.
            </p>
          </div>

          <section class="space-y-3 text-xs text-slate-700 mb-8">
            <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <b>The Songs of the Ancient People:</b> The Song of the Family (warmth, security), The Song of Evil (danger, scorpion, pearl buyers), The Song of the Pearl that might be.
            </div>
            <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <b>Theme of Greed:</b> Material wealth without moral anchoring breeds destruction. Juana wisely recognizes early on that "the pearl is evil; let us destroy it."
            </div>
          </section>
        </div>
      `;
    }
  }
};
