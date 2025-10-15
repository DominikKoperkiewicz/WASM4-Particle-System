import * as w4 from "./wasm4";
import * as UI from "./UI"

export class Debug {
    static logs: Array<string> = [];
    static timer: u8 = 250;
    static hide: boolean = true;
    static button: UI.Button = new UI.Button(150, 147, ".", 1);

    static log(message: string): void {
        if (this.hide) return;
        this.logs.unshift(message);
        this.timer = 250;

        if (this.logs.length > 5) {
            this.logs.pop();
        }
    }

    static update(): void {
        if (!this.hide) {
            const length = this.logs.length;

            for (let i = 0; i < length; i++) {
                store<u16>(w4.DRAW_COLORS, 0x03);
                w4.rect(-1, 153 - 8*i, 180, 7);
                UI.Text.write(this.logs[i], 1, 154 - 8*i, 0x40);
            }

            if (length != 0) {
                this.timer--;
                if (this.timer < 1) {
                    this.timer = 250;
                    this.logs.pop();
                }
            }
        }

        if (this.button.isPressed) {
            this.hide = !this.hide;
            this.logs.length = 0;
        }
        this.button.update(0, 0);
    }

}