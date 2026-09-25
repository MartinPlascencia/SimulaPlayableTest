import { Group, Mesh, Clock, MeshLambertMaterial, PlaneGeometry, Vector3, Texture, DoubleSide } from 'three';

type SplashParticle = {
    mesh: Mesh;
    material: MeshLambertMaterial;
    velocity: Vector3;
};

type SplashInstance = {
    particles: SplashParticle[];
    elapsed: number;
};

export default class SplashEffect {
    private _group: Group;
    private _clock: Clock = new Clock();

    private _instances: SplashInstance[] = [];

    private _duration: number;
    private _useGravity: boolean;
    private _gravity: number = 9.8;
    private _sizeRange: { min: number; max: number };

    private _geometry: PlaneGeometry;
    private _texture: Texture;
    private _particlesPerSplash: number;

    constructor(
        texture: Texture,
        particlesPerSplash: number,
        duration: number = 1.2,
        minSize: number = 0.3,
        maxSize: number = 0.6,
        useGravity: boolean = true
    ) {
        this._group = new Group();
        this._texture = texture;
        this._particlesPerSplash = particlesPerSplash;
        this._duration = duration;
        this._useGravity = useGravity;
        this._sizeRange = { min: minSize, max: maxSize };

        this._geometry = new PlaneGeometry(1, 1);
    }

    public get object3D(): Group {
        return this._group;
    }

    /* ---------------------------------------------------
       PLAY NEW SPLASH (does NOT reset old ones)
    --------------------------------------------------- */

    public play(position: Vector3): void {
        const particles: SplashParticle[] = [];

        for (let i = 0; i < this._particlesPerSplash; i++) {
            const material = new MeshLambertMaterial({
                map: this._texture,
                transparent: true,
                opacity: 1,
                depthWrite: false,
                side: DoubleSide,
            });

            const mesh = new Mesh(this._geometry, material);
            mesh.position.copy(position);

            const size =
                this._sizeRange.min +
                Math.random() * (this._sizeRange.max - this._sizeRange.min);

            mesh.scale.set(size, size, size);

            const angle = Math.random() * Math.PI * 2;
            const spread = 1.5;
            const upward = 3 + Math.random() * 1.5;

            const velocity = new Vector3(
                Math.cos(angle) * spread,
                upward,
                Math.sin(angle) * spread
            );

            this._group.add(mesh);

            particles.push({ mesh, material, velocity });
        }

        this._instances.push({
            particles,
            elapsed: 0,
        });
    }

    /* ---------------------------------------------------
       UPDATE
    --------------------------------------------------- */

    public update(cameraPosition: Vector3): void {
        const delta = this._clock.getDelta();

        for (let i = this._instances.length - 1; i >= 0; i--) {
            const instance = this._instances[i];
            instance.elapsed += delta;

            const life = instance.elapsed / this._duration;

            for (const p of instance.particles) {
                if (this._useGravity) {
                    p.velocity.y -= this._gravity * delta;
                }

                p.mesh.position.addScaledVector(p.velocity, delta);
                p.mesh.lookAt(cameraPosition);
                p.material.opacity = Math.max(0, 1 - life);
            }

            if (instance.elapsed >= this._duration) {
                for (const p of instance.particles) {
                    this._group.remove(p.mesh);
                    p.material.dispose();
                }

                this._instances.splice(i, 1);
            }
        }
    }
}
