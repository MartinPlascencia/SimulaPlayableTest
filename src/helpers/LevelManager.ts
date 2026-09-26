import { LevelConfig } from '../types/game';

/* ---------------------------------------------------
   LEVEL MANAGER

   Keeps track of which level (data/levels.ts entry) is
   currently active and whether it's the last one. Add
   more levels to data/levels.ts to extend the sequence,
   no code changes needed here.
--------------------------------------------------- */
export default class LevelManager {
    private _levels: LevelConfig[];
    private _currentIndex: number = 0;

    constructor(levels: LevelConfig[]) {
        this._levels = levels;
    }

    public get currentLevel(): LevelConfig {
        return this._levels[this._currentIndex];
    }

    public get currentIndex(): number {
        return this._currentIndex;
    }

    public get isLastLevel(): boolean {
        return this._currentIndex >= this._levels.length - 1;
    }

    public goToNextLevel(): void {
        if (!this.isLastLevel) {
            this._currentIndex++;
        }
    }
}
