import { dom, camera } from "../state.js";
import { dataStore } from "../dataStore.js";
import { openWordScreen } from "../components/wordScreen.js";
import { checkRevisions, isBuildingUnlocked } from "./progress.js";
import { transitionWithClouds } from "./clouds.js";
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

  // Prevent mobile browser multi-tap selection and contextual callouts on the entire map
  window.addEventListener("selectstart", (e) => {
    // Allow text selection only inside editable form fields (like modal code inputs)
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

  if (!dom.buildingLayer) {
    console.error("dom.buildingLayer not found in DOM");
    return;
  }

  // Delegated click listener on the building parcels layer
  dom.buildingLayer.addEventListener("click", (e) => {
    // Clear any text selection that mobile OS multi-tap may have created
    if (window.getSelection) {
      const sel = window.getSelection();
      if (sel && sel.removeAllRanges) {
        sel.removeAllRanges();
      }
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
