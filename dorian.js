// === DorianJS: Full Conversion of Dorian-V2.2.py ===

import { DorianUniverseOptimized } from './dorianUniverseOptimized.js';
import { EMOTIONS, EMOTION_ID_TO_NAME, EMOTION_LIST, getZone, terrainZones } from './emotions.js';

const canvas = document.getElementById("dorian-canvas");
const ctx = canvas.getContext("2d");
canvas.width = 1000;
canvas.height = 1000;

const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const COLS = 200;
const ROWS = 200;
const CELL_SIZE = 5; // 200x200 grid, 5px per cell
const MAX_AGE = 800;
const MUTATION_CHANCE = 0.002;
const UPDATES_PER_FRAME = 1;

let tick = 0;
let speedModifier = 1;
let recentDeaths = [];

// Initialize optimized universe
const universe = new DorianUniverseOptimized({ cols: COLS, rows: ROWS });
universe.seed(COLS >> 1, ROWS >> 1);

function draw() {
  const imageData = universe.getImageData(CELL_SIZE);
  ctx.putImageData(imageData, 0, 0);
}

function updateHUD() {
  const stats = universe.getStats();
  document.getElementById("tick").textContent = `Tick: ${stats.tick}`;
  document.getElementById("dominant").textContent = `Dominant: ${stats.dominant}`;
  document.getElementById("diversity").textContent = `Diversity: ${stats.diversity}`;
  document.getElementById("entropy").textContent = `Entropy: ${stats.entropy}`;
}

function animate() {
  for (let i = 0; i < UPDATES_PER_FRAME; i++) {
    universe.update();
  }
  draw();
  updateHUD();
  requestAnimationFrame(animate);
}

animate();
