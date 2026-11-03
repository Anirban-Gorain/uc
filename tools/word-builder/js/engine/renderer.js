import { MAP_CONFIG } from "../config.js";
import { dom, runtimeWorld, getIslandMetrics } from "../state.js";
import { dataStore } from "../dataStore.js";
import { progressStore, isBuildingUnlocked } from "./progress.js";

/**
 * Procedural Island Coastline & Grass Generator
 * Creates realistic, organic, balanced coastlines with subtle natural beach curves,
 * soft grass edges, and layered animated water caustics (without rigid boxes or unnatural sharp corners).
 */
function createOrganicCoastlineSvg(width, height) {
  const pad = 140;
  const svgW = width + pad * 2;
  const svgH = height + pad * 2;

  const x0 = pad;
  const y0 = pad;
  const x1 = pad + width;
  const y1 = pad + height;

  function generateContourPoints(w, h, p, config) {
    const {
      pointsH = 26,
      pointsV = 20,
      cornerPad = 48,
      offset = 24,
      freq = 14,
      amp = 10,
      seed = 42,
      inset = false
    } = config;

    let s = seed;
    const rnd = () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };

    const pts = [];

    // Top edge: Left to Right
    for (let i = 0; i <= pointsH; i++) {
      const t = i / pointsH;
      const x = (x0 + cornerPad) + t * (w - 2 * cornerPad);
      const wave = Math.sin(t * Math.PI * freq) * (amp * 0.65) + (rnd() - 0.5) * amp;
      const y = y0 + (inset ? offset + wave : -offset + wave);
      pts.push({ x, y });
    }

    // Top-Right corner transition
    pts.push({
      x: x1 + (inset ? -offset * 0.8 : offset * 0.8),
      y: y0 + (inset ? offset * 0.8 : -offset * 0.8)
    });

    // Right edge: Top to Bottom
    for (let i = 0; i <= pointsV; i++) {
      const t = i / pointsV;
      const y = (y0 + cornerPad) + t * (h - 2 * cornerPad);
      const wave = Math.sin(t * Math.PI * freq * 0.85) * (amp * 0.65) + (rnd() - 0.5) * amp;
      const x = x1 + (inset ? -offset - wave : offset + wave);
      pts.push({ x, y });
    }

    // Bottom-Right corner transition
    pts.push({
      x: x1 + (inset ? -offset * 0.8 : offset * 0.8),
      y: y1 + (inset ? -offset * 0.8 : offset * 0.8)
    });

    // Bottom edge: Right to Left
    for (let i = pointsH; i >= 0; i--) {
      const t = i / pointsH;
      const x = (x0 + cornerPad) + t * (w - 2 * cornerPad);
      const wave = Math.sin(t * Math.PI * freq) * (amp * 0.65) + (rnd() - 0.5) * amp;
      const y = y1 + (inset ? -offset - wave : offset + wave);
      pts.push({ x, y });
    }

    // Bottom-Left corner transition
    pts.push({
      x: x0 + (inset ? offset * 0.8 : -offset * 0.8),
      y: y1 + (inset ? -offset * 0.8 : offset * 0.8)
    });

    // Left edge: Bottom to Top
    for (let i = pointsV; i >= 0; i--) {
      const t = i / pointsV;
      const y = (y0 + cornerPad) + t * (h - 2 * cornerPad);
      const wave = Math.sin(t * Math.PI * freq * 0.85) * (amp * 0.65) + (rnd() - 0.5) * amp;
      const x = x0 + (inset ? offset + wave : -offset - wave);
      pts.push({ x, y });
    }

    // Top-Left corner transition
    pts.push({
      x: x0 + (inset ? offset * 0.8 : -offset * 0.8),
      y: y0 + (inset ? offset * 0.8 : -offset * 0.8)
    });

    return pts;
  }

  function splineToSvgPath(points) {
    const n = points.length;
    if (n < 3) return '';
    const d = [];
    for (let i = 0; i < n; i++) {
      const p0 = points[(i - 1 + n) % n];
      const p1 = points[i];
      const p2 = points[(i + 1) % n];
      const p3 = points[(i + 2) % n];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      if (i === 0) {
        d.push('M ' + p1.x.toFixed(1) + ' ' + p1.y.toFixed(1));
      }
      d.push('C ' + cp1x.toFixed(1) + ' ' + cp1y.toFixed(1) + ', ' + cp2x.toFixed(1) + ' ' + cp2y.toFixed(1) + ', ' + p2.x.toFixed(1) + ' ' + p2.y.toFixed(1));
    }
    d.push('Z');
    return d.join(' ');
  }

  // 1. Soft Outer Lagoon Bleed (replaces harsh drop-shadow with realistic ocean depth blending)
  const outerLagoonPts = generateContourPoints(width, height, pad, {
    pointsH: 24, pointsV: 18, cornerPad: 40, offset: 46, freq: 11, amp: 8, seed: 101
  });
  const outerLagoonPath = splineToSvgPath(outerLagoonPts);

  // 2. Inner Shallow Turquoise Reef Water
  const innerLagoonPts = generateContourPoints(width, height, pad, {
    pointsH: 26, pointsV: 20, cornerPad: 44, offset: 32, freq: 13, amp: 7, seed: 202
  });
  const innerLagoonPath = splineToSvgPath(innerLagoonPts);

  // 3. Submerged Wet Sandy Perimeter
  const wetSandPts = generateContourPoints(width, height, pad, {
    pointsH: 28, pointsV: 22, cornerPad: 48, offset: 22, freq: 15, amp: 6, seed: 303
  });
  const wetSandPath = splineToSvgPath(wetSandPts);

  // 4. Main Island Sand Shoreline (tight, rugged natural micro-curves)
  const mainSandPts = generateContourPoints(width, height, pad, {
    pointsH: 30, pointsV: 24, cornerPad: 50, offset: 14, freq: 16, amp: 5.5, seed: 404
  });
  const mainSandPath = splineToSvgPath(mainSandPts);

  // 5. Rugged Organic Grass Edge (safely wraps the parcel building area without cutting inside)
  const organicGrassPts = generateContourPoints(width, height, pad, {
    pointsH: 28, pointsV: 22, cornerPad: 46, offset: 8, freq: 14, amp: 4.5, seed: 505, inset: true
  });
  const organicGrassPath = splineToSvgPath(organicGrassPts);

  return `
    <svg class="island-coastline-svg" viewBox="0 0 ${svgW} ${svgH}" style="
      position: absolute;
      top: -${pad}px;
      left: -${pad}px;
      width: ${svgW}px;
      height: ${svgH}px;
      pointer-events: none;
      user-select: none;
      -webkit-user-select: none;
      -webkit-tap-highlight-color: transparent;
      outline: none;
      z-index: 1;
      overflow: visible;
    ">
      <defs>
        <!-- Sand Shore Gradient with warm tropical sunlit tones -->
        <linearGradient id="naturalSand" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fae7b8" />
          <stop offset="40%" stop-color="#f5d68d" />
          <stop offset="80%" stop-color="#ebc778" />
          <stop offset="100%" stop-color="#dfb664" />
        </linearGradient>

        <!-- Lush Organic Island Grass Gradient -->
        <linearGradient id="islandGrassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#5ec763" />
          <stop offset="50%" stop-color="#55b85a" />
          <stop offset="100%" stop-color="#4aa84f" />
        </linearGradient>

        <!-- Shallow Turquoise Shoreline Water -->
        <linearGradient id="shallowCoastWater" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#4dbdd6" stop-opacity="0.45" />
          <stop offset="100%" stop-color="#328fb8" stop-opacity="0.20" />
        </linearGradient>
      </defs>

      <!-- 1. Soft Outer Shallow Water Bleed (seamless reef transition) -->
      <path d="${outerLagoonPath}" fill="url(#shallowCoastWater)" opacity="0.6" />

      <!-- 2. Dynamic Wave Breathing Coastal Reef Shelf -->
      <path class="wave-shore-shelf" d="${innerLagoonPath}" fill="#4dbdd6" opacity="0.45" />

      <!-- 3. Submerged Wet Sand Shoreline -->
      <path d="${wetSandPath}" fill="#d4a648" opacity="0.88" />

      <!-- 4. Main Warm Island Sand Coastline with tight rugged natural edges -->
      <path d="${mainSandPath}" fill="url(#naturalSand)" />

      <!-- 5. Organic Rugged Island Grass Edge -->
      <path d="${organicGrassPath}" fill="url(#islandGrassGrad)" />
    </svg>
  `;
}

