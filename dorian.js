
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
const UPDATES_PER_FRAME = 1;

let tick = 0;
let speedModifier = 1;
let recentDeaths = [];
let lastAlive = 0;
let lastTick = performance.now();
let fps = 0;
let running = true;

// Initialize optimized universe
const universe = new DorianUniverseOptimized({ cols: COLS, rows: ROWS });
universe.seed(COLS >> 1, ROWS >> 1);

function draw() {
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

function updateHUD() {
  const stats = universe.getStats();
  const alive = countAlive();
  const growth = alive - lastAlive;
  const now = performance.now();
  const dt = now - lastTick;
  fps = Math.round(1000 / dt);
  lastTick = now;
  lastAlive = alive;

  document.getElementById("tick").textContent = `Tick: ${stats.tick}`;
  document.getElementById("dominant").textContent = `Dominant: ${stats.dominant}`;
  document.getElementById("diversity").textContent = `Diversity: ${stats.diversity}`;
  document.getElementById("entropy").textContent = `Entropy: ${stats.entropy}`;
  document.getElementById("alive").textContent = `Alive: ${alive}`;
  document.getElementById("growth").textContent = `Growth: ${growth}`;
  document.getElementById("fps").textContent = `FPS: ${fps}`;
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

// Spacebar toggles running
window.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    running = !running;
    if (running) animate();
  }
});

animate();
