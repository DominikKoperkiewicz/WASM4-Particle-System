import * as w4 from "./wasm4";

export class Mouse {
    static x: i16;
    static y: i16;
    static currentState: u8;
    static previousState: u8;

    static update(): void  {
        Mouse.previousState = Mouse.currentState;
        Mouse.x = load<i16>(w4.MOUSE_X);
        Mouse.y = load<i16>(w4.MOUSE_Y);
        Mouse.currentState = load<u8>(w4.MOUSE_BUTTONS);
    }
}