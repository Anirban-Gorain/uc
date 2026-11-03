import { dom, camera } from "../state.js";
import { dataStore } from "../dataStore.js";
import { openWordScreen } from "../components/wordScreen.js";
import { checkRevisions, isBuildingUnlocked } from "./progress.js";
import { transitionWithClouds, isCloudTransitioning } from "./clouds.js";
import { sound } from "./audio.js";
import { showToast } from "../components/toast.js";

/**
 * @file events.js
 * @description Centralized event delegation for map clicks, lock checks, and modal transitions.
 */

export function initEvents() {
  try {
    checkRevisions();
  } catch (err) {
    console.warn("Revision check skipped:", err);
  }

  const clearSelection = () => {
    const activeEl = document.activeElement;
    if (activeEl && (activeEl.tagName === "INPUT" || activeEl.tagName === "TEXTAREA")) {
      return;
    }
    const sel = window.getSelection ? window.getSelection() : null;
    if (sel) {
      if (sel.empty) sel.empty();
      if (sel.removeAllRanges) sel.removeAllRanges();
    }
    if (
      activeEl &&
      activeEl !== document.body &&
      activeEl.tagName !== "INPUT" &&
      activeEl.tagName !== "TEXTAREA"
    ) {
      activeEl.blur();
    }
  };

  // Prevent mobile browser multi-tap selection and contextual callouts on the entire map
  window.addEventListener("selectstart", (e) => {
    if (e.target && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")) {
      return;
    }
    e.preventDefault();
  }, { passive: false });

  window.addEventListener("contextmenu", (e) => {
    if (e.target && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")) {
      return;
    }
    e.preventDefault();
  }, { passive: false });

  // Active defense: Instantly dissolve any text selection that mobile OS multi-tap attempts to create
  document.addEventListener("selectionchange", () => {
    const activeEl = document.activeElement;
    if (activeEl && (activeEl.tagName === "INPUT" || activeEl.tagName === "TEXTAREA")) {
      return;
    }
    const sel = window.getSelection ? window.getSelection() : null;
    if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
      sel.removeAllRanges();
    }
  });

  window.addEventListener("touchend", clearSelection, { passive: true });
  window.addEventListener("mouseup", clearSelection, { passive: true });

  if (dom.viewport) {
    // Prevent default mousedown to stop browser from initiating drag-selection or focus bounding boxes
    dom.viewport.addEventListener("mousedown", (e) => {
      if (e.target && e.target.tagName !== "INPUT" && e.target.tagName !== "TEXTAREA") {
        e.preventDefault();
      }
    });
  }

  if (!dom.buildingLayer) {
    console.error("dom.buildingLayer not found in DOM");
    return;
  }

  // Delegated click listener on the building parcels layer
  dom.buildingLayer.addEventListener("click", (e) => {
    clearSelection();

    // Prevent multi-click race conditions if a transition is running or modal is open
    if (isCloudTransitioning() || document.querySelector(".screen-overlay")) {
      return;
    }

    // Discriminate between panning/dragging the map vs clicking a building
    if (camera && camera.totalDragDist > 6) return;

    const slotElement = e.target.closest(".map-slot");
    if (!slotElement) return;

    const buildingId = slotElement.dataset.buildingDataId;
    if (!buildingId) return;

    const rawBuildingData = dataStore.getBuilding(buildingId);
    if (!rawBuildingData) {
      console.warn(`No curriculum data found for building ID: ${buildingId}`);
      return;
    }

    // Check sequential building progression lock
    const lockStatus = isBuildingUnlocked(buildingId);
    if (!lockStatus.unlocked) {
      sound.playLocked();

      // Shake animation on the map slot
      slotElement.classList.remove("shake-locked");
      void slotElement.offsetWidth; // Force CSS reflow
      slotElement.classList.add("shake-locked");

      showToast({
        icon: "🔒",
        message: `Finish all floors of <b>${lockStatus.previousBuildingName}</b> to unlock <b>${lockStatus.currentBuildingName}</b>!`,
        duration: 2600,
      });
      return;
    }

    // Form clean payload for modal
    const buildingPayload = {
      ...rawBuildingData,
      id: buildingId,
      image: `assets/buildings/${buildingId}.png`,
    };

    sound.playBuildingOpen();

    transitionWithClouds(() => {
      openWordScreen(buildingPayload);
    });
  });
}
