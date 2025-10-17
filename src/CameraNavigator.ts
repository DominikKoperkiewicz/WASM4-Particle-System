import * as w4 from "./wasm4";
import * as UI from "./UI"
import {Camera} from "./Camera";
import {Mouse} from "./Mouse";

const NAVIGATOR_SENSITIVITY: f32 = 0.01;
const NAVIGATOR_MIN_ZOOM: f32 = 0.3;
const NAVIGATOR_MAX_ZOOM: f32 = 2.0;
const GRID_GAP: u8 = 40;

export class CameraNavigator {
    static anchorX: i32 = 80;
    static anchorY: i32 = 80;
    static previousAnchorDistance: f32 = 0;

    static grabX: i16 = 0;
    static grabY: i16 = 0;

    static update(drawCross: boolean = false, drawInfo: boolean = false): void {

        if (drawCross) {
            store<u16>(w4.DRAW_COLORS, 0x04);
            w4.hline(this.anchorX - 2, this.anchorY, 5);
            w4.vline(this.anchorX, this.anchorY - 2, 5);
        }

        if (drawInfo) {
            UI.Text.write("CAMX " + Camera.x.toString(), 128, 1, 0x40);
            UI.Text.write("CAMY " + Camera.y.toString(), 128, 7, 0x40);
            UI.Text.write("ZOOM " + Camera.zoom.toString(), 128, 13, 0x40);
        }



        // Camera Movement
        if(Mouse.currentState & w4.MOUSE_RIGHT) {
            if(Mouse.previousState & w4.MOUSE_RIGHT) {
                // HOLD
                Camera.x += (this.grabX - Mouse.x) / Camera.zoom;
                Camera.y += (this.grabY - Mouse.y) / Camera.zoom;
            }

            this.grabX = Mouse.x;
            this.grabY = Mouse.y;
        }


        if (Mouse.currentState & w4.MOUSE_MIDDLE) {
            let vecX: f32 = <f32>(Mouse.x - this.anchorX);
            let vecY: f32 = <f32>(Mouse.y - this.anchorY);
            vecX *= vecX;
            vecY *= vecY;

            const currentDistance: f32 = Mathf.sqrt(vecX + vecY);

            if((Mouse.previousState & w4.MOUSE_MIDDLE)) {
                let zoomValue = Camera.zoom + (currentDistance - this.previousAnchorDistance) * NAVIGATOR_SENSITIVITY;
                zoomValue = Mathf.min(Mathf.max(zoomValue, NAVIGATOR_MIN_ZOOM), NAVIGATOR_MAX_ZOOM);
                Camera.changeZoomTo(zoomValue, this.anchorX, this.anchorY);
            }

            this.previousAnchorDistance = currentDistance;

        }
    }

    static drawGrid(): void {
        store<u16>(w4.DRAW_COLORS, 0x02);
        for(let i = 0; i < 2 + 160 / <i32>((Camera.zoom * GRID_GAP)); i++) {
            w4.hline(0, <i32>(-Camera.y % GRID_GAP * Camera.zoom)  + <i32>(<f32>i*GRID_GAP * Camera.zoom), 160);
            w4.vline(<i32>(-Camera.x % GRID_GAP * Camera.zoom)  + <i32>(<f32>i*GRID_GAP * Camera.zoom), 0, 160);
        }
    }
}