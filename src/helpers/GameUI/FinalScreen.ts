import ScaledContainer from "../Scale/ScaledContainer";
import { Text, Graphics, Container, Sprite, Assets } from "pixi.js";

import { sdk } from '@smoud/playable-sdk';
import PlaneBasicAnimations from "../../utils/PlaneBasicAnimations";
import gsap from "gsap";
import sound from "../../utils/Sound";
export default class FinalScreen extends ScaledContainer {
    private _continueButton!: Container;
    private _secondsToContinue: number = 4;
    constructor() {
        super();
        this._createBackground();
        this._createFinalText();
        this._createContinueButton();
    }

    private _createBackground(): void {
        const width = 400;
        const height = 350;
        const frame = new Graphics().roundRect(-width * 0.5, -height * 0.5, width, height, 25).fill(0x000000, 0.85);
        this.addChild(frame);
    }

    public show(): void {
        sdk.finish();
        sound.playSound("collect");
        this.alpha = 1;
        PlaneBasicAnimations.popObject(this);
        this._continueButton.alpha = 0;
        gsap.delayedCall(0.5, () => {
            this.eventMode = 'static';
            this._continueButton.alpha = 1;
            PlaneBasicAnimations.popObject(this._continueButton);
        });

        gsap.delayedCall(this._secondsToContinue, () => {
            sdk.install();
        });
    }

    public hide(): void {
        this.eventMode = 'none';
        this.alpha = 0;
    }

    private _createFinalText(): void {
        const finalText = new Sprite(Assets.get('final_text'));
        finalText.y = -75;
        finalText.anchor.set(0.5);
        this.addChild(finalText);
    }

    private _createContinueButton(): void {
        const buttonWidth = 250;
        const buttonHeight = 70;
        const continueButton = new Container();
        const buttonBackground = new Graphics().roundRect(-buttonWidth * 0.5, -buttonHeight * 0.5, buttonWidth, buttonHeight, 20).fill(0xd7fc51);
        continueButton.addChild(buttonBackground);

        const buttonText = new Text('Активувати', {
            fontFamily: 'clear_sans',
            fontSize: 32,
            fill: 'black',
            align: 'center'
        });
        buttonText.anchor.set(0.5);
        continueButton.addChild(buttonText);
        continueButton.y = 75;
        continueButton.eventMode = 'static';
        continueButton.on('pointerdown', this._onContinueButtonClick.bind(this));
        this.addChild(continueButton);
        this._continueButton = continueButton;
    }

    private _onContinueButtonClick(): void {
        PlaneBasicAnimations.animateButton(this._continueButton, () => {
            sdk.install();
        }, true);
    }
}