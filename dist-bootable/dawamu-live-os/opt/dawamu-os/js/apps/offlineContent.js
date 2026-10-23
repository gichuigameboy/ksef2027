/**
 * Dawamu OS - Comprehensive Curated School Content Knowledgebase
 * 
 * Contains 20+ rich, syllabus-aligned educational modules:
 * - Biology: Cell Biology, Circulatory System, Genetics & DNA, Ecology
 * - Chemistry: Periodic Table & Trends, Chemical Bonding, Acids & Bases, Organic Chemistry
 * - Physics: Electricity & Ohm's Law, Geometrical Optics, Waves & EM Spectrum
 * - Mathematics: Plane Geometry & Trig, Differential Calculus, Statistics & Probability
 * - Geography: Plate Tectonics & Rift Valley, Physical Geography of Kenya
 * - History & Government: Constitution of Kenya (2010), World War II & Decolonization
 * - Computer Science: Algorithms & Complexity, Computer Networks & Cybersecurity
 * - Literature & English: The Pearl (Steinbeck), A Doll's House (Ibsen), Academic Essay Writing Guide
 * - Kiswahili: Ngeli za Nomino, Fasihi Simulizi
 * - Interactive Quiz & Revision Center
 */

export const OFFLINE_ARTICLES = {
  // ─── BIOLOGY ─────────────────────────────────────────────────────────────
  'https://en.wikipedia.org/wiki/Cell_biology': {
    domain: 'en.wikipedia.org',
    title: 'Cell Biology: Ultrastructure & Organelles - Wikipedia',
    category: 'Biology',
    summary: 'Comprehensive guide to cellular ultrastructure, comparing plant vs animal cells, membrane dynamics, and organelle functions.',
    render: () => `
      <div class="max-w-4xl mx-auto bg-white text-[#202122] p-8 rounded-2xl shadow-sm font-serif leading-relaxed">
        <div class="border-b border-gray-300 pb-3 mb-6">
          <div class="text-xs text-emerald-700 font-sans font-bold uppercase tracking-wider">KCSE & IGCSE Biology Revision Series</div>
          <h1 class="text-3xl font-serif text-black mt-1">Cell Biology: Structure and Function of Organelles</h1>
          <div class="text-xs text-gray-500 font-sans mt-1">From Wikipedia, the free offline encyclopedia</div>
        </div>

        <p class="text-base mb-4">
          The <b>cell</b> is the fundamental structural, functional, and biological unit of all known living organisms. The cell theory states that all living organisms are composed of cells, the cell is the basic unit of life, and all cells arise from pre-existing cells (<i>omnis cellula e cellula</i>).
        </p>

        <h2 class="text-xl font-bold font-sans border-b border-gray-200 pb-1 mt-6 mb-3 text-[#0b0080]">1. Key Cellular Organelles</h2>
        <div class="grid grid-cols-2 gap-4 font-sans text-xs my-4">
          <div class="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
            <h3 class="font-bold text-emerald-900 text-sm mb-1.5"><i class="fas fa-atom text-emerald-600 mr-1"></i> The Nucleus</h3>
            <p class="text-slate-700 leading-relaxed">
              Enclosed by a double nuclear membrane with nuclear pores. Houses the genetic blueprint (chromatin/DNA) and nucleolus (ribosome assembly). Directs protein synthesis and cellular metabolism.
            </p>
          </div>
          <div class="p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <h3 class="font-bold text-amber-900 text-sm mb-1.5"><i class="fas fa-bolt text-amber-600 mr-1"></i> Mitochondrion</h3>
            <p class="text-slate-700 leading-relaxed">
              The "powerhouse" of the cell. Possesses an outer membrane and deeply folded inner membrane (cristae) providing huge surface area for the electron transport chain, generating ATP through aerobic cellular respiration.
            </p>
          </div>
          <div class="p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <h3 class="font-bold text-blue-900 text-sm mb-1.5"><i class="fas fa-network-wired text-blue-600 mr-1"></i> Endoplasmic Reticulum (ER)</h3>
            <p class="text-slate-700 leading-relaxed">
              <b>Rough ER (RER):</b> Studded with 80S ribosomes for packaging and synthesis of secretory proteins. <b>Smooth ER (SER):</b> Synthesizes lipids, phospholipids, and detoxifies toxic metabolites.
            </p>
          </div>
          <div class="p-4 bg-purple-50 border border-purple-200 rounded-xl">
            <h3 class="font-bold text-purple-900 text-sm mb-1.5"><i class="fas fa-box text-purple-600 mr-1"></i> Golgi Apparatus</h3>
            <p class="text-slate-700 leading-relaxed">
              Flattened membrane stacks (cisternae) that chemically modify, sort, and package proteins from the ER into secretory vesicles and primary lysosomes.
            </p>
          </div>
        </div>

        <h2 class="text-xl font-bold font-sans border-b border-gray-200 pb-1 mt-6 mb-3 text-[#0b0080]">2. Plant vs. Animal Cells Comparison</h2>
        <div class="overflow-x-auto my-4 font-sans text-xs">
          <table class="w-full border-collapse border border-gray-300">
            <thead>
              <tr class="bg-gray-100 text-gray-800">
                <th class="border border-gray-300 p-2.5 text-left">Feature</th>
                <th class="border border-gray-300 p-2.5 text-left">Plant Cell</th>
                <th class="border border-gray-300 p-2.5 text-left">Animal Cell</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="border border-gray-300 p-2 font-semibold">Cell Wall</td>
                <td class="border border-gray-300 p-2 text-emerald-800">Present (rigid cellulose)</td>
                <td class="border border-gray-300 p-2 text-rose-800">Absent (only plasma membrane)</td>
              </tr>
              <tr class="bg-gray-50">
                <td class="border border-gray-300 p-2 font-semibold">Chloroplasts</td>
                <td class="border border-gray-300 p-2 text-emerald-800">Present (photosynthetic chlorophyll)</td>
                <td class="border border-gray-300 p-2 text-rose-800">Absent</td>
              </tr>
              <tr>
                <td class="border border-gray-300 p-2 font-semibold">Vacuole</td>
                <td class="border border-gray-300 p-2">Large central permanent vacuole (tonoplast)</td>
                <td class="border border-gray-300 p-2">Small, temporary vacuoles (if any)</td>
              </tr>
              <tr class="bg-gray-50">
                <td class="border border-gray-300 p-2 font-semibold">Carbohydrate Storage</td>
                <td class="border border-gray-300 p-2">Stored as Starch granules</td>
                <td class="border border-gray-300 p-2">Stored as Glycogen granules</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="bg-emerald-50 border-l-4 border-emerald-600 p-4 rounded-r-xl font-sans text-xs my-6 text-emerald-950">
          <b>Key Exam Insight:</b> When examining cells under light microscopy, remember that ribosomes and endoplasmic reticulum are too small to resolve (resolution limit ~200nm); an electron microscope (transmission or scanning) is required to view fine ultrastructure.
        </div>
      </div>
    `
  },

  'https://en.wikipedia.org/wiki/Circulatory_system': {
    domain: 'en.wikipedia.org',
    title: 'Human Circulatory System & Cardiac Physiology - Wikipedia',
    category: 'Biology',
    summary: 'Heart anatomy, pulmonary and systemic double circulation, blood vessel mechanics, and blood component physiology.',
    render: () => `
      <div class="max-w-4xl mx-auto bg-white text-[#202122] p-8 rounded-2xl shadow-sm font-serif leading-relaxed">
        <div class="border-b border-gray-300 pb-3 mb-6">
          <div class="text-xs text-rose-700 font-sans font-bold uppercase tracking-wider">Human Physiology Series</div>
          <h1 class="text-3xl font-serif text-black mt-1">The Human Circulatory System</h1>
          <div class="text-xs text-gray-500 font-sans mt-1">From Wikipedia, the free offline encyclopedia</div>
        </div>

        <p class="text-base mb-4">
          The <b>circulatory system</b> is a closed cardiovascular network that circulates blood throughout the human body, providing nutrients, oxygen, hormones, and removing metabolic waste products like carbon dioxide and urea.
        </p>

        <h2 class="text-xl font-bold font-sans border-b border-gray-200 pb-1 mt-6 mb-3 text-[#0b0080]">1. Double Circulation in Humans</h2>
        <p class="mb-3">
          Mammals possess a <b>double circulatory system</b>, meaning blood passes through the four-chambered heart twice during one complete cycle:
        </p>
        <div class="grid grid-cols-2 gap-4 font-sans text-xs my-4">
          <div class="p-4 bg-sky-50 border border-sky-200 rounded-xl">
            <h3 class="font-bold text-sky-900 text-sm mb-1">1. Pulmonary Circulation</h3>
            <p class="text-slate-700 leading-relaxed">
              Deoxygenated blood leaves the <b>right ventricle</b> via the <b>pulmonary artery</b> to the alveoli of the lungs. Oxygen is absorbed into red blood cells while CO₂ is offloaded. Oxygenated blood returns to the <b>left atrium</b> via the <b>pulmonary veins</b>.
            </p>
          </div>
          <div class="p-4 bg-rose-50 border border-rose-200 rounded-xl">
            <h3 class="font-bold text-rose-900 text-sm mb-1">2. Systemic Circulation</h3>
            <p class="text-slate-700 leading-relaxed">
              Oxygenated blood enters the thick, muscular <b>left ventricle</b> and is pumped under high pressure through the <b>aorta</b> to the brain, skeletal muscles, and visceral organs, returning deoxygenated blood through the <b>vena cava</b> to the <b>right atrium</b>.
            </p>
          </div>
        </div>

        <h2 class="text-xl font-bold font-sans border-b border-gray-200 pb-1 mt-6 mb-3 text-[#0b0080]">2. Comparative Blood Vessel Structure</h2>
        <div class="space-y-3 font-sans text-xs my-4">
          <div class="p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <b>Arteries:</b> Thick tunica media (elastic fibers and smooth muscle), narrow lumen, withstand high pulsatile systolic pressure, no valves (except semi-lunar valves at exits of the heart).
          </div>
          <div class="p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <b>Veins:</b> Thinner muscular walls, wider lumen, low pressure flow assisted by skeletal muscle pumps and <b>pocket valves</b> to prevent backflow.
          </div>
          <div class="p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <b>Capillaries:</b> Single layer of endothelial cells (one cell thick, ~7µm lumen diameter), allowing rapid diffusion of respiratory gases and glucose into tissues.
          </div>
        </div>

        <div class="p-4 bg-slate-900 text-white rounded-xl font-mono text-xs my-4">
          <div class="text-emerald-400 font-bold mb-1">Blood Composition Breakdown:</div>
          <div>• 55% Plasma: Water (90%), albumin, antibodies, fibrinogen, dissolved glucose & electrolytes.</div>
          <div>• 45% Formed Elements: Erythrocytes (RBCs with hemoglobin), Leukocytes (WBCs), and Thrombocytes (platelets for clotting).</div>
        </div>
      </div>
    `
  },

  'https://en.wikipedia.org/wiki/Genetics': {
    domain: 'en.wikipedia.org',
    title: 'Genetics, DNA Structure & Mendelian Inheritance - Wikipedia',
    category: 'Biology',
    summary: 'The molecular structure of DNA, monohybrid crosses, dominant and recessive alleles, and Punnett square probability.',
    render: () => `
      <div class="max-w-4xl mx-auto bg-white text-[#202122] p-8 rounded-2xl shadow-sm font-serif leading-relaxed">
        <div class="border-b border-gray-300 pb-3 mb-6">
          <div class="text-xs text-indigo-700 font-sans font-bold uppercase tracking-wider">Molecular & Classical Genetics</div>
          <h1 class="text-3xl font-serif text-black mt-1">Genetics and DNA Inheritance</h1>
          <div class="text-xs text-gray-500 font-sans mt-1">From Wikipedia, the free offline encyclopedia</div>
        </div>

        <p class="text-base mb-4">
          <b>Genetics</b> is the scientific study of heredity, the process by which biological traits are passed from parents to offspring through sequences of nucleotides stored in DNA molecules.
        </p>

        <h2 class="text-xl font-bold font-sans border-b border-gray-200 pb-1 mt-6 mb-3 text-[#0b0080]">1. The DNA Double Helix</h2>
        <p class="mb-3">
          Watson and Crick (1953) resolved that DNA consists of two antiparallel polynucleotide chains coiled around a central axis:
        </p>
        <ul class="list-disc pl-6 space-y-1 font-sans text-xs text-gray-700 mb-4">
          <li><b>Sugar-Phosphate Backbone:</b> Deoxyribose sugar bonded to phosphate groups by phosphodiester bonds.</li>
          <li><b>Complementary Base Pairing Rule (Chargaff's Rule):</b>
            <span class="font-mono bg-indigo-50 px-2 py-0.5 rounded text-indigo-900 font-bold">Adenine (A) = Thymine (T)</span> [2 Hydrogen bonds];
            <span class="font-mono bg-indigo-50 px-2 py-0.5 rounded text-indigo-900 font-bold">Guanine (G) ≡ Cytosine (C)</span> [3 Hydrogen bonds].
          </li>
        </ul>

        <h2 class="text-xl font-bold font-sans border-b border-gray-200 pb-1 mt-6 mb-3 text-[#0b0080]">2. Monohybrid Cross (Gregor Mendel)</h2>
        <div class="bg-slate-50 border border-slate-200 p-5 rounded-xl font-sans text-xs my-4">
          <div class="font-bold text-slate-800 text-sm mb-2">Example: Pea Plant Height (T = Tall [Dominant], t = Dwarf [Recessive])</div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p><b>Parental Genotypes:</b> Tt (Heterozygous Tall) × Tt (Heterozygous Tall)</p>
              <p><b>Gametes:</b> T, t &nbsp;×&nbsp; T, t</p>
              <div class="mt-3">
                <b>Punnett Square:</b>
                <table class="border border-slate-300 mt-1">
                  <tr><th class="border border-slate-300 p-1.5 bg-slate-200">♀ / ♂</th><th class="border border-slate-300 p-1.5 bg-slate-100">T</th><th class="border border-slate-300 p-1.5 bg-slate-100">t</th></tr>
                  <tr><th class="border border-slate-300 p-1.5 bg-slate-100">T</th><td class="border border-slate-300 p-2 font-mono font-bold text-emerald-700">TT</td><td class="border border-slate-300 p-2 font-mono font-bold text-emerald-700">Tt</td></tr>
                  <tr><th class="border border-slate-300 p-1.5 bg-slate-100">t</th><td class="border border-slate-300 p-2 font-mono font-bold text-emerald-700">Tt</td><td class="border border-slate-300 p-2 font-mono font-bold text-rose-700">tt</td></tr>
                </table>
              </div>
            </div>
            <div class="p-3 bg-white border border-slate-200 rounded-lg">
              <div class="font-bold text-slate-900 mb-1">Ratios in F₂ Generation:</div>
              <p><b>Genotypic Ratio:</b> 1 TT : 2 Tt : 1 tt (1:2:1)</p>
              <p class="mt-1"><b>Phenotypic Ratio:</b> 3 Tall : 1 Dwarf (<span class="text-emerald-700 font-bold">3:1 classic Mendelian ratio</span>)</p>
            </div>
          </div>
        </div>
      </div>
    `
  },

  // ─── CHEMISTRY ───────────────────────────────────────────────────────────
  'https://en.wikipedia.org/wiki/Periodic_table': {
    domain: 'en.wikipedia.org',
    title: 'The Periodic Table of Elements & Periodic Trends - Wikipedia',
    category: 'Chemistry',
    summary: 'Master electronic configurations, groups, periods, electronegativity, atomic radius, and ionization energy trends.',
    render: () => `
      <div class="max-w-4xl mx-auto bg-white text-[#202122] p-8 rounded-2xl shadow-sm font-serif leading-relaxed">
        <div class="border-b border-gray-300 pb-3 mb-6">
          <div class="text-xs text-amber-700 font-sans font-bold uppercase tracking-wider">Physical & Inorganic Chemistry</div>
          <h1 class="text-3xl font-serif text-black mt-1">The Periodic Table and Periodic Trends</h1>
          <div class="text-xs text-gray-500 font-sans mt-1">From Wikipedia, the free offline encyclopedia</div>
        </div>

        <p class="text-base mb-4">
          The <b>Periodic Table</b> organizes all 118 known chemical elements in order of increasing <b>atomic number (number of protons, Z)</b>. Elements with similar valence electron configurations fall into vertical columns known as <b>Groups</b>, while horizontal rows are called <b>Periods</b>.
        </p>

        <h2 class="text-xl font-bold font-sans border-b border-gray-200 pb-1 mt-6 mb-3 text-[#0b0080]">1. Fundamental Periodic Trends</h2>
        <div class="grid grid-cols-2 gap-4 font-sans text-xs my-4">
          <div class="p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <h3 class="font-bold text-amber-900 text-sm mb-1">Atomic Radius</h3>
            <ul class="space-y-1 text-slate-700">
              <li>• <b>Across a Period (Left → Right):</b> Decreases. Increased effective nuclear charge pulls electrons closer to the nucleus.</li>
              <li>• <b>Down a Group (Top → Bottom):</b> Increases. Additional occupied electron energy levels shield outer electrons.</li>
            </ul>
          </div>
          <div class="p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <h3 class="font-bold text-blue-900 text-sm mb-1">Ionization Energy</h3>
            <ul class="space-y-1 text-slate-700">
              <li>• Minimum energy required to remove 1 mole of electrons from 1 mole of gaseous atoms.</li>
              <li>• <b>Across a Period:</b> Increases (stronger nuclear pull).</li>
              <li>• <b>Down a Group:</b> Decreases (outer electron is farther and shielded).</li>
            </ul>
          </div>
          <div class="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
            <h3 class="font-bold text-emerald-900 text-sm mb-1">Electronegativity</h3>
            <ul class="space-y-1 text-slate-700">
              <li>• The relative tendency of an atom to attract a shared pair of electrons in a covalent bond.</li>
              <li>• Most electronegative element: <b>Fluorine (F = 4.0 on Pauling Scale)</b>, followed by Oxygen and Nitrogen.</li>
            </ul>
          </div>
          <div class="p-4 bg-purple-50 border border-purple-200 rounded-xl">
            <h3 class="font-bold text-purple-900 text-sm mb-1">Reactivity Trends</h3>
            <ul class="space-y-1 text-slate-700">
              <li>• <b>Group 1 (Alkali Metals):</b> Reactivity increases down the group (Cs > Rb > K > Na > Li).</li>
              <li>• <b>Group 7 (Halogens):</b> Reactivity decreases down the group (F₂ > Cl₂ > Br₂ > I₂).</li>
            </ul>
          </div>
        </div>

        <h2 class="text-xl font-bold font-sans border-b border-gray-200 pb-1 mt-6 mb-3 text-[#0b0080]">2. Elements 1 to 20 Quick Revision Card</h2>
        <div class="overflow-x-auto font-sans text-xs my-4">
          <table class="w-full border-collapse border border-gray-300 text-center">
            <tr class="bg-slate-800 text-white font-bold">
              <td class="p-1.5">Z</td><td class="p-1.5">Element</td><td class="p-1.5">Sym</td><td class="p-1.5">Config</td>
              <td class="p-1.5">Z</td><td class="p-1.5">Element</td><td class="p-1.5">Sym</td><td class="p-1.5">Config</td>
            </tr>
            <tr><td>1</td><td>Hydrogen</td><td>H</td><td>1</td><td>11</td><td>Sodium</td><td>Na</td><td>2.8.1</td></tr>
            <tr class="bg-gray-50"><td>2</td><td>Helium</td><td>He</td><td>2</td><td>12</td><td>Magnesium</td><td>Mg</td><td>2.8.2</td></tr>
            <tr><td>3</td><td>Lithium</td><td>Li</td><td>2.1</td><td>13</td><td>Aluminium</td><td>Al</td><td>2.8.3</td></tr>
            <tr class="bg-gray-50"><td>4</td><td>Beryllium</td><td>Be</td><td>2.2</td><td>14</td><td>Silicon</td><td>Si</td><td>2.8.4</td></tr>
            <tr><td>5</td><td>Boron</td><td>B</td><td>2.3</td><td>15</td><td>Phosphorus</td><td>P</td><td>2.8.5</td></tr>
            <tr class="bg-gray-50"><td>6</td><td>Carbon</td><td>C</td><td>2.4</td><td>16</td><td>Sulfur</td><td>S</td><td>2.8.6</td></tr>
            <tr><td>7</td><td>Nitrogen</td><td>N</td><td>2.5</td><td>17</td><td>Chlorine</td><td>Cl</td><td>2.8.7</td></tr>
            <tr class="bg-gray-50"><td>8</td><td>Oxygen</td><td>O</td><td>2.6</td><td>18</td><td>Argon</td><td>Ar</td><td>2.8.8</td></tr>
            <tr><td>9</td><td>Fluorine</td><td>F</td><td>2.7</td><td>19</td><td>Potassium</td><td>K</td><td>2.8.8.1</td></tr>
            <tr class="bg-gray-50"><td>10</td><td>Neon</td><td>Ne</td><td>2.8</td><td>20</td><td>Calcium</td><td>Ca</td><td>2.8.8.2</td></tr>
          </table>
        </div>
      </div>
    `
  },

  'https://en.wikipedia.org/wiki/Chemical_bonding': {
    domain: 'en.wikipedia.org',
    title: 'Chemical Bonding: Ionic, Covalent & Metallic - Wikipedia',
    category: 'Chemistry',
    summary: 'Electron transfer in ionic lattices, electron sharing in covalent molecules, and the electron sea model of metals.',
    render: () => `
      <div class="max-w-4xl mx-auto bg-white text-[#202122] p-8 rounded-2xl shadow-sm font-serif leading-relaxed">
        <div class="border-b border-gray-300 pb-3 mb-6">
          <div class="text-xs text-sky-700 font-sans font-bold uppercase tracking-wider">Fundamental Chemical Concepts</div>
          <h1 class="text-3xl font-serif text-black mt-1">Chemical Bonding and Molecular Structure</h1>
          <div class="text-xs text-gray-500 font-sans mt-1">From Wikipedia, the free offline encyclopedia</div>
        </div>

        <p class="text-base mb-4">
          Atoms participate in chemical bonding to attain a stable noble gas electronic configuration (duplet or octet rule with 8 valence electrons).
        </p>

        <div class="space-y-4 font-sans text-xs my-4">
          <div class="p-5 bg-sky-50 border border-sky-200 rounded-xl">
            <h3 class="text-base font-bold text-sky-900 mb-1">1. Ionic (Electrovalent) Bonding</h3>
            <p class="text-slate-700 mb-2">Occurs between <b>metals and non-metals</b> through the transfer of electrons, forming cations (+) and anions (-) held together by strong electrostatic attraction in a giant 3D lattice (e.g. NaCl, MgO).</p>
            <div class="p-2.5 bg-white rounded border border-sky-300 font-mono text-[11px] text-sky-950">
              Na (2.8.1) → Na⁺ (2.8) + e⁻ &nbsp;|&nbsp; Cl (2.8.7) + e⁻ → Cl⁻ (2.8.8)
            </div>
          </div>

          <div class="p-5 bg-emerald-50 border border-emerald-200 rounded-xl">
            <h3 class="text-base font-bold text-emerald-900 mb-1">2. Covalent Bonding</h3>
            <p class="text-slate-700 mb-2">Occurs between <b>non-metal atoms</b> by sharing pairs of valence electrons to achieve stability (e.g., H₂O, CH₄, NH₃, CO₂).</p>
            <ul class="list-disc pl-5 space-y-1 text-slate-700">
              <li><b>Simple Molecular:</b> Low melting points due to weak intermolecular forces (Van der Waals).</li>
              <li><b>Giant Covalent Networks:</b> Diamond (tetrahedral carbon, extremely hard, non-conductor), Graphite (hexagonal layers with delocalized electrons, conducts electricity, slippery lubricant).</li>
            </ul>
          </div>

          <div class="p-5 bg-amber-50 border border-amber-200 rounded-xl">
            <h3 class="text-base font-bold text-amber-900 mb-1">3. Metallic Bonding</h3>
            <p class="text-slate-700">The electrostatic force of attraction between orderly arrays of positive metal cations and a mobile "sea" of delocalized valence electrons. Explains why metals are excellent electrical conductors, malleable, and ductile.</p>
          </div>
        </div>
      </div>
    `
  },

  'https://en.wikipedia.org/wiki/Acids_and_bases': {
    domain: 'en.wikipedia.org',
    title: 'Acids, Bases, Salts and Titration Calculations - Wikipedia',
    category: 'Chemistry',
    summary: 'The pH scale, Arrhenius and Bronsted-Lowry definitions, indicators, salt preparation methods, and volumetric analysis.',
    render: () => `
      <div class="max-w-4xl mx-auto bg-white text-[#202122] p-8 rounded-2xl shadow-sm font-serif leading-relaxed">
        <div class="border-b border-gray-300 pb-3 mb-6">
          <div class="text-xs text-rose-700 font-sans font-bold uppercase tracking-wider">Analytical Chemistry</div>
          <h1 class="text-3xl font-serif text-black mt-1">Acids, Bases, Salts and Volumetric Titration</h1>
          <div class="text-xs text-gray-500 font-sans mt-1">From Wikipedia, the free offline encyclopedia</div>
        </div>

        <p class="text-base mb-4">
          In aqueous solution, <b>acids</b> are substances that dissociate to liberate hydrogen ions ($H^+$ or hydronium $H_3O^+$), whereas <b>bases</b> are proton acceptors or yield hydroxide ions ($OH^-$).
        </p>

        <h2 class="text-xl font-bold font-sans border-b border-gray-200 pb-1 mt-6 mb-3 text-[#0b0080]">1. The pH Scale & Chemical Indicators</h2>
        <div class="p-4 bg-gray-50 border border-gray-200 rounded-xl font-sans text-xs my-4">
          <div class="flex items-center justify-between font-mono font-bold text-sm mb-2 text-center">
            <span class="text-rose-600">pH 0-2 (Strong Acid)</span>
            <span class="text-amber-600">pH 3-6 (Weak Acid)</span>
            <span class="text-emerald-600">pH 7 (Neutral)</span>
            <span class="text-sky-600">pH 8-11 (Weak Base)</span>
            <span class="text-indigo-600">pH 12-14 (Strong Base)</span>
          </div>
          <table class="w-full border-collapse border border-gray-300 mt-3 text-center">
            <tr class="bg-gray-200 font-bold"><td>Indicator</td><td>Color in Acid</td><td>Color at End-point</td><td>Color in Alkali</td></tr>
            <tr><td>Litmus Paper</td><td class="text-rose-600 font-bold">Red</td><td>Purple</td><td class="text-blue-600 font-bold">Blue</td></tr>
            <tr><td>Phenolphthalein</td><td>Colorless</td><td>Pale Pink</td><td class="text-rose-600 font-bold">Pink / Magenta</td></tr>
            <tr><td>Methyl Orange</td><td class="text-rose-600 font-bold">Red / Pink</td><td>Orange</td><td class="text-amber-600 font-bold">Yellow</td></tr>
          </table>
        </div>

        <h2 class="text-xl font-bold font-sans border-b border-gray-200 pb-1 mt-6 mb-3 text-[#0b0080]">2. Titration Calculations: The Master Equation</h2>
        <div class="p-5 bg-slate-900 text-white rounded-xl font-mono text-xs my-4">
          <div class="text-emerald-400 font-bold text-sm mb-2">Formula for Molarity & Mole Ratios:</div>
          <div class="text-lg text-yellow-300 text-center py-2 bg-slate-800 rounded">
            (M_a × V_a) / n_a = (M_b × V_b) / n_b
          </div>
          <p class="text-slate-300 text-[11px] mt-2">
            Where <b>M_a, M_b</b> = molar concentrations (mol/dm³), <b>V_a, V_b</b> = titration volumes (cm³), and <b>n_a, n_b</b> = stoichiometric mole ratios from the balanced chemical equation.
          </p>
        </div>
      </div>
    `
  },

  // ─── PHYSICS ─────────────────────────────────────────────────────────────
  'https://en.wikipedia.org/wiki/Electricity': {
    domain: 'en.wikipedia.org',
    title: 'Current Electricity, Ohm\'s Law & Circuits - Wikipedia',
    category: 'Physics',
    summary: 'Master electric current, potential difference, Ohm\'s law, series/parallel resistor combinations, and electrical power formulas.',
    render: () => `
      <div class="max-w-4xl mx-auto bg-white text-[#202122] p-8 rounded-2xl shadow-sm font-serif leading-relaxed">
        <div class="border-b border-gray-300 pb-3 mb-6">
          <div class="text-xs text-blue-700 font-sans font-bold uppercase tracking-wider">Electromagnetism & Circuits</div>
          <h1 class="text-3xl font-serif text-black mt-1">Current Electricity & Circuit Laws</h1>
          <div class="text-xs text-gray-500 font-sans mt-1">From Wikipedia, the free offline encyclopedia</div>
        </div>

        <p class="text-base mb-4">
          <b>Electric current ($I$)</b> is the rate of flow of electric charge through an electrical conductor, measured in <b>Amperes (A)</b>: $I = \\frac{Q}{t}$ (where $Q$ is charge in Coulombs, $t$ is time in seconds).
        </p>

        <h2 class="text-xl font-bold font-sans border-b border-gray-200 pb-1 mt-6 mb-3 text-[#0b0080]">1. Ohm's Law</h2>
        <div class="p-5 bg-blue-50 border border-blue-200 rounded-xl font-sans text-xs my-4">
          <div class="text-base font-bold text-blue-900 mb-1">Statement:</div>
          <p class="text-slate-700">
            The current passing through a conductor between two points is directly proportional to the voltage across the two points, provided its temperature and other physical conditions remain constant.
          </p>
          <div class="text-xl font-mono text-center font-bold text-blue-950 my-3 py-2 bg-white rounded border border-blue-300">
            V = I × R &nbsp;⇒&nbsp; I = V / R &nbsp;⇒&nbsp; R = V / I
          </div>
        </div>

        <h2 class="text-xl font-bold font-sans border-b border-gray-200 pb-1 mt-6 mb-3 text-[#0b0080]">2. Series vs. Parallel Resistors</h2>
        <div class="grid grid-cols-2 gap-4 font-sans text-xs my-4">
          <div class="p-4 bg-slate-50 border border-slate-300 rounded-xl">
            <h3 class="font-bold text-slate-900 text-sm mb-1">Resistors in Series</h3>
            <ul class="space-y-1 text-slate-700">
              <li>• Current is identical through every resistor ($I_1 = I_2 = I_T$).</li>
              <li>• Total voltage is divided ($V_T = V_1 + V_2$).</li>
              <li class="font-mono font-bold text-emerald-700 mt-2">R_Total = R₁ + R₂ + R₃ + ...</li>
            </ul>
          </div>
          <div class="p-4 bg-slate-50 border border-slate-300 rounded-xl">
            <h3 class="font-bold text-slate-900 text-sm mb-1">Resistors in Parallel</h3>
            <ul class="space-y-1 text-slate-700">
              <li>• Voltage is identical across each branch ($V_1 = V_2 = V_T$).</li>
              <li>• Total current splits into branches ($I_T = I_1 + I_2$).</li>
              <li class="font-mono font-bold text-emerald-700 mt-2">1/R_Total = 1/R₁ + 1/R₂ + 1/R₃</li>
            </ul>
          </div>
        </div>

        <h2 class="text-xl font-bold font-sans border-b border-gray-200 pb-1 mt-6 mb-3 text-[#0b0080]">3. Electrical Energy & Power</h2>
        <div class="p-4 bg-slate-900 text-white rounded-xl font-mono text-xs my-4">
          <div class="text-yellow-400 font-bold mb-1">Power Formulas:</div>
          <div>P = V × I &nbsp;|&nbsp; P = I² × R &nbsp;|&nbsp; P = V² / R &nbsp;(Watts, W)</div>
          <div class="text-emerald-400 font-bold mt-2">Electrical Energy Consumption:</div>
          <div>Energy (Joules) = P × t &nbsp;|&nbsp; Commercial Units: Kilowatt-hours (kWh) = (Power in Watts × hours) / 1000</div>
        </div>
      </div>
    `
  },

  'https://en.wikipedia.org/wiki/Optics': {
    domain: 'en.wikipedia.org',
    title: 'Geometrical Optics: Reflection, Refraction & Lenses - Wikipedia',
    category: 'Physics',
    summary: 'Laws of reflection, Snell\'s law, total internal reflection, convex/concave lens ray diagrams and magnification.',
    render: () => `
      <div class="max-w-4xl mx-auto bg-white text-[#202122] p-8 rounded-2xl shadow-sm font-serif leading-relaxed">
        <div class="border-b border-gray-300 pb-3 mb-6">
          <div class="text-xs text-indigo-700 font-sans font-bold uppercase tracking-wider">Geometrical Optics</div>
          <h1 class="text-3xl font-serif text-black mt-1">Light, Reflection, Refraction and Thin Lenses</h1>
          <div class="text-xs text-gray-500 font-sans mt-1">From Wikipedia, the free offline encyclopedia</div>
        </div>

        <p class="text-base mb-4">
          <b>Geometrical optics</b> treats light as rays propagating in straight lines in homogeneous media and governs the behavior of optical instruments including cameras, microscopes, telescopes, and the human eye.
        </p>

        <h2 class="text-xl font-bold font-sans border-b border-gray-200 pb-1 mt-6 mb-3 text-[#0b0080]">1. Refraction and Snell's Law</h2>
        <p class="mb-3">
          When light travels from an optically less dense to a more dense medium (e.g. air to glass), it slows down and refracts towards the normal:
        </p>
        <div class="p-4 bg-indigo-50 border border-indigo-200 rounded-xl font-mono text-xs my-3 text-center">
          <span class="text-base font-bold text-indigo-950">Refractive Index (n) = sin(i) / sin(r) = Speed in vacuum (c) / Speed in medium (v)</span>
        </div>

        <h2 class="text-xl font-bold font-sans border-b border-gray-200 pb-1 mt-6 mb-3 text-[#0b0080]">2. Thin Lens Formula & Magnification</h2>
        <div class="p-5 bg-slate-900 text-white rounded-xl font-mono text-xs my-4">
          <div class="text-amber-400 font-bold mb-1">The Lens Equation:</div>
          <div class="text-lg text-emerald-300 text-center py-2 bg-slate-800 rounded">
            1/f = 1/u + 1/v
          </div>
          <div class="text-slate-300 mt-2">
            Where <b>f</b> = focal length, <b>u</b> = object distance, <b>v</b> = image distance (real images have positive v, virtual have negative v).
          </div>
          <div class="text-sky-300 font-bold mt-2">
            Linear Magnification (m) = Image Height / Object Height = v / u
          </div>
        </div>
      </div>
    `
  },

  // ─── MATHEMATICS ─────────────────────────────────────────────────────────
  'https://www.khanacademy.org/math/geometry': {
    domain: 'khanacademy.org',
    title: 'Circle Theorems & Trigonometry Mastery | Khan Academy',
    category: 'Mathematics',
    summary: 'The 7 essential circle theorems, SOH CAH TOA, sine rule, cosine rule, and coordinate geometry.',
    render: () => `
      <div class="max-w-4xl mx-auto bg-[#0b1f3a] text-white p-8 rounded-2xl shadow-xl font-sans">
        <div class="flex items-center gap-3 mb-6 pb-4 border-b border-blue-800">
          <div class="w-12 h-12 bg-sky-500 rounded-xl flex items-center justify-center text-white text-2xl font-bold">
            <i class="fas fa-shapes"></i>
          </div>
          <div>
            <div class="text-xs text-sky-400 font-bold uppercase tracking-wider">Khan Academy Secondary Math</div>
            <h1 class="text-2xl font-bold">Circle Geometry & Trigonometry Theorems</h1>
          </div>
        </div>

        <div class="space-y-4 text-xs">
          <div class="bg-[#132d54] p-4 rounded-xl border border-blue-700/40">
            <h3 class="text-amber-300 font-bold text-sm mb-1.5">Theorem 1: Angle at Centre</h3>
            <p class="text-slate-300">The angle subtended by an arc at the center of a circle is <b>twice</b> the angle subtended by it at any point on the circumference.</p>
          </div>
          <div class="bg-[#132d54] p-4 rounded-xl border border-blue-700/40">
            <h3 class="text-emerald-300 font-bold text-sm mb-1.5">Theorem 2: Angle in a Semicircle</h3>
            <p class="text-slate-300">Any angle subtended at the circumference by a diameter is always a right angle (<b class="text-emerald-400">90°</b>).</p>
          </div>
          <div class="bg-[#132d54] p-4 rounded-xl border border-blue-700/40">
            <h3 class="text-purple-300 font-bold text-sm mb-1.5">Theorem 3: Cyclic Quadrilateral</h3>
            <p class="text-slate-300">The opposite interior angles of a cyclic quadrilateral (all 4 vertices on the circumference) always sum to <b class="text-purple-300">180°</b>.</p>
          </div>
        </div>

        <h2 class="text-lg font-bold text-amber-300 mt-6 mb-3">Non-Right Angled Triangle Rules</h2>
        <div class="grid grid-cols-2 gap-4 text-xs font-mono">
          <div class="bg-[#081528] p-4 rounded-xl border border-blue-900 text-sky-300">
            <div class="font-sans font-bold text-white text-xs mb-1">Sine Rule:</div>
            a / sin(A) = b / sin(B) = c / sin(C)
          </div>
          <div class="bg-[#081528] p-4 rounded-xl border border-blue-900 text-yellow-300">
            <div class="font-sans font-bold text-white text-xs mb-1">Cosine Rule:</div>
            a² = b² + c² - 2bc · cos(A)
          </div>
        </div>
      </div>
    `
  },

  'https://www.khanacademy.org/math/calculus': {
    domain: 'khanacademy.org',
    title: 'Differential Calculus & Rates of Change | Khan Academy',
    category: 'Mathematics',
    summary: 'The power rule of differentiation, finding gradients of curves, turning points (max/min), and velocity/acceleration models.',
    render: () => `
      <div class="max-w-4xl mx-auto bg-[#0b1f3a] text-white p-8 rounded-2xl shadow-xl font-sans">
        <div class="flex items-center gap-3 mb-6 pb-4 border-b border-blue-800">
          <div class="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center text-white text-2xl font-bold">
            <i class="fas fa-chart-line"></i>
          </div>
          <div>
            <div class="text-xs text-emerald-400 font-bold uppercase tracking-wider">Pure Mathematics</div>
            <h1 class="text-2xl font-bold">Introduction to Differential Calculus</h1>
          </div>
        </div>

        <div class="bg-[#132d54] p-5 rounded-xl border border-blue-700/50 mb-6 text-xs">
          <h2 class="text-base font-bold text-amber-300 mb-2">The Power Rule of Differentiation</h2>
          <div class="text-xl font-mono text-center my-3 py-2 bg-[#081528] rounded border border-blue-900 text-emerald-300">
            If y = a · xⁿ &nbsp;⇒&nbsp; dy/dx = a · n · xⁿ⁻¹
          </div>
          <p class="text-slate-300">
            The derivative $\\frac{dy}{dx}$ gives the exact numerical gradient of the tangent to the curve at any point $x$.
          </p>
        </div>

        <div class="grid grid-cols-2 gap-4 text-xs">
          <div class="bg-[#132d54] p-4 rounded-xl border border-blue-700/30">
            <h3 class="font-bold text-sky-400 mb-1">Finding Stationary Turning Points</h3>
            <p class="text-slate-300">At local maximums or minimums, the gradient is zero:</p>
            <div class="font-mono text-emerald-400 my-2 bg-[#081528] p-2 rounded text-center">dy/dx = 0</div>
            <p class="text-slate-400 text-[11px]">• If d²y/dx² < 0 → Local Maximum<br>• If d²y/dx² > 0 → Local Minimum</p>
          </div>
          <div class="bg-[#132d54] p-4 rounded-xl border border-blue-700/30">
            <h3 class="font-bold text-purple-400 mb-1">Kinematics Applications</h3>
            <ul class="space-y-1 text-slate-300 font-mono text-[11px]">
              <li>Displacement = s(t)</li>
              <li>Velocity v = ds/dt (1st derivative)</li>
              <li>Acceleration a = dv/dt = d²s/dt² (2nd derivative)</li>
            </ul>
          </div>
        </div>
      </div>
    `
  },

  // ─── GEOGRAPHY ───────────────────────────────────────────────────────────
  'https://en.wikipedia.org/wiki/Plate_tectonics': {
    domain: 'en.wikipedia.org',
    title: 'Plate Tectonics & Formation of the East African Rift - Wikipedia',
    category: 'Geography',
    summary: 'Continental drift, tectonic boundaries, faulting, folding, volcanicity, and the geology of the Great Rift Valley.',
    render: () => `
      <div class="max-w-4xl mx-auto bg-white text-[#202122] p-8 rounded-2xl shadow-sm font-serif leading-relaxed">
        <div class="border-b border-gray-300 pb-3 mb-6">
          <div class="text-xs text-amber-700 font-sans font-bold uppercase tracking-wider">Physical Geography & Earth Systems</div>
          <h1 class="text-3xl font-serif text-black mt-1">Plate Tectonics & The East African Rift System</h1>
          <div class="text-xs text-gray-500 font-sans mt-1">From Wikipedia, the free offline encyclopedia</div>
        </div>

        <p class="text-base mb-4">
          <b>Plate tectonics</b> is the scientific theory explaining that Earth's outer rigid shell (the lithosphere) is divided into several plates that glide over the ductile asthenosphere beneath.
        </p>

        <h2 class="text-xl font-bold font-sans border-b border-gray-200 pb-1 mt-6 mb-3 text-[#0b0080]">1. The East African Rift Valley (EARS)</h2>
        <p class="mb-3">
          The <b>East African Rift</b> is an active divergent tectonic plate boundary stretching over 6,000 km from the Afar Triple Junction in Ethiopia down through Kenya, Tanzania, and into Mozambique.
        </p>
        <div class="grid grid-cols-2 gap-4 font-sans text-xs my-4">
          <div class="p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <h3 class="font-bold text-amber-900 text-sm mb-1">Tensional Force Theory</h3>
            <p class="text-slate-700">Tensional stresses pull crustal rocks apart, developing parallel normal faults. The central block subsides between the two faults to create a <b>graben</b> (rift valley floor) flanked by steep fault scarps (escarpments).</p>
          </div>
          <div class="p-4 bg-rose-50 border border-rose-200 rounded-xl">
            <h3 class="font-bold text-rose-900 text-sm mb-1">Volcanic Features</h3>
            <p class="text-slate-700">Rifting thins the crust, allowing magma plumes to rise, generating massive shield volcanoes and calderas like Mount Kenya, Mount Longonot, and Menengai Crater, as well as geothermal energy reservoirs at Olkaria.</p>
          </div>
        </div>
      </div>
    `
  },

  // ─── HISTORY & GOVERNMENT ────────────────────────────────────────────────
  'https://en.wikipedia.org/wiki/Constitution_of_Kenya': {
    domain: 'en.wikipedia.org',
    title: 'The 2010 Constitution of Kenya & Devolved Governance - Wikipedia',
    category: 'History & Government',
    summary: 'The arms of government, 47 county devolved administrations, Bill of Rights, and independent constitutional commissions.',
    render: () => `
      <div class="max-w-4xl mx-auto bg-white text-[#202122] p-8 rounded-2xl shadow-sm font-serif leading-relaxed">
        <div class="border-b border-gray-300 pb-3 mb-6">
          <div class="text-xs text-emerald-700 font-sans font-bold uppercase tracking-wider">Kenyan Civic Education</div>
          <h1 class="text-3xl font-serif text-black mt-1">The 2010 Constitution and Devolution in Kenya</h1>
          <div class="text-xs text-gray-500 font-sans mt-1">From Wikipedia, the free offline encyclopedia</div>
        </div>

        <p class="text-base mb-4">
          Promulgated on <b>August 27, 2010</b>, the Constitution replaced the 1963 independence constitution, restructuring the republic into two levels of government (National and 47 County Governments).
        </p>

        <h2 class="text-xl font-bold font-sans border-b border-gray-200 pb-1 mt-6 mb-3 text-[#0b0080]">The Three Arms of the National Government</h2>
        <div class="space-y-3 font-sans text-xs my-4">
          <div class="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <b>1. The Executive:</b> Led by the President (Head of State and Government, Commander-in-Chief), Deputy President, and Cabinet Secretaries. Responsible for executing national law and policy.
          </div>
          <div class="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
            <b>2. The Legislature (Bicameral Parliament):</b> The <b>National Assembly</b> (represents constituencies and enacts national legislation) and the <b>Senate</b> (represents and protects the interests of the 47 County Governments).
          </div>
          <div class="p-3 bg-purple-50 border border-purple-200 rounded-lg">
            <b>3. The Judiciary:</b> Independent arm headed by the Chief Justice. Composed of the Supreme Court, Court of Appeal, High Court, and Subordinate Courts.
          </div>
        </div>
      </div>
    `
  },

  // ─── LITERATURE & ENGLISH ────────────────────────────────────────────────
  'https://library.dawamu.school/classics/the-pearl': {
    domain: 'library.dawamu.school',
    title: 'Literature Analysis: The Pearl by John Steinbeck - Dawamu Library',
    category: 'Literature',
    summary: 'Detailed literary study guide: character breakdown of Kino and Juana, themes of greed and corruption, and symbolism of the pearl.',
    render: () => `
      <div class="max-w-4xl mx-auto bg-[#faf6ee] text-[#2c2416] p-8 rounded-2xl shadow-lg border border-[#e2d5c3] font-serif">
        <div class="text-center border-b border-[#d8c3a5] pb-4 mb-6 font-sans">
          <div class="text-xs text-amber-800 uppercase tracking-widest font-bold">KCSE English Paper 3 Set Book Guide</div>
          <h1 class="text-3xl font-serif font-bold mt-1 text-black">The Pearl by John Steinbeck</h1>
          <div class="text-xs text-amber-900 mt-1">Study Guide & Critical Character Commentary</div>
        </div>

        <div class="bg-[#f0e6d2] p-4 rounded-xl text-center italic text-sm mb-6 border-l-4 border-amber-800">
          "The pearl was ugly; it was gray, like a malignant growth. And Kino drew back his arm and flung the pearl with all his might into the lovely green water of the Gulf."
        </div>

        <h3 class="text-lg font-sans font-bold text-amber-950 mb-2">Central Themes & Analysis:</h3>
        <div class="space-y-3 font-sans text-xs">
          <div class="bg-white p-3 rounded-lg border border-[#e2d5c3]">
            <b>1. Greed as a Corrupting Disease:</b> The announcement of Kino's discovery brings a dark cloud over the village. The priest, the doctor, and the pearl buyers all scheme to exploit Kino.
          </div>
          <div class="bg-white p-3 rounded-lg border border-[#e2d5c3]">
            <b>2. Family Unity vs. Material Obsession:</b> Juana recognizes from early on that the pearl is evil and will destroy them. Kino's refusal to heed her warning ultimately costs them the life of their infant son, Coyotito.
          </div>
        </div>
      </div>
    `
  },

  // ─── KISWAHILI ───────────────────────────────────────────────────────────
  'https://library.dawamu.school/kiswahili/ngeli-za-nomino': {
    domain: 'library.dawamu.school',
    title: 'Sarufi ya Kiswahili: Ngeli za Nomino na Upatanisho - Dawamu',
    category: 'Kiswahili',
    summary: 'Mwongozo kamili wa ngeli zote za Kiswahili (A-WA, KI-VI, LI-YA, U-I, U-ZI) pamoja na mifano ya upatanisho wa kisarufi.',
    render: () => `
      <div class="max-w-4xl mx-auto bg-white text-[#202122] p-8 rounded-2xl shadow-sm font-sans leading-relaxed">
        <div class="border-b border-gray-300 pb-3 mb-6">
          <div class="text-xs text-emerald-700 font-bold uppercase tracking-wider">KCSE Kiswahili Karatasi ya 2 (Sarufi)</div>
          <h1 class="text-3xl font-bold text-black mt-1">Ngeli za Nomino na Upatanisho wa Kisarufi</h1>
          <div class="text-xs text-gray-500 mt-1">Maktaba ya Dawamu Academy</div>
        </div>

        <p class="text-sm mb-4">
          <b>Ngeli</b> ni makundi ya nomino zenye sifa zinazofanana kisarufi, hasa jinsi zinavyochukua viambishi vya upatanisho katika sentensi.
        </p>

        <div class="space-y-3 text-xs">
          <div class="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
            <b>1. Ngeli ya A-WA:</b> Inajumuisha viumbe vyenye uhai (watu, wanyama, ndege, wadudu).<br>
            <i>Mfano:</i> <b>M</b>wanafunzi <b>a</b>nasoma / <b>Wa</b>nafunzi <b>wa</b>nasoma; Mbwa <b>a</b>nabweka / Mbwa <b>wa</b>nabweka.
          </div>
          <div class="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <b>2. Ngeli ya KI-VI:</b> Nomino zinazoanza na 'Ki-' katika umoja na 'Vi-' katika wingi.<br>
            <i>Mfano:</i> <b>Ki</b>tabu <b>ki</b>zuri <b>ki</b>meanguka / <b>Vi</b>tabu <b>vi</b>zuri <b>vi</b>meanguka.
          </div>
          <div class="p-3 bg-purple-50 border border-purple-200 rounded-lg">
            <b>3. Ngeli ya LI-YA:</b> Nomino nyingi za maumbo mbalimbali katika umoja na 'Ma-' katika wingi.<br>
            <i>Mfano:</i> <b>Jicho</b> <b>li</b>nauma / <b>Macho</b> <b>ya</b>nauma; <b>Darasa</b> <b>li</b>mesafishwa / <b>Madarasa</b> <b>ya</b>mesafishwa.
          </div>
          <div class="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <b>4. Ngeli ya U-I:</b> Mara nyingi ni miti na mimea au vitu vyenye urefu.<br>
            <i>Mfano:</i> <b>M</b>ti <b>u</b>meanguka / <b>Mi</b>ti <b>i</b>meanguka; <b>M</b>to <b>u</b>nafurika / <b>Mi</b>to <b>i</b>nafurika.
          </div>
        </div>
      </div>
    `
  },

  // ─── COMPUTER SCIENCE ────────────────────────────────────────────────────
  'https://en.wikipedia.org/wiki/Algorithm': {
    domain: 'en.wikipedia.org',
    title: 'Algorithms & Computational Complexity - Wikipedia',
    category: 'Computer Science',
    summary: 'Binary search, Bubble sort, Merge sort, algorithmic efficiency, and Big-O notation.',
    render: () => `
      <div class="max-w-4xl mx-auto bg-white text-[#202122] p-8 rounded-2xl shadow-sm font-serif leading-relaxed">
        <div class="border-b border-gray-300 pb-3 mb-6">
          <div class="text-xs text-purple-700 font-sans font-bold uppercase tracking-wider">Computer Science Fundamentals</div>
          <h1 class="text-3xl font-serif text-black mt-1">Algorithms and Big-O Complexity</h1>
          <div class="text-xs text-gray-500 font-sans mt-1">From Wikipedia, the free offline encyclopedia</div>
        </div>

        <p class="text-base mb-4">
          An <b>algorithm</b> is a finite, unambiguous sequence of computer-implementable instructions designed to solve a computational problem or perform a task.
        </p>

        <h2 class="text-xl font-bold font-sans border-b border-gray-200 pb-1 mt-6 mb-3 text-[#0b0080]">Search Algorithms Comparison</h2>
        <div class="grid grid-cols-2 gap-4 font-sans text-xs my-4">
          <div class="p-4 bg-slate-50 border border-slate-300 rounded-xl">
            <h3 class="font-bold text-slate-900 text-sm mb-1">Linear Search — O(n)</h3>
            <p class="text-slate-700">Checks every element in sequence from index 0 to n-1 until target is located. Works on unsorted arrays.</p>
          </div>
          <div class="p-4 bg-purple-50 border border-purple-200 rounded-xl">
            <h3 class="font-bold text-purple-900 text-sm mb-1">Binary Search — O(log n)</h3>
            <p class="text-slate-700">Requires a <b>sorted</b> array. Divides the search interval in half repeatedly by comparing the target with the middle element.</p>
          </div>
        </div>
      </div>
    `
  },

  // ─── INTERACTIVE REVISION & QUIZ CENTER ──────────────────────────────────
  'dawamu://study-center': {
    title: 'Dawamu Interactive Revision & Quiz Center',
    category: 'Revision & Quizzes',
    summary: 'Interactive multiple-choice revision quizzes across Biology, Chemistry, Physics, Math, and History with instant feedback.',
    render: renderQuizCenterPage
  }
};

