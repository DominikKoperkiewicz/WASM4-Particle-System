import * as w4 from "./wasm4";
import * as UI from "./UI"
import {Camera} from "./Camera";
import {PARTICLE_POOL_SIZE, ParticleSettings, ParticleSystem, TYPE_LINE, TYPE_OVAL, TYPE_RECT} from "./ParticleSystem";
import {CameraNavigator} from "./CameraNavigator";
import {Mouse} from "./Mouse";

const TAB_NAMES = [
    "PARTICLE SETTINGS 1",
    "PARTICLE SETTINGS 2",
    "SETTINGS",
]

const INSPECTOR_HEIGHT: i16 = 160 - 80;

const tabNumber: u32 = 3;
const particleSettings: ParticleSettings = new ParticleSettings(4, 2, -0.08, 0.0, 6.283, 0.085, 0.3, 0.1, 0.02,0.0, 60,0x33, TYPE_LINE);

let time: u32 = 0;
let inspectorY: i16 = INSPECTOR_HEIGHT+4;
let openTab: i32 = 0;
let gamepadPrevious: u8 = load<u8>(w4.GAMEPAD1);
let exportNotificationTimer: u8 = 100;

let emitterOn: boolean = true;
let emitterX1: f32 = 80;
let emitterY1: f32 = 80;
let emitterX2: f32 = 80;
let emitterY2: f32 = 80;


const inspector: UI.Window = new UI.Window(-1, 0, 162, 160 - INSPECTOR_HEIGHT, 0x42);
//let inspectorHandle: UI.Button =  new UI.Button( 153, -11, "-", 0); inspector.elements.push(inspectorHandle);
const inspectorHandle: UI.Button =  new UI.Button( -2, -8, "                    -                    ", 0); inspector.elements.push(inspectorHandle);
const resetCameraButton: UI.Button =  new UI.Button( 121, -19, "RESET CAM", 0); inspector.elements.push(resetCameraButton);

const tabButtons: Array<UI.Button> = new Array<UI.Button>();
for(let i: u32 = 0; i < tabNumber; i++) {
    tabButtons.push(new UI.Button(<i16>(i * 8 + 2), -19, (i+1).toString(), 0));
    inspector.elements.push(tabButtons[i]);
}
const tabLabel: UI.Text = new UI.Text(2, -25, TAB_NAMES[0], false);  inspector.elements.push(tabLabel);

// PARTICLE TAB SETUP 1

const firstParticleTab: UI.Window = new UI.Window(0, 0, 0, 0, 0x00); inspector.elements.push(firstParticleTab);

//const someParticleSettings: ParticleSettings = new ParticleSettings(10, 0, -0.1, 0.0, 6.283, 0.085, 1.0, 1.0, 0.1,0.0, 60, TYPE_RECT);

const sizeSlider: UI.Slider = new UI.Slider(6, 10, "Size", 70, 0, 30, 10, 1.0); firstParticleTab.elements.push(sizeSlider);
const sizeVarianceSlider: UI.Slider = new UI.Slider( 6, 28, "Size Var", 70, 0, 15, 0, 1.0); firstParticleTab.elements.push(sizeVarianceSlider);
const sizeChangeSlider: UI.Slider = new UI.Slider( 6, 46, "Size Change", 70, -3, 3, -0.2, 0.01); firstParticleTab.elements.push(sizeChangeSlider);
const lifetimeSlider: UI.Slider = new UI.Slider( 6, 63, "Lifetime", 70, 1, 100, 60, 1.0); firstParticleTab.elements.push(lifetimeSlider);

const directionSlider: UI.Slider = new UI.Slider(86, 10, "Dir.", 70, 0, 360, 0.0, 0.5); firstParticleTab.elements.push(directionSlider);
const directionVarianceSlider: UI.Slider = new UI.Slider(86, 28, "Dir. Var", 70, 0, 180, 180.0, 0.5); firstParticleTab.elements.push(directionVarianceSlider);
const directionChangeSlider: UI.Slider = new UI.Slider(86, 46, "Dir. Change", 70, -30, 30, 0.0, 0.1); firstParticleTab.elements.push(directionChangeSlider);

// PARTICLE TAB SETUP 2

const secondParticleTab: UI.Window = new UI.Window(0, 0, 0, 0, 0x00); inspector.elements.push(secondParticleTab);

