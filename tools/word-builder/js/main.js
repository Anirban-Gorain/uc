/**
 * @file main.js
 * @description Master application bootstrap and orchestrator for Fluency City.
 */

import { computeWorldBounds } from "./engine/bounds.js";
import {
  renderIslands,
  renderGridOverlays,
  renderRoads,
  renderParcels,
  updateBuildingStatusBadges,
  initAmbientAtmosphere,
} from "./engine/renderer.js";
import { registerCameraEvents, initializeCamera } from "./engine/camera.js";
import { initEvents } from "./engine/events.js";
import { progressStore } from "./engine/progress.js";

function bootstrap() {
  // 1. Calculate map geometry and configure viewport
  computeWorldBounds();

  // 2. Render archipelago layers
  renderIslands();
  renderGridOverlays();
  renderRoads();
  renderParcels();
  initAmbientAtmosphere();

  // 3. Initialize camera transformations and user interaction
  registerCameraEvents();
  initializeCamera();

  // 4. Attach application-level event delegation
  initEvents();

  // 5. Wire reactive progress updates: when levels complete, map reflects new status
  progressStore.subscribe(() => {
    updateBuildingStatusBadges();
  });
}

document.addEventListener("DOMContentLoaded", bootstrap);