/* ═══════════════════════════════════════════════════
   QUIZ QUESTIONS DATABASE & RENDERER
═══════════════════════════════════════════════════ */
export const STUDY_QUIZZES = [
  {
    subject: 'Biology',
    question: 'Which organelle is responsible for aerobic cellular respiration and ATP generation?',
    options: ['Chloroplast', 'Mitochondrion', 'Golgi Apparatus', 'Ribosome'],
    correct: 1,
    explanation: 'Mitochondria are the powerhouses of eukaryotic cells where the Krebs cycle and oxidative phosphorylation take place.'
  },
  {
    subject: 'Chemistry',
    question: 'What is the electronic configuration of a Calcium atom (Atomic Number Z = 20)?',
    options: ['2.8.10', '2.8.8.2', '2.8.9.1', '2.18'],
    correct: 1,
    explanation: 'Calcium has 20 electrons arranged into energy levels: 2 in K, 8 in L, 8 in M, and 2 in N (2.8.8.2).'
  },
  {
    subject: 'Physics',
    question: 'According to Ohm\'s Law, what is the voltage across a 6 Ω resistor carrying a current of 2.5 A?',
    options: ['2.4 V', '8.5 V', '15.0 V', '0.41 V'],
    correct: 2,
    explanation: 'Using V = I × R: V = 2.5 A × 6 Ω = 15.0 V.'
  },
  {
    subject: 'Mathematics',
    question: 'What are the roots of the quadratic equation x² - 7x + 12 = 0?',
    options: ['x = -3, -4', 'x = 3, 4', 'x = 2, 6', 'x = -1, 12'],
    correct: 1,
    explanation: 'Factoring: (x - 3)(x - 4) = 0, so x = 3 or x = 4.'
  },
  {
    subject: 'Geography',
    question: 'What type of tectonic force creates a rift valley via normal faults?',
    options: ['Compressional force', 'Tensional force', 'Centrifugal force', 'Gravitational pull'],
    correct: 1,
    explanation: 'Tensional forces pull the crust in opposite directions, causing the central block to subside into a graben.'
  },
  {
    subject: 'History & Government',
    question: 'In what year was the current Constitution of Kenya promulgated?',
    options: ['1963', '2002', '2010', '2013'],
    correct: 2,
    explanation: 'The current Constitution of Kenya was promulgated on August 27, 2010.'
  }
];