export function renderIslands() {
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

    // 1. Organic, natural sandy coastline and water shelf with rugged grass layer
    const coastlineHtml = createOrganicCoastlineSvg(island.width, island.height);

    // 2. Organic grass is rendered seamlessly inside createOrganicCoastlineSvg
    const grassHtml = "";

    // 3. Photoshop road & landscape image layer (drawn ON TOP of the grass)
    const imageHtml = island.backgroundImage
      ? `<div style="
           position: absolute;
           inset: 0;
           background-image: url('${island.backgroundImage}');
           background-size: 100% 100%;
           background-position: top left;
           background-repeat: no-repeat;
           border-radius: ${island.sandRadius}px;
           z-index: 3;
           pointer-events: none;
           user-select: none;
           -webkit-user-select: none;
           -webkit-tap-highlight-color: transparent;
         "></div>`
      : "";

    // Assemble layers
    el.innerHTML = `
      ${coastlineHtml}
      ${grassHtml}
      ${imageHtml}
    `;

    fragment.appendChild(el);
  });

  dom.islandLayer.innerHTML = "";
  dom.islandLayer.appendChild(fragment);
}

export function renderGridOverlays() {
  dom.gridOverlay.innerHTML = "";

  if (!MAP_CONFIG.showGrid) {
    dom.gridOverlay.classList.add("hidden");
    dom.gridOverlay.style.display = "none";
    return;
  }

  dom.gridOverlay.style.display = "";
  dom.gridOverlay.classList.remove("hidden");

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

    gridContainer.style.gridTemplateColumns = `repeat(${metrics.cols}, ${metrics.cellWidth}px)`;
    gridContainer.style.gridTemplateRows = `repeat(${metrics.rows}, ${metrics.cellHeight}px)`;

    for (let r = 0; r < metrics.rows; r++) {
      for (let c = 0; c < metrics.cols; c++) {
        const cell = document.createElement("div");
        cell.className = "grid-cell-guide";
        cell.textContent = `${c},${r}`;
        gridContainer.appendChild(cell);
      }
    }

    fragment.appendChild(gridContainer);
  });

  dom.gridOverlay.appendChild(fragment);
}

