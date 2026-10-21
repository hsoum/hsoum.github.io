/**
 * The hero's 3D set: a phone and a browser built in code (no model files),
 * lit by a slowly drifting softbox, with real screenshots behind their glass.
 */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js';

export const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const FINE_POINTER = matchMedia('(pointer: fine)').matches;

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

export const isLight = () => document.documentElement.dataset.theme === 'light';

/* ---------- screens ---------- */

// Each texture is composed at the exact aspect of the glass it sits behind.
const WEB_TEX = { w: 1440, h: 952, bar: 52 };
const PHONE_TEX = { w: 780, h: 1664, bar: 100 };

export const SCREENS = {
  'web-platform': ['/screens/web-platform.jpg', 'Soins et Santé'],
  'web-aurelis': ['/screens/web-aurelis.jpg', 'aurelislab.com'],
  'web-aurelis-product': ['/screens/web-aurelis-product.jpg', 'aurelislab.com'],
  'web-ss-site': ['/screens/web-ss-site.jpg', 'Soins et Santé'],
  'web-samira-play': ['/screens/web-samira-play.jpg', 'play.google.com'],
  'web-gp-shop': ['/screens/web-gp-shop.jpg', 'GracePaws'],
  'phone-aurelis': ['/screens/phone-aurelis.jpg'],
  'phone-gp': ['/screens/phone-gp.jpg'],
  'phone-samira-1': ['/screens/phone-samira-1.jpg'],
  'phone-samira-2': ['/screens/phone-samira-2.jpg'],
  'phone-samira-3': ['/screens/phone-samira-3.jpg'],
  'phone-samira-4': ['/screens/phone-samira-4.jpg'],
} as const satisfies Record<string, readonly string[]>;
export type ScreenKey = keyof typeof SCREENS;

