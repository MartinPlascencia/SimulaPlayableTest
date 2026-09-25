import { Container, FederatedPointerEvent, Point, Rectangle, Sprite, Assets } from 'pixi.js';
import gsap from 'gsap';
import ScaledContainer from '../Scale/ScaledContainer';

export interface JoystickOptions {
    baseId: string;
    handleId: string;
    radius?: number;
    deadZone?: number;
    portraitSize: { width: number; height: number;};
    landscapeSize: { width: number; height: number;};
}

export default class Joystick extends Container {
    public readonly value: Point = new Point(0, 0);

    private _radius: number;
    private _deadZone: number;

    private _visuals: ScaledContainer;
    private _base: Sprite;
    private _handle: Sprite;

    private _dragging = false;
    private _pointerId: number | null = null;

    constructor(options: JoystickOptions, screenWidth: number, screenHeight: number) {
        super();

        this._radius = options.radius ?? 60;
        this._deadZone = options.deadZone ?? 0.1;

        // 🔹 Full screen input
        this.eventMode = 'static';
        this.hitArea = new Rectangle(0, 0, screenWidth, screenHeight);

        this._createVisuals(options);
        this.resize(screenWidth, screenHeight);
        this.on('pointerdown', this.onPointerDown, this);
        this.on('pointermove', this.onPointerMove, this);
        this.on('pointerup', this.onPointerUp, this);
        this.on('pointerupoutside', this.onPointerUp, this);
    }

    private _createVisuals(options: JoystickOptions): void {
        this._visuals = new ScaledContainer();

        this._base = new Sprite(Assets.get(options.baseId));
        this._base.anchor.set(0.5);

        this._handle = new Sprite(Assets.get(options.handleId));
        this._handle.anchor.set(0.5);

        this._visuals.addChild(this._base, this._handle);
        this.addChild(this._visuals);

        this._visuals.scaler.setPortraitScreenSize(options.portraitSize?.width ?? this._radius * 2, options.portraitSize?.height ?? this._radius * 2);
        this._visuals.scaler.setLandscapeScreenSize(options.landscapeSize?.width ?? this._radius * 2, options.landscapeSize?.height ?? this._radius * 2);
        this._visuals.scaler.setOriginalSize(this._base.width, this._base.height);
        this._visuals.scaler.ignorePosition = true;

        this._visuals.visible = false;
    }

    public get isMoving(): boolean {
        return this._dragging;
    }

    private onPointerDown(e: FederatedPointerEvent): void {
        this._dragging = true;
        this._pointerId = e.pointerId;

        // Move visuals only
        this._visuals.position.copyFrom(e.global);
        this._visuals.visible = true;

        gsap.to(this._visuals, {
            alpha: 1,
            duration: 0.25,
            ease: 'power3.out'
        });

        gsap.killTweensOf(this._handle.position);
        this._handle.position.set(0, 0);
        this.value.set(0, 0);
    }

    private onPointerMove(e: FederatedPointerEvent): void {
        if (!this._dragging || e.pointerId !== this._pointerId) return;

        const local = e.getLocalPosition(this._visuals);
        const length = Math.hypot(local.x, local.y);

        const clamped = Math.min(length, this._radius);
        const angle = Math.atan2(local.y, local.x);

        this._handle.position.set(
            Math.cos(angle) * clamped,
            Math.sin(angle) * clamped
        );

        const normalized = clamped / this._radius;
        if (normalized < this._deadZone) {
            this.value.set(0, 0);
            return;
        }

        this.value.set(
            Math.cos(angle) * normalized,
            Math.sin(angle) * normalized
        );
    }

    private onPointerUp(): void {
        this._dragging = false;
        this._pointerId = null;
        this.value.set(0, 0);

        gsap.to(this._handle.position, {
            x: 0,
            y: 0,
            duration: 0.25,
            ease: 'power3.out',
            onComplete: () => {
                this._visuals.visible = false;
            }
        });

        gsap.to(this._visuals, {
            alpha: 0,
            duration: 0.25,
            ease: 'power3.out'
        });
    }

    public resize(screenWidth: number, screenHeight: number): void {
        this.hitArea = new Rectangle(0, 0, screenWidth, screenHeight);
        this._visuals.scaler.resize(screenWidth, screenHeight);
    }
}
