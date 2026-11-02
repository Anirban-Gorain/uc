/**
 * @file app.js
 * @description Dynamic Archipelago Map Engine for Fluency City.
 * Features automated bounding-box computation, normalized SVG viewports,
 * per-island grids, and fluid pan/zoom.
 */

"use strict";

/* ==========================================================================
   Map Configuration
   Notice: You DO NOT have to configure world.width or world.height anymore!
   The engine computes the bounding box automatically from the islands.
   ========================================================================== */

const MAP_CONFIG = {
  // Ocean padding automatically buffered around all outermost islands
  oceanPadding: 300,

  // Theme colors
  colors: {
    ocean: "#2f83c2",
    sand: "#f7d794",
    grass: "#55b85a",
  },

  // Camera constraints
  camera: {
    minZoom: 0.1,
    maxZoom: 3.0,
    zoomStep: 0.1,
    fitPaddingRatio: 0.95,
  },

  /**
   * INDEPENDENT ISLANDS
   * Place islands at ANY coordinates (horizontal, vertical, or diagonal).
   * The world auto-expands to contain them.
   */
  islands: [
    {
      id: "island_foundation",
      name: "Foundation Hub Island",
      x: 0,
      y: 0,
      width: 1400,
      height: 900,
      sandThickness: 24,
      sandRadius: 40,
      grassRadius: 30,
      grid: {
        cols: 14,
        rows: 9,
        gap: 16,
        padding: 28,
      },
    },
    {
      id: "island_corporate",
      name: "Corporate District Island",
      // Positioned diagonally down and to the right!
      x: 1700,
      y: 800,
      width: 1400,
      height: 900,
      sandThickness: 24,
      sandRadius: 40,
      grassRadius: 30,
      grid: {
        cols: 14,
        rows: 9,
        gap: 16,
        padding: 28,
      },
    },
  ],

  // Debug grid overlay
  showGrid: true,

  /**
   * BUILDING SLOTS REGISTERED TO SPECIFIC ISLANDS
   */
  slots: [
    // --- Foundation Island ---
    {
      islandId: "island_foundation",
      id: "slot_F1",
      col: 1,
      row: 1,
      colSpan: 3,
      rowSpan: 3,
      label: "The Power Plant",
      image: null,
    },
    {
      islandId: "island_foundation",
      id: "slot_F2",
      col: 5,
      row: 1,
      colSpan: 3,
      rowSpan: 3,
      label: "Action Center",
      image: null,
    },
    {
      islandId: "island_foundation",
      id: "slot_F3",
      col: 9,
      row: 1,
      colSpan: 3,
      rowSpan: 3,
      label: "Mind Studio",
      image: null,
    },
    {
      islandId: "island_foundation",
      id: "slot_F_wide",
      col: 1,
      row: 5,
      colSpan: 11,
      rowSpan: 3,
      label: "Central Plaza & Training Ground",
      image: null,
    },

    // --- Corporate Island (Diagonal) ---
    {
      islandId: "island_corporate",
      id: "slot_C1",
      col: 1,
      row: 1,
      colSpan: 4,
      rowSpan: 3,
      label: "Global Corporate HQ",
      image: null,
    },
    {
      islandId: "island_corporate",
      id: "slot_C2",
      col: 6,
      row: 1,
      colSpan: 4,
      rowSpan: 3,
      label: "Tech Innovation Hub",
      image: null,
    },
    {
      islandId: "island_corporate",
      id: "slot_C_hospital",
      col: 1,
      row: 5,
      colSpan: 9,
      rowSpan: 3,
      label: "Central City Hospital & Research",
      image: null,
    },
  ],

  roads: [
    // ROAD 1: An L-shaped road turning a 90° corner
    // {
    //   id: "road_main_street",
    //   width: 50, // Road width in pixels
    //   curved: false, // If true, corners are smooth curves instead of sharp angles
    //   points: [
    //     { x: 200, y: 150 }, // Start
    //     { x: 800, y: 150 }, // Goes straight across
    //     { x: 800, y: 600 }, // Turns downward!
    //   ],
    // },

    // ROAD 2: A diagonal road with multiple turns
    {
      id: "road_cross_district",
      width: 40,
      curved: false, // Sharp angled corner
      points: [
        { x: 168, y: 450 },

        { x: 650, y: 450 },

        { x: 650, y: 400 },
      ],
    },

    // ROAD 3: A Roundabout (like in your first screenshot!)
    {
      id: "central_roundabout",
      type: "roundabout",
      centerX: 800,
      centerY: 600,
      radius: 70,
      width: 50,
    },
  ],
};

/* ==========================================================================
   State Management & Runtime World Dimensions
   ========================================================================== */

