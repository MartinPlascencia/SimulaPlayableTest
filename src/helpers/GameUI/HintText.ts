import PlaneBasicAnimations from "../../utils/PlaneBasicAnimations";
import ScaledContainer from "../Scale/ScaledContainer";
import { Text, Sprite, Assets } from "pixi.js";
import localization from "../../utils/Localization";
export default class HintText extends ScaledContainer {
    private _text!: Text;
    private _background!: Sprite;
    private _hintKeys: string[] = ['hintCollectItems', 'hintCollectCoinsForChest'];
    private _hintIndex: number = -1;
    private _params?: Record<string, string | number>;

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
        });
        this._text.anchor.set(0.5);
        this.addChild(this._text);
    }

    public goToNextHint(): void {
        this._hintIndex++;
        if (this._hintIndex >= this._hintKeys.length) {
            PlaneBasicAnimations.unpopObject(this);
        } else {
            this.show();
        }
    }

    /** Restarts the hint sequence from the beginning, e.g. when a new level starts. */
    public reset(params?: Record<string, string | number>): void {
        this._params = params;
        this._hintIndex = -1;
        this.alpha = 0;
    }

    public show(): void {
        this._text.text = localization.get(this._hintKeys[this._hintIndex], undefined, this._params);
        PlaneBasicAnimations.popObject(this);
    }

    /** Hides the hint immediately, e.g. when the lose screen appears. */
    public hide(): void {
        this.alpha = 0;
    }
}