const speedSlider: UI.Slider = new UI.Slider(6, 10, "Speed", 70, -5, 5, 1.0, 0.01); secondParticleTab.elements.push(speedSlider);
const speedVarianceSlider: UI.Slider = new UI.Slider( 6, 28, "Speed Var", 70, 0, 3, 0.5, 0.01); secondParticleTab.elements.push(speedVarianceSlider);
const speedChangeSlider: UI.Slider = new UI.Slider( 6, 46, "Speed Change", 70, -1, 1, 0.1, 0.01); secondParticleTab.elements.push(speedChangeSlider);
const gravitySlider: UI.Slider = new UI.Slider( 6, 63, "Gravity", 70, -2, 2, 0.0, 0.01); secondParticleTab.elements.push(gravitySlider);

const frequencySlider: UI.Slider = new UI.Slider(86, 10, "Freq.", 70, 1, 60, 60.0, 1); secondParticleTab.elements.push(frequencySlider);
const typeSlider: UI.Slider = new UI.Slider(86, 28, "Type", 70, 1, 3, 1, 1); secondParticleTab.elements.push(typeSlider);

const emitterOnOffButton: UI.Button = new UI.Button( 86, 44, "Emitter On ", 1); secondParticleTab.elements.push(emitterOnOffButton);
const randomizeButton: UI.Button = new UI.Button( 86, 61, "Randomize", 1); secondParticleTab.elements.push(randomizeButton);
// COLOR TAB SETUP

const colorsTab: UI.Window = new UI.Window(0, 0, 0, 0, 0x00); inspector.elements.push(colorsTab);
const red: UI.Slider = new UI.Slider(6, 10, "Red", 150, 0, 255, 48, 1.0); colorsTab.elements.push(red);
const green: UI.Slider = new UI.Slider(6, 28, "Green", 150, 0, 255, 104, 1.0); colorsTab.elements.push(green);
const blue: UI.Slider = new UI.Slider(6, 46, "Blue", 150, 0, 255, 80, 1.0); colorsTab.elements.push(blue);

const resetColorButton: UI.Button = new UI.Button( 6, 60, "Reset Color", 1); colorsTab.elements.push(resetColorButton);
const exportButton: UI.Button = new UI.Button( 56, 60, "Export Particle", 1); colorsTab.elements.push(exportButton);

// const colorButton1: UI.Button = new UI.Button( 6, 60, "Color 1", 1); colorsTab.elements.push(colorButton1);
// const colorButton2: UI.Button = new UI.Button( 40, 60, "Color 2", 1); colorsTab.elements.push(colorButton2);
// const colorButton3: UI.Button = new UI.Button( 74, 60, "Color 3", 1); colorsTab.elements.push(colorButton3);
// const colorButton4: UI.Button = new UI.Button( 108, 60, "Color 4", 1); colorsTab.elements.push(colorButton4);

const colorText: UI.Text = new UI.Text(140, 60, "4", false);


const tabs: Array<UI.Window> = new Array<UI.Window>();
tabs.push(firstParticleTab);
tabs.push(secondParticleTab);
tabs.push(colorsTab);

function HideAllTabs(): void {
    tabs.forEach(element => {
        element.hidden = true;
    });
}

function OpenTab(index: i32): void {
    if (tabs[index].hidden == false) return;
    HideAllTabs();
    tabs[index].hidden = false;
    openTab = index;

    inspectorY = INSPECTOR_HEIGHT;
}


function updateDisplayedTabName(): void {
    tabLabel.text = "";

    for (let i: u32 = 0; i < tabNumber; i++) {
        if (tabButtons[i].isHovered) {
            tabLabel.text = TAB_NAMES[i];
        }
    }
}

const degToRad: f32 = Mathf.PI / 180.0;
const radToDeg: f32 = 180.0 / Mathf.PI;

function ChangeParticleSettings(settings: ParticleSettings): void {
    settings.size = <u8>sizeSlider.value;
    settings.sizeVariance = <u8>sizeVarianceSlider.value;
    settings.sizeChange = sizeChangeSlider.value;
    settings.direction = directionSlider.value * degToRad;
    settings.directionVariance = directionVarianceSlider.value * degToRad;
    settings.directionChange = directionChangeSlider.value * degToRad;
    settings.speed = speedSlider.value;
    settings.speedVariance = speedVarianceSlider.value;
    settings.speedChange = speedChangeSlider.value;
    settings.gravity = gravitySlider.value;
    settings.lifetime = <u16>lifetimeSlider.value;

    switch (<u32>typeSlider.value) {
        case 1:
            settings.renderer = TYPE_RECT;
            break;
        case 2:
            settings.renderer = TYPE_OVAL;
            break;
        case 3:
            settings.renderer = TYPE_LINE;
            break;
    }
}

