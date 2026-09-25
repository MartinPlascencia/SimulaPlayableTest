import { Container, Sprite, Graphics } from 'pixi.js';
import { UIAssetConfig } from '../../types/game';
export default class ScalerHelper {
    private _targetScreenSize = { width: 0, height: 0 };
    private _originalSize = { width: 0, height: 0 };
    private _screenPosition = { x: 0, y: 0 };

    private _landscapeScreenSize = { width: 0, height: 0 };
    private _landscapeScreenPosition = { x: 0, y: 0 };
    private _currentScreenSize = { width: 0, height: 0 };
    private _ignorePosition: boolean = false;

    constructor(
        private _displayObject: Container | Sprite | Graphics,
    ) {}

    public set ignorePosition(value: boolean) {
        this._ignorePosition = value;
    }

    public setSizes(uiAssetConfig: UIAssetConfig): void {
        this.setPortraitScreenPosition(uiAssetConfig.portraitPosition.x, uiAssetConfig.portraitPosition.y);
        this.setPortraitScreenSize(uiAssetConfig.portraitSize.x, uiAssetConfig.portraitSize.y);
        this.setLandscapeScreenPosition(uiAssetConfig.landscapePosition.x, uiAssetConfig.landscapePosition.y);
        this.setLandscapeScreenSize(uiAssetConfig.landscapeSize.x, uiAssetConfig.landscapeSize.y);
    }

    public setOriginalSize(width: number, height: number): void {
        this._originalSize.width = width;
        this._originalSize.height = height;
    }

    public setPortraitScreenSize(width: number, height: number): void {
        this._targetScreenSize.width = width;
        this._targetScreenSize.height = height;
    }

    public setPortraitScreenPosition(x: number, y: number): void {
        this._screenPosition.x = x;
        this._screenPosition.y = y;
        this.setScreenPosition(this._screenPosition);
    }

    public setScreenPosition(position: {x:number, y:number}): void {
        if (this._ignorePosition) return;
        this._displayObject.position.set(
            position.x * window.innerWidth,
            position.y * window.innerHeight
        );
    }

    public setLandscapeScreenSize(width: number, height: number): void {
        this._landscapeScreenSize.width = width;
        this._landscapeScreenSize.height = height;
    }

    public setLandscapeScreenPosition(x: number, y: number): void {
        this._landscapeScreenPosition.x = x;
        this._landscapeScreenPosition.y = y;
    }

    public setSameScalerValues(){
        this._landscapeScreenSize.width = this._targetScreenSize.width;
        this._landscapeScreenSize.height = this._targetScreenSize.height;
        this._landscapeScreenPosition.x = this._screenPosition.x;
        this._landscapeScreenPosition.y = this._screenPosition.y;
    }

    public updateSize(): void {
        if (this._currentScreenSize.width === 0 || this._currentScreenSize.height === 0) {
            return;
        }
        this.resize(this._currentScreenSize.width, this._currentScreenSize.height);
    }

    public resize(width: number, height: number): void {
        const isLandscape = width > height;

        const targetWidth = !isLandscape ? this._targetScreenSize.width * width : this._landscapeScreenSize.width * width;
        const targetHeight = !isLandscape ? this._targetScreenSize.height * height : this._landscapeScreenSize.height * height;

        const scaleX = targetWidth / this._originalSize.width;
        const scaleY = targetHeight / this._originalSize.height;

        const uniformScale = Math.min(scaleX, scaleY);
        this._displayObject.scale.set(uniformScale);

        this.setScreenPosition(isLandscape ? this._landscapeScreenPosition : this._screenPosition);
        this._currentScreenSize.width = width;
        this._currentScreenSize.height = height;
    }
}