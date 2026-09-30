import ModelAsset from "./ModelAsset";
import { Group, Object3D, AnimationClip, Vector3 } from "three";

/** Floats above the followed character's head, continuously pointing towards a world-space
 *  target (e.g. the reward chest once all coins are collected). For the arrow that points at
 *  level objectives like the next coin, see Arrow. */
export default class CompassArrow extends ModelAsset {
    private _followTarget?: Object3D;
    private _followOffset: Vector3 = new Vector3();
    private _pointTarget?: Vector3;

    constructor(originalModel: Group | Object3D, insideObjectName?: string, animationClips?: AnimationClip[]) {
        super(originalModel, insideObjectName, animationClips);
    }

    /** Shows the arrow floating above the given character (e.g. the player), continuously pointing towards
     *  `target` (e.g. the reward chest) in world space - a compass hint shown once all coins are collected.
     *  Call `hide()` once the player reaches the target to stop following. Update every frame via `updateFollow()`. */
    public showAboveCharacter(character: Object3D, target: Vector3, heightOffset: number = 1.6): void {
        this._followTarget = character;
        this._followOffset.set(0, heightOffset, -0.5);
        this._pointTarget = target.clone();
        this.visible = true;
        // 'YXZ' applies the tilt (x) first and the yaw (y) last/outermost, so the per-frame
        // yaw update in updateFollow() spins cleanly around world Y instead of dragging the
        // tilt around in a cone (which is what the default 'XYZ' order was doing).
        this.rotation.order = "YXZ";
        // Corrects the model's tip-down rest orientation so it faces the target horizontally.
        this.rotation.x = -Math.PI / 2;
        this.updateFollow();
    }

    /** Keeps the arrow positioned above its followed character (see showAboveCharacter) and rotated to face
     *  its point target. No-op unless showAboveCharacter is active. Call once per frame from the game loop. */
    public updateFollow(): void {
        if (!this._followTarget || !this._pointTarget) return;

        this.position.copy(this._followTarget.position).add(this._followOffset);

        const dx = this._pointTarget.x - this.position.x;
        const dz = this._pointTarget.z - this.position.z;
        if (Math.abs(dx) > 1e-5 || Math.abs(dz) > 1e-5) {
            this.rotation.y = Math.atan2(dx, dz);
        }
    }

    /** Hides the arrow and stops following/pointing, so a fresh showAboveCharacter() call is needed to resume. */
    public hide(): void {
        this._followTarget = undefined;
        this._pointTarget = undefined;
        this.visible = false;
    }
}
