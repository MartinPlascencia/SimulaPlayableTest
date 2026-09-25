import { Box3, Vector3, Object3D, Scene, Matrix3, Matrix4, Euler, BoxGeometry, EdgesGeometry, LineBasicMaterial, LineSegments, MeshBasicMaterial } from 'three';
import { OBB } from 'three/addons/math/OBB.js';

export default class BoundaryManager {
    private _boundaries: Map<string, OBB> = new Map();
    private _helpers: Map<string, LineSegments> = new Map();
    private _objectColliders: Map<string, { object: Object3D, padding: Vector3 }> = new Map();
    private _debugScene: Scene | null = null;
    private _debugColor: number = 0x00ff00;

    public addBoundary(id: string, center: Vector3, size: Vector3, rotation?: { x: number, y: number, z: number }): void {
        const halfSize = size.clone().multiplyScalar(0.5);
        const obb = new OBB(center, halfSize, this._createRotationMatrixFromDegrees(rotation));
        this._boundaries.set(id, obb);

        if (this._debugScene) {
            this.addHelper(id, obb);
        }
    }

    /* ---------------------------------------------------
       UNITY-STYLE "ADD COLLIDER TO OBJECT"

       Instead of hand-tuning center/size/rotation numbers,
       just point this at a 3D object and it auto-fits a
       box collider to its current world bounds (like
       dropping a Box Collider on a GameObject in Unity).
    --------------------------------------------------- */

    public addColliderToObject(object: Object3D, padding: Vector3 = new Vector3(), id: string = object.uuid): void {
        this._objectColliders.set(id, { object, padding });
        this._updateObjectCollider(id);
    }

    public removeColliderFromObject(object: Object3D): void {
        this.removeBoundary(object.uuid);
    }

    /**
     * Recomputes every object-attached collider from its object's current
     * world position/rotation/scale. Cheap to call every frame for a
     * handful of objects; call this once per frame if any of the
     * colliding objects can move.
     */
    public updateObjectColliders(): void {
        this._objectColliders.forEach((_, id) => this._updateObjectCollider(id));
    }

    private _updateObjectCollider(id: string): void {
        const entry = this._objectColliders.get(id);
        if (!entry) return;

        const { object, padding } = entry;
        object.updateMatrixWorld(true);

        const box = new Box3().setFromObject(object);
        const center = box.getCenter(new Vector3());
        const size = box.getSize(new Vector3()).add(padding);
        const halfSize = size.multiplyScalar(0.5);

        const obb = new OBB(center, halfSize, new Matrix3());
        this._boundaries.set(id, obb);

        if (this._debugScene) {
            this.removeHelper(id);
            this.addHelper(id, obb);
        }
    }

    private _createRotationMatrixFromDegrees(rotationDegrees: { x?: number, y?: number, z?: number } = {}): Matrix3 {
        const { x = 0, y = 0, z = 0 } = rotationDegrees;
        const euler = new Euler(
            x * (Math.PI / 180),  // Convert degrees to radians
            y * (Math.PI / 180),
            z * (Math.PI / 180),
            'XYZ'  // Order of rotations; adjust if needed (e.g., 'YXZ')
        );
        const matrix4 = new Matrix4().makeRotationFromEuler(euler);
        return new Matrix3().setFromMatrix4(matrix4);
    }

    public removeBoundary(id: string): void {
        this._boundaries.delete(id);
        this._objectColliders.delete(id);
        this.removeHelper(id);
    }

    private removeHelper(id: string): void {
        const helper = this._helpers.get(id);
        if (helper && this._debugScene) {
            this._debugScene.remove(helper);
        }
        this._helpers.delete(id);
    }

    public clear(): void {
        this._boundaries.clear();
        this._objectColliders.clear();
        if (this._debugScene) {
            this._helpers.forEach(helper => this._debugScene!.remove(helper));
        }
        this._helpers.clear();
    }

    /* ---------------------------------------------------
       COLLISION CHECKS
    --------------------------------------------------- */

    public isCollidingWithAny(object: Object3D, customSize?: Vector3): boolean {
        const objectBox = this._createObjectBox(object, customSize);

        for (const obb of Array.from(this._boundaries.values())) {
            if (obb.intersectsBox3(objectBox)) {
                return true;
            }
        }

        return false;
    }

    public getCollidingBoundary(object: Object3D): string | null {
        const objectBox = new Box3().setFromObject(object);

        for (const [id, obb] of Array.from(this._boundaries.entries())) {
            if (obb.intersectsBox3(objectBox)) {
                return id;
            }
        }

        return null;
    }

    public getAllCollisions(object: Object3D): string[] {
        const objectBox = new Box3().setFromObject(object);
        const result: string[] = [];

        for (const [id, obb] of Array.from(this._boundaries.entries())) {
            if (obb.intersectsBox3(objectBox)) {
                result.push(id);
            }
        }

        return result;
    }

    private _createObjectBox(object: Object3D, customSize?: Vector3): Box3 {
        const objectBox = new Box3();
        if (customSize) {
            // Use custom size centered at object's position (assuming axis-aligned)
            const center = object.position.clone();
            const half = customSize.clone().multiplyScalar(0.5);
            objectBox.set(center.clone().sub(half), center.clone().add(half));
        } else {
            // Default: Compute from object's geometry and children
            objectBox.setFromObject(object);
        }
        return objectBox;
    }