export function renderRoads() {
  // Road network is handled by the background graphic in renderIslands().
  if (dom.roadLayer) {
    dom.roadLayer.innerHTML = "";
  }
}

export function renderParcels() {
  const container = dom.buildingLayer;
  if (!container) return;

  container.innerHTML = "";

  MAP_CONFIG.slots.forEach((slot) => {
    const island = MAP_CONFIG.islands.find((isl) => isl.id === slot.islandId);
    if (!island) return;

    const metrics = getIslandMetrics(island);
    const originX = metrics.lawnX + metrics.padding;
    const originY = metrics.lawnY + metrics.padding;

    const left = originX + slot.col * (metrics.cellWidth + metrics.gap);
    const top = originY + slot.row * (metrics.cellHeight + metrics.gap);
    const width =
      slot.colSpan * metrics.cellWidth + (slot.colSpan - 1) * metrics.gap;
    const height =
      slot.rowSpan * metrics.cellHeight + (slot.rowSpan - 1) * metrics.gap;

    const el = document.createElement("div");
    el.className = "map-slot";
    el.id = slot.id;
    el.style.left = `${Math.round(left)}px`;
    el.style.top = `${Math.round(top)}px`;
    el.style.width = `${Math.round(width)}px`;
    el.style.height = `${Math.round(height)}px`;

    if (slot.buildingDataId) {
      el.dataset.buildingDataId = slot.buildingDataId;
    }

    const building = dataStore.getBuilding(slot.buildingDataId);

    if (slot.image) {
      el.classList.add("has-image");
      const title = building ? building.name : slot.label || "Building";
      el.innerHTML = `
        <img class="slot-building-img" src="${slot.image}" alt="${title}" />
      `;
    } else if (building) {
      el.innerHTML = `
        <div class="slot-level-tag">LEVEL ${building.level}</div>
        <div class="slot-main-title">${building.name}</div>
        <div class="slot-power-tag">${building.hook}</div>
      `;
    } else if (slot.label) {
      el.innerHTML = `
        <div class="slot-main-title">${slot.label}</div>
      `;
    }

    container.appendChild(el);
  });

  updateBuildingStatusBadges();
}

