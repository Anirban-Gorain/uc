/**
 * @file wordScreen.js
 * @description Modular Netflix-style curriculum modal featuring granular DOM updates,
 * keyboard accessibility, spaced progress synchronization, and responsive floor navigation.
 */

import {
  progressStore,
  getProgress,
  markLevelComplete,
} from "../engine/progress.js";
import { transitionWithClouds } from "../engine/clouds.js";
import { sound } from "../engine/audio.js";

class WordScreenModal {
  constructor(buildingData) {
    this.building = buildingData;
    this.floors = buildingData.floors || [];
    this.activeFloorIndex = this._resolveInitialFloorIndex();
    this.isPromptLoaded = false;

    // DOM references cache
    this.overlay = null;
    this.dom = {};

    this._handleKeyDown = this._handleKeyDown.bind(this);
  }

  /**
   * Auto-resumes to the user's earliest unfinished floor, or the last floor if all are complete.
   * @private
   */
  _resolveInitialFloorIndex() {
    if (!this.floors.length) return 0;
    try {
      const progress = progressStore.getBuildingProgress(this.building.id);
      const completed = progress.completedLevels || [];

      const nextUnfinishedIdx = this.floors.findIndex((fl, idx) => {
        const floorId = `floor_${fl.floorNumber || idx + 1}`;
        return !completed.includes(floorId);
      });

      return nextUnfinishedIdx !== -1 ? nextUnfinishedIdx : this.floors.length - 1;
    } catch (err) {
      console.warn("Could not determine resume floor index:", err);
      return 0;
    }
  }

  /**
   * Initializes and mounts the modal to the DOM.
   */
  mount() {
    // Remove any leftover modal instance safely
    document.querySelectorAll(".screen-overlay").forEach((el) => el.remove());

    this.overlay = document.createElement("div");
    this.overlay.className = "screen-overlay";

    this._buildStructure();
    this._bindEvents();
    this.renderFloor(this.activeFloorIndex);

    document.body.appendChild(this.overlay);
    document.addEventListener("keydown", this._handleKeyDown);
  }

  /**
   * Creates the fixed outer frame and caches references to dynamic child nodes.
   * @private
   */
  _buildStructure() {
    const buildingImage =
      this.building.image || `assets/buildings/${this.building.id}.png`;
    const buildingName = this.building.name || "Building";
    const buildingHook = this.building.hook || "Spoken English Mission";

    this.overlay.innerHTML = `
      <div class="word-modal" role="dialog" aria-modal="true" aria-labelledby="modal-building-title">
        <button class="close-btn" id="modal-close-btn" aria-label="Close Modal">✖</button>
        
        <!-- Left: Floor Navigation Sidebar -->
        <aside class="modal-left" aria-label="Building Floors">
          <div class="levels-title">Floors</div>
          <div class="levels-list" id="modal-floors-list"></div>
        </aside>

        <!-- Right: Visual Cinema Stage -->
        <section class="modal-right" id="modal-cinema-stage" style="background-image: url('${buildingImage}');">
          <div class="cinema-overlay"></div>

          <div class="modal-content-stack">
            <!-- Header Block -->
            <div class="top-header-block">
              <div class="building-hook-top">${buildingHook}</div>
              <h1 class="building-title-top" id="modal-building-title">${buildingName}</h1>
            </div>

            <!-- Situation / Mission Card -->
            <div class="mission-block">
              <div class="mission-label" id="modal-mission-label">Situation</div>
              <p class="mission-description" id="modal-mission-text"></p>
            </div>

            <!-- Target Vocabulary Block -->
            <div class="word-tags-block">
              <div class="word-tags-title">Target Vocabulary</div>
              <div class="word-pills-row" id="modal-words-row"></div>
            </div>

            <!-- Action Area -->
            <div class="action-stage">
              <div class="action-row">
                <button type="button" class="btn-primary-orange" id="modal-load-prompt-btn">
                  Load Prompt
                </button>
                
                <div class="verify-cluster hidden" id="modal-verify-cluster">
                  <input
                    type="text"
                    class="code-field"
                    id="modal-code-input"
                    placeholder="Enter Secret Code..."
                    autocomplete="off"
                    aria-label="Secret Floor Code"
                  />
                  <button type="button" class="btn-verify" id="modal-verify-btn">
                    Verify
                  </button>
                </div>
              </div>

              <div id="modal-verify-feedback" class="status-callout" role="status" aria-live="polite"></div>
            </div>
          </div>
        </section>
      </div>
    `;

    // Cache dynamic DOM elements for O(1) selective updates
    this.dom = {
      closeBtn: this.overlay.querySelector("#modal-close-btn"),
      floorsList: this.overlay.querySelector("#modal-floors-list"),
      stage: this.overlay.querySelector("#modal-cinema-stage"),
      missionLabel: this.overlay.querySelector("#modal-mission-label"),
      missionText: this.overlay.querySelector("#modal-mission-text"),
      wordsRow: this.overlay.querySelector("#modal-words-row"),
      loadPromptBtn: this.overlay.querySelector("#modal-load-prompt-btn"),
      verifyCluster: this.overlay.querySelector("#modal-verify-cluster"),
      codeInput: this.overlay.querySelector("#modal-code-input"),
      verifyBtn: this.overlay.querySelector("#modal-verify-btn"),
      feedback: this.overlay.querySelector("#modal-verify-feedback"),
    };
  }

