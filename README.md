# WASM4 - Particle System v1.0

This is particle system made for  [WASM-4](https://wasm4.org/) fantasy console (AssemblyScript). It uses object pooling for particles with fixed pool size and camera which supports pan and zoom. 


## Table of Contents

- [WASM4 - Particle System v1.0](#wasm4---particle-system-v10)
  - [How to use](#how-to-use)
    - [Pool size](#pool-size)
    - [Particle Presets](#particle-presets)
    - [Particle Renderers](#particle-renderers)
- [Functions](#functions)
  - [Emit](#emit)
  - [Update](#update)
- [Camera](#camera)
  - [Zooming](#zooming)
- [Particle Editor](#particle-editor)
- [Other Tools](#other-tools)
  - [Mouse](#mouse)
  - [UI](#ui)
  - [CameraNavigator](#cameranavigator)
  - [Debug](#debug)

  

## How to use
To add particle system to your project you have to copy two source files from this repository:
* **ParticleSystem.ts**
* **Camera.ts**

in your main.ts file import Particle system

```  ts
import * as ParticleSystem from "./ParticleSystem";
```
or import only what you need *(Recommended)*: 
```  ts
import {ParticleSettings, ParticleSystem, TYPE_LINE, TYPE_OVAL, TYPE_RECT} from "./ParticleSystem";
```
*NOTE: Types are optional, depending on which one you will use*

### Pool size
Inside ParticleSystem.ts you can find parameter:
```ts 
export const PARTICLE_POOL_SIZE: u16 = 60;
```
You can set particle pool size (It tells how many particles can exist at once) by changing this value. If you have finished making your game, you can just increase pool size to 

### Particle Presets
To create particle preset, you need to declare ParticleSettings object with parameters:
```ts
const myParticle: ParticleSettings = (size, sizeVariance, sizeChange, direction, directionVariance, directionChange, speed, speedVariance, speedChange, gravity, lifetime, color, particleRenderer);

// Example
export const defaultParticle: ParticleSettings = new ParticleSettings(3, 0, 0.0, 0.0, 6.283, 0, 1.0, 0.0, 0.0, 0.0,40, 0x33, TYPE_RECT);
```

### Particle Renderers
In particle settings you have to pass renderer. There are three available renderers:
* `TYPE_RECT`
* `TYPE_OVAL`
* `TYPE_LINE`

They define shape of particle. To create your own custom renderer, you have to create new class extending ParticleRenderer and implementing *draw* method:
```ts
export class CustomRenderer extends ParticleRenderer {  
    draw(particle: Particle): void {  
	    // Your custom render function...
    }  
}
```
*NOTE: To make it work with dynamic camera, you should take into account camera state, when calculating position and size (Look at existing renderers for reference)*


 # Functions
 ParticleSystem is class with static methods for handling particles in your project.

## Emit
To emitt particle you should use this method:
``` ts
ParticleSystem.emit(x, y, particleSettings);
```
it will emit particle of given position and type, where *x* and *y* are world space coordinates. 

## Update
Inside your main update loop you should call method: 
``` ts
ParticleSystem.update();
```
It will process one step/frame for particles and draw them. 

*NOTE: Z-index/depth is not supported, so all particles will be drawn on the same layer (depending on your w4 drawing methods call order). *

# Camera
To use camera in your project you should import it into your main.ts file first:
```  ts
import {Camera} from "./Camera";
```

Camera.ts has a single class with static fields:
* `x: f32` - Camera x position *(default: 0.0)*
* `y: f32` - Camera y position *(default: 0.0)*
* `zoom: f32` - Camera zoom *(default: 1.0)*


Camera has pivot point in top-left corner, so by default screen space coordinates and world space coordinates are aligned, 

## Zooming
You can change zoom by directly changing Camera.zoom, but then it will zoom relative to world space point [0, 0], which in most cases is undesirable effect. That's why you can use following method: 
```ts
Camera.changeZoomTo(targetZoomValue, anchorX: i32 = 80, anchorY: i32 = 80);
```
Where:
`targetZoomValue` - target value for zoom change (range: [0.01, inf])
`anchorX` - screen space x position you want to zoom relative to *(by default set to 80 - center of the screen)*
`anchorY` - screen space y position you want to zoom relative to *(by default set to 80 - center of the screen)*

for zoom increasing value will zoom in; smaller value will zoom out. e.g.
2.0 would be two times closer and 0.5 would be two times further away from default value. 

# Particle Editor
To create particle presets easier you can use particle editor. WASM cart and whole editor code is in this repository, so you can just clone it and run it yourself, or use web version [LINK TO WEB VERSION SOON].

*NOTE: main.js code of Particle Editor is total mess, so i wouldn't recommend using it for anything else then running this project`

You can read how to use editor in website version description. 

# Other Tools

I created and used a few other tools in this project that you can use in your own projects, but they might be a bit less refined. 

## Mouse
`Mouse.ts` makes using mouse inputs a little bit easier. To import it use:
``` ts
import {Mouse} from "./Mouse";
```
Inside your main update loop you should call:
``` ts
Mouse.update();
```
Mouse class provides static fields: 
`x` - screen space mouse x position
`y` - screen space mouse Y position
`currentState` - current state of buttons
`previousState` - previous state of buttons

states are provided in the same form as from `load<u8>(w4.MOUSE_BUTTONS)` so you still need to use logic operations with masks. 

## UI
`UI.ts` is UI library that makes it easy to create windows, slider, buttons and labels. It takes quiet a lot RAM considering WASM4 limits and it's made mainly with tools like ParticleEditor in mind. There is also a lot to improve. You can read more about it in [dedicated repository](https://github.com/DominikKoperkiewicz/WASM4-UI-System).

**DEPENDENCIES: ** `Mouse.ts`

## CameraNavigator
`CameraNavigator.ts` provides easy camera manipulation with mouse and display of camera info. To import it use:
``` ts
import {CameraNavigator} from "./CameraNavigator";
```
Inside your main update loop you should call:
``` ts
CameraNavigator.update(drawCross = false, drawInfo = false);
```
Where:
`drawCross` - Is optional flag to choose if you want visible cross in the middle *(anchor point)* during zooming. 
`drawInfo` - Is optional flag to choose if you want camera info in top-right corner. 

You could also change achorX and anchorY coordinates. (during zooming moving mouse closer to anchor zooms-out and further from it would zoom-in).

**DEPENDENCIES: ** `Mouse.ts`, `UI.ts`*(UI is only for camera info display, so you could just remove this part of the code)*

## Debug
`Debug.ts` is debugging console visible inside WASM4 projects runtime. This tool is pretty **useless** but i made it before i realized there is `w4.trace()' method.

**DEPENDENCIES: ** `UI.ts`,`Mouse.ts`
