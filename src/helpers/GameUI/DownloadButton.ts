import { Assets } from "pixi.js";
import { sdk } from '@smoud/playable-sdk';
import ScaledSprite from "../Scale/ScaledSprite";
import PlaneBasicAnimations from "../../utils/PlaneBasicAnimations";
import eventsSystem from "../../utils/EventsSystem";

/* ---------------------------------------------------
   DOWNLOAD BUTTON

   Simple always-visible call-to-action sprite ('download'
   texture) that redirects to the store via sdk.install()
   when pressed, same install action used by FinalScreen/
   LoseScreen's buttons.
--------------------------------------------------- */
export default class DownloadButton extends ScaledSprite {
    constructor() {
        super(Assets.get('download'));
        this.anchor.set(0.5);
        this.eventMode = 'static';
        this.cursor = 'pointer';
        this.on('pointerdown', this._onClick.bind(this));
    }

    private _onClick(): void {
        PlaneBasicAnimations.animateButton(this, () => {
            eventsSystem.emit('install');
        }, true);
    }
}
