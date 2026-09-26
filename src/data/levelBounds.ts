// Configures the playable area walls (see helpers/LevelWalls.ts).
// Change xPosition/zPosition to resize the enclosed area without touching any code.
export default {
    xPosition: { min: -8, max: 10 },
    zPosition: { min: -8, max: 13 },
    floorY: 1,
    wallHeight: 3,
    wallThickness: 1,
    wallColor: 0x6839B8, // slightly darker variation of the floor's #7845D8 purple
};
