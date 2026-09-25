import { Vector3 } from 'three';
import ModelAsset from './ModelAsset';
import UpdgradeAsset from './UpgradeAsset';
import eventsSystem from '../utils/EventsSystem';

import localization from '../utils/Localization';
export default class SlotMachine extends UpdgradeAsset {
    private _slotMachine!: ModelAsset;
    private _priceToPlay: number = 25;
    constructor(slotMachineModel: ModelAsset, slotMachineScale: number = 1) {
        super();
        this._slotMachine = slotMachineModel;
        this._slotMachine.scale.set(slotMachineScale, slotMachineScale, slotMachineScale);
        this._uiText.changeOffset(new Vector3(0, 2.2, 0));
        this._uiText.setText(`$${this._priceToPlay} ${localization.get('toPlay')}`);
        this.add(this._slotMachine);
    }

    public finishGame(): void {
        eventsSystem.emit('gameFinished');
    }

    public get priceToPlay(): number {
        return this._priceToPlay;
    }

    public update(cameraPosition: Vector3): void {
        this._uiText.update(cameraPosition);
    }
}