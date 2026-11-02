/**
 * @file clouds.js
 * @description Cloud curtain transition system for smooth screen swaps.
 */

import { sound } from "./audio.js";

const TRANSITION_SLIDE_TIME = 500; // ms for clouds to fully slide in

function getCloudCurtain() {
  return document.getElementById("cloudCurtain");
}

/**
 * Executes a scene transition using sliding cartoon cloud curtains.
 * @param {Function} sceneSwapCallback - Function to execute when clouds cover the screen.
 */
export async function transitionWithClouds(sceneSwapCallback) {
  const curtain = getCloudCurtain();

  if (!curtain) {
    if (typeof sceneSwapCallback === "function") await sceneSwapCallback();
    return;
  }

  // 1. Activate visibility flag and slide clouds to center
  curtain.classList.add("is-animating", "clouds-closed");

  sound.playCloudWhoosh();

  await new Promise((resolve) => setTimeout(resolve, TRANSITION_SLIDE_TIME));

  // 2. Perform background swap while screen is completely covered
  if (typeof sceneSwapCallback === "function") {
    await sceneSwapCallback();
  }

  // 3. Slide clouds back out
  curtain.classList.remove("clouds-closed");

  await new Promise((resolve) => setTimeout(resolve, TRANSITION_SLIDE_TIME));

  // 4. Fully hide from DOM visibility until the next click
  curtain.classList.remove("is-animating");
}
