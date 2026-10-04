/* ==========================================================================
   HOÀNG TỬ BÉ & CHÚ CÁO - B-612 SUNSET EXPERIENCE
   THREE.JS 3D SCENE & INTERACTIVE LOGIC
   ========================================================================== */

let scene, camera, renderer, controls;
let clock = new THREE.Clock();

// Scene parent groups
const worldGroup = new THREE.Group();
const asteroidGroup = new THREE.Group();
const charactersGroup = new THREE.Group();
const roseGroup = new THREE.Group();
const cosmosGroup = new THREE.Group();

// Raycaster for interactive object selection
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Model reference references
let sunMesh, sunGlowSprite, sunLight, ambientLight, skyDome, skyMaterial;
let princeGroup, foxGroup, roseBlossomGroup, roseLight;
let princeScarfParts = [];
let foxTailParts = [];
let starParticles, shootingStars = [];
let floatingDust;

// Camera preset animation targets
let targetCameraPos = new THREE.Vector3(4.5, 3.8, 8.5);
let targetLookAt = new THREE.Vector3(0, 1.8, 0);
let isTransitioningCamera = true;

// Auto Sunset Loop State
let isAutoSunset = false;
let autoSunsetDirection = 1; // 1 for advancing, -1 for rewinding
let sunsetVal = 0.65; // initial 44th sunset state

// Interactive Raycast Click Targets
let clickableObjects = [];

// Vietnamese Quotes Database
const quotes = [
  {
    text: "Người ta chỉ thấy rõ bằng trái tim. Cái cốt lõi là vô hình trong mắt trần.",
    sub: "Lời dặn dò của chú Cáo"
  },
  {
    text: "Một ngày nọ, tôi đã ngắm hoàng hôn bốn mươi bốn lần... Khi người ta quá buồn, người ta thường yêu những buổi hoàng hôn.",
    sub: "Hoàng tử bé & Tiểu tinh cầu B-612"
  },
  {
    text: "Bạn có trách nhiệm mãi mãi với những gì bạn đã thuần hóa. Bạn có trách nhiệm với bông hồng của mình.",
    sub: "Bài học về sự gắn kết"
  },
  {
    text: "Nếu bạn thuần hóa tôi, cuộc đời tôi sẽ như được chiếu sáng bởi ánh mặt trời rực rỡ.",
    sub: "Chú Cáo nói với Hoàng tử"
  },
  {
    text: "Chính thời gian mà bạn đã dành cho bông hồng của bạn mới khiến bông hồng trở nên quan trọng đến thế.",
    sub: "Bí mật của tình yêu thương"
  },
  {
    text: "Nếu bạn yêu một bông hoa nở trên một ngôi sao, ngắm nhìn bầu trời đêm vào mỗi buổi tối sẽ ngọt ngào biết bao...",
    sub: "Vũ trụ đầy hoa hồng"
  },
  {
    text: "Tất cả người lớn đều từng là trẻ con... nhưng ít ai trong số họ nhớ được điều đó.",
    sub: "Lời tự sự của tác giả"
  },
  {
    text: "Điều làm cho sa mạc trở nên đẹp đẽ là ở đâu đó nó giấu một giếng nước...",
    sub: "Vẻ đẹp ẩn giấu"
  }
];
let currentQuoteIndex = 0;

function initThree() {
  const container = document.getElementById('webgl-canvas');

  // 1. Scene Setup
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0c18);
  scene.fog = new THREE.FogExp2(0x13122c, 0.007);

  // 2. Camera Setup
  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(5.5, 4.2, 9.2);

  // 3. Renderer Setup with PCF Soft Shadows & ACES Filmic Tone Mapping
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  container.appendChild(renderer.domElement);

  // 4. OrbitControls
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.maxDistance = 35;
  controls.minDistance = 3.2;
  controls.target.set(0, 1.8, 0);
  controls.maxPolarAngle = Math.PI / 2 + 0.25;

  // Add scene hierarchy
  scene.add(worldGroup);
  scene.add(cosmosGroup);
  worldGroup.add(asteroidGroup);
  asteroidGroup.add(charactersGroup);
  asteroidGroup.add(roseGroup);

  // 5. Lighting Setup
  ambientLight = new THREE.AmbientLight(0x76558e, 0.9);
  scene.add(ambientLight);

  // Directional Sun Light
  sunLight = new THREE.DirectionalLight(0xffb077, 2.2);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.width = 1024;
  sunLight.shadow.mapSize.height = 1024;
  sunLight.shadow.camera.near = 1;
  sunLight.shadow.camera.far = 80;
  sunLight.shadow.camera.left = -8;
  sunLight.shadow.camera.right = 8;
  sunLight.shadow.camera.top = 8;
  sunLight.shadow.camera.bottom = -8;
  sunLight.shadow.bias = -0.001;
  scene.add(sunLight);

  // Character soft rim fill light
  const charFillLight = new THREE.PointLight(0xffe2b8, 1.2, 10);
  charFillLight.position.set(0, 3.5, 1.5);
  worldGroup.add(charFillLight);

  // 6. Build Procedural Environment & Characters
  createSkyAndStars();
  createSun();
  createAsteroidB612();
  createLittlePrince();
  createFox();
  createTheRose();
  createStardustAndShootingStars();

  // Set initial sunset state
  updateSunsetCycle(sunsetVal);

  // 7. Register Window Resize & Click Listeners
  window.addEventListener('resize', onWindowResize);
  window.addEventListener('pointerdown', onPointerDown);

  // Initialize UI Event Handlers
  setupUIInteractions();

  // Start Animation Render Loop
  animate();
}

/* ==========================================================================
   PROCEDURAL TEXTURES & GEOMETRY CREATION
   ========================================================================== */

function createGlowTexture(colorStr, outerColorStr) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  gradient.addColorStop(0, colorStr);
  gradient.addColorStop(0.3, colorStr);
  gradient.addColorStop(0.7, outerColorStr);
  gradient.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(canvas);
}

