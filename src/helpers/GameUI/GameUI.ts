import { Container, Application, Assets, Graphics, Sprite, Text } from 'pixi.js';

import TutorialHand from '../TutorialHand';
import Joystick from './Joystick';
import UITextContainer from '../UITextContainer';
import FinalScreen from './FinalScreen';
import HintText from './HintText';
import gsap from 'gsap';

import TextParticles from '../TextParticles';
import eventsSystem from '../../utils/EventsSystem';
import PlaneBasicAnimations from '../../utils/PlaneBasicAnimations';

export default class GameUI extends Container {
    private _tutorialHand!: TutorialHand;
    private _joystick!: Joystick;
    private _coinsTextContainer!: UITextContainer;
    private _moneyTextContainer!: UITextContainer;
    private _finalScreen!: FinalScreen;
    private _hintText!: HintText;
    constructor(app: Application) {
        super();
        app.stage.addChild(this);
        this._createCoinsUI();
        this._createMoneyUI();
        this._createTextParticles(app);
        this._createHintText();
        this._createJoystick(app);
        this._createFinalScreen();
        this.resize(app.screen.width, app.screen.height);
        this._addEvents();
    }
    
    private _createHintText(): void {
        const hintText = new HintText();
        hintText.scaler.setPortraitScreenPosition(0.5, 0.16);
        hintText.scaler.setPortraitScreenSize(0.6, 0.1);
        hintText.scaler.setLandscapeScreenPosition(0.5, 0.15);
        hintText.scaler.setLandscapeScreenSize(0.4, 0.15);
        hintText.scaler.setOriginalSize(hintText.width, hintText.height);
        this._hintText = hintText;
        this.addChild(hintText);
    }

    private _createFinalScreen(): void {
        const finalScreen = new FinalScreen();
        this.addChild(finalScreen);
        finalScreen.scaler.setPortraitScreenPosition(0.5, 0.5);
        finalScreen.scaler.setLandscapeScreenPosition(0.5, 0.5);
        finalScreen.scaler.setPortraitScreenSize(0.8, 0.8);
        finalScreen.scaler.setLandscapeScreenSize(0.6, 0.6);
        finalScreen.scaler.setOriginalSize(finalScreen.width, finalScreen.height);
        this._finalScreen = finalScreen;
        finalScreen.hide();
    }

    private _createTextParticles(app: Application): void {
        new TextParticles(this);
    }

    private _createMoneyUI(): void {
        const moneyContainer = new UITextContainer();
        this.addChild(moneyContainer);
        this._moneyTextContainer = moneyContainer;
        moneyContainer.setIcon('money');
        moneyContainer.scaler.setPortraitScreenPosition(0.8, 0.05);
        moneyContainer.scaler.setPortraitScreenSize(0.3, 0.1);
        moneyContainer.scaler.setLandscapeScreenPosition(0.88, 0.1);
        moneyContainer.scaler.setLandscapeScreenSize(0.2, 0.1);
        moneyContainer.scaler.setOriginalSize(moneyContainer.width, moneyContainer.height);
        moneyContainer.setText(`$ 0`);
    }   

    public get joystick(): Joystick {
        return this._joystick;
    }

    private _createCoinsUI(): void {
        const coinsContainer = new UITextContainer(50);
        this.addChild(coinsContainer);
        this._coinsTextContainer = coinsContainer;

        coinsContainer.setIcon('chip');
        coinsContainer.scaler.setPortraitScreenPosition(0.2, 0.05);
        coinsContainer.scaler.setPortraitScreenSize(0.3, 0.1);
        coinsContainer.scaler.setLandscapeScreenPosition(0.12, 0.1);
        coinsContainer.scaler.setLandscapeScreenSize(0.2, 0.1);
        coinsContainer.scaler.setOriginalSize(coinsContainer.width, coinsContainer.height);
    }

    private _createJoystick(app: Application): void {
        const joystick = new Joystick({
            baseId: 'joystick_base',
            handleId: 'joystick_handler',
            radius: 120,
            deadZone: 0.2,
            portraitSize: { width: 0.4, height: 0.2 },
            landscapeSize: { width: 0.35, height: 0.3 }
        }, app.screen.width, app.screen.height);
        this.addChild(joystick);
        this._joystick = joystick;
    }

    private _createTutorialHand(): void {
        this._tutorialHand = new TutorialHand('hand');
        this.addChild(this._tutorialHand);
    }

    private _addEvents(): void {
        eventsSystem.on('coinCollected', this._updateCoinsUI.bind(this));
        eventsSystem.on('moneyChanged', this._updateMoneyUI.bind(this));
        eventsSystem.on('gameFinished', this._onGameFinished.bind(this));
        eventsSystem.on('nextHint', this._hintText.goToNextHint.bind(this._hintText));
    }

    private _onGameFinished(): void {
        this._finalScreen.show();
        this._joystick.eventMode = 'none';
    }

    private _updateMoneyUI(money: number): void {
        this._moneyTextContainer.setText(`$ ${money}`);
        gsap.killTweensOf(this._moneyTextContainer);
        this._moneyTextContainer.scaler.resize(window.innerWidth, window.innerHeight);
        PlaneBasicAnimations.wiggleObject(this._moneyTextContainer, 0.1);
    }

    private _updateCoinsUI(coins: number, maxCoins: number): void {
        this._coinsTextContainer.setText(`${coins} / ${maxCoins}`);
        gsap.killTweensOf(this._coinsTextContainer);
        this._coinsTextContainer.scaler.resize(window.innerWidth, window.innerHeight);
        PlaneBasicAnimations.wiggleObject(this._coinsTextContainer, 0.1);
    }

    public resize(width: number, height: number): void {
        this._coinsTextContainer.scaler.resize(width, height);
        this._moneyTextContainer.scaler.resize(width, height);
        this._joystick.resize(width, height);
        this._finalScreen.scaler.resize(width, height);
        this._hintText.scaler.resize(width, height);
    }  
}