/**
 * @file camera.js
 * @description Manages viewport transform, pan/drag, pointer-anchored wheel zoom,
 * trackpad normalization, two-finger mobile pinch zooming with anchor tracking,
 * hardware-accelerated 60/120fps rAF rendering, and debounced camera persistence.
 */

import { MAP_CONFIG } from "../config.js";
import {
  camera,
  runtimeWorld,
  dom,
  isPortraitMode,
  getNormalizedPointer,
  saveCameraState,
  loadSavedCameraState,
} from "../state.js";

// Debounced camera state persistence to avoid blocking the main thread during gestures
let saveTimeout = null;
export function debouncedSaveCameraState(delay = 300) {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    saveCameraState();
    saveTimeout = null;
  }, delay);
}

// Hardware-accelerated 60/120fps rAF render batching
let rAFScheduled = false;

export function renderCameraTransform() {
  if (rAFScheduled) return;
  rAFScheduled = true;
  requestAnimationFrame(() => {
    if (dom.world) {
      dom.world.style.transform = `translate3d(${camera.x}px, ${camera.y}px, 0) scale(${camera.zoom})`;
    }
    rAFScheduled = false;
  });
}

export function renderCameraTransformImmediate() {
  rAFScheduled = false;
  if (dom.world) {
    dom.world.style.transform = `translate3d(${camera.x}px, ${camera.y}px, 0) scale(${camera.zoom})`;
  }
}

export function fitMapToViewport() {
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

  renderCameraTransformImmediate();
  saveCameraState();
}

/**
 * Initializes camera: restores previous view from session or fits map.
 */
export function initializeCamera() {
  const saved = loadSavedCameraState();
  if (saved && typeof saved.zoom === "number") {
    camera.x = saved.x;
    camera.y = saved.y;
    camera.zoom = Math.max(
      MAP_CONFIG.camera.minZoom,
      Math.min(MAP_CONFIG.camera.maxZoom, saved.zoom),
    );
    renderCameraTransformImmediate();
  } else {
    fitMapToViewport();
  }
}

// Track previous viewport dimensions to avoid resetting panning on soft resizes (e.g., mobile URL bar collapse)
let lastVpWidth = null;
let lastVpHeight = null;
let lastOrientation = null;

function handleResizePreserveZoom() {
  const rotated = isPortraitMode();
  const vpWidth = rotated ? window.innerHeight : window.innerWidth;
  const vpHeight = rotated ? window.innerWidth : window.innerHeight;
  const currentOrientation = rotated ? "portrait" : "landscape";

  if (lastVpWidth !== null && lastVpHeight !== null) {
    const isOrientationChange = lastOrientation !== currentOrientation;
    const deltaW = Math.abs(vpWidth - lastVpWidth);
    const deltaH = Math.abs(vpHeight - lastVpHeight);

    // If it's a minor change (like mobile address bar show/hide <= 120px) without orientation flip:
    // keep the user's current focal point rather than violently resetting to center.
    if (!isOrientationChange && deltaW === 0 && deltaH <= 120) {
      camera.y += (vpHeight - lastVpHeight) / 2;
      lastVpWidth = vpWidth;
      lastVpHeight = vpHeight;
      renderCameraTransform();
      debouncedSaveCameraState(300);
      return;
    }
  }

  lastVpWidth = vpWidth;
  lastVpHeight = vpHeight;
  lastOrientation = currentOrientation;

  // For genuine major window resize or device orientation flips: re-center view
  camera.x = (vpWidth - runtimeWorld.width * camera.zoom) / 2;
  camera.y = (vpHeight - runtimeWorld.height * camera.zoom) / 2;

  renderCameraTransform();
  debouncedSaveCameraState(300);
}

/**
 * Proportional / Multiplicative Zooming around a specific focal point.
 * @param {number} factor - Scale factor (e.g., 1.15 for zoom in, 1/1.15 for zoom out)
 * @param {number|null} anchorX - Focal point X (in normalized viewport space)
 * @param {number|null} anchorY - Focal point Y (in normalized viewport space)
 */
export function zoomCameraByFactor(factor, anchorX = null, anchorY = null) {
  const targetZoom = Math.max(
    MAP_CONFIG.camera.minZoom,
    Math.min(MAP_CONFIG.camera.maxZoom, camera.zoom * factor),
  );

  if (targetZoom === camera.zoom) return;

  const rotated = isPortraitMode();
  const vpWidth = rotated ? window.innerHeight : window.innerWidth;
  const vpHeight = rotated ? window.innerWidth : window.innerHeight;

  const focalX = anchorX ?? vpWidth / 2;
  const focalY = anchorY ?? vpHeight / 2;

  // Exact geometric zoom around focal point
  camera.x = focalX - (focalX - camera.x) * (targetZoom / camera.zoom);
  camera.y = focalY - (focalY - camera.y) * (targetZoom / camera.zoom);
  camera.zoom = targetZoom;

  renderCameraTransform();
}