function createSkyAndStars() {
  const skyCanvas = document.createElement('canvas');
  skyCanvas.width = 16;
  skyCanvas.height = 256;
  const skyCtx = skyCanvas.getContext('2d');

  const skyTex = new THREE.CanvasTexture(skyCanvas);
  skyMaterial = new THREE.MeshBasicMaterial({
    map: skyTex,
    side: THREE.BackSide,
    depthWrite: false
  });
  skyMaterial.userData = { canvas: skyCanvas, ctx: skyCtx, tex: skyTex };

  const skyGeo = new THREE.SphereGeometry(180, 32, 24);
  skyDome = new THREE.Mesh(skyGeo, skyMaterial);
  cosmosGroup.add(skyDome);

  // Star Particles
  const starCount = 1800;
  const starGeo = new THREE.BufferGeometry();
  const starPositions = new Float32Array(starCount * 3);
  const starColors = new Float32Array(starCount * 3);

  for (let i = 0; i < starCount; i++) {
    const u = Math.random();
    const v = Math.random();
    const theta = u * 2.0 * Math.PI;
    const phi = Math.acos(2.0 * v - 1.0);
    const r = 140 + Math.random() * 30;

    starPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    starPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    starPositions[i * 3 + 2] = r * Math.cos(phi);

    const tint = Math.random();
    if (tint < 0.35) {
      starColors[i * 3] = 1.0; starColors[i * 3 + 1] = 0.88; starColors[i * 3 + 2] = 0.65;
    } else if (tint < 0.7) {
      starColors[i * 3] = 0.7; starColors[i * 3 + 1] = 0.85; starColors[i * 3 + 2] = 1.0;
    } else {
      starColors[i * 3] = 1.0; starColors[i * 3 + 1] = 1.0; starColors[i * 3 + 2] = 1.0;
    }
  }

  starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
  starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

  const starTex = createGlowTexture('rgba(255,255,255,1)', 'rgba(255,255,255,0.2)');
  const starMat = new THREE.PointsMaterial({
    size: 1.6,
    map: starTex,
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  starParticles = new THREE.Points(starGeo, starMat);
  cosmosGroup.add(starParticles);
}

function createSun() {
  const sunGeo = new THREE.SphereGeometry(3.6, 24, 24);
  const sunMat = new THREE.MeshBasicMaterial({
    color: 0xfff2a8,
    transparent: true,
    opacity: 0.95
  });
  sunMesh = new THREE.Mesh(sunGeo, sunMat);
  sunMesh.name = "Sun";

  const glowTex = createGlowTexture('rgba(255, 200, 110, 0.85)', 'rgba(255, 80, 40, 0.25)');
  const spriteMat = new THREE.SpriteMaterial({
    map: glowTex,
    color: 0xffaa44,
    blending: THREE.AdditiveBlending,
    transparent: true,
    opacity: 0.85
  });
  sunGlowSprite = new THREE.Sprite(spriteMat);
  sunGlowSprite.scale.set(32, 32, 1);
  sunMesh.add(sunGlowSprite);

  scene.add(sunMesh);
  clickableObjects.push(sunMesh);
}

function createAsteroidB612() {
  const planetRadius = 4.2;
  const planetGeo = new THREE.SphereGeometry(planetRadius, 48, 48);

  const pos = planetGeo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const vx = pos.getX(i);
    const vy = pos.getY(i);
    const vz = pos.getZ(i);

    const noise = Math.sin(vx * 1.5) * Math.cos(vy * 1.5) * Math.sin(vz * 1.5) * 0.16
      + Math.sin(vx * 3.0 + vy * 2.0) * 0.08;
    const length = Math.sqrt(vx * vx + vy * vy + vz * vz);
    const factor = (planetRadius + noise) / length;

    pos.setXYZ(i, vx * factor, vy * factor, vz * factor);
  }
  planetGeo.computeVertexNormals();

  const planetMat = new THREE.MeshStandardMaterial({
    color: 0x486b4a, // Moss green top
    roughness: 0.9,
    metalness: 0.05,
    flatShading: true
  });

  const planetMesh = new THREE.Mesh(planetGeo, planetMat);
  planetMesh.receiveShadow = true;
  asteroidGroup.add(planetMesh);

  // Craters / Extinguished Volcanoes
  const craterMat = new THREE.MeshStandardMaterial({
    color: 0x3d5440,
    roughness: 0.95,
    flatShading: true
  });

  const craterConfigs = [
    { lat: 0.3, lon: -1.2, r: 0.7 },
    { lat: -0.6, lon: 0.8, r: 0.9 },
    { lat: -0.8, lon: -0.9, r: 0.6 },
    { lat: 0.9, lon: 2.1, r: 0.8 }
  ];

  craterConfigs.forEach(c => {
    const cx = Math.cos(c.lat) * Math.sin(c.lon) * planetRadius;
    const cy = Math.sin(c.lat) * planetRadius;
    const cz = Math.cos(c.lat) * Math.cos(c.lon) * planetRadius;

    const ringGeo = new THREE.TorusGeometry(c.r, 0.12, 6, 12);
    const ring = new THREE.Mesh(ringGeo, craterMat);
    ring.position.set(cx, cy, cz);
    ring.lookAt(0, 0, 0);
    asteroidGroup.add(ring);
  });

  // Volcano Vents (B-612 Active & Inactive Volcanoes)
  const volcanoGroup = new THREE.Group();
  volcanoGroup.position.set(-1.8, 3.2, -1.8);
  volcanoGroup.rotation.x = -0.4;

  const vConeGeo = new THREE.CylinderGeometry(0.2, 0.45, 0.5, 10, 1, true);
  const vMat = new THREE.MeshStandardMaterial({ color: 0x42382c, roughness: 0.9 });
  const volcano = new THREE.Mesh(vConeGeo, vMat);
  volcanoGroup.add(volcano);
  asteroidGroup.add(volcanoGroup);

  // Wild Daisies & Fairytale Flowers
  const flowerPetalGeo = new THREE.SphereGeometry(0.04, 6, 6);
  flowerPetalGeo.scale(1, 0.4, 1.8);
  const flowerCenterGeo = new THREE.SphereGeometry(0.04, 8, 8);
  const petalMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 });
  const petalMatYellow = new THREE.MeshStandardMaterial({ color: 0xffe066, roughness: 0.5 });
  const centerMat = new THREE.MeshStandardMaterial({ color: 0xf4a261, roughness: 0.4 });

  for (let i = 0; i < 50; i++) {
    const u = Math.random();
    const v = Math.random();
    const theta = u * 2.0 * Math.PI;
    const phi = Math.acos(2.0 * v - 1.0);

    // Keep clear of character sitting area
    if (phi < 0.6 && theta > 0.8 && theta < 2.4) continue;

    const r = planetRadius + 0.02;
    const fx = r * Math.sin(phi) * Math.cos(theta);
    const fy = r * Math.sin(phi) * Math.sin(theta);
    const fz = r * Math.cos(phi);

    const flower = new THREE.Group();
    flower.position.set(fx, fy, fz);
    flower.lookAt(fx * 2, fy * 2, fz * 2);

    const center = new THREE.Mesh(flowerCenterGeo, centerMat);
    flower.add(center);

    const pMat = Math.random() > 0.3 ? petalMat : petalMatYellow;
    for (let p = 0; p < 5; p++) {
      const petal = new THREE.Mesh(flowerPetalGeo, pMat);
      petal.rotation.z = (p / 5) * Math.PI * 2;
      petal.position.x = Math.cos((p / 5) * Math.PI * 2) * 0.06;
      petal.position.y = Math.sin((p / 5) * Math.PI * 2) * 0.06;
      flower.add(petal);
    }

    const scale = 0.7 + Math.random() * 0.6;
    flower.scale.set(scale, scale, scale);
    asteroidGroup.add(flower);
  }
}

