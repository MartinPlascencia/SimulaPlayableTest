import ModelAsset from "./ModelAsset";
import { Group, Object3D, AnimationClip, Vector3 } from "three";
import gsap from "gsap";
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