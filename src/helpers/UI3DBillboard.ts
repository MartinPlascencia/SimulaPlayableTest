import { Group, Mesh, PlaneGeometry, MeshBasicMaterial, CanvasTexture, Object3D, Vector3 } from 'three';

export default class UI3DBillboard {
    private _group: Group = new Group();
    private _mesh: Mesh;
    private _offset: Vector3 = new Vector3(0, 0.5, 0);
    private _canvas: HTMLCanvasElement;
    private _texture: CanvasTexture;
    private _width: number;
    private _height: number;
    private _bgColor: string = 'rgba(0,0,0,0.6)';
    private _textColor: string = '#ffffff';
    private _font: string = '32px Arial';
    private _padding: number = 20;
    private _cornerRadius: number = 10;

    constructor(width: number = 1, height: number = 0.3, offset?: Vector3) {
        this._width = width;
        this._height = height;
        offset && (this._offset = offset);
        this._canvas = document.createElement('canvas');
        this._canvas.width = 512; // Increased for better resolution
        this._canvas.height = 128;

        this._texture = new CanvasTexture(this._canvas);

        const material = new MeshBasicMaterial({
            map: this._texture,
            transparent: true,
            depthWrite: false,
        });

        this._mesh = new Mesh(new PlaneGeometry(this._width, this._height), material);
        this._group.add(this._mesh);
        //this._group.scale.set(scale, scale, scale);

        this.setText('UI');
    }

    public attachTo(target: Object3D): void {
        target.add(this._group);
        this._group.position.copy(this._offset);
    }

    public changeOffset(newOffset: Vector3): void {
        this._offset = newOffset;
        this._group.position.copy(this._offset);
    }

    public update(cameraPosition: Vector3): void {
        this._group.lookAt(cameraPosition);
    }

    private drawRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
        ctx.fill();
    }

    public setText(text: string): void {
        const ctx = this._canvas.getContext('2d')!;
        ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);

        // Set font to measure text
        ctx.font = this._font;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const metrics = ctx.measureText(text);
        const textWidth = metrics.width;
        const textHeight = parseInt(this._font, 10); // Approximate height from font size

        const rectWidth = textWidth + this._padding * 2;
        const rectHeight = textHeight + this._padding * 2;

        // Center the rect in the canvas
        const rectX = (this._canvas.width - rectWidth) / 2;
        const rectY = (this._canvas.height - rectHeight) / 2;

        // Draw rounded background
        ctx.fillStyle = this._bgColor;
        this.drawRoundedRect(ctx, rectX, rectY, rectWidth, rectHeight, this._cornerRadius);

        // Draw text
        ctx.fillStyle = this._textColor;
        ctx.fillText(text, this._canvas.width / 2, this._canvas.height / 2);

        this._texture.needsUpdate = true;
    }

    // Optional: Methods to customize colors, font, etc.
    public setBackgroundColor(color: string): void {
        this._bgColor = color;
    }

    public setTextColor(color: string): void {
        this._textColor = color;
    }

    public setFont(font: string): void {
        this._font = font;
    }

    public setPadding(padding: number): void {
        this._padding = padding;
    }

    public setCornerRadius(radius: number): void {
        this._cornerRadius = radius;
    }
}