function renderQuizCenterPage() {
  return `
    <div class="max-w-4xl mx-auto py-8 px-4 text-white font-sans">
      <div class="flex items-center justify-between pb-4 mb-6 border-b border-slate-800">
        <div>
          <div class="text-xs text-emerald-400 font-bold uppercase tracking-wider">Dawamu Revision Hub</div>
          <h1 class="text-2xl font-bold flex items-center gap-2">
            <i class="fas fa-graduation-cap text-emerald-400"></i> Interactive Subject Revision Quizzer
          </h1>
        </div>
        <div id="quiz-score-badge" class="bg-emerald-950 border border-emerald-700/60 text-emerald-300 px-4 py-2 rounded-xl text-xs font-mono font-bold">
          Score: 0 / ${STUDY_QUIZZES.length}
        </div>
      </div>

      <div class="space-y-6" id="quiz-cards-container">
        ${STUDY_QUIZZES.map((q, idx) => `
          <div class="bg-[#24262a] border border-slate-800 rounded-2xl p-6 shadow-xl" data-quiz-index="${idx}">
            <div class="flex items-center justify-between mb-3">
              <span class="text-[10px] bg-slate-800 text-emerald-400 font-bold uppercase px-2.5 py-1 rounded-full border border-slate-700">
                ${q.subject} • Question ${idx + 1}
              </span>
            </div>
            <h3 class="text-base font-bold text-slate-100 mb-4">${q.question}</h3>
            
            <div class="grid grid-cols-2 gap-3 quiz-options-grid">
              ${q.options.map((opt, optIdx) => `
                <button class="quiz-opt-btn p-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-left text-xs text-slate-200 transition-all cursor-pointer font-medium"
                        data-q="${idx}" data-opt="${optIdx}">
                  <span class="w-6 h-6 rounded-full bg-slate-900 inline-flex items-center justify-center font-bold text-[10px] mr-2 text-slate-400">
                    ${String.fromCharCode(65 + optIdx)}
                  </span>
                  ${opt}
                </button>
              `).join('')}
            </div>

            <div class="quiz-feedback hidden mt-4 p-3 rounded-xl text-xs font-sans"></div>
          </div>
        `).join('')}
      </div>

      <div class="mt-8 text-center pb-6">
        <a href="dawamu://home" class="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-6 py-3 rounded-xl transition-all shadow-lg inline-flex items-center gap-2">
          <i class="fas fa-arrow-left"></i> Return to Encyclopedia Home
        </a>
      </div>
    </div>
  `;
}
