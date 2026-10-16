/**
 * Verification of Bernoulli's Theorem - Virtual Laboratory
 * Team: Harsh Sarda (25BME0088, Leader), Jaival Desai (25BME0048), Moksh Patel (25BME0047)
 */
'use strict';

/* ==========================================================================
   1. DATA FROM THE LAB MANUAL
   ========================================================================== */
const DUCT_SECTIONS = [
  { id: 'h1', dist: 0.0000, dia: 25.0, area: 490.87, desc: 'Inlet Uniform Duct' },
  { id: 'h2', dist: 0.0603, dia: 13.9, area: 151.75, desc: 'Converging Cone Intermediate' },
  { id: 'h3', dist: 0.0687, dia: 11.8, area: 109.36, desc: 'Converging Cone Tapping 3' },
  { id: 'h4', dist: 0.0732, dia: 10.7, area: 89.92,  desc: 'Entry to Venturi Throat' },
  { id: 'h5', dist: 0.0811, dia: 10.0, area: 78.54,  desc: 'Minimum Cross Section (Throat)' },
  { id: 'h6', dist: 0.1415, dia: 25.0, area: 490.87, desc: 'Divergent Section Outlet' }
];
const GRAVITY = 9.8; // m/s², value used in the manual
const STOPWATCH = { volumeL: 1, times: [13.87, 10.82, 9.83] }; // V = 1 L collected each run

const SAMPLE_RUNS = {
  run1: { qFactor: 7.20,  staticHeads: [0.190, 0.179, 0.165, 0.150, 0.137, 0.152], totalHeads: [0.191, 0.190, 0.187, 0.183, 0.180, 0.153] },
  run2: { qFactor: 9.24,  staticHeads: [0.210, 0.194, 0.175, 0.153, 0.135, 0.157], totalHeads: [0.212, 0.213, 0.211, 0.207, 0.206, 0.159] },
  run3: { qFactor: 10.17, staticHeads: [0.230, 0.208, 0.185, 0.155, 0.132, 0.162], totalHeads: [0.232, 0.231, 0.229, 0.220, 0.217, 0.164] }
};
const RUN_KEYS = ['run1', 'run2', 'run3'];

const LAB_PROCEDURE_STEPS = [
  { step: 1, title: 'Initial Valve Alignment', instruction: 'The flow and bench control valve is opened parallelly for maximum discharge.', apparatus: 'Flow bench control valve and digital hydraulic bench pump.' },
  { step: 2, title: 'Observation of Perspex Manometer & Flow', instruction: 'Note down the water level in the Perspex tube and time for water flow (t₁ = 13.87 s, t₂ = 10.82 s, t₃ = 9.83 s for V = 1 L).', apparatus: '6 Static Piezometer Perspex Tubes (h₁ to h₆) and bench collection scale.' },
  { step: 3, title: 'Repeat for Multiple Discharge Rates', instruction: 'The above procedure is repeated for different discharges (7.2, 9.24, 10.17 × 10⁻⁵ m³/s) by controlling the gate valve.', apparatus: 'Discharge control gate valve and stopwatch for volumetric tank rise.' }
];

/* ---- Quiz: a fresh set of theory / formula questions is generated on every page load (and on Restart) ---- */
const QUIZ_COUNT = 5, QUIZ_MARKS_EACH = 4;
const QUIZ_TOTAL_MARKS = QUIZ_COUNT * QUIZ_MARKS_EACH;
const qRnd = (a, b) => a + Math.random() * (b - a);
const qPick = arr => arr[Math.floor(Math.random() * arr.length)];
const qDias = [25, 13.9, 11.8, 10.7, 10];

// correct answer first (the quiz shuffles the display order); wrong values are common slips
function qOptions(correct, wrongs, fmt) {
  const seen = new Set([fmt(correct)]);
  const out = [];
  wrongs.forEach(w => { const t = fmt(w); if (Number.isFinite(w) && !seen.has(t)) { seen.add(t); out.push(t); } });
  for (let k = 1.37; out.length < 3; k += 0.41) { const t = fmt(correct * k); if (!seen.has(t)) { seen.add(t); out.push(t); } }
  return [fmt(correct)].concat(out.slice(0, 3));
}

const QUIZ_NUMERIC = [
  function discharge() {
    const V = qPick([0.5, 1, 1.5, 2, 2.5]), t = +qRnd(8, 20).toFixed(2), ans = V * 100 / t;
    return { question: `Using Q = V / t, a volume V = ${V} L is collected in t = ${t} s. What is the discharge Q?`,
      options: qOptions(ans, [ans * 10, ans / 10, t / V], x => `${x.toFixed(2)} × 10⁻⁵ m³/s`),
      explanation: `Q = V / t = (${V} × 10⁻³ m³) / ${t} s = ${ans.toFixed(2)} × 10⁻⁵ m³/s (1 L = 10⁻³ m³).` };
  },
  function velocityQuestion() {
    const sec = qPick(DUCT_SECTIONS), Q = +qRnd(5, 11).toFixed(2), v = Q * 10 / sec.area;
    const others = DUCT_SECTIONS.filter(s => s.id !== sec.id).map(s => Q * 10 / s.area);
    return { question: `Water flows at Q = ${Q} × 10⁻⁵ m³/s through tapping ${sec.id} (d = ${sec.dia} mm, A = ${sec.area} × 10⁻⁶ m²). Using v = Q / A, what is the velocity there?`,
      options: qOptions(v, others, x => `${x.toFixed(3)} m/s`),
      explanation: `v = Q / A = (${Q} × 10⁻⁵) / (${sec.area} × 10⁻⁶) = ${v.toFixed(3)} m/s.` };
  },
  function dynamicHead() {
    const v = +qRnd(0.4, 3).toFixed(2), ans = v * v / (2 * GRAVITY) * 1000;
    return { question: `The velocity at a section is v = ${v} m/s. Taking g = ${GRAVITY} m/s², what is the dynamic head hd = v² / 2g?`,
      options: qOptions(ans, [ans * 2, ans / 2, v / (2 * GRAVITY) * 1000], x => `${x.toFixed(2)} × 10⁻³ m`),
      explanation: `hd = v² / 2g = (${v})² / (2 × ${GRAVITY}) = ${(ans / 1000).toFixed(5)} m = ${ans.toFixed(2)} × 10⁻³ m.` };
  },
  function totalHead() {
    const h = +qRnd(0.12, 0.24).toFixed(3), hdm = +qRnd(5, 45).toFixed(1), hd = hdm / 1000, ans = h + hd;
    return { question: `At a tapping the static head is h = ${h} m and the dynamic head is hd = ${hdm} × 10⁻³ m. What is the total head ht = h + hd?`,
      options: qOptions(ans, [h - hd, h + hd * 10, h + hd / 10], x => `${x.toFixed(3)} m`),
      explanation: `ht = h + hd = ${h.toFixed(3)} + ${hd.toFixed(4)} = ${ans.toFixed(3)} m (convert hd from ×10⁻³ m to m before adding).` };
  },
  function areaFromDiameter() {
    const d = qPick(qDias), A = Math.PI * d * d / 4;
    return { question: `A circular tapping of diameter d = ${d} mm is used. What is its cross-sectional area A = πd²/4?`,
      options: qOptions(A, [Math.PI * d * d, Math.PI * d * d / 2, d * d / 4], x => `${x.toFixed(2)} × 10⁻⁶ m²`),
      explanation: `A = πd²/4 = π × (${d})² / 4 = ${A.toFixed(2)} mm² = ${A.toFixed(2)} × 10⁻⁶ m².` };
  },
  function continuity() {
    const i = Math.floor(Math.random() * (qDias.length - 1)), j = i + 1 + Math.floor(Math.random() * (qDias.length - 1 - i));
    const d1 = qDias[i], d2 = qDias[j], v1 = +qRnd(0.1, 0.5).toFixed(2), r = d1 / d2, v2 = v1 * r * r;
    return { question: `Water enters a ${d1} mm section at v₁ = ${v1} m/s. By continuity (A₁v₁ = A₂v₂), what is the velocity in the ${d2} mm section?`,
      options: qOptions(v2, [v1 * r, v1 / (r * r), v1 * r * r * r], x => `${x.toFixed(3)} m/s`),
      explanation: `v₂ = v₁ (d₁/d₂)² = ${v1} × (${d1}/${d2})² = ${v2.toFixed(3)} m/s.` };
  }
];

const QUIZ_THEORY = [
  { question: "What is the primary aim of Experiment No: 4?", correct: "To verify the Bernoulli's theorem for liquids",
    wrong: ["To calibrate a Venturi flowmeter orifice coefficient", "To calculate the Reynolds number in turbulent pipes", "To determine the friction factor in rough pipelines"],
    explanation: "The aim of the experiment is to verify Bernoulli's theorem for liquids." },
  { question: "Which tapping represents the throat (minimum cross-section) of the duct?", correct: "Tapping h₅ (10.0 mm)",
    wrong: ["Tapping h₁ (25 mm)", "Tapping h₂ (13.9 mm)", "Tapping h₄ (10.7 mm)"],
    explanation: "At h₅, d = 10.0 mm and A = 78.54 × 10⁻⁶ m², the minimum duct area." },
  { question: "As liquid flows into the throat, what happens to its velocity and static head?", correct: "Velocity increases and static pressure head decreases",
    wrong: ["Velocity decreases and static pressure increases", "Both velocity and static pressure increase equally", "Both velocity and static pressure drop to zero"],
    explanation: "From continuity v = Q/A rises as A falls, and by Bernoulli's equation the static head must fall to keep total head nearly constant." },
  { question: "In Bernoulli's equation p/γ + v²/2g + Z = constant, what does the term v²/2g represent?", correct: "Kinetic energy per unit weight (dynamic / velocity head)",
    wrong: ["Pressure energy per unit weight", "Potential energy per unit weight", "Head lost to friction"],
    explanation: "v²/2g is the velocity (dynamic) head, the kinetic energy per unit weight of the fluid." },
  { question: "Which of the following is NOT an assumption of Bernoulli's theorem?", correct: "Flow is highly turbulent with heavy energy losses",
    wrong: ["Flow is steady", "Fluid is incompressible", "Friction (viscous) losses are negligible"],
    explanation: "Bernoulli's theorem assumes steady, incompressible, frictionless (inviscid) flow along a streamline." },
  { question: "Every term in p/γ + v²/2g + Z = constant has the dimension of:", correct: "Length (metres of liquid column)",
    wrong: ["Pressure (N/m²)", "Energy (J)", "Velocity (m/s)"],
    explanation: "Each term is energy per unit weight, which reduces to a length (head) in metres." },
  { question: "Why does the measured total head fall slightly from h₁ towards h₅ and drop more after the throat?", correct: "Frictional losses (and expansion losses after the throat) plus experimental errors",
    wrong: ["Bernoulli's theorem fails for water", "The fluid becomes compressible at the throat", "The datum head Z changes along the duct"],
    explanation: "Real fluids have viscous friction and the diverging section adds expansion losses, so total head is only approximately constant." },
  { question: "The duct axis is horizontal. What does this imply for the datum head Z?", correct: "Z is the same at every tapping, so total head depends only on h and hd",
    wrong: ["Z increases with velocity", "Z equals the static head h", "Z is zero only at the throat"],
    explanation: "With a horizontal axis Z is uniform, so ht = h + hd is the quantity compared along the duct." },
  { question: "If the duct diameter at a section is halved (same Q), the dynamic head hd becomes:", correct: "16 times larger",
    wrong: ["2 times larger", "4 times larger", "8 times larger"],
    explanation: "A ∝ d², so v ∝ 1/d² becomes 4 times larger; hd ∝ v² becomes 16 times larger." },
  { question: "If the discharge Q is doubled through the same section, the dynamic head hd becomes:", correct: "4 times larger",
    wrong: ["2 times larger", "Half", "Unchanged"],
    explanation: "v = Q/A doubles and hd = v²/2g ∝ Q², so it becomes 4 times larger." },
  { question: "How is the total head ht in the observation table calculated?", correct: "ht = h + hd (static head + dynamic head)",
    wrong: ["ht = h − hd", "ht = h × hd", "ht = v² / 2g only"],
    explanation: "Total head is the sum of the static head h and the dynamic head hd = v²/2g." },
  { question: "What value of g is used in the manual calculations?", correct: "9.8 m/s²",
    wrong: ["10.5 m/s²", "8.9 m/s²", "32.2 m/s²"],
    explanation: "The calculations use g = 9.8 m/s²." }
];

function qShuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
// 3 calculation questions (random numbers) + 2 theory questions, all in random order
function buildQuizSet() {
  const calc = qShuffle(QUIZ_NUMERIC).slice(0, 3).map(f => f());
  const theory = qShuffle(QUIZ_THEORY).slice(0, 2).map(t => ({ question: t.question, options: [t.correct].concat(t.wrong), explanation: t.explanation }));
  return qShuffle(calc.concat(theory)).map(q => Object.assign({ correct: 0, marks: QUIZ_MARKS_EACH }, q));
}
const QUIZ_PASS_FRACTION = 0.6;

