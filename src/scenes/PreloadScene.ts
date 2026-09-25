import { Container, Sprite, Application, Graphics, Assets } from 'pixi.js';
import ScaledContainer from '../helpers/Scale/ScaledContainer';
import ScaledText from '../helpers/Scale/ScaledText';
import AssetsInlineHelper from '../helpers/AssetsInlineHelper';

import PlaneBasicAnimations from '../utils/PlaneBasicAnimations';
import localization from '../utils/Localization';
import sdk from '@smoud/playable-sdk';

export default class PreloadScene extends Container {
    private _background!: Graphics;
    private _assetsContainer!: ScaledContainer;
    private _continueCallback!: (() => void) | undefined;
    private _active: boolean = true;
    private _assetsInlineHelper: AssetsInlineHelper;

    private _backgroundColor: number = 0x33067a;

    constructor(app: Application, assetsInlineHelper: AssetsInlineHelper) {
        super();
        this._assetsInlineHelper = assetsInlineHelper;
        app.stage.addChild(this);
        this._startLoadingAssets(app);
    }

    public setContinueCallback(callback: () => void): void {
        this._continueCallback = callback;
    }

    private async _startLoadingAssets(app: Application) {
        this._assetsInlineHelper.loadBundleByName('load-screen').then(async () => {
            await this._assetsInlineHelper.loadFonts();
            this._createPreloadAssets(app);
        });
    }

    private _createPreloadAssets(app: Application) {
        const background = new Graphics().rect(0, 0, app.screen.width, app.screen.height).fill(this._backgroundColor);
        this.addChild(background);
        this._background = background;

        const assetsContainer = new ScaledContainer();
        assetsContainer.scaler.setPortraitScreenPosition(0.5, 0.4);
        assetsContainer.scaler.setPortraitScreenSize(0.8, 0.3);
        assetsContainer.scaler.setLandscapeScreenPosition(0.5, 0.4);
        assetsContainer.scaler.setLandscapeScreenSize(0.5, 0.3);
        this.addChild(assetsContainer);
        this._assetsContainer = assetsContainer;

        const barAssetsContainer = new Container();
        assetsContainer.addChild(barAssetsContainer);

        const loadingText = new ScaledText({
            text: localization.get('loadingAssets'),
            style: {
                fontFamily: 'clear_sans',
                fontSize: 55,
                align: 'center',
                fill: 'white',
            },
        });
        loadingText.anchor.set(0.5, 0.5);
        loadingText.y = -app.screen.height * 0.07;
        barAssetsContainer.addChild(loadingText);

        PlaneBasicAnimations.popObject(loadingText);

        const progressBar = new Sprite(Assets.get('progress_bar'));
        progressBar.anchor.set(0.5);
        progressBar.y = loadingText.y + progressBar.height * 1.3;
        barAssetsContainer.addChild(progressBar);
        loadingText.wrapText(progressBar.width * 0.8);

        const progressBarFill = new Sprite(Assets.get('progress_bar_fill'));
        progressBarFill.anchor.set(0.5);
        progressBarFill.y = progressBar.y;
        barAssetsContainer.addChild(progressBarFill);

        const rectMask = new Graphics().rect(0, 0, progressBar.width, progressBar.height).fill(0x000000);
        rectMask.x = progressBar.x - progressBar.width * 0.5;
        rectMask.y = progressBar.y - progressBar.height * 0.5;
        rectMask.scale.x = 0;
        barAssetsContainer.addChild(rectMask);
        progressBarFill.mask = rectMask;

        this._assetsContainer.scaler.setOriginalSize(assetsContainer.width, assetsContainer.height);

        this._loadGameAssets(rectMask, barAssetsContainer);
        this.resize(app.screen.width, app.screen.height);
    }

    private _loadGameAssets(mask: Graphics, barAssetsContainer: Container): void {
        this._assetsInlineHelper.loadBundleByName('game-screen', (progress) => {
            mask.scale.x = progress;
        }).then(async () => {
            await this._assetsInlineHelper.loadModels();
            await this._assetsInlineHelper.loadSounds();
            await this._assetsInlineHelper.loadTextures();
            PlaneBasicAnimations.fadeOut(barAssetsContainer, 1);
            sdk.start();
            this._continueCallback?.();
        })
    }
 
    public resize(width: number, height: number) {
        if (!this._background) return;
        this._background.clear().rect(0, 0, width, height).fill(this._backgroundColor);
        this._background.x = width * 0.5;
        this._background.y = height * 0.5;
        this._background.pivot.set(width * 0.5, height * 0.5);

        this._assetsContainer.scaler.resize(width, height);
    }

    public clear(): void {
        this._active = false;
        this.destroy({ children: true });
    }

    public get active(): boolean {
        return this._active;
    }
}
