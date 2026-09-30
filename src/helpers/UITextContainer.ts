import ScaledContainer from "./Scale/ScaledContainer";
import { Sprite, Text, Assets, Graphics } from "pixi.js";
import gsap from "gsap";

/* ---------------------------------------------------
   UI TEXT CONTAINER

   Coin counter widget: icon + "coins / max" text, plus a
   progress bar that fills up as coins are collected. The
   bar's fill step is driven entirely by maxCoins (set via
   setProgress), so it automatically adapts to each level's
   coinsToWin without any extra configuration.
--------------------------------------------------- */
export default class UITextContainer extends ScaledContainer {
    private _text!: Text;
    private _icon!: Sprite;
    private _iconSize: number = 80;
    private _fontSize: number = 55;
    private _barTrack!: Graphics;
    private _barFill!: Graphics;
    private readonly _barWidth: number = 260;
    private readonly _barHeight: number = 16;
    private readonly _barY: number = 40;
    private _progress: { value: number } = { value: 0 };
    private _progressTween?: gsap.core.Tween;

    constructor(fontSize?: number) {
        super();
        fontSize && (this._fontSize = fontSize);
        this._createAssets();
    }

    private _createAssets(): void {
        const background = new Graphics().roundRect(0, 0, 300, 130, 15).fill({ color: 0x000000, alpha: 0.7 });
        background.x-= background.width / 2;
        background.y-= background.height / 2;
        this.addChild(background);

        const icon = new Sprite();
        icon.x = -80;
        icon.y = -15;
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
        coinsText.position.set(130, -12);
        this.addChild(coinsText);
        this._text = coinsText;

        this._barTrack = new Graphics()
            .roundRect(-this._barWidth * 0.5, this._barY - this._barHeight * 0.5, this._barWidth, this._barHeight, this._barHeight * 0.5)
            .fill({ color: 0xffffff, alpha: 0.25 });
        this.addChild(this._barTrack);

        this._barFill = new Graphics();
        this.addChild(this._barFill);
    }

    public setText(value: string): void {
        this._text.text = value;
    }

    public setIcon(textureId: string): void {
        this._icon.texture = Assets.get(textureId);
        this._icon.width = this._iconSize;
        this._icon.height = this._iconSize;
    }

    /** Updates the progress bar fill for `coins` out of `maxCoins`. Animates smoothly when the ratio
     *  increases (collecting coins), but snaps instantly when it decreases (e.g. coins reset to 0 at
     *  the start of a level or after being delivered to the reward chest), avoiding an odd "drain" animation. */
    public setProgress(coins: number, maxCoins: number): void {
        const ratio = maxCoins > 0 ? Math.min(Math.max(coins / maxCoins, 0), 1) : 0;
        this._progressTween?.kill();

        if (ratio < this._progress.value) {
            this._progress.value = ratio;
            this._drawFill();
            return;
        }

        this._progressTween = gsap.to(this._progress, {
            value: ratio,
            duration: 0.3,
            ease: 'power2.out',
            onUpdate: () => this._drawFill(),
        });
    }

    private _drawFill(): void {
        const fillWidth = this._barWidth * this._progress.value;
        this._barFill.clear();
        if (fillWidth > 0) {
            this._barFill
                .roundRect(-this._barWidth * 0.5, this._barY - this._barHeight * 0.5, fillWidth, this._barHeight, this._barHeight * 0.5)
                .fill(0xF58324);
        }
    }

}