/* ==========================================================================
   2. SAFE STORAGE + VALIDATION  (corrupted data can never break the page)
   ========================================================================== */
const KEYS = { obs: 'bernoulli_obs_data_v3', multi: 'bernoulli_multi_exp_data', quiz: 'bl_quiz_best', theme: 'bl_theme', motion: 'bl_motion' };

function safeGet(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch (e) { return fallback; }
}
function safeSet(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* storage unavailable */ } }
function safeClearLabData() {
  try {
    Object.keys(localStorage)
      .filter(k => k.startsWith('bl_') || k.startsWith('bernoulli_'))
      .forEach(k => localStorage.removeItem(k));
  } catch (e) { /* ignore */ }
}

const isNum = Number.isFinite;
const validObs = a => Array.isArray(a) && a.length === 6 &&
  a.every(r => r && isNum(r.qFactor) && isNum(r.h_m) && isNum(r.area) && isNum(r.dist) && typeof r.tube === 'string');
const validMulti = a => Array.isArray(a) && a.length === 3 &&
  a.every(r => r && isNum(r.qFactor) && Array.isArray(r.heads) && r.heads.length === 6 && r.heads.every(isNum));

const defaultObs = (key = 'run1') => DUCT_SECTIONS.map((sec, i) => ({
  qFactor: SAMPLE_RUNS[key].qFactor, tube: sec.id, dist: sec.dist, area: sec.area, h_m: SAMPLE_RUNS[key].staticHeads[i]
}));
const defaultMulti = () => RUN_KEYS.map(k => ({ qFactor: SAMPLE_RUNS[k].qFactor, heads: SAMPLE_RUNS[k].staticHeads.slice() }));

let activeObservations = (() => { const v = safeGet(KEYS.obs, null); return validObs(v) ? v : defaultObs(); })();
let multiExpData = (() => { const v = safeGet(KEYS.multi, null); return validMulti(v) ? v : defaultMulti(); })();

/* ==========================================================================
   3. PHYSICS HELPERS
   ========================================================================== */
const velocity = (qM3s, areaMM2) => qM3s / (areaMM2 * 1e-6);
const dynHead = v => (v * v) / (2 * GRAVITY);
const totalHeadsFor = (qFactor, heads) => heads.map((h, i) => h + dynHead(velocity(qFactor * 1e-5, DUCT_SECTIONS[i].area)));
const lminFromFactor = qf => qf * 1e-5 * 60000;   // ×10⁻⁵ m³/s -> L/min
const factorFromLmin = l => (l / 60000) * 1e5;    // L/min -> ×10⁻⁵ m³/s

// Simulation model: inlet total head H0 is fitted (least squares) to the three measured runs, and the
// head lost between h1 and each tapping is a fixed fraction of the throat dynamic head
// (averaged from the three runs), with the largest loss after the throat. Total head is therefore
// constant apart from small, physically sensible losses.
const LOSS_COEF = [0, 0.01, 0.05, 0.13, 0.17, 0.81];
const H0_FIT = (() => {
  const pts = RUN_KEYS.map(k => {
    const r = SAMPLE_RUNS[k];
    return { x: r.qFactor, y: totalHeadsFor(r.qFactor, r.staticHeads)[0] };
  });
  const n = pts.length;
  const sx = pts.reduce((a, p) => a + p.x, 0), sy = pts.reduce((a, p) => a + p.y, 0);
  const sxx = pts.reduce((a, p) => a + p.x * p.x, 0), sxy = pts.reduce((a, p) => a + p.x * p.y, 0);
  const b = (n * sxy - sx * sy) / (n * sxx - sx * sx);
  return { a: (sy - b * sx) / n, b };
})();
function modelStaticHeads(qFactor) {
  const q = qFactor * 1e-5;
  const H0 = Math.max(0, H0_FIT.a + H0_FIT.b * qFactor);
  const hdThroat = dynHead(velocity(q, DUCT_SECTIONS[4].area));
  return DUCT_SECTIONS.map((s, i) => H0 - dynHead(velocity(q, s.area)) - LOSS_COEF[i] * hdThroat);
}

/* ==========================================================================
   4. SHARED UI HELPERS (motion, loops, activation, charts)
   ========================================================================== */
function motionReduced() {
  return document.body.classList.contains('reduced-motion') ||
    (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
}

// Runs drawFn every frame, but only while the element is on screen and the tab is visible.
function makeLoop(el, drawFn) {
  let visible = true, running = false;
  function frame() {
    if (!visible || document.hidden) { running = false; return; }
    drawFn();
    requestAnimationFrame(frame);
  }
  function start() { if (!running) { running = true; requestAnimationFrame(frame); } }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => { visible = entries[0].isIntersecting; if (visible) start(); }).observe(el);
  }
  document.addEventListener('visibilitychange', () => { if (!document.hidden) start(); });
  start();
}

// Click + Enter/Space activation for role="button" elements
function onActivate(el, handler) {
  el.addEventListener('click', handler);
  el.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') { e.preventDefault(); handler(e); }
  });
}

const CHART_COLORS = ['#06b6d4', '#f59e0b', '#10b981', '#a78bfa'];
const allCharts = [];
const chartAvailable = () => typeof Chart !== 'undefined';

function chartPalette(mode) {
  if (mode === 'print') return { text: '#111111', muted: '#333333', grid: 'rgba(0,0,0,0.15)' };
  const cs = getComputedStyle(document.body);
  return {
    text: cs.getPropertyValue('--text-main').trim() || '#e2e8f0',
    muted: cs.getPropertyValue('--text-muted').trim() || '#94a3b8',
    grid: cs.getPropertyValue('--grid-color').trim() || 'rgba(51,65,85,0.3)'
  };
}
function applyChartTheme(mode) {
  const p = chartPalette(mode);
  allCharts.forEach(ch => {
    const o = ch.options;
    ['x', 'y'].forEach(ax => {
      o.scales[ax].ticks.color = p.text;
      o.scales[ax].title.color = p.muted;
      o.scales[ax].grid.color = p.grid;
    });
    o.plugins.legend.labels.color = p.text;
    ch.update('none');
  });
}
function registerChart(ch) { allCharts.push(ch); applyChartTheme(); return ch; }

function headChartOptions(xTitle, yMin) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: motionReduced() ? 0 : 600 },
    scales: {
      x: { type: 'linear', title: { display: true, text: xTitle, font: { size: 13 } }, suggestedMin: 0, suggestedMax: 0.15, ticks: {}, grid: {} },
      y: { title: { display: true, text: 'Total Head ht (m)', font: { size: 13 } }, suggestedMin: yMin, suggestedMax: 0.26, ticks: {}, grid: {} }
    },
    plugins: {
      legend: { labels: { font: { size: 12 } } },
      tooltip: { callbacks: { label: c => `${c.dataset.label}: ${c.parsed.y.toFixed(3)} m at ${c.parsed.x.toFixed(4)} m` } }
    }
  };
}
const toPoints = vals => vals.map((v, i) => ({ x: DUCT_SECTIONS[i].dist, y: v }));
function lineDataset(label, color, vals, extra) {
  return Object.assign({
    label, data: toPoints(vals), borderColor: color, backgroundColor: color + '33', pointBackgroundColor: color,
    borderWidth: 3, tension: 0.15, pointRadius: 5, pointHoverRadius: 7, showLine: true
  }, extra || {});
}
function chartFallback(canvasId) {
  const el = document.getElementById(canvasId);
  if (el && el.parentElement) {
    el.parentElement.innerHTML = '<p class="small-desc">The graph library could not be loaded (check your internet connection and reload). Tables and calculations still work.</p>';
  }
}

/* ==========================================================================
   5. INITIALISATION (each part isolated so one failure cannot stop the rest)
   ========================================================================== */
function safeInit(fn) {
  try { fn(); } catch (err) { console.error('Init failed:', fn.name, err); }
}

document.addEventListener('DOMContentLoaded', () => {
  safeInit(initTheme);
  [initHeroCanvas, initSimulation, initCustomSimulation, initMultiExperimentSection, renderObservationTable, initObservationControls,
   initQCalc, initChart, initTheoryInteractions, initApparatusHotspots, initProcedureStepper,
   initQuiz, initNavControls, initCalculator, initPrintSupport, initFlowUnitInputs].forEach(safeInit);
});

/* ---------- Theme / motion preferences ---------- */
let themeColors = { particle: '#00f0ff', stroke: '#38bdf8', text: '#e2e8f0' };
function refreshThemeColors() {
  const cs = getComputedStyle(document.body);
  themeColors = {
    particle: cs.getPropertyValue('--cyan-primary').trim() || '#00f0ff',
    stroke: cs.getPropertyValue('--cyan-light').trim() || '#38bdf8',
    text: cs.getPropertyValue('--text-main').trim() || '#e2e8f0'
  };
}
function initTheme() {
  const t = safeGet(KEYS.theme, 'dark');
  document.body.setAttribute('data-theme', t === 'light' ? 'light' : 'dark');
  if (safeGet(KEYS.motion, false) === true) document.body.classList.add('reduced-motion');
  const mBtn = document.getElementById('motionToggleBtn');
  if (mBtn) mBtn.setAttribute('aria-pressed', document.body.classList.contains('reduced-motion') ? 'true' : 'false');
  refreshThemeColors();
}

/* ---------- Hero canvas ---------- */
function initHeroCanvas() {
  const canvas = document.getElementById('heroFlowCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let width = 0, height = 0;
  const particles = [];

  function resize() {
    width = canvas.width = canvas.parentElement.offsetWidth;
    height = canvas.height = canvas.parentElement.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);
  for (let i = 0; i < 45; i++) {
    particles.push({ x: Math.random() * width, y: Math.random() * height, length: Math.random() * 20 + 10, speed: Math.random() * 1.5 + 0.8, opacity: Math.random() * 0.4 + 0.1 });
  }

  makeLoop(canvas, () => {
    const reduced = motionReduced();
    ctx.clearRect(0, 0, width, height);
    ctx.strokeStyle = themeColors.particle;
    ctx.lineWidth = 1.2;
    particles.forEach(p => {
      ctx.beginPath();
      ctx.globalAlpha = p.opacity;
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x + p.length, p.y);
      ctx.stroke();
      if (reduced) return;               // honour reduced motion: draw a still frame
      p.x += p.speed;
      if (p.x > width) { p.x = -p.length; p.y = Math.random() * height; }
    });
    ctx.globalAlpha = 1;
  });
}

/* ---------- Theory ---------- */
function initTheoryInteractions() {
  const terms = {
    'p-head': { title: 'Pressure Head (p / γ or h)', symbol: 'h', unit: 'm of water', desc: 'Static energy head per unit weight of fluid. Measured directly in meters in the observation table.' },
    'v-head': { title: 'Dynamic Head (hd = v² / 2g)', symbol: 'hd', unit: 'm of water (×10⁻³)', desc: 'Kinetic energy head. Evaluated from velocity v = Q / A with g = 9.8 m/s².' },
    'z-head': { title: 'Datum / Elevation Head (Z)', symbol: 'Z', unit: 'm', desc: 'Potential energy head. Duct axis is horizontal, so Z is uniform along all points.' },
    'total-head': { title: 'Total Head (ht)', symbol: 'ht = h + hd', unit: 'm of water', desc: 'Sum of static pressure head (h) and dynamic head (hd). Plotted on Y-axis in graphs.' }
  };
  document.querySelectorAll('.eq-term').forEach(el => {
    onActivate(el, () => {
      const data = terms[el.dataset.term];
      if (!data) return;
      document.getElementById('termDetailTitle').textContent = data.title;
      document.getElementById('termDetailDesc').textContent = data.desc;
      document.getElementById('termDetailUnit').textContent = `Unit: ${data.unit}`;
      document.getElementById('termDetailSymbol').textContent = `Symbol: ${data.symbol}`;
    });
  });
}

/* ---------- Apparatus hotspots ---------- */
const MANOMETER_BASE_Y = [270, 280, 292, 297, 298, 270]; // y of each tapping point in the SVG
const MANOMETER_DATUM_Y = 305;                           // duct axis = common datum
const MANOMETER_PX_PER_M = 800;

