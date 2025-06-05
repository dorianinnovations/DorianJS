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
  lastTick = performance.now();
  lastAlive = alive;

  document.getElementById("tick").textContent = `Tick: ${stats.tick}`;
  document.getElementById("dominant").textContent = `Dominant: ${stats.dominant}`;
  document.getElementById("diversity").textContent = `Diversity: ${stats.diversity}`;
  document.getElementById("entropy").textContent = `Entropy: ${stats.entropy}`;
  document.getElementById("alive").textContent = `Alive: ${alive}`;
  document.getElementById("growth").textContent = `Growth: ${growth}`;
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

// User seeding: click to seed new live cells
canvas.addEventListener('mousedown', (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = Math.floor((e.clientX - rect.left) / CELL_SIZE);
  const y = Math.floor((e.clientY - rect.top) / CELL_SIZE);
  universe.seed(x, y);
  draw(); // Immediate visual feedback
  updateHUD();
});

// Make #ui draggable
const ui = document.getElementById('ui');
let isDragging = false;
let dragOffsetX = 0;
let dragOffsetY = 0;

ui.addEventListener('mousedown', (e) => {
  isDragging = true;
  ui.classList.add('dragging');
  dragOffsetX = e.clientX - ui.offsetLeft;
  dragOffsetY = e.clientY - ui.offsetTop;
});

document.addEventListener('mousemove', (e) => {
  if (!isDragging) return;
  ui.style.left = (e.clientX - dragOffsetX) + 'px';
  ui.style.top = (e.clientY - dragOffsetY) + 'px';
});

document.addEventListener('mouseup', () => {
  isDragging = false;
  ui.classList.remove('dragging');
});

// Touch support
ui.addEventListener('touchstart', (e) => {
  isDragging = true;
  ui.classList.add('dragging');
  const touch = e.touches[0];
  dragOffsetX = touch.clientX - ui.offsetLeft;
  dragOffsetY = touch.clientY - ui.offsetTop;
});

document.addEventListener('touchmove', (e) => {
  if (!isDragging) return;
  const touch = e.touches[0];
  ui.style.left = (touch.clientX - dragOffsetX) + 'px';
  ui.style.top = (touch.clientY - dragOffsetY) + 'px';
});

document.addEventListener('touchend', () => {
  isDragging = false;
  ui.classList.remove('dragging');
});

animate();
