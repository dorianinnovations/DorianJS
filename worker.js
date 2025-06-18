import { DorianUniverseOptimized } from './dorianUniverseOptimized.js';

let universe = null;
let cellSize = 5; // rendered pixel size

let speed = 1; // default speed (user adjustable)
let animationLoopRunning = false;


let CANVAS_WIDTH = 1000;
let CANVAS_HEIGHT = 1000;

function startAnimationLoop() {
  if (animationLoopRunning) return;
  animationLoopRunning = true;

  let partialTick = 0;

  function loop() {
    if (!universe) return;

    partialTick += speed * 1;

    while (partialTick >= 1) {
      universe.update();
      partialTick--;
    }
        //PASS CANVAS DIMENSIONS TO getImageData
    const imageData = universe.getImageData(cellSize, CANVAS_WIDTH, CANVAS_HEIGHT);
    const stats = universe.getStats();
    self.postMessage({ type: 'frame', imageData, stats }, [imageData.data.buffer]);

    requestAnimationFrame(loop);
  }

  loop();
}

self.onmessage = (e) => {
  const { type, opts, x, y, updates, mutationChance, count, rate, width, height } = e.data;
  switch (type) {
    case 'init':
       if (width) CANVAS_WIDTH = width;
       if (height) CANVAS_HEIGHT  = height;
      universe = new DorianUniverseOptimized  ({opts,
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT});
      cellSize = opts.cellSize || cellSize;
      if (typeof opts.agentCount === 'number') {
        universe.setAgentCount(opts.agentCount);
      }
      if (typeof opts.reproductionRate === 'number') {
        universe.setReproductionRate(opts.reproductionRate);
      }
      break;
    case 'seed':
      if (universe) universe.seed(x, y);
      break;
    case 'update':
      if (universe && typeof updates === 'number') {
        // Do the update(s)
        for (let i = 0; i < updates; i++) {
          universe.update();
        }
        const imageData = universe.getImageData(cellSize, CANVAS_WIDTH, CANVAS_HEIGHT);
        const stats = universe.getStats();
        self.postMessage({ type: 'frame', imageData, stats }, [imageData.data.buffer]);
      }
      break;
    case 'setMutation':
      if (universe && typeof mutationChance === 'number') {
        universe.setMutationChance(mutationChance);
      }
      break;
    case 'setAgentCount':
      if (universe && typeof count === 'number') {
        universe.setAgentCount(count);
      }
      break;
    case 'setReproductionRate':
      if (universe && typeof rate === 'number') {
        universe.setReproductionRate(rate);
      }
      break;

  }};
