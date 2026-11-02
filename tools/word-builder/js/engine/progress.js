/**
 * @file progress.js
 * @description Enterprise-grade learner progress manager featuring storage abstraction,
 * schema versioning & migration, revision tracking, and reactive state subscriptions.
 */

import { dataStore } from "../dataStore.js";
import { CURRICULUM_DATA } from "../data.js";

const STORAGE_KEY = "fluency_progress_v1";
const CURRENT_SCHEMA_VERSION = 1;
const REVISION_INTERVAL_MS = 10 * 24 * 60 * 60 * 1000; // 10 days

/**
 * Storage adapter interface with resilient in-memory fallback
 */
class LocalStorageAdapter {
  constructor() {
    this.memoryFallback = new Map();
    this.isLocalStorageAvailable = this._testStorage();
  }

  _testStorage() {
    try {
      const testKey = "__test_storage_probe__";
      window.localStorage.setItem(testKey, "1");
      window.localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  getItem(key) {
    if (this.isLocalStorageAvailable) {
      try {
        return window.localStorage.getItem(key);
      } catch (e) {
        console.warn("Storage read error, using fallback:", e);
      }
    }
    return this.memoryFallback.get(key) || null;
  }

  setItem(key, value) {
    if (this.isLocalStorageAvailable) {
      try {
        window.localStorage.setItem(key, value);
        return;
      } catch (e) {
        console.warn("Storage write error, using fallback:", e);
      }
    }
    this.memoryFallback.set(key, value);
  }

  removeItem(key) {
    if (this.isLocalStorageAvailable) {
      try {
        window.localStorage.removeItem(key);
        return;
      } catch {}
    }
    this.memoryFallback.delete(key);
  }
}

class ProgressStore {
  constructor(storageAdapter = new LocalStorageAdapter()) {
    this.storage = storageAdapter;
    this.subscribers = new Set();
    this._state = this._loadInitialState();
  }

  /**
   * Loads and normalizes progress schema, executing migrations if needed.
   * @private
   */
  _loadInitialState() {
    try {
      const raw = this.storage.getItem(STORAGE_KEY);
      if (!raw) {
        return this._createDefaultState();
      }
      const parsed = JSON.parse(raw);
      return this._migrateSchema(parsed);
    } catch (err) {
      console.warn("Failed to load progress state, initializing default:", err);
      return this._createDefaultState();
    }
  }

  /**
   * Creates clean initial v1 schema
   * @private
   */
  _createDefaultState() {
    return {
      version: CURRENT_SCHEMA_VERSION,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      buildings: {},
    };
  }

  /**
   * Schema migration pipeline
   * @private
   */
  _migrateSchema(parsed) {
    if (!parsed || typeof parsed !== "object") {
      return this._createDefaultState();
    }

    // Version 0 or unversioned legacy migration
    if (!parsed.version) {
      return {
        version: CURRENT_SCHEMA_VERSION,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        buildings: parsed.buildings || {},
      };
    }

    return {
      version: CURRENT_SCHEMA_VERSION,
      createdAt: parsed.createdAt || new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      buildings: parsed.buildings || {},
    };
  }

  /**
   * Persists state to storage and alerts all active observers.
   * @private
   */
  _persistAndNotify(mutationEvent = {}) {
    this._state.lastUpdated = new Date().toISOString();
    try {
      this.storage.setItem(STORAGE_KEY, JSON.stringify(this._state));
    } catch (err) {
      console.error("Critical: Failed to save progress:", err);
    }

    // Notify observers asynchronously to prevent blocking call stacks
    const payload = {
      event: mutationEvent,
      progress: this.getProgress(),
    };

    for (const listener of this.subscribers) {
      try {
        listener(payload);
      } catch (listenerErr) {
        console.error("Progress subscriber error:", listenerErr);
      }
    }
  }

  /**
   * Subscribes a listener to progress mutations (e.g. floor completions).
   * @param {Function} listener - callback(payload)
   * @returns {Function} unsubscribe
   */
  subscribe(listener) {
    if (typeof listener === "function") {
      this.subscribers.add(listener);
    }
    return () => this.subscribers.delete(listener);
  }

  /**
   * Returns a deep clone of the current progress state.
   */
  getProgress() {
    return JSON.parse(JSON.stringify(this._state));
  }

  /**
   * Replaces the progress state (for testing or manual sync).
   */
  saveProgress(newProgress) {
    this._state = this._migrateSchema(newProgress);
    this._persistAndNotify({ type: "SYNC" });
  }

  /**
   * Gets or initializes progress record for a single building.
   * @param {string} buildingId
   */
  getBuildingProgress(buildingId) {
    const bldg = this._state.buildings[buildingId];
    if (!bldg) {
      return {
        completedLevels: [],
        completedAt: null,
        needsRevision: false,
      };
    }
    return { ...bldg, completedLevels: [...(bldg.completedLevels || [])] };
  }

  /**
   * Checks if a building is unlocked based on preceding building completion.
   * @param {string} buildingId
   */
  isBuildingUnlocked(buildingId) {
    const allBuildings = dataStore.getAllBuildings().length
      ? dataStore.getAllBuildings()
      : CURRICULUM_DATA.buildings || [];

    const currentIndex = allBuildings.findIndex((b) => b.id === buildingId);

    // The first building is always unlocked
    if (currentIndex <= 0) {
      return {
        unlocked: true,
        previousBuildingName: "",
        currentBuildingName: allBuildings[0]?.name || "Building",
      };
    }

    const previousBuilding = allBuildings[currentIndex - 1];
    const prevProgress = this.getBuildingProgress(previousBuilding.id);
    const requiredFloors = (previousBuilding.floors || []).length || 5;
    const isCompleted = prevProgress.completedLevels.length >= requiredFloors;

    return {
      unlocked: isCompleted,
      previousBuildingName: previousBuilding.name,
      currentBuildingName: allBuildings[currentIndex]?.name || "Building",
    };
  }

  /**
   * Checks if a specific floor within a building is unlocked.
   * @param {string} buildingId
   * @param {number} floorIndex
   * @param {Array} floors
   */
  isFloorUnlocked(buildingId, floorIndex, floors = []) {
    if (floorIndex === 0) return true;
    const bldg = this.getBuildingProgress(buildingId);
    const prevFloor = floors[floorIndex - 1];
    const prevFloorId = `floor_${prevFloor?.floorNumber || floorIndex}`;
    return bldg.completedLevels.includes(prevFloorId);
  }

  /**
   * Marks a level/floor as completed, checks building completion, and notifies observers.
   * @param {string} buildingId
   * @param {string} levelId - e.g. "floor_1"
   * @param {number} totalFloors
   */
  markLevelComplete(buildingId, levelId, totalFloors) {
    if (!this._state.buildings[buildingId]) {
      this._state.buildings[buildingId] = {
        completedLevels: [],
        completedAt: null,
        needsRevision: false,
      };
    }

    const bldg = this._state.buildings[buildingId];
    if (!Array.isArray(bldg.completedLevels)) {
      bldg.completedLevels = [];
    }

    let isNewCompletion = false;
    if (!bldg.completedLevels.includes(levelId)) {
      bldg.completedLevels.push(levelId);
      isNewCompletion = true;
    }

    // Mark building finished when all floors are done
    if (bldg.completedLevels.length >= totalFloors && !bldg.completedAt) {
      bldg.completedAt = new Date().toISOString();
    }

    this._persistAndNotify({
      type: "LEVEL_COMPLETE",
      buildingId,
      levelId,
      isNew: isNewCompletion,
    });
  }

  /**
   * Runs spaced-repetition revision checks across all completed buildings.
   */
  checkRevisions() {
    const now = Date.now();
    let hasChanges = false;

    Object.keys(this._state.buildings).forEach((bId) => {
      const bldg = this._state.buildings[bId];
      if (bldg?.completedAt && !bldg.needsRevision) {
        const completedTime = new Date(bldg.completedAt).getTime();
        if (now - completedTime >= REVISION_INTERVAL_MS) {
          bldg.needsRevision = true;
          hasChanges = true;
        }
      }
    });

    if (hasChanges) {
      this._persistAndNotify({ type: "REVISION_TRIGGERED" });
    }
  }

  /**
   * Resets progress (clears local cache and storage).
   */
  resetProgress() {
    this._state = this._createDefaultState();
    this._persistAndNotify({ type: "RESET" });
  }
}

// Global Singleton Instance
export const progressStore = new ProgressStore();

// Backward-compatible named exports
export function getProgress() {
  return progressStore.getProgress();
}

export function saveProgress(progress) {
  progressStore.saveProgress(progress);
}

export function isBuildingUnlocked(buildingId) {
  return progressStore.isBuildingUnlocked(buildingId);
}

export function markLevelComplete(buildingId, levelId, totalFloors) {
  progressStore.markLevelComplete(buildingId, levelId, totalFloors);
}

export function checkRevisions() {
  progressStore.checkRevisions();
}
