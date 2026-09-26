import { Object3D, Group, AnimationMixer, AnimationClip, AnimationAction, Mesh, LoopOnce, LoopRepeat } from 'three';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';
export default class ModelAsset extends Object3D {
    private _animationMixer?: AnimationMixer;
    private _animationClips?: AnimationClip[];
    private _currentAnimationAction?: AnimationAction;

    public get animationMixer(): AnimationMixer | undefined {
        return this._animationMixer;
    }

    constructor(originalModel: Group | Object3D, insideObjectName?: string, animationClips?: AnimationClip[], castShadow = true, receiveShadow = true) {
        super();

        let clonedModel: Object3D;
        if (insideObjectName) {
            const insideObject = originalModel.getObjectByName(insideObjectName) as Object3D;
            if (!insideObject) {
                throw new Error(`Object with name "${insideObjectName}" not found in the model.`);
            } else {
                clonedModel = SkeletonUtils.clone(insideObject);
                clonedModel.parent?.remove(clonedModel);
            }
        } else {
            clonedModel = SkeletonUtils.clone(originalModel);
        }

        clonedModel.traverse(child => {
            if ((child as any).isMesh) {
                const mesh = child as Mesh;

                mesh.material = Array.isArray(mesh.material)
                    ? mesh.material.map(m => m.clone())
                    : mesh.material.clone();

                mesh.castShadow = castShadow
                mesh.receiveShadow = receiveShadow;
            }
        });

        if (animationClips && animationClips.length > 0) {
            this._animationClips = animationClips;
            this._animationMixer = new AnimationMixer(clonedModel);
        }
        clonedModel.position.set(0, 0, 0);
        clonedModel.rotation.set(0, 0, 0);
        clonedModel.scale.set(1, 1, 1);
        this.add(clonedModel);
    }

    public playAnimation(animationName: string, fadeTime = 0.2, loop = true): void {
        if (!this._animationMixer || !this._animationClips) {
            console.warn('No animation mixer or clips available for this model.');
            return;
        }

        const clip = this._animationClips.find(c => c.name === animationName);
        if (!clip) {
            console.warn(`Animation clip with name "${animationName}" not found.`);
            return;
        }

        const nextAction = this._animationMixer.clipAction(clip);

        if (this._currentAnimationAction === nextAction) {
            return; // already playing
        }

        if (loop) {
            nextAction.setLoop(LoopRepeat, Infinity);
            nextAction.clampWhenFinished = false;
        } else {
            nextAction.setLoop(LoopOnce, 1);
            nextAction.clampWhenFinished = true;
        }

        nextAction.reset().setEffectiveWeight(1).fadeIn(fadeTime).play();

        if (this._currentAnimationAction) {
            this._currentAnimationAction.fadeOut(fadeTime);
        }

        this._currentAnimationAction = nextAction;
    }

    public stopAnimation(): void {
        if (this._currentAnimationAction) {
            this._currentAnimationAction.stop();
            this._currentAnimationAction = undefined;
        }
    }

    public pauseAnimation(): void {
        if (this._currentAnimationAction) {
            this._currentAnimationAction.paused = true;
        }
    }

    public resumeAnimation(): void {
        if (this._currentAnimationAction) {
            this._currentAnimationAction.paused = false;
        }
    }   
}