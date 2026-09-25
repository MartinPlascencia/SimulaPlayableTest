import { Howl, Howler } from "howler";

class Sound {
    private static instance: Sound;
    private _sounds: Map<string, Howl>;
    private _active: boolean = true;
    private _volume: number = 1.0;
    private _currentSound : Howl | null = null;

    private constructor() {
        this._sounds = new Map();
    }

    public get active(): boolean {
        return this._active;
    }

    public setVolume(volume: number): void {
        this._volume = volume;
        this._currentSound?.volume(volume);
    }

    public setActive(active: boolean): void {
        this._active = active;
        Howler.mute(!active);
    }

    public static getInstance(): Sound {
        if (!Sound.instance) {
            Sound.instance = new Sound();
        }
        return Sound.instance;
    }

    async loadSound(key: string, url: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const sound = new Howl({
                src: [url],
                preload: true,
                onload: () => {
                    this._sounds.set(key, sound);
                    resolve();
                },
                onloaderror: (id, error) => {
                    console.error(`Failed to load sound "${key}" from URL: ${url}`, error);
                    reject(error);
                }
            });
        });
    }

    public playSound(key: string, loop: boolean = false, volume: number = this._volume): void {
        if (!this._active) {
            return;
        }

        const sound = this._sounds.get(key);
        if (!sound) {
            console.error(`Sound "${key}" not found!`);
            return;
        }

        sound.loop(loop);
        sound.volume(volume);
        sound.play();
        this._currentSound = sound;
    }

    public stopSound(key: string): void {
        const sound = this._sounds.get(key);
        if (sound) {
            sound.stop();
        }
    }

    public stopAllSounds(): void {
        Howler.stop();
    }
}

export default Sound.getInstance();
export { Sound };
