/**
 * @file dataStore.js
 * @description Master curriculum repository providing indexed, validated access
 * with cache-first lookup and async-ready chunk loading capability.
 */

import { CURRICULUM_DATA } from "./data.js";

class DataStore {
  constructor() {
    this.buildingMap = new Map();
    this.districtMeta = {
      district: CURRICULUM_DATA.district || "Foundation Hub",
      totalBuildings: CURRICULUM_DATA.totalBuildings || 0,
      totalFloors: CURRICULUM_DATA.totalFloors || 0,
      totalWords: CURRICULUM_DATA.totalWords || 0,
    };

    // Pre-index the primary bundled curriculum
    this._indexBuildings(CURRICULUM_DATA.buildings || []);
  }

  /**
   * Internal indexing helper
   * @private
   */
  _indexBuildings(buildings) {
    for (const building of buildings) {
      if (building && building.id) {
        this.buildingMap.set(building.id, Object.freeze({ ...building }));
      }
    }
  }

  /**
   * Returns a building's curriculum synchronously from memory.
   * @param {string} buildingDataId (e.g. "foundation_1")
   * @returns {Object|null}
   */
  getBuilding(buildingDataId) {
    if (!buildingDataId) return null;
    return this.buildingMap.get(buildingDataId) || null;
  }

  /**
   * Async-ready getter: checks in-memory cache first, falls back to dynamic fetcher if registered.
   * Enables seamless transition to chunked JSON curriculum files without UI refactors.
   * @param {string} buildingDataId
   * @returns {Promise<Object|null>}
   */
  async fetchBuilding(buildingDataId) {
    const cached = this.getBuilding(buildingDataId);
    if (cached) return cached;

    // Optional dynamic fetcher hook for future remote/chunked loading
    if (typeof this._customLoader === "function") {
      try {
        const remoteData = await this._customLoader(buildingDataId);
        if (remoteData) {
          this.registerBuilding(remoteData);
          return remoteData;
        }
      } catch (err) {
        console.error(`Failed to dynamically fetch building '${buildingDataId}':`, err);
      }
    }
    return null;
  }

  /**
   * Allows registering dynamic or add-on building curricula at runtime.
   * @param {Object} building
   */
  registerBuilding(building) {
    if (building && building.id) {
      this.buildingMap.set(building.id, Object.freeze({ ...building }));
    }
  }

  /**
   * Registers a dynamic chunk loader function (e.g. for loading island 2, 3 data on demand).
   * @param {Function} loaderFn - async (buildingId) => buildingData
   */
  setChunkLoader(loaderFn) {
    this._customLoader = loaderFn;
  }

  /**
   * Returns all indexed buildings in unlock order.
   * @returns {Array<Object>}
   */
  getAllBuildings() {
    return Array.from(this.buildingMap.values()).sort(
      (a, b) => (a.unlockOrder || 0) - (b.unlockOrder || 0)
    );
  }

  /**
   * Returns metadata about the current district/curriculum.
   * @returns {Object}
   */
  getDistrictInfo() {
    return { ...this.districtMeta };
  }
}

export const dataStore = new DataStore();
