import { Group, Mesh, BoxGeometry, MeshStandardMaterial, Object3D, Vector3 } from 'three';
import BoundaryManager from './BoundaryManager';
import { LevelBoundsData } from '../types/game';

/* ---------------------------------------------------
   LEVEL WALLS

   Builds four cube walls that close off a rectangular
   playable area (defined by data/levelBounds.ts) and
   registers each one as a collider with BoundaryManager,
   reusing its Unity-style "addColliderToObject" so the
   character blocks against them just like the slot
   machine. Resize the area by editing the bounds data,
   no code changes needed.
--------------------------------------------------- */
export default class LevelWalls extends Group {
    private _walls: Mesh[] = [];
    private _wallIdPrefix: string = 'level-wall-';
    // Extra margin added to each wall's auto-fit collider so the character
    // can't visually clip into the wall mesh before the collision triggers.
    private _colliderPadding: Vector3 = new Vector3(1, 1, 1);

    constructor(data: LevelBoundsData) {
        super();
        this._createWalls(data);
    }

    private _createWalls(data: LevelBoundsData): void {
        const { xPosition, zPosition, floorY, wallHeight, wallThickness, wallColor } = data;

        const width = xPosition.max - xPosition.min;
        const depth = zPosition.max - zPosition.min;
        const centerX = (xPosition.min + xPosition.max) * 0.5;
        const centerZ = (zPosition.min + zPosition.max) * 0.5;
        const wallY = floorY + wallHeight * 0.5;

        const material = new MeshStandardMaterial({ color: wallColor });

        // North / south walls run along the X axis and block +Z / -Z.
        // Extended by wallThickness on each side so the corners stay sealed
        // against the east/west walls.
        this._addWall(
            new BoxGeometry(width + wallThickness * 2, wallHeight, wallThickness),
            centerX, wallY, zPosition.max + wallThickness * 0.5,
            material
        );
        this._addWall(
            new BoxGeometry(width + wallThickness * 2, wallHeight, wallThickness),
            centerX, wallY, zPosition.min - wallThickness * 0.5,
            material
        );

        // East / west walls run along the Z axis and block +X / -X.
        this._addWall(
            new BoxGeometry(wallThickness, wallHeight, depth + wallThickness * 2),
            xPosition.max + wallThickness * 0.5, wallY, centerZ,
            material
        );
        this._addWall(
            new BoxGeometry(wallThickness, wallHeight, depth + wallThickness * 2),
            xPosition.min - wallThickness * 0.5, wallY, centerZ,
            material
        );
    }

    private _addWall(geometry: BoxGeometry, x: number, y: number, z: number, material: MeshStandardMaterial): void {
        const wall = new Mesh(geometry, material);
        wall.position.set(x, y, z);
        wall.castShadow = true;
        wall.receiveShadow = true;
        this._walls.push(wall);
        this.add(wall);
    }

    /** Registers each wall as an auto-fit collider on the given BoundaryManager. */
    public registerColliders(boundaryManager: BoundaryManager): void {
        this._walls.forEach((wall: Object3D, index: number) => {
            boundaryManager.addColliderToObject(wall, this._colliderPadding, `${this._wallIdPrefix}${index}`);
        });
    }
}