function createLittlePrince() {
  princeGroup = new THREE.Group();
  princeGroup.name = "LittlePrince";
  princeGroup.position.set(-0.35, 4.05, 0.3);
  princeGroup.rotation.y = -Math.PI / 10;

  const skinMat = new THREE.MeshStandardMaterial({ color: 0xffdfc4, roughness: 0.6 });
  const hairMat = new THREE.MeshStandardMaterial({ color: 0xf5c342, roughness: 0.4, flatShading: true });
  const coatMat = new THREE.MeshStandardMaterial({ color: 0x3f7a58, roughness: 0.6 });
  const beltMat = new THREE.MeshStandardMaterial({ color: 0xd9383a, roughness: 0.5 });
  const scarfMat = new THREE.MeshStandardMaterial({ color: 0xffd13b, roughness: 0.3, flatShading: true });
  const bootsMat = new THREE.MeshStandardMaterial({ color: 0x734828, roughness: 0.7 });

  // Coat / Torso
  const torsoGeo = new THREE.CylinderGeometry(0.24, 0.28, 0.65, 12);
  const torso = new THREE.Mesh(torsoGeo, coatMat);
  torso.position.y = 0.55;
  torso.castShadow = true;
  princeGroup.add(torso);

  // Sash / Belt
  const beltGeo = new THREE.CylinderGeometry(0.26, 0.27, 0.1, 12);
  const belt = new THREE.Mesh(beltGeo, beltMat);
  belt.position.y = 0.45;
  princeGroup.add(belt);

  // Head
  const headGeo = new THREE.SphereGeometry(0.24, 16, 16);
  const head = new THREE.Mesh(headGeo, skinMat);
  head.position.y = 1.05;
  head.castShadow = true;
  head.rotation.y = -0.3;
  head.rotation.x = -0.1;
  princeGroup.add(head);

  // Golden Hair Locks
  const hairGroup = new THREE.Group();
  const lockGeo = new THREE.DodecahedronGeometry(0.12, 0);

  const hairPositions = [
    [0, 0.14, 0, 1.3],
    [-0.12, 0.12, -0.05, 1.1],
    [0.12, 0.12, -0.05, 1.1],
    [-0.14, 0.05, 0.1, 1.0],
    [0.14, 0.05, 0.1, 1.0],
    [0, 0.18, -0.1, 1.2],
    [-0.08, 0.14, 0.12, 0.9],
    [0.08, 0.16, 0.1, 1.1],
    [-0.18, -0.02, 0.08, 0.8],
    [0.18, -0.02, 0.08, 0.8],
    [0, 0.23, 0.05, 1.0]
  ];

  hairPositions.forEach(([hx, hy, hz, s]) => {
    const lock = new THREE.Mesh(lockGeo, hairMat);
    lock.position.set(hx, hy, hz);
    lock.scale.set(s, s * 1.1, s);
    lock.rotation.set(Math.random(), Math.random(), Math.random());
    hairGroup.add(lock);
  });
  head.add(hairGroup);

  // Legs & Boots
  const thighGeo = new THREE.CylinderGeometry(0.1, 0.09, 0.45, 8);
  const calfGeo = new THREE.CylinderGeometry(0.085, 0.08, 0.45, 8);
  const bootGeo = new THREE.BoxGeometry(0.16, 0.14, 0.25);

  // Left Leg
  const leftLeg = new THREE.Group();
  leftLeg.position.set(-0.16, 0.28, 0.12);
  const lThigh = new THREE.Mesh(thighGeo, coatMat);
  lThigh.rotation.x = Math.PI / 2.3;
  lThigh.position.set(0, 0, 0.2);
  leftLeg.add(lThigh);

  const lCalf = new THREE.Mesh(calfGeo, coatMat);
  lCalf.position.set(0, -0.22, 0.38);
  lCalf.rotation.x = 0.2;
  leftLeg.add(lCalf);

  const lBoot = new THREE.Mesh(bootGeo, bootsMat);
  lBoot.position.set(0, -0.42, 0.44);
  leftLeg.add(lBoot);
  princeGroup.add(leftLeg);

  // Right Leg
  const rightLeg = new THREE.Group();
  rightLeg.position.set(0.16, 0.28, 0.12);
  const rThigh = new THREE.Mesh(thighGeo, coatMat);
  rThigh.rotation.x = Math.PI / 2.4;
  rThigh.position.set(0, 0, 0.2);
  rightLeg.add(rThigh);

  const rCalf = new THREE.Mesh(calfGeo, coatMat);
  rCalf.position.set(0, -0.22, 0.38);
  rCalf.rotation.x = 0.2;
  rightLeg.add(rCalf);

  const rBoot = new THREE.Mesh(bootGeo, bootsMat);
  rBoot.position.set(0, -0.42, 0.44);
  rightLeg.add(rBoot);
  princeGroup.add(rightLeg);

  // Arms
  const armGeo = new THREE.CylinderGeometry(0.07, 0.065, 0.42, 8);
  const leftArm = new THREE.Mesh(armGeo, coatMat);
  leftArm.position.set(-0.32, 0.58, 0.15);
  leftArm.rotation.x = Math.PI / 4;
  leftArm.rotation.z = Math.PI / 12;
  princeGroup.add(leftArm);

  const rightArm = new THREE.Mesh(armGeo, coatMat);
  rightArm.position.set(0.32, 0.52, 0.16);
  rightArm.rotation.x = Math.PI / 4;
  rightArm.rotation.z = -Math.PI / 5;
  princeGroup.add(rightArm);

  // Dynamic Fluttering Yellow Scarf
  const scarfCollar = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.08, 8, 16), scarfMat);
  scarfCollar.position.set(0, 0.88, 0);
  scarfCollar.rotation.x = Math.PI / 2;
  princeGroup.add(scarfCollar);

  const scarfGroup = new THREE.Group();
  scarfGroup.position.set(0, 0.86, -0.15);
  princeGroup.add(scarfGroup);

  const segmentCount = 9;
  princeScarfParts = [];
  let parentObj = scarfGroup;

  for (let s = 0; s < segmentCount; s++) {
    const segGeo = new THREE.BoxGeometry(0.18 - s * 0.009, 0.04, 0.22);
    const seg = new THREE.Mesh(segGeo, scarfMat);
    seg.position.z = -0.18;
    seg.castShadow = true;

    parentObj.add(seg);
    princeScarfParts.push(seg);
    parentObj = seg;
  }

  charactersGroup.add(princeGroup);
  clickableObjects.push(princeGroup);
}

