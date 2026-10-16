let activeHintTimers = [];

// Stops any old hints from popping up on the next picture
function clearHintTimers() {
  activeHintTimers.forEach((timer) => clearTimeout(timer));
  activeHintTimers = [];
}

// Mixes smart word finding and voting to pick 1-word and 2-word clues
function getCombinedHints(descriptions) {
  clearHintTimers();

  const singleVoteBox = {};
  const phraseVoteBox = {};

  // Trash list for unhelpful small words
  const boringWords = new Set([
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
    "other",
    "another",
    "there",
    "their",
    "where",
    "while",
    "two",
    "one",
  ]);

  // Ask the smart reader for naming, action, and describing words
  const allText = descriptions.join(". ");
  const doc = nlp(allText);
  const allowedMachineWords = new Set([
    ...doc
      .nouns()
      .out("array")
      .map((w) => w.toLowerCase().replace(/[^a-z]/g, "")),
    ...doc
      .verbs()
      .out("array")
      .map((w) => w.toLowerCase().replace(/[^a-z]/g, "")),
    ...doc
      .adjectives()
      .out("array")
      .map((w) => w.toLowerCase().replace(/[^a-z]/g, "")),
  ]);

  // Count how many sentences use each word and 2-word phrase
  descriptions.forEach((desc) => {
    const cleanDesc = desc
      .toLowerCase()
      .replace(/[^a-z\s]/g, "")
      .trim();
    const words = cleanDesc.split(/\s+/).filter((w) => w.length > 0);

    const seenSingles = new Set();
    const seenPhrases = new Set();

    for (let i = 0; i < words.length; i++) {
      const w = words[i];
      if (!boringWords.has(w) && w.length > 2) {
        seenSingles.add(w);
      }
    }

    for (let i = 0; i < words.length - 1; i++) {
      const w1 = words[i];
      const w2 = words[i + 1];
      if (
        !boringWords.has(w1) &&
        !boringWords.has(w2) &&
        w1.length > 2 &&
        w2.length > 2
      ) {
        seenPhrases.add(w1 + " " + w2);
      }
    }

    seenSingles.forEach(
      (w) => (singleVoteBox[w] = (singleVoteBox[w] || 0) + 1),
    );
    seenPhrases.forEach(
      (p) => (phraseVoteBox[p] = (phraseVoteBox[p] || 0) + 1),
    );
  });

  // Sort the single words by popularity
  let sortedSingles = Object.keys(singleVoteBox)
    .filter((w) => singleVoteBox[w] >= 2 && allowedMachineWords.has(w))
    .sort((a, b) => singleVoteBox[b] - singleVoteBox[a]);

  if (sortedSingles.length === 0) {
    sortedSingles = Object.keys(singleVoteBox).sort(
      (a, b) => singleVoteBox[b] - singleVoteBox[a],
    );
  }

  // Pick top 3 singles, but block words that look too similar (like "jump" and "jumping")
  let finalSingles = [];
  for (let w of sortedSingles) {
    let isTooSimilar = finalSingles.some(
      (existing) =>
        existing.includes(w) ||
        w.includes(existing) ||
        (existing.length > 3 && w.substring(0, 4) === existing.substring(0, 4)),
    );

    if (!isTooSimilar) finalSingles.push(w);
    if (finalSingles.length === 3) break;
  }

  // Sort the phrases by popularity
  let sortedPhrases = Object.keys(phraseVoteBox)
    .filter((p) => phraseVoteBox[p] >= 2)
    .sort((a, b) => phraseVoteBox[b] - phraseVoteBox[a]);

  if (sortedPhrases.length === 0) {
    sortedPhrases = Object.keys(phraseVoteBox).sort(
      (a, b) => phraseVoteBox[b] - phraseVoteBox[a],
    );
  }

  // Pick top 2 phrases, but block them if they use words we already picked
  let finalPhrases = [];
  for (let p of sortedPhrases) {
    let wordsInPhrase = p.split(" ");

    let usesExistingSingleWord = finalSingles.some((single) =>
      wordsInPhrase.includes(single),
    );
    let isTooSimilarToAnotherPhrase = finalPhrases.some(
      (existing) =>
        existing.includes(wordsInPhrase[0]) ||
        existing.includes(wordsInPhrase[1]),
    );

    if (!usesExistingSingleWord && !isTooSimilarToAnotherPhrase) {
      finalPhrases.push(p);
    }
    if (finalPhrases.length === 2) break;
  }

  // Just in case the filter blocked too much, use backups
  if (finalPhrases.length < 2) {
    finalPhrases = sortedPhrases.slice(0, 2);
  }

  return {
    singles: finalSingles,
    phrases: finalPhrases,
  };
}

// Adds one numbered hint into the row and scrolls right to show the newest one
function createBubble(text) {
  const container = document.getElementById("bubble-container");
  if (!container) return;

  const hintNumber = container.children.length + 1;

  const badge = document.createElement("div");
  badge.className = "hint-bubble";
  badge.innerHTML = `<span class="hint-label">Hint ${hintNumber}:</span> <span>${text}</span>`;

  container.appendChild(badge);

  // Slide the scrollbar all the way to the right so the newest hint is in view
  requestAnimationFrame(() => {
    container.scrollTo({
      left: container.scrollWidth,
      behavior: "smooth",
    });
  });
}

// Shows the hints one by one with a calm 1-second gap between them
function popBubbles(wordsArray) {
  let delayTime = 0;
  wordsArray.forEach((text) => {
    const timer = setTimeout(() => {
      createBubble(text);
    }, delayTime);
    activeHintTimers.push(timer);
    delayTime += 1000;
  });
}