/**
 * Backward-compatible zoom helper that converts delta or steps into proportional zoom
 */
export function zoomCamera(delta, anchorX = null, anchorY = null) {
  const factor = delta > 0 ? 1 + Math.abs(delta) * 2 : 1 / (1 + Math.abs(delta) * 2);
  zoomCameraByFactor(factor, anchorX, anchorY);
}

/**
 * Robust Wheel & Trackpad Handler:
 * High-sensitivity trackpad pinch-to-zoom, smooth trackpad 2-finger panning,
 * and responsive physical mouse wheel zooming.
 */
function handleWheel(event) {
  event.preventDefault();

  const coords = getNormalizedPointer(event);

  // 1. TRACKPAD PINCH-TO-ZOOM (or Ctrl + mouse wheel)
  if (event.ctrlKey) {
    // Normalizing delta between high-precision trackpads and notched wheels with Ctrl held
    const rawDelta = event.deltaMode !== 0 ? event.deltaY * 20 : event.deltaY;
    const clampedDelta = Math.max(-30, Math.min(30, rawDelta));
    // Highly responsive 0.018 sensitivity multiplier matching natural finger distance
    const factor = Math.exp(-clampedDelta * 0.018);
    zoomCameraByFactor(factor, coords.x, coords.y);
    debouncedSaveCameraState(300);
    return;
  }

  // 2. DISCRIMINATE PHYSICAL NOTCHED MOUSE WHEEL VS TRACKPAD PANNING
  // Physical mouse wheels emit discrete notched jumps (Math.abs(deltaY) >= 40) or deltaMode !== 0.
  // Laptop trackpads emit continuous small floats/integers across both axes.
  const isPhysicalMouseWheel =
    event.deltaMode !== 0 ||
    (Math.abs(event.deltaY) >= 40 && Math.abs(event.deltaX) === 0);

  if (isPhysicalMouseWheel && !event.shiftKey) {
    // Physical mouse wheel: zoom into cursor location
    const factor = event.deltaY < 0 ? 1.25 : 1 / 1.25;
    zoomCameraByFactor(factor, coords.x, coords.y);
    debouncedSaveCameraState(300);
  } else {
    // Laptop trackpad two-finger glide or Shift + wheel: smooth 2D panning
    camera.x -= event.deltaX;
    camera.y -= event.deltaY;
    renderCameraTransform();
    debouncedSaveCameraState(300);
  }
}

/* ==========================================================================
   Pointer & Drag Handlers
   ========================================================================== */

function getPinchMidpoint(t1, t2) {
  const rotated = isPortraitMode();
  const rawX = (t1.clientX + t2.clientX) / 2;
  const rawY = (t1.clientY + t2.clientY) / 2;

  if (!rotated) {
    return { x: rawX, y: rawY };
  }
  return {
    x: rawY,
    y: window.innerWidth - rawX,
  };
}

function handlePointerDown(e) {
  // Clear any active focus outline on tap
  if (
    document.activeElement &&
    document.activeElement !== document.body &&
    document.activeElement.tagName !== "INPUT" &&
    document.activeElement.tagName !== "TEXTAREA"
  ) {
    document.activeElement.blur();
  }

  // Multi-touch gestures (phones, tablets, touch displays)
  if (e.touches) {
    if (e.touches.length === 2) {
      // 2-finger touch start: initialize pinch-zoom and midpoint tracking
      camera.isDragging = false;
      camera.totalDragDist = 999; // Ensure lifting fingers does not trigger building clicks
      document.body.classList.remove("is-panning");

      const t1 = e.touches[0];
      const t2 = e.touches[1];
      camera.touchPinchDist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      const mid = getPinchMidpoint(t1, t2);
      camera.touchPinchMidX = mid.x;
      camera.touchPinchMidY = mid.y;
      return;
    }

    if (e.touches.length === 1) {
      // 1-finger drag start
      const t = e.touches[0];
      camera.isDragging = true;
      camera.totalDragDist = 0;
      camera.touchPinchDist = 0;
      camera.touchPinchMidX = null;
      camera.touchPinchMidY = null;
      camera.dragStartX = t.clientX - camera.x;
      camera.dragStartY = t.clientY - camera.y;
      document.body.classList.add("is-panning");
      return;
    }
  }

  // Desktop Mouse drag start
  const coords = getNormalizedPointer(e);
  camera.isDragging = true;
  camera.totalDragDist = 0;
  camera.dragStartX = coords.x - camera.x;
  camera.dragStartY = coords.y - camera.y;

  document.body.classList.add("is-panning");
}

