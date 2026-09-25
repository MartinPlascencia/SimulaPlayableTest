import eventsSystem from "../utils/EventsSystem";
export default class CoinsCollector {
    private _coins: number = 0;
    private _maxCoins: number = 5;

    public collectCoin(): void {
        this.coins = this._coins + 1;
    }

    public get coins(): number {
        return this._coins;
    }

    public set coins(value: number) {
        this._coins = value;
        eventsSystem.emit('coinCollected', this._coins, this._maxCoins);
    }

    public set maxCoins(value: number) {
        this._maxCoins = value;
        eventsSystem.emit('coinCollected', this._coins, this._maxCoins);
    }

    public get maxCoins(): number {
        return this._maxCoins;
    }
}