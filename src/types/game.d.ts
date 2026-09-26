
type ButtonsConfig = {
    addButtons: AddButtonConfig[],
    categoryMenuConfig: CategoryMenuConfig,
    assetsMenusConfig: AssetMenuConfig[],
    dayButtonConfig: UIAssetConfig,
    downloadButtonConfig: UIAssetConfig,
}

type UIAssetConfig = {
    portraitPosition: {x: number, y: number},
    portraitSize: {x: number, y: number},
    landscapePosition: {x: number, y: number},
    landscapeSize: {x: number, y: number},
}

type AddButtonConfig = {
    uiAssetConfig: UIAssetConfig,
    objectPosition: {x: number, y: number, z: number},
    buttonTexture: string,
}

type CategoryMenuConfig = {
    categoryButtons: CategoryButtonConfig[],
    uiAssetConfig: UIAssetConfig,
    buttonsData: ButtonsData,
}

type ButtonsData = {
    buttonSpacing: number,
    buttonSize: {x: number, y: number},
}

type CategoryButtonConfig = {
    categoryName: string,
    font: string,
    fontSize: number,
    buttonTexture: string,
}

type AssetMenuConfig = {
    uiAssetConfig: UIAssetConfig,
    buttonsConfig: AssetButtonConfig[],
    buttonsData: ButtonsData,
    tag: string
}

type AssetButtonConfig = {
    textureName: string,
    modelData: ModelData,
}

type ModelData = {
    modelName: string,
    parentName?: string,
    animationName?: string,
    scale: number,
    soundName: string,
}

type CollisionData = {
    center: { x: number, y: number, z: number },
    size: { x: number, y: number, z: number },
    rotation?: { x: number, y: number, z: number }
}

type ItemsData = {
    itemsID: {modelName: string, assetName: string}[],
}

type LevelBoundsData = {
    xPosition: { min: number, max: number },
    zPosition: { min: number, max: number },
    floorY: number,
    wallHeight: number,
    wallThickness: number,
    wallColor: number,
}

type GameVector3 = { x: number, y: number, z: number };

/** Ground-plane position (no `y`) - used for the character's level start position, since `y` must
 *  stay fixed at the character's fixed height for movement/collision to work correctly. */
type GameGroundPosition = { x: number, z: number };

type ObstacleMovementAxis = 'horizontal' | 'vertical' | 'circular';

type ObstacleMovementConfig = {
    axis: ObstacleMovementAxis,
    /** Max travel distance from spawn (each direction), used for 'horizontal'/'vertical' axis only. */
    distance?: number,
    /** Radius of the circular path around spawn, used for 'circular' axis only. */
    radius?: number,
    /** Linear speed (units/second) for 'horizontal'/'vertical', or angular speed (radians/second) for 'circular'. */
    speed: number,
};

type ObstacleConfig = {
    position: GameVector3,
    movement?: ObstacleMovementConfig,
    pulse?: ObstaclePulseConfig,
};

type ObstaclePulseConfig = {
    /** Scale multiplier applied to the obstacle's base scale at the peak of the pulse (e.g. 1.2 grows it 20%). */
    scale: number,
    /** Duration (seconds) of one direction of the pulse (grow or shrink); the loop yoyos between base and peak scale. */
    duration: number,
};

type RewardConfig = {
    /** Display name shown to the player on the final screen (e.g. "Glasses"). */
    name: string,
    /** Key into AssetsInlineHelper.models identifying the reward's 3D model. */
    modelId: string,
    /** Name of the bone/node on the character's rig the reward attaches to (e.g. "mixamorig:Head"). */
    boneId: string,
    /** Optional node name to extract from the model, same purpose as ModelAsset's insideObjectName. */
    insideObjectName?: string,
    /** Local position offset relative to the bone, to fine-tune placement. */
    offset?: GameVector3,
    /** Local rotation (radians) relative to the bone, to fine-tune orientation. */
    rotation?: GameVector3,
    /** Uniform scale applied to the reward model. */
    scale?: number,
};

type LevelConfig = {
    coinsToWin: number,
    /** Where the character is placed (and re-placed via _resetCharacter) at the start of this level.
     *  Ground-plane only (x/z) - the character's height (y) is fixed and set internally. */
    startPosition: GameGroundPosition,
    coinsPositions: GameVector3[],
    obstacles: ObstacleConfig[],
    /** Optional; omit or set to null for levels with no reward (final screen shows a plain "Congratulations!"). */
    reward?: RewardConfig | null,
}

export { ButtonsConfig, UIAssetConfig, AddButtonConfig, CategoryMenuConfig, CategoryButtonConfig, AssetMenuConfig, 
    AssetButtonConfig, ModelData, CollisionData, ItemsData, LevelBoundsData, GameVector3, GameGroundPosition, ObstacleMovementAxis,
    ObstacleMovementConfig, ObstacleConfig, ObstaclePulseConfig, RewardConfig, LevelConfig };