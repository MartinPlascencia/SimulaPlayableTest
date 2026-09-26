import { Howl, Howler } from "howler";

class Sound {
    private static instance: Sound;
    private _sounds: Map<string, Howl>;
    private _active: boolean = true;
    private _volume: number = 1.0;
    private _currentSound : Howl | null = null;
    private _pausedSounds: Howl[] = [];
    private _isPaused: boolean = false;

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

    /** Whether the given sound currently has an active (already started) playing instance. */
    public isSoundPlaying(key: string): boolean {
        return !!this._sounds.get(key)?.playing();
    }

    public stopAllSounds(): void {
        Howler.stop();
    }

    /** Pauses every sound currently playing (e.g. looping music, sfx), remembering which ones to resume later.
     *  Safe to call more than once in a row (e.g. blur + visibilitychange firing together). */
    public pauseAll(): void {
        if (this._isPaused) return;
        this._isPaused = true;
        this._pausedSounds = [];
        this._sounds.forEach((sound) => {
            if (sound.playing()) {
                sound.pause();
                this._pausedSounds.push(sound);
            }
        });
    }

    /** Resumes the sounds that were playing when `pauseAll()` was called. Skipped while sound is muted,
     *  so regaining window focus while muted does not restart any sounds. */
    public resumeAll(): void {
        if (!this._isPaused) return;
        this._isPaused = false;
        if (this._active) {
            this._pausedSounds.forEach((sound) => sound.play());
        }
        this._pausedSounds = [];
    }
}

export default Sound.getInstance();
export { Sound };
