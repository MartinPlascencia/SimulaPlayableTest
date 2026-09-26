import { Assets } from "pixi.js";
import ScaledSprite from "../Scale/ScaledSprite";
import PlaneBasicAnimations from "../../utils/PlaneBasicAnimations";
import sound from "../../utils/Sound";

/* ---------------------------------------------------
   SOUND BUTTON

   Always-visible mute toggle ('sound_on'/'sound_off'
   textures) placed bottom-right. Toggles Sound's active
   state (which mutes Howler globally and blocks new
   playSound() calls) and swaps its own texture to match.
   While muted, Sound.resumeAll() (called on window/tab
   focus) intentionally skips resuming any sound, so
   refocusing the game keeps it muted.
--------------------------------------------------- */
export default class SoundButton extends ScaledSprite {
    private _muted: boolean = false;

    constructor() {
        super(Assets.get('sound_on'));
        this.anchor.set(0.5);
        this.eventMode = 'static';
        this.cursor = 'pointer';
        this.on('pointerdown', this._onClick.bind(this));
    }

    private _onClick(): void {
        PlaneBasicAnimations.animateButton(this, () => {
            this._muted = !this._muted;
            sound.setActive(!this._muted);
            this.texture = Assets.get(this._muted ? 'sound_off' : 'sound_on');

            // Turning sound back on should always play the game music - this also
            // covers the case where the browser blocked music autoplay on level
            // start, since this click is a user gesture that satisfies that policy.
            if (!this._muted && !sound.isSoundPlaying('game_sound')) {
                sound.playSound('game_sound', true, 0.25);
            }
        }, true);
    }
}
