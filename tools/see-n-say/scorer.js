let extractor = null;
let dictionary = new Set();
let cos_sim_helper = null;

// 1. Initialize the AI Brain and Dictionary
async function initScorer() {
  if (extractor) return; // Stop if already loaded

  try {
    // Fetch a lightweight English dictionary (10,000 common words) for true spell checking
    const res = await fetch(
      "https://raw.githubusercontent.com/first20hours/google-10000-english/master/google-10000-english-no-swears.txt",
    );
    const text = await res.text();
    text.split(/\r?\n/).forEach((w) => {
      if (w.trim()) dictionary.add(w.trim().toLowerCase());
    });

    // Add common extra words to the dictionary just in case
    [
      "is",
      "are",
      "was",
      "were",
      "has",
      "have",
      "a",
      "an",
      "the",
      "in",
      "on",
      "at",
      "to",
      "of",
      "and",
      "with",
      "by",
      "for",
      "it",
      "this",
      "that",
    ].forEach((w) => dictionary.add(w));
  } catch (err) {
    console.warn(
      "Could not load the online dictionary. Spellcheck will be less accurate.",
    );
  }

  // Dynamically import the Transformers.js AI Library
  const transformers =
    await import("https://cdn.jsdelivr.net/npm/@xenova/transformers");
  const pipeline = transformers.pipeline;
  cos_sim_helper = transformers.cos_sim;

  // Load the AI meaning-matching model (Downloads ~30MB once, then caches in the browser)
  extractor = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
}

// 2. True Spelling Checker (Does not punish for using valid words outside the answer key)
function getMisspelledWords(userInput, targetSentences) {
  // Always allow words that actually appear in the scene's descriptions
  const allowedSceneWords = new Set(
    targetSentences
      .join(" ")
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .split(/\s+/),
  );

  const words = userInput.split(/\s+/).filter((w) => w.length > 0);
  let misspelled = [];

  words.forEach((rawWord) => {
    const clean = rawWord.toLowerCase().replace(/[^\w\s]/g, "");
    if (clean.length <= 2) return; // Ignore tiny words

    // Check if the word is missing from BOTH our dictionary and the scene's answer key
    if (
      !dictionary.has(clean) &&
      !allowedSceneWords.has(clean) &&
      dictionary.size > 0
    ) {
      // Forgive simple plurals or verb endings if the root word exists in the dictionary
      if (clean.endsWith("s") && dictionary.has(clean.slice(0, -1))) return;
      if (clean.endsWith("es") && dictionary.has(clean.slice(0, -2))) return;
      if (clean.endsWith("ing") && dictionary.has(clean.slice(0, -3))) return;
      if (clean.endsWith("ed") && dictionary.has(clean.slice(0, -2))) return;

      misspelled.push(clean);
    }
  });

  return misspelled;
}

// 3. AI Meaning Score
async function getBestScore(userInput, descriptionsArray) {
  if (!userInput.trim())
    return { score: 0, match: descriptionsArray[0], misspelled: [] };

  const misspelled = getMisspelledWords(userInput, descriptionsArray);

  // If the AI failed to load, return 0 to prevent breaking the game
  if (!extractor) {
    return { score: 0, match: descriptionsArray[0], misspelled };
  }

  // Generate an AI vector (concept map) for the user's sentence
  const userOutput = await extractor(userInput, {
    pooling: "mean",
    normalize: true,
  });

  let bestScore = 0;
  let bestMatch = "";

  // Compare the user's idea against all 5 target sentences
  for (const desc of descriptionsArray) {
    const targetOutput = await extractor(desc, {
      pooling: "mean",
      normalize: true,
    });

    // Compare the vectors (1.0 = identical meaning, 0.0 = completely different)
    let score = cos_sim_helper(userOutput.data, targetOutput.data);

    if (score > bestScore) {
      bestScore = score;
      bestMatch = desc;
    }
  }

  // Multiply by 100 to get a clean percentage
  let finalScore = Math.max(0, Math.min(100, Math.round(bestScore * 100)));

  // --- NEW: COMPLETENESS PENALTY ---
  // Strip out grammar fluff to see how many actual ideas the user typed
  const fillerWords = new Set([
    "a",
    "an",
    "the",
    "is",
    "are",
    "was",
    "were",
    "in",
    "on",
    "at",
    "to",
    "of",
    "and",
    "with",
    "by",
    "for",
    "it",
    "this",
    "that",
    "some",
    "has",
    "have",
  ]);
  const meaningfulUserWords = userInput
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 0 && !fillerWords.has(w));

  // Slash the score if they only typed a subject without an action
  if (meaningfulUserWords.length === 0) {
    finalScore = 0;
  } else if (meaningfulUserWords.length === 1) {
    finalScore = Math.round(finalScore * 0.3); // Drops 44% down to ~13%
  } else if (meaningfulUserWords.length === 2) {
    finalScore = Math.round(finalScore * 0.6); // Drops 57% down to ~34%
  } else if (finalScore > 85) {
    // Add a tiny boost only if they wrote a full sentence that matched perfectly
    finalScore = Math.min(100, finalScore + 5);
  }

  return {
    score: finalScore,
    match: bestMatch || descriptionsArray[0],
    misspelled: misspelled,
  };
}
