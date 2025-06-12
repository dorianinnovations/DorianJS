import { sendPrompt } from './gptIntegration.js';

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
let UPDATES_PER_FRAME = 5;

let running = true;
let hasStarted = false;
let lastAlive = 0;
let worker;
let currentStats = null;



async function sendStatsToClaude(stats) {
  const prompt = `
You are an interpreter of synthetic organism behavior.

Given the following internal stats of an emergent artificial life system:

- Tick: ${stats.tick}
- Diversity: ${stats.diversity}
- Entropy: ${stats.entropy}
- Alive: ${stats.alive}
- Growth: ${stats.growth}
- Dominant Emotion (previous): ${stats.dominant}

Choose the most appropriate dominant emotion **from this exact list**:
["joy", "trust", "fear", "surprise", "sadness", "disgust", "anger", "anticipation", "affectionate", "shocked", "contempt", "hopeful", "depressed", "delight", "anxiety", "aggression"]

⚠️ Dorian, a living emergent artifical life system.
`;

  try {
    const reply = await sendPrompt(prompt);
    console.log("Claude raw reply:", reply);
    return reply?.toLowerCase().trim();
  } catch (err) {
    console.error("Claude error:", err);
    return null;
  }
}

// Initialize the worker

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
  worker.postMessage({
    type: 'init',
    opts: {
      cols: COLS,
      rows: ROWS,
      maxAge: MAX_AGE,
      mutationChance: MUTATION_CHANCE,
      birthDelay: BIRTH_DELAY,
      cellSize: CELL_SIZE,
      agentCount: parseInt(agentCountSlider.value),
      reproductionRate: parseFloat(reproductionRateSlider.value)
    }
  });
}

const agentCountSlider = document.getElementById('agent-count-slider');
const reproductionRateSlider = document.getElementById('reproduction-rate-slider');
const speedSlider = document.getElementById('speed-slider');
const speedValue = document.getElementById('speed-value');
const pauseBtn = document.getElementById('pause-btn');
const mutationToggle = document.getElementById('toggle-mutation');
const resetBtn = document.getElementById('reset-btn');

initWorker();

mutationToggle.addEventListener('change', () => {
  const chance = mutationToggle.checked ? MUTATION_CHANCE : 0;
  if (worker) {
    worker.postMessage({ type: 'setMutation', mutationChance: chance });
  }
});

agentCountSlider.addEventListener('input', () => {
  if (worker) {
    worker.postMessage({ type: 'setAgentCount', count: parseInt(agentCountSlider.value) });
  }
});

reproductionRateSlider.addEventListener('input', () => {
  if (worker) {
    worker.postMessage({ type: 'setReproductionRate', rate: parseFloat(reproductionRateSlider.value) });
  }
});

speedSlider.max = '5';
speedSlider.addEventListener('input', () => {
  if (parseInt(speedSlider.value) > 5) speedSlider.value = '5';
  UPDATES_PER_FRAME = parseInt(speedSlider.value);
  speedValue.textContent = speedSlider.value;
});
if (parseInt(speedSlider.value) > 5) speedSlider.value = '5';
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
}
worker.onmessage = ({ data }) => {
  if (data.type === 'frame') {
    const img = new ImageData(new Uint8ClampedArray(data.imageData.data), data.imageData.width, data.imageData.height);
    ctx.putImageData(img, 0, 0);
    updateHUD(data.stats);
    currentStats = data.stats;

    // Trigger Claude every 100 ticks
    if (currentStats && currentStats.tick % 100 === 0) {
      sendStatsToClaude(currentStats).then(emotion => {
        if (!emotion) return;

        const emotions = [
          'joy', 'trust', 'fear', 'surprise', 'sadness', 'disgust',
          'anger', 'anticipation', 'affectionate', 'shocked',
          'contempt', 'hopeful', 'depressed', 'delight',
          'anxiety', 'aggression'
        ];

        canvas.classList.remove(...emotions.map(e => `dominant-emotion-${e}`));

        if (emotions.includes(emotion)) {
          canvas.classList.add(`dominant-emotion-${emotion}`);
          console.log(`🌟 Claude suggests: ${emotion}`);
        }
      });
    }

    if (running) requestAnimationFrame(animate);
  }
};



canvas.addEventListener('mousedown', (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = Math.floor((e.clientX - rect.left) / CELL_SIZE);
  const y = Math.floor((e.clientY - rect.top) / CELL_SIZE);

  // Seed the clicked cell
  worker.postMessage({ type: 'seed', x, y });

  if (!hasStarted) {
    hasStarted = true;
    running = true;
    animate();
    return;
  }

  if (!running) {
    // Optional: feedback if paused
    canvas.classList.add('seed-denied');
    setTimeout(() => canvas.classList.remove('seed-denied'), 500);
  }
});

document.getElementById("input-text-box").addEventListener("submit", function (e) {
  e.preventDefault(); // Prevent form from refreshing the page

  const input = document.getElementById("input-text-box");
  const message = input.value;

  if (message.trim() !== "") {
    // Here, you'd typically send the message to a server or display it in a chat window
    console.log("Message sent:", message);

    input.value = ""; // Clear the input field
  }
});





  


