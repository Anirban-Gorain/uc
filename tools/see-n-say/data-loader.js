// Reads your filtered photo list and matches each photo with its 5 sentences
async function fetchSceneDataset() {
  try {
    // 1. Read the handpicked photo IDs
    const filterRes = await fetch("../../data/filtered-image-ids.txt");
    if (!filterRes.ok) throw new Error("Could not find filtered-image-ids.txt");
    const filterText = await filterRes.text();

    const validIds = new Set(
      filterText
        .split(/\r?\n/)
        .map((line) => line.trim().replace(".jpg", ""))
        .filter(Boolean),
    );

    // 2. Read the master sentence list
    const masterRes = await fetch("../../data/all-image-id-and-des.txt");
    if (!masterRes.ok)
      throw new Error("Could not find all-image-id-and-des.txt");
    const masterText = await masterRes.text();

    // 3. Match the handpicked IDs with their 5 sentences
    const tempMap = {};
    masterText.split(/\r?\n/).forEach((line) => {
      if (!line.trim()) return;
      const parts = line.split(/\t| /);
      const fullId = parts[0];
      const baseId = fullId.split("#")[0].replace(".jpg", "").trim();
      const description = parts.slice(1).join(" ").trim();

      if (validIds.has(baseId)) {
        if (!tempMap[baseId]) {
          tempMap[baseId] = {
            fileName: baseId + ".jpg",
            descriptions: [],
          };
        }
        tempMap[baseId].descriptions.push(description);
      }
    });

    return Object.values(tempMap);
  } catch (error) {
    console.error("Data error:", error);
    alert(
      "Please run this game on a live server so it can read your data files safely.",
    );
    return [];
  }
}
