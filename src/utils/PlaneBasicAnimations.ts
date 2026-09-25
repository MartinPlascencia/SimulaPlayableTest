import gsap from "gsap";
import { Container, Sprite, Graphics } from "pixi.js";
import { Object3D, Group } from "three";

export default class PlaneBasicAnimations {
    static animateButton(buttonContainer: Container | Sprite, callback?: () => void,reactivateButton = false): void {
        buttonContainer.eventMode = "none";
        gsap.to(buttonContainer.scale, {
            x: buttonContainer.scale.x * 0.7,
            y: buttonContainer.scale.y * 0.7,
            duration: 0.15,
            yoyo: true,
            repeat: 1,
            ease: "linear",
            onComplete: () => {
                gsap.to(buttonContainer.scale, {
                    x: buttonContainer.scale.x * 0.9,
                    y: buttonContainer.scale.y * 0.9,
                    duration: 0.075,
                    yoyo: true,
                    repeat: 1,
                    ease: "linear",
                    onComplete: () => {
                        if (reactivateButton) buttonContainer.eventMode = "static";
                        callback?.();
                    },
                });
            },
        });
    }

    static popObject3D(object: Object3D | Group): void {
        !object.visible && (object.visible = true);
        gsap.from(object.scale, {
            x: 0,
            y: 0,
            z: 0,
            duration: 0.4,
            ease: "back.out",
        });
    }

    static unpopObject3D(object: Object3D | Group): void {
        const originalScale = object.scale.x;
        gsap.to(object.scale, {
            x: 0,
            y: 0,
            z: 0,
            duration: 0.4,
            ease: "back.in",
            onComplete: () => {
                object.scale.set(originalScale, originalScale, originalScale);
                object.visible = false;
            },
        });
    }

    static popObject(object: Container | Sprite, callback?: ()=> void): void {
        object.scale.x == 0 && object.scale.set(1);
        object.alpha == 0 && (object.alpha = 1);
        gsap.from(object.scale, {
            x: 0,
            y: 0,
            duration: 0.4,
            ease: "back.out",
            onComplete: () => { callback?.(); }
        });
    }

    static unpopObject(object: Container | Sprite): void {
        const originalScale = object.scale.x;
        gsap.to(object.scale, {
            x: 0,
            y: 0,
            duration: 0.4,
            ease: "back.in",
            onComplete: () => {
                object.alpha = 0;
                object.scale.set(originalScale);
            }
        });
    }

    static fadeOut(object: Container | Sprite | Graphics, duration = 0.4): void {
        gsap.to(object, {
            alpha: 0,
            duration,
            ease: "linear",
        });
    }

    static fadeIn(object: Container | Sprite | Graphics, duration = 0.4): void {
        gsap.to(object, {
            alpha: 1,
            duration,
            ease: "linear",
        });
    }

    static wiggleObject(object: Container | Sprite, duration = 0.4): void {
        gsap.to(object.scale, {
            x: object.scale.x * 1.1,
            y: object.scale.y * 1.1,
            duration,
            ease: "linear",
            yoyo: true,
            repeat: 1,
        });
    }

    static comeFromTop(object: Container | Sprite, duration = 0.4): void {
        gsap.from(object, {
            y: -object.height,
            duration,
            ease: "back.out",
        });
    }

    static hideToTop(object: Container | Sprite, duration = 0.4): void {
        gsap.to(object, {
            y: -object.height,
            duration,
            ease: "back.in",
        });
    }

    static shakeContainer(target: Container | Sprite, intensity = 10, duration = 0.5): void {
        const original = { x: target.x, y: target.y };
        const timeline = gsap.timeline({
            onComplete: () => {
                target.x = original.x;
                target.y = original.y;
            },
        });

        const shakes = Math.floor(duration / 0.05);
        for (let i = 0; i < shakes; i++) {
            timeline.to(target, {
                x: original.x + (Math.random() - 0.5) * intensity,
                y: original.y + (Math.random() - 0.5) * intensity,
                duration: 0.025,
                ease: "power2.out",
            });
        }
    }

    static moveTo(object: Container | Sprite, x: number, y: number, duration = 0.5, callback?: () => void): void {
        gsap.to(object, {
            x,
            y,
            duration,
            ease: "back.out",
            onComplete: () => {
                callback?.();
            },
        });
    }

    static disappear(object: Container | Sprite, duration = 0.4): void {
        const originalScale = { x: object.scale.x, y: object.scale.y };
        gsap.to(object.scale, {
            x: originalScale.x * 1.2,
            y: originalScale.y * 1.2,
            duration,
            ease: "linear",
            onComplete: () => {
                object.scale.set(originalScale.x, originalScale.y);
            }
        });

        gsap.to(object, {
            alpha: 0,
            duration,
            ease: "linear",
        });
    }
}
