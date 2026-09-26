import { Container, Graphics, Application } from "pixi.js";
import gsap from "gsap";
import eventsSystem from "../utils/EventsSystem";
export default class Effects extends Container {
    private _fade!: Graphics;
    private _damageFade!: Graphics;
    constructor(app: Application) {
        super();
        this._createFade(app);
        this._createDamageFade(app);
        app.stage.addChild(this);
        this._addEvents();
    }

    private _createFade(app: Application): void {
        const fade = new Graphics().rect(0, 0, app.screen.width, app.screen.height).fill(0xffffff);
        this.addChild(fade);
        fade.alpha = 0;
        this._fade = fade;
    }

    private _createDamageFade(app: Application): void {
        const damageFade = new Graphics().rect(0, 0, app.screen.width, app.screen.height).fill(0xff0000);
        this.addChild(damageFade);
        damageFade.alpha = 0;
        this._damageFade = damageFade;
    }

    private _addEvents(): void {
        eventsSystem.on('fadeOut', this.fadeOut.bind(this));
        eventsSystem.on('fadeIn', this.fadeIn.bind(this));
        eventsSystem.on('damageFadeOut', this.damageFadeOut.bind(this));
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

    /** Flashes a red rectangle over the screen (fade in, hold, fade out) to signal damage/death. */
    public damageFadeOut(fadeInDuration: number = 0.15, holdDuration: number = 0.1, fadeOutDuration: number = 0.5): void {
        gsap.killTweensOf(this._damageFade);
        const tl = gsap.timeline();
        tl.to(this._damageFade, { alpha: 0.6, duration: fadeInDuration, ease: 'linear' });
        tl.to(this._damageFade, { alpha: 0.6, duration: holdDuration });
        tl.to(this._damageFade, { alpha: 0, duration: fadeOutDuration, ease: 'linear' });
    }
}