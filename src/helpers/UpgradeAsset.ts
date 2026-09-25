import { Group, Object3D } from 'three';
import UI3DBillboard from './UI3DBillboard';
export default class UpdgradeAsset extends Group {
    private _distanceToUpgrade: number = 2;
    protected _uiText!: UI3DBillboard;
    constructor() {
        super();
        this._uiText = new UI3DBillboard(3, 1);
        this._uiText.attachTo(this);
        this._uiText.setFont('50px clear_sans');
        this._uiText.setText('');
    }

    public isInUpgradeRange(characterPosition: Object3D): boolean {
        const distance = this.position.distanceTo(characterPosition.position);
        return distance <= this._distanceToUpgrade;
    }

}