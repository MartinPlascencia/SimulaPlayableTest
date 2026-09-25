import PlaneBasicAnimations from "../utils/PlaneBasicAnimations";
import ModelAsset from "./ModelAsset";
import { AnimationClip, Group, Object3D } from "three";
export default class extends ModelAsset {
    private _rotationSpeed: number = 2;
    private _grabRange: number = 1;
    constructor(originalModel: Group | Object3D, insideObjectName?: string, animationClips?: AnimationClip[]) {
        super(originalModel, insideObjectName, animationClips);
        this.scale.set(1.3, 1.3, 1.3);
    }

    public activate(): void {
        this.visible = true;
        PlaneBasicAnimations.popObject3D(this);
    }

    public rotate(delta: number): void {
        this.rotation.y += delta * this._rotationSpeed;
    }

    public isInGrabRange(characterPosition: Object3D): boolean {
        const distance = this.position.distanceTo(characterPosition.position);
        return distance <= this._grabRange;
    }
}