// Computed at runtime from all islands
const runtimeWorld = {
  width: 0,
  height: 0,
  offsetX: 0, // In case islands have negative coordinates
  offsetY: 0,
};

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
  islandLayer: document.getElementById("islandLayer"),
  gridOverlay: document.getElementById("gridOverlay"),
  roadLayer: document.getElementById("roadLayer"),
  buildingLayer: document.getElementById("buildingLayer"),
  toggleGridBtn: document.getElementById("toggleGridBtn"),
  zoomInBtn: document.getElementById("zoomInBtn"),
  zoomOutBtn: document.getElementById("zoomOutBtn"),
  fitMapBtn: document.getElementById("fitMapBtn"),
};

/* ==========================================================================
   Dynamic Bounding-Box Calculation
   Prevents islands from ever overflowing or vanishing into negative space.
   ========================================================================== */

function computeWorldBounds() {
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

  // Normalized offsets so islands placed at negative coordinates never clip
  runtimeWorld.offsetX = pad - minX;
  runtimeWorld.offsetY = pad - minY;

  // Total canvas size needed to hold all islands plus ocean borders
  runtimeWorld.width = maxX - minX + 2 * pad;
  runtimeWorld.height = maxY - minY + 2 * pad;

  // Synchronize CSS custom properties
  const style = document.documentElement.style;
  style.setProperty("--world-width", `${runtimeWorld.width}px`);
  style.setProperty("--world-height", `${runtimeWorld.height}px`);
  style.setProperty("--ocean-color", MAP_CONFIG.colors.ocean);
  style.setProperty("--sand-color", MAP_CONFIG.colors.sand);
  style.setProperty("--grass-color", MAP_CONFIG.colors.grass);

  // Synchronize SVG Road Layer viewBox
  dom.roadLayer.setAttribute(
    "viewBox",
    `0 0 ${runtimeWorld.width} ${runtimeWorld.height}`,
  );
  dom.roadLayer.setAttribute("width", runtimeWorld.width);
  dom.roadLayer.setAttribute("height", runtimeWorld.height);
}

/* ==========================================================================
   Orientation & Coordinate Normalization
   ========================================================================== */

function isPortraitMode() {
  return window.innerHeight > window.innerWidth && window.innerWidth <= 900;
}

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
   Mathematical Helpers for Island Grids
   ========================================================================== */

function getIslandMetrics(island) {
  // Apply world offset so coordinate positioning is absolute within normalized world
  const actualIslandX = island.x + runtimeWorld.offsetX;
  const actualIslandY = island.y + runtimeWorld.offsetY;

  const lawnX = actualIslandX + island.sandThickness;
  const lawnY = actualIslandY + island.sandThickness;
  const lawnWidth = island.width - 2 * island.sandThickness;
  const lawnHeight = island.height - 2 * island.sandThickness;

  const usableWidth = lawnWidth - 2 * island.grid.padding;
  const usableHeight = lawnHeight - 2 * island.grid.padding;

  const cellWidth =
    (usableWidth - (island.grid.cols - 1) * island.grid.gap) / island.grid.cols;
  const cellHeight =
    (usableHeight - (island.grid.rows - 1) * island.grid.gap) /
    island.grid.rows;

  return {
    actualIslandX,
    actualIslandY,
    lawnX,
    lawnY,
    lawnWidth,
    lawnHeight,
    cellWidth,
    cellHeight,
    padding: island.grid.padding,
    gap: island.grid.gap,
  };
}

/* ==========================================================================
   Viewport & Camera Controller
   ========================================================================== */

function renderCameraTransform() {
  dom.world.style.transform = `translate(${camera.x}px, ${camera.y}px) scale(${camera.zoom})`;
}

/**
 * Fits the entire archipelago (all islands) on any screen resolution.
 */
