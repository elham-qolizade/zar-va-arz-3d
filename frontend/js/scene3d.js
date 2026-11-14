/**
 * ZAR & ARZ 3D • Cinema-Grade WebGL Scene Engine
 * Inspired by Lusion, Igloo.inc & Active Theory
 * Features:
 * - PBR Swiss Gold Ingot with Caustic Sheen & Engraved Relief
 * - Holographic Scanner Ring & Laser Sweep
 * - Floating Currency Satellites (USD, EUR, AED, Crypto)
 * - 3,500 Dynamic Vortex Golden Dust Particles
 * - Interactive Mouse Drag & Physics Inertia (360° Inspection)
 * - Cinema-grade Scroll Choreography
 */

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

export class Scene3D {
  constructor(canvasContainerId = 'webgl-container') {
    this.container = document.getElementById(canvasContainerId);
    this.scene = null;
    this.camera = null;
    this.renderer = null;

    // Objects
    this.goldBarGroup = null;
    this.goldBarMesh = null;
    this.hologramGroup = null;
    this.laserScanMesh = null;
    this.coins = [];
    this.satellites = [];
    this.particles = null;
    this.gridHelper = null;
    this.lights = {};

    // Mouse & Parallax state
    this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0, vx: 0, vy: 0 };
    this.isDragging = false;
    this.dragStart = { x: 0, y: 0 };
    this.dragRotation = { x: 0, y: 0, targetX: 0, targetY: 0 };
    this.windowHalf = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

    // Scroll state
    this.scrollProgress = 0;
    this.targetScrollProgress = 0;
    this.scrollVelocity = 0;
    this.lastScrollProgress = 0;

    // Animation frame
    this.clock = new THREE.Clock();
    this.rafId = null;
    this.isDisposed = false;

