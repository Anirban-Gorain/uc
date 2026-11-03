/**
 * @file camera.js
 * @description Manages viewport transform, pan/drag, pointer-anchored wheel zoom,
 * trackpad normalization, two-finger mobile pinch zooming with anchor tracking,
 * and debounced camera position persistence.
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

const DRAG_THRESHOLD = 6; // Movement beyond 6px is a drag, not a click

// Debounced camera state persistence to avoid blocking the main thread during gestures
let saveTimeout = null;
function debouncedSaveCameraState(delay = 200) {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    saveCameraState();
    saveTimeout = null;
  }, delay);
}

export function renderCameraTransform() {
  dom.world.style.transform = `translate(${camera.x}px, ${camera.y}px) scale(${camera.zoom})`;
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

  renderCameraTransform();
  debouncedSaveCameraState(0);
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
    renderCameraTransform();
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
      debouncedSaveCameraState(150);
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
  debouncedSaveCameraState(150);
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
  debouncedSaveCameraState(150);
}

/**
 * Backward-compatible zoom helper that converts delta or steps into proportional zoom
 */
export function zoomCamera(delta, anchorX = null, anchorY = null) {
  // Translate linear delta into smooth multiplicative factor
  // delta > 0 zooms in (~1.2x for a standard +0.1 step), delta < 0 zooms out (~1/1.2x)
  const factor = delta > 0 ? 1 + Math.abs(delta) * 2 : 1 / (1 + Math.abs(delta) * 2);
  zoomCameraByFactor(factor, anchorX, anchorY);
}

/**
 * Robust Wheel & Trackpad Handler:
 * Supports high-resolution mouse wheels, standard notched wheels, and trackpad pinch/pan gestures.
 */
function handleWheel(event) {
  event.preventDefault();

  const coords = getNormalizedPointer(event);

  // 1. PINCH-TO-ZOOM (Trackpad pinch or Ctrl + mouse wheel)
  if (event.ctrlKey) {
    const zoomFactor = 0.01;
    const clampedDelta = Math.max(-60, Math.min(60, event.deltaY));
    const factor = Math.exp(-clampedDelta * zoomFactor);
    zoomCameraByFactor(factor, coords.x, coords.y);
    return;
  }

  // 2. DISCRIMINATE MOUSE WHEEL VS TRACKPAD TWO-FINGER SWIPE
  // Trackpad panning produces continuous horizontal motion (deltaX !== 0) or small fractional non-wheel deltas.
  // Standard and high-precision mouse wheels almost exclusively scroll on deltaY with deltaX === 0.
  const isPureVertical = Math.abs(event.deltaX) === 0;
  const hasSubstantialY = Math.abs(event.deltaY) > 0;

  // On standard desktop browsers, mouse wheel default behavior in maps is ZOOM.
  // If user holds Shift, or is swiping both axes on a trackpad, treat as PAN.
  if (isPureVertical && hasSubstantialY && !event.shiftKey) {
    // Proportional zoom step based on scroll direction
    const factor = event.deltaY < 0 ? 1.15 : 1 / 1.15;
    zoomCameraByFactor(factor, coords.x, coords.y);
  } else {
    // Trackpad two-finger swipe or Shift-scroll pans the map
    camera.x -= event.deltaX;
    camera.y -= event.deltaY;
    renderCameraTransform();
    debouncedSaveCameraState(150);
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

  if (e.touches && e.touches.length === 2) {
    camera.isDragging = false;
    document.body.classList.remove("is-panning");
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    camera.touchPinchDist = Math.hypot(dx, dy);
    return;
  }

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

  // Mobile touchscreen two-finger pinch-to-zoom
  if (e.touches && e.touches.length === 2) {
    const t1 = e.touches[0];
    const t2 = e.touches[1];
    const dx = t1.clientX - t2.clientX;
    const dy = t1.clientY - t2.clientY;
    const currentDist = Math.hypot(dx, dy);

    if (camera.touchPinchDist > 0 && currentDist > 0) {
      // Calculate true pinch ratio
      const factor = currentDist / camera.touchPinchDist;
      
      // Calculate geometric midpoint between the two fingers in current orientation
      const midpoint = getPinchMidpoint(t1, t2);

      zoomCameraByFactor(factor, midpoint.x, midpoint.y);
    }
    camera.touchPinchDist = currentDist;
    return;
  }

  if (!camera.isDragging) return;

  const coords = getNormalizedPointer(e);
  const nextX = coords.x - camera.dragStartX;
  const nextY = coords.y - camera.dragStartY;

  camera.totalDragDist += Math.hypot(nextX - camera.x, nextY - camera.y);
  camera.x = nextX;
  camera.y = nextY;

  renderCameraTransform();
}

function handlePointerUp() {
  camera.isDragging = false;
  camera.touchPinchDist = 0;
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
  window.addEventListener("touchend", handlePointerUp);
  window.addEventListener("touchcancel", handlePointerUp);

  // Wheel & Trackpad Gestures (Two-finger pan, pinch, mouse wheel)
  dom.viewport.addEventListener("wheel", handleWheel, { passive: false });

  // Window Resize: Preserves current zoom & pan without jumping on soft bar changes
  window.addEventListener("resize", handleResizePreserveZoom);
  window.addEventListener("orientationchange", () =>
    setTimeout(handleResizePreserveZoom, 200),
  );

  // HUD Controls (using smooth proportional zoom)
  dom.zoomInBtn.addEventListener("click", () =>
    zoomCameraByFactor(1.2),
  );
  dom.zoomOutBtn.addEventListener("click", () =>
    zoomCameraByFactor(1 / 1.2),
  );
  dom.fitMapBtn.addEventListener("click", fitMapToViewport);
}