    /* ---------------------------------------------------
       COLLISION RESOLUTION
    --------------------------------------------------- */

    public getResolutionVector(object: Object3D): Vector3 | null {
        const objectBox = new Box3().setFromObject(object);
        const objectCenter = objectBox.getCenter(new Vector3());
        const objectHalfSize = objectBox.getSize(new Vector3()).multiplyScalar(0.5);
        const objectOBB = new OBB(objectCenter, objectHalfSize, new Matrix3()); // Identity rotation for AABB

        const collidingIds = this.getAllCollisions(object);
        let totalMTV = new Vector3();

        for (const id of collidingIds) {
            const boundaryOBB = this._boundaries.get(id)!;
            const mtv = this.getMTV(objectOBB, boundaryOBB);
            if (mtv) {
                totalMTV.add(mtv);
            }
        }

        return totalMTV.lengthSq() > 0 ? totalMTV : null;
    }

    private getMTV(obb1: OBB, obb2: OBB): Vector3 | null {
        const axes: Vector3[] = [];

        // OBB1 axes
        const r1 = obb1.rotation;
        axes.push(new Vector3(r1.elements[0], r1.elements[1], r1.elements[2]));
        axes.push(new Vector3(r1.elements[3], r1.elements[4], r1.elements[5]));
        axes.push(new Vector3(r1.elements[6], r1.elements[7], r1.elements[8]));

        // OBB2 axes
        const r2 = obb2.rotation;
        axes.push(new Vector3(r2.elements[0], r2.elements[1], r2.elements[2]));
        axes.push(new Vector3(r2.elements[3], r2.elements[4], r2.elements[5]));
        axes.push(new Vector3(r2.elements[6], r2.elements[7], r2.elements[8]));

        // Cross products
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                const axis1 = axes[i].clone();
                const axis2 = axes[3 + j].clone();
                const cross = axis1.cross(axis2);
                if (cross.lengthSq() > 1e-6) {
                    cross.normalize();
                    axes.push(cross);
                }
            }
        }

        let minOverlap = Infinity;
        let mtvAxis: Vector3 | null = null;
        let mtvSign = 1;

        for (const axis of axes) {
            const proj1 = this.projectOBBOnAxis(obb1, axis);
            const proj2 = this.projectOBBOnAxis(obb2, axis);
            const overlap = this.getOverlap(proj1.min, proj1.max, proj2.min, proj2.max);

            if (overlap <= 0) {
                return null; // Should not happen since we checked intersection
            }

            if (overlap < minOverlap) {
                minOverlap = overlap;
                mtvAxis = axis.clone();
                const c1 = obb1.center.dot(axis);
                const c2 = obb2.center.dot(axis);
                mtvSign = c1 > c2 ? 1 : -1;
            }
        }

        if (mtvAxis) {
            return mtvAxis.multiplyScalar(minOverlap * mtvSign);
        }

        return null;
    }

    private projectOBBOnAxis(obb: OBB, axis: Vector3): { min: number; max: number } {
        const r = obb.rotation;
        const h = obb.halfSize;
        const centerProj = obb.center.dot(axis);

        const ext =
            Math.abs(new Vector3(r.elements[0], r.elements[1], r.elements[2]).dot(axis)) * h.x +
            Math.abs(new Vector3(r.elements[3], r.elements[4], r.elements[5]).dot(axis)) * h.y +
            Math.abs(new Vector3(r.elements[6], r.elements[7], r.elements[8]).dot(axis)) * h.z;

        return { min: centerProj - ext, max: centerProj + ext };
    }

    private getOverlap(min1: number, max1: number, min2: number, max2: number): number {
        if (max1 < min2 || max2 < min1) return 0;
        return Math.min(max1, max2) - Math.max(min1, min2);
    }

    /* ---------------------------------------------------
       DEBUG
    --------------------------------------------------- */

    private addHelper(id: string, obb: OBB): void {
        const geometry = new BoxGeometry(obb.halfSize.x * 2, obb.halfSize.y * 2, obb.halfSize.z * 2);
        const edges = new EdgesGeometry(geometry);
        const material = new LineBasicMaterial({ color: this._debugColor });
        const helper = new LineSegments(edges, material);

        helper.position.copy(obb.center);
        const rotationMatrix = new Matrix4().setFromMatrix3(obb.rotation);
        helper.quaternion.setFromRotationMatrix(rotationMatrix);

        this._debugScene!.add(helper);
        this._helpers.set(id, helper);
    }

    public enableDebug(scene: Scene, color = 0x00ff00): void {
        this.disableDebug();
        this._debugScene = scene;
        this._debugColor = color;

        this._boundaries.forEach((obb, id) => {
            this.addHelper(id, obb);
        });
    }

    public disableDebug(): void {
        if (this._debugScene) {
            this._helpers.forEach(helper => {
                this._debugScene!.remove(helper);
            });
        }
        this._helpers.clear();
        this._debugScene = null;
    }
}