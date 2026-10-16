// Counts how many letters need to change to fix a spelling mistake
function levenshteinDistance(wordA, wordB) {
  const matrix = [];
  for (let i = 0; i <= wordB.length; i++) matrix[i] = [i];
  for (let j = 0; j <= wordA.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= wordB.length; i++) {
    for (let j = 1; j <= wordA.length; j++) {
      if (wordB.charAt(i - 1) === wordA.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1,
        );
      }
    }
  }
  return matrix[wordB.length][wordA.length];
}

// Compares the player's sentence with one target sentence
function calculateAccuracy(userInput, targetSentence) {
  const uWords = userInput
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 2);
  const tWords = targetSentence
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 2);

  if (tWords.length === 0 || uWords.length === 0) return 0;

  let matchedWords = 0;
  tWords.forEach((tWord) => {
    let bestDist = 999;
    uWords.forEach((uWord) => {
      const dist = levenshteinDistance(tWord, uWord);
      if (dist < bestDist) bestDist = dist;
    });

    const allowedTypos = tWord.length > 5 ? 2 : 1;
    if (bestDist <= allowedTypos) matchedWords++;
  });

  return (matchedWords / tWords.length) * 100;
}

// Checks all 5 sentences and returns the highest score and best match
function getBestScore(userInput, descriptionsArray) {
  let bestScore = 0;
  let bestMatch = "";

  descriptionsArray.forEach((desc) => {
    const score = calculateAccuracy(userInput, desc);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = desc;
    }
  });

  return {
    score: Math.min(100, Math.round(bestScore)),
    match: bestMatch || descriptionsArray[0],
  };
}
