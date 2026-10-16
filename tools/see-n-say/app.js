let gameData = [];
let currentRounds = [];
let currentIndex = 0;
let timerInterval = null;
let timeRemaining = 15000;
const totalTime = 15000;
let answers = [];
let currentHints = { singles: [], phrases: [] };

// Switches between Start, Game, and Results screens
function showScreen(id) {
  document
    .querySelectorAll(".screen")
    .forEach((s) => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

// Starts the game and wakes up the AI Brain
async function startGame() {
  const btnText = document.querySelector("#start-screen button");
  const loadText = document.getElementById("loading-text");

  // Alert the user that the AI is loading on the first run
  btnText.innerText = "Waking up AI Brain...";
  btnText.disabled = true;
  loadText.classList.remove("hidden");

  // Load the AI model and Dictionary
  await initScorer();

  if (gameData.length === 0) {
    gameData = await fetchSceneDataset();
  }

  btnText.disabled = false;

  if (gameData.length === 0) {
    btnText.innerText = "Start Playing";
    loadText.classList.add("hidden");
    return;
  }

  currentRounds = [...gameData].sort(() => Math.random() - 0.5).slice(0, 10);
  currentIndex = 0;
  answers = [];

  showScreen("game-screen");
  loadScene();
}

// Loads one photo round and starts the 15-second timer
function loadScene() {
  clearInterval(timerInterval);
  document.getElementById("bubble-container").innerHTML = "";

  const scene = currentRounds[currentIndex];

  document.getElementById("scene-counter").innerText =
    `${currentIndex + 1} / ${currentRounds.length}`;
  document.getElementById("user-input").value = "";
  document.getElementById("scene-img").src =
    `../../assets/images/${scene.fileName}`;

  currentHints = getCombinedHints(scene.descriptions);

  timeRemaining = totalTime;
  updateTimerUI();
  document.getElementById("user-input").focus();

  timerInterval = setInterval(() => {
    timeRemaining -= 100;
    updateTimerUI();

    const userIsStuck =
      document.getElementById("user-input").value.trim() === "";

    // At 10 seconds left: show 1-word clues
    if (timeRemaining === 10000 && userIsStuck) {
      popBubbles(currentHints.singles);
    }

    // At 5 seconds left: show 2-word phrase clues
    if (timeRemaining === 8000 && userIsStuck) {
      popBubbles(currentHints.phrases);
    }

    if (timeRemaining <= 0) {
      clearInterval(timerInterval);
      submitAnswer();
    }
  }, 100);
}

// Updates the shrinking bar and seconds text
function updateTimerUI() {
  const pct = Math.max(0, (timeRemaining / totalTime) * 100);
  const bar = document.getElementById("timer-bar");
  bar.style.width = pct + "%";
  document.getElementById("time-text").innerText =
    (timeRemaining / 1000).toFixed(1) + "s";

  if (pct < 30) bar.classList.add("timer-warning");
  else bar.classList.remove("timer-warning");
}

// Grades the player's intention using AI and moves to the next picture
async function submitAnswer() {
  clearInterval(timerInterval);
  if (currentIndex >= currentRounds.length) return;

  const userText = document.getElementById("user-input").value.trim();
  const scene = currentRounds[currentIndex];

  // Show UI feedback while the AI processes the meaning
  const submitBtn = document.querySelector("#game-screen button");
  const oldText = submitBtn.innerText;
  submitBtn.innerText = "Grading Meaning...";
  submitBtn.disabled = true;

  // Ask the AI to grade the sentence
  const result = await getBestScore(userText, scene.descriptions);

  // Restore button
  submitBtn.innerText = oldText;
  submitBtn.disabled = false;

  answers.push({
    img: `../../assets/images/${scene.fileName}`,
    userInput: userText || "(No Answer)",
    bestTarget: result.match,
    score: result.score,
    misspelled: result.misspelled,
  });

  currentIndex++;
  if (currentIndex < currentRounds.length) {
    loadScene();
  } else {
    showResults();
  }
}

// Builds the final report card dashboard
function showResults() {
  showScreen("results-screen");

  const totalScore =
    Math.round(
      answers.reduce((acc, curr) => acc + curr.score, 0) / answers.length,
    ) || 0;

  // --- LOCAL STORAGE PROGRESS TRACKING ---
  let stats = JSON.parse(localStorage.getItem("seenSayStats")) || {
    rounds: 0,
    minutes: 0,
    history: [],
  };

  // FIX: Add exactly 1 to the total games played, not 10
  stats.rounds += 1;
  stats.minutes += (currentRounds.length * 15) / 60; // Adds 2.5 minutes per game

  stats.history.push(totalScore);
  if (stats.history.length > 10) stats.history.shift(); // Keep only last 10 scores
  localStorage.setItem("seenSayStats", JSON.stringify(stats));

  // Update UI Stats
  document.getElementById("stat-rounds").innerText = stats.rounds;
  document.getElementById("stat-minutes").innerText = stats.minutes.toFixed(1);

  // Generate Bar Graph
  const graphContainer = document.getElementById("progress-graph");
  graphContainer.innerHTML = stats.history
    .map(
      (score) => `
    <div class="flex-1 flex flex-col justify-end items-center group relative h-full">
      <div class="w-full max-w-[2rem] bg-indigo-500/80 hover:bg-indigo-400 rounded-t-sm transition-all duration-300" style="height: ${Math.max(5, score)}%"></div>
      <span class="absolute -top-6 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 px-2 py-1 rounded shadow-md">${score}%</span>
    </div>
  `,
    )
    .join("");

  // --- SCORE COUNTING ANIMATION ---
  const scoreEl = document.getElementById("final-score");
  scoreEl.innerText = "0%";
  scoreEl.className =
    "text-4xl sm:text-5xl lg:text-6xl font-extrabold text-indigo-400 tabular-nums";

  let currentScore = 0;
  const scoreInterval = setInterval(() => {
    if (currentScore >= totalScore) {
      clearInterval(scoreInterval);
      scoreEl.innerText = `${totalScore}%`;
      // Final color switch
      if (totalScore < 50)
        scoreEl.classList.replace("text-indigo-400", "text-rose-500");
      else if (totalScore < 80)
        scoreEl.classList.replace("text-indigo-400", "text-yellow-400");
      else scoreEl.classList.replace("text-indigo-400", "text-green-400");
    } else {
      currentScore += Math.max(1, Math.ceil((totalScore - currentScore) / 10));
      scoreEl.innerText = `${currentScore}%`;
    }
  }, 40);

  // --- LIST GENERATION ---
  const listEl = document.getElementById("report-list");
  listEl.innerHTML = "";

  answers.forEach((ans, i) => {
    let scoreColor =
      "text-green-400 bg-green-400/10 border border-green-400/20";
    if (ans.score < 50)
      scoreColor = "text-rose-400 bg-rose-400/10 border border-rose-400/20";
    else if (ans.score < 80)
      scoreColor =
        "text-yellow-400 bg-yellow-400/10 border border-yellow-400/20";

    // Typo Highlighter (Now powered by real dictionary logic)
    let highlightedText = ans.userInput
      .split(" ")
      .map((word) => {
        const clean = word.toLowerCase().replace(/[^\w\s]/g, "");
        if (
          clean.length > 2 &&
          ans.misspelled &&
          ans.misspelled.includes(clean)
        ) {
          return `<span class="text-rose-400 underline decoration-rose-400/60 underline-offset-4" title="Check spelling or missing context">${word}</span>`;
        }
        return word;
      })
      .join(" ");

    const item = document.createElement("div");
    item.className =
      "bg-slate-800/40 p-4 lg:p-6 rounded-2xl border border-slate-700/60 flex flex-col lg:flex-row gap-5 items-start lg:items-center";

    item.innerHTML = `
      <img src="${ans.img}" class="w-full sm:w-56 lg:w-64 h-40 lg:h-48 object-cover rounded-xl shadow-md border border-white/5 flex-shrink-0">
      <div class="flex-1 min-w-0 w-full flex flex-col justify-center">
        <div class="flex justify-between items-center mb-3">
          <span class="text-xs font-semibold text-slate-500 tracking-wider uppercase">Scene #${i + 1}</span>
          <span class="font-bold text-xs px-3 py-1 rounded-full ${scoreColor}">${ans.score}% Match</span>
        </div>
        <p class="text-base text-slate-200 mb-2 leading-relaxed"><strong>You wrote:</strong> ${highlightedText}</p>
        <p class="text-sm text-indigo-300/80"><strong>Possible answer:</strong> ${ans.bestTarget}</p>
      </div>
    `;
    listEl.appendChild(item);
  });
}

// Listen for the Enter key inside the typing box
document.addEventListener("DOMContentLoaded", () => {
  const inputBox = document.getElementById("user-input");
  if (inputBox) {
    inputBox.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        submitAnswer();
      }
    });
  }
});

// Controls the "How it works" pop-up modal
function openHowItWorks() {
  const modal = document.getElementById("how-modal");
  const box = document.getElementById("how-box");

  modal.classList.remove("hidden");
  modal.classList.add("flex");

  setTimeout(() => {
    modal.classList.remove("opacity-0");
    box.classList.remove("scale-95");
  }, 10);
}

function closeHowItWorks() {
  const modal = document.getElementById("how-modal");
  const box = document.getElementById("how-box");

  modal.classList.add("opacity-0");
  box.classList.add("scale-95");

  setTimeout(() => {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  }, 300);
}

// Automatically slide to the newest hint when it appears
const bubbleContainer = document.getElementById("bubble-container");
if (bubbleContainer) {
  const hintWatcher = new MutationObserver(() => {
    bubbleContainer.scrollTo({
      left: bubbleContainer.scrollWidth,
      behavior: "smooth",
    });
  });
  hintWatcher.observe(bubbleContainer, { childList: true });
}
