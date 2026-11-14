/**
 * Ultra-Luxury 3D WebGL Scene Engine
 * Inspired by Lusion, Igloo.inc, and Active Theory
 * Built on Three.js with PBR Gold Shading, Particle Atmosphere, and Scroll Choreography
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
    this.coins = [];
    this.particles = null;
    this.gridHelper = null;
    this.lights = {};
    
    // Mouse / Parallax state
    this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    this.windowHalf = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    
    // Scroll state
    this.scrollProgress = 0;
    this.targetScrollProgress = 0;
    
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
    this.scene.fog = new THREE.FogExp2(0x07080b, 0.045);

    // 2. Camera
    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    this.camera.position.set(0, 0, 7.5);

    // 3. Renderer
    this.renderer = new THREE.WebGLRenderer({
      powerPreference: 'high-performance',
      antialias: true,
      alpha: true
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.35;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.container.appendChild(this.renderer.domElement);

    // 4. Procedural Environment Map for Metallic Reflections
    this.setupEnvironment();

    // 5. Lighting
    this.setupLights();

    // 6. Build 3D Objects
    this.createGoldBar();
    this.createFloatingCoins();
    this.createCosmicParticles();
    this.createFloorGrid();

    // 7. Event Listeners
    window.addEventListener('resize', this.onResize.bind(this));
    window.addEventListener('mousemove', this.onMouseMove.bind(this));
    window.addEventListener('touchmove', this.onTouchMove.bind(this), { passive: true });

    // 8. Start Loop
    this.animate();
  }

  // Create procedural cubemap/environment texture for brilliant gold reflections
  setupEnvironment() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Create high-contrast luxury studio reflection gradient
    const grad = ctx.createLinearGradient(0, 0, 512, 512);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.25, '#ffe599');
    grad.addColorStop(0.5, '#1a1815');
    grad.addColorStop(0.75, '#b8860b');
    grad.addColorStop(1, '#000000');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    // Add glowing light strips (softbox highlights)
    ctx.fillStyle = 'rgba(255, 245, 215, 0.9)';
    ctx.fillRect(120, 0, 80, 512);
    ctx.fillStyle = 'rgba(255, 215, 120, 0.6)';
    ctx.fillRect(360, 0, 40, 512);

    const texture = new THREE.CanvasTexture(canvas);
    texture.mapping = THREE.EquirectangularReflectionMapping;
    this.scene.environment = texture;
    this.envTexture = texture;
  }

  setupLights() {
    // Ambient golden glow
    const ambientLight = new THREE.AmbientLight(0x221a10, 2.5);
    this.scene.add(ambientLight);

    // Main key spotlight (casts luxury gold specular reflection)
    const keyLight = new THREE.SpotLight(0xfff1d0, 45);
    keyLight.position.set(4, 7, 6);
    keyLight.angle = Math.PI / 4;
    keyLight.penumbra = 0.8;
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    this.scene.add(keyLight);
    this.lights.key = keyLight;

    // Rim / Back light (cyan-blue / cool luxury contrast like Active Theory)
    const rimLight = new THREE.SpotLight(0x66c2ff, 25);
    rimLight.position.set(-6, -3, -4);
    rimLight.angle = Math.PI / 3;
    rimLight.penumbra = 1;
    this.scene.add(rimLight);
    this.lights.rim = rimLight;

    // Moving Cursor Spotlight (follows user pointer)
    const cursorLight = new THREE.PointLight(0xffd700, 15, 12);
    cursorLight.position.set(0, 0, 4);
    this.scene.add(cursorLight);
    this.lights.cursor = cursorLight;
  }

  // Create Ingot / Gold Bar
  createGoldBar() {
    this.goldBarGroup = new THREE.Group();

    // Procedural Gold Material with Physical Sheen
    this.goldMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xf5c042, // Rich 24k bullion gold
      emissive: 0x1e1505,
      metalness: 0.97,
      roughness: 0.18,
      clearcoat: 0.45,
      clearcoatRoughness: 0.15,
      reflectivity: 1.0,
      envMapIntensity: 2.2
    });

    // Create tapered trapezoid geometry for a Swiss Gold Ingot
    // Base shape
    const length = 3.4;
    const width = 1.7;
    const height = 0.65;
    const bevel = 0.08;

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
      bevelThickness: 0.08,
      bevelSize: 0.08,
      bevelOffset: 0,
      bevelSegments: 5
    };

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geometry.center();

    // Ingot Mesh
    this.goldBarMesh = new THREE.Mesh(geometry, this.goldMaterial);
    this.goldBarMesh.castShadow = true;
    this.goldBarMesh.receiveShadow = true;
    this.goldBarGroup.add(this.goldBarMesh);

    // Engraved Inscription Face Texture (Bump/Roughness Map)
    this.createIngotStamps();

    // Initial position & orientation
    this.goldBarGroup.position.set(0, 0.2, 0);
    this.goldBarGroup.rotation.set(0.35, -0.45, 0.12);

    this.scene.add(this.goldBarGroup);
  }

  // Generate high-resolution stamp bump map on the fly
  createIngotStamps() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Fill neutral gray
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, 1024, 512);

    // Engraved text styling
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Outer border stamp
    ctx.strokeStyle = '#303030';
    ctx.lineWidth = 8;
    ctx.strokeRect(60, 40, 904, 432);

    ctx.strokeStyle = '#c0c0c0';
    ctx.lineWidth = 4;
    ctx.strokeRect(64, 44, 896, 424);

    // Stamp emblem
    ctx.font = 'bold 36px sans-serif';
    ctx.fillStyle = '#303030';
    ctx.fillText('ZAR & ARZ • SWISS BULLION', 512, 110);
    ctx.fillStyle = '#b0b0b0';
    ctx.fillText('ZAR & ARZ • SWISS BULLION', 511, 108);

    // Main 999.9 Stamp
    ctx.font = '900 84px sans-serif';
    ctx.fillStyle = '#202020';
    ctx.fillText('999.9', 512, 210);
    ctx.fillStyle = '#d0d0d0';
    ctx.fillText('999.9', 510, 208);

    // FINE GOLD
    ctx.font = '600 42px sans-serif';
    ctx.fillStyle = '#202020';
    ctx.fillText('FINE GOLD • 1000g', 512, 290);
    ctx.fillStyle = '#c0c0c0';
    ctx.fillText('FINE GOLD • 1000g', 511, 288);

    // Serial & Assay Stamp
    ctx.font = '500 28px monospace';
    ctx.fillStyle = '#303030';
    ctx.fillText('MELTER ASSAYER  [ZA-2026-X]', 512, 380);

    const bumpTexture = new THREE.CanvasTexture(canvas);
    bumpTexture.wrapS = THREE.ClampToEdgeWrapping;
    bumpTexture.wrapT = THREE.ClampToEdgeWrapping;
    
    // Apply bump to top face
    const topPlateGeo = new THREE.PlaneGeometry(3.1, 1.5);
    const topPlateMat = new THREE.MeshStandardMaterial({
      color: 0xf8c649,
      metalness: 0.98,
      roughness: 0.22,
      bumpMap: bumpTexture,
      bumpScale: 0.018,
      envMapIntensity: 2.4
    });

    const topPlate = new THREE.Mesh(topPlateGeo, topPlateMat);
    topPlate.position.z = 0.42;
    this.goldBarMesh.add(topPlate);
    this.topPlate = topPlate;
  }

  // Create Floating Persian Azadi & Emami Gold Coins
  createFloatingCoins() {
    const coinGeo = new THREE.CylinderGeometry(0.65, 0.65, 0.08, 48);
    
    // Create embossed coin rim & face texture
    const coinTexture = this.generateCoinTexture();

    const coinMat = new THREE.MeshPhysicalMaterial({
      color: 0xf7ca48,
      metalness: 0.96,
      roughness: 0.16,
      bumpMap: coinTexture,
      bumpScale: 0.015,
      clearcoat: 0.35,
      envMapIntensity: 2.2
    });

    // 5 floating coins placed dynamically in orbit
    const coinConfigs = [
      { x: -3.2, y: 1.4, z: -1.2, scale: 0.9, rotSpeed: 0.012 },
      { x: 3.5, y: -1.2, z: -0.8, scale: 1.1, rotSpeed: -0.015 },
      { x: -2.8, y: -2.1, z: 1.2, scale: 0.75, rotSpeed: 0.02 },
      { x: 3.0, y: 2.2, z: -2.0, scale: 0.85, rotSpeed: -0.018 },
      { x: 0.2, y: -3.4, z: -1.0, scale: 1.2, rotSpeed: 0.01 }
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
        rotSpeed: cfg.rotSpeed,
        phase: Math.random() * Math.PI * 2
      };

      this.scene.add(mesh);
      this.coins.push(mesh);
    });
  }

  // Procedural Coin Stamp Texture
  generateCoinTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, 512, 512);

    // Milled ring around edge
    ctx.strokeStyle = '#202020';
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.arc(256, 256, 230, 0, Math.PI * 2);
    ctx.stroke();

    // Persian motif ring
    for (let i = 0; i < 36; i++) {
      const angle = (i / 36) * Math.PI * 2;
      const x = 256 + Math.cos(angle) * 215;
      const y = 256 + Math.sin(angle) * 215;
      ctx.fillStyle = '#d0d0d0';
      ctx.fillRect(x - 3, y - 3, 6, 6);
    }

    // Dome / Icon center
    ctx.fillStyle = '#202020';
    ctx.beginPath();
    ctx.arc(256, 256, 120, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#e0e0e0';
    ctx.beginPath();
    ctx.arc(256, 256, 90, 0, Math.PI * 2);
    ctx.fill();

    return new THREE.CanvasTexture(canvas);
  }

  // Glowing golden dust / particle galaxy (Active Theory style)
  createCosmicParticles() {
    const count = 2200;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const scales = new Float32Array(count);
    const colors = new Float32Array(count * 3);

    const goldPalette = [
      new THREE.Color(0xffd700),
      new THREE.Color(0xfff3a8),
      new THREE.Color(0xd4af37),
      new THREE.Color(0xffa500),
      new THREE.Color(0x64b5f6) // Contrast cyan spark
    ];

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      // Cylinder distribution around center
      const radius = 2.5 + Math.random() * 11;
      const theta = Math.random() * Math.PI * 2;
      const y = (Math.random() - 0.5) * 16;

      positions[i3] = Math.cos(theta) * radius;
      positions[i3 + 1] = y;
      positions[i3 + 2] = Math.sin(theta) * radius;

      scales[i] = Math.random() * 0.04 + 0.015;

      const col = goldPalette[Math.floor(Math.random() * goldPalette.length)];
      colors[i3] = col.r;
      colors[i3 + 1] = col.g;
      colors[i3 + 2] = col.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('scale', new THREE.BufferAttribute(scales, 1));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Particle sprite
    const spriteCanvas = document.createElement('canvas');
    spriteCanvas.width = 64;
    spriteCanvas.height = 64;
    const sCtx = spriteCanvas.getContext('2d');
    const grad = sCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.3, 'rgba(255, 215, 0, 0.8)');
    grad.addColorStop(0.7, 'rgba(212, 175, 55, 0.2)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    sCtx.fillStyle = grad;
    sCtx.fillRect(0, 0, 64, 64);

    const pTexture = new THREE.CanvasTexture(spriteCanvas);

    const pMat = new THREE.PointsMaterial({
      size: 0.12,
      map: pTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      vertexColors: true
    });

    this.particles = new THREE.Points(geometry, pMat);
    this.scene.add(this.particles);
  }

  // Futuristic Subsurface Floor Grid
  createFloorGrid() {
    const size = 30;
    const divisions = 30;
    const grid = new THREE.GridHelper(size, divisions, 0xb8860b, 0x1b1c22);
    grid.position.y = -3.8;
    grid.material.opacity = 0.28;
    grid.material.transparent = true;
    this.gridHelper = grid;
    this.scene.add(grid);
  }

  // Dynamic Scale update for Gold Calculator interaction
  updateObjectWeight(weightGrams) {
    if (!this.goldBarGroup) return;

    // Standard 1000g = scale 1.0
    // If 10 soot (0.01g) -> tiny elegant gold nugget/pellet or miniature bar
    // If 10 kg -> giant majestic bullion bar
    let targetScale = 1.0;
    if (weightGrams <= 1) {
      // 0 to 1 gram (soot range)
      targetScale = 0.35 + (weightGrams * 0.25);
    } else if (weightGrams <= 100) {
      // 1g to 100g
      targetScale = 0.6 + (Math.log10(weightGrams) * 0.2);
    } else if (weightGrams <= 1000) {
      // 100g to 1kg
      targetScale = 0.8 + (weightGrams / 1000) * 0.3;
    } else {
      // 1kg+ (multi-kilo)
      targetScale = 1.1 + Math.min(weightGrams / 10000, 0.5);
    }

    // Smoothly animate scale with lerp in render loop
    this.goldBarTargetScale = targetScale;
    
    // Quick burst of light upon significant change
    if (this.lights.cursor) {
      this.lights.cursor.intensity = 24;
      setTimeout(() => {
        if (this.lights.cursor) this.lights.cursor.intensity = 15;
      }, 250);
    }
  }

  // Mouse & Parallax Handling
  onMouseMove(e) {
    this.mouse.targetX = (e.clientX - this.windowHalf.x) / this.windowHalf.x;
    this.mouse.targetY = (e.clientY - this.windowHalf.y) / this.windowHalf.y;
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

  // Called from main scroll controller (Lenis or window onscroll)
  setScrollProgress(progress) {
    this.targetScrollProgress = progress;
  }

  // Main Render Loop (60-120fps)
  animate() {
    if (this.isDisposed) return;
    this.rafId = requestAnimationFrame(this.animate.bind(this));

    const delta = this.clock.getDelta();
    const elapsedTime = this.clock.getElapsedTime();

    // 1. Mouse Lerp
    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.05;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.05;

    // 2. Scroll Progress Lerp
    this.scrollProgress += (this.targetScrollProgress - this.scrollProgress) * 0.08;
    const sp = this.scrollProgress; // 0.0 (top) to 1.0 (bottom)

    // 3. Move Interactive Lights with Cursor
    if (this.lights.cursor) {
      this.lights.cursor.position.x = this.mouse.x * 5;
      this.lights.cursor.position.y = -this.mouse.y * 3.5;
    }

    // 4. Camera & Gold Bar Scroll Choreography
    // Phase 0: Hero (sp 0.0 - 0.25)
    // Phase 1: Market Pulse (sp 0.25 - 0.55)
    // Phase 2: 3D Calculator (sp 0.55 - 0.85)
    // Phase 3: Market Depth & Bubble (sp 0.85 - 1.0)
    
    if (this.goldBarGroup) {
      // Base gentle idle float
      const idleFloat = Math.sin(elapsedTime * 1.2) * 0.12;
      const idleRot = Math.cos(elapsedTime * 0.8) * 0.08;

      // Dynamic scale interpolation
      if (this.goldBarTargetScale) {
        const curScale = this.goldBarGroup.scale.x;
        const newScale = curScale + (this.goldBarTargetScale - curScale) * 0.1;
        this.goldBarGroup.scale.set(newScale, newScale, newScale);
      }

      if (sp < 0.28) {
        // Hero Section
        const t = sp / 0.28;
        this.goldBarGroup.position.x = -1.2 * t + (this.mouse.x * 0.4);
        this.goldBarGroup.position.y = 0.2 + idleFloat - (t * 0.5);
        this.goldBarGroup.position.z = 0 + (t * 0.8);
        this.goldBarGroup.rotation.x = 0.35 + (this.mouse.y * 0.25);
        this.goldBarGroup.rotation.y = -0.45 + (elapsedTime * 0.15) + (this.mouse.x * 0.35);
        this.goldBarGroup.rotation.z = 0.12 + idleRot;

        this.camera.position.z = 7.5 - (t * 1.0);
      } else if (sp < 0.6) {
        // Market Pulse Section
        const t = (sp - 0.28) / 0.32;
        this.goldBarGroup.position.x = -1.2 + (t * 4.2) + (this.mouse.x * 0.4);
        this.goldBarGroup.position.y = -0.3 + idleFloat;
        this.goldBarGroup.position.z = 0.8 - (t * 1.5);
        this.goldBarGroup.rotation.x = 0.4 + (t * 0.8);
        this.goldBarGroup.rotation.y = elapsedTime * 0.25;
        this.goldBarGroup.rotation.z = -0.2;

        this.camera.position.z = 6.5;
      } else if (sp < 0.85) {
        // 3D Calculator Section
        const t = (sp - 0.6) / 0.25;
        this.goldBarGroup.position.x = 2.0 - (t * 3.8) + (this.mouse.x * 0.3);
        this.goldBarGroup.position.y = 0.1 + (t * 0.5) + idleFloat;
        this.goldBarGroup.position.z = -0.7 + (t * 1.8);
        this.goldBarGroup.rotation.x = 0.65 - (t * 0.3) + (this.mouse.y * 0.2);
        this.goldBarGroup.rotation.y = 0.4 + (t * 0.5) + (this.mouse.x * 0.4);
        this.goldBarGroup.rotation.z = 0.05;

        this.camera.position.z = 6.5 - (t * 0.5);
      } else {
        // Market Depth & Bubble Section
        const t = (sp - 0.85) / 0.15;
        this.goldBarGroup.position.x = -1.8 + (t * 1.8);
        this.goldBarGroup.position.y = 0.6 + (t * 2.2);
        this.goldBarGroup.position.z = 1.1 - (t * 4.0);
        this.goldBarGroup.rotation.x = elapsedTime * 0.3;
        this.goldBarGroup.rotation.y = elapsedTime * 0.4;
      }
    }

    // 5. Animate Floating Coins
    this.coins.forEach((coin, idx) => {
      const u = coin.userData;
      coin.rotation.y += u.rotSpeed;
      coin.rotation.x += u.rotSpeed * 0.5;

      const floatY = Math.sin(elapsedTime * 1.5 + u.phase) * 0.25;
      coin.position.y = u.baseY + floatY - (sp * 2.0);

      // React to scroll: push coins toward camera on market pulse
      if (sp > 0.2 && sp < 0.6) {
        coin.position.z = u.baseZ + Math.sin((sp - 0.2) * Math.PI) * 1.8;
      } else {
        coin.position.z = u.baseZ;
      }
    });

    // 6. Animate Particles & Starfield
    if (this.particles) {
      this.particles.rotation.y = elapsedTime * 0.025 + (this.mouse.x * 0.15);
      this.particles.rotation.x = elapsedTime * 0.012 + (this.mouse.y * 0.1);
    }

    // 7. Render
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.isDisposed = true;
    if (this.rafId) cancelAnimationFrame(this.rafId);
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('mousemove', this.onMouseMove);
    if (this.renderer && this.renderer.domElement) {
      this.renderer.domElement.remove();
    }
  }
}
