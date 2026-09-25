import { Sprite, Assets, Container, Point } from 'pixi.js';
import gsap from 'gsap';

export default class TutorialHand extends Sprite {
    private _running = false;
    private _animationSpeed = 1;
    private _scaleFactor = 1.2;
    private _portraitScale = 0.6;
    private _landscapeScale = 0.9;

    constructor(texture: string) {
        super(Assets.get(texture));
        this.anchor.set(0.1);
        this.alpha = 0;
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

    public resize(width: number, height: number): void {
        width > height ? this.scale.set(this._landscapeScale) : this.scale.set(this._portraitScale);
    }
}
