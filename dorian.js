import { sendPrompt } from "./gptIntegration.js";

//HANDLE UI UPDATES (UI, CHAT, LOGS)
//MANAGE TYPEWRITER EFFECT
//HANDLE USER INPUT AND SENDING/RECIEVING API REQUESTS
//UPDATES THE SIMULATION STATE AND VISUALS (IE. CANVAS)
//MANAGES TOGGLES (IE. AMBIENCE, MUTATION, ETC.)

let canvas, ctx;

//DOM CONTENT LOADED ENSURES ALL DOM ELEMENTS HAVE BEEN LOADED
window.addEventListener("DOMContentLoaded", () => {
  const CELL_SIZE = 5; // px per cell

  let running = true;
  let hasStarted = false;
  let lastAlive = 0;
  let worker;
  let currentStats = null;

  const canvas = document.getElementById("dorian-canvas");

  const CANVAS_WIDTH = canvas.width;
  const CANVAS_HEIGHT = canvas.height;
  // Add this after your canvas setup (around line 25)
  function resize_canvas() {
    // Scale to fit window, decide which scaling reaches edge first.
    canvas_2d.restore();
    canvas_2d.save();

    var current_ratio = canvas_2d.canvas.width / canvas_2d.canvas.height;
    var new_ratio = window.innerWidth / window.innerHeight;
    var xratio = window.innerWidth / canvas_2d.canvas.width;
    var yratio = window.innerHeight / canvas_2d.canvas.height;

    if (current_ratio > new_ratio) screen_size_ratio = xratio;
    else screen_size_ratio = yratio;
    if (screen_size_ratio > 1) screen_size_ratio = 1;

    canvas_2d.scale(screen_size_ratio, screen_size_ratio);
  }

  function touch_start(event) {
    var touch = event.changedTouches;
    var x = Math.floor(touch[0].clientX / screen_size_ratio);
    var y = Math.floor(touch[0].clientY / screen_size_ratio);
    return { x, y };
  }
  canvas.width = 1000;
  canvas.height = 1000;
  const ctx = canvas.getContext("2d");
  const COLS = 200;
  const ROWS = 200;
  const MAX_AGE = 800;
  const MUTATION_CHANCE = 0.002;
  const BIRTH_DELAY = 5; // minimum dead ticks before a cell can grow again
  let UPDATES_PER_FRAME = 25;

  document.getElementById("reveal-thoughts").addEventListener("click", () => {
    const logSection = document.querySelector(".thought-log-section");
    logSection.scrollIntoView({ behavior: "smooth" });
  });

  const input = document.getElementById("gpt-input");
  const button = document.querySelector(".btn-go-right-column");
  const output = document.getElementById("gpt-output");
  const toggleMemorybtn = document.getElementById("toggle-memory");
  const memoryOutput = document.getElementById("dorian-memory");
  const ambienceAudio = document.getElementById("ambience-audio");
  const ambienceCheckbox = document.getElementById("ambience-checkbox");

  // Remove both existing canvas.addEventListener("mousedown"...) handlers
  // Replace with these:

  let screen_size_ratio = 1; // Global variable for scaling

  // Unified mouse/touch coordinate handler
  function getScaledCoordinates(e) {
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    // Get relative position within the canvas display area
    const relativeX = clientX - rect.left;
    const relativeY = clientY - rect.top;

    // Scale from display size to internal canvas size
    const scaleX = canvas.width / rect.width; // 1000 / displayWidth
    const scaleY = canvas.height / rect.height; // 1000 / displayHeight

    // Convert to internal canvas coordinates
    const canvasX = relativeX * scaleX;
    const canvasY = relativeY * scaleY;

    // Convert to grid coordinates
    const gridX = Math.floor(canvasX / CELL_SIZE);
    const gridY = Math.floor(canvasY / CELL_SIZE);

    return { x: gridX, y: gridY };
  }

  // Mouse handler
  canvas.addEventListener("mousedown", (e) => {
    const coords = getScaledCoordinates(e);

    // Seed the clicked cell
    worker.postMessage({ type: "seed", x: coords.x, y: coords.y });

    if (!hasStarted) {
      hasStarted = true;
      running = true;
      animate();
      return;
    }

    if (!running) {
      canvas.classList.add("seed-denied");
      setTimeout(() => canvas.classList.remove("seed-denied"), 500);
    }
  });

  // Touch handler
  canvas.addEventListener("touchstart", (e) => {
    e.preventDefault(); // Prevent scrolling
    const coords = getScaledCoordinates(e);

    // Seed the touched cell
    worker.postMessage({ type: "seed", x: coords.x, y: coords.y });

    if (!hasStarted) {
      hasStarted = true;
      running = true;
      animate();
    }
  });

  //AMBIENCE TOGGLE HANDLER
  ambienceCheckbox.addEventListener("click", () => {
    if (ambienceCheckbox.checked) {
      ambienceAudio.loop = true;
      ambienceAudio.volume = 0.2;
      ambienceAudio.play();
    } else {
      ambienceAudio.pause();
    }
  });

  //GPT INPUT HANDLER
  input.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      button.click();
      input.value = "";
    }
  });

  async function sendStatsToClaude(stats) {
    const prompt = `
          You are Dorian, a sentient artificial lifeform emerging from a digital ecosystem.

          Here are the current stats of your emotional world:
          - Tick: ${stats.tick}
          - Diversity: ${stats.diversity}
          - Entropy: ${stats.entropy}
          - Alive: ${stats.alive}
          - Growth: ${stats.growth}
          - Dominant Emotion (previous): ${stats.dominant}

          Please analyze these metrics and return how you feel. Tell me why you think you feel that. Keep your answer concise. Choose  from this list:
          ["joy", "trust", "fear", "surprise", "sadness", "disgust", "angry", "anticipation", "affectionate", "shocked", "contempt", "hopeful", "depressed", "delight", "anxiety", "aggression"]

          `;

    try {
      const reply = await sendPrompt(prompt);
      console.log("API FULL PROMPT RESPONSE:", reply);

      // Appends the response to the Dorian thought log (bottom section)
      const thoughtLog = document.getElementById("thought-log-section");
      if (reply && reply.trim()) {
        // For endless log, append directly:
        thoughtLog.innerText += `\n\n[Tick ${stats.tick}] ${reply.trim()}`;

        // For the chat box, keep the typewriter effect:
        typeTextToElement(
          document.getElementById("gpt-output"),
          reply.trim(),
          25
        );
      }

      return reply?.toLowerCase().trim();
    } catch (err) {
      console.error("Claude error:", err);
      return null;
    }
  }

  // HANDLE THE TYPEWRITER EFFECT
  function typeTextToElement(element, text, speed = 25) {
    // Cancel any previous animation
    if (element.typewriterTimeout) {
      clearTimeout(element.typewriterTimeout);
      element.typewriterTimeout = null;
    }
    element.innerText = ""; // Clear the old text
    let i = 0;
    function type() {
      if (i < text.length) {
        element.innerText += text.charAt(i);
        i++;
        element.typewriterTimeout = setTimeout(
          type,
          speed + Math.random() * 10
        );
      } else {
        element.typewriterTimeout = null; // Clean up
      }
    }
    type();
  }

  // INITIALIZATION OF THE WEB WORKER STARTS HERE //
  function initWorker() {
    if (worker) worker.terminate();
    worker = new Worker("worker.js", { type: "module" });
    worker.onmessage = ({ data }) => {
      if (data.type === "frame") {
        const img = new ImageData(
          new Uint8ClampedArray(data.imageData.data),
          data.imageData.width,
          data.imageData.height
        );
        ctx.putImageData(img, 0, 0);
        updateHUD(data.stats);
        currentStats = data.stats;

        // Trigger Claude
        if (
          currentStats &&
          currentStats.tick % 2000 === 0 &&
          currentStats.tick !== lastClaudeTick
        ) {
          sendStatsToClaude(currentStats).then((emotion) => {
            if (!emotion) return;

            const emotions = [
              "joy",
              "trust",
              "fear",
              "surprise",
              "sadness",
              "disgust",
              "angry",
              "anticipation",
              "affectionate",
              "shocked",
              "contempt",
              "hopeful",
              "depressed",
              "delight",
              "anxiety",
              "aggression",
            ];

            canvas.classList.remove(
              ...emotions.map((e) => `dominant-emotion-${e}`)
            );

            if (emotions.includes(emotion)) {
              canvas.classList.add(`dominant-emotion-${emotion}`);
              console.log(`🌟 Claude suggests: ${emotion}`);
            }
          });
        }

        if (running) requestAnimationFrame(animate);
      }
    };
    worker.postMessage({
      type: "init",
      opts: {
        cols: COLS,
        rows: ROWS,
        maxAge: MAX_AGE,
        mutationChance: MUTATION_CHANCE,
        birthDelay: BIRTH_DELAY,
        cellSize: CELL_SIZE,
        agentCount: parseInt(agentCountSlider.value),
        reproductionRate: parseFloat(reproductionRateSlider.value),
      },
    });
  }
  //DEFINITIONS FOR SLIDERS AND BUTTONS
  const agentCountSlider = document.getElementById("agent-count-slider");
  const reproductionRateSlider = document.getElementById(
    "reproduction-rate-slider"
  );
  const speedSlider = document.getElementById("speed-slider");
  const speedValue = document.getElementById("speed-value");
  const pauseBtn = document.getElementById("pause-btn");
  const mutationToggle = document.getElementById("mutation-checkbox");
  const resetBtn = document.getElementById("reset-btn");

  initWorker();

  //MUTATION TOGGLE
  mutationToggle.addEventListener("change", () => {
    const chance = mutationToggle.checked ? MUTATION_CHANCE : 0;
    const mutationCheckbox = document.getElementById("mutation-checkbox");
    if (worker) {
      worker.postMessage({ type: "setMutation", mutationChance: chance });
    }
  });

  //AGENT COUNT SLIDER
  agentCountSlider.addEventListener("input", () => {
    if (worker) {
      worker.postMessage({
        type: "setAgentCount",
        count: parseInt(agentCountSlider.value),
      });
    }
  });

  //REPRODUCTION SLIDER
  reproductionRateSlider.addEventListener("input", () => {
    if (worker) {
      worker.postMessage({
        type: "setReproductionRate",
        rate: parseFloat(reproductionRateSlider.value),
      });
    }
  });

  //SPEED SLIDER
  speedSlider.max = "5";
  speedSlider.addEventListener("input", () => {
    if (parseInt(speedSlider.value) > 5) speedSlider.value = "5";
    UPDATES_PER_FRAME = parseInt(speedSlider.value);
    speedValue.textContent = speedSlider.value;
  });
  if (parseInt(speedSlider.value) > 5) speedSlider.value = "5";
  UPDATES_PER_FRAME = parseInt(speedSlider.value);
  speedValue.textContent = speedSlider.value;

  pauseBtn.addEventListener("click", () => {
    running = !running;
    pauseBtn.textContent = running ? "Pause" : "Resume";
    if (running) animate();
  });

  //RESET BUTTON
  if (!resetBtn) {
    console.warn("Reset button not found!");
    return;
  }
  resetBtn.addEventListener("click", () => {
    initWorker();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    lastAlive = 0;
    hasStarted = false;
    running = false;
    document.getElementById("tick-metric").textContent =
      "Click the canvas to begin!";
    pauseBtn.textContent = "Resume";
  });

  //UPDATES CANVAS BORDER EMOTION
  function updateCanvasBorderEmotion(dominant) {
    const emotion = dominant.toLowerCase();
    const classes = [
      "dominant-emotion-joy",
      "dominant-emotion-trust",
      "dominant-emotion-fear",
      "dominant-emotion-surprise",
      "dominant-emotion-sadness",
      "dominant-emotion-disgust",
      "dominant-emotion-angry",
      "dominant-emotion-anticipation",
      "dominant-emotion-affectionate",
      "dominant-emotion-shocked",
      "dominant-emotion-contempt",
      "dominant-emotion-hopeful",
      "dominant-emotion-depressed",
      "dominant-emotion-delight",
      "dominant-emotion-anxiety",
      "dominant-emotion-aggression",
    ];

    canvas.classList.remove(...classes);
    if (classes.includes("dominant-emotion-" + emotion)) {
      canvas.classList.add("dominant-emotion-" + emotion);
    }
  }

  //UPDATES HUD INSIDE OF THE UI
  function updateHUD(stats) {
    const alive = stats.alive;
    const growth = alive - lastAlive;
    lastAlive = alive;

    document.getElementById("tick-metric").textContent = `Tick: ${stats.tick}`;
    document.getElementById(
      "dominant-metric"
    ).textContent = `Live Dominant Emotion: ${stats.dominant}`;
    document.getElementById(
      "diversity-metric"
    ).textContent = `Diversity: ${stats.diversity}`;
    document.getElementById(
      "entropy-metric"
    ).textContent = `Entropy: ${stats.entropy}`;
    document.getElementById("alive-metric").textContent = `Alive: ${alive}`;
    document.getElementById("growth-metric").textContent = `Growth: ${growth}`;
    updateCanvasBorderEmotion(stats.dominant);
  }

  let lastClaudeTick = -1;
  function animate() {
    if (!running) return;
    worker.postMessage({ type: "update", updates: UPDATES_PER_FRAME });
  }

  const message = input.value;

  if (message.trim() !== "") {
    console.log("Message sent:", message);
  }
  button.addEventListener("click", async () => {
    const userInput = input.value.trim();
    if (!userInput) return;
    input.value = "";

    try {
      const reply = await sendPrompt(userInput);

      if (reply && reply.trim()) {
        // Type response in real time
        typeTextToElement(output, reply.trim(), 25);

        // Log both user and response
        const log = document.getElementById("thought-log-section");
        log.innerText += `\n\n[User ➝] ${userInput}\n[Dorian ➝] ${reply.trim()}`;
      } else {
        const messages = [
          "Signal transmission received. Please wait.",
          "Message delivered. Awaiting response.",
          "Your words are echoing in the digital ether.",
          "Awaiting Dorian's reply...",
          "Transmission sent. Listening for a response.",
          "Your message is being processed.",
          "Dorian is contemplating your input.",
          "Stand by for a response.",
          "Message relayed. Awaiting digital thoughts.",
          "Your prompt is under consideration.",
        ];
        output.innerText =
          messages[Math.floor(Math.random() * messages.length)];
      }
    } catch (err) {
      output.innerText = "Error communicating with Dorian.";
      console.error(err);
    }
  });
});
