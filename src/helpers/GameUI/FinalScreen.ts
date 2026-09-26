import ScaledContainer from "../Scale/ScaledContainer";
import { Text, Graphics, Container, Sprite, Assets } from "pixi.js";

import { sdk } from '@smoud/playable-sdk';
import PlaneBasicAnimations from "../../utils/PlaneBasicAnimations";
import gsap from "gsap";
import sound from "../../utils/Sound";
import eventsSystem from "../../utils/EventsSystem";
import localization from "../../utils/Localization";
export default class FinalScreen extends ScaledContainer {
    private _continueButton!: Container;
    private _continueButtonText!: Text;
    private _finalText!: Text;
    private _isLastLevel: boolean = true;
    private _hasContinued: boolean = false;
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

    public show(isLastLevel: boolean = true, rewardName?: string | null): void {
        this._isLastLevel = isLastLevel;
        this._continueButtonText.text = isLastLevel ? 'Accept' : 'Next Level';
        this._finalText.text = rewardName
            ? localization.get('finalScreenWithReward', undefined, { reward: rewardName })
            : localization.get('finalScreenNoReward');
        if (isLastLevel) {
            sdk.finish();
        }
        sound.playSound("collect");
        this.alpha = 1;
        PlaneBasicAnimations.popObject(this);
        this._continueButton.alpha = 0;
        gsap.delayedCall(0.5, () => {
            this.eventMode = 'static';
            this._continueButton.alpha = 1;
            PlaneBasicAnimations.popObject(this._continueButton);
        });

        this._hasContinued = false;
    }

    public hide(): void {
        this.eventMode = 'none';
        this.alpha = 0;
    }

    /** Advances to the next level (or finishes/installs on the last level). Guarded against firing twice,
     *  since the button-click animation delays the actual call and a fast double-tap could otherwise
     *  trigger it twice. */
    private _continue(): void {
        if (this._hasContinued) return;
        this._hasContinued = true;
        if (this._isLastLevel) {
            eventsSystem.emit('install');
        } else {
            eventsSystem.emit('nextLevel');
        }
    }

    private _createFinalText(): void {
        const finalText = new Text('Congratulations!', {
            fontFamily: 'clear_sans',
            fontSize: 36,
            fill: 'white',
            align: 'center',
            wordWrap: true,
            wordWrapWidth: 350,
        });
        finalText.y = -75;
        finalText.anchor.set(0.5);
        this.addChild(finalText);
        this._finalText = finalText;
    }

    private _createContinueButton(): void {
        const buttonWidth = 250;
        const buttonHeight = 70;
        const continueButton = new Container();
        const buttonBackground = new Graphics().roundRect(-buttonWidth * 0.5, -buttonHeight * 0.5, buttonWidth, buttonHeight, 20).fill(0xF58324);
        continueButton.addChild(buttonBackground);

        const buttonText = new Text('Accept', {
            fontFamily: 'clear_sans',
            fontSize: 32,
            fill: 'white',
            align: 'center'
        });
        buttonText.anchor.set(0.5);
        continueButton.addChild(buttonText);
        this._continueButtonText = buttonText;
        continueButton.y = 75;
        continueButton.eventMode = 'static';
        continueButton.on('pointerdown', this._onContinueButtonClick.bind(this));
        this.addChild(continueButton);
        this._continueButton = continueButton;
    }

    private _onContinueButtonClick(): void {
        PlaneBasicAnimations.animateButton(this._continueButton, () => {
            this._continue();
        }, true);
    }
}