import * as w4 from "./wasm4";
import {Camera} from "./Camera";

export const PARTICLE_POOL_SIZE: u16 = 60;



abstract class ParticleRenderer {
    abstract draw(particle: Particle): void;
}

export class RectRenderer extends ParticleRenderer {
    draw(particle: Particle): void {

        store<u16>(w4.DRAW_COLORS, particle.settings.color);
        const halfSize: f32 = particle.size * 0.5;
        const scale: u32 = <u32>(particle.size * Camera.zoom);

        w4.rect(<i32>((particle.x - Camera.x - halfSize) * Camera.zoom), <i32>((particle.y - Camera.y - halfSize) * Camera.zoom), scale, scale);
    }
}

export class OvalRenderer extends ParticleRenderer {
    draw(particle: Particle): void {

        store<u16>(w4.DRAW_COLORS, particle.settings.color);
        const halfSize: f32 = particle.size * 0.5;
        const scale: u32 = <u32>(particle.size * Camera.zoom);

        w4.oval(<i32>((particle.x - Camera.x - halfSize) * Camera.zoom), <i32>((particle.y - Camera.y - halfSize) * Camera.zoom), scale, scale);
    }
}

export class LineRenderer extends ParticleRenderer {
    draw(particle: Particle): void {

        store<u16>(w4.DRAW_COLORS, particle.settings.color);
        const x = <i32>((particle.x - Camera.x) * Camera.zoom);
        const y = <i32>((particle.y - Camera.y) * Camera.zoom);

        w4.line(x, y, x + <i32>(particle.size * Mathf.cos(particle.direction) * Camera.zoom),y + <i32>(particle.size * Mathf.sin(particle.direction) * Camera.zoom));
    }
}
export const TYPE_RECT: ParticleRenderer = new RectRenderer();
export const TYPE_OVAL: ParticleRenderer = new OvalRenderer();
export const TYPE_LINE: ParticleRenderer = new LineRenderer();

export class ParticleSettings {
    size: u8;
    sizeVariance: u8;
    sizeChange: f32;

    direction: f32;
    directionVariance: f32;
    directionChange: f32;

    speed: f32;
    speedVariance: f32;
    speedChange: f32;

    gravity: f32;
    lifetime: u16

    color: u16;
    renderer: ParticleRenderer;

    constructor(size: u8, sizeVariance: u8, sizeChange: f32, direction: f32, directionVariance: f32, directionChange: f32, speed: f32, speedVariance: f32, speedChange: f32, gravity: f32, lifetime: u16, color: u16, particleDrawer: ParticleRenderer) {
        this.size = size;
        this.sizeVariance = sizeVariance;
        this.sizeChange = sizeChange;
        this.direction = direction;
        this.directionVariance = directionVariance;
        this.directionChange = directionChange;
        this.speed = speed;
        this.speedVariance = speedVariance;
        this.speedChange = speedChange;
        this.gravity = gravity;
        this.lifetime = lifetime;

        this.color = color;
        this.renderer = particleDrawer;
    }
}

export const defaultParticleSettings: ParticleSettings = new ParticleSettings(3, 0, 0.0, 0.0, 6.283, 0, 1.0, 0.0, 0.0, 0.0,40, 0x33, TYPE_RECT);

export class Particle {
    x: f32;
    y: f32;
    size: f32;
    direction: f32;
    speed: f32;
    lifetime: u16;

    settings: ParticleSettings = defaultParticleSettings;
    enabled: boolean = false;

    constructor() {
        //this.settings =  defaultParticleSettings;
    }

    public setup(x: f32, y: f32, settings: ParticleSettings): void {
        this.x = x;
        this.y = y;
        this.settings = settings;
        this.enabled = true;

        this.size = settings.size + settings.sizeVariance * 2 * (Mathf.random() - 0.5);
        this.direction = settings.direction + settings.directionVariance * 2 * (Mathf.random() - 0.5);
        this.speed = settings.speed + settings.speedVariance * 2 * (Mathf.random() - 0.5);
        this.lifetime = settings.lifetime;
    }

    public update(): void {
        const deltaX: f32 = Mathf.cos(this.direction) * this.speed;
        const deltaY: f32 = Mathf.sin(this.direction) * this.speed;
        const deltaGravY: f32 = deltaY + this.settings.gravity;
        this.x += deltaX;
        this.y += deltaY;
        this.size += this.settings.sizeChange;
        this.speed = Mathf.sqrt(deltaX*deltaX + deltaGravY*deltaGravY);
        this.speed += this.settings.speedChange;
        this.direction = Mathf.atan2(deltaGravY, deltaX);
        this.direction += this.settings.directionChange;

        this.lifetime--;


        if(this.lifetime < 1) {
            this.enabled = false;
        }
        this.settings.renderer.draw(this);
    }

}

export class ParticleSystem {
    static pool: Array<Particle>;

    static initialize(): void {
        this.pool = new Array<Particle>();
        for (let i: u16 = 0; i < PARTICLE_POOL_SIZE; i++) {
            this.pool.push(new Particle());
        }
    }

    static emit(x: f32, y: f32, settings: ParticleSettings):  void {
        for (let i: u16 = 0; i < PARTICLE_POOL_SIZE; i++) {
            if (!this.pool[i].enabled) {
                this.pool[i].setup(x, y, settings);
                return;
            }
        }
    }

    static update(): void {
        this.pool.forEach(particle => {
            if (particle.enabled) {
                particle.update();
            }
        });
    }
}
ParticleSystem.initialize();