function createFox() {
  foxGroup = new THREE.Group();
  foxGroup.name = "Fox";
  foxGroup.position.set(0.55, 4.02, 0.38);
  foxGroup.rotation.y = -Math.PI / 6;

  const furOrangeMat = new THREE.MeshStandardMaterial({ color: 0xd95728, roughness: 0.7 });
  const furWhiteMat = new THREE.MeshStandardMaterial({ color: 0xfff8ee, roughness: 0.8 });
  const noseMat = new THREE.MeshStandardMaterial({ color: 0x1f1f1f, roughness: 0.4 });

  // Body
  const bodyGeo = new THREE.ConeGeometry(0.24, 0.65, 10);
  const body = new THREE.Mesh(bodyGeo, furOrangeMat);
  body.position.set(0, 0.35, 0);
  body.rotation.x = 0.2;
  body.castShadow = true;
  foxGroup.add(body);

  // White chest
  const chestGeo = new THREE.SphereGeometry(0.16, 12, 12);
  chestGeo.scale(0.8, 1.4, 0.8);
  const chest = new THREE.Mesh(chestGeo, furWhiteMat);
  chest.position.set(0, 0.34, 0.12);
  chest.rotation.x = 0.1;
  foxGroup.add(chest);

  // Head
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 0.68, 0.08);
  headGroup.rotation.x = -0.05;
  headGroup.rotation.y = -0.15;
  foxGroup.add(headGroup);

  const skullGeo = new THREE.SphereGeometry(0.18, 12, 12);
  const skull = new THREE.Mesh(skullGeo, furOrangeMat);
  headGroup.add(skull);

  // Snout
  const snoutGeo = new THREE.ConeGeometry(0.09, 0.24, 8);
  const snout = new THREE.Mesh(snoutGeo, furOrangeMat);
  snout.position.set(0, -0.03, 0.18);
  snout.rotation.x = Math.PI / 2.2;
  headGroup.add(snout);

  const muzzleGeo = new THREE.SphereGeometry(0.08, 8, 8);
  muzzleGeo.scale(0.9, 0.7, 1.2);
  const muzzle = new THREE.Mesh(muzzleGeo, furWhiteMat);
  muzzle.position.set(0, -0.06, 0.15);
  headGroup.add(muzzle);

  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 8), noseMat);
  nose.position.set(0, -0.02, 0.29);
  headGroup.add(nose);

  // Pointy Fox Ears
  const earGeo = new THREE.ConeGeometry(0.09, 0.28, 6);
  earGeo.scale(1, 1, 0.45);

  const leftEar = new THREE.Mesh(earGeo, furOrangeMat);
  leftEar.position.set(-0.11, 0.22, -0.02);
  leftEar.rotation.z = 0.25;
  leftEar.rotation.x = -0.1;
  headGroup.add(leftEar);

  const rightEar = new THREE.Mesh(earGeo, furOrangeMat);
  rightEar.position.set(0.11, 0.22, -0.02);
  rightEar.rotation.z = -0.25;
  rightEar.rotation.x = -0.1;
  headGroup.add(rightEar);

  const innerEarGeo = new THREE.ConeGeometry(0.055, 0.2, 5);
  innerEarGeo.scale(1, 1, 0.3);
  const innerLeftEar = new THREE.Mesh(innerEarGeo, furWhiteMat);
  innerLeftEar.position.set(-0.1, 0.21, 0.01);
  innerLeftEar.rotation.z = 0.25;
  headGroup.add(innerLeftEar);

  const innerRightEar = new THREE.Mesh(innerEarGeo, furWhiteMat);
  innerRightEar.position.set(0.1, 0.21, 0.01);
  innerRightEar.rotation.z = -0.25;
  headGroup.add(innerRightEar);

  // Paws
  const pawGeo = new THREE.SphereGeometry(0.06, 8, 8);
  pawGeo.scale(1, 0.7, 1.3);
  const lPaw = new THREE.Mesh(pawGeo, furWhiteMat);
  lPaw.position.set(-0.11, 0.05, 0.19);
  foxGroup.add(lPaw);

  const rPaw = new THREE.Mesh(pawGeo, furWhiteMat);
  rPaw.position.set(0.11, 0.05, 0.19);
  foxGroup.add(rPaw);

  // Bushy Fox Tail
  const tailRoot = new THREE.Group();
  tailRoot.position.set(0.05, 0.12, -0.15);
  foxGroup.add(tailRoot);

  foxTailParts = [];
  let parentTail = tailRoot;
  const tailSegmentCount = 6;

  for (let t = 0; t < tailSegmentCount; t++) {
    const isTip = t >= tailSegmentCount - 2;
    const rad = Math.sin((t / (tailSegmentCount - 1)) * Math.PI) * 0.12 + 0.07;
    const segGeo = new THREE.SphereGeometry(rad, 8, 8);
    segGeo.scale(1, 1.1, 1.6);
    const seg = new THREE.Mesh(segGeo, isTip ? furWhiteMat : furOrangeMat);
    seg.position.set(0.04, 0.05, -0.12);
    seg.castShadow = true;

    parentTail.add(seg);
    foxTailParts.push(seg);
    parentTail = seg;
  }

  charactersGroup.add(foxGroup);
  clickableObjects.push(foxGroup);
}

