import { DorianUniverseOptimized } from './dorianUniverseOptimized.js';
import { EMOTIONS, EMOTION_ID_TO_NAME, EMOTION_LIST, getZone, terrainZones } from './emotions.js';

const CELL_SIZE = 5; // px per cell

// Fixed canvas size
const canvas = document.getElementById("dorian-canvas");
canvas.width = 1000;
canvas.height = 1000;
const ctx = canvas.getContext("2d");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const COLS = 200;
const ROWS = 200;
const MAX_AGE = 800;
const MUTATION_CHANCE = 0.002;
let UPDATES_PER_FRAME = 1;

let tick = 0;
let speedModifier = 1;
let recentDeaths = [];
let lastAlive = 0;
let lastTick = performance.now();
let running = true;

let universe = new DorianUniverseOptimized({ cols: COLS, rows: ROWS });

// Logic toggles
let ENABLE_MUTATION = true;

const mutationToggle = document.getElementById('toggle-mutation');
mutationToggle.addEventListener('change', () => {
  ENABLE_MUTATION = mutationToggle.checked;
});

const resetBtn = document.getElementById('reset-btn');

resetBtn.addEventListener('click', () => {
  // Create a new universe instance and reseed
  universe = new DorianUniverseOptimized({ cols: COLS, rows: ROWS });
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  tick = 0;
  lastAlive = 0;
  hasStarted = false;
  running = false;
  document.getElementById('tick').textContent = 'Click the canvas to begin!';
  pauseBtn.textContent = 'Pause';
  draw();
  updateHUD();
});

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const imageData = universe.getImageData(CELL_SIZE);
  ctx.putImageData(imageData, 0, 0);
}

function countAlive() {
  // Efficiently count alive cells from the optimized universe
  let count = 0;
  for (let i = 0; i < universe.state.length; i++) {
    if (universe.state[i]) count++;
  }
  return count;
}

// Set up speed slider logic after DOM is ready
const speedSlider = document.getElementById('speed-slider');
const speedValue = document.getElementById('speed-value');
const pauseBtn = document.getElementById('pause-btn');

// Clamp max value to 10 for performance
speedSlider.max = '10';
speedSlider.addEventListener('input', () => {
  if (parseInt(speedSlider.value) > 10) speedSlider.value = '10';
  UPDATES_PER_FRAME = parseInt(speedSlider.value);
  speedValue.textContent = speedSlider.value;
});
// Initialize value
if (parseInt(speedSlider.value) > 10) speedSlider.value = '10';
UPDATES_PER_FRAME = parseInt(speedSlider.value);
speedValue.textContent = speedSlider.value;

function setPauseState(paused) {
  running = !paused;
  pauseBtn.textContent = paused ? 'Resume' : 'Pause';
  if (!paused) animate();
}

pauseBtn.addEventListener('click', () => {
  setPauseState(running);
});

window.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    setPauseState(running);
    e.preventDefault();
  }
});

function updateCanvasBorderEmotion(dominant) {
  const emotion = dominant.toLowerCase();
  const classes = [
    'dominant-emotion-joy',
    'dominant-emotion-trust',
    'dominant-emotion-fear',
    'dominant-emotion-surprise',
    'dominant-emotion-sadness',
    'dominant-emotion-disgust',
    'dominant-emotion-anger',
    'dominant-emotion-anticipation'
  ];
  canvas.classList.remove(...classes);
  if (classes.includes('dominant-emotion-' + emotion)) {
    canvas.classList.add('dominant-emotion-' + emotion);
  }
}

function updateHUD() {
  const stats = universe.getStats();
  const alive = countAlive();
  const growth = alive - lastAlive;
  lastTick = performance.now();
  lastAlive = alive;

  document.getElementById("tick").textContent = `Tick: ${stats.tick}`;
  document.getElementById("dominant").textContent = `Current Emotional State: ${stats.dominant}`;
  document.getElementById("diversity").textContent = `Diversity: ${stats.diversity}`;
  document.getElementById("entropy").textContent = `Entropy: ${stats.entropy}`;
  document.getElementById("alive").textContent = `Alive: ${alive}`;
  document.getElementById("growth").textContent = `Growth: ${growth}`;
  updateCanvasBorderEmotion(stats.dominant);
}

function animate() {
  if (!running) return;
  for (let i = 0; i < UPDATES_PER_FRAME; i++) {
    universe.update();
  }
  draw();
  updateHUD();
  requestAnimationFrame(animate);
}

// Remove initial seed and animation start
document.getElementById('tick').textContent = 'Click the canvas to begin!';
let hasStarted = false;

canvas.addEventListener('mousedown', (e) => {
  if (!running && hasStarted) {
    // Subtle pulse denial effect
    canvas.classList.add('seed-denied');
    setTimeout(() => canvas.classList.remove('seed-denied'), 500);
    return;
  }
  const rect = canvas.getBoundingClientRect();
  const x = Math.floor((e.clientX - rect.left) / CELL_SIZE);
  const y = Math.floor((e.clientY - rect.top) / CELL_SIZE);
  universe.seed(x, y);
  draw(); // Immediate visual feedback
  updateHUD();
  if (!hasStarted) {
    hasStarted = true;
    running = true;
    animate();
  }
});

// Patch DorianUniverseOptimized.update to use toggles
const origUpdate = DorianUniverseOptimized.prototype.update;
DorianUniverseOptimized.prototype.update = function() {
  const nextActive = new Set();
  const toUpdate = Array.from(this.active);
  for (const idx of toUpdate) {
    const [x, y] = this.coords(idx);
    const zone = getZone(x, y); // Always use terrain
    const { decay_modifier: mod, boost, suppress } = terrainZones[zone];
    const neighbors = this.getNeighbors(x, y);
    const liveNeighbors = neighbors.filter(nidx => this.state[nidx]);
    if (!this.state[idx]) {
      if ((liveNeighbors.length === 3 || liveNeighbors.length === 4) && Math.random() < 0.25) {
        const chosen = liveNeighbors[Math.floor(Math.random() * liveNeighbors.length)];
        this.state[idx] = 1;
        this.emotion[idx] = ENABLE_MUTATION && Math.random() > this.mutationChance ? this.emotion[chosen] : this.randomEmotion();
        this.intensity[idx] = 1.0;
        this.energy[idx] = 10;
        this.age[idx] = 0;
        nextActive.add(idx);
        neighbors.forEach(n => nextActive.add(n));
      }
      continue;
    }
    // Alive cell
    this.age[idx]++;
    let decay = 0.01 * mod;
    if (suppress.includes(this.emotion[idx])) decay *= 1.5;
    if (boost.includes(this.emotion[idx])) decay *= 0.6;
    this.intensity[idx] = Math.max(0.1, this.intensity[idx] - decay);
    this.energy[idx] -= 0.2;
    if (this.age[idx] > this.maxAge || this.energy[idx] <= 0) {
      this.state[idx] = 0;
      neighbors.forEach(n => nextActive.add(n));
    } else {
      nextActive.add(idx);
      neighbors.forEach(n => nextActive.add(n));
    }
  }
  this.active = nextActive;
  this.tick++;
};

const hideUiBtn = document.getElementById('hide-ui-btn');
const uiPanel = document.getElementById('ui');
hideUiBtn.addEventListener('click', () => {
  uiPanel.classList.toggle('hide-ui');
  if (uiPanel.classList.contains('hide-ui')) {
    hideUiBtn.textContent = '🙈';
    hideUiBtn.title = 'Show UI';
  } else {
    hideUiBtn.textContent = '👁️';
    hideUiBtn.title = 'Hide UI';
  }
});
