import { Container } from 'pixi.js';
import Scaler from './Scaler';
export default class ScaledContainer extends Container {
    private _scaler: Scaler;
    constructor() {
        super();
        this._scaler = new Scaler(this);
    }

    public get scaler(): Scaler {
        return this._scaler;
    }
}