function initApparatusHotspots() {
  const title = document.getElementById('hotspotTitle');
  const desc = document.getElementById('hotspotDesc');
  const area = document.getElementById('hotspotArea');
  const dist = document.getElementById('hotspotDist');
  const status = document.getElementById('hotspotStatus');
  const svg = document.getElementById('apparatusSvg');
  const inspectBtn = document.getElementById('inspectAllBtn');
  const cols = document.querySelectorAll('.manometer-col');
  let overview = false;

  function setOverview(on) {
    overview = on;
    svg.classList.toggle('overview', on);
    inspectBtn.textContent = on ? 'Exit Overview' : 'Overview Hotspots';
    inspectBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
    if (on) {
      cols.forEach(c => c.classList.remove('selected'));
      title.textContent = 'All tapping points (overview)';
      desc.textContent = 'Six static tappings h₁–h₆ along the perspex duct, plus the discharge gate valve at the outlet.';
      area.textContent = 'Throat h₅: Ø10.0 mm, 78.54 × 10⁻⁶ m²';
      dist.textContent = 'Span h₁ → h₆: 0.1415 m';
      status.textContent = 'Overview: all 6 tappings and the gate valve are highlighted';
    } else {
      status.textContent = 'Click any highlighted tapping to view section metadata';
    }
  }

  cols.forEach(col => {
    onActivate(col, () => {
      const data = DUCT_SECTIONS[parseInt(col.dataset.index, 10) - 1];
      if (overview) setOverview(false);
      cols.forEach(c => c.classList.toggle('selected', c === col));
      title.textContent = `Static Tapping Point ${data.id.toUpperCase()}`;
      desc.textContent = `${data.desc}. Diameter = ${data.dia} mm.`;
      area.textContent = `Area: ${data.area} × 10⁻⁶ m²`;
      dist.textContent = `Position: ${data.dist.toFixed(4)} m from duct inlet`;
      status.textContent = `Selected ${data.id.toUpperCase()}: ${data.dist.toFixed(4)} m from inlet, Ø${data.dia} mm`;
    });
  });

  const valve = document.getElementById('hotspotValve');
  if (valve) {
    onActivate(valve, () => {
      if (overview) setOverview(false);
      cols.forEach(c => c.classList.remove('selected'));
      title.textContent = 'Discharge Bench Gate Valve';
      desc.textContent = 'Controls the water flow rate Q (0 to 7 L/min on this bench).';
      area.textContent = 'Type: Gate / Control Valve';
      dist.textContent = 'Location: Apparatus Outlet';
      status.textContent = 'Selected: discharge gate valve';
    });
  }
  if (inspectBtn) inspectBtn.addEventListener('click', () => setOverview(!overview));

  const toggleBtn = document.getElementById('toggleLabelsBtn');
  if (toggleBtn) {
    let visible = true;
    toggleBtn.addEventListener('click', () => {
      visible = !visible;
      document.querySelectorAll('.man-label').forEach(el => { el.style.display = visible ? 'block' : 'none'; });
      toggleBtn.textContent = visible ? 'Hide Tapping Labels' : 'Show Tapping Labels';
    });
  }
}

/* ---------- Procedure stepper ---------- */
function initProcedureStepper() {
  let cur = 0;
  const heading = document.getElementById('stepHeading');
  const instr = document.getElementById('stepInstruction');
  const comp = document.getElementById('stepActiveComponent');
  const badge = document.getElementById('stepCounterBadge');
  const fill = document.getElementById('stepperProgressFill');
  const prevBtn = document.getElementById('prevStepBtn');
  const nextBtn = document.getElementById('nextStepBtn');
  const resetBtn = document.getElementById('resetStepBtn');
  const n = LAB_PROCEDURE_STEPS.length;

  function render(idx) {
    const d = LAB_PROCEDURE_STEPS[idx];
    heading.textContent = `Step ${d.step}: ${d.title}`;
    instr.textContent = `"${d.instruction}"`;
    comp.textContent = d.apparatus;
    badge.textContent = `Step ${idx + 1} of ${n}`;
    fill.style.width = `${((idx + 1) / n) * 100}%`;
    prevBtn.disabled = idx === 0;
    nextBtn.disabled = idx === n - 1;
  }
  nextBtn.addEventListener('click', () => { if (cur < n - 1) render(++cur); });
  prevBtn.addEventListener('click', () => { if (cur > 0) render(--cur); });
  resetBtn.addEventListener('click', () => { cur = 0; render(0); });
  render(0);
}

/* ==========================================================================
   6. SIMULATION (0 - 7 L/min, to-scale venturi, Bernoulli-consistent heads)
   ========================================================================== */
let isSimPlaying = true;
let currentLmin = 4.32;            // = 7.2 × 10⁻⁵ m³/s, the Run 1 flow rate
let simLiveChartInstance = null;
const SIM_MAX_LMIN = 7;
const SIM_GEO = { padLeft: 60, pxPerM: 5500, pxPerMM: 5.5 }; // true proportions: 1 mm of diameter = 5.5 px, 1 m = 5500 px

function simX(distM) { return SIM_GEO.padLeft + distM * SIM_GEO.pxPerM; }
function simDiaAt(xPx) {           // duct diameter (mm) at a canvas x, linear between tappings
  const d = (xPx - SIM_GEO.padLeft) / SIM_GEO.pxPerM;
  const S = DUCT_SECTIONS;
  if (d <= 0) return S[0].dia;
  for (let i = 0; i < S.length - 1; i++) {
    if (d <= S[i + 1].dist) {
      const t = (d - S[i].dist) / (S[i + 1].dist - S[i].dist);
      return S[i].dia + (S[i + 1].dia - S[i].dia) * t;
    }
  }
  return S[S.length - 1].dia;
}
const simHalfHeight = xPx => (simDiaAt(xPx) / 2) * SIM_GEO.pxPerMM;

function initSimulation() {
  const canvas = document.getElementById('simCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const flowSlider = document.getElementById('flowSlider');
  const flowInput = document.getElementById('simFlowInput');
  const flowValBadge = document.getElementById('flowValBadge');
  const warning = document.getElementById('simWarning');
  const headInputs = Array.from({ length: 6 }, (_, i) => document.getElementById(`simH${i + 1}`));

  const particles = [];
  for (let i = 0; i < 70; i++) particles.push({ x: Math.random() * canvas.width, relY: Math.random(), size: Math.random() * 2.2 + 1.4 });

  if (chartAvailable() && document.getElementById('simLiveChart')) {
    const opts = headChartOptions('Distance into Duct (m)', 0);
    simLiveChartInstance = registerChart(new Chart(document.getElementById('simLiveChart').getContext('2d'), {
      type: 'scatter',
      data: { datasets: [lineDataset('Live Total Head ht (m)', CHART_COLORS[0], [0, 0, 0, 0, 0, 0], { fill: true })] },
      options: opts
    }));
  } else {
    chartFallback('simLiveChart');
  }

  const readHeads = () => headInputs.map((inp, i) => {
    const v = parseFloat(inp.value);
    return Number.isNaN(v) ? SAMPLE_RUNS.run1.staticHeads[i] : v;
  });
  const writeHeads = heads => heads.forEach((h, i) => { headInputs[i].value = h.toFixed(3); });

  function renderSimMetrics() {
    const tbody = document.getElementById('simMetricsTbody');
    if (!tbody) return;
    const qM3s = (currentLmin * 1e-3) / 60;
    flowValBadge.textContent = `${(qM3s * 1e5).toFixed(2)} × 10⁻⁵ m³/s`;

    const heads = readHeads();
    const totals = [];
    let negative = null;
    const rows = DUCT_SECTIONS.map((sec, i) => {
      const v = velocity(qM3s, sec.area);
      const hd = dynHead(v);
      const stat = heads[i];
      const tot = stat + hd;
      totals.push(tot);
      if (stat < 0 && negative === null) negative = sec.id;

      const water = document.getElementById(`manWater${i + 1}`);
      if (water) {
        const y = Math.min(MANOMETER_BASE_Y[i], Math.max(50, MANOMETER_DATUM_Y - stat * MANOMETER_PX_PER_M));
        water.setAttribute('y1', y.toFixed(1));
      }
      return `<tr><td><strong>${sec.id}</strong></td><td>${sec.dist.toFixed(4)}</td><td>${sec.area.toFixed(2)}</td><td>${v.toFixed(4)}</td><td>${stat.toFixed(3)}</td><td>${(hd * 1000).toFixed(3)}</td><td><strong>${tot.toFixed(3)}</strong></td></tr>`;
    });
    tbody.innerHTML = rows.join('');

    if (negative) {
      warning.textContent = `Static head at ${negative} is below zero: this flow rate is more than the bench can deliver through the throat. Reduce Q (the three measured runs are at 4.32, 5.54 and 6.10 L/min).`;
      warning.classList.remove('hidden');
    } else {
      warning.classList.add('hidden');
    }
    if (simLiveChartInstance) {
      simLiveChartInstance.data.datasets[0].data = toPoints(totals);
      simLiveChartInstance.update('none');
    }
  }

  function setFlow(lmin, updateHeads, keepBox) {
    currentLmin = Math.min(SIM_MAX_LMIN, Math.max(0, lmin));
    flowSlider.value = currentLmin;
    if (!keepBox) flowInput.value = Number(currentLmin.toFixed(3)).toString();   // 3 decimals so 5.544 L/min = 9.24 × 10⁻⁵ m³/s is shown exactly
    if (updateHeads) writeHeads(modelStaticHeads(factorFromLmin(currentLmin)));
    renderSimMetrics();
  }

  flowSlider.addEventListener('input', e => setFlow(parseFloat(e.target.value) || 0, true));
  flowInput.addEventListener('input', e => {
    if (e.target.validity && e.target.validity.badInput) return;   // half-typed number: leave the box alone
    const v = parseFloat(e.target.value);
    setFlow(Number.isNaN(v) ? 0 : v, true, true);                   // keep what the user is typing (empty box stays empty)
    if (!Number.isNaN(v) && (v < 0 || v > SIM_MAX_LMIN)) flowInput.value = Number(currentLmin.toFixed(3)).toString();
  });
  headInputs.forEach(inp => inp.addEventListener('input', renderSimMetrics));

  document.querySelectorAll('.sim-preset').forEach(btn => btn.addEventListener('click', () => {
    const run = SAMPLE_RUNS[btn.dataset.run];
    if (!run) return;
    setFlow(lminFromFactor(run.qFactor), false);
    writeHeads(run.staticHeads);
    renderSimMetrics();
  }));

  document.getElementById('simPlayBtn').addEventListener('click', () => { isSimPlaying = true; });
  document.getElementById('simPauseBtn').addEventListener('click', () => { isSimPlaying = false; });
  document.getElementById('simResetBtn').addEventListener('click', () => {
    setFlow(lminFromFactor(SAMPLE_RUNS.run1.qFactor), false);
    writeHeads(SAMPLE_RUNS.run1.staticHeads);
    renderSimMetrics();
  });

  const BASE_SPEED = 0.5;
  makeLoop(canvas, () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const midY = canvas.height / 2;

    // duct drawn to scale
    ctx.fillStyle = 'rgba(2, 132, 199, 0.12)';
    ctx.strokeStyle = themeColors.stroke;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let x = 0; x <= canvas.width; x += 4) { const y = midY - simHalfHeight(x); x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
    for (let x = canvas.width; x >= 0; x -= 4) ctx.lineTo(x, midY + simHalfHeight(x));
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // tapping markers at their real distances
    ctx.font = '12px Poppins, sans-serif';
    ctx.textAlign = 'center';
    DUCT_SECTIONS.forEach(sec => {
      const x = simX(sec.dist), top = midY - simHalfHeight(x);
      ctx.strokeStyle = sec.id === 'h5' ? '#f59e0b' : themeColors.stroke;
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(x, top - 14); ctx.lineTo(x, top); ctx.stroke();
      ctx.fillStyle = sec.id === 'h5' ? '#f59e0b' : themeColors.text;
      ctx.fillText(sec.id, x, top - 18);
    });

    const reduced = motionReduced();
    particles.forEach(p => {
      const hh = simHalfHeight(p.x);
      const y = midY - hh + p.relY * 2 * hh;
      ctx.beginPath();
      ctx.fillStyle = themeColors.particle;
      ctx.arc(p.x, y, p.size, 0, Math.PI * 2);
      ctx.fill();
      if (isSimPlaying && !reduced) {
        const dia = simDiaAt(p.x);
        p.x += BASE_SPEED * (currentLmin / 4.32) * Math.pow(25 / dia, 2); // v ∝ 1/A
        if (p.x > canvas.width) { p.x = 0; p.relY = Math.random(); }
      }
    });
  });

  setFlow(currentLmin, false);   // starts at Run 1 (measured heads from the HTML defaults)
}

/* ==========================================================================
   7. THREE-FLOW-RATE LOG + COMPARATIVE GRAPH
   ========================================================================== */
let multiExpChartInstance = null;
const multiLabel = r => `Q${['₁', '₂', '₃'][r]} = ${multiExpData[r].qFactor} × 10⁻⁵ m³/s`;

/* ==========================================================================
   6b. CUSTOM MANOMETER SIMULATION (3 - 10 tappings, user-entered static heads)
   ========================================================================== */
