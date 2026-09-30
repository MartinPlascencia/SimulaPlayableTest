import ModelAsset from "./ModelAsset";
import { Group, Object3D, AnimationClip, Vector3 } from "three";
import gsap from "gsap";
/** Points at level objectives (e.g. the next coin) by hovering above a list of waypoints,
 *  bobbing/spinning in place. For the arrow that follows the player and points at the reward
 *  chest, see CompassArrow. */
export default class Arrow extends ModelAsset {
    private _goPositions: Vector3[] = [];
    private _positionIndex: number = 0;
    private _animatingTween?: gsap.core.Tween;
    private _grabRange: number = 1.5;
    constructor(originalModel: Group | Object3D, insideObjectName?: string, animationClips?: AnimationClip[]) {
        super(originalModel, insideObjectName, animationClips);
    }

    public set goPositions(positions: Vector3[]) {
        this._goPositions = positions;
        this._positionIndex = -1;
        this.goToNextPosition();
    }

    public goToNextPosition(): void {
        this._positionIndex++;
        this._stopAnimation();
        if (this._positionIndex >= this._goPositions.length) {
            this.visible = false;
            return;
        }

        const nextPosition = this._goPositions[this._positionIndex];
        this.position.set(nextPosition.x, nextPosition.y, nextPosition.z);
        this.animate();
    }

    /** Hides the arrow immediately and stops its bob/spin animation, without waiting to run out of waypoints. */
    public hide(): void {
        this._stopAnimation();
        this.visible = false;
    }

    /** Shows the arrow again pointing at a new target position (e.g. the reward chest once coins are complete),
     *  bypassing the goPositions waypoint list. */
    public show(position: Vector3): void {
        this._stopAnimation();
        this.position.copy(position);
        this.visible = true;
        this.animate();
    }

    private _stopAnimation(): void {    
        if (this._animatingTween) {
            this._animatingTween.kill();
            this._animatingTween = undefined;
        }
    }

    public animate(): void {
        this._animatingTween = gsap.to(this.position, {
            y: this.position.y + 0.5,
            repeat: -1,
            yoyo: true,
            duration: 0.5,
            onUpdate: () => {
                this.rotateY(0.02);
            }
        });
    }

    public isInGrabRange(characterPosition: Object3D): boolean {
        const distance = this.position.distanceTo(characterPosition.position);
        return distance <= this._grabRange;
    }
    
}