/**
 * Calculates the exact visual rendered box of the image (accounting for object-fit letterboxing)
 * and anchors the tooltip directly to the top-center of the visual building artwork.
 */
function alignTooltipToImage(slotEl, imgEl, tooltipEl) {
  if (!slotEl || !imgEl || !tooltipEl) return;

  const update = () => {
    const naturalWidth = imgEl.naturalWidth;
    const naturalHeight = imgEl.naturalHeight;
    if (!naturalWidth || !naturalHeight) return;

    const slotWidth = slotEl.offsetWidth;
    const slotHeight = slotEl.offsetHeight;
    if (!slotWidth || !slotHeight) return;

    const containerRatio = slotWidth / slotHeight;
    const imageRatio = naturalWidth / naturalHeight;

    let visualTop = 0;
    let visualLeft = 0;
    let renderedWidth = slotWidth;

    if (containerRatio >= imageRatio) {
      // Container is wider than the image: image fills height, centered horizontally
      renderedWidth = slotHeight * imageRatio;
      visualLeft = (slotWidth - renderedWidth) / 2;
      visualTop = 0;
    } else {
      // Container is taller than the image: image fills width, centered vertically
      const renderedHeight = slotWidth / imageRatio;
      visualTop = (slotHeight - renderedHeight) / 2;
      visualLeft = 0;
      renderedWidth = slotWidth;
    }

    tooltipEl.style.setProperty("--tooltip-top", `${Math.round(visualTop)}px`);
    tooltipEl.style.setProperty(
      "--tooltip-left",
      `${Math.round(visualLeft + renderedWidth / 2)}px`
    );
  };

  if (imgEl.complete && imgEl.naturalWidth > 0) {
    update();
  } else {
    imgEl.addEventListener("load", update, { once: true });
  }
}

/**
 * Dynamically synchronizes map slots with sleek on-hover tooltips and building progression status.
 * Leaves the building artwork 100% clean by default, revealing status pills only when hovered.
 */
