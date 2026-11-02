/**
 * @file app.js
 * @description Core map engine for Fluency City.
 * Controls viewport cameras, dynamic CSS variables, and layered rendering.
 */

"use strict";

/* ==========================================================================
   Map Configuration (Single Source of Truth)

   * GEOMETRY SIZING RULE:
   * -----------------------------------------------------------------------------
   * The island is anchored inside the world using inset margins:
   *   - Island Width  = world.width  - (2 * island.marginX)
   *   - Island Height = world.height - (2 * island.marginY)
   *
   * CRITICAL CONSTRAINT:
   * Ensure (2 * marginX) < world.width and (2 * marginY) < world.height.
   * If margins exceed the world boundaries, the island's computed dimensions
   * collapse into negative values and vanish from the DOM.
   *
   * All slots (x + width, y + height) must also stay within these bounds to 
   * remain positioned on top of the island grass surface.
   ========================================================================== */

const MAP_CONFIG = {
  world: {
    width: 1600,
    height: 900,
  },

  island: {
    marginX: 80,
    marginY: 60,
    sandBorderThickness: 24,
    sandBorderRadius: 40,
    grassBorderRadius: 30,
  },

  colors: {
    ocean: "#2f83c2",
    sand: "#f7d794",
    grass: "#55b85a",
  },

  camera: {
    minZoom: 0.3,
    maxZoom: 3.0,
    zoomStep: 0.1,
    fitPaddingRatio: 0.95,
  },

  slots: [
    {
      id: "slot_A1",
      x: 200,
      y: 160,
      width: 220,
      height: 180,
      label: "Slot A1",
    },
    {
      id: "slot_A2",
      x: 480,
      y: 160,
      width: 220,
      height: 180,
      label: "Slot A2",
    },
    {
      id: "slot_A3",
      x: 760,
      y: 160,
      width: 220,
      height: 180,
      label: "Slot A3",
    },
    {
      id: "slot_B1",
      x: 200,
      y: 420,
      width: 220,
      height: 180,
      label: "Slot B1",
    },
    {
      id: "slot_B2",
      x: 480,
      y: 420,
      width: 220,
      height: 180,
      label: "Slot B2",
    },
    {
      id: "slot_B3",
      x: 760,
      y: 420,
      width: 220,
      height: 180,
      label: "Slot B3",
    },
    {
      id: "slot_C_wide",
      x: 1040,
      y: 160,
      width: 380,
      height: 440,
      label: "Slot C (Wide)",
    },
  ],
};

/* ==========================================================================
   State Management
   ========================================================================== */

const camera = {
  x: 0,
  y: 0,
  zoom: 1,
  isDragging: false,
  dragStartX: 0,
  dragStartY: 0,
  touchPinchDist: 0,
};

const dom = {
  viewport: document.getElementById("viewport"),
  world: document.getElementById("world"),
  buildingLayer: document.getElementById("buildingLayer"),
  zoomInBtn: document.getElementById("zoomInBtn"),
  zoomOutBtn: document.getElementById("zoomOutBtn"),
  fitMapBtn: document.getElementById("fitMapBtn"),
};

/* ==========================================================================
   Orientation & Coordinate Normalization
   ========================================================================== */

/**
 * Checks if the hardware portrait rotation override is currently active.
 */
function isPortraitMode() {
  return window.innerHeight > window.innerWidth && window.innerWidth <= 900;
}

/**
 * Converts screen touch/mouse coordinates into rotated viewport space.
 * When rotated 90deg clockwise: newX = clientY, newY = viewportWidth - clientX.
 */
function getNormalizedPointer(event) {
  const pointer = event.touches ? event.touches[0] : event;
  if (!isPortraitMode()) {
    return { x: pointer.clientX, y: pointer.clientY };
  }
  return {
    x: pointer.clientY,
    y: window.innerWidth - pointer.clientX,
  };
}

/* ==========================================================================
   Theme & CSS Variable Bridge
   ========================================================================== */

function applyStyleVariables() {
  const style = document.documentElement.style;

  style.setProperty("--world-width", `${MAP_CONFIG.world.width}px`);
  style.setProperty("--world-height", `${MAP_CONFIG.world.height}px`);
  style.setProperty("--island-margin-x", `${MAP_CONFIG.island.marginX}px`);
  style.setProperty("--island-margin-y", `${MAP_CONFIG.island.marginY}px`);
  style.setProperty(
    "--sand-border-thickness",
    `${MAP_CONFIG.island.sandBorderThickness}px`,
  );
  style.setProperty(
    "--sand-border-radius",
    `${MAP_CONFIG.island.sandBorderRadius}px`,
  );
  style.setProperty(
    "--grass-border-radius",
    `${MAP_CONFIG.island.grassBorderRadius}px`,
  );

  style.setProperty("--ocean-color", MAP_CONFIG.colors.ocean);
  style.setProperty("--sand-color", MAP_CONFIG.colors.sand);
  style.setProperty("--grass-color", MAP_CONFIG.colors.grass);
}

/* ==========================================================================
   Viewport & Camera Controller
   ========================================================================== */

function renderCameraTransform() {
  dom.world.style.transform = `translate(${camera.x}px, ${camera.y}px) scale(${camera.zoom})`;
}