const CUSTOM_MIN_TAPS = 3, CUSTOM_MAX_TAPS = 10, CUSTOM_DEFAULT_TAPS = 6;
const SUBSCRIPT_DIGITS = '₀₁₂₃₄₅₆₇₈₉';
const subscriptNum = n => String(n).split('').map(c => SUBSCRIPT_DIGITS[+c]).join('');

// Piecewise-linear interpolation of a per-section value along the venturi profile.
function lerpAlongDuct(dist, values) {
  const S = DUCT_SECTIONS;
  if (dist <= S[0].dist) return values[0];
  for (let i = 0; i < S.length - 1; i++) {
    if (dist <= S[i + 1].dist) {
      const t = (dist - S[i].dist) / (S[i + 1].dist - S[i].dist);
      return values[i] + (values[i + 1] - values[i]) * t;
    }
  }
  return values[S.length - 1];
}

// Tapping layout: 6 taps = the real apparatus; otherwise evenly spaced along the duct with the
// diameter interpolated from the real venturi profile (area = pi/4 d^2, in mm^2).
function customTappings(n) {
  if (n === DUCT_SECTIONS.length) {
    return DUCT_SECTIONS.map(s => ({ dist: s.dist, dia: s.dia, area: s.area }));
  }
  const length = DUCT_SECTIONS[DUCT_SECTIONS.length - 1].dist;
  const dias = DUCT_SECTIONS.map(s => s.dia);
  return Array.from({ length: n }, (_, i) => {
    const dist = length * i / (n - 1);
    const dia = lerpAlongDuct(dist, dias);
    return { dist, dia, area: Math.PI / 4 * dia * dia };
  });
}

// Default static heads from the same Bernoulli model as the main simulation, evaluated at each tapping.
function customModelHeads(qFactor, taps) {
  const q = qFactor * 1e-5;
  const H0 = Math.max(0, H0_FIT.a + H0_FIT.b * qFactor);
  const hdThroat = dynHead(velocity(q, DUCT_SECTIONS[4].area));
  return taps.map(t => H0 - dynHead(velocity(q, t.area)) - lerpAlongDuct(t.dist, LOSS_COEF) * hdThroat);
}

/* ---- Custom simulation: three flow rates ---- */
const CUSTOM_RUN_COUNT = 3;
const CUSTOM_PRINT_COLORS = ['#0369a1', '#b45309', '#047857'];
const customDefaultLmin = r => lminFromFactor(SAMPLE_RUNS[RUN_KEYS[r]].qFactor);   // Run 1-3 flow rates in L/min
const customTubeLabel = i => `h${subscriptNum(i + 1)}`;
const customQLabel = (r, qf) => `Q${['₁', '₂', '₃'][r]} = ${qf.toFixed(2)} × 10⁻⁵ m³/s`;
let customSimApi = null;      // lets the print report read the current custom readings

// runs = [{ lmin, heads[] }, ...]  ->  velocity, dynamic head, total head and constancy for every run
function customAnalyse(taps, runs) {
  // Bernoulli is compared over the converging part: from h1 to the last tapping at (or just before) the real throat position.
  const throatDist = DUCT_SECTIONS[4].dist + 0.002;
  let tIdx = 0;
  taps.forEach((t, i) => { if (t.dist <= throatDist) tIdx = i; });
  return runs.map((run, r) => {
    const q = (run.lmin * 1e-3) / 60;
    const v = taps.map(t => velocity(q, t.area));
    const hd = v.map(dynHead);
    const tot = run.heads.map((h, i) => h + hd[i]);
    const conv = tot.slice(0, tIdx + 1);
    const hMax = Math.max(...conv), hMin = Math.min(...conv);
    const hMean = conv.reduce((a, b) => a + b, 0) / conv.length;
    let maxRise = 0;
    for (let i = 1; i <= tIdx; i++) maxRise = Math.max(maxRise, tot[i] - tot[i - 1]);
    return {
      n: r + 1, lmin: run.lmin, qf: q * 1e5, heads: run.heads, v, hd, tot, tIdx,
      spread: hMax - hMin,
      idx: hMean > 0 ? Math.max(0, 1 - (hMax - hMin) / hMean) * 100 : 0,
      drop: run.heads[0] - run.heads[tIdx],
      loss: tot[0] - tot[tIdx],
      staticFalls: run.heads[tIdx] < run.heads[0],
      maxRise,
      negIdx: run.heads.findIndex(h => h < 0)
    };
  });
}

// Inference text + summary table built from the three custom runs
function customInference(taps, an) {
  const throat = customTubeLabel(an[0].tIdx);
  const span = `h₁ and ${throat}`;
  const worst = an.reduce((a, b) => (b.idx < a.idx ? b : a));
  const best = an.reduce((a, b) => (b.idx > a.idx ? b : a));
  let cls, headline;
  if (worst.idx >= 95) { cls = 'good'; headline = `Bernoulli's theorem is verified: total head is practically constant between ${span} for all three flow rates.`; }
  else if (worst.idx >= 90) { cls = 'ok'; headline = `Bernoulli's theorem is verified within experimental error: total head is nearly constant between ${span} for all three flow rates.`; }
  else { cls = 'bad'; headline = `The readings do not verify Bernoulli's theorem convincingly: Flow Rate ${worst.n} loses a large share of its total head between ${span}. Re-check its readings.`; }

  const points = an.map(r => {
    const vNote = r.v[0] > 0 ? ` (×${(r.v[r.tIdx] / r.v[0]).toFixed(2)})` : '';
    return `<strong>Flow Rate ${r.n} (Q = ${r.qf.toFixed(2)} × 10⁻⁵ m³/s = ${r.lmin.toFixed(2)} L/min):</strong> from h₁ to ${throat} the velocity rises from ${r.v[0].toFixed(3)} to ${r.v[r.tIdx].toFixed(3)} m/s${vNote}, so the dynamic head grows from ${(r.hd[0] * 1000).toFixed(2)} to ${(r.hd[r.tIdx] * 1000).toFixed(2)} × 10⁻³ m while the static head ${r.drop >= 0 ? 'falls' : 'rises'} by ${mm(Math.abs(r.drop))} mm (${r.heads[0].toFixed(3)} → ${r.heads[r.tIdx].toFixed(3)} m). Total head moves only from ${r.tot[0].toFixed(3)} to ${r.tot[r.tIdx].toFixed(3)} m, a spread of ${mm(r.spread)} mm (constancy ${r.idx.toFixed(1)}%).`;
  });

  points.push(`<strong>Comparative graph:</strong> ${cls === 'bad' ? 'at least one total-head curve is clearly not horizontal, so part of the static-head fall is not being converted into dynamic head.' : 'the three total-head curves are almost horizontal over the converging section, which means the fall in static head is converted into dynamic head.'} Flow Rate ${best.n} is the flattest (${mm(best.spread)} mm spread, ${best.idx.toFixed(1)}%) and Flow Rate ${worst.n} deviates most (${mm(worst.spread)} mm, ${worst.idx.toFixed(1)}%).`);

  const byQ = an.slice().sort((a, b) => a.qf - b.qf);
  const distinct = byQ.every((r, i) => i === 0 || r.qf > byQ[i - 1].qf);
  if (distinct && byQ[0].qf > 0) {
    const stepsUp = key => byQ.every((r, i) => i === 0 || r[key] > byQ[i - 1][key]);
    points.push(`<strong>Effect of flow rate:</strong> as Q increases (${byQ.map(r => r.qf.toFixed(2)).join(', ')} × 10⁻⁵ m³/s) the velocity at ${throat} goes ${byQ.map(r => r.v[r.tIdx].toFixed(2)).join(' → ')} m/s, its dynamic head ${byQ.map(r => (r.hd[r.tIdx] * 1000).toFixed(1)).join(' → ')} × 10⁻³ m and the static-head fall ${byQ.map(r => mm(r.drop)).join(' → ')} mm. ` +
      (stepsUp('drop') ? 'The pressure drop grows with Q, as expected because h<sub>d</sub> = v²/2g varies with Q².' : 'The static-head fall does not increase steadily with Q, so one or more readings should be re-checked.'));
  }

  const warn = [];
  an.forEach(r => {
    if (r.qf > 0 && !r.staticFalls) warn.push(`Flow Rate ${r.n}: the static head does not fall from h₁ to ${throat}, but pressure should drop as the duct narrows.`);
    if (r.maxRise > 0.005) warn.push(`Flow Rate ${r.n}: total head rises by ${mm(r.maxRise)} mm between two tappings, which suggests a reading error or an air bubble in a manometer tube.`);
    if (r.negIdx >= 0) warn.push(`Flow Rate ${r.n}: static head at ${customTubeLabel(r.negIdx)} is below zero, so this flow is more than the bench can deliver.`);
  });
  points.push(warn.length ? `<strong class="inf-warn">Data check:</strong> ${warn.join(' ')}`
    : `<strong>Data check:</strong> the static head falls from h₁ to ${throat} in every run and total head never rises noticeably along the converging section, so the readings are physically consistent.`);
  points.push('<strong>Sources of deviation:</strong> wall friction, manometer reading error (about ±1 mm), fluctuating water levels and small air bubbles in the tubes.');

  const rows = an.map(r => `<tr><td>Flow Rate ${r.n}</td><td>${r.qf.toFixed(2)}</td><td>${r.lmin.toFixed(2)}</td><td>${r.v[r.tIdx].toFixed(3)}</td><td>${mm(r.drop)}</td><td>${r.tot[0].toFixed(3)}</td><td>${r.tot[r.tIdx].toFixed(3)}</td><td>${mm(r.spread)}</td><td>${r.idx.toFixed(1)}%</td></tr>`).join('');
  const table = `<table class="data-table"><thead><tr><th>Run</th><th>Q (×10⁻⁵ m³/s)</th><th>Q (L/min)</th><th>v at ${throat} (m/s)</th><th>h₁→${throat} static fall (mm)</th><th>h<sub>t</sub> at h₁ (m)</th><th>h<sub>t</sub> at ${throat} (m)</th><th>h<sub>t</sub> spread (mm)</th><th>Constancy</th></tr></thead><tbody>${rows}</tbody></table>`;
  return { cls, headline, points, table };
}