const images = new Map<string, Promise<HTMLImageElement>>();
function loadImage(src: string) {
  let p = images.get(src);
  if (!p) {
    p = new Promise((resolve, reject) => {
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
    images.set(src, p);
  }
  return p;
}

function roundRectPath(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

function drawBrowserBar(g: CanvasRenderingContext2D, label: string) {
  const S = WEB_TEX;
  g.fillStyle = '#15181d';
  g.fillRect(0, 0, S.w, S.bar);
  g.fillStyle = '#262a31';
  g.fillRect(0, S.bar - 1, S.w, 1);
  g.fillStyle = '#3a3f47';
  for (const x of [26, 46, 66]) {
    g.beginPath();
    g.arc(x, S.bar / 2, 6, 0, Math.PI * 2);
    g.fill();
  }
  const pw = 440;
  const ph = 30;
  roundRectPath(g, (S.w - pw) / 2, (S.bar - ph) / 2, pw, ph, ph / 2);
  g.fillStyle = '#22262c';
  g.fill();
  g.fillStyle = '#9aa4af';
  g.font = '500 15px system-ui, -apple-system, "Segoe UI", sans-serif';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText(label, S.w / 2 + 8, S.bar / 2 + 1);
  const lx = S.w / 2 - g.measureText(label).width / 2 - 10;
  g.strokeStyle = '#9aa4af';
  g.lineWidth = 1.6;
  g.beginPath();
  g.arc(lx, S.bar / 2 - 2, 3.4, Math.PI, 0);
  g.stroke();
  g.fillRect(lx - 5, S.bar / 2 - 2, 10, 8);
}

function drawStatusBar(g: CanvasRenderingContext2D) {
  const S = PHONE_TEX;
  const [r, gr, b] = g.getImageData(S.w / 2, S.bar + 4, 1, 1).data;
  g.fillStyle = `rgb(${r},${gr},${b})`;
  g.fillRect(0, 0, S.w, S.bar);
  const ink = 0.2126 * r + 0.7152 * gr + 0.0722 * b > 150 ? '#0b0d10' : '#ffffff';
  const y = S.bar * 0.56;
  g.fillStyle = ink;
  g.font = '600 34px system-ui, -apple-system, "Segoe UI", sans-serif';
  g.textBaseline = 'middle';
  g.textAlign = 'left';
  g.fillText('9:41', 70, y);
  for (let i = 0; i < 4; i++) g.fillRect(560 + i * 11, y + 9 - (i + 1) * 5, 7, (i + 1) * 5);
  g.strokeStyle = ink;
  g.lineWidth = 2.4;
  roundRectPath(g, 640, y - 11, 48, 23, 7);
  g.stroke();
  roundRectPath(g, 644, y - 7, 36, 15, 4);
  g.fill();
  g.fillRect(691, y - 4, 3, 9);
}

const textures = new Map<ScreenKey, Promise<THREE.Texture>>();
function screenTexture(key: ScreenKey, renderer: THREE.WebGLRenderer) {
  let p = textures.get(key);
  if (!p) {
    p = (async () => {
      const [src, label] = SCREENS[key] as readonly string[];
      const img = await loadImage(src);
      const web = key.startsWith('web');
      const S = web ? WEB_TEX : PHONE_TEX;
      const c = document.createElement('canvas');
      c.width = S.w;
      c.height = S.h;
      const g = c.getContext('2d', { willReadFrequently: !web })!;
      const k = Math.max(S.w / img.width, (S.h - S.bar) / img.height);
      g.drawImage(img, (S.w - img.width * k) / 2, S.bar, img.width * k, img.height * k);
      if (web) drawBrowserBar(g, label ?? '');
      else drawStatusBar(g);
      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
      return t;
    })();
    textures.set(key, p);
  }
  return p;
}

/* ---------- geometry ---------- */

function roundedShape(w: number, h: number, r: number) {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.absarc(x + w - r, y + r, r, -Math.PI / 2, 0, false);
  s.lineTo(x + w, y + h - r);
  s.absarc(x + w - r, y + h - r, r, 0, Math.PI / 2, false);
  s.lineTo(x + r, y + h);
  s.absarc(x + r, y + h - r, r, Math.PI / 2, Math.PI, false);
  s.lineTo(x, y + r);
  s.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5, false);
  return s;
}

function flatPanel(w: number, h: number, r: number, segments = 24) {
  const g = new THREE.ShapeGeometry(roundedShape(w, h, r), segments);
  const pos = g.attributes.position;
  const uv = g.attributes.uv;
  for (let i = 0; i < pos.count; i++) uv.setXY(i, pos.getX(i) / w + 0.5, pos.getY(i) / h + 0.5);
  return g;
}

function slab(w: number, h: number, d: number, r: number, bevel: number) {
  const g = new THREE.ExtrudeGeometry(roundedShape(w - 2 * bevel, h - 2 * bevel, r - bevel), {
    depth: d - 2 * bevel,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 6,
    curveSegments: 40,
  });
  g.translate(0, 0, -(d - 2 * bevel) / 2);
  return g;
}

export type Kind = 'phone' | 'web';
export const SPEC = {
  phone: { W: 0.78, H: 1.6, D: 0.085, R: 0.125, bevel: 0.026, inset: 0.028, screenR: 0.1 },
  web: { W: 2.37, H: 1.5906, D: 0.055, R: 0.07, bevel: 0.016, inset: 0.035, screenR: 0.035 },
} as const;

function makeMaterials() {
  return {
    metal: new THREE.MeshPhysicalMaterial({ color: 0x4a4f57, metalness: 1, roughness: 0.24, clearcoat: 0.4, clearcoatRoughness: 0.18 }),
    frontGlass: new THREE.MeshPhysicalMaterial({ color: 0x020304, metalness: 0, roughness: 0.08, clearcoat: 1, clearcoatRoughness: 0.03 }),
    backGlass: new THREE.MeshPhysicalMaterial({ color: 0x1f2227, metalness: 0.15, roughness: 0.42, clearcoat: 0.7, clearcoatRoughness: 0.35 }),
    lens: new THREE.MeshPhysicalMaterial({ color: 0x050608, metalness: 0.2, roughness: 0.05, clearcoat: 1, clearcoatRoughness: 0.02 }),
    // A black dielectric added over the screen: only its reflections show.
    cover: new THREE.MeshPhysicalMaterial({
      color: 0x000000,
      metalness: 0,
      roughness: 0.05,
      clearcoat: 1,
      clearcoatRoughness: 0.03,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
    island: new THREE.MeshBasicMaterial({ color: 0x000000 }),
  };
}
type Materials = ReturnType<typeof makeMaterials>;

function screenMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: { mapA: { value: null }, mapB: { value: null }, mixT: { value: 0 }, gain: { value: 1 } },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      uniform sampler2D mapA;
      uniform sampler2D mapB;
      uniform float mixT;
      uniform float gain;
      varying vec2 vUv;
      void main() {
        vec3 a = texture2D(mapA, vUv).rgb;
        vec3 b = texture2D(mapB, vUv).rgb;
        // A soft diagonal wipe with a thin band of light on its leading edge.
        float d = (1.0 - vUv.y) * 0.82 + vUv.x * 0.18;
        float s = 0.12;
        float f = mixT * (1.0 + s) - s * 0.5;
        float w = 1.0 - smoothstep(f - s * 0.5, f + s * 0.5, d);
        vec3 col = mix(a, b, w);
        float band = (1.0 - smoothstep(0.0, s * 0.5, abs(d - f))) * step(0.001, mixT) * step(mixT, 0.999);
        col += band * 0.16 * vec3(0.86, 0.92, 1.0);
        gl_FragColor = vec4(col * gain, 1.0);
        #include <colorspace_fragment>
      }`,
  });
}

let shadowTexture: THREE.Texture | undefined;
function getShadowTexture() {
  if (!shadowTexture) {
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const g = c.getContext('2d')!;
    const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, 'rgba(0,0,0,1)');
    grad.addColorStop(0.55, 'rgba(0,0,0,.45)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, 128, 128);
    shadowTexture = new THREE.CanvasTexture(c);
  }
  return shadowTexture;
}

/* ---------- device ---------- */

/** x, y: fractions of the stage; h: body height in CSS px; z: world units; angles in radians. */
export interface Pose {
  x: number;
  y: number;
  h: number;
  z: number;
  rx: number;
  ry: number;
  rz: number;
}

export class Device {
  readonly group = new THREE.Group();
  readonly body = new THREE.Group();
  readonly spec: (typeof SPEC)[Kind];
  readonly screenMat = screenMaterial();
  readonly shadow: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
  pose: Pose = { x: 0.5, y: 0.5, h: 300, z: 0, rx: 0, ry: 0, rz: 0 };
  target: Pose = { ...this.pose };
  stiffness = 7;
  /** 1 = idle drift and pointer tilt; 0 = perfectly still. */
  calm = 1;
  current: ScreenKey | null = null;
  private queued: ScreenKey | null = null;
  private wipe = 1;
  private spin = 0;
  private spinFrom = 0;
  private spinTo = 0;
  private spinT = 1;
  private onSpinHalf: (() => void) | null = null;
  private phase = Math.random() * Math.PI * 2;

  constructor(
    readonly kind: Kind,
    private stage: Stage,
  ) {
    this.spec = SPEC[kind];
    const { W, H, D, R, bevel, inset, screenR } = this.spec;
    const m = stage.materials;
    this.group.add(this.body);
    this.body.add(new THREE.Mesh(slab(W, H, D, R, bevel), [m.frontGlass, m.metal]));

    const sw = W - inset * 2;
    const sh = H - inset * 2;
    const screen = new THREE.Mesh(flatPanel(sw, sh, screenR, 20), this.screenMat);
    screen.position.z = D / 2 + 0.0012;
    this.body.add(screen);

    const cover = new THREE.Mesh(flatPanel(sw, sh, screenR, 20), m.cover);
    cover.position.z = D / 2 + 0.0024;
    cover.renderOrder = 2;
    this.body.add(cover);

    const back = new THREE.Mesh(flatPanel(W - bevel * 2, H - bevel * 2, R - bevel, 24), kind === 'phone' ? m.backGlass : m.metal);
    back.rotation.y = Math.PI;
    back.position.z = -D / 2 - 0.0006;
    this.body.add(back);

    if (kind === 'phone') this.addPhoneDetails(m, sh);

    this.shadow = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      new THREE.MeshBasicMaterial({ map: getShadowTexture(), color: 0x000000, transparent: true, opacity: 0, depthWrite: false }),
    );
    this.shadow.scale.set(W * 1.25, H * 1.15, 1);
    this.shadow.position.set(W * 0.08, -H * 0.1, -0.8);
    this.group.add(this.shadow);
  }

  private addPhoneDetails(m: Materials, sh: number) {
    const { W, H, D } = this.spec;
    const island = new THREE.Mesh(flatPanel(0.21, 0.062, 0.031, 12), m.island);
    island.position.set(0, sh / 2 - 0.058, D / 2 + 0.0034);
    island.renderOrder = 3;
    this.body.add(island);

    const plate = new THREE.Mesh(slab(0.36, 0.36, 0.016, 0.09, 0.006), [m.backGlass, m.metal]);
    plate.position.set(W / 2 - 0.235, H / 2 - 0.235, -D / 2 - 0.006);
    this.body.add(plate);
    for (const [x, y] of [
      [-0.078, 0.078],
      [0.078, -0.078],
    ]) {
      const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.066, 0.066, 0.024, 40), m.metal);
      ring.rotation.x = Math.PI / 2;
      ring.position.set(plate.position.x - x, plate.position.y + y, -D / 2 - 0.018);
      this.body.add(ring);
      const glass = new THREE.Mesh(new THREE.CircleGeometry(0.048, 40), m.lens);
      glass.rotation.y = Math.PI;
      glass.position.set(ring.position.x, ring.position.y, -D / 2 - 0.0305);
      this.body.add(glass);
    }

    const button = (x: number, y: number, len: number) => {
      const b = new THREE.Mesh(new THREE.BoxGeometry(0.012, len, 0.03), m.metal);
      b.position.set(x, y, 0);
      this.body.add(b);
    };
    button(-W / 2 - 0.003, 0.5, 0.07);
    button(-W / 2 - 0.003, 0.33, 0.12);
    button(-W / 2 - 0.003, 0.18, 0.12);
    button(W / 2 + 0.003, 0.28, 0.19);
  }

  /** Shows a screen with the light wipe; calls during a wipe keep only the newest. */
  async show(key: ScreenKey, { instant = false } = {}) {
    if (key === this.current || key === this.queued) return;
    this.queued = key;
    const tex = await screenTexture(key, this.stage.renderer);
    if (this.queued !== key) return;
    const u = this.screenMat.uniforms;
    if (instant || !u.mapA.value || REDUCED) {
      u.mapA.value = tex;
      u.mapB.value = tex;
      u.mixT.value = 0;
      this.wipe = 1;
    } else {
      if (this.wipe < 1) u.mapA.value = u.mapB.value;
      u.mapB.value = tex;
      this.wipe = 0;
    }
    this.current = key;
    this.queued = null;
    this.stage.markReady();
  }

  /** A full turn around Y; the screen changes while its back faces the viewer. */
  turn(key: ScreenKey, delay = 0) {
    if (REDUCED) {
      void this.show(key);
      return;
    }
    void screenTexture(key, this.stage.renderer);
    setTimeout(() => {
      this.spinFrom = this.spin;
      this.spinTo = Math.round(this.spin / (Math.PI * 2)) * Math.PI * 2 + Math.PI * 2;
      this.spinT = 0;
      this.onSpinHalf = () => void this.show(key, { instant: true });
    }, delay);
  }

  set(p: Partial<Pose>) {
    Object.assign(this.target, p);
  }

  snap() {
    Object.assign(this.pose, this.target);
  }

  update(dt: number, t: number) {
    const k = 1 - Math.exp(-dt * this.stiffness);
    const p = this.pose;
    for (const key of Object.keys(this.target) as (keyof Pose)[]) p[key] = lerp(p[key], this.target[key], k);

    if (this.spinT < 1) {
      const before = this.spinT;
      this.spinT = Math.min(1, this.spinT + dt / 1.15);
      this.spin = lerp(this.spinFrom, this.spinTo, ease(this.spinT));
      if (before < 0.5 && this.spinT >= 0.5 && this.onSpinHalf) {
        this.onSpinHalf();
        this.onSpinHalf = null;
      }
    }

    if (this.wipe < 1) {
      this.wipe = Math.min(1, this.wipe + dt / 0.9);
      const u = this.screenMat.uniforms;
      u.mixT.value = easeOut(this.wipe);
      if (this.wipe === 1) {
        u.mapA.value = u.mapB.value;
        u.mixT.value = 0;
      }
    }

    const s = this.stage;
    const idle = REDUCED ? 0 : this.calm;
    this.group.position.set((p.x - 0.5) * s.visW, (0.5 - p.y + Math.sin(t * 0.55 + this.phase) * 0.004 * idle) * s.visH, p.z);
    this.group.scale.setScalar(Math.max(0.0001, (p.h * s.pxToWorld) / this.spec.H));
    this.body.rotation.set(
      p.rx + (Math.cos(t * 0.33 + this.phase) * 0.018 + s.pointer.y * 0.06) * idle,
      p.ry + this.spin + (Math.sin(t * 0.41 + this.phase) * 0.03 + s.pointer.x * 0.1) * idle,
      p.rz,
    );
  }
}

/* ---------- stage ---------- */

export interface StageOptions {
  onFrame?: (dt: number, t: number) => void;
  onResize?: () => void;
  /** Fixed light position (0–1) and no motion: used to render stills. */
  still?: boolean;
  pixelRatio?: number;
}

export class Stage {
  readonly renderer: THREE.WebGLRenderer;
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.PerspectiveCamera(30, 1, 0.1, 60);
  readonly materials = makeMaterials();
  readonly canvas: HTMLCanvasElement;
  readonly devices: Device[] = [];
  readonly pointer = { x: 0, y: 0 };
  w = 1;
  h = 1;
  visW = 1;
  visH = 1;
  pxToWorld = 1;
  /** Skip rendering (something opaque covers the canvas). */
  covered = false;
  private key: THREE.RectAreaLight;
  private rim: THREE.DirectionalLight;
  private fill: THREE.HemisphereLight;
  private pointerTarget = { x: 0, y: 0 };
  private sheens: HTMLElement[];
  private sheenBoxes: { left: number; width: number }[] = [];
  private t = 0;
  private last = 0;
  private running = false;
  private visible = true;

  constructor(
    private el: HTMLElement,
    private opts: StageOptions = {},
  ) {
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'gl';
    this.canvas.setAttribute('aria-hidden', 'true');
    el.prepend(this.canvas);
    this.sheens = [...document.querySelectorAll<HTMLElement>('.sheen')];

    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, alpha: true, powerPreference: 'high-performance', preserveDrawingBuffer: !!opts.still });
    this.renderer.setPixelRatio(opts.pixelRatio ?? Math.min(devicePixelRatio, FINE_POINTER ? 2 : 1.75));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.camera.position.set(0, 0, 10);

    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    RectAreaLightUniformsLib.init();
    this.key = new THREE.RectAreaLight(0xdfe9ff, 9, 5.5, 1.3);
    this.rim = new THREE.DirectionalLight(0xc4d6ff, 1.4);
    this.rim.position.set(2.5, 3, -5);
    this.fill = new THREE.HemisphereLight(0xa9bcd6, 0x07090c, 0.25);
    this.scene.add(this.key, this.rim, this.fill);

    new MutationObserver(() => this.applyTheme()).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    new ResizeObserver(() => this.resize()).observe(el);
    this.resize();

    if (FINE_POINTER && !REDUCED && !opts.still) {
      addEventListener('pointermove', (e) => {
        this.pointerTarget.x = (e.clientX / innerWidth) * 2 - 1;
        this.pointerTarget.y = (e.clientY / innerHeight) * 2 - 1;
      });
    }
    new IntersectionObserver(([entry]) => {
      this.visible = entry.isIntersecting;
      if (this.visible) this.start();
    }).observe(el);
    document.addEventListener('visibilitychange', () => !document.hidden && this.start());
  }

  add(kind: Kind) {
    const d = new Device(kind, this);
    this.scene.add(d.group);
    this.devices.push(d);
    this.applyTheme();
    return d;
  }

  markReady() {
    this.canvas.classList.add('ready');
    this.el.classList.add('gl-ready');
  }

  applyTheme() {
    const light = isLight();
    this.scene.environmentIntensity = light ? 1.0 : 0.42;
    this.key.intensity = light ? 4.5 : 9;
    this.rim.intensity = light ? 0.5 : 1.4;
    this.fill.intensity = light ? 0.7 : 0.25;
    this.materials.metal.color.set(light ? 0x3d4249 : 0x4a4f57);
    for (const d of this.devices) {
      d.screenMat.uniforms.gain.value = light ? 1 : 0.94;
      d.shadow.material.opacity = light && !this.opts.still ? 0.26 : 0;
    }
  }

  resize() {
    const w = this.el.clientWidth;
    const h = this.el.clientHeight;
    if (!w || !h) return;
    this.w = w;
    this.h = h;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.visH = 2 * this.camera.position.z * Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2));
    this.visW = this.visH * this.camera.aspect;
    this.pxToWorld = this.visH / h;
    this.sheenBoxes = this.sheens.map((s) => {
      const r = s.getBoundingClientRect();
      return { left: r.left, width: r.width || 1 };
    });
    this.opts.onResize?.();
    this.start();
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.last = performance.now();
    requestAnimationFrame((n) => this.frame(n));
  }

  /** Renders one frame at a fixed time, for stills. */
  renderOnce() {
    for (const d of this.devices) {
      d.snap();
      d.update(0, 0);
    }
    this.placeLight(0.3);
    this.renderer.render(this.scene, this.camera);
  }

  private placeLight(light: number) {
    const sweep = light * 2 - 1;
    this.key.position.set(sweep * 5, 3.2 + Math.cos(this.t * 0.21) * 0.5, 5.5);
    this.key.lookAt(0, 0, 0);
  }

  private frame(now: number) {
    if (!this.visible || document.hidden || this.opts.still) {
      this.running = false;
      return;
    }
    const dt = Math.min(0.05, (now - this.last) / 1000);
    this.last = now;
    this.t += dt;

    const pk = 1 - Math.exp(-dt * 3);
    this.pointer.x = lerp(this.pointer.x, this.pointerTarget.x, pk);
    this.pointer.y = lerp(this.pointer.y, this.pointerTarget.y, pk);

    // The key light: a long softbox drifting across the set, about once every 18 s.
    const light = REDUCED ? 0.32 : (Math.sin(this.t * ((Math.PI * 2) / 18)) + 1) / 2;
    this.placeLight(light);
    const lightPx = light * this.w;
    this.sheens.forEach((s, i) => {
      const b = this.sheenBoxes[i];
      if (b) s.style.setProperty('--lx', `${(((lightPx - b.left) / b.width) * 100).toFixed(1)}%`);
    });
    this.el.style.setProperty('--glx', `${(light * 100).toFixed(1)}%`);

    this.opts.onFrame?.(dt, this.t);
    for (const d of this.devices) d.update(dt, this.t);
    if (!this.covered) this.renderer.render(this.scene, this.camera);
    requestAnimationFrame((n) => this.frame(n));
  }
}
