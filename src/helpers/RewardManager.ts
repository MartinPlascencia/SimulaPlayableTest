import { Object3D, Vector3 } from 'three';
import ModelAsset from './ModelAsset';
import AssetsInlineHelper from './AssetsInlineHelper';
import { RewardConfig } from '../types/game';

/* ---------------------------------------------------
   REWARD MANAGER

   Attaches a level's configured reward (LevelConfig.reward)
   to a bone/node on the character's rig when the level is
   completed. Each reward config picks the model to attach
   (AssetsInlineHelper alias), the bone/node name to parent
   it to, and optional offset/rotation/scale to fit it.
--------------------------------------------------- */
export default class RewardManager {
    private _assetsInlineHelper: AssetsInlineHelper;
    private _currentReward?: ModelAsset;

    constructor(assetsInlineHelper: AssetsInlineHelper) {
        this._assetsInlineHelper = assetsInlineHelper;
    }

    /** Attaches the given reward's model to the matching bone/node on the character. Replaces any reward already attached. No-op if `reward` is null/undefined. */
    public attachReward(reward: RewardConfig | null | undefined, character: Object3D): void {
        //this.clearReward();

        if (!reward) {
            return;
        }

        const modelEntry = this._assetsInlineHelper.models[reward.modelId];
        if (!modelEntry) {
            console.warn(`RewardManager: model "${reward.modelId}" not found in assets.`);
            return;
        }

        const bone = character.getObjectByName(reward.boneId);
        if (!bone) {
            console.warn(`RewardManager: bone/node "${reward.boneId}" not found on character.`);
            return;
        }

        const rewardModel = new ModelAsset(modelEntry.model, reward.insideObjectName);

        // Characters/rigs are often authored at a different internal scale than
        // the reward model (e.g. the fox's whole hierarchy is wrapped in a 0.01
        // scale). Attaching directly as a child would silently inherit that
        // scale, so offset/scale here are compensated to represent real,
        // intuitive world-space units regardless of the bone's rig scale.
        character.updateWorldMatrix(true, true);
        const boneWorldScale = new Vector3();
        bone.getWorldScale(boneWorldScale);

        const offset = reward.offset ?? { x: 0, y: 0, z: 0 };
        rewardModel.position.set(offset.x / boneWorldScale.x, offset.y / boneWorldScale.y, offset.z / boneWorldScale.z);

        const rotation = reward.rotation ?? { x: 0, y: 0, z: 0 };
        rewardModel.rotation.set(rotation.x, rotation.y, rotation.z);

        const scale = reward.scale ?? 1;
        rewardModel.scale.set(scale / boneWorldScale.x, scale / boneWorldScale.y, scale / boneWorldScale.z);

        bone.add(rewardModel);
        this._currentReward = rewardModel;
    }

    /** Removes the currently attached reward, if any (e.g. when clearing a level, or before attaching a new one). */
    public clearReward(): void {
        if (this._currentReward) {
            this._currentReward.parent?.remove(this._currentReward);
            this._currentReward = undefined;
        }
    }
}