function initCustomSimulation() {
  const countSel = document.getElementById('customCount');
  const grid = document.getElementById('customRunsGrid');
  const tablesHost = document.getElementById('customTablesHost');
  const infBox = document.getElementById('customInference');
  const warning = document.getElementById('customWarning');
  const note = document.getElementById('customGeometryNote');
  const resetBtn = document.getElementById('customResetBtn');
  const printBtn = document.getElementById('printCustomLogBtn');
  if (!countSel || !grid || !tablesHost) return;

  const lmins = Array.from({ length: CUSTOM_RUN_COUNT }, (_, r) => customDefaultLmin(r));
  let taps = customTappings(CUSTOM_DEFAULT_TAPS);
  let chart = null;

  if (chartAvailable() && document.getElementById('customChart')) {
    chart = registerChart(new Chart(document.getElementById('customChart').getContext('2d'), {
      type: 'scatter',
      data: { datasets: lmins.map((l, r) => lineDataset(customQLabel(r, factorFromLmin(l)), CHART_COLORS[r], [])) },
      options: headChartOptions('Distance into Duct (m)', 0.1)
    }));
  } else {
    chartFallback('customChart');
  }

  const $ = (id) => document.getElementById(id);
  const headInputs = r => Array.from(grid.querySelectorAll(`.custom-head-input[data-run="${r}"]`));
  const modelHeads = r => customModelHeads(factorFromLmin(lmins[r]), taps);

  // Measured heads of the real apparatus when 6 tappings are used at the measured flow rate, else the Bernoulli model.
  function defaultHeads(r) {
    const measured = taps.length === DUCT_SECTIONS.length && Math.abs(lmins[r] - customDefaultLmin(r)) < 0.005;
    return measured ? SAMPLE_RUNS[RUN_KEYS[r]].staticHeads : modelHeads(r);
  }

  function buildGrid() {
    grid.innerHTML = lmins.map((lmin, r) => {
      const def = defaultHeads(r);
      const inputs = taps.map((_, i) =>
        `<div class="form-group"><label for="customH${r + 1}_${i + 1}">${customTubeLabel(i)} (m):</label>` +
        `<input type="number" id="customH${r + 1}_${i + 1}" step="0.001" class="sim-head-input custom-head-input" data-run="${r}" data-tube="${i}" value="${def[i].toFixed(3)}"></div>`).join('');
      return `<div class="flow-run-box custom-run-box" style="border-top:3px solid ${CHART_COLORS[r]};">
        <h4>Flow Rate ${r + 1} (Q${['₁', '₂', '₃'][r]})</h4>
        <div class="custom-run-flow">
          <label for="customFlowSlider${r + 1}">Flow rate Q (0 to 7 L/min):</label>
          <input type="range" id="customFlowSlider${r + 1}" class="custom-flow-slider" data-run="${r}" min="0" max="${SIM_MAX_LMIN}" step="0.01" value="${lmin.toFixed(3)}">
          <div class="sim-input-row">
            <input type="number" id="customFlowInput${r + 1}" class="sim-num-input custom-flow-input" data-flow-unit="lmin" data-run="${r}" min="0" max="${SIM_MAX_LMIN}" step="0.01" value="${Number(lmin.toFixed(3))}" aria-label="Flow rate ${r + 1} in liters per minute">
            <span class="unit-label">L/min</span>
          </div>
          <span class="range-val-badge" id="customFlowBadge${r + 1}"></span>
        </div>
        <div class="custom-heads-grid">${inputs}</div>
      </div>`;
    }).join('');
    scanFlowInputs();
    note.textContent = taps.length === DUCT_SECTIONS.length
      ? 'Tappings follow the real apparatus positions and diameters (h₁ to h₆).'
      : `Tappings are spaced evenly from 0 to ${DUCT_SECTIONS[DUCT_SECTIONS.length - 1].dist.toFixed(4)} m along the duct; each diameter is interpolated from the real venturi profile (25 → 10 → 25 mm).`;
  }

  function readHeads(r) {
    const def = modelHeads(r);
    return headInputs(r).map((inp, i) => {
      const v = parseFloat(inp.value);
      return Number.isNaN(v) ? def[i] : v;
    });
  }

  function getState() {
    return { taps, runs: lmins.map((lmin, r) => ({ lmin, heads: readHeads(r) })) };
  }

  function render() {
    const st = getState();
    const an = customAnalyse(st.taps, st.runs);

    an.forEach((a, r) => { const b = $(`customFlowBadge${r + 1}`); if (b) b.textContent = `${a.qf.toFixed(2)} × 10⁻⁵ m³/s`; });

    tablesHost.innerHTML = an.map((a, r) => {
      const rows = taps.map((t, i) =>
        `<tr><td><strong>${customTubeLabel(i)}</strong></td><td>${t.dist.toFixed(4)}</td><td>${t.area.toFixed(2)}</td><td>${a.v[i].toFixed(4)}</td><td>${a.heads[i].toFixed(3)}</td><td>${(a.hd[i] * 1000).toFixed(3)}</td><td><strong>${a.tot[i].toFixed(3)}</strong></td></tr>`).join('');
      return `<div class="custom-table-block">
        <h4 style="border-left:4px solid ${CHART_COLORS[r]}; padding-left:0.6rem;">Flow Rate ${r + 1}: ${customQLabel(r, a.qf)} (${a.lmin.toFixed(2)} L/min)</h4>
        <div class="table-responsive"><table class="data-table sim-table">
          <thead><tr><th>Static Tube</th><th>Distance into Duct (m)</th><th>Area of Duct A (m²) ×10⁻⁶</th><th>Velocity v (m/s)</th><th>Static Head h (m)</th><th>Dynamic Head h<sub>d</sub> (m) ×10⁻³</th><th>Total Head h<sub>t</sub> (m)</th></tr></thead>
          <tbody>${rows}</tbody></table></div></div>`;
    }).join('');

    const neg = an.find(a => a.negIdx >= 0);
    if (neg) {
      warning.textContent = `Static head at ${customTubeLabel(neg.negIdx)} (Flow Rate ${neg.n}) is below zero: this flow rate is more than the bench can deliver through the narrowest section. Reduce Q or check your readings.`;
      warning.classList.remove('hidden');
    } else {
      warning.classList.add('hidden');
    }

    if (chart) {
      an.forEach((a, r) => {
        const ds = chart.data.datasets[r];
        ds.label = customQLabel(r, a.qf);
        ds.data = taps.map((t, i) => ({ x: t.dist, y: a.tot[i] }));
      });
      chart.update('none');
    }

    const inf = customInference(taps, an);
    infBox.innerHTML = `<h4>Inference from the Three Custom Flow Rates &amp; Comparative Graph</h4>
      <div class="inf-verdict ${inf.cls}">${inf.headline}</div>
      <div class="table-responsive">${inf.table}</div>
      <ul>${inf.points.map(p => `<li>${p}</li>`).join('')}</ul>`;
  }

  // Moving Q recomputes that run's heads from the Bernoulli model; typing a head overrides it (as in the main simulation).
  function setFlow(r, value, updateHeads, sourceEl) {
    lmins[r] = Math.min(SIM_MAX_LMIN, Math.max(0, value));
    const sl = $(`customFlowSlider${r + 1}`), inp = $(`customFlowInput${r + 1}`);
    if (sl) sl.value = lmins[r];
    if (inp && sourceEl !== inp) inp.value = Number(lmins[r].toFixed(3)).toString();
    if (updateHeads) {
      const h = modelHeads(r);
      headInputs(r).forEach((el, i) => { el.value = h[i].toFixed(3); });
    }
    render();
  }

  function setCount(n) {
    n = Math.min(CUSTOM_MAX_TAPS, Math.max(CUSTOM_MIN_TAPS, n || CUSTOM_DEFAULT_TAPS));
    countSel.value = String(n);
    taps = customTappings(n);
    buildGrid();
    render();
  }

  grid.addEventListener('input', e => {
    const el = e.target;
    const r = parseInt(el.dataset.run, 10);
    if (Number.isNaN(r)) return;
    if (el.classList.contains('custom-flow-slider')) {
      setFlow(r, parseFloat(el.value) || 0, true, el);
    } else if (el.classList.contains('custom-flow-input')) {
      const v = parseFloat(el.value);
      setFlow(r, Number.isNaN(v) ? 0 : v, true, el);
    } else if (el.classList.contains('custom-head-input')) {
      render();
    }
  });
  countSel.addEventListener('change', () => setCount(parseInt(countSel.value, 10)));
  resetBtn.addEventListener('click', () => {
    lmins.forEach((_, r) => { lmins[r] = customDefaultLmin(r); });
    setCount(CUSTOM_DEFAULT_TAPS);
  });
  if (printBtn) printBtn.addEventListener('click', printCustomLog);

  customSimApi = { getState };
  setCount(CUSTOM_DEFAULT_TAPS);
}

function syncMultiInputs() {
  multiExpData.forEach((run, r) => {
    document.getElementById(`multiQ${r + 1}`).value = run.qFactor;
    run.heads.forEach((h, t) => { const f = document.getElementById(`m${r + 1}_h${t + 1}`); if (f) f.value = h; });
  });
}

function initMultiExperimentSection() {
  syncMultiInputs();
  document.querySelectorAll('.multi-q-input').forEach((inp, idx) => {
    inp.addEventListener('input', e => {
      const v = parseFloat(e.target.value);
      if (Number.isFinite(v) && v >= 0) { multiExpData[idx].qFactor = v; saveAndRefreshMultiExp(); }
    });
  });
  document.querySelectorAll('.multi-h-input').forEach(inp => {
    inp.addEventListener('input', e => {
      const r = parseInt(e.target.dataset.run, 10), t = parseInt(e.target.dataset.tube, 10);
      const v = parseFloat(e.target.value);
      if (Number.isFinite(v)) { multiExpData[r].heads[t] = v; saveAndRefreshMultiExp(); }
    });
  });
  document.getElementById('resetMultiBtn').addEventListener('click', () => {
    multiExpData = defaultMulti();
    syncMultiInputs();
    saveAndRefreshMultiExp();
  });
  initMultiExpChart();
  renderCompareTable();
  renderMultiInference();
}

function saveAndRefreshMultiExp() {
  safeSet(KEYS.multi, multiExpData);
  updateMultiExpChart();
  renderCompareTable();
  renderMultiInference();
}
/* ---------- Inference generated from the three-flow-rate readings ---------- */
function analyseRuns() {
  return multiExpData.map((run, r) => {
    const tot = totalHeadsFor(run.qFactor, run.heads);
    const q = run.qFactor * 1e-5;
    const v = DUCT_SECTIONS.map(s => velocity(q, s.area));
    const hd = v.map(dynHead);
    const conv = tot.slice(0, 5);
    const spread = Math.max(...conv) - Math.min(...conv);
    let maxRise = 0;
    for (let i = 1; i < 5; i++) maxRise = Math.max(maxRise, tot[i] - tot[i - 1]);
    return {
      n: r + 1, qf: run.qFactor, lmin: lminFromFactor(run.qFactor), h: run.heads, tot, v, hd, spread,
      idx: constancyIndex(tot) * 100,
      drop15: run.heads[0] - run.heads[4],            // measured static-head fall h1 -> h5
      loss15: tot[0] - tot[4],                         // total head lost h1 -> h5
      loss56: tot[4] - tot[5],                         // total head lost h5 -> h6
      recovery: run.heads[5] - run.heads[4],           // static-head recovery h5 -> h6
      throatIsMin: run.heads[4] === Math.min(...run.heads),
      maxRise
    };
  });
}
const mm = x => (x * 1000).toFixed(1);

function buildInference() {
  const R = analyseRuns();
  const worst = R.reduce((a, b) => (b.idx < a.idx ? b : a));
  const best = R.reduce((a, b) => (b.idx > a.idx ? b : a));
  let cls, headline;
  if (worst.idx >= 95) { cls = 'good'; headline = "Bernoulli's theorem is verified: total head is practically constant from h₁ to h₅ in all three runs."; }
  else if (worst.idx >= 90) { cls = 'ok'; headline = "Bernoulli's theorem is verified within experimental error: total head is nearly constant from h₁ to h₅ in all three runs."; }
  else { cls = 'bad'; headline = `The readings do not verify Bernoulli's theorem convincingly: Run ${worst.n} loses a large share of its total head between h₁ and h₅. Re-check its readings.`; }

  const points = [];
  R.forEach(r => points.push(
    `<strong>Run ${r.n} (Q = ${r.qf} × 10⁻⁵ m³/s = ${r.lmin.toFixed(2)} L/min):</strong> from h₁ to the throat h₅ the velocity rises from ${r.v[0].toFixed(3)} to ${r.v[4].toFixed(3)} m/s (×${(r.v[4] / r.v[0]).toFixed(2)}), so the dynamic head grows from ${(r.hd[0] * 1000).toFixed(2)} to ${(r.hd[4] * 1000).toFixed(2)} × 10⁻³ m while the static head falls by ${mm(r.drop15)} mm (${r.h[0].toFixed(3)} → ${r.h[4].toFixed(3)} m). Total head moves only from ${r.tot[0].toFixed(3)} to ${r.tot[4].toFixed(3)} m, a spread of ${mm(r.spread)} mm (constancy ${r.idx.toFixed(1)}%).`));

  points.push(`<strong>Comparative graph:</strong> ${cls === 'bad' ? 'at least one total-head curve is clearly not horizontal over h₁–h₅, so part of the static-head fall is not being converted into dynamic head.' : 'the three total-head curves are almost horizontal over h₁–h₅, which means the fall in static head is converted into dynamic head.'} Run ${best.n} is the flattest (${mm(best.spread)} mm spread, ${best.idx.toFixed(1)}%) and Run ${worst.n} deviates most (${mm(worst.spread)} mm, ${worst.idx.toFixed(1)}%).${R.every(r => r.loss56 > 0) ? ' All curves bend downward at h₆.' : ''}`);

  const byQ = R.slice().sort((a, b) => a.qf - b.qf);
  const inc = key => byQ.every((r, i) => i === 0 || r[key] > byQ[i - 1][key]);
  const trend = [];
  trend.push(`throat velocity ${byQ.map(r => r.v[4].toFixed(2)).join(' → ')} m/s`);
  trend.push(`throat dynamic head ${byQ.map(r => (r.hd[4] * 1000).toFixed(1)).join(' → ')} × 10⁻³ m`);
  trend.push(`static-head fall h₁→h₅ ${byQ.map(r => mm(r.drop15)).join(' → ')} mm`);
  trend.push(`inlet total head ${byQ.map(r => r.tot[0].toFixed(3)).join(' → ')} m`);
  const ok = inc('drop15') && inc('qf');
  points.push(`<strong>Effect of flow rate:</strong> as Q increases (${byQ.map(r => r.qf).join(', ')} × 10⁻⁵ m³/s) we get ${trend.join('; ')}. ` +
    (ok ? 'The pressure drop at the throat grows with Q, as expected because hd = v²/2g varies with Q², and the whole total-head line rises with Q because more energy is supplied at the inlet.'
        : 'The static-head fall does not increase steadily with Q, so one or more readings should be re-checked.'));

  points.push(`<strong>Losses:</strong> between h₁ and h₅ the total head falls by ${R.map(r => `${mm(r.loss15)} mm`).join(', ')} (Runs 1–3), only ${R.map(r => `${(r.loss15 / r.hd[4] * 100).toFixed(0)}%`).join(', ')} of the throat dynamic head${R.every(r => r.loss15 / r.hd[4] < 0.3) ? ', so friction in the converging part is small' : ', so losses in the converging part are noticeable'}. Beyond the throat the total head drops by a further ${R.map(r => `${mm(r.loss56)} mm`).join(', ')} and the static head recovers by only ${R.map(r => `${mm(r.recovery)} mm`).join(', ')} (about ${R.map(r => `${(r.recovery / r.drop15 * 100).toFixed(0)}%`).join(', ')} of the fall). The diverging section therefore loses far more energy (flow separation and expansion) than the converging section, which is why Bernoulli's theorem is applied only up to h₅.`);

  const warn = [];
  R.forEach(r => {
    if (!r.throatIsMin) warn.push(`Run ${r.n}: h₅ is not the lowest static head, but the throat should have the lowest pressure.`);
    if (r.maxRise > 0.005) warn.push(`Run ${r.n}: total head rises by ${mm(r.maxRise)} mm between two tappings, which suggests a reading error or an air bubble in a manometer tube.`);
  });
  points.push(warn.length ? `<strong class="inf-warn">Data check:</strong> ${warn.join(' ')}`
    : '<strong>Data check:</strong> h₅ has the lowest static head in every run and total head never rises noticeably along the flow, so the readings are physically consistent.');
  points.push('<strong>Sources of deviation:</strong> wall friction, manometer reading error (about ±1 mm), fluctuating water levels and small air bubbles in the tubes.');

  const rows = R.map(r => `<tr><td>Run ${r.n}</td><td>${r.qf}</td><td>${r.v[4].toFixed(3)}</td><td>${mm(r.drop15)}</td><td>${r.tot[0].toFixed(3)}</td><td>${r.tot[4].toFixed(3)}</td><td>${mm(r.spread)}</td><td>${r.idx.toFixed(1)}%</td></tr>`).join('');
  const table = `<table class="data-table"><thead><tr><th>Run</th><th>Q (×10⁻⁵ m³/s)</th><th>v at h₅ (m/s)</th><th>h₁→h₅ static fall (mm)</th><th>h<sub>t</sub> at h₁ (m)</th><th>h<sub>t</sub> at h₅ (m)</th><th>h<sub>t</sub> spread h₁–h₅ (mm)</th><th>Constancy</th></tr></thead><tbody>${rows}</tbody></table>`;
  return { cls, headline, points, table };
}