    this.init();
  }

  init() {
    if (!this.container) return;

    // 1. Scene
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x06070a, 0.042);

    // 2. Camera
    this.camera = new THREE.PerspectiveCamera(
      42,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    this.camera.position.set(0, 0, 7.8);

    // 3. Renderer
    this.renderer = new THREE.WebGLRenderer({
      powerPreference: 'high-performance',
      antialias: true,
      alpha: true,
      stencil: false
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.4;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.container.appendChild(this.renderer.domElement);

    // 4. Procedural Studio Environment
    this.setupEnvironment();

    // 5. Lighting Setup
    this.setupLights();

    // 6. 3D Geometries & Effects
    this.createGoldBar();
    this.createHolographicHUD();
    this.createFloatingCoins();
    this.createCurrencySatellites();
    this.createCosmicVortexParticles();
    this.createFuturisticFloor();

    // 7. Event Listeners
    window.addEventListener('resize', this.onResize.bind(this));
    window.addEventListener('mousemove', this.onMouseMove.bind(this));
    window.addEventListener('mousedown', this.onMouseDown.bind(this));
    window.addEventListener('mouseup', this.onMouseUp.bind(this));
    window.addEventListener('touchmove', this.onTouchMove.bind(this), { passive: true });

    // 8. Start Loop
    this.animate();
  }

  // Create high-contrast luxury studio reflection gradient
  setupEnvironment() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createLinearGradient(0, 0, 1024, 512);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.2, '#fff2c2');
    grad.addColorStop(0.4, '#1b1712');
    grad.addColorStop(0.65, '#d4af37');
    grad.addColorStop(0.85, '#07080b');
    grad.addColorStop(1, '#000000');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 512);

    // High-key softbox strips
    ctx.fillStyle = 'rgba(255, 250, 230, 0.95)';
    ctx.fillRect(180, 0, 140, 512);
    ctx.fillStyle = 'rgba(255, 215, 100, 0.65)';
    ctx.fillRect(720, 0, 90, 512);
    ctx.fillStyle = 'rgba(77, 240, 255, 0.35)'; // Cyan accent rim
    ctx.fillRect(450, 0, 40, 512);

    const texture = new THREE.CanvasTexture(canvas);
    texture.mapping = THREE.EquirectangularReflectionMapping;
    this.scene.environment = texture;
    this.envTexture = texture;
  }

  setupLights() {
    // Ambient golden fill
    const ambientLight = new THREE.AmbientLight(0x281f10, 2.8);
    this.scene.add(ambientLight);

    // Main Key Light (Warm Gold Spotlight)
    const keyLight = new THREE.SpotLight(0xfff3d6, 55);
    keyLight.position.set(4.5, 7.5, 6.5);
    keyLight.angle = Math.PI / 4.2;
    keyLight.penumbra = 0.85;
    keyLight.castShadow = true;
    this.scene.add(keyLight);
    this.lights.key = keyLight;

    // Rim / Counter Light (Active Theory Cyan/Electric Blue contrast)
    const rimLight = new THREE.SpotLight(0x38bdf8, 32);
    rimLight.position.set(-6.5, -3.5, -4.5);
    rimLight.angle = Math.PI / 3;
    rimLight.penumbra = 1;
    this.scene.add(rimLight);
    this.lights.rim = rimLight;

    // Interactive Cursor Spotlight
    const cursorLight = new THREE.PointLight(0xffd700, 18, 14);
    cursorLight.position.set(0, 0, 4.5);
    this.scene.add(cursorLight);
    this.lights.cursor = cursorLight;
  }

  // Create Swiss Bullion Gold Bar
  createGoldBar() {
    this.goldBarGroup = new THREE.Group();

    this.goldMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xf5c342,
      emissive: 0x221805,
      metalness: 0.98,
      roughness: 0.15,
      clearcoat: 0.5,
      clearcoatRoughness: 0.12,
      reflectivity: 1.0,
      envMapIntensity: 2.6
    });

    // Ingot Trapezoid Geometry
    const length = 3.5;
    const width = 1.75;
    const height = 0.68;
    const bevel = 0.09;

    const shape = new THREE.Shape();
    const halfL = length / 2 - bevel;
    const halfW = width / 2 - bevel;

    shape.moveTo(-halfL, -halfW - bevel);
    shape.lineTo(halfL, -halfW - bevel);
    shape.quadraticCurveTo(halfL + bevel, -halfW - bevel, halfL + bevel, -halfW);
    shape.lineTo(halfL + bevel, halfW);
    shape.quadraticCurveTo(halfL + bevel, halfW + bevel, halfL, halfW + bevel);
    shape.lineTo(-halfL, halfW + bevel);
    shape.quadraticCurveTo(-halfL - bevel, halfW + bevel, -halfL - bevel, halfW);
    shape.lineTo(-halfL - bevel, -halfW);
    shape.quadraticCurveTo(-halfL - bevel, -halfW - bevel, -halfL, -halfW - bevel);

    const extrudeSettings = {
      steps: 2,
      depth: height,
      bevelEnabled: true,
      bevelThickness: 0.09,
      bevelSize: 0.09,
      bevelSegments: 5
    };

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geometry.center();

    this.goldBarMesh = new THREE.Mesh(geometry, this.goldMaterial);
    this.goldBarMesh.castShadow = true;
    this.goldBarMesh.receiveShadow = true;
    this.goldBarGroup.add(this.goldBarMesh);

    // Ingot Face Relief Stamp
    this.createIngotStamps();

    this.goldBarGroup.position.set(0, 0.25, 0);
    this.goldBarGroup.rotation.set(0.32, -0.42, 0.1);

    this.scene.add(this.goldBarGroup);
  }

  // Stamp textures
  createIngotStamps() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, 1024, 512);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.strokeStyle = '#303030';
    ctx.lineWidth = 8;
    ctx.strokeRect(55, 35, 914, 442);

    ctx.font = 'bold 36px monospace';
    ctx.fillStyle = '#202020';
    ctx.fillText('• SWISS VAULT GUARANTEE •', 512, 110);
    ctx.fillStyle = '#c5a059';
    ctx.fillText('• SWISS VAULT GUARANTEE •', 510, 108);

    ctx.font = '900 88px sans-serif';
    ctx.fillStyle = '#181818';
    ctx.fillText('999.9', 512, 215);
    ctx.fillStyle = '#f0c040';
    ctx.fillText('999.9', 510, 212);

    ctx.font = '700 42px sans-serif';
    ctx.fillStyle = '#181818';
    ctx.fillText('FINE GOLD • 1000g', 512, 300);
    ctx.fillStyle = '#d0b060';
    ctx.fillText('FINE GOLD • 1000g', 511, 298);

    ctx.font = '600 28px monospace';
    ctx.fillStyle = '#202020';
    ctx.fillText('ASSAYER [ZA-2026-X]', 512, 390);

    const bumpTexture = new THREE.CanvasTexture(canvas);
    const topPlateGeo = new THREE.PlaneGeometry(3.2, 1.55);
    const topPlateMat = new THREE.MeshStandardMaterial({
      color: 0xf8c84b,
      metalness: 0.99,
      roughness: 0.2,
      bumpMap: bumpTexture,
      bumpScale: 0.022,
      envMapIntensity: 2.8
    });

    const topPlate = new THREE.Mesh(topPlateGeo, topPlateMat);
    topPlate.position.z = 0.44;
    this.goldBarMesh.add(topPlate);
  }

  // Holographic Vault HUD & Scanning Lasers (Active Theory & Igloo style)
  createHolographicHUD() {
    this.hologramGroup = new THREE.Group();

    // 1. Futuristic Orbital Measurement Ring 1
    const ring1Geo = new THREE.RingGeometry(2.6, 2.64, 64);
    const ring1Mat = new THREE.MeshBasicMaterial({
      color: 0xf5c042,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide
    });
    this.holoRing1 = new THREE.Mesh(ring1Geo, ring1Mat);
    this.hologramGroup.add(this.holoRing1);

    // 2. Outer Dashed Ring 2
    const ring2Geo = new THREE.RingGeometry(3.1, 3.12, 48);
    const ring2Mat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.28,
      side: THREE.DoubleSide
    });
    this.holoRing2 = new THREE.Mesh(ring2Geo, ring2Mat);
    this.hologramGroup.add(this.holoRing2);

    // 3. Sweeping Laser Scanner Beam (Sweeps vertically across the bullion bar)
    const laserGeo = new THREE.PlaneGeometry(3.6, 0.04);
    const laserMat = new THREE.MeshBasicMaterial({
      color: 0x4df0ff,
      transparent: true,
      opacity: 0.75,
      side: THREE.DoubleSide
    });
    this.laserScanMesh = new THREE.Mesh(laserGeo, laserMat);
    this.laserScanMesh.position.z = 0.55;
    this.goldBarGroup.add(this.laserScanMesh);

    this.scene.add(this.hologramGroup);
  }

  // Floating Persian Gold Coins
  createFloatingCoins() {
    const coinGeo = new THREE.CylinderGeometry(0.68, 0.68, 0.09, 48);
    const coinMat = new THREE.MeshPhysicalMaterial({
      color: 0xf8cc4c,
      metalness: 0.97,
      roughness: 0.16,
      clearcoat: 0.4,
      envMapIntensity: 2.4
    });

    const coinConfigs = [
      { x: -3.4, y: 1.5, z: -1.2, scale: 0.95, speed: 0.015 },
      { x: 3.6, y: -1.3, z: -0.9, scale: 1.15, speed: -0.018 },
      { x: -3.0, y: -2.3, z: 1.3, scale: 0.8, speed: 0.022 },
      { x: 3.2, y: 2.4, z: -2.2, scale: 0.9, speed: -0.019 },
      { x: 0.3, y: -3.6, z: -1.2, scale: 1.25, speed: 0.012 }
    ];

    coinConfigs.forEach((cfg) => {
      const mesh = new THREE.Mesh(coinGeo, coinMat);
      mesh.position.set(cfg.x, cfg.y, cfg.z);
      mesh.rotation.x = Math.PI / 2 + Math.random() * 0.4;
      mesh.rotation.z = Math.random() * Math.PI;
      mesh.scale.setScalar(cfg.scale);
      mesh.castShadow = true;

      mesh.userData = {
        baseX: cfg.x,
        baseY: cfg.y,
        baseZ: cfg.z,
        speed: cfg.speed,
        phase: Math.random() * Math.PI * 2
      };

      this.scene.add(mesh);
      this.coins.push(mesh);
    });
  }

  // Floating 3D Holographic Currency Satellites (USD, EUR, USDT, OUNCE)
  createCurrencySatellites() {
    const symbols = ['$', '€', 'د.إ', '₮'];
    symbols.forEach((sym, idx) => {
      const canvas = document.createElement('canvas');
      canvas.width = 128;
      canvas.height = 128;
      const ctx = canvas.getContext('2d');

      ctx.fillStyle = 'rgba(7, 8, 11, 0.7)';
      ctx.beginPath();
      ctx.arc(64, 64, 58, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = idx % 2 === 0 ? '#f5c042' : '#38bdf8';
      ctx.lineWidth = 4;
      ctx.stroke();

      ctx.font = 'bold 54px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(sym, 64, 66);

      const texture = new THREE.CanvasTexture(canvas);
      const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true, opacity: 0.85 });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.scale.set(0.75, 0.75, 0.75);

      const angle = (idx / symbols.length) * Math.PI * 2;
      sprite.userData = {
        angle,
        radius: 3.2 + (idx * 0.3),
        speed: 0.008 * (idx % 2 === 0 ? 1 : -1),
        yOffset: (idx - 1.5) * 0.8
      };

      this.scene.add(sprite);
      this.satellites.push(sprite);
    });
  }

  // 3,500 Dynamic Vortex Golden Dust Particles
  createCosmicVortexParticles() {
    const count = 3500;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const colorPalette = [
      new THREE.Color(0xffd700),
      new THREE.Color(0xfff0aa),
      new THREE.Color(0xe5a93c),
      new THREE.Color(0x38bdf8),
      new THREE.Color(0xffffff)
    ];

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const radius = 2.0 + Math.pow(Math.random(), 1.5) * 12.0;
      const theta = Math.random() * Math.PI * 2;
      const y = (Math.random() - 0.5) * 18.0;

      positions[i3] = Math.cos(theta) * radius;
      positions[i3 + 1] = y;
      positions[i3 + 2] = Math.sin(theta) * radius;

      const col = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      colors[i3] = col.r;
      colors[i3 + 1] = col.g;
      colors[i3 + 2] = col.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Particle Glow Texture
    const pCanvas = document.createElement('canvas');
    pCanvas.width = 64;
    pCanvas.height = 64;
    const pCtx = pCanvas.getContext('2d');
    const grad = pCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.3, 'rgba(245, 192, 66, 0.8)');
    grad.addColorStop(0.7, 'rgba(212, 175, 55, 0.2)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    pCtx.fillStyle = grad;
    pCtx.fillRect(0, 0, 64, 64);

    const pMat = new THREE.PointsMaterial({
      size: 0.13,
      map: new THREE.CanvasTexture(pCanvas),
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      vertexColors: true
    });

    this.particles = new THREE.Points(geometry, pMat);
    this.scene.add(this.particles);
  }

  // Futuristic Subsurface Floor Grid
  createFuturisticFloor() {
    const size = 36;
    const divisions = 36;
    const grid = new THREE.GridHelper(size, divisions, 0xf5c042, 0x181a24);
    grid.position.y = -4.0;
    grid.material.opacity = 0.22;
    grid.material.transparent = true;
    this.gridHelper = grid;
    this.scene.add(grid);
  }

  // Dynamic Scale & Reaction to Calculator Weight
  updateObjectWeight(weightGrams) {
    if (!this.goldBarGroup) return;

    let targetScale = 1.0;
    if (weightGrams <= 1) {
      targetScale = 0.35 + (weightGrams * 0.25);
    } else if (weightGrams <= 100) {
      targetScale = 0.6 + (Math.log10(weightGrams) * 0.2);
    } else if (weightGrams <= 1000) {
      targetScale = 0.8 + (weightGrams / 1000) * 0.35;
    } else {
      targetScale = 1.15 + Math.min(weightGrams / 10000, 0.45);
    }

    this.goldBarTargetScale = targetScale;

    // Laser scan pulse
    if (this.lights.cursor) {
      this.lights.cursor.intensity = 26;
      setTimeout(() => {
        if (this.lights.cursor) this.lights.cursor.intensity = 18;
      }, 300);
    }
  }

  // Mouse & Drag Interaction
  onMouseMove(e) {
    const targetX = (e.clientX - this.windowHalf.x) / this.windowHalf.x;
    const targetY = (e.clientY - this.windowHalf.y) / this.windowHalf.y;

    this.mouse.vx = targetX - this.mouse.targetX;
    this.mouse.vy = targetY - this.mouse.targetY;
    this.mouse.targetX = targetX;
    this.mouse.targetY = targetY;

    if (this.isDragging) {
      const deltaX = e.clientX - this.dragStart.x;
      const deltaY = e.clientY - this.dragStart.y;
      this.dragRotation.targetY += deltaX * 0.008;
      this.dragRotation.targetX += deltaY * 0.008;
      this.dragStart.x = e.clientX;
      this.dragStart.y = e.clientY;
    }
  }

  onMouseDown(e) {
    // Enable 360 inspection drag when clicking the canvas
    if (e.target.tagName.toLowerCase() === 'canvas') {
      this.isDragging = true;
      this.dragStart.x = e.clientX;
      this.dragStart.y = e.clientY;
    }
  }

  onMouseUp() {
    this.isDragging = false;
  }

  onTouchMove(e) {
    if (e.touches.length > 0) {
      this.mouse.targetX = (e.touches[0].clientX - this.windowHalf.x) / this.windowHalf.x;
      this.mouse.targetY = (e.touches[0].clientY - this.windowHalf.y) / this.windowHalf.y;
    }
  }

  onResize() {
    this.windowHalf.x = window.innerWidth / 2;
    this.windowHalf.y = window.innerHeight / 2;
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  setScrollProgress(progress) {
    this.targetScrollProgress = progress;
  }

  // Main Render Loop
  animate() {
    if (this.isDisposed) return;
    this.rafId = requestAnimationFrame(this.animate.bind(this));

    const delta = this.clock.getDelta();
    const elapsedTime = this.clock.getElapsedTime();

    // 1. Mouse & Drag Lerp
    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.06;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.06;

    this.dragRotation.x += (this.dragRotation.targetX - this.dragRotation.x) * 0.08;
    this.dragRotation.y += (this.dragRotation.targetY - this.dragRotation.y) * 0.08;

    // Decay drag inertia when released
    if (!this.isDragging) {
      this.dragRotation.targetX *= 0.96;
      this.dragRotation.targetY *= 0.96;
    }

    // 2. Scroll Velocity & Progress Lerp
    this.scrollVelocity = Math.abs(this.targetScrollProgress - this.scrollProgress);
    this.scrollProgress += (this.targetScrollProgress - this.scrollProgress) * 0.09;
    const sp = this.scrollProgress;

    // 3. Move Interactive Lights
    if (this.lights.cursor) {
      this.lights.cursor.position.x = this.mouse.x * 5.5;
      this.lights.cursor.position.y = -this.mouse.y * 4.0;
    }

    // 4. Gold Bar & Camera Scroll Choreography
    if (this.goldBarGroup) {
      const idleFloat = Math.sin(elapsedTime * 1.3) * 0.14;
      const idleRot = Math.cos(elapsedTime * 0.9) * 0.09;

      // Scale interpolation
      if (this.goldBarTargetScale) {
        const curScale = this.goldBarGroup.scale.x;
        const newScale = curScale + (this.goldBarTargetScale - curScale) * 0.1;
        this.goldBarGroup.scale.set(newScale, newScale, newScale);
      }

      // Laser Scanner Sweep
      if (this.laserScanMesh) {
        this.laserScanMesh.position.y = Math.sin(elapsedTime * 2.2) * 0.75;
      }

      // Section Transitions
      if (sp < 0.28) {
        // Hero Section: Centered, heroic perspective
        const t = sp / 0.28;
        this.goldBarGroup.position.x = -1.2 * t + (this.mouse.x * 0.45);
        this.goldBarGroup.position.y = 0.25 + idleFloat - (t * 0.5);
        this.goldBarGroup.position.z = 0 + (t * 0.9);
        this.goldBarGroup.rotation.x = 0.32 + (this.mouse.y * 0.3) + this.dragRotation.x;
        this.goldBarGroup.rotation.y = -0.42 + (elapsedTime * 0.18) + (this.mouse.x * 0.4) + this.dragRotation.y;
        this.goldBarGroup.rotation.z = 0.1 + idleRot;

        this.camera.position.z = 7.8 - (t * 1.2);
        this.camera.position.x = 0;
      } else if (sp < 0.62) {
        // Market Pulse Section: Angled glide, revealing currency rings
        const t = (sp - 0.28) / 0.34;
        this.goldBarGroup.position.x = -1.2 + (t * 4.4) + (this.mouse.x * 0.4);
        this.goldBarGroup.position.y = -0.25 + idleFloat;
        this.goldBarGroup.position.z = 0.9 - (t * 1.6);
        this.goldBarGroup.rotation.x = 0.45 + (t * 0.7) + this.dragRotation.x;
        this.goldBarGroup.rotation.y = elapsedTime * 0.25 + this.dragRotation.y;
        this.goldBarGroup.rotation.z = -0.15;

        this.camera.position.z = 6.6;
        this.camera.position.x = -t * 0.8;
      } else if (sp < 0.86) {
        // 3D Vault Calculator: Top-down examination bench
        const t = (sp - 0.62) / 0.24;
        this.goldBarGroup.position.x = 2.2 - (t * 4.0) + (this.mouse.x * 0.3);
        this.goldBarGroup.position.y = 0.15 + (t * 0.4) + idleFloat;
        this.goldBarGroup.position.z = -0.7 + (t * 1.9);
        this.goldBarGroup.rotation.x = 0.68 - (t * 0.35) + (this.mouse.y * 0.25) + this.dragRotation.x;
        this.goldBarGroup.rotation.y = 0.45 + (t * 0.6) + (this.mouse.x * 0.4) + this.dragRotation.y;
        this.goldBarGroup.rotation.z = 0.06;

        this.camera.position.z = 6.6 - (t * 0.6);
        this.camera.position.x = 0;
      } else {
        // Market Depth & Bubble: Ethereal nebula view
        const t = (sp - 0.86) / 0.14;
        this.goldBarGroup.position.x = -1.8 + (t * 1.8);
        this.goldBarGroup.position.y = 0.55 + (t * 2.4);
        this.goldBarGroup.position.z = 1.2 - (t * 4.2);
        this.goldBarGroup.rotation.x = elapsedTime * 0.35;
        this.goldBarGroup.rotation.y = elapsedTime * 0.45;
      }
    }

    // 5. Animate Holographic HUD Rings
    if (this.hologramGroup && this.goldBarGroup) {
      this.hologramGroup.position.copy(this.goldBarGroup.position);
      if (this.holoRing1) this.holoRing1.rotation.z += 0.008;
      if (this.holoRing2) this.holoRing2.rotation.z -= 0.012;
    }

    // 6. Animate Floating Coins
    this.coins.forEach((coin) => {
      const u = coin.userData;
      coin.rotation.y += u.speed;
      coin.rotation.x += u.speed * 0.6;
      const floatY = Math.sin(elapsedTime * 1.6 + u.phase) * 0.26;
      coin.position.y = u.baseY + floatY - (sp * 2.2);

      if (sp > 0.22 && sp < 0.65) {
        coin.position.z = u.baseZ + Math.sin((sp - 0.22) * Math.PI) * 2.0;
      } else {
        coin.position.z = u.baseZ;
      }
    });

    // 7. Animate Currency Satellites
    this.satellites.forEach((sat) => {
      const u = sat.userData;
      u.angle += u.speed;
      sat.position.x = this.goldBarGroup.position.x + Math.cos(u.angle) * u.radius;
      sat.position.z = this.goldBarGroup.position.z + Math.sin(u.angle) * u.radius;
      sat.position.y = this.goldBarGroup.position.y + u.yOffset + Math.sin(elapsedTime * 2 + u.angle) * 0.2;
    });

    // 8. Animate Cosmic Vortex Particles (reacts to mouse and scroll velocity)
    if (this.particles) {
      const pSpeed = 0.03 + (this.scrollVelocity * 0.5);
      this.particles.rotation.y = elapsedTime * pSpeed + (this.mouse.x * 0.2);
      this.particles.rotation.x = elapsedTime * (pSpeed * 0.5) + (this.mouse.y * 0.15);
    }

    // 9. Render
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.isDisposed = true;
    if (this.rafId) cancelAnimationFrame(this.rafId);
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('mousedown', this.onMouseDown);
    window.removeEventListener('mouseup', this.onMouseUp);
    if (this.renderer && this.renderer.domElement) {
      this.renderer.domElement.remove();
    }
  }
}