export function updateBuildingStatusBadges() {
  const container = dom.buildingLayer;
  if (!container) return;

  const slots = container.querySelectorAll(".map-slot[data-building-data-id]");
  let hasFoundActiveNext = false;

  slots.forEach((slotEl) => {
    const buildingId = slotEl.dataset.buildingDataId;
    if (!buildingId) return;

    // Clean up legacy badges if present
    slotEl.querySelectorAll(".slot-status-indicator").forEach((badge) => badge.remove());

    const lockStatus = isBuildingUnlocked(buildingId);
    const progress = progressStore.getBuildingProgress(buildingId);
    const building = dataStore.getBuilding(buildingId);
    const totalFloors = (building?.floors || []).length || 5;
    const completedCount = (progress.completedLevels || []).length;
    const isCompleted = completedCount >= totalFloors;
    const buildingName = building ? building.name : "Building";

    slotEl.classList.remove(
      "slot-locked",
      "slot-unlocked",
      "slot-completed",
      "slot-revision",
      "slot-active-target"
    );

    let tooltip = slotEl.querySelector(".slot-hover-tooltip");
    if (!tooltip) {
      tooltip = document.createElement("div");
      tooltip.className = "slot-hover-tooltip";
      slotEl.appendChild(tooltip);
    }

    // Align tooltip directly to visual image boundaries
    const imgEl = slotEl.querySelector(".slot-building-img");
    if (imgEl) {
      alignTooltipToImage(slotEl, imgEl, tooltip);
    }

    if (!lockStatus.unlocked) {
      slotEl.classList.add("slot-locked");
      tooltip.className = "slot-hover-tooltip status-locked";
      tooltip.innerHTML = `
        <span>🔒</span>
        <span class="tooltip-name">${buildingName}</span>
        <span class="tooltip-sep">•</span>
        <span class="tooltip-status">Locked</span>
      `;
    } else if (progress.needsRevision) {
      slotEl.classList.add("slot-revision");
      tooltip.className = "slot-hover-tooltip status-revision";
      tooltip.innerHTML = `
        <span>🔄</span>
        <span class="tooltip-name">${buildingName}</span>
        <span class="tooltip-sep">•</span>
        <span class="tooltip-status">Review Due</span>
      `;
    } else if (isCompleted) {
      slotEl.classList.add("slot-completed");
      tooltip.className = "slot-hover-tooltip status-completed";
      tooltip.innerHTML = `
        <span>✅</span>
        <span class="tooltip-name">${buildingName}</span>
        <span class="tooltip-sep">•</span>
        <span class="tooltip-status">Completed</span>
      `;
    } else {
      slotEl.classList.add("slot-unlocked");
      // Highlight the first unfinished, unlocked building with a gentle living pulse beacon
      if (!hasFoundActiveNext) {
        slotEl.classList.add("slot-active-target");
        hasFoundActiveNext = true;
      }

      tooltip.className = "slot-hover-tooltip status-progress";
      tooltip.innerHTML = `
        <span>🏢</span>
        <span class="tooltip-name">${buildingName}</span>
        <span class="tooltip-sep">•</span>
        <span class="tooltip-status">${completedCount}/${totalFloors} Floors</span>
      `;
    }
  });
}

/**
 * Initializes ambient atmospheric life (flocks of flying birds, realistic drifting clouds, and cloud shadows).
 * Spans seamlessly across the entire world canvas with multi-directional trajectories.
 */
export function initAmbientAtmosphere() {
  const skyLayer = dom.ambientSkyLayer;
  if (!skyLayer) return;

  skyLayer.innerHTML = `
    <!-- Subtle, Small Ambient Clouds (High-Altitude Background Details) -->
    <div class="fluffy-cloud cloud-a">
      <div class="cloud-part p1"></div>
      <div class="cloud-part p2"></div>
      <div class="cloud-part p3"></div>
      <div class="cloud-part p4"></div>
    </div>

    <div class="fluffy-cloud cloud-b">
      <div class="cloud-part p1"></div>
      <div class="cloud-part p2"></div>
      <div class="cloud-part p3"></div>
      <div class="cloud-part p4"></div>
    </div>

    <!-- Distant Seabirds Gliding across Horizon -->
    <div class="bird-flight-group flight-path-sky">
      <div class="seabird bird-1"><div class="wing left"></div><div class="wing right"></div></div>
      <div class="seabird bird-2"><div class="wing left"></div><div class="wing right"></div></div>
    </div>
  `;
}