function renderMultiInference() {
  const box = document.getElementById('multiInference');
  if (!box) return;
  const inf = buildInference();
  box.innerHTML = `<h4>Inference from the Three Flow Rates &amp; Comparative Graph</h4>
    <div class="inf-verdict ${inf.cls}">${inf.headline}</div>
    <div class="table-responsive">${inf.table}</div>
    <ul>${inf.points.map(p => `<li>${p}</li>`).join('')}</ul>`;
}


function initMultiExpChart() {
  if (!chartAvailable()) { chartFallback('multiExpChart'); return; }
  multiExpChartInstance = registerChart(new Chart(document.getElementById('multiExpChart').getContext('2d'), {
    type: 'scatter',
    data: { datasets: multiExpData.map((run, r) => lineDataset(multiLabel(r), CHART_COLORS[r], totalHeadsFor(run.qFactor, run.heads))) },
    options: headChartOptions('Distance into Duct (m)', 0.1)
  }));
}
function updateMultiExpChart() {
  if (!multiExpChartInstance) return;
  multiExpData.forEach((run, r) => {
    const ds = multiExpChartInstance.data.datasets[r];
    ds.label = multiLabel(r);
    ds.data = toPoints(totalHeadsFor(run.qFactor, run.heads));
  });
  multiExpChartInstance.update();
}

function renderCompareTable() {
  const tbody = document.getElementById('compareTbody');
  if (!tbody) return;
  const totals = multiExpData.map(r => totalHeadsFor(r.qFactor, r.heads));
  multiExpData.forEach((r, i) => { document.getElementById(`cmpHead${i + 1}`).textContent = `Run ${i + 1} (Q = ${r.qFactor} × 10⁻⁵)`; });
  tbody.innerHTML = DUCT_SECTIONS.map((s, i) =>
    `<tr${i === 4 ? ' class="throat-row"' : ''}><td><strong>${s.id}</strong></td><td>${s.dist.toFixed(4)}</td>${totals.map(t => `<td>${t[i].toFixed(3)}</td>`).join('')}</tr>`
  ).join('');
}

/* ==========================================================================
   8. OBSERVATION TABLE + CONSTANCY INDEX
   ========================================================================== */
function constancyIndex(totalHeads) {
  const conv = totalHeads.slice(0, 5);
  const hMax = Math.max(...conv), hMin = Math.min(...conv);
  const hMean = conv.reduce((a, b) => a + b, 0) / conv.length;
  return Math.max(0, 1 - (hMax - hMin) / hMean);
}

function renderObservationTable() {
  const tbody = document.getElementById('obsTableBody');
  if (!tbody) return;
  const totals = [];
  tbody.innerHTML = activeObservations.map((row, index) => {
    const v = velocity(row.qFactor * 1e-5, row.area);
    const hd = dynHead(v);
    const tot = row.h_m + hd;
    totals.push(tot);
    return `<tr>
      <td>${row.qFactor}</td>
      <td><strong>${row.tube}</strong></td>
      <td>${row.dist.toFixed(4)}</td>
      <td>${row.area.toFixed(2)}</td>
      <td><input type="number" step="0.001" class="editable-cell" aria-label="Static head ${row.tube} in metres" data-idx="${index}" value="${row.h_m.toFixed(3)}" style="width: 85px;"></td>
      <td>${v.toFixed(4)}</td>
      <td>${(hd * 1000).toFixed(3)}</td>
      <td><strong style="color:var(--cyan-light);">${tot.toFixed(3)}</strong></td>
    </tr>`;
  }).join('');

  const pct = (constancyIndex(totals) * 100).toFixed(2);
  const bar = document.getElementById('agreementBar');
  const val = document.getElementById('agreementPercentValue');
  if (bar) { bar.style.width = `${pct}%`; bar.textContent = `${pct}% Constancy`; }
  if (val) val.textContent = `${pct}%`;

  tbody.querySelectorAll('.editable-cell').forEach(inp => {
    inp.addEventListener('change', e => {
      const idx = parseInt(e.target.dataset.idx, 10);
      const v = parseFloat(e.target.value);
      if (!Number.isNaN(v)) {
        activeObservations[idx].h_m = v;
        safeSet(KEYS.obs, activeObservations);
        renderObservationTable();
        updateChartData();
      }
    });
  });
}

function loadSampleRun(key) {
  if (!SAMPLE_RUNS[key]) return;
  activeObservations = defaultObs(key);
  safeSet(KEYS.obs, activeObservations);
  renderObservationTable();
  updateChartData();
}

