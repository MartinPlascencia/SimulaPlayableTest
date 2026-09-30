import PlaneBasicAnimations from "../../utils/PlaneBasicAnimations";
import ScaledContainer from "../Scale/ScaledContainer";
import { Text, Sprite, Assets } from "pixi.js";
import gsap from "gsap";
import localization from "../../utils/Localization";
export default class HintText extends ScaledContainer {
    private _text!: Text;
    private _background!: Sprite;
    private _hintKeys: string[] = ['hintCollectItems', 'hintCollectCoinsForChest'];
    private _hintIndex: number = -1;
    private _params?: Record<string, string | number>;
    /** Per-hint auto-hide delay (seconds) - omit a key to leave that hint visible until goToNextHint/hide is called. */
    private _autoHideDurations: Partial<Record<string, number>> = {
        hintCollectItems: 4,
        hintCollectCoinsForChest: 4,
    };
    private _autoHideTimer?: gsap.core.Tween;

    constructor(params?: Record<string, string | number>) {
        super();
        this._params = params;
        this._createAssets();
        this.alpha = 0;
    }

    private _createAssets(): void {
        this._background = new Sprite(Assets.get("hints_background"));
        this._background.anchor.set(0.5);
        this._background.alpha = 0.7;
        this.addChild(this._background);

        this._text = new Text(localization.get(this._hintKeys[this._hintIndex], undefined, this._params), {
            fontFamily: 'clear_sans',
            fontSize: 100,
            fill: 0xffffff,
            align: 'center',
            wordWrap: true,
            wordWrapWidth: this._background.width * 0.85,
            breakWords: true,
        });
        this._text.anchor.set(0.5);
        this.addChild(this._text);
    }

    public goToNextHint(): void {
        this._hintIndex++;
        if (this._hintIndex >= this._hintKeys.length) {
            this._autoHideTimer?.kill();
            PlaneBasicAnimations.unpopObject(this);
        } else {
            this.show();
        }
    }

    /** Shows the "Touch/Click and drag to Move" hint without advancing the normal hint
     *  sequence, so the queued "collect tokens" hint still plays once the player moves.
     *  Only used on the very first level, alongside the tutorial hand animation. */
    public showMoveHint(): void {
        this._autoHideTimer?.kill();
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        this._text.text = localization.get(isTouchDevice ? 'hintMoveTouch' : 'hintMoveDesktop');
        PlaneBasicAnimations.popObject(this);
    }

    /** Restarts the hint sequence from the beginning, e.g. when a new level starts. */
    public reset(params?: Record<string, string | number>): void {
        this._autoHideTimer?.kill();
        this._params = params;
        this._hintIndex = -1;
        this.alpha = 0;
    }

    public show(): void {
        this._autoHideTimer?.kill();
        const hintKey = this._hintKeys[this._hintIndex];
        this._text.text = localization.get(hintKey, undefined, this._params);
        PlaneBasicAnimations.popObject(this);

        const autoHideDelay = this._autoHideDurations[hintKey];
        if (autoHideDelay !== undefined) {
            this._autoHideTimer = gsap.delayedCall(autoHideDelay, () => {
                PlaneBasicAnimations.unpopObject(this);
            });
        }
    }

    /** Hides the hint immediately, e.g. when the lose screen appears. */
    public hide(): void {
        this._autoHideTimer?.kill();
        this.alpha = 0;
    }
}