function createTheRose() {
  roseGroup.position.set(1.9, 3.65, -0.8);
  roseGroup.rotation.y = 0.5;

  // Pedestal
  const baseGeo = new THREE.CylinderGeometry(0.38, 0.42, 0.12, 16);
  const baseMat = new THREE.MeshStandardMaterial({ color: 0x5a3825, roughness: 0.8 });
  const base = new THREE.Mesh(baseGeo, baseMat);
  base.castShadow = true;
  roseGroup.add(base);

  // Curved Stem
  const stemCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.06, 0),
    new THREE.Vector3(0.05, 0.25, 0.02),
    new THREE.Vector3(-0.04, 0.45, -0.02),
    new THREE.Vector3(0, 0.62, 0)
  ]);
  const stemGeo = new THREE.TubeGeometry(stemCurve, 16, 0.022, 8, false);
  const stemMat = new THREE.MeshStandardMaterial({ color: 0x2d6a4f, roughness: 0.5 });
  const stem = new THREE.Mesh(stemGeo, stemMat);
  roseGroup.add(stem);

  // Leaves
  const leafGeo = new THREE.SphereGeometry(0.07, 6, 6);
  leafGeo.scale(1.8, 0.3, 0.8);
  const leaf1 = new THREE.Mesh(leafGeo, stemMat);
  leaf1.position.set(0.08, 0.32, 0.02);
  leaf1.rotation.z = 0.5;
  roseGroup.add(leaf1);

  const leaf2 = new THREE.Mesh(leafGeo, stemMat);
  leaf2.position.set(-0.07, 0.42, -0.02);
  leaf2.rotation.z = -0.4;
  roseGroup.add(leaf2);

  // Rose Blossom
  const petalMat = new THREE.MeshStandardMaterial({
    color: 0xde1a42,
    roughness: 0.35,
    metalness: 0.05
  });
  roseBlossomGroup = new THREE.Group();
  roseBlossomGroup.position.set(0, 0.65, 0);

  const bud = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), petalMat);
  roseBlossomGroup.add(bud);

  for (let p = 0; p < 7; p++) {
    const petal = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 8), petalMat);
    petal.scale.set(0.8, 1.2, 0.25);
    const angle = (p / 7) * Math.PI * 2;
    petal.position.set(Math.cos(angle) * 0.06, 0.02, Math.sin(angle) * 0.06);
    petal.rotation.y = angle + 0.3;
    petal.rotation.x = 0.2;
    roseBlossomGroup.add(petal);
  }
  roseGroup.add(roseBlossomGroup);

  // Glass Cloche (Bell Jar)
  const clocheGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.82, 24, 1, true);
  const clocheDomeGeo = new THREE.SphereGeometry(0.3, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2);
  clocheDomeGeo.translate(0, 0.41, 0);

  const clocheGroup = new THREE.Group();
  clocheGroup.position.y = 0.47;

  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.28,
    roughness: 0.05,
    metalness: 0.1,
    transmission: 0.75,
    ior: 1.45,
    depthWrite: false
  });

  const glassCylinder = new THREE.Mesh(clocheGeo, glassMat);
  const glassDome = new THREE.Mesh(clocheDomeGeo, glassMat);
  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 12), glassMat);
  knob.position.y = 0.74;

  clocheGroup.add(glassCylinder);
  clocheGroup.add(glassDome);
  clocheGroup.add(knob);
  roseGroup.add(clocheGroup);

  // Rose glow light
  roseLight = new THREE.PointLight(0xff3366, 1.3, 3.5);
  roseLight.position.set(0, 0.65, 0);
  roseGroup.add(roseLight);

  roseGroup.name = "Rose";
  clickableObjects.push(roseGroup);
}