function initObservationControls() {
  RUN_KEYS.forEach((k, i) => document.getElementById(`loadSampleRun${i + 1}Btn`).addEventListener('click', () => loadSampleRun(k)));
  document.getElementById('clearTableBtn').addEventListener('click', () => {
    if (confirm('Reset table values to default Run 1 manual dataset?')) loadSampleRun('run1');
  });
  document.getElementById('exportCsvBtn').addEventListener('click', () => {
    let csv = 'Flow_Rate(x10-5_m3/s),Static_Tube,Distance(m),Area(m2),Static_Head(m),Velocity(m/s),Dynamic_Head(x10-3_m),Total_Head(m)\n';
    activeObservations.forEach(r => {
      const v = velocity(r.qFactor * 1e-5, r.area), hd = dynHead(v);
      csv += `${r.qFactor},${r.tube},${r.dist},${r.area * 1e-6},${r.h_m},${v.toFixed(4)},${(hd * 1000).toFixed(3)},${(r.h_m + hd).toFixed(3)}\n`;
    });
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url; a.download = 'Bernoulli_Lab_Manual_Observations.csv';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
}

/* ==========================================================================
   9. Q = V / t CALCULATOR + SINGLE-SECTION CALCULATOR
   ========================================================================== */
function initQCalc() {
  const ids = ['qcV', 'qcT1', 'qcT2', 'qcT3'].map(id => document.getElementById(id));
  const out = document.getElementById('qcOut');
  const sub = ['₁', '₂', '₃'];
  let results = [];

  function compute() {
    const V = parseFloat(ids[0].value);
    results = [1, 2, 3].map(i => {
      const t = parseFloat(ids[i].value);
      if (!(V > 0) || !(t > 0)) return null;
      const Q = (V * 1e-3) / t;
      return { Q, qf: Q * 1e5, lmin: Q * 60000, t };
    });
    out.innerHTML = results.map((r, i) => r
      ? `<div>Q${sub[i]} = ${V} L / ${r.t} s = <code>${r.qf.toFixed(2)} × 10⁻⁵ m³/s</code> (${r.lmin.toFixed(2)} L/min)</div>`
      : `<div>Q${sub[i]}: enter a positive volume and time.</div>`).join('');
  }
  ids.forEach(el => el.addEventListener('input', compute));
  document.getElementById('qcApplyBtn').addEventListener('click', () => {
    if (results.some(r => !r)) return;
    results.forEach((r, i) => { multiExpData[i].qFactor = Number(r.qf.toFixed(2)); });
    syncMultiInputs();
    saveAndRefreshMultiExp();
  });
  compute();
}

function initCalculator() {
  const outputBox = document.getElementById('calcStepsDetails');
  document.getElementById('calcSampleBtn').addEventListener('click', () => {
    document.getElementById('calcVol').value = '7.20';
    document.getElementById('calcDia').value = '78.54';
    document.getElementById('calcStaticHead').value = '0.137';
  });
  document.getElementById('calcComputeBtn').addEventListener('click', () => {
    const qFactor = parseFloat(document.getElementById('calcVol').value);
    const areaE6 = parseFloat(document.getElementById('calcDia').value);
    const hM = parseFloat(document.getElementById('calcStaticHead').value);
    if (Number.isNaN(qFactor) || Number.isNaN(areaE6) || Number.isNaN(hM) || qFactor <= 0 || areaE6 <= 0) {
      outputBox.innerHTML = '<span style="color:var(--accent-red);">Please enter valid positive values.</span>';
      return;
    }
    const Q = qFactor * 1e-5, areaM2 = areaE6 * 1e-6;
    const vel = Q / areaM2, hd = dynHead(vel), tot = hM + hd;
    outputBox.innerHTML = `
      <div style="line-height:1.8;">
        <strong>1. Flow Rate (Q):</strong><br>
        <code>Q = ${qFactor} × 10⁻⁵ m³/s = <strong>${Q.toExponential(4)} m³/s</strong></code><br>
        <strong>2. Velocity (v = Q / A):</strong><br>
        <code>v = (${Q.toExponential(3)}) / (${areaM2.toExponential(3)}) = <strong>${vel.toFixed(4)} m/s</strong></code><br>
        <strong>3. Dynamic Head (hd = v² / 2g):</strong><br>
        <code>hd = (${vel.toFixed(4)})² / (2 × ${GRAVITY}) = <strong>${(hd * 1000).toFixed(3)} × 10⁻³ m</strong></code><br>
        <strong>4. Total Head (ht):</strong><br>
        <code>ht = Static Head + Dynamic Head = ${hM.toFixed(3)} + ${hd.toFixed(4)} = <strong style="color:var(--cyan-light);">${tot.toFixed(3)} m</strong></code>
      </div>`;
  });
}

/* ==========================================================================
   10. TOTAL HEAD vs POSITION GRAPH (true distance axis)
   ========================================================================== */
let chartInstance = null;

function initChart() {
  if (!chartAvailable()) { chartFallback('bernoulliChart'); updateChartData(); return; }
  const runSets = RUN_KEYS.map(k => SAMPLE_RUNS[k]);
  const datasets = runSets.map((r, i) => lineDataset(`Run ${i + 1}: Q = ${r.qFactor} × 10⁻⁵ m³/s (ht)`, CHART_COLORS[i], r.totalHeads));
  datasets.push(lineDataset('Observation table (current)', CHART_COLORS[3], totalHeadsFor(activeObservations[0].qFactor, activeObservations.map(r => r.h_m)), { borderDash: [8, 5], pointStyle: 'rectRot' }));
  runSets.forEach((r, i) => datasets.push(lineDataset(`Run ${i + 1} static head h`, CHART_COLORS[i], r.staticHeads, { borderDash: [3, 4], borderWidth: 2, pointRadius: 3, hidden: true })));

  chartInstance = registerChart(new Chart(document.getElementById('bernoulliChart').getContext('2d'), {
    type: 'scatter',
    data: { datasets },
    options: headChartOptions('Position of Tube / Distance into Duct (m)', 0.1)
  }));
  chartInstance.options.scales.y.suggestedMin = 0.05;

  document.getElementById('refreshGraphBtn').addEventListener('click', updateChartData);
  const staticBtn = document.getElementById('toggleStaticBtn');
  let showStatic = false;
  staticBtn.addEventListener('click', () => {
    showStatic = !showStatic;
    [4, 5, 6].forEach(i => chartInstance.setDatasetVisibility(i, showStatic));
    chartInstance.update();
    staticBtn.setAttribute('aria-pressed', showStatic ? 'true' : 'false');
    staticBtn.textContent = showStatic ? 'Hide static head h' : 'Show static head h (dashed)';
  });
  updateChartData();
}

function updateChartData() {
  if (chartInstance) {
    const ds = chartInstance.data.datasets[3];
    ds.data = toPoints(totalHeadsFor(activeObservations[0].qFactor, activeObservations.map(r => r.h_m)));
    ds.label = `Observation table (Q = ${activeObservations[0].qFactor} × 10⁻⁵ m³/s)`;
    chartInstance.update();
  }
  const verdict = document.getElementById('graphVerdictText');
  if (verdict) {
    const spreads = RUN_KEYS.map(k => {
      const t = SAMPLE_RUNS[k].totalHeads.slice(0, 5);
      return (Math.max(...t) - Math.min(...t)) * 1000;
    });
    verdict.textContent = `For Q = (7.2, 9.24, 10.17) × 10⁻⁵ m³/s the total head stays nearly horizontal across the converging sections h₁ to h₅ (spread of only ${spreads.map(s => s.toFixed(0)).join(', ')} mm), which verifies Bernoulli's theorem. The larger drop at h₆ is due to frictional and expansion losses in the diverging section.`;
  }
}

/* ==========================================================================
   11. QUIZ (shuffled options, results screen, review, best score)
   ========================================================================== */
function shuffled(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

function initQuiz() {
  let idx = 0, score = 0, answers = [];
  const $ = id => document.getElementById(id);
  const qNum = $('currentQNum'), qTotal = $('totalQCount'), scoreBadge = $('quizScore');
  const qBox = $('quizQuestionBox'), qText = $('quizQuestionText'), optBox = $('quizOptionsContainer');
  const expBox = $('quizExplanationBox'), expText = $('explanationText');
  const nextBtn = $('quizNextBtn'), restartBtn = $('quizRestartBtn'), bar = $('quizProgressBar'), resultBox = $('quizResultBox');
  let QUIZ_QUESTIONS = buildQuizSet();
  const last = QUIZ_QUESTIONS.length - 1;
  qTotal.textContent = QUIZ_QUESTIONS.length;

  function loadQuestion(i) {
    expBox.classList.add('hidden');
    nextBtn.style.display = 'none';
    restartBtn.style.display = 'none';
    optBox.innerHTML = '';
    const q = QUIZ_QUESTIONS[i];
    qNum.textContent = i + 1;
    qText.textContent = q.question;
    bar.style.width = `${((i + 1) / QUIZ_QUESTIONS.length) * 100}%`;
    shuffled(q.options.map((text, o) => ({ text, ok: o === q.correct }))).forEach(item => {
      const btn = document.createElement('button');
      btn.className = 'quiz-option-btn';
      btn.textContent = item.text;
      btn.addEventListener('click', () => choose(item, q, btn));
      optBox.appendChild(btn);
    });
  }

  function choose(item, q, btn) {
    const buttons = optBox.querySelectorAll('.quiz-option-btn');
    buttons.forEach(b => { b.disabled = true; if (b.textContent === q.options[q.correct]) b.classList.add('correct'); });
    if (item.ok) { btn.classList.add('correct'); score += q.marks; scoreBadge.textContent = score; }
    else btn.classList.add('wrong');
    answers.push({ question: q.question, chosen: item.text, correct: q.options[q.correct], ok: item.ok, explanation: q.explanation });
    expText.textContent = q.explanation;
    expBox.classList.remove('hidden');
    nextBtn.textContent = idx < last ? 'Next Question →' : 'See Results →';
    nextBtn.style.display = 'inline-block';
  }

  function showResults() {
    const pass = score / QUIZ_TOTAL_MARKS >= QUIZ_PASS_FRACTION;
    const prev = safeGet(KEYS.quiz, null);
    const best = Math.max(score, prev && isNum(prev.best) ? prev.best : 0);
    safeSet(KEYS.quiz, { best, last: score });
    qBox.style.display = 'none';
    expBox.classList.add('hidden');
    nextBtn.style.display = 'none';
    restartBtn.style.display = 'inline-block';
    resultBox.classList.remove('hidden');
    resultBox.innerHTML = '';
    const mk = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; e.textContent = text; return e; };
    resultBox.appendChild(mk('div', 'quiz-result-score', `${score} / ${QUIZ_TOTAL_MARKS}`));
    resultBox.appendChild(mk('div', `quiz-result-verdict ${pass ? 'pass' : 'fail'}`,
      pass ? 'Well done, you passed! You have understood the experiment.' : `Keep practising: you need ${Math.ceil(QUIZ_TOTAL_MARKS * QUIZ_PASS_FRACTION)} marks to pass. Review the theory and try again.`));
    resultBox.appendChild(mk('p', 'small-desc', `Best score on this device: ${best} / ${QUIZ_TOTAL_MARKS}`));
    const list = mk('ol', 'quiz-review');
    answers.forEach(a => {
      const li = mk('li', a.ok ? 'ok' : 'bad', a.question);
      li.appendChild(mk('small', '', a.ok ? `✓ Your answer: ${a.chosen}` : `✗ Your answer: ${a.chosen}. Correct: ${a.correct}`));
      li.appendChild(mk('small', '', a.explanation));
      list.appendChild(li);
    });
    resultBox.appendChild(list);
  }

  function restart() {
    idx = 0; score = 0; answers = [];
    QUIZ_QUESTIONS = buildQuizSet();
    scoreBadge.textContent = 0;
    resultBox.classList.add('hidden');
    qBox.style.display = '';
    loadQuestion(0);
  }

  nextBtn.addEventListener('click', () => { if (idx < last) { idx++; loadQuestion(idx); } else showResults(); });
  restartBtn.addEventListener('click', restart);
  scoreBadge.textContent = 0;
  loadQuestion(0);
}

/* ==========================================================================
   12. NAVIGATION, THEME, SCROLL-SPY, PROGRESS
   ========================================================================== */
function initNavControls() {
  const themeBtn = document.getElementById('themeToggleBtn');
  themeBtn.addEventListener('click', () => {
    const next = document.body.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    document.body.setAttribute('data-theme', next);
    safeSet(KEYS.theme, next);
    refreshThemeColors();
    applyChartTheme();
  });

  const motionBtn = document.getElementById('motionToggleBtn');
  motionBtn.addEventListener('click', () => {
    const on = document.body.classList.toggle('reduced-motion');
    motionBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
    safeSet(KEYS.motion, on);
    allCharts.forEach(ch => { ch.options.animation = { duration: on ? 0 : 600 }; });
  });

  document.getElementById('fullscreenBtn').addEventListener('click', () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => {});
    else document.exitFullscreen().catch(() => {});
  });

  const hamburger = document.getElementById('hamburgerBtn');
  const navMenu = document.getElementById('navMenu');
  const setMenu = open => {
    navMenu.classList.toggle('show', open);
    hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
  };
  hamburger.addEventListener('click', () => setMenu(!navMenu.classList.contains('show')));
  document.querySelectorAll('.nav-menu a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

  // scroll-spy
  const links = Array.from(document.querySelectorAll('.nav-menu a'));
  const byId = {};
  links.forEach(a => { byId[a.getAttribute('href').slice(1)] = a; });
  if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        links.forEach(a => { a.classList.remove('active'); a.removeAttribute('aria-current'); });
        const a = byId[en.target.id];
        if (a) { a.classList.add('active'); a.setAttribute('aria-current', 'true'); }
      });
    }, { rootMargin: '-30% 0px -60% 0px' });
    Object.keys(byId).forEach(id => { const s = document.getElementById(id); if (s) spy.observe(s); });
  }

  // scroll progress
  const progress = document.getElementById('scrollProgress');
  const updateProgress = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = max > 0 ? `${Math.min(100, (window.scrollY / max) * 100)}%` : '0%';
  };
  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();

  document.getElementById('printReportBtn').addEventListener('click', () => window.print());
  document.getElementById('resetAllDataBtn').addEventListener('click', () => {
    if (confirm('Reset all stored laboratory observations, three-flow-rate readings, your name/register number and the saved quiz best score?')) {
      safeClearLabData();
      location.reload();
    }
  });
}

/* ==========================================================================
   13. PRINTING: full page + stand-alone "Complete Experiment Log" lab report
   ========================================================================== */
function initPrintSupport() {
  window.addEventListener('beforeprint', () => applyChartTheme('print'));
  window.addEventListener('afterprint', () => {
    document.body.classList.remove('printing-log');
    applyChartTheme();
  });
  ['printLabLogBtn', 'printLabLogBtn2'].forEach(id => {
    const b = document.getElementById(id);
    if (b) b.addEventListener('click', printLabLog);
  });
}

// Renders the three-run chart on a white canvas with dark text so it is readable on paper.
function chartImageForReport() {
  if (!chartAvailable()) return '';
  const canvas = document.createElement('canvas');
  canvas.width = 900; canvas.height = 480;
  const opts = headChartOptions('Distance into Duct (m)', 0.1);
  opts.responsive = false; opts.animation = false; opts.devicePixelRatio = 1;
  const p = chartPalette('print');
  ['x', 'y'].forEach(ax => { opts.scales[ax].ticks.color = p.text; opts.scales[ax].title.color = p.muted; opts.scales[ax].grid.color = p.grid; });
  opts.plugins.legend.labels.color = p.text;
  const printColors = ['#0369a1', '#b45309', '#047857'];
  const chart = new Chart(canvas.getContext('2d'), {
    type: 'scatter',
    data: { datasets: multiExpData.map((run, r) => lineDataset(multiLabel(r), printColors[r], totalHeadsFor(run.qFactor, run.heads))) },
    options: opts,
    plugins: [{ id: 'whiteBg', beforeDraw(c) { c.ctx.save(); c.ctx.globalCompositeOperation = 'destination-over'; c.ctx.fillStyle = '#ffffff'; c.ctx.fillRect(0, 0, c.width, c.height); c.ctx.restore(); } }]
  });
  const url = canvas.toDataURL('image/png');
  chart.destroy();
  return url;
}

function printLabLog() {
  const host = document.getElementById('labReportPrint');
  if (!host) return;
  const val = id => { const el = document.getElementById(id); return el && el.textContent.trim() ? el.textContent.trim() : '____________________'; };
  const volume = parseFloat(document.getElementById('qcV').value) || STOPWATCH.volumeL;
  const times = ['qcT1', 'qcT2', 'qcT3'].map((id, i) => parseFloat(document.getElementById(id).value) || STOPWATCH.times[i]);
  const totals = multiExpData.map(r => totalHeadsFor(r.qFactor, r.heads));
  const dateStr = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  let img = '';
  try { img = chartImageForReport(); } catch (err) { console.error('Report graph failed', err); }
  const inf = buildInference();

  const flowRows = multiExpData.map((r, i) =>
    `<tr><td>${i + 1}</td><td>${volume}</td><td>${times[i]}</td><td>${r.qFactor}</td><td>${lminFromFactor(r.qFactor).toFixed(2)}</td></tr>`).join('');
  const headRows = DUCT_SECTIONS.map((s, i) =>
    `<tr><td>${s.id}</td><td>${s.dist.toFixed(4)}</td><td>${s.area.toFixed(2)}</td>${multiExpData.map(r => `<td>${r.heads[i].toFixed(3)}</td>`).join('')}</tr>`).join('');
  const totalRows = DUCT_SECTIONS.map((s, i) =>
    `<tr><td>${s.id}</td>${multiExpData.map((r, k) => {
      const hd = dynHead(velocity(r.qFactor * 1e-5, s.area));
      return `<td>${(hd * 1000).toFixed(3)}</td><td>${totals[k][i].toFixed(3)}</td>`;
    }).join('')}</tr>`).join('');
  const idxRow = totals.map(t => `<td colspan="2">${(constancyIndex(t) * 100).toFixed(2)}%</td>`).join('');

  host.innerHTML = `
    <h1>Verification of Bernoulli’s Theorem: Complete Experiment Log</h1>
    <div>Fluid Mechanics Laboratory • Experiment No: 4 • Three Flow Rates Data Entry &amp; Comparative Graph</div>
    <div class="lr-meta">
      <div><strong>Student Name:</strong> ${val('fieldName')}</div>
      <div><strong>Register Number:</strong> ${val('fieldRoll')}</div>
      <div><strong>Course:</strong> Fluid Mechanics and Machinery</div>
      <div><strong>Academic Year:</strong> 2026 - 2027</div>
      <div><strong>Printed on:</strong> ${dateStr}</div>
      <div><strong>Team:</strong> Harsh Sarda (25BME0088, Leader), Jaival Desai (25BME0048), Moksh Patel (25BME0047)</div>
    </div>

    <h2>1. Flow rate measurement (Q = V / t)</h2>
    <table><thead><tr><th>Run</th><th>Volume V (L)</th><th>Time t (s)</th><th>Q (×10⁻⁵ m³/s)</th><th>Q (L/min)</th></tr></thead><tbody>${flowRows}</tbody></table>

    <h2>2. Static head readings h (m)</h2>
    <table><thead><tr><th>Tube</th><th>Distance (m)</th><th>Area A (×10⁻⁶ m²)</th><th>Run 1 h</th><th>Run 2 h</th><th>Run 3 h</th></tr></thead><tbody>${headRows}</tbody></table>

    <h2>3. Dynamic head h<sub>d</sub> (×10⁻³ m) and total head h<sub>t</sub> (m)</h2>
    <table><thead><tr><th rowspan="2">Tube</th><th colspan="2">Run 1</th><th colspan="2">Run 2</th><th colspan="2">Run 3</th></tr>
      <tr><th>h<sub>d</sub></th><th>h<sub>t</sub></th><th>h<sub>d</sub></th><th>h<sub>t</sub></th><th>h<sub>d</sub></th><th>h<sub>t</sub></th></tr></thead>
      <tbody>${totalRows}<tr><td><strong>Constancy h₁–h₅</strong></td>${idxRow}</tr></tbody></table>
    <div>Formulas: v = Q / A, h<sub>d</sub> = v² / 2g (g = 9.8 m/s²), h<sub>t</sub> = h + h<sub>d</sub>. Constancy = 1 − (h<sub>t,max</sub> − h<sub>t,min</sub>) / h<sub>t,mean</sub> over h₁–h₅.</div>

    <h2>4. Comparative graph: total head vs. distance into duct</h2>
    ${img ? `<img src="${img}" alt="Comparative graph of total head versus distance for the three flow rates">` : '<p>(Graph unavailable: chart library not loaded.)</p>'}

    <h2>5. Inference (based on the readings above)</h2>
    <div class="lr-verdict">${inf.headline}</div>
    ${inf.table}
    <ul>${inf.points.map(p => `<li>${p}</li>`).join('')}</ul>
    <div class="lr-sign"><span>Student signature: ____________________</span><span>Faculty signature: ____________________</span></div>`;

  document.body.classList.add('printing-log');
  window.print();
}


