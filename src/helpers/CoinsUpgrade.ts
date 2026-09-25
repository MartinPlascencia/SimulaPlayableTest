import ModelAsset from './ModelAsset';
import { Vector3 } from 'three';
import UpdgradeAsset from './UpgradeAsset';

import localization from '../utils/Localization';
export default class CoinsUpgrade extends UpdgradeAsset {
    private _coinModel: ModelAsset
    constructor(coinModel: ModelAsset, coinScale: number = 0.5) {
        super();
        this._coinModel = coinModel;
        coinModel.scale.set(coinScale, coinScale, coinScale);
        this._uiText.setText(localization.get('itemsCoins'));
        this._uiText.changeOffset(new Vector3(0, 1, 0));
        this.add(this._coinModel);
    }

    public update(cameraPosition: Vector3, delta: number): void {
        this._coinModel.rotateY(1 * delta);
        this._uiText.update(cameraPosition);
    }
}