function fitMapToViewport() {
  const rotated = isPortraitMode();
  const vpWidth = rotated ? window.innerHeight : window.innerWidth;
  const vpHeight = rotated ? window.innerWidth : window.innerHeight;

  const scaleX = vpWidth / runtimeWorld.width;
  const scaleY = vpHeight / runtimeWorld.height;
  const targetZoom =
    Math.min(scaleX, scaleY) * MAP_CONFIG.camera.fitPaddingRatio;

  camera.zoom = Math.max(
    MAP_CONFIG.camera.minZoom,
    Math.min(MAP_CONFIG.camera.maxZoom, targetZoom),
  );

  camera.x = (vpWidth - runtimeWorld.width * camera.zoom) / 2;
  camera.y = (vpHeight - runtimeWorld.height * camera.zoom) / 2;

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
  dom.viewport.addEventListener("mousedown", handlePointerDown);
  window.addEventListener("mousemove", handlePointerMove);
  window.addEventListener("mouseup", handlePointerUp);

  dom.viewport.addEventListener("touchstart", handlePointerDown, {
    passive: true,
  });
  window.addEventListener("touchmove", handlePointerMove, { passive: true });
  window.addEventListener("touchend", handlePointerUp);
  window.addEventListener("touchcancel", handlePointerUp);

  dom.viewport.addEventListener(
    "wheel",
    (event) => {
      event.preventDefault();
      const direction = event.deltaY < 0 ? 1 : -1;
      zoomCamera(direction * MAP_CONFIG.camera.zoomStep);
    },
    { passive: false },
  );

  window.addEventListener("resize", fitMapToViewport);
  window.addEventListener("orientationchange", () => {
    setTimeout(fitMapToViewport, 200);
  });

  dom.zoomInBtn.addEventListener("click", () =>
    zoomCamera(MAP_CONFIG.camera.zoomStep),
  );
  dom.zoomOutBtn.addEventListener("click", () =>
    zoomCamera(-MAP_CONFIG.camera.zoomStep),
  );
  dom.fitMapBtn.addEventListener("click", fitMapToViewport);

  dom.toggleGridBtn.addEventListener("click", () => {
    MAP_CONFIG.showGrid = !MAP_CONFIG.showGrid;
    dom.gridOverlay.classList.toggle("hidden", !MAP_CONFIG.showGrid);
    dom.toggleGridBtn.textContent = `Grid: ${MAP_CONFIG.showGrid ? "ON" : "OFF"}`;
  });
}

/* ==========================================================================
   Terrain, Grid, and Slot Renderers
   ========================================================================== */

function renderIslands() {
  const fragment = document.createDocumentFragment();

  MAP_CONFIG.islands.forEach((island) => {
    const metrics = getIslandMetrics(island);
    const el = document.createElement("div");
    el.className = "island-entity";
    el.id = island.id;
    el.style.left = `${metrics.actualIslandX}px`;
    el.style.top = `${metrics.actualIslandY}px`;
    el.style.width = `${island.width}px`;
    el.style.height = `${island.height}px`;

    el.innerHTML = `
      <div class="sand-coast" style="border-radius: ${island.sandRadius}px;"></div>
      <div class="grass-lawn" style="
        inset: ${island.sandThickness}px;
        border-radius: ${island.grassRadius}px;
      "></div>
      <div class="island-badge">${island.name}</div>
    `;

    fragment.appendChild(el);
  });

  dom.islandLayer.innerHTML = "";
  dom.islandLayer.appendChild(fragment);
}

function renderGridOverlays() {
  const fragment = document.createDocumentFragment();

  MAP_CONFIG.islands.forEach((island) => {
    const metrics = getIslandMetrics(island);
    const gridContainer = document.createElement("div");
    gridContainer.className = "island-grid-container";
    gridContainer.style.left = `${metrics.lawnX}px`;
    gridContainer.style.top = `${metrics.lawnY}px`;
    gridContainer.style.width = `${metrics.lawnWidth}px`;
    gridContainer.style.height = `${metrics.lawnHeight}px`;
    gridContainer.style.padding = `${metrics.padding}px`;
    gridContainer.style.gap = `${metrics.gap}px`;
    gridContainer.style.gridTemplateColumns = `repeat(${island.grid.cols}, 1fr)`;
    gridContainer.style.gridTemplateRows = `repeat(${island.grid.rows}, 1fr)`;

    for (let r = 0; r < island.grid.rows; r++) {
      for (let c = 0; c < island.grid.cols; c++) {
        const cell = document.createElement("div");
        cell.className = "grid-cell-guide";
        cell.textContent = `${c},${r}`;
        gridContainer.appendChild(cell);
      }
    }

    fragment.appendChild(gridContainer);
  });

  dom.gridOverlay.innerHTML = "";
  dom.gridOverlay.appendChild(fragment);
  dom.gridOverlay.classList.toggle("hidden", !MAP_CONFIG.showGrid);
}

function renderParcels() {
  const fragment = document.createDocumentFragment();

  MAP_CONFIG.slots.forEach((slot) => {
    const island = MAP_CONFIG.islands.find((isl) => isl.id === slot.islandId);
    if (!island) return;

    const metrics = getIslandMetrics(island);
    const el = document.createElement("div");
    el.className = "map-slot";
    el.id = slot.id;

    const posX =
      metrics.lawnX +
      metrics.padding +
      slot.col * (metrics.cellWidth + metrics.gap);
    const posY =
      metrics.lawnY +
      metrics.padding +
      slot.row * (metrics.cellHeight + metrics.gap);
    const width =
      slot.colSpan * metrics.cellWidth + (slot.colSpan - 1) * metrics.gap;
    const height =
      slot.rowSpan * metrics.cellHeight + (slot.rowSpan - 1) * metrics.gap;

    el.style.left = `${posX}px`;
    el.style.top = `${posY}px`;
    el.style.width = `${width}px`;
    el.style.height = `${height}px`;

    if (slot.image) {
      el.classList.add("has-image");
      el.innerHTML = `
        <img src="${slot.image}" alt="${slot.label}" class="slot-building-img" />
        <span class="slot-badge">${slot.label}</span>
      `;
    } else {
      el.innerHTML = `
        <span>${slot.label}</span>
        <span class="slot-dimensions">${slot.colSpan}×${slot.rowSpan} [${Math.round(width)}×${Math.round(height)}px]</span>
      `;
    }

    fragment.appendChild(el);
  });

  dom.buildingLayer.innerHTML = "";
  dom.buildingLayer.appendChild(fragment);
}

