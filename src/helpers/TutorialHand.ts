import { Sprite, Assets, Container } from 'pixi.js';
import gsap from 'gsap';
import ScaledSprite from './Scale/ScaledSprite';

/* ---------------------------------------------------
   TUTORIAL HAND

   Drag-gesture hint sprite ('hand' texture) that moves between
   a list of target objects, wiggling (scale pulse) at each one,
   looping until cancelTutorial() is called. Uses the same
   Scaler pattern as the rest of GameUI (see ScaledSprite) for
   its size, since the hand itself doesn't move via scaler screen
   positions - its position is driven by showTutorialObjects()/
   gsap instead, so scaler.ignorePosition is set. Configure its
   on-screen size via `scaler.setPortraitScreenSize`/
   `setLandscapeScreenSize` from the creating code (see GameUI).
--------------------------------------------------- */
export default class TutorialHand extends ScaledSprite {
    private _running = false;
    private _animationSpeed = 1;
    private _scaleFactor = 1.2;

    constructor(texture: string) {
        super(Assets.get(texture));
        this.anchor.set(0.1);
        this.alpha = 0;
        this.scaler.ignorePosition = true;
    }

    public get running(): boolean {
        return this._running;
    }

    public async showTutorialObjects(objects: (Sprite | Container)[], delay: number = 0, parent?: boolean): Promise<void> {
        await gsap.delayedCall(delay,() => {});
        if (this._running) return;
        this._running = true;
        const firstObject = objects[0];
        const startPosition = parent ? firstObject.getGlobalPosition() : firstObject.position;
        this.position.set(startPosition.x, startPosition.y);
        await gsap.to(this, { alpha: 1, duration: 0.5 });

        while (this._running) {
            for (const object of objects) {
                if (!this._running) break;
                await this._moveToObject(object, parent);
            }
        }

        await gsap.to(this, { alpha: 0, duration: 0.5 });
    }

    public cancelTutorial(): void {
        this._running = false;
        gsap.killTweensOf(this);
        gsap.to(this, { alpha: 0, duration: 0.5 });
    }

    private _moveToObject(object: Sprite | Container, parent?: boolean): Promise<void> {
        return new Promise((resolve) => {
            const objectPosition = parent ? object.getGlobalPosition() : object.position;
            if (this.x == objectPosition.x && this.y == objectPosition.y) {
                this._wiggleObject(object);
                resolve();
                return;
            }
            gsap.to(this, {
                x: objectPosition.x,
                y: objectPosition.y,
                delay: 0.5,
                duration: this._animationSpeed,
                ease: 'power1.inOut',
                onComplete: () => {
                    if (this._running) this._wiggleObject(object);
                    resolve();
                }
            });
        });
    }

    private _wiggleObject(object: Sprite | Container): void {
        gsap.killTweensOf(object.scale);
        gsap.to(object.scale, {
            x: object.scale.x * this._scaleFactor,
            y: object.scale.y * this._scaleFactor,
            duration: 0.2,
            yoyo: true,
            repeat: 1
        });
    }
}

