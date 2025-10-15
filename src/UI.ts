import * as w4 from "./wasm4";
import {Mouse} from "./Mouse";


export function update() : void {
    Mouse.update(); // Update Mouse
}


export class UIElement {
    x : i16;
    y : i16;
    hidden   : bool;

    constructor() {
        this.x = 0;
        this.y = 0;
        this.hidden = false;
    }

    update(x: i16, y: i16) : void {}
}

export class Text extends UIElement {
    
    text : string;
    centered : bool;
    
    private static offset : u16 = 1;
    private static fontWidth : u16 = 128;
    private static fontFlags : u32 = w4.BLIT_1BPP;
    private static charWidth : u16= 3;
    private static charHeight : u16= 5;
    private static charset  : string= "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890.- ";
    private static font : usize = memory.data<u8>([ 0x59,0x6f,0xdd,0xe6,0xcb,0x7e,0xf9,0xfb,0x6d,0xbd,0x7f,0x7f,0xff,0xf0,0x00,0x00,0xb6,0xd9,0x25,0x46,0xcf,0xed,0xb6,0x2b,0x6d,0xa5,0x13,0x64,0x36,0xd0,0x00,0x00,0xfa,0x5d,0xaf,0x47,0x4f,0xee,0xbb,0xab,0x7a,0x49,0x7f,0xff,0x3f,0xd1,0xc0,0x00,0xb6,0xd9,0x2d,0x56,0xcb,0xec,0xf4,0xab,0x7d,0x51,0x42,0x4d,0x34,0xd0,0x00,0x00,0xb9,0x6f,0x1d,0xea,0xfb,0x7c,0xf7,0x2e,0xad,0x5d,0x7e,0x7f,0x3f,0xf4,0x00,0x00 ]);

    constructor(x: i16, y: i16, text: string, centered: bool) {
        super();
        this.x = x;
        this.y = y;
        this.text = text.toUpperCase();
        this.centered = centered;
    }

    static write(text: string, x: i32, y: i32, colors: u16) : void {
        // Set draw colors...
        store<u16>(w4.DRAW_COLORS, colors);

        // Line and column counters.
        let line  : i32 = 0;
        let column: i32 = 0;

        // Iterate through each character...
        for(let i = 0; i < text.length; i += 1) {
            const char: string = text.charAt(i);
            const charCode: i32 = char.charCodeAt(0);

            // Break into next line when encounter a "\n" (newline)...
            if(charCode === 10) {
                line  += 1;
                column = 0;
                continue;
            }

            // Character index on charset.
            let charIndex: i32 = Text.charset.indexOf(char);

            // Draw character...
            w4.blitSub(
                Text.font,
                x + (column * (Text.charWidth+Text.offset)),
                y + (line * (Text.charHeight+Text.offset)),
                Text.charWidth,
                Text.charHeight,
                charIndex * Text.charWidth,
                0,
                Text.fontWidth,
                Text.fontFlags
            );

            // Advance to next column...
            column += 1;
        }
    }

    update(x: i16, y: i16) : void {
        if(this.hidden) { return; }
        let offsetX : i16 = 0;
        let offsetY : i16 = 0;
        if(this.centered) {
            offsetX = <i16>(this.text.length * Text.charWidth * -0.5);
            offsetY = -2;
        }
        Text.write(this.text, this.x+x+offsetX, this.y+y+offsetY, 0x40);
    }
}

export class Window extends UIElement {
    width: u16;
    height: u16;
    color : u16;
    elements : Array<UIElement>;

    constructor(x: i16, y: i16, width: u16, height: u16, color : u16) {
        super();
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
        this.elements = []; 
    }

    update(x: i16, y: i16): void {
        if(this.hidden) { return; }
        x += this.x;
        y += this.y;
        store<u16>(w4.DRAW_COLORS, this.color);
        w4.rect(x, y, this.width, this.height);
        
        const length = this.elements.length;
        for (let i = 0; i < length; i++) {
            this.elements[i].update(x, y);
        }
    }

    append(element: UIElement): i32 {
        return this.elements.push(element);
    }
}

export class Button extends UIElement{
    text: string;
    width: i16;
    height: i16;
    padding: u8;

    isPressed: boolean;
    isHold: boolean;
    isRelesed: boolean;
    isHovered: boolean;