// White-background copy of the custom comparative graph so it is readable on paper.
function customChartImageForReport(taps, an) {
  if (!chartAvailable()) return '';
  const canvas = document.createElement('canvas');
  canvas.width = 900; canvas.height = 480;
  const opts = headChartOptions('Distance into Duct (m)', 0.1);
  opts.responsive = false; opts.animation = false; opts.devicePixelRatio = 1;
  const p = chartPalette('print');
  ['x', 'y'].forEach(ax => { opts.scales[ax].ticks.color = p.text; opts.scales[ax].title.color = p.muted; opts.scales[ax].grid.color = p.grid; });
  opts.plugins.legend.labels.color = p.text;
  const chart = new Chart(canvas.getContext('2d'), {
    type: 'scatter',
    data: { datasets: an.map((a, r) => lineDataset(customQLabel(r, a.qf), CUSTOM_PRINT_COLORS[r], [], { data: taps.map((t, i) => ({ x: t.dist, y: a.tot[i] })) })) },
    options: opts,
    plugins: [{ id: 'whiteBg', beforeDraw(c) { c.ctx.save(); c.ctx.globalCompositeOperation = 'destination-over'; c.ctx.fillStyle = '#ffffff'; c.ctx.fillRect(0, 0, c.width, c.height); c.ctx.restore(); } }]
  });
  const url = canvas.toDataURL('image/png');
  chart.destroy();
  return url;
}

function printCustomLog() {
  const host = document.getElementById('labReportPrint');
  if (!host || !customSimApi) return;
  const val = id => { const el = document.getElementById(id); return el && el.textContent.trim() ? el.textContent.trim() : '____________________'; };
  const { taps, runs } = customSimApi.getState();
  const an = customAnalyse(taps, runs);
  const inf = customInference(taps, an);
  const dateStr = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  let img = '';
  try { img = customChartImageForReport(taps, an); } catch (err) { console.error('Custom report graph failed', err); }
  const throat = customTubeLabel(an[0].tIdx);

  const flowRows = an.map(a =>
    `<tr><td>${a.n}</td><td>${a.qf.toFixed(2)}</td><td>${(a.qf * 1e-5).toExponential(3)}</td><td>${a.lmin.toFixed(2)}</td></tr>`).join('');
  const headRows = taps.map((t, i) =>
    `<tr><td>${customTubeLabel(i)}</td><td>${t.dist.toFixed(4)}</td><td>${t.dia.toFixed(1)}</td><td>${t.area.toFixed(2)}</td>${an.map(a => `<td>${a.heads[i].toFixed(3)}</td>`).join('')}</tr>`).join('');
  const calcRows = taps.map((t, i) =>
    `<tr><td>${customTubeLabel(i)}</td>${an.map(a => `<td>${a.v[i].toFixed(3)}</td><td>${(a.hd[i] * 1000).toFixed(3)}</td><td>${a.tot[i].toFixed(3)}</td>`).join('')}</tr>`).join('');
  const idxRow = an.map(a => `<td colspan="3">${a.idx.toFixed(2)}%</td>`).join('');

  host.innerHTML = `
    <h1>Verification of Bernoulli’s Theorem: Custom Manometer Simulation Report</h1>
    <div>Fluid Mechanics Laboratory • Experiment No: 4 • Custom Manometer Simulation: Three Flow Rates Data Entry &amp; Comparative Graph</div>
    <div class="lr-meta">
      <div><strong>Student Name:</strong> ${val('fieldName')}</div>
      <div><strong>Register Number:</strong> ${val('fieldRoll')}</div>
      <div><strong>Course:</strong> Fluid Mechanics and Machinery</div>
      <div><strong>Academic Year:</strong> 2026 - 2027</div>
      <div><strong>Printed on:</strong> ${dateStr}</div>
      <div><strong>Number of manometer tappings:</strong> ${taps.length} (h₁ to h${subscriptNum(taps.length)})</div>
      <div><strong>Team:</strong> Harsh Sarda (25BME0088, Leader), Jaival Desai (25BME0048), Moksh Patel (25BME0047)</div>
    </div>

    <h2>1. Flow rates used</h2>
    <table><thead><tr><th>Run</th><th>Q (×10⁻⁵ m³/s)</th><th>Q (m³/s)</th><th>Q (L/min)</th></tr></thead><tbody>${flowRows}</tbody></table>

    <h2>2. Tapping layout and static head readings h (m)</h2>
    <table><thead><tr><th>Tube</th><th>Distance (m)</th><th>Diameter (mm)</th><th>Area A (×10⁻⁶ m²)</th><th>Run 1 h</th><th>Run 2 h</th><th>Run 3 h</th></tr></thead><tbody>${headRows}</tbody></table>

    <h2>3. Velocity v (m/s), dynamic head h<sub>d</sub> (×10⁻³ m) and total head h<sub>t</sub> (m)</h2>
    <table><thead><tr><th rowspan="2">Tube</th><th colspan="3">Run 1</th><th colspan="3">Run 2</th><th colspan="3">Run 3</th></tr>
      <tr>${'<th>v</th><th>h<sub>d</sub></th><th>h<sub>t</sub></th>'.repeat(3)}</tr></thead>
      <tbody>${calcRows}<tr><td><strong>Constancy h₁–${throat}</strong></td>${idxRow}</tr></tbody></table>
    <div>Formulas: v = Q / A, h<sub>d</sub> = v² / 2g (g = 9.8 m/s²), h<sub>t</sub> = h + h<sub>d</sub>. Constancy = 1 − (h<sub>t,max</sub> − h<sub>t,min</sub>) / h<sub>t,mean</sub> from h₁ to ${throat} (last tapping in the converging section up to the throat).</div>

    <h2>4. Comparative graph: total head vs. distance into duct</h2>
    ${img ? `<img src="${img}" alt="Comparative graph of total head versus distance for the three custom flow rates">` : '<p>(Graph unavailable: chart library not loaded.)</p>'}

    <h2>5. Inference (based on the readings above)</h2>
    <div class="lr-verdict">${inf.headline}</div>
    ${inf.table}
    <ul>${inf.points.map(p => `<li>${p}</li>`).join('')}</ul>
    <div class="lr-sign"><span>Student signature: ____________________</span><span>Faculty signature: ____________________</span></div>`;

  document.body.classList.add('printing-log');
  window.print();
}


/* ==========================================================================
   14. FLOW-RATE UNIT INPUTS: every flow-rate box also accepts L/min and m³/s
   ========================================================================== */
const FLOW_UNITS = {
  lmin: { label: 'L/min',       toM3s: v => v / 60000, fromM3s: q => q * 60000, digits: 5 },
  m3s:  { label: 'm³/s',        toM3s: v => v,         fromM3s: q => q,         digits: 4 },
  e5:   { label: '×10⁻⁵ m³/s',  toM3s: v => v * 1e-5,  fromM3s: q => q * 1e5,   digits: 5 }
};
// extra boxes added next to a flow input, depending on the unit that input already uses
const FLOW_COMPANIONS = { lmin: ['m3s'], e5: ['lmin', 'm3s'] };
const flowGroups = [];
let flowLock = false;
const fmtFlow = (unit, q) => String(Number(FLOW_UNITS[unit].fromM3s(q).toPrecision(FLOW_UNITS[unit].digits)));

// copy the main box's value into the other unit boxes (except `skipEl`, e.g. the box being typed in)
function refreshFlowGroup(g, skipEl) {
  const raw = g.primary.value;
  const q = FLOW_UNITS[g.unit].toM3s(parseFloat(raw));
  g.comps.forEach(c => {
    if (c.el === skipEl) return;
    if (Number.isFinite(q)) c.el.value = fmtFlow(c.unit, q);
    else if (raw === '') c.el.value = '';
  });
  g.last = raw;
}

function setupFlowGroup(primary) {
  const unit = primary.dataset.flowUnit;
  if (!FLOW_UNITS[unit]) return;
  primary.dataset.flowReady = '1';
  const inRow = primary.parentElement && primary.parentElement.classList.contains('sim-input-row');
  let host = primary.parentElement;
  if (!inRow) {
    host = document.createElement('div');
    host.className = 'flow-alt-row';
    primary.insertAdjacentElement('afterend', host);
  }
  const group = { primary, unit, comps: [], last: null };
  (FLOW_COMPANIONS[unit] || []).forEach(u => {
    const item = document.createElement('span');
    item.className = 'flow-alt-item';
    const el = document.createElement('input');
    el.type = 'number';
    el.step = 'any';
    el.min = '0';
    el.className = 'sim-num-input flow-alt-input';
    el.id = `${primary.id || 'flow'}_${u}`;
    el.setAttribute('aria-label', `Flow rate in ${FLOW_UNITS[u].label}`);
    const lab = document.createElement('span');
    lab.className = 'unit-label';
    lab.textContent = FLOW_UNITS[u].label;
    item.appendChild(el);
    item.appendChild(lab);
    host.appendChild(item);
    group.comps.push({ el, unit: u });

    el.addEventListener('input', () => {
      const x = parseFloat(el.value);
      if (!Number.isFinite(x) || x < 0) return;
      const q = FLOW_UNITS[u].toM3s(x);
      flowLock = true;
      try {
        primary.value = fmtFlow(unit, q);
        primary.dispatchEvent(new Event('input', { bubbles: true }));   // runs the page's existing logic for this input
      } finally { flowLock = false; }
      refreshFlowGroup(group, el);
    });
    el.addEventListener('change', () => refreshFlowGroup(group, null)); // tidy up (and show clamped values) when leaving the box
  });
  primary.addEventListener('input', () => { if (!flowLock) refreshFlowGroup(group, null); });
  primary.addEventListener('change', () => { if (!flowLock) refreshFlowGroup(group, null); });
  refreshFlowGroup(group, null);
  flowGroups.push(group);
}

function scanFlowInputs() {
  for (let i = flowGroups.length - 1; i >= 0; i--) if (!flowGroups[i].primary.isConnected) flowGroups.splice(i, 1);
  document.querySelectorAll('input[data-flow-unit]').forEach(p => { if (!p.dataset.flowReady) setupFlowGroup(p); });
}

// catches values the page sets from code (slider, preset buttons, reset, rebuilt grids)
function pollFlowGroups() {
  scanFlowInputs();
  flowGroups.forEach(g => {
    if (g.primary.value === g.last) return;
    if (g.comps.some(c => c.el === document.activeElement)) return;
    refreshFlowGroup(g, null);
  });
}

function initFlowUnitInputs() {
  scanFlowInputs();
  let queued = false;
  const queue = () => { if (queued) return; queued = true; requestAnimationFrame(() => { queued = false; pollFlowGroups(); }); };
  document.addEventListener('input', queue);
  document.addEventListener('click', queue);
  setInterval(pollFlowGroups, 250);
}