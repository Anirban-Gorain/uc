/**
 * @file clouds.js
 * @description Cloud curtain transition system for smooth screen swaps.
 */

import { sound } from "./audio.js";

const TRANSITION_SLIDE_TIME = 450; // ms for clouds to fully slide in

function getCloudCurtain() {
  return document.getElementById("cloudCurtain");
}

let isTransitioning = false;

export function isCloudTransitioning() {
  return isTransitioning;
}

/**
 * Executes a scene transition using sliding cartoon cloud curtains.
 * Fully protected against multi-tap re-entrancy so clouds never get stuck halfway.
 * @param {Function} sceneSwapCallback - Function to execute when clouds cover the screen.
 */
export async function transitionWithClouds(sceneSwapCallback) {
  if (isTransitioning) return;
  isTransitioning = true;

  const curtain = getCloudCurtain();

  if (!curtain) {
    if (typeof sceneSwapCallback === "function") {
      try {
        await sceneSwapCallback();
      } catch (err) {
        console.error("Scene swap error:", err);
      }
    }
    isTransitioning = false;
    return;
  }

  try {
    // 1. Activate visibility flag and slide clouds to center
    curtain.classList.add("is-animating", "clouds-closed");

    sound?.playCloudWhoosh?.();

    await new Promise((resolve) => setTimeout(resolve, TRANSITION_SLIDE_TIME));

    // 2. Perform background swap while screen is completely covered
    if (typeof sceneSwapCallback === "function") {
      try {
        await sceneSwapCallback();
      } catch (err) {
        console.error("Scene swap error:", err);
      }
    }

    // 3. Slide clouds back out
    curtain.classList.remove("clouds-closed");

    await new Promise((resolve) => setTimeout(resolve, TRANSITION_SLIDE_TIME));
  } finally {
    // 4. Guaranteed reset: never leave curtain stuck in DOM or classes active
    curtain.classList.remove("clouds-closed", "is-animating");
    isTransitioning = false;
  }
}
