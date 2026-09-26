import { LevelConfig } from '../types/game';

// Each level defines its own win condition, the character's starting spot
// (`startPosition`, applied on level start/restart instead of a hardcoded
// spawn - ground-plane x/z only, height is fixed internally so movement/
// collision keep working correctly), exact coin spawn spots, obstacle spots
// (each with an optional movement config: axis 'horizontal'/x or
// 'vertical'/z, a max travel distance, and a speed - omit `movement` for a
// static obstacle - plus an optional `pulse` config: a looping grow/shrink
// scale tween, `scale` is the peak multiplier and `duration` is the time in
// seconds for one direction of the loop, omit `pulse` for no animation) and
// reward. `reward` identifies the model to attach (AssetsInlineHelper alias),
// the bone/node on the character's rig it attaches to, a display `name`
// shown on the final screen ("Congratulations! You got {name}!"), and
// optional offset/rotation/scale to fit it in place - RewardManager attaches
// it when the level finishes. `reward` is optional; omit it or set it to
// null for levels with no reward (final screen just shows "Congratulations!").
// Add more entries here to add more levels; LevelManager walks through them
// in order.
const levels: LevelConfig[] = [
    {
        coinsToWin: 5,
        startPosition: { x: 2.2, z: 8 },
        coinsPositions: [
            { x: -4.5, y: 2, z: 3.5 },
            { x: 3, y: 2, z: 4.5 },
            { x: -1, y: 2, z: 6.5 },
            { x: -4, y: 2, z: 9.5 },
            { x: 3.5, y: 2, z: 9.5 },
        ],
        obstacles: [
            { position: { x: 1, y: 2, z: 3 } },
            { position: { x: -2.5, y: 2, z: 8 } },
            { position: { x: 5, y: 2, z: 6.5 } },
        ],
        reward: { name: "Glasses", modelId: "glasses", boneId: "headfront", scale: 1, offset: { x: 0, y: 0, z: -0.33 }, rotation: { x: -89.5, y: 0, z: 0 } }, // glasses.glb is already lightweight (45KB, no textures); tune scale/offset/rotation in-engine to fit
    },
    {
        coinsToWin: 10,
        startPosition: { x: 2.2, z: 8 },
        coinsPositions: [
            { x: -4.5, y: 2, z: 3.5 },
            { x: 3, y: 2, z: 4.5 },
            { x: -1, y: 2, z: 6.5 },
            { x: -4, y: 2, z: 9.5 },
            { x: 3.5, y: 2, z: 9.5 },
            { x: -6.5, y: 2, z: 1 },
            { x: 5.5, y: 2, z: 1 },
            { x: 0, y: 2, z: 1 },
            { x: -6.5, y: 2, z: 11.5 },
            { x: 5.5, y: 2, z: 11.5 },
        ],
        obstacles: [
            { position: { x: 1, y: 2, z: 2 }, movement: { axis: 'horizontal', distance: 2.5, speed: 1.5 }},
            { position: { x: -3, y: 2, z: 8 }, movement: { axis: 'horizontal', distance: 2.5, speed: 1.5 } },
            { position: { x: -6, y: 2, z: 6 }, movement: { axis: 'vertical', distance: 3, speed: 1.3 } },
            { position: { x: 5, y: 2, z: 6 }, movement: { axis: 'vertical', distance: 3, speed: 1.3 } },
        ],
        reward: { name: "Hat", modelId: "hat", boneId: "headfront", scale: 0.25, offset: { x: 0, y: -0.4, z: -0.5 }, rotation: { x: -89.5, y: 0, z: 0 } }, // hat.glb's raw mesh is ~4 units across; tune scale/offset/rotation in-engine to fit
    },
    {
        coinsToWin: 12,
        startPosition: { x: 2.2, z: 8 },
        coinsPositions: [
            { x: -4.5, y: 2, z: 3.5 },
            { x: 3, y: 2, z: 4.5 },
            { x: -1, y: 2, z: 6.5 },
            { x: -4, y: 2, z: 9.5 },
            { x: 3.5, y: 2, z: 9.5 },
            { x: -6.5, y: 2, z: 1 },
            { x: 5.5, y: 2, z: 1 },
            { x: 0, y: 2, z: 1 },
            { x: -6.5, y: 2, z: 11.5 },
            { x: 5.5, y: 2, z: 11.5 },
            { x: -1, y: 2, z: 11.5 },
            { x: 1.5, y: 2, z: 1 },
        ],
        obstacles: [
            { position: { x: 1, y: 2, z: 2 }, movement: { axis: 'horizontal', distance: 2.5, speed: 2 } },
            { position: { x: -3, y: 2, z: 8 }, movement: { axis: 'horizontal', distance: 2.5, speed: 2 } },
            { position: { x: -6, y: 2, z: 6 }, movement: { axis: 'vertical', distance: 3, speed: 1.8 } },
            { position: { x: 5, y: 2, z: 6 }, movement: { axis: 'vertical', distance: 3, speed: 1.8 } },
            { position: { x: 0, y: 2, z: 9 }, movement: { axis: 'circular', radius: 1.5, speed: 1.6 } },
            { position: { x: -1, y: 2, z: 2 }, movement: { axis: 'circular', radius: 1.5, speed: 1.6 } },
        ],
        reward: null, // TODO: assign a distinct reward model once one exists; final screen shows a plain "Congratulations!" for now
    },
];

export default levels;
