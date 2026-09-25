import PlaneBasicAnimations from "../../utils/PlaneBasicAnimations";
import ScaledContainer from "../Scale/ScaledContainer";
import { Text, Sprite, Assets } from "pixi.js";
import localization from "../../utils/Localization";
export default class HintText extends ScaledContainer {
    private _text!: Text;
    private _background!: Sprite;
    private _hintKeys: string[] = ['hintCollectItems', 'hintExchangeCoins', 'hintCollectCoinsForSlot'];
    private _hintIndex: number = -1;
    constructor() {
        super();
        this._createAssets();
        this.alpha = 0;
    }

    private _createAssets(): void {
        this._background = new Sprite(Assets.get("hints_background"));
        this._background.anchor.set(0.5);
        this._background.alpha = 0.7;
        this.addChild(this._background);

        this._text = new Text(localization.get(this._hintKeys[this._hintIndex]), {
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

    public show(): void {
        this._text.text = localization.get(this._hintKeys[this._hintIndex]);
        PlaneBasicAnimations.popObject(this);
    }
}