function createStardustAndShootingStars() {
  const dustCount = 120;
  const dustGeo = new THREE.BufferGeometry();
  const dustPos = new Float32Array(dustCount * 3);

  for (let i = 0; i < dustCount; i++) {
    const rad = 4.8 + Math.random() * 4.2;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;

    dustPos[i * 3] = rad * Math.sin(phi) * Math.cos(theta);
    dustPos[i * 3 + 1] = rad * Math.sin(phi) * Math.sin(theta);
    dustPos[i * 3 + 2] = rad * Math.cos(phi);
  }

  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
  const dustTex = createGlowTexture('rgba(255, 230, 150, 0.95)', 'rgba(255, 180, 50, 0.2)');
  const dustMat = new THREE.PointsMaterial({
    size: 0.45,
    map: dustTex,
    transparent: true,
    opacity: 0.75,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  floatingDust = new THREE.Points(dustGeo, dustMat);
  worldGroup.add(floatingDust);

  // Shooting Stars
  for (let s = 0; s < 3; s++) {
    const shootGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(-6, -3, -6)
    ]);
    const shootMat = new THREE.LineBasicMaterial({
      color: 0xfff6d6,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending
    });
    const shootLine = new THREE.Line(shootGeo, shootMat);
    shootLine.userData = {
      active: false,
      speed: 1.8,
      progress: 0
    };
    cosmosGroup.add(shootLine);
    shootingStars.push(shootLine);
  }
}

/* ==========================================================================
   DYNAMIC DUSK / SUNSET CONTROLLER & SKY GENERATOR
   ========================================================================== */

function updateSunsetCycle(val) {
  sunsetVal = val;
  const angle = (val * 1.5 - 0.3) * Math.PI;
  const sunDistance = 75;

  const sunX = Math.cos(angle) * sunDistance * 0.8 - 15;
  const sunY = (1.0 - val) * 65 - 18;
  const sunZ = -Math.sin(angle) * sunDistance * 0.5 - 35;

  sunMesh.position.set(sunX, sunY, sunZ);
  sunLight.position.set(sunX, sunY, sunZ);
  sunLight.target.position.set(0, 2, 0);
  sunLight.target.updateMatrixWorld();

  const skyCtx = skyMaterial.userData.ctx;
  const grad = skyCtx.createLinearGradient(0, 256, 0, 0);

  let botColor, midColor, topColor;
  let labelText = "";

  if (val < 0.4) {
    const t = val / 0.4;
    botColor = `rgb(${255}, ${230 - Math.round(t * 40)}, ${180 - Math.round(t * 70)})`;
    midColor = `rgb(${160 - Math.round(t * 40)}, ${195 - Math.round(t * 65)}, ${240 - Math.round(t * 70)})`;
    topColor = `rgb(${45 - Math.round(t * 20)}, ${70 - Math.round(t * 30)}, ${135 - Math.round(t * 40)})`;
    sunLight.color.setHex(0xfffaed);
    sunLight.intensity = 2.4 - t * 0.4;
    ambientLight.color.setHex(0x6a82aa);
    sunGlowSprite.material.opacity = 0.75;
    labelText = "15:30 • Nắng chiều vàng B-612";
  } else if (val <= 0.78) {
    const t = (val - 0.4) / 0.38;
    botColor = `rgb(${255 - Math.round(t * 35)}, ${145 - Math.round(t * 65)}, ${70 + Math.round(t * 40)})`;
    midColor = `rgb(${185 - Math.round(t * 75)}, ${85 - Math.round(t * 35)}, ${140 + Math.round(t * 20)})`;
    topColor = `rgb(${25 - Math.round(t * 15)}, ${25 - Math.round(t * 15)}, ${80 - Math.round(t * 35)})`;

    sunLight.color.setHex(0xff8d4d);
    sunLight.intensity = 2.0 - t * 1.1;
    ambientLight.color.setHex(0x734882);
    sunGlowSprite.material.opacity = 0.95;
    labelText = t > 0.6 ? "18:44 • Hoàng hôn thứ 44 kinh điển" : "17:50 • Ráng chiều rực rỡ";
  } else {
    const t = (val - 0.78) / 0.22;
    botColor = `rgb(${40 - Math.round(t * 30)}, ${30 - Math.round(t * 20)}, ${75 - Math.round(t * 45)})`;
    midColor = `rgb(${18 - Math.round(t * 10)}, ${15 - Math.round(t * 10)}, ${45 - Math.round(t * 25)})`;
    topColor = `rgb(${6 - Math.round(t * 3)}, ${6 - Math.round(t * 3)}, ${16 - Math.round(t * 8)})`;

    sunLight.color.setHex(0x3d4b7a);
    sunLight.intensity = 0.35 * (1.0 - t);
    ambientLight.color.setHex(0x353a5c);
    sunGlowSprite.material.opacity = 0.2 * (1.0 - t);
    labelText = "21:44 • Đêm sao B-612 huyền ảo";
  }

  grad.addColorStop(0, botColor);
  grad.addColorStop(0.45, midColor);
  grad.addColorStop(1, topColor);

  skyCtx.fillStyle = grad;
  skyCtx.fillRect(0, 0, 16, 256);
  skyMaterial.userData.tex.needsUpdate = true;

  if (starParticles) {
    starParticles.material.opacity = 0.3 + val * 0.7;
  }

  const labelEl = document.getElementById('sunset-time-label');
  if (labelEl) labelEl.textContent = labelText;

  const sliderEl = document.getElementById('slider-sunset');
  if (sliderEl && Math.abs(parseFloat(sliderEl.value) - val * 100) > 0.5) {
    sliderEl.value = Math.round(val * 100);
  }
}

/* ==========================================================================
   CAMERA PRESETS & SMOOTH TRANSITION LERP
   ========================================================================== */

const cameraPresets = {
  sunset: {
    pos: new THREE.Vector3(4.2, 3.6, 7.8),
    target: new THREE.Vector3(0, 1.8, 0)
  },
  characters: {
    pos: new THREE.Vector3(1.2, 4.4, 2.6),
    target: new THREE.Vector3(0.1, 4.0, 0.4)
  },
  rose: {
    pos: new THREE.Vector3(3.2, 4.3, 0.4),
    target: new THREE.Vector3(1.9, 3.8, -0.8)
  },
  space: {
    pos: new THREE.Vector3(9.5, 9.0, 14.5),
    target: new THREE.Vector3(0, 1.0, 0)
  }
};

function setCameraPreset(presetKey) {
  if (!cameraPresets[presetKey]) return;
  targetCameraPos.copy(cameraPresets[presetKey].pos);
  targetLookAt.copy(cameraPresets[presetKey].target);
  isTransitioningCamera = true;
}

