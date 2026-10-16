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

// Starts the game when the player clicks the button
async function startGame() {
  const btnText = document.querySelector("#start-screen button");
  const loadText = document.getElementById("loading-text");

  btnText.innerText = "Loading...";
  loadText.classList.remove("hidden");

  if (gameData.length === 0) {
    gameData = await fetchSceneDataset();
  }

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

// Grades the player's answer and moves to the next picture
function submitAnswer() {
  clearInterval(timerInterval);
  if (currentIndex >= currentRounds.length) return;

  const userText = document.getElementById("user-input").value.trim();
  const scene = currentRounds[currentIndex];
  const result = getBestScore(userText, scene.descriptions);

  answers.push({
    img: `../../assets/images/${scene.fileName}`,
    userInput: userText || "(No Answer)",
    bestTarget: result.match,
    score: result.score,
  });

  currentIndex++;
  if (currentIndex < currentRounds.length) {
    loadScene();
  } else {
    showResults();
  }
}

// Builds the final report card screen
function showResults() {
  showScreen("results-screen");

  const totalScore = Math.round(
    answers.reduce((acc, curr) => acc + curr.score, 0) / answers.length,
  );
  const scoreEl = document.getElementById("final-score");
  scoreEl.innerText = `${totalScore}%`;

  if (totalScore < 50)
    scoreEl.className = "text-5xl font-extrabold text-red-500 mt-4";
  else if (totalScore < 80)
    scoreEl.className = "text-5xl font-extrabold text-yellow-400 mt-4";
  else scoreEl.className = "text-5xl font-extrabold text-green-400 mt-4";

  const listEl = document.getElementById("report-list");
  listEl.innerHTML = "";

  answers.forEach((ans, i) => {
    let scoreColor = "text-green-400";
    if (ans.score < 50) scoreColor = "text-red-400";
    else if (ans.score < 80) scoreColor = "text-yellow-400";

    const item = document.createElement("div");
    item.className =
      "bg-slate-800/50 p-4 rounded-xl border border-slate-700 flex flex-col lg:flex-row gap-4 items-start lg:items-center";

    item.innerHTML = `
      <img src="${ans.img}" class="w-24 h-20 object-cover rounded-lg shadow-md bg-slate-900 flex-shrink-0">
      <div class="flex-1 min-w-0 w-full">
        <div class="flex justify-between items-end mb-2">
          <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Picture ${i + 1}</span>
          <span class="font-bold text-lg ${scoreColor}">${ans.score}% Match</span>
        </div>
        <p class="text-sm text-slate-200 mb-1"><strong>You wrote:</strong> ${ans.userInput}</p>
        <p class="text-xs text-indigo-300"><strong>Best Match:</strong> ${ans.bestTarget}</p>
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
