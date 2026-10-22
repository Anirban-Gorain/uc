// Load saved progress from the browser memory
let finishedSteps =
  JSON.parse(localStorage.getItem("vaakifyGrammarTracker")) || [];

// This function loops through the JSON data and builds the HTML boxes
function buildRoadmap() {
  const container = document.getElementById("roadmap-container");
  container.innerHTML = "";

  roadmapData.forEach((step, index) => {
    const isDone = finishedSteps.includes(step.id);
    const stepNumber = index + 1;

    // Set colors depending on if it is finished or not
    const circleColor = isDone
      ? "bg-green-400 border-green-400 text-slate-900"
      : "bg-slate-900 border-slate-600 text-slate-400";

    const boxGlow = isDone
      ? "border-green-400/30 bg-slate-800/60"
      : "border-slate-700/60 bg-slate-800/40";

    const checkText = isDone ? "Completed" : "Mark as Done";
    const checkStyle = isDone
      ? "bg-green-400/10 border-green-400/50 text-green-400"
      : "bg-transparent border-slate-600 text-slate-400 hover:border-slate-400 hover:text-white";

    // Build the 4 examples into an HTML list
    const examplesHTML = step.examples.map((ex) => `<li>${ex}</li>`).join("");

    // The step card HTML
    const stepHTML = `
      <div class="flex items-start gap-4 lg:gap-6 group card-hidden" id="card-${step.id}">
        
        <!-- The Number Circle -->
        <div id="circle-${step.id}" class="w-10 h-10 lg:w-12 lg:h-12 rounded-full border-2 ${circleColor} flex items-center justify-center font-bold text-sm lg:text-base shrink-0 mt-2 transition-colors duration-500 shadow-lg relative z-10">
          ${isDone ? "✓" : stepNumber}
        </div>

        <!-- The Main Card -->
        <div id="box-${step.id}" class="flex-1 border ${boxGlow} p-5 lg:p-7 rounded-[2rem] shadow-sm transition-all duration-500 flex flex-col lg:flex-row gap-6 items-start lg:items-center">
          
          <!-- Text Area -->
          <div class="flex-1 w-full">
            <div class="flex flex-wrap items-center gap-3 mb-3">
              <h3 class="text-lg lg:text-xl font-bold text-white">${step.title}</h3>
              <!--<span class="text-[10px] sm:text-xs font-bold bg-indigo-500/10 text-indigo-400 px-2.5 py-1 rounded-full border border-indigo-500/20 whitespace-nowrap">${step.time}</span>-->
            </div>
            
            <div class="text-sm lg:text-base text-slate-400 leading-relaxed space-y-3">
              <p><strong class="text-slate-200">What to learn:</strong> ${step.howTo}</p>
              <p><strong class="text-slate-200">Quick Idea:</strong> ${step.idea}</p>
              
              <div class="bg-slate-900/50 p-3 lg:p-4 rounded-xl border border-slate-700/50 mt-3">
                <strong class="text-orange-300 text-sm block mb-1">Examples:</strong>
                <ul class="text-slate-400 text-sm space-y-1 ml-4 list-decimal marker:text-slate-500">
                  ${examplesHTML}
                </ul>
              </div>
            </div>
          </div>

          <!-- Buttons Area -->
          <div class="flex flex-wrap lg:flex-col gap-2 w-full lg:w-36 shrink-0 mt-2 lg:mt-0">
            
            <!-- Creative Coming Soon Buttons -->
            <button class="flex-1 lg:flex-none flex items-center justify-center gap-1.5 text-center bg-slate-900/30 text-[11px] font-semibold text-slate-500 py-3 px-2 rounded-xl border border-dashed border-slate-700 cursor-not-allowed">
              ▶ Watch <span class="text-[9px] bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700/50 text-slate-400">Soon</span>
            </button>
            <button class="flex-1 lg:flex-none flex items-center justify-center gap-1 text-center bg-slate-900/30 text-[11px] font-bold text-slate-500 py-3 px-2 rounded-xl border border-dashed border-slate-700 cursor-not-allowed">
              Practice <span class="text-[9px] bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700/50 text-slate-400">Soon</span>
            </button>
            
            <!-- The Checkmark Button -->
            <button id="btn-${step.id}" onclick="toggleCheck('${step.id}', ${index + 1})" class="hover-pop w-full lg:w-auto mt-2 lg:mt-0 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 font-bold text-xs transition-all duration-300 ${checkStyle}">
              ${checkText}
            </button>
          </div>

        </div>
      </div>
    `;

    container.innerHTML += stepHTML;
  });

  setupScrollAnimations();
  updateTracker();
}

