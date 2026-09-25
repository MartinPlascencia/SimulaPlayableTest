import { Application } from 'pixi.js';
import PreloadScene from './scenes/PreloadScene';
import MainScene from './scenes/MainScene';
import Effects from './helpers/Effects';
import AssetsInlineHelper from './helpers/AssetsInlineHelper';

import sound from './utils/Sound';
import localization from './utils/Localization';
import localizationData from './data/localizationData';

export default class Game {
    private _app!: Application;
    private _effects!: Effects;
    private _preloadScene!: PreloadScene;
    private _mainScene!: MainScene;
    private _assetsInlineHelper: AssetsInlineHelper = new AssetsInlineHelper();

    public async initializeGame(width: number, height: number) : Promise<void>{
        localization.setLanguageData(localizationData);
        localization.setLanguage('en');
        this._app = new Application();
        await this._app.init({
            autoDensity: true,
            backgroundAlpha: 0,
            resizeTo: window,
            width: width,
            height: height,
            resolution: Math.max(2, window.devicePixelRatio || 1),
            antialias: true,
        });
        document.body.appendChild(this._app.canvas);
        this._effects = new Effects(this._app);
        this._effects.eventMode = 'none';
        this._preloadScene = new PreloadScene(this._app, this._assetsInlineHelper);
        this._preloadScene.setContinueCallback(this.startGame.bind(this));
    }

    public resize(width: number, height: number) : void {
        this._app.renderer.resize(width, height);
        this._preloadScene != undefined && this._preloadScene.active && this._preloadScene.resize(width, height);
        this._mainScene != undefined && this._mainScene.active && this._mainScene.resize(width, height);
    }

    public startGame() : void {
        this._effects.fadeOut(0.4, () => {
            this._effects.fadeIn(0.4);
            this._preloadScene.clear();
            this._mainScene = new MainScene(this._app, this._assetsInlineHelper);
            this._app.stage.addChild(this._effects);
        });
    }

    public pause() : void {
        this._mainScene != undefined && this._mainScene.pause();
    }

    public resume() : void {
        this._mainScene != undefined && this._mainScene.resume();
    }

    public volume(volume: number) : void {
        sound.setVolume(volume);
    }
}