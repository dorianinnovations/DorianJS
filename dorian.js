const CELL_SIZE = 5; // px per cell

// Fixed canvas size
const canvas = document.getElementById("dorian-canvas");
canvas.width = 1000;
canvas.height = 1000;
const ctx = canvas.getContext("2d");

const COLS = 200;
const ROWS = 200;
const MAX_AGE = 800;
const MUTATION_CHANCE = 0.002;
const BIRTH_DELAY = 5; // minimum dead ticks before a cell can grow again
let UPDATES_PER_FRAME = 10;

let running = true;
let hasStarted = false;
let lastAlive = 0;
let worker;

function initWorker() {
  if (worker) worker.terminate();
  worker = new Worker('worker.js', { type: 'module' });
  worker.onmessage = ({ data }) => {
    if (data.type === 'frame') {
      const img = new ImageData(new Uint8ClampedArray(data.imageData.data), data.imageData.width, data.imageData.height);
      ctx.putImageData(img, 0, 0);
      updateHUD(data.stats);
      if (running) requestAnimationFrame(animate);
    }
  };
  worker.postMessage({ type: 'init', opts: { cols: COLS, rows: ROWS, maxAge: MAX_AGE, mutationChance: MUTATION_CHANCE, birthDelay: BIRTH_DELAY, cellSize: CELL_SIZE } });
}

initWorker();


const speedSlider = document.getElementById('speed-slider');
const speedValue = document.getElementById('speed-value');
const pauseBtn = document.getElementById('pause-btn');
const mutationToggle = document.getElementById('toggle-mutation');
const resetBtn = document.getElementById('reset-btn');

mutationToggle.addEventListener('change', () => {
  const chance = mutationToggle.checked ? MUTATION_CHANCE : 0;
  if (worker) {
    worker.postMessage({ type: 'setMutation', mutationChance: chance });
  }
});

speedSlider.max = '10';
speedSlider.addEventListener('input', () => {
  if (parseInt(speedSlider.value) > 10) speedSlider.value = '10';
  UPDATES_PER_FRAME = parseInt(speedSlider.value);
  speedValue.textContent = speedSlider.value;
});
if (parseInt(speedSlider.value) > 10) speedSlider.value = '10';
UPDATES_PER_FRAME = parseInt(speedSlider.value);
speedValue.textContent = speedSlider.value;

pauseBtn.addEventListener('click', () => {
  running = !running;
  pauseBtn.textContent = running ? 'Pause' : 'Resume';
  if (running) animate();
});



resetBtn.addEventListener('click', () => {
  initWorker();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  lastAlive = 0;
  hasStarted = false;
  running = false;
  document.getElementById('tick').textContent = 'Click the canvas to begin!';
  pauseBtn.textContent = 'Resume';
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
  'dominant-emotion-anticipation',
  'dominant-emotion-affectionate',
  'dominant-emotion-shocked',
  'dominant-emotion-contempt',
  'dominant-emotion-hopeful',
  'dominant-emotion-depressed',
  'dominant-emotion-delight',
  'dominant-emotion-anxiety',
  'dominant-emotion-aggression'
];


  canvas.classList.remove(...classes);
  if (classes.includes('dominant-emotion-' + emotion)) {
    canvas.classList.add('dominant-emotion-' + emotion);
  }
}

function updateHUD(stats) {
  const alive = stats.alive;
  const growth = alive - lastAlive;
  lastAlive = alive;

  document.getElementById('tick-metric').textContent = `Tick: ${stats.tick}`;
  document.getElementById('dominant-metric').textContent = `Dominant Emotion: ${stats.dominant}`;
  document.getElementById('diversity-metric').textContent = `Diversity: ${stats.diversity}`;
  document.getElementById('entropy-metric').textContent = `Entropy: ${stats.entropy}`;
  document.getElementById('alive-metric').textContent = `Alive: ${alive}`;
  document.getElementById('growth-metric').textContent = `Growth: ${growth}`;
  updateCanvasBorderEmotion(stats.dominant);
}

function animate() {
  if (!running) return;
  worker.postMessage({ type: 'update', updates: UPDATES_PER_FRAME });
  // Only schedule the next frame here, after the worker responds
}

worker.onmessage = ({ data }) => {
  if (data.type === 'frame') {
    const img = new ImageData(new Uint8ClampedArray(data.imageData.data), data.imageData.width, data.imageData.height);
    ctx.putImageData(img, 0, 0);
    updateHUD(data.stats);
    // Only schedule the next frame if running
    if (running) requestAnimationFrame(animate);
  }
};

let hasSeeded = false;

canvas.addEventListener('mousedown', (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = Math.floor((e.clientX - rect.left) / CELL_SIZE);
  const y = Math.floor((e.clientY - rect.top) / CELL_SIZE);

  // Always allow seeding when simulation is running
worker.postMessage({ type: 'seed', x, y });

if (!hasStarted) {
  hasStarted = true;
  running = true;
  animate();
}


  if (!hasStarted) {
    worker.postMessage({ type: 'seed', x, y });
    hasStarted = true;
    running = true;
    animate();
  } else {
    // Optional: feedback if paused
    canvas.classList.add('seed-denied');
    setTimeout(() => canvas.classList.remove('seed-denied'), 500);
  }
});




