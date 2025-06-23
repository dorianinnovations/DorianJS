import { sendPrompt } from "./gptIntegration.js";
import { EMOTIONS } from "./emotions.js";

//HANDLE UI UPDATES (UI, CHAT, LOGS)
//MANAGE TYPEWRITER EFFECT
//HANDLE USER INPUT AND SENDING/RECIEVING API REQUESTS
//UPDATES THE SIMULATION STATE AND VISUALS (IE. CANVAS)
//MANAGES TOGGLES (IE. AMBIENCE, MUTATION, ETC.)

let canvas, ctx;

//DOM CONTENT LOADED ENSURES ALL DOM ELEMENTS HAVE BEEN LOADED
window.addEventListener("DOMContentLoaded", () => {
  // Prevent the browser from restoring the previous scroll position
  if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
  }

  // Ensure the page always loads at the top
  window.scrollTo(0, 0);
  const CELL_SIZE = 5; // px per cell

  let running = true;
  let hasStarted = false;
  let lastAlive = 0;
  let worker;
  let currentStats = null;

  let selectedEmotion = 0; // Default to Joy (emotion ID 0)
  let paintingMode = false;

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

  const toggleMemorybtn = document.getElementById("toggle-memory");
  const memoryOutput = document.getElementById("dorian-memory");
  const ambienceAudio = document.getElementById("ambience-audio");
  const ambienceCheckbox = document.getElementById("ambience-checkbox");

  const navButtons = document.querySelectorAll(".navigation-button");
  const sections = document.querySelectorAll(
    "#hero-section, #main-layout, #chat-section, #thought-log-section"
  );

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

  //review for deletion
  canvas.addEventListener("mousedown", (e) => {
    const coords = getScaledCoordinates(e);

    if (paintingMode) {
      isDragging = true; // Add this line
      worker.postMessage({
        type: "paintEmotion",
        x: coords.x,
        y: coords.y,
        emotion: selectedEmotion,
        intensity: 0.8,
      });
    } else {
      worker.postMessage({ type: "seed", x: coords.x, y: coords.y });
    }

    console.log("Mouse down event detected");
    console.log("Mouse clicked at:", coords);
    console.log("Painting mode:", paintingMode);
    console.log("Selected emotion:", selectedEmotion);

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

  // Start the chat loop using BotUI

  async function sendStatsToClaude(stats) {
    const prompt = `
          

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
      WebTransportBidirectionalStream.sendPromptToClaude = sendPromnpt;

      // Appends the response to the Dorian thought log (bottom section)
      const thoughtLog = document.getElementById("thought-log-section");
      if (reply && reply.trim()) {
        thoughtLog.innerText += `\n\n[Tick ${stats.tick}] ${reply.trim()}`;
      }

      return reply?.toLowerCase().trim();
    } catch (err) {
      console.error("Claude error:", err);
      return null;
    }
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
          currentStats.tick % 3500 === 0 &&
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

  document
    .getElementById("action-menu-btn-icon")
    .addEventListener("click", () => {
      const menu = document.getElementById("action-menu-btns");
      menu.classList.toggle("active");
    });

  const widget = document.querySelector(".chat-widget-root");

  function showWidget() {
    widget.classList.remove("animate-out");
    widget.classList.add("animate-in");
  }

  function hideWidget() {
    widget.classList.remove("animate-in");
    widget.classList.add("animate-out");
  }

  // Action bar visibility toggle on scroll
  const actionBar = document.querySelector(".action-bar");
  let lastScrollY = window.scrollY;
  window.addEventListener("scroll", () => {
    const currentY = window.scrollY;
    // Fade out action menu when at top (nav visible)
    if (currentY <= 50) {
      actionBar.classList.add("hidden");
    } else {
      actionBar.classList.remove("hidden");
    }
    lastScrollY = currentY;
  });

  document
    .getElementById("chat-btn-nav")
    .addEventListener("click", function () {
      const chatScrollButton = document.getElementById("chat-spot");
      console.log("Chat spot clicked, scrolling to section:", chatScrollButton);

      if (chatScrollButton) {
        chatScrollButton.scrollIntoView({
          behavior: "smooth", // Optional: for smooth scrolling
          block: "start", // Optional: align the top of the element to the top of the viewport
        });
      }
    });

  document
    .getElementById("about-button")
    .addEventListener("click", function () {
      const aboutScrollButton = document.getElementById("about-spot");
      console.log(
        "Chat spot clicked, scrolling to section:",
        aboutScrollButton
      );

      if (aboutScrollButton) {
        aboutScrollButton.scrollIntoView({
          behavior: "smooth", // Optional: for smooth scrolling
          block: "start", // Optional: align the top of the element to the top of the viewport
        });
      }
    });
  document
    .getElementById("about-btn-nav")
    .addEventListener("click", function () {
      const aboutScrollButton = document.getElementById("about-spot");
      console.log(
        "Chat spot clicked, scrolling to section:",
        aboutScrollButton
      );

      if (aboutScrollButton) {
        aboutScrollButton.scrollIntoView({
          behavior: "smooth", // Optional: for smooth scrolling
          block: "start", // Optional: align the top of the element to the top of the viewport
        });
      }
    });

  document.getElementById("chat-button").addEventListener("click", function () {
    const chatScrollButton = document.getElementById("chat-spot");
    console.log("Chat spot clicked, scrolling to section:", chatScrollButton);

    if (chatScrollButton) {
      chatScrollButton.scrollIntoView({
        behavior: "smooth", // Optional: for smooth scrolling
        block: "start", // Optional: align the top of the element to the top of the viewport
      });
    }
  });

  document
    .getElementById("social-btn-nav")
    .addEventListener("click", function () {
      const socialScrollButton = document.getElementById("social-spot");
      console.log(
        "Chat spot clicked, scrolling to section:",
        socialScrollButton
      );

      if (socialScrollButton) {
        socialScrollButton.scrollIntoView({
          behavior: "smooth", // Optional: for smooth scrolling
          block: "start", // Optional: align the top of the element to the top of the viewport
        });
      }
    });

  // Action menu button and toggle

  // Add this function after your updateHUD function (around line 600)
  function updateEmotionalDashboard(stats) {
    if (!stats.emotions || stats.emotions.length === 0) return;

    const dominantEmotion = stats.emotions.reduce((a, b) =>
      a.intensity > b.intensity ? a : b
    );
    document.querySelector("#dominant-emotion").textContent =
      dominantEmotion.name || "Neutral";

    // Create/update emotion bars
    const barsContainer = document.getElementById("emotion-bars");
    barsContainer.innerHTML = "";

    stats.emotions.forEach((emotion) => {
      const barHTML = `
        <div class="emotion-bar">
          <div class="emotion-bar-label">${emotion.name}</div>
          <div class="emotion-bar-fill">
            <div class="emotion-bar-progress" 
                 style="width: ${emotion.percentage}%; 
                        background-color: rgb(${emotion.color.join(",")});">
            </div>
          </div>
          <div class="emotion-bar-percentage">${emotion.percentage}%</div>
        </div>
      `;
      barsContainer.insertAdjacentHTML("beforeend", barHTML);
    });
  }

  document.getElementById("reveal-thoughts").addEventListener("click", () => {
    const logSection = document.getElementById("thought-log-section");
    logSection.scrollIntoView({ behavior: "smooth" });
  });

  initWorker();

  //MUTATION TOGGLE
  mutationToggle.addEventListener("change", () => {
    const chance = mutationToggle.checked ? MUTATION_CHANCE : 0;
    const mutationCheckbox = document.getElementById("mutation-checkbox");
    if (worker) {
      worker.postMessage({ type: "setMutation", mutationChance: chance });
      if (mutationCheckbox.checked) {
        console.log(`Mutation enabled with chance: ${chance}`);
      } else {
        console.log("Mutation disabled");
      }
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
      console.log(
        `Reproduction rate set to: ${parseFloat(reproductionRateSlider.value)}`
      );
    }
  });

  //SPEED SLIDER
  speedSlider.max = "5";
  speedSlider.min = "1";
  speedSlider.value = "1"; // Default value
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


  //FLIPPABLE CARD TOGGLE
document.querySelectorAll('.flip-card').forEach((card) => {
  card.addEventListener("click", () => {
    card.classList.toggle("flipped");

    if (card.classList.contains("flipped")) {
      card.querySelector(".flip-card-back").style.display = "block";
      card.querySelector(".flip-card-front").style.display = "none";
    }
    else {
      card.querySelector(".flip-card-back").style.display = "none";
      card.querySelector(".flip-card-front").style.display = "block";
    }
  });
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
    updateEmotionalDashboard(stats);

    updateCanvasBorderEmotion(stats.dominant);
  }

  let lastClaudeTick = -1;
  function animate() {
    if (!running) return;
    worker.postMessage({ type: "update", updates: UPDATES_PER_FRAME });
  }
});
