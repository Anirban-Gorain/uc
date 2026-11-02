/**
 * @file config.js
 * @description Master spatial layout, slot positioning, and background map layer.
 */

export const MAP_CONFIG = {
  oceanPadding: 180,

  tileSize: {
    width: 80,
    height: 64,
    gap: 16,
    padding: 20,
  },

  colors: {
    ocean: "#2f83c2",
    sand: "#f7d794",
    grass: "#55b85a",
  },

  camera: {
    minZoom: 0.15,
    maxZoom: 3.0,
    zoomStep: 0.1,
    fitPaddingRatio: 0.95,
  },

  islands: [
    {
      id: "island_foundation",
      name: "Foundation Hub Island",
      x: 0,
      y: 0,
      width: 1600,
      height: 1284,
      sandThickness: 20,
      sandRadius: 32,
      grassRadius: 24,
      // The Photoshop background image goes here:
      backgroundImage: "assets/roads/foundation_roads.svg",
      grid: {
        cols: 16,
        rows: 14,
        gap: 16,
        padding: 20,
      },
    },
  ],

  // Code-level Developer Grid Toggle: Set to true during layout editing; set to false for production
  showGrid: false,

  slots: [
    // TOP ROW
    {
      islandId: "island_foundation",
      buildingDataId: "foundation_6",
      id: "slot_sarkari_seva",
      col: 1,
      row: 0,
      colSpan: 3,
      rowSpan: 3,
      image: "assets/buildings/foundation_6.png",
      entrance: { x: 252, y: 244 },
    },
    {
      islandId: "island_foundation",
      buildingDataId: "foundation_10",
      id: "slot_raja_chowk",
      col: 5,
      row: 0,
      colSpan: 6,
      rowSpan: 3,
      image: "assets/buildings/foundation_10.png",
      entrance: { x: 800, y: 244 },
    },
    {
      islandId: "island_foundation",
      buildingDataId: "foundation_9",
      id: "slot_talkies_cinema",
      col: 12,
      row: 0,
      colSpan: 3,
      rowSpan: 3,
      image: "assets/buildings/foundation_9.png",
      entrance: { x: 1308, y: 244 },
    },

    // MID-LEFT
    {
      islandId: "island_foundation",
      buildingDataId: "foundation_1",
      id: "slot_chai_tapri",
      col: 1,
      row: 4,
      colSpan: 2,
      rowSpan: 2,
      image: "assets/buildings/foundation_1.png",
      entrance: { x: 232, y: 540 },
    },
    {
      islandId: "island_foundation",
      buildingDataId: "foundation_3",
      id: "slot_sabzi_mandi",
      col: 4,
      row: 4,
      colSpan: 2,
      rowSpan: 2,
      image: "assets/buildings/foundation_3.svg",
      entrance: { x: 520, y: 540 },
    },
    {
      islandId: "island_foundation",
      buildingDataId: "foundation_5",
      id: "slot_apna_mohalla",
      col: 1,
      row: 7,
      colSpan: 3,
      rowSpan: 3,
      image: "assets/buildings/foundation_5.png",
      entrance: { x: 408, y: 712 },
    },

    // MID-RIGHT
    {
      islandId: "island_foundation",
      buildingDataId: "foundation_2",
      id: "slot_city_bus_depot",
      col: 12,
      row: 4,
      colSpan: 4,
      rowSpan: 5,
      image: "assets/buildings/foundation_2.png",
      entrance: { x: 1172, y: 560 },
    },

    // BOTTOM ROW
    {
      islandId: "island_foundation",
      buildingDataId: "foundation_4",
      id: "slot_mistri_garage",
      col: 1,
      row: 11,
      colSpan: 3,
      rowSpan: 3,
      image: "assets/buildings/foundation_4.png",
      entrance: { x: 252, y: 920 },
    },
    {
      islandId: "island_foundation",
      buildingDataId: "foundation_7",
      id: "slot_janata_dawakhana",
      col: 5,
      row: 11,
      colSpan: 3,
      rowSpan: 3,
      image: "assets/buildings/foundation_7.png",
      entrance: { x: 636, y: 920 },
    },
    {
      islandId: "island_foundation",
      buildingDataId: "foundation_8",
      id: "slot_kamaal_bazar",
      col: 9,
      row: 10,
      colSpan: 6,
      rowSpan: 4,
      image: "assets/buildings/foundation_8.png",
      entrance: { x: 1164, y: 840 },
    },
  ],
};
