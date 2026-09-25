import eventsSystem from '../utils/EventsSystem';
export default class Money {
    private _money: number = 0;
    constructor() {
        this._money = 0;
    }

    public addMoney(amount: number): void {
        this._money += amount;
        eventsSystem.emit('moneyChanged', this._money);
    }

    public get money(): number {
        return this._money;
    }

    public subtractMoney(amount: number): void {
        if (this._money >= amount) {
            this._money -= amount;
            eventsSystem.emit('moneyChanged', this._money);
        }
    }
}