// When you click the checkmark, it updates just that one card smoothly
function toggleCheck(stepId, stepNumber) {
  const isCurrentlyDone = finishedSteps.includes(stepId);

  const circleEl = document.getElementById(`circle-${stepId}`);
  const boxEl = document.getElementById(`box-${stepId}`);
  const btnEl = document.getElementById(`btn-${stepId}`);

  if (isCurrentlyDone) {
    // Uncheck it
    finishedSteps = finishedSteps.filter((id) => id !== stepId);

    // Change colors back to dark blue
    circleEl.className =
      "w-10 h-10 lg:w-12 lg:h-12 rounded-full border-2 bg-slate-900 border-slate-600 text-slate-400 flex items-center justify-center font-bold text-sm lg:text-base shrink-0 mt-2 transition-colors duration-500 shadow-lg relative z-10";
    circleEl.innerText = stepNumber;

    boxEl.className =
      "flex-1 border border-slate-700/60 bg-slate-800/40 p-5 lg:p-7 rounded-[2rem] shadow-sm transition-all duration-500 flex flex-col lg:flex-row gap-6 items-start lg:items-center";

    btnEl.className =
      "hover-pop w-full lg:w-auto mt-2 lg:mt-0 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 font-bold text-xs transition-all duration-300 bg-transparent border-slate-600 text-slate-400 hover:border-slate-400 hover:text-white";
    btnEl.innerText = "Mark as Done";
  } else {
    // Check it
    finishedSteps.push(stepId);

    // Change colors to green
    circleEl.className =
      "w-10 h-10 lg:w-12 lg:h-12 rounded-full border-2 bg-green-400 border-green-400 text-slate-900 flex items-center justify-center font-bold text-sm lg:text-base shrink-0 mt-2 transition-colors duration-500 shadow-lg relative z-10";
    circleEl.innerText = "✓";

    boxEl.className =
      "flex-1 border border-green-400/30 bg-slate-800/60 p-5 lg:p-7 rounded-[2rem] shadow-sm transition-all duration-500 flex flex-col lg:flex-row gap-6 items-start lg:items-center";

    btnEl.className =
      "hover-pop w-full lg:w-auto mt-2 lg:mt-0 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 font-bold text-xs transition-all duration-300 bg-green-400/10 border-green-400/50 text-green-400";
    btnEl.innerText = "Completed";
  }

  // Save to memory and fix the top bar math
  localStorage.setItem("vaakifyGrammarTracker", JSON.stringify(finishedSteps));
  updateTracker();
}

// Handles the math and colors for the one-row progress bar
function updateTracker() {
  const total = roadmapData.length;
  const finished = finishedSteps.length;
  const percentage = Math.round((finished / total) * 100) || 0;

  const textEl = document.getElementById("progress-text");
  const fillEl = document.getElementById("progress-fill");

  textEl.innerText = percentage + "%";
  fillEl.style.width = percentage + "%";

  // Remove old colors
  textEl.classList.remove("text-rose-400", "text-yellow-400", "text-green-400");
  fillEl.classList.remove("bg-rose-400", "bg-yellow-400", "bg-green-400");

  // Apply your exact rule
  if (percentage < 50) {
    textEl.classList.add("text-rose-400");
    fillEl.classList.add("bg-rose-400");
  } else if (percentage < 80) {
    textEl.classList.add("text-yellow-400");
    fillEl.classList.add("bg-yellow-400");
  } else {
    textEl.classList.add("text-green-400");
    fillEl.classList.add("bg-green-400");
  }
}

// This tool watches the screen to make the cards slide in
function setupScrollAnimations() {
  const cards = document.querySelectorAll(".card-hidden");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("card-visible");
        }
      });
    },
    { threshold: 0.1 },
  );

  cards.forEach((card) => observer.observe(card));
}

// Start everything when the page loads
buildRoadmap();
