import ModelAsset from './ModelAsset';
import { Group, Object3D, AnimationClip, Vector3 } from 'three';
import { ObstacleMovementConfig, ObstaclePulseConfig, LevelBoundsData } from '../types/game';
import gsap from 'gsap';

/* ---------------------------------------------------
   OBSTACLE

   Static hazard the character must avoid, rendered with
   the 'enemy_blob' model (follows GrabAsset/Arrow's
   ModelAsset pattern). Touching it (see `isInHitRange`)
   is a proximity check just like GrabAsset/Arrow, not a
   physics collider.

   Movement: obstacles can optionally patrol the ground plane -
   'horizontal' moves along x, 'vertical' moves along z, between
   `distance` units away from spawn and back, at a constant
   `speed` (units/second); 'circular' orbits around the spawn
   position at `radius` units, at `speed` radians/second. Call
   `startLevel()` once the obstacle's position is set for the
   level, passing a movement config (or omit it for a static
   obstacle) and the level's wall bounds so movement gets
   clamped and can never carry the obstacle into/through a wall.
   Whenever it moves, it rotates to face its direction of travel.

   Pulse: optionally, while active, the obstacle can loop a gsap
   scale tween (yoyo, infinite) between its base scale and
   `pulse.scale` times that, over `pulse.duration` seconds each
   way - purely visual, configurable per obstacle via startLevel().
--------------------------------------------------- */
export default class Obstacle extends ModelAsset {
    private _hitRange: number = 1;
    private readonly _radius: number = 0.6;

    private _basePosition: Vector3 = new Vector3();
    private _previousPosition: Vector3 = new Vector3();
    private _movement?: ObstacleMovementConfig;
    private _moveDirection: number = 1;
    private _moveOffset: number = 0;
    private _angle: number = 0;
    private _bounds?: LevelBoundsData;
    private _initialScale: number = 0.8;
    private _pulseTween?: gsap.core.Tween;
    private readonly _pulseConfig: ObstaclePulseConfig = { scale: 1.2, duration: 0.6 };

    constructor(originalModel: Group | Object3D, insideObjectName?: string, animationClips?: AnimationClip[]) {
        super(originalModel, insideObjectName, animationClips);
        this.scale.set(this._initialScale, this._initialScale, this._initialScale);
    }

    /** Called once the obstacle's spawn position is set, to (re)start its movement pattern for the level. */
    public startLevel(movement?: ObstacleMovementConfig, bounds?: LevelBoundsData): void {
        this._basePosition.copy(this.position);
        this._previousPosition.copy(this.position);
        this._movement = movement;
        this._bounds = bounds;
        this._moveDirection = 1;
        this._moveOffset = 0;
        this._angle = 0;
        this._startPulse();
    }

    /** Starts (or stops) the looping scale pulse. Kills any previous pulse tween first, since obstacles are
     *  pooled/reused across levels and may carry over a tween from a previous spawn. */
    private _startPulse(pulse?: ObstaclePulseConfig): void {
        this._pulseTween?.kill();
        this._pulseTween = undefined;
        this.scale.set(this._initialScale, this._initialScale, this._initialScale);

        if (this._pulseConfig.duration <= 0) return;

        const peakScale = this._initialScale * this._pulseConfig.scale;
        this._pulseTween = gsap.to(this.scale, {
            x: peakScale,
            y: peakScale,
            z: peakScale,
            duration: this._pulseConfig.duration,
            ease: 'sine.inOut',
            yoyo: true,
            repeat: -1,
        });
    }

    public update(delta: number): void {
        if (!this._movement || this._movement.speed <= 0) return;

        this._previousPosition.copy(this.position);
        if (this._movement.axis === 'circular') {
            const radius = this._movement.radius ?? 0;
            if (radius <= 0) return;

            this._angle += this._movement.speed * delta;
            this.position.x = this._basePosition.x + Math.cos(this._angle) * radius;
            this.position.z = this._basePosition.z + Math.sin(this._angle) * radius;
            this._clampToBounds();
            this._rotateTowardsMovement();
            return;
        }

        const distance = this._movement.distance ?? 0;
        if (distance <= 0) return;

        this._moveOffset += this._moveDirection * this._movement.speed * delta;
        if (this._moveOffset >= distance) {
            this._moveOffset = distance;
            this._moveDirection = -1;
        } else if (this._moveOffset <= -distance) {
            this._moveOffset = -distance;
            this._moveDirection = 1;
        }

        if (this._movement.axis === 'horizontal') {
            this.position.x = this._basePosition.x + this._moveOffset;
        } else {
            this.position.z = this._basePosition.z + this._moveOffset;
        }
        this._clampToBounds();
        this._rotateTowardsMovement();
    }

    /** Keeps the obstacle's mesh fully inside the level walls, regardless of its configured movement values. */
    private _clampToBounds(): void {
        if (!this._bounds) return;

        const { xPosition, zPosition } = this._bounds;
        this.position.x = Math.min(Math.max(this.position.x, xPosition.min + this._radius), xPosition.max - this._radius);
        this.position.z = Math.min(Math.max(this.position.z, zPosition.min + this._radius), zPosition.max - this._radius);
    }

    /** Faces the obstacle towards the direction it just moved, based on this frame's position delta. */
    private _rotateTowardsMovement(): void {
        const dx = this.position.x - this._previousPosition.x;
        const dz = this.position.z - this._previousPosition.z;
        if (Math.abs(dx) < 1e-5 && Math.abs(dz) < 1e-5) return;

        this.rotation.y = Math.atan2(dx, dz);
    }

    /** Stops the looping scale pulse and resets scale to base. Called when the obstacle is returned to its
     *  pool (hidden) between levels, so it doesn't keep tweening while off-screen. */
    public stopPulse(): void {
        this._pulseTween?.kill();
        this._pulseTween = undefined;
        this.scale.set(this._initialScale, this._initialScale, this._initialScale);
    }

    public isInHitRange(character: Object3D): boolean {
        const distance = this.position.distanceTo(character.position);
        return distance <= this._hitRange;
    }
}