function ChangeSliderSettings(settings: ParticleSettings): void {
     sizeSlider.value = settings.size;
     sizeVarianceSlider.value = settings.sizeVariance;
     sizeChangeSlider.value = settings.sizeChange;
     directionSlider.value = settings.direction * radToDeg;
     directionVarianceSlider.value = settings.directionVariance * radToDeg;
     directionChangeSlider.value = settings.directionChange * radToDeg;
     speedSlider.value = settings.speed;
     speedVarianceSlider.value = settings.speedVariance;
     speedChangeSlider.value = settings.speedChange;
     gravitySlider.value = settings.gravity;
     lifetimeSlider.value = settings.lifetime;

     if (settings.renderer == TYPE_RECT) {
         typeSlider.value = 1;
     }
    if (settings.renderer == TYPE_OVAL) {
        typeSlider.value = 2;
    }
    if (settings.renderer == TYPE_LINE) {
        typeSlider.value = 3;
    }
}

function ChangePaletteRGB(): void {

    const color = 256*256 * <i32>red.value + 256 * <i32>green.value + <i32>blue.value;

    store<u32>(w4.PALETTE, color, 2 * sizeof<u32>());
}

function ResetPalette(): void {
    red.value = 48.0;
    green.value = 104.0;
    blue.value = 80.0;

    ChangePaletteRGB();
}

function GetParticleCount(): u8 {
    let count: u8 = 0;

    for (let i = 0; i < ParticleSystem.pool.length; i++) {
        let particle = ParticleSystem.pool[i];
        if (particle.enabled) {
            count++;
        }
    }

    return count;
}

function TurnEmitter(): void {
    emitterOn = !emitterOn;
    if (emitterOn) {
        emitterOnOffButton.text = "EMITTER ON ";
    } else {
        emitterOnOffButton.text = "EMITTER OFF";
    }
}

function ExportParticleSettings(settings: ParticleSettings): void {
    let pType = "";
    if (settings.renderer == TYPE_RECT) {
        pType = "TYPE_RECT";
    }
    if (settings.renderer == TYPE_OVAL) {
        pType = "TYPE_OVAL";
    }
    if (settings.renderer == TYPE_LINE) {
        pType = "TYPE_LINE";
    }
    const output: string = `const myParticle: ParticleSettings = new ParticleSettings(${settings.size}, ${settings.sizeVariance}, ${settings.speedChange}, ${settings.direction}, ${settings.directionVariance}, ${settings.directionChange}, ${settings.speed}, ${settings.speedVariance}, ${settings.speedChange}, ${settings.gravity}, ${settings.lifetime}, ${pType});\n\n`;

    w4.trace(output);

    const dataLength: i32 = 1000;
    let ptr: usize = memory.data( sizeof<u8>() * dataLength);

    for (let i = 0; i < dataLength; i++) {
        store<u8>(ptr + i * sizeof<u8>(), output.charCodeAt(i));
    }
    w4.diskw(ptr, sizeof<u8>() * dataLength);

    exportNotificationTimer = 0;
}

function Swap<T>(a: T, b: T): void {
    const t: T = a;
    a = b;
    b = t;
}

function RandomizeSliderValue(slider: UI.Slider, scale: f32): void {
    slider.value = (slider.max - slider.min) * Mathf.random() + slider.min;
    slider.value = <f32>Math.round(slider.value / slider.step) * slider.step;
    slider.value = slider.value * scale;
}

function RandomizeParticleSettings(): void {
    RandomizeSliderValue(sizeSlider, 0.8);
    RandomizeSliderValue(sizeVarianceSlider, 0.8);
    RandomizeSliderValue(sizeChangeSlider, 0.5);
    RandomizeSliderValue(directionSlider, 1.0);
    RandomizeSliderValue(directionVarianceSlider, 1.0);
    RandomizeSliderValue(directionChangeSlider, 0.5);
    RandomizeSliderValue(speedSlider, 0.6);
    RandomizeSliderValue(speedVarianceSlider, 0.6);
    RandomizeSliderValue(speedChangeSlider, 0.2);
    RandomizeSliderValue(gravitySlider, 0.5);
    RandomizeSliderValue(typeSlider, 1.0);

    // RandomizeSliderValue(lifetimeSlider);
    // RandomizeSliderValue(frequencySlider);
}

