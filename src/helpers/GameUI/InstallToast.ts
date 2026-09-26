import ScaledContainer from "../Scale/ScaledContainer";
import ScaledText from "../Scale/ScaledText";
import { Graphics } from "pixi.js";

import gsap from "gsap";
import PlaneBasicAnimations from "../../utils/PlaneBasicAnimations";
import localization from "../../utils/Localization";

/* ---------------------------------------------------
   INSTALL TOAST

   Small top-center banner shown briefly whenever a CTA
   (download button, final/lose screen buttons, etc.)
   triggers the 'install' flow, to reassure the player
   something happened while the store redirect kicks in.
   Auto-hides itself after `_visibleDuration` seconds.
--------------------------------------------------- */
export default class InstallToast extends ScaledContainer {
    private _text!: ScaledText;
    private _visibleDuration: number = 2.5;
    private _hideTween?: gsap.core.Tween;

    constructor() {
        super();
        this._createBackground();
        this._createText();
        this.alpha = 0;
    }

    private _createBackground(): void {
        const width = 340;
        const height = 60;
        const frame = new Graphics().roundRect(-width * 0.5, -height * 0.5, width, height, 16).fill(0x000000, 0.75);
        this.addChild(frame);
    }

    private _createText(): void {
        const text = new ScaledText({
            text: localization.get('installToast'),
            style: {
                fontFamily: 'clear_sans',
                fontSize: 26,
                fill: 'white',
                align: 'center',
            },
        });
        text.anchor.set(0.5);
        this.addChild(text);
        this._text = text;
    }

    public show(): void {
        this._text.text = localization.get('installToast');
        this._hideTween?.kill();
        gsap.killTweensOf(this.scale);
        PlaneBasicAnimations.popObject(this);
        this._hideTween = gsap.delayedCall(this._visibleDuration, () => {
            PlaneBasicAnimations.unpopObject(this);
        });
    }
}