function handlePointerMove(e) {
  // Prevent native mobile page bounce / pull-to-refresh while interacting with the map
  if (e.cancelable && (camera.isDragging || (e.touches && e.touches.length >= 1))) {
    e.preventDefault();
  }

  // Mobile touchscreen two-finger pinch-to-zoom + pan tracking
  if (e.touches && e.touches.length === 2) {
    const t1 = e.touches[0];
    const t2 = e.touches[1];
    const currentDist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
    const currentMid = getPinchMidpoint(t1, t2);

    if (
      camera.touchPinchDist > 0 &&
      currentDist > 0 &&
      camera.touchPinchMidX !== null &&
      camera.touchPinchMidY !== null
    ) {
      const scaleRatio = currentDist / camera.touchPinchDist;
      const targetZoom = Math.max(
        MAP_CONFIG.camera.minZoom,
        Math.min(MAP_CONFIG.camera.maxZoom, camera.zoom * scaleRatio)
      );
      const actualRatio = targetZoom / camera.zoom;

      // Calculate shift of the finger midpoint across screen
      const deltaMidX = currentMid.x - camera.touchPinchMidX;
      const deltaMidY = currentMid.y - camera.touchPinchMidY;

      // Simultaneous geometric zoom around midpoint + natural hand pan translation
      camera.x = currentMid.x - (currentMid.x - camera.x) * actualRatio + deltaMidX;
      camera.y = currentMid.y - (currentMid.y - camera.y) * actualRatio + deltaMidY;
      camera.zoom = targetZoom;

      renderCameraTransform();
    }

    camera.touchPinchDist = currentDist;
    camera.touchPinchMidX = currentMid.x;
    camera.touchPinchMidY = currentMid.y;
    camera.totalDragDist = 999;
    return;
  }

  // Single pointer / 1-finger drag
  if (!camera.isDragging) return;

  const coords = getNormalizedPointer(e);
  const nextX = coords.x - camera.dragStartX;
  const nextY = coords.y - camera.dragStartY;

  camera.totalDragDist += Math.hypot(nextX - camera.x, nextY - camera.y);
  camera.x = nextX;
  camera.y = nextY;

  renderCameraTransform();
}

function handlePointerUp(e) {
  // Seamless handover: If 1 finger remains after releasing 1 finger of a pinch, continue panning
  if (e && e.touches && e.touches.length === 1) {
    camera.touchPinchDist = 0;
    camera.touchPinchMidX = null;
    camera.touchPinchMidY = null;
    camera.isDragging = true;
    const remainingTouch = e.touches[0];
    camera.dragStartX = remainingTouch.clientX - camera.x;
    camera.dragStartY = remainingTouch.clientY - camera.y;
    return;
  }

  // All fingers / mouse released
  camera.isDragging = false;
  camera.touchPinchDist = 0;
  camera.touchPinchMidX = null;
  camera.touchPinchMidY = null;
  document.body.classList.remove("is-panning");
  saveCameraState();

  if (window.getSelection) {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
      sel.removeAllRanges();
    }
  }
}

export function registerCameraEvents() {
  // Mouse Drag
  dom.viewport.addEventListener("mousedown", handlePointerDown);
  window.addEventListener("mousemove", handlePointerMove);
  window.addEventListener("mouseup", handlePointerUp);

  // Mobile Touch Drag & Pinch
  dom.viewport.addEventListener("touchstart", handlePointerDown, {
    passive: false,
  });
  window.addEventListener("touchmove", handlePointerMove, { passive: false });
  window.addEventListener("touchend", handlePointerUp, { passive: false });
  window.addEventListener("touchcancel", handlePointerUp, { passive: false });

  // Wheel & Trackpad Gestures (Two-finger pan, pinch, mouse wheel)
  dom.viewport.addEventListener("wheel", handleWheel, { passive: false });

  // Window Resize: Preserves current zoom & pan without jumping on soft bar changes
  window.addEventListener("resize", handleResizePreserveZoom);
  window.addEventListener("orientationchange", () =>
    setTimeout(handleResizePreserveZoom, 200),
  );

  // HUD Controls (responsive, clear zoom step)
  dom.zoomInBtn.addEventListener("click", () => {
    zoomCameraByFactor(1.35);
    debouncedSaveCameraState(300);
  });
  dom.zoomOutBtn.addEventListener("click", () => {
    zoomCameraByFactor(1 / 1.35);
    debouncedSaveCameraState(300);
  });
  dom.fitMapBtn.addEventListener("click", fitMapToViewport);
}