/* ==========================================================================
   WEB AUDIO API SYNTHESIZER ("GIAI ĐIỆU B-612")
   ========================================================================== */

let audioCtx = null;
let isPlayingAudio = false;
let melodyTimer = null;

function initWebAudio() {
  if (audioCtx) return;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  audioCtx = new AudioContextClass();
}

const bellFrequencies = [220.0, 277.18, 329.63, 440.0, 554.37, 659.25, 880.0, 1108.73];

function playCelestialNote(freq, delay = 0, duration = 2.4) {
  if (!audioCtx || audioCtx.state !== 'running') return;

  setTimeout(() => {
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      const filter = audioCtx.createBiquadFilter();

      osc.type = Math.random() > 0.4 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, audioCtx.currentTime);

      const now = audioCtx.currentTime;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.09, now + 0.06);
      gain.gain.exponentialRampToValueAtTime(0.00001, now + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(now);
      osc.stop(now + duration);
    } catch (e) {
      console.error(e);
    }
  }, delay);
}

function scheduleFairytaleMelody() {
  if (!isPlayingAudio) return;

  const noteCount = 2 + Math.floor(Math.random() * 3);
  for (let i = 0; i < noteCount; i++) {
    const note = bellFrequencies[Math.floor(Math.random() * bellFrequencies.length)];
    playCelestialNote(note, i * 420, 3.2);
  }

  const nextTime = 3200 + Math.random() * 2500;
  melodyTimer = setTimeout(scheduleFairytaleMelody, nextTime);
}

function toggleAudio() {
  initWebAudio();
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  isPlayingAudio = !isPlayingAudio;

  const soundOn = document.getElementById('icon-sound-on');
  const soundOff = document.getElementById('icon-sound-off');
  const soundLabel = document.getElementById('audio-status');

  if (isPlayingAudio) {
    if (soundOn) soundOn.classList.remove('hidden');
    if (soundOff) soundOff.classList.add('hidden');
    if (soundLabel) soundLabel.textContent = "Đang Ngân Nga...";
    scheduleFairytaleMelody();
  } else {
    if (soundOn) soundOn.classList.add('hidden');
    if (soundOff) soundOff.classList.remove('hidden');
    if (soundLabel) soundLabel.textContent = "Giai Điệu B-612";
    if (melodyTimer) clearTimeout(melodyTimer);
  }
}

/* ==========================================================================
   INTERACTIVE TOAST HINT & RAYCAST CLICK INTERACTION
   ========================================================================== */

let toastTimeout = null;

function showToast(message, icon = "✨") {
  const toast = document.getElementById('toast-hint');
  const toastMsg = document.getElementById('toast-message');
  const toastIcon = document.getElementById('toast-icon');

  if (!toast || !toastMsg) return;

  toastMsg.textContent = message;
  if (toastIcon) toastIcon.textContent = icon;

  toast.classList.remove('opacity-0', '-translate-y-4');
  toast.classList.add('opacity-100', 'translate-y-0');

  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove('opacity-100', 'translate-y-0');
    toast.classList.add('opacity-0', '-translate-y-4');
  }, 4200);
}

function onPointerDown(event) {
  // Prevent raycast trigger if clicking inside UI elements
  if (event.target.closest('#ui-container') || event.target.closest('#btn-show-ui')) return;

  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(clickableObjects, true);

  if (intersects.length > 0) {
    let clickedObj = intersects[0].object;
    while (clickedObj.parent && !clickedObj.name && clickedObj.parent !== scene) {
      clickedObj = clickedObj.parent;
    }

    const objName = clickedObj.name || (clickedObj.parent ? clickedObj.parent.name : "");

    if (objName.includes("Rose") || clickedObj === roseGroup) {
      showToast("Bông hồng B-612: 'Ta là duy nhất trên thế giới đối với cậu...'", "🌹");
      if (roseLight) {
        roseLight.intensity = 3.5;
        setTimeout(() => roseLight.intensity = 1.3, 1000);
      }
      playCelestialNote(880.0, 0, 2.0);
    } else if (objName.includes("Fox") || clickedObj === foxGroup) {
      showToast("Chú cáo mỉm cười: 'Nếu bạn thuần hóa tôi, chúng ta sẽ cần đến nhau...'", "🦊");
      playCelestialNote(659.25, 0, 2.0);
    } else if (objName.includes("LittlePrince") || clickedObj === princeGroup) {
      showToast("Hoàng Tử Bé: 'Ngắm hoàng hôn giúp xoa dịu những nỗi buồn thương...'", "👑");
      playCelestialNote(554.37, 0, 2.0);
    } else if (objName.includes("Sun") || clickedObj === sunMesh) {
      showToast("Mặt trời B-612: Nhấn nút Tự Động để đắm chìm trong 44 lần hoàng hôn liên tiếp!", "🌅");
      playCelestialNote(440.0, 0, 2.0);
    }
  }
}

/* ==========================================================================
   UI EVENT HANDLERS & HUD CONTROL
   ========================================================================== */

