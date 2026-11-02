/**
 * @file state.js
 * @description Centralized runtime state, DOM references, and camera persistence.
 */

import { MAP_CONFIG } from "./config.js";

const CAMERA_STORAGE_KEY = "fluency_city_camera_state";

export const camera = {
  x: 0,
  y: 0,
  zoom: 1,
  isDragging: false,
  dragStartX: 0,
  dragStartY: 0,
  touchPinchDist: 0,
  // Click vs Drag discrimination
  totalDragDist: 0,
};

export const runtimeWorld = {
  width: 0,
  height: 0,
  offsetX: 0,
  offsetY: 0,
};

export const dom = {
  viewport: document.getElementById("viewport"),
  world: document.getElementById("world"),
  islandLayer: document.getElementById("islandLayer"),
  gridOverlay: document.getElementById("gridOverlay"),
  roadLayer: document.getElementById("roadLayer"),
    buildingLayer: document.getElementById("buildingLayer"),
  ambientSkyLayer: document.getElementById("ambientSkyLayer"),
  zoomInBtn: document.getElementById("zoomInBtn"),
  zoomOutBtn: document.getElementById("zoomOutBtn"),
  fitMapBtn: document.getElementById("fitMapBtn"),
  cloudCurtain: document.getElementById("cloudCurtain"),
};

export function saveCameraState() {
  try {
    sessionStorage.setItem(
      CAMERA_STORAGE_KEY,
      JSON.stringify({ x: camera.x, y: camera.y, zoom: camera.zoom }),
    );
  } catch {
    // Fail silently in private browsing modes
  }
}

export function loadSavedCameraState() {
  try {
    const raw = sessionStorage.getItem(CAMERA_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function isPortraitMode() {
  return window.innerHeight > window.innerWidth && window.innerWidth <= 900;
}

export function getNormalizedPointer(event) {
  const pointer = event.touches ? event.touches[0] : event;
  if (!isPortraitMode()) {
    return { x: pointer.clientX, y: pointer.clientY };
  }
  return {
    x: pointer.clientY,
    y: window.innerWidth - pointer.clientX,
  };
}

export function getIslandMetrics(island) {
  const actualIslandX = island.x + runtimeWorld.offsetX;
  const actualIslandY = island.y + runtimeWorld.offsetY;

  const lawnX = actualIslandX + island.sandThickness;
  const lawnY = actualIslandY + island.sandThickness;
  const lawnWidth = island.width - 2 * island.sandThickness;
  const lawnHeight = island.height - 2 * island.sandThickness;

  // Use the universal fixed tile constants
  const {
    width: cellWidth,
    height: cellHeight,
    gap,
    padding,
  } = MAP_CONFIG.tileSize;

  const usableWidth = lawnWidth - 2 * padding;
  const usableHeight = lawnHeight - 2 * padding;

  // Automatically calculate how many 80x64 tiles fit on this land
  const cols = Math.floor((usableWidth + gap) / (cellWidth + gap));
  const rows = Math.floor((usableHeight + gap) / (cellHeight + gap));

  return {
    actualIslandX,
    actualIslandY,
    lawnX,
    lawnY,
    lawnWidth,
    lawnHeight,
    cellWidth,
    cellHeight,
    cols,
    rows,
    padding,
    gap,
  };
}
