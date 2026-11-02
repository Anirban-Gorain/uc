/**
 * @file bounds.js
 * @description Dynamically computes the global archipelago bounding box.
 */

import { MAP_CONFIG } from "../config.js";
import { runtimeWorld, dom } from "../state.js";

export function computeWorldBounds() {
  if (!MAP_CONFIG.islands.length) {
    runtimeWorld.width = 1600;
    runtimeWorld.height = 900;
    runtimeWorld.offsetX = 0;
    runtimeWorld.offsetY = 0;
    return;
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  MAP_CONFIG.islands.forEach((island) => {
    if (island.x < minX) minX = island.x;
    if (island.y < minY) minY = island.y;
    if (island.x + island.width > maxX) maxX = island.x + island.width;
    if (island.y + island.height > maxY) maxY = island.y + island.height;
  });

  const pad = MAP_CONFIG.oceanPadding;

  runtimeWorld.offsetX = pad - minX;
  runtimeWorld.offsetY = pad - minY;

  runtimeWorld.width = maxX - minX + 2 * pad;
  runtimeWorld.height = maxY - minY + 2 * pad;

  // Synchronize CSS Properties
  const style = document.documentElement.style;
  style.setProperty("--world-width", `${runtimeWorld.width}px`);
  style.setProperty("--world-height", `${runtimeWorld.height}px`);
  style.setProperty("--ocean-color", MAP_CONFIG.colors.ocean);
  style.setProperty("--sand-color", MAP_CONFIG.colors.sand);
  style.setProperty("--grass-color", MAP_CONFIG.colors.grass);

  // Synchronize SVG Road Layer Viewport
  dom.roadLayer.setAttribute(
    "viewBox",
    `0 0 ${runtimeWorld.width} ${runtimeWorld.height}`,
  );
  dom.roadLayer.setAttribute("width", runtimeWorld.width);
  dom.roadLayer.setAttribute("height", runtimeWorld.height);
}
