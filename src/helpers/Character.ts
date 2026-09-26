import ModelAsset from "./ModelAsset";
import CoinsCollector from "./CoinsCollector";
import { Group, Object3D, AnimationClip, Vector3, Bone } from "three";

import sound from "../utils/Sound";
import gsap from "gsap";
export default class Character extends ModelAsset {
    private _speed: number = 3;
    private _timeBetweenSteps: number = 0.35;
    private _isWalking: boolean = false;
    private _direction: Vector3 = new Vector3();
    private _coinsCollector: CoinsCollector = new CoinsCollector();
    constructor(originalModel: Group | Object3D, insideObjectName?: string, animationClips?: AnimationClip[]) {
        super(originalModel, insideObjectName, animationClips);
    }

    private _checkBones(): void {
        this.traverse(obj => {
            if ((obj as Bone).isBone) {
                console.log('Bone:', obj.name);
            }
        });
    }

    private _normalizeAngle(angle: number): number {
        return Math.atan2(Math.sin(angle), Math.cos(angle));
    }

    public get coinsCollector(): CoinsCollector {
        return this._coinsCollector;
    }

    public move(x: number, z: number, deltaNumber: number ): void {
        if (x === 0 && z === 0) return;

        if (!this._isWalking) {
            this._isWalking = true;
            this.playAnimation('Running');
            this._playWalkingSound();
        }

        this._direction.set(x, 0, z).normalize();

        const targetAngle = Math.atan2(this._direction.x, this._direction.z);

        let delta = targetAngle - this.rotation.y;
        delta = this._normalizeAngle(delta);

        this.rotation.y += delta * 0.3;

        this.position.addScaledVector(this._direction, this._speed * deltaNumber);
    }

    private _playWalkingSound(): void {
        sound.playSound('snow_step_' + (Math.floor(Math.random() * 2) + 1), false, 0.5);
        gsap.delayedCall(this._timeBetweenSteps, () => {
            this._isWalking && this._playWalkingSound();
        });
    }

    public stop(): void {
        if (this._isWalking) {
            this._isWalking = false;
            this.playAnimation('Idle_3');
        }
    }

    /** Stops the looping footstep sound without forcing an idle animation - used when the character
     *  dies, since death plays its own animation (e.g. 'dying_backwards') instead of idle. */
    public stopWalkingSound(): void {
        this._isWalking = false;
    }

    /** Forces the character back to its idle state, regardless of whatever it was doing before
     *  (e.g. mid-walk, dying). Used when repositioning the character for a fresh/restarted level. */
    public resetToIdle(): void {
        this._isWalking = false;
        this.playAnimation('Idle_3');
    }

}