  /**
   * Attaches delegating event listeners to cached DOM elements.
   * @private
   */
  _bindEvents() {
    // Close button
    this.dom.closeBtn.addEventListener("click", () => this.close());

    // Sidebar navigation via event delegation
    this.dom.floorsList.addEventListener("click", (e) => {
      const card = e.target.closest(".level-card");
      if (!card) return;

      const isUnlocked = card.dataset.unlocked === "true";
      const targetIndex = parseInt(card.dataset.index, 10);

      if (!isUnlocked) {
        sound?.playLocked?.();
        this.dom.feedback.innerHTML = `<span style="color: #f59e0b;">Complete Floor 0${targetIndex} before unlocking this floor! 🔒</span>`;
        return;
      }

      if (targetIndex !== this.activeFloorIndex) {
        this.renderFloor(targetIndex);
      }
    });

    // Copy Prompt button
    this.dom.loadPromptBtn.addEventListener("click", () => this._handleLoadPrompt());

    // Verify Code button
    this.dom.verifyBtn.addEventListener("click", () => this._handleVerifyCode());
  }

  /**
   * Keyboard shortcut handler (Escape to close, Enter to submit code).
   * @private
   */
  _handleKeyDown(e) {
    if (e.key === "Escape") {
      this.close();
      return;
    }

    if (e.key === "Enter" && document.activeElement === this.dom.codeInput) {
      e.preventDefault();
      this._handleVerifyCode();
    }
  }

  /**
   * Selectively updates the modal content without re-rendering the outer frame.
   * @param {number} floorIndex
   */
  renderFloor(floorIndex) {
    this.activeFloorIndex = floorIndex;
    this.isPromptLoaded = false;

    const progress = progressStore.getBuildingProgress(this.building.id);
    const completed = progress.completedLevels || [];

    // 1. Update Sidebar Floor Items
    this._updateSidebar(completed);

    // 2. Update Floor Content
    const currentFloor = this.floors[this.activeFloorIndex] || {
      floorNumber: this.activeFloorIndex + 1,
      mission: "Practice everyday conversation.",
      wordList: [],
    };

    const floorNum = currentFloor.floorNumber || this.activeFloorIndex + 1;
    this.dom.missionLabel.textContent = `Situation • Floor 0${floorNum}`;
    this.dom.missionText.textContent = currentFloor.mission || "";

    // 3. Update Vocabulary Pills
    const words = currentFloor.wordList || currentFloor.words || [];
    if (words.length > 0) {
      this.dom.wordsRow.innerHTML = words
        .map((w) => `<span class="word-pill">${w}</span>`)
        .join("");
    } else {
      this.dom.wordsRow.innerHTML = `<span style="color: #71717a; font-style: italic;">No words available for this floor.</span>`;
    }

    // 4. Reset Action Bar & Verification State
    this.dom.loadPromptBtn.textContent = "Load Prompt";
    this.dom.loadPromptBtn.classList.remove("loading-pulse");
    this.dom.verifyCluster.classList.add("hidden");
    this.dom.codeInput.value = "";
    this.dom.feedback.innerHTML = "";
  }

