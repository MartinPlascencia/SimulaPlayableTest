import { Vector3 } from 'three';
import ModelAsset from './ModelAsset';
import UpdgradeAsset from './UpgradeAsset';
import eventsSystem from '../utils/EventsSystem';

import localization from '../utils/Localization';
export default class RewardChest extends UpdgradeAsset {
    private _chestModel!: ModelAsset;
    private _coinsToWin: number;
    constructor(chestModel: ModelAsset, chestScale: number = 1, coinsToWin: number = 5) {
        super();
        this._chestModel = chestModel;
        this._coinsToWin = coinsToWin;
        this._chestModel.scale.set(chestScale, chestScale, chestScale);
        this._uiText.changeOffset(new Vector3(0, 2.2, 0));
        this._uiText.setText(`${this._coinsToWin} ${localization.get('coinsToPlay')}`);
        this.add(this._chestModel);
    }

    public finishGame(isLastLevel: boolean, rewardName?: string | null): void {
        eventsSystem.emit('gameFinished', isLastLevel, rewardName ?? null);
    }

    public get coinsToWin(): number {
        return this._coinsToWin;
    }

    public update(cameraPosition: Vector3): void {
        this._uiText.update(cameraPosition);
    }
}
