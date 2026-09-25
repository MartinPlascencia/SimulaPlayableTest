import ScaledContainer from "./Scale/ScaledContainer";
import { Sprite, Text, Assets, Graphics } from "pixi.js";
export default class UITextContainer extends ScaledContainer {
    private _text!: Text;
    private _icon!: Sprite;
    private _iconSize: number = 80;
    private _fontSize: number = 55;
    constructor(fontSize?: number) {
        super();
        fontSize && (this._fontSize = fontSize);
        this._createAssets();
    }

    private _createAssets(): void {
        const background = new Graphics().roundRect(0, 0, 300, 100, 15).fill({ color: 0x000000, alpha: 0.7 });
        background.x-= background.width / 2;
        background.y-= background.height / 2;
        this.addChild(background);

        const icon = new Sprite();
        icon.x = -80;
        this.addChild(icon);
        icon.anchor.set(0.5);
        this._icon = icon;

        const coinsText = new Text({
            text: '0/0',
            style: {
                fontFamily: 'clear_sans',
                fontSize: this._fontSize,
                align: 'center',
                fill: 'white',
                dropShadow: {
                    alpha: 0.5,         
                    angle: Math.PI / 6,
                    blur: 4,
                    color: '#000000',
                    distance: 6
                }
            },
        });
        coinsText.anchor.set(1, 0.5);
        coinsText.position.set(130, 3);
        this.addChild(coinsText);
        this._text = coinsText;
    }

    public setText(value: string): void {
        this._text.text = value;
    }

    public setIcon(textureId: string): void {
        this._icon.texture = Assets.get(textureId);
        this._icon.width = this._iconSize;
        this._icon.height = this._iconSize;
    }

}