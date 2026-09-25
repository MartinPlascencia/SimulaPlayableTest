import AssetsInlineHelper from "./AssetsInlineHelper";
import ModelAsset from "./ModelAsset"
import { Vector3, Scene } from "three";
import gsap from "gsap";
export default class CoinsSender {
    private _assetsInlineHelper!: AssetsInlineHelper;
    private _scene!: Scene;
    private _coinsScale: number = 0.3;
    private _coins: ModelAsset[] = [];
    constructor(assetsInlineHelper: AssetsInlineHelper, scene: Scene) {
        this._assetsInlineHelper = assetsInlineHelper;
        this._scene = scene;
    }

    private _getCoin(): Promise<ModelAsset> {
        return new Promise<ModelAsset>(async (resolve) => {
            let coin;
            coin = this._coins.find(coin => !coin.visible);
            if (!coin) {
                coin = await new ModelAsset(this._assetsInlineHelper.models['coin'].model, 'Coin');
                coin.scale.set(this._coinsScale, this._coinsScale, this._coinsScale);
                this._scene.add(coin);
                this._coins.push(coin);
            }
            coin.visible = true;
            resolve(coin);
        });
    }

    public async sendCoins(fromPosition: Vector3, toPosition: Vector3, numberOfCoins: number = 5, duration: number = 0.3): Promise<void> {
        for (let i = 0; i < numberOfCoins; i++) {
            const coin = await this._getCoin();
            coin.position.set(fromPosition.x, fromPosition.y, fromPosition.z);
            const delay = i * 0.1;
            gsap.to(coin.position, {
                x: toPosition.x,
                z: toPosition.z,
                delay: delay,
                duration: duration,
                ease: "power1.inOut",
                onComplete: () => {
                    coin.visible = false;
                }
            });

            gsap.to(coin.position, {
                y: toPosition.y + 1,
                delay: delay,
                duration: duration / 2,
                ease: "power1.out",
                yoyo: true,
                repeat: 1
            });
        }
    }

}