function setupUIInteractions() {
  // 1. Sunset Slider
  const slider = document.getElementById('slider-sunset');
  if (slider) {
    slider.addEventListener('input', (e) => {
      isAutoSunset = false;
      const playIcon = document.getElementById('icon-play');
      const pauseIcon = document.getElementById('icon-pause');
      if (playIcon) playIcon.classList.remove('hidden');
      if (pauseIcon) pauseIcon.classList.add('hidden');
      const val = parseFloat(e.target.value) / 100;
      updateSunsetCycle(val);
    });
  }

  // 2. Auto Sunset Loop Toggle
  const btnAuto = document.getElementById('btn-auto-sunset');
  if (btnAuto) {
    btnAuto.addEventListener('click', () => {
      isAutoSunset = !isAutoSunset;
      const playIcon = document.getElementById('icon-play');
      const pauseIcon = document.getElementById('icon-pause');
      const autoStatus = document.getElementById('auto-sunset-status');

      if (isAutoSunset) {
        if (playIcon) playIcon.classList.add('hidden');
        if (pauseIcon) pauseIcon.classList.remove('hidden');
        if (autoStatus) autoStatus.textContent = "Đang Tự Động";
        showToast("Đang tự động xoay chu kỳ 44 lần hoàng hôn...");
      } else {
        if (playIcon) playIcon.classList.remove('hidden');
        if (pauseIcon) pauseIcon.classList.add('hidden');
        if (autoStatus) autoStatus.textContent = "Tự Động Quay";
      }
    });
  }

  // 3. Camera Presets
  const camBtns = document.querySelectorAll('.cam-btn');
  camBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      camBtns.forEach(b => b.classList.remove('active', 'border-amber-300', 'bg-amber-400/20'));
      btn.classList.add('active', 'border-amber-300', 'bg-amber-400/20');
      const preset = btn.getAttribute('data-preset');
      setCameraPreset(preset);
    });
  });

  // 4. Quote Carousel
  const quoteText = document.getElementById('quote-text');
  const quoteChapter = document.getElementById('quote-chapter');
  const quoteCounter = document.getElementById('quote-counter');

  function displayQuote(index) {
    if (!quoteText) return;
    quoteText.style.opacity = '0';
    setTimeout(() => {
      quoteText.textContent = `"${quotes[index].text}"`;
      if (quoteChapter) quoteChapter.textContent = quotes[index].sub;
      if (quoteCounter) quoteCounter.textContent = `${index + 1} / ${quotes.length}`;
      quoteText.style.opacity = '1';
    }, 300);
  }

  const nextBtn = document.getElementById('btn-next-quote');
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      currentQuoteIndex = (currentQuoteIndex + 1) % quotes.length;
      displayQuote(currentQuoteIndex);
    });
  }

  const prevBtn = document.getElementById('btn-prev-quote');
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      currentQuoteIndex = (currentQuoteIndex - 1 + quotes.length) % quotes.length;
      displayQuote(currentQuoteIndex);
    });
  }

  // 5. Audio Toggle
  const btnAudio = document.getElementById('btn-audio');
  if (btnAudio) btnAudio.addEventListener('click', toggleAudio);

  // 6. Photo Mode / Hide UI Toggle
  const uiContainer = document.getElementById('ui-container');
  const btnToggleUI = document.getElementById('btn-toggle-ui');
  const btnShowUI = document.getElementById('btn-show-ui');

  if (btnToggleUI && uiContainer && btnShowUI) {
    btnToggleUI.addEventListener('click', () => {
      uiContainer.classList.add('opacity-0', 'pointer-events-none');
      btnShowUI.classList.remove('hidden');
      setTimeout(() => {
        btnShowUI.classList.remove('opacity-0');
      }, 50);
      showToast("Chế độ ngắm cảnh toàn màn hình (Photo Mode). Nhấn nút mắt ở góc trên để hiện UI.", "📸");
    });

    btnShowUI.addEventListener('click', () => {
      btnShowUI.classList.add('opacity-0');
      setTimeout(() => {
        btnShowUI.classList.add('hidden');
        uiContainer.classList.remove('opacity-0', 'pointer-events-none');
      }, 300);
    });
  }
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

/* ==========================================================================
   MAIN ANIMATION & RENDERING LOOP
   ========================================================================== */

function animate() {
  requestAnimationFrame(animate);

  const elapsedTime = clock.getElapsedTime();

  // 1. Auto Sunset Cycle Animation
  if (isAutoSunset) {
    sunsetVal += 0.001 * autoSunsetDirection;
    if (sunsetVal >= 0.98) {
      autoSunsetDirection = -1;
    } else if (sunsetVal <= 0.05) {
      autoSunsetDirection = 1;
    }
    updateSunsetCycle(sunsetVal);
  }

  // 2. Camera Smooth Transition Lerp
  if (isTransitioningCamera) {
    camera.position.lerp(targetCameraPos, 0.05);
    controls.target.lerp(targetLookAt, 0.05);
    controls.update();

    if (camera.position.distanceTo(targetCameraPos) < 0.05) {
      isTransitioningCamera = false;
    }
  } else {
    controls.update();
  }

  // 3. Waving Little Prince Scarf Animation
  princeScarfParts.forEach((part, index) => {
    const wave = Math.sin(elapsedTime * 3.2 + index * 0.45) * 0.14;
    const waveY = Math.cos(elapsedTime * 2.1 + index * 0.35) * 0.08;
    part.rotation.y = wave;
    part.rotation.z = waveY;
  });

  // 4. Swaying Fox Tail Animation
  foxTailParts.forEach((part, index) => {
    const tailSway = Math.sin(elapsedTime * 2.8 + index * 0.4) * 0.16;
    part.rotation.y = tailSway;
  });

  // 5. Gentle Floating Stardust Rotation
  if (floatingDust) {
    floatingDust.rotation.y = elapsedTime * 0.02;
    floatingDust.rotation.x = Math.sin(elapsedTime * 0.015) * 0.05;
  }

  // 6. Shooting Stars Animation
  shootingStars.forEach(star => {
    if (!star.userData.active && Math.random() < 0.008) {
      star.userData.active = true;
      star.userData.progress = 0;
      const rx = (Math.random() - 0.5) * 90;
      const ry = 30 + Math.random() * 40;
      const rz = (Math.random() - 0.5) * 90;
      star.position.set(rx, ry, rz);
    }

    if (star.userData.active) {
      star.userData.progress += 0.025;
      star.position.x -= star.userData.speed;
      star.position.y -= star.userData.speed * 0.5;
      star.position.z -= star.userData.speed * 0.7;

      const alpha = Math.sin(star.userData.progress * Math.PI);
      star.material.opacity = Math.max(0, alpha);

      if (star.userData.progress >= 1.0) {
        star.userData.active = false;
        star.material.opacity = 0;
      }
    }
  });

  // Render Scene
  renderer.render(scene, camera);
}

// Boot application when DOM is ready
window.addEventListener('DOMContentLoaded', initThree);