    constructor(x: i16, y: i16, text: string, padding: u8) {
        super();
        this.x = x;
        this.y = y;
        this.text = text.toUpperCase();
        this.width = <i16>(text.length * 4 + 3 + 2*padding);
        this.height = 9 + 2*padding;
        this.padding = padding;
        this.isHold = false;
    }

    private draw(x: i16, y: i16) : void {
        if(!this.isHold) {
            store<u16>(w4.DRAW_COLORS, 0x44);
            w4.hline(x, y+this.height, this.width);
        }

        if(this.isHovered || this.isHold) {
            store<u16>(w4.DRAW_COLORS, 0x42);
        }else{
            store<u16>(w4.DRAW_COLORS, 0x43);
        }
        y += this.isHold ? 1 : 0;
        w4.rect(x, y, this.width, this.height);
        Text.write(this.text, x+2+this.padding, y+2+this.padding, 0x40);
    }

    update(x: i16, y: i16) : void {
        if(this.hidden) { this.isHold = this.isPressed = this.isRelesed = false; return; }
        x += this.x;
        y += this.y;

        let prev = (Mouse.previousState & w4.MOUSE_LEFT);
        let now = (Mouse.currentState & w4.MOUSE_LEFT);

        this.isHovered = (Mouse.x > x && Mouse.x < x+this.width && Mouse.y > y && Mouse.y < y+this.height);

        if(this.isPressed) { this.isPressed = false; }
        if(this.isHovered) {
            if(!prev && now) {
                this.isHold = this.isPressed = true;
            }
            this.isRelesed = (this.isHold && !now);
        }
        if(!now) {
            this.isHold = false;
        }
        this.draw(x, y);
    }
}

export class Slider extends UIElement{
    text: string;
    width: i16;
    min: i16;
    max: i16;
    value: f32;
    step: f32;
    
    private holdout: u8 = 0;
    private decreaseButton: Button;
    private increaseButton: Button;
    private knobButton: Button;

    isHold: bool;

    
    constructor(x: i16, y: i16, text: string, width: u8, min: i16, max: i16, defaultValue: f32, step: f32) {
        super();
        this.x = x;
        this.y = y;
        this.text = text.toUpperCase();
        this.min = min;
        this.max = max;
        this.width = width;
        this.value = defaultValue;
        this.step = step;
        this.isHold = false;
        this.decreaseButton = new Button(0, 0, " ", 0);
        this.increaseButton = new Button(this.width-7, 0, " ", 0);
        this.knobButton = new Button(0, 0, " ", 0);
    }

    private draw(x: i16, y: i16) : void {
        

        store<u16>(w4.DRAW_COLORS, 0x44);
        w4.hline(x+9, y+5, <u32>this.width-18);
        this.decreaseButton.update(x, y);
        this.increaseButton.update(x, y);
        this.knobButton.update(<i16>(x + 8 + ((this.width - 23) * (this.value-this.min) / <f32>(this.max-this.min))), y);
        Text.write(this.text + " " + this.trimFloatStr(this.value.toString()), x, y-6, 0x40);
    }

    update(x: i16, y: i16) : void {
        if(this.hidden) { this.isHold = false; return; }
        x += this.x;
        y += this.y;
        this.draw(x, y);


        if(this.decreaseButton.isHold && !this.holdout) { this.value -= this.step; }
        if(this.increaseButton.isHold && !this.holdout) { this.value += this.step; }

        if(this.decreaseButton.isPressed) { this.holdout = 8; } // Set time from pressing "+", "-" buttons to fast scroling (default: 8 frames)
        if(this.increaseButton.isPressed) { this.holdout = 8; } // ****************************************************************************

        if(this.holdout) { this.holdout--; }

        //if(Mouse.x > x)
        if(this.knobButton.isHold) {
            this.value = <f32>((this.max-this.min) * (<f32>Mouse.x - <f32>x - 12) / <f32>(this.width - 25) + this.min );
        }

        this.value = <f32>Math.max(this.min, Math.min(this.value, this.max));
        this.roundToStep();

    }

    private trimFloatStr(s: string): string {
        let dot = s.indexOf(".");
        if (dot == -1) return s;
        let end = dot + 3;
        if (end > s.length) end = s.length;
        return s.substring(0, end);
    }

    private roundToStep(): void {
        this.value = <f32>Math.round(this.value / this.step) * this.step;
    }

}