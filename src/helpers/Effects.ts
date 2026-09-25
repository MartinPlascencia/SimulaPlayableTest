import { Container, Graphics, Application } from "pixi.js";
import gsap from "gsap";
export default class Effects extends Container {
    private _fade!: Graphics;
    constructor(app: Application) {
        super();
        this._createFade(app);
        app.stage.addChild(this);
    }

    private _createFade(app: Application): void {
        const fade = new Graphics().rect(0, 0, app.screen.width, app.screen.height).fill(0xffffff);
        this.addChild(fade);
        fade.alpha = 0;
        this._fade = fade;
    }

    public fadeOut(duration: number = 0.4, callback: (() => void) | undefined = undefined): void {
        gsap.to(this._fade, { 
            alpha: 1, 
            duration: duration, 
            ease: 'linear',
            onComplete: () => {
                if (callback !== undefined) {
                    callback();
                }
            }
        });
    }

    public fadeIn(duration: number = 0.4): void {
        this._fade.alpha = 1;
        gsap.to(this._fade, { alpha: 0, duration: duration, ease: 'linear' });
    }
}