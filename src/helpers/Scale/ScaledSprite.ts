import { Sprite, Texture } from 'pixi.js';
import Scaler from './Scaler';
export default class ScaledSprite extends Sprite {
    private _scaler: Scaler;
    constructor(texture: Texture) {
        super(texture);
        this._scaler = new Scaler(this);
    }

    public get scaler(): Scaler {
        return this._scaler;
    }
}