  /**
   * Updates sidebar list cards and unlock badges.
   * @private
   */
  _updateSidebar(completed) {
    this.dom.floorsList.innerHTML = this.floors
      .map((fl, idx) => {
        const floorId = `floor_${fl.floorNumber || idx + 1}`;
        const isDone = completed.includes(floorId);

        const isUnlocked =
          idx === 0 ||
          (() => {
            const prevFloorId = `floor_${this.floors[idx - 1]?.floorNumber || idx}`;
            return completed.includes(prevFloorId);
          })();

        const isActive = idx === this.activeFloorIndex ? "active" : "";
        const lockClass = isUnlocked ? "" : "locked";

        let icon = "🔒";
        if (isDone) {
          icon = "✅";
        } else if (isUnlocked) {
          icon = "▶️";
        }

        return `
          <div class="level-card ${isActive} ${isDone ? "completed" : ""} ${lockClass}" 
               data-index="${idx}" 
               data-unlocked="${isUnlocked}">
            <span>Floor 0${fl.floorNumber || idx + 1}</span>
            <span>${icon}</span>
          </div>
        `;
      })
      .join("");
  }

  /**
   * Handles asynchronous prompt construction and clipboard copying.
   * @private
   */
  async _handleLoadPrompt() {
    this.dom.loadPromptBtn.textContent = "Loading Prompt...";
    this.dom.loadPromptBtn.classList.add("loading-pulse");

    const currentFloor = this.floors[this.activeFloorIndex] || {};
    const vocabulary = (currentFloor.wordList || currentFloor.words || []).join(", ");
    const promptPayload = `You are an English coach. Mission: ${currentFloor.mission}. Focus vocabulary: [${vocabulary}]. Test my spoken responses.`;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(promptPayload);
      }
    } catch (err) {
      console.warn("Clipboard access denied or unsupported:", err);
    }

    setTimeout(() => {
      this.dom.loadPromptBtn.textContent = "Copied to Clipboard! 📋";
      this.dom.loadPromptBtn.classList.remove("loading-pulse");

      this.isPromptLoaded = true;
      this.dom.verifyCluster.classList.remove("hidden");
      this.dom.codeInput.focus();

      setTimeout(() => {
        if (this.dom.loadPromptBtn) {
          this.dom.loadPromptBtn.textContent = "Load Prompt";
        }
      }, 3000);
    }, 600);
  }

  /**
   * Verifies the floor's secret code and updates learner progress.
   * @private
   */
  _handleVerifyCode() {
    const currentFloor = this.floors[this.activeFloorIndex] || {};
    const enteredVal = this.dom.codeInput.value.trim();
    const expectedCode = String(currentFloor.secretCode || "1234").trim();

    if (enteredVal === expectedCode) {
      sound?.playSuccess?.();
      this.dom.feedback.innerHTML = `<span style="color: #22c55e;">Floor Verified & Completed! 🎉</span>`;

      const floorId = `floor_${currentFloor.floorNumber || this.activeFloorIndex + 1}`;
      progressStore.markLevelComplete(
        this.building.id,
        floorId,
        this.floors.length
      );

      // Auto-advance to the next floor if available
      setTimeout(() => {
        if (this.activeFloorIndex + 1 < this.floors.length) {
          this.renderFloor(this.activeFloorIndex + 1);
        } else {
          // Re-render current floor to reflect completed badge
          const updatedProgress = progressStore.getBuildingProgress(this.building.id);
          this._updateSidebar(updatedProgress.completedLevels || []);
        }
      }, 900);
    } else {
      sound?.playLocked?.();
      this.dom.feedback.innerHTML = `<span style="color: #ef4444;">Incorrect code. Try again ❌</span>`;
      this.dom.codeInput.select();
    }
  }

  /**
   * Closes the modal with smooth cloud transitions and detaches listeners.
   */
  close() {
    sound?.playClick?.();
    transitionWithClouds(() => {
      this.destroy();
    });
  }

  /**
   * Destroys DOM nodes and removes global listeners.
   */
  destroy() {
    document.removeEventListener("keydown", this._handleKeyDown);
    if (this.overlay && this.overlay.parentNode) {
      this.overlay.remove();
    }
    // Clean up any stray overlays
    document.querySelectorAll(".screen-overlay").forEach((el) => el.remove());
    this.overlay = null;
    this.dom = {};
  }
}

/**
 * Public facade function matching existing application contract.
 * @param {Object} buildingData
 */
export function openWordScreen(buildingData) {
  // Ensure no existing modal remains mounted
  document.querySelectorAll(".screen-overlay").forEach((el) => el.remove());
  const modal = new WordScreenModal(buildingData);
  modal.mount();
  return modal;
}
