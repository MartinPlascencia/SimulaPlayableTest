import { Container, Application, Assets, Graphics, Sprite, Text } from 'pixi.js';

import TutorialHand from '../TutorialHand';
import Joystick from './Joystick';
import UITextContainer from '../UITextContainer';
import FinalScreen from './FinalScreen';
import LoseScreen from './LoseScreen';
import HintText from './HintText';
import DownloadButton from './DownloadButton';
import SoundButton from './SoundButton';
import InstallToast from './InstallToast';
import gsap from 'gsap';

import TextParticles from '../TextParticles';
import eventsSystem from '../../utils/EventsSystem';
import PlaneBasicAnimations from '../../utils/PlaneBasicAnimations';

export default class GameUI extends Container {
    private _tutorialHand!: TutorialHand;
    private _joystick!: Joystick;
    private _coinsTextContainer!: UITextContainer;
    private _finalScreen!: FinalScreen;
    private _loseScreen!: LoseScreen;
    private _hintText!: HintText;
    private _downloadButton!: DownloadButton;
    private _soundButton!: SoundButton;
    private _installToast!: InstallToast;
    constructor(app: Application, coinsToWin: number) {
        super();
        app.stage.addChild(this);
        this._createCoinsUI();
        this._createTextParticles(app);
        this._createHintText(coinsToWin);
        this._createJoystick(app);
        this._createFinalScreen();
        this._createLoseScreen();
        this._createDownloadButton();
        this._createSoundButton();
        this._createInstallToast();
        this.resize(app.screen.width, app.screen.height);
        this._addEvents();
    }
    
    private _createHintText(coinsToWin: number): void {
        const hintText = new HintText({ count: coinsToWin });
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

    private _createLoseScreen(): void {
        const loseScreen = new LoseScreen();
        this.addChild(loseScreen);
        loseScreen.scaler.setPortraitScreenPosition(0.5, 0.5);
        loseScreen.scaler.setLandscapeScreenPosition(0.5, 0.5);
        loseScreen.scaler.setPortraitScreenSize(0.8, 0.8);
        loseScreen.scaler.setLandscapeScreenSize(0.6, 0.6);
        loseScreen.scaler.setOriginalSize(loseScreen.width, loseScreen.height);
        this._loseScreen = loseScreen;
        loseScreen.hide();
    }

    private _createDownloadButton(): void {
        const downloadButton = new DownloadButton();
        this.addChild(downloadButton);
        downloadButton.scaler.setPortraitScreenPosition(0.9, 0.06);
        downloadButton.scaler.setPortraitScreenSize(0.17, 0.12);
        downloadButton.scaler.setLandscapeScreenPosition(0.94, 0.1);
        downloadButton.scaler.setLandscapeScreenSize(0.2, 0.12);
        downloadButton.scaler.setOriginalSize(downloadButton.width, downloadButton.height);
        this._downloadButton = downloadButton;
    }

    private _createSoundButton(): void {
        const soundButton = new SoundButton();
        this.addChild(soundButton);
        soundButton.scaler.setPortraitScreenPosition(0.9, 0.94);
        soundButton.scaler.setPortraitScreenSize(0.14, 0.08);
        soundButton.scaler.setLandscapeScreenPosition(0.94, 0.88);
        soundButton.scaler.setLandscapeScreenSize(0.1, 0.1);
        soundButton.scaler.setOriginalSize(soundButton.width, soundButton.height);
        this._soundButton = soundButton;
    }

    private _createInstallToast(): void {
        const installToast = new InstallToast();
        this.addChild(installToast);
        installToast.scaler.setPortraitScreenPosition(0.5, 0.94);
        installToast.scaler.setPortraitScreenSize(0.6, 0.08);
        installToast.scaler.setLandscapeScreenPosition(0.5, 0.92);
        installToast.scaler.setLandscapeScreenSize(0.5, 0.12);
        installToast.scaler.setOriginalSize(installToast.width, installToast.height);
        this._installToast = installToast;
    }

    private _createTextParticles(app: Application): void {
        new TextParticles(this);
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
        eventsSystem.on('gameFinished', this._onGameFinished.bind(this));
        eventsSystem.on('showLoseScreen', this._onGameLost.bind(this));
        eventsSystem.on('nextHint', this._hintText.goToNextHint.bind(this._hintText));
        eventsSystem.on('install', this._onInstall.bind(this));
    }

    private _onInstall(): void {
        this._installToast.show();
    }

    private _onGameFinished(isLastLevel: boolean, rewardName: string | null): void {
        this._finalScreen.show(isLastLevel, rewardName);
        this._joystick.eventMode = 'none';
        this._joystick.reset();
    }

    private _onGameLost(): void {
        this._loseScreen.show();
        this._hintText.hide();
        this._joystick.eventMode = 'none';
        this._joystick.reset();
    }

    /** Resets the UI back to a fresh level state (final/lose screens hidden, hints restarted, joystick usable). */
    public startLevel(coinsToWin: number): void {
        this._finalScreen.hide();
        this._loseScreen.hide();
        this._joystick.eventMode = 'static';
        this._joystick.reset();
        this._hintText.reset({ count: coinsToWin });
    }

    private _updateCoinsUI(coins: number, maxCoins: number): void {
        this._coinsTextContainer.setText(`${coins} / ${maxCoins}`);
        gsap.killTweensOf(this._coinsTextContainer);
        this._coinsTextContainer.scaler.resize(window.innerWidth, window.innerHeight);
        PlaneBasicAnimations.wiggleObject(this._coinsTextContainer, 0.1);
    }

    public resize(width: number, height: number): void {
        this._coinsTextContainer.scaler.resize(width, height);
        this._joystick.resize(width, height);
        this._finalScreen.scaler.resize(width, height);
        this._loseScreen.scaler.resize(width, height);
        this._hintText.scaler.resize(width, height);
        this._downloadButton.scaler.resize(width, height);
        this._soundButton.scaler.resize(width, height);
        this._installToast.scaler.resize(width, height);
    }  
}