function fitMapToViewport() {
  const rotated = isPortraitMode();
  const vpWidth = rotated ? window.innerHeight : window.innerWidth;
  const vpHeight = rotated ? window.innerWidth : window.innerHeight;

  const scaleX = vpWidth / MAP_CONFIG.world.width;
  const scaleY = vpHeight / MAP_CONFIG.world.height;
  const targetZoom =
    Math.min(scaleX, scaleY) * MAP_CONFIG.camera.fitPaddingRatio;

  camera.zoom = Math.max(
    MAP_CONFIG.camera.minZoom,
    Math.min(MAP_CONFIG.camera.maxZoom, targetZoom),
  );

  camera.x = (vpWidth - MAP_CONFIG.world.width * camera.zoom) / 2;
  camera.y = (vpHeight - MAP_CONFIG.world.height * camera.zoom) / 2;

  renderCameraTransform();
}

function zoomCamera(delta) {
  const targetZoom = Math.max(
    MAP_CONFIG.camera.minZoom,
    Math.min(MAP_CONFIG.camera.maxZoom, camera.zoom + delta),
  );

  if (targetZoom === camera.zoom) return;

  const rotated = isPortraitMode();
  const vpWidth = rotated ? window.innerHeight : window.innerWidth;
  const vpHeight = rotated ? window.innerWidth : window.innerHeight;

  const anchorX = vpWidth / 2;
  const anchorY = vpHeight / 2;

  camera.x = anchorX - (anchorX - camera.x) * (targetZoom / camera.zoom);
  camera.y = anchorY - (anchorY - camera.y) * (targetZoom / camera.zoom);
  camera.zoom = targetZoom;

  renderCameraTransform();
}

/* ==========================================================================
   Pointer & Drag Handlers
   ========================================================================== */

function handlePointerDown(e) {
  if (e.touches && e.touches.length === 2) {
    camera.isDragging = false;
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    camera.touchPinchDist = Math.hypot(dx, dy);
    return;
  }

  const coords = getNormalizedPointer(e);
  camera.isDragging = true;
  camera.dragStartX = coords.x - camera.x;
  camera.dragStartY = coords.y - camera.y;
}

function handlePointerMove(e) {
  if (e.touches && e.touches.length === 2) {
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    const currentDist = Math.hypot(dx, dy);

    if (camera.touchPinchDist > 0) {
      const pinchDelta = (currentDist - camera.touchPinchDist) * 0.005;
      zoomCamera(pinchDelta);
    }
    camera.touchPinchDist = currentDist;
    return;
  }

  if (!camera.isDragging) return;
  const coords = getNormalizedPointer(e);
  camera.x = coords.x - camera.dragStartX;
  camera.y = coords.y - camera.dragStartY;
  renderCameraTransform();
}

function handlePointerUp() {
  camera.isDragging = false;
  camera.touchPinchDist = 0;
}

/* ==========================================================================
   Input Listeners
   ========================================================================== */

function registerInputEvents() {
  // Mouse events
  dom.viewport.addEventListener("mousedown", handlePointerDown);
  window.addEventListener("mousemove", handlePointerMove);
  window.addEventListener("mouseup", handlePointerUp);

  // Touch events (Mobile & DevTools touch simulation)
  dom.viewport.addEventListener("touchstart", handlePointerDown, {
    passive: true,
  });
  window.addEventListener("touchmove", handlePointerMove, { passive: true });
  window.addEventListener("touchend", handlePointerUp);
  window.addEventListener("touchcancel", handlePointerUp);

  // Wheel zoom
  dom.viewport.addEventListener(
    "wheel",
    (event) => {
      event.preventDefault();
      const direction = event.deltaY < 0 ? 1 : -1;
      zoomCamera(direction * MAP_CONFIG.camera.zoomStep);
    },
    { passive: false },
  );

  // Window resize & orientation change
  window.addEventListener("resize", fitMapToViewport);
  window.addEventListener("orientationchange", () => {
    setTimeout(fitMapToViewport, 200);
  });

  // HUD Controls
  dom.zoomInBtn.addEventListener("click", () =>
    zoomCamera(MAP_CONFIG.camera.zoomStep),
  );
  dom.zoomOutBtn.addEventListener("click", () =>
    zoomCamera(-MAP_CONFIG.camera.zoomStep),
  );
  dom.fitMapBtn.addEventListener("click", fitMapToViewport);
}

/* ==========================================================================
   Structural Layer Rendering
   ========================================================================== */

function renderParcels() {
  const fragment = document.createDocumentFragment();

  MAP_CONFIG.slots.forEach((slot) => {
    const el = document.createElement("div");
    el.className = "map-slot";
    el.id = slot.id;

    el.style.left = `${slot.x}px`;
    el.style.top = `${slot.y}px`;
    el.style.width = `${slot.width}px`;
    el.style.height = `${slot.height}px`;

    el.innerHTML = `
      <span>${slot.label}</span>
      <span class="slot-dimensions">${slot.width} × ${slot.height}px</span>
    `;

    fragment.appendChild(el);
  });

  dom.buildingLayer.innerHTML = "";
  dom.buildingLayer.appendChild(fragment);
}

/* ==========================================================================
   Bootstrap
   ========================================================================== */

function bootstrap() {
  applyStyleVariables();
  renderParcels();
  registerInputEvents();
  fitMapToViewport();
}

document.addEventListener("DOMContentLoaded", bootstrap);
