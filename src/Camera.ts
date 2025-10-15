
export class Camera {
    static x: f32 = 0;
    static y: f32 = 0;
    static zoom: f32 = 1;

    static changeZoomTo(zoom: f32, anchorX: i32 = 80, anchorY: i32 = 80): void {
        if (zoom < 0.01) return;

        this.x += <f32>(anchorX * (1.0 / this.zoom - 1.0 / zoom));
        this.y += <f32>(anchorY * (1.0 / this.zoom - 1.0 / zoom));
        this.zoom = zoom;
    }
}