/**
 * Renders complex roads, turns, smooth curves, and roundabouts into the SVG layer.
 */
function renderRoads() {
  if (!MAP_CONFIG.roads || !MAP_CONFIG.roads.length) return;

  let asphaltGroup = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "g",
  );
  asphaltGroup.setAttribute("class", "road-asphalt-group");

  let markingsGroup = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "g",
  );
  markingsGroup.setAttribute("class", "road-markings-group");

  MAP_CONFIG.roads.forEach((road) => {
    // 1. Handle Roundabouts (Circles)
    if (road.type === "roundabout") {
      const actualX = road.centerX + runtimeWorld.offsetX;
      const actualY = road.centerY + runtimeWorld.offsetY;

      // Base Asphalt Ring
      const asphaltCircle = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle",
      );
      asphaltCircle.setAttribute("cx", actualX);
      asphaltCircle.setAttribute("cy", actualY);
      asphaltCircle.setAttribute("r", road.radius);
      asphaltCircle.setAttribute("stroke", "#374151"); // Charcoal asphalt
      asphaltCircle.setAttribute("stroke-width", road.width);
      asphaltCircle.setAttribute("fill", "none");
      asphaltGroup.appendChild(asphaltCircle);

      // Center Dashed White Marking
      const markingCircle = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle",
      );
      markingCircle.setAttribute("cx", actualX);
      markingCircle.setAttribute("cy", actualY);
      markingCircle.setAttribute("r", road.radius);
      markingCircle.setAttribute("stroke", "#ffffff");
      markingCircle.setAttribute("stroke-width", "3");
      markingCircle.setAttribute("stroke-dasharray", "10, 10");
      markingCircle.setAttribute("fill", "none");
      markingsGroup.appendChild(markingCircle);
      return;
    }

    // 2. Handle Multi-Point Roads (Turns, Diagonals, and Curves)
    if (!road.points || road.points.length < 2) return;

    // Build the SVG path definition
    let d = "";
    road.points.forEach((pt, index) => {
      const x = pt.x + runtimeWorld.offsetX;
      const y = pt.y + runtimeWorld.offsetY;
      if (index === 0) {
        d += `M ${x} ${y} `;
      } else {
        d += `L ${x} ${y} `;
      }
    });

    // Pass 1: The Asphalt Body
    const asphaltPath = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "path",
    );
    asphaltPath.setAttribute("d", d);
    asphaltPath.setAttribute("stroke", "#374151"); // Asphalt color
    asphaltPath.setAttribute("stroke-width", road.width);
    asphaltPath.setAttribute("stroke-linecap", "round"); // Smooth rounded ends
    asphaltPath.setAttribute(
      "stroke-linejoin",
      road.curved ? "round" : "miter",
    ); // Rounded corners
    asphaltPath.setAttribute("fill", "none");
    asphaltGroup.appendChild(asphaltPath);

    // Pass 2: The Center Dashed Markings
    const markingPath = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "path",
    );
    markingPath.setAttribute("d", d);
    markingPath.setAttribute("stroke", "#ffffff");
    markingPath.setAttribute("stroke-width", "3");
    markingPath.setAttribute("stroke-dasharray", "12, 10"); // Dash pattern
    markingPath.setAttribute("stroke-linecap", "round");
    markingPath.setAttribute(
      "stroke-linejoin",
      road.curved ? "round" : "miter",
    );
    markingPath.setAttribute("fill", "none");
    markingsGroup.appendChild(markingPath);
  });

  dom.roadLayer.innerHTML = "";
  dom.roadLayer.appendChild(asphaltGroup);
  dom.roadLayer.appendChild(markingsGroup);
}

/* ==========================================================================
   Bootstrap
   ========================================================================== */

function bootstrap() {
  computeWorldBounds();
  renderIslands();
  renderGridOverlays();
  renderRoads();
  renderParcels();
  registerInputEvents();
  fitMapToViewport();
}

document.addEventListener("DOMContentLoaded", bootstrap);
