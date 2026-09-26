import ScaledContainer from "../Scale/ScaledContainer";
import { Text, Graphics, Container } from "pixi.js";

import { sdk } from '@smoud/playable-sdk';
import PlaneBasicAnimations from "../../utils/PlaneBasicAnimations";
import sound from "../../utils/Sound";
import eventsSystem from "../../utils/EventsSystem";

/* ---------------------------------------------------
   LOSE SCREEN

   Modeled after FinalScreen: shows a "You Lose" message
   with two actions - Restart (emits 'restartLevel' so
   MainScene rebuilds the current level from scratch) and
   "Go to Scrambly" (same install/store redirect used by
   FinalScreen's continue button). Not wired into GameUI
   yet - to be hooked up once the lose condition exists.
--------------------------------------------------- */
export default class LoseScreen extends ScaledContainer {
    private _restartButton!: Container;
    private _installButton!: Container;
    private _loseText!: Text;
    constructor() {
        super();
        this._createBackground();
        this._createLoseText();
        this._createRestartButton();
        this._createInstallButton();
    }

    private _createBackground(): void {
        const width = 400;
        const height = 350;
        const frame = new Graphics().roundRect(-width * 0.5, -height * 0.5, width, height, 25).fill(0x000000, 0.85);
        this.addChild(frame);
    }

    public show(): void {
        sound.playSound("collect");
        this.alpha = 1;
        PlaneBasicAnimations.popObject(this);
        this._restartButton.alpha = 0;
        this._installButton.alpha = 0;
        this.eventMode = 'static';
        PlaneBasicAnimations.popObject(this._restartButton);
        PlaneBasicAnimations.popObject(this._installButton);
        this._restartButton.alpha = 1;
        this._installButton.alpha = 1;
    }

    public hide(): void {
        this.eventMode = 'none';
        this.alpha = 0;
    }

    private _createLoseText(): void {
        const loseText = new Text('You Lose', {
            fontFamily: 'clear_sans',
            fontSize: 45,
            fill: 'white',
            align: 'center'
        });
        loseText.y = -100;
        loseText.anchor.set(0.5);
        this.addChild(loseText);
        this._loseText = loseText;
    }

    private _createRestartButton(): void {
        const restartButton = this._createButton('Restart', this._onRestartButtonClick.bind(this));
        restartButton.y = 40;
        this.addChild(restartButton);
        this._restartButton = restartButton;
    }

    private _createInstallButton(): void {
        const installButton = this._createButton('Go to Scrambly', this._onInstallButtonClick.bind(this));
        installButton.y = 120;
        this.addChild(installButton);
        this._installButton = installButton;
    }

    private _createButton(label: string, onClick: () => void): Container {
        const buttonWidth = 250;
        const buttonHeight = 70;
        const button = new Container();
        const buttonBackground = new Graphics().roundRect(-buttonWidth * 0.5, -buttonHeight * 0.5, buttonWidth, buttonHeight, 20).fill(0xF58324);
        button.addChild(buttonBackground);

        const buttonText = new Text(label, {
            fontFamily: 'clear_sans',
            fontSize: 32,
            fill: 'white',
            align: 'center'
        });
        buttonText.anchor.set(0.5);
        button.addChild(buttonText);
        button.eventMode = 'static';
        button.on('pointerdown', onClick);
        return button;
    }

    private _onRestartButtonClick(): void {
        PlaneBasicAnimations.animateButton(this._restartButton, () => {
            eventsSystem.emit('restartLevel');
        }, true);
    }

    private _onInstallButtonClick(): void {
        PlaneBasicAnimations.animateButton(this._installButton, () => {
            eventsSystem.emit('install');
        }, true);
    }
}
