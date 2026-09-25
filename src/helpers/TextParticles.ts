import { Vector3, Camera, WebGLRenderer, Object3D } from 'three';
import { Text, Container } from 'pixi.js';
import ScaledText from './Scale/ScaledText';
import gsap from 'gsap';

import eventsSystem from '../utils/EventsSystem';
export default class TextParticles {

    private _parentContainer: Container;
    private _textParticles: ScaledText[] = [];
    constructor(parentContainer: Container) {
        this._parentContainer = parentContainer;
        this._addEvents();
    }

    private _addEvents(): void {
        eventsSystem.on('showTextParticles', this.showTextParticles.bind(this));
    }

    public showTextParticles(text: string, object: Object3D, camera: Camera, renderer: WebGLRenderer, fontSize: number = 50): void {
        const worldPosition = new Vector3();
        object.getWorldPosition(worldPosition);
        const screenPos = this._worldToScreenPosition(worldPosition, camera, renderer);
        if (!screenPos.visible) return;
        
        const coinsText = this._getTextParticle();
        coinsText.text = text;
        //.style.fontSize = fontSize;
        coinsText.position.set(screenPos.x, screenPos.y);

        coinsText.scaler.setOriginalSize(coinsText.width, coinsText.height);
        coinsText.scaler.resize(window.innerWidth, window.innerHeight);

        gsap.to(coinsText, {
            y: screenPos.y - 50,
            duration: 1,
            onComplete: () => {
                
            }
        });

        gsap.to(coinsText, {
            alpha: 0,
            delay: 0.5,
            duration: 0.5
        });
        console.log('text particles number', this._textParticles.length);
    }

    private _getTextParticle(): ScaledText {
        let textParticle: ScaledText | undefined = this._textParticles.find(tp => tp.alpha == 0);
        if (!textParticle) {
            textParticle = new ScaledText({
                text: '',
                style: {
                    fontFamily: 'clear_sans',
                    fontSize: 50,
                    align: 'center',
                    fill: 'white',
                    dropShadow: {
                        alpha: 0.8,         
                        angle: Math.PI / 6,
                        blur: 4,
                        color: '#000000',
                        distance: 6
                    }
                },
            });
            textParticle.anchor.set(0.5);
            this._textParticles.push(textParticle);
            textParticle.scaler.setPortraitScreenSize(0.3, 0.2);
            textParticle.scaler.setLandscapeScreenSize(0.2, 0.1);
            textParticle.scaler.ignorePosition = true;
            this._parentContainer.addChild(textParticle);
        }
        textParticle.alpha = 1;
        textParticle.scale.set(1, 1);
        return textParticle;
    }

    private _worldToScreenPosition(worldPos: Vector3, camera: Camera, renderer: WebGLRenderer): { x: number; y: number; visible: boolean } {
        const projected = worldPos.clone().project(camera);

        // FIX: Use clientWidth/clientHeight for actual screen pixels
        const width = renderer.domElement.clientWidth;
        const height = renderer.domElement.clientHeight;
        const widthHalf = width / 2;
        const heightHalf = height / 2;

        const screenX = projected.x * widthHalf + widthHalf;
        const screenY = -projected.y * heightHalf + heightHalf;

        const visible = projected.z < 1 && // Strictly in front of camera
                        screenX >= -50 && screenX <= width + 50 && // Small tolerance
                        screenY >= -50 && screenY <= height + 50;

        return { x: screenX, y: screenY, visible };
    }


}