function GeneralSetup(): void {
    HideAllTabs();
    OpenTab(openTab);
    ChangeSliderSettings(particleSettings);
    ResetPalette();

    Camera.y = 40.0;
}

GeneralSetup();
export function update (): void {
    CameraNavigator.drawGrid();

    store<u16>(w4.DRAW_COLORS, 0x33);
    ParticleSystem.update();

    updateDisplayedTabName();
    UI.update();
    inspector.update(0, inspectorY);

    if (inspectorHandle.isHold) { inspectorY = <i16>Mathf.max(<f32>INSPECTOR_HEIGHT+4.0, Mathf.min(160, Mouse.y+5)); }


    tabButtons.forEach((element, index) => {
        if(element.isPressed) { OpenTab(index); }
    });

    if (exportNotificationTimer < 70) {
        exportNotificationTimer++;
        UI.Text.write("FILE EXPORTED", 62, 134-exportNotificationTimer / 8, 0x40);
    }



    if (time % <i32>(60.0 / frequencySlider.value) == 0) {
        if (emitterOn) {
            const randX: f32 = Mathf.random() * (emitterX2-emitterX1) + emitterX1;
            const randY: f32 = Mathf.random() * (emitterY2-emitterY1) + emitterY1;
            ParticleSystem.emit(randX, randY, particleSettings);
        }

        if (Mouse.currentState & w4.MOUSE_LEFT) {
            ParticleSystem.emit(<f32>Mouse.x / Camera.zoom + Camera.x, <f32>Mouse.y / Camera.zoom + Camera.y, particleSettings);
            ChangeParticleSettings(particleSettings);
            ChangePaletteRGB();
        }
    }
    if (resetCameraButton.isPressed) {
        Camera.x = 0;
        Camera.y = 40;
        Camera.zoom = 1;
    }
    if (resetColorButton.isPressed) {
        ResetPalette();
    }
    if (exportButton.isPressed) {
        ExportParticleSettings(particleSettings);
    }
    if (emitterOnOffButton.isPressed) {
        TurnEmitter();
    }
    if (randomizeButton.isPressed) {
        RandomizeParticleSettings();
    }

    const gamepad = load<u8>(w4.GAMEPAD1);

    if (gamepad & w4.BUTTON_2) {
        emitterX2 = (Mouse.x / Camera.zoom + Camera.x);
        emitterY2 = (Mouse.y / Camera.zoom + Camera.y);

        if ((gamepadPrevious & w4.BUTTON_2) == 0) {
            emitterX1 = emitterX2;
            emitterY1 = emitterY2;
        }

        let t: f32 = 0;
        if (emitterX1 > emitterX2) {
            t = emitterX1;
            emitterX1 = emitterX2;
            emitterX2 = t;
        }
        if (emitterY1 > emitterY2) {
            t = emitterY1;
            emitterY1 = emitterY2;
            emitterY2 = t;
        }

        store<u16>(w4.DRAW_COLORS, 0x30);
        w4.rect(<i32>((emitterX1 - Camera.x) * Camera.zoom), <i32>((emitterY1 - Camera.y) * Camera.zoom), <u32>((emitterX2 - emitterX1) * Camera.zoom), <u32>((emitterY2 - emitterY1) * Camera.zoom));
    }

    gamepadPrevious = load<u8>(w4.GAMEPAD1);
    time++;

    // ***** DEBUG *****
    CameraNavigator.anchorY = inspectorY / 2;
    CameraNavigator.update((Mouse.currentState & w4.MOUSE_MIDDLE) != 0, resetCameraButton.isHovered);

    UI.Text.write("COUNT " + GetParticleCount().toString() + " OF " + PARTICLE_POOL_SIZE.toString(), 1, 1, 0x40);
    //UI.Text.write("X " + Mouse.x.toString(), 1, 7, 0x40);
    //UI.Text.write("Y " + Mouse.y.toString(), 1, 13, 0x40);
}
