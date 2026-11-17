
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/controls/OrbitControls.js";

(() => {
  "use strict";

  // =========================================
  // ECOFILAMENT — INTERACTIVE 3D SCENE
  // Three.js 0.180.0
  // =========================================

  const container = document.getElementById("plastic-scene");

  if (!container) {
    console.warn("EcoFilament: #plastic-scene not found.");
    return;
  }

  // Prevent duplicate initialization
  if (container.dataset.sceneInitialized === "true") {
    return;
  }

  container.dataset.sceneInitialized = "true";

  // =========================================
  // CONFIGURATION
  // =========================================

  const CONFIG = {
    background: 0x081321,

    cyan: 0x20d9ff,
    violet: 0x9667ff,
    green: 0x48e7c1,

    maxPixelRatio: 1.5,

    reducedMotion: window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches,

    particleCount: 70,
    flakeCount: 32,

    cameraPosition: {
      x: 8.5,
      y: 6.2,
      z: 12
    }
  };

  let renderer = null;
  let controls = null;

  let animationFrame = null;

  let isVisible = true;
  let isPageVisible = !document.hidden;

  let disposed = false;
  let contextLost = false;

  let lastPixelRatio = 0;

  const clock = new THREE.Clock();

  // =========================================
  // SCENE
  // =========================================

  const scene = new THREE.Scene();

  scene.background = new THREE.Color(CONFIG.background);

  scene.fog = new THREE.Fog(
    CONFIG.background,
    15,
    30
  );

  // =========================================
  // CAMERA
  // =========================================

  const camera = new THREE.PerspectiveCamera(
    40,
    1,
    0.1,
    100
  );

  camera.position.set(
    CONFIG.cameraPosition.x,
    CONFIG.cameraPosition.y,
    CONFIG.cameraPosition.z
  );

  camera.lookAt(0, 0.9, 0);

  // =========================================
  // RENDERER
  // =========================================

  try {
    renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: "high-performance"
    });
  } catch (error) {
    console.error(
      "EcoFilament: WebGL initialization failed.",
      error
    );

    container.dataset.sceneInitialized = "false";

    container.replaceChildren();

    const message = document.createElement("p");

    message.textContent =
      "3D scene is not available in this browser.";

    container.appendChild(message);

    return;
  }

  renderer.setPixelRatio(
    Math.min(
      window.devicePixelRatio || 1,
      CONFIG.maxPixelRatio
    )
  );

  renderer.outputColorSpace = THREE.SRGBColorSpace;

  renderer.toneMapping = THREE.ACESFilmicToneMapping;

  renderer.toneMappingExposure = 1.2;

  renderer.domElement.setAttribute(
    "aria-label",
    "Interactive 3D visualization of plastic recycling"
  );

  renderer.domElement.style.display = "block";
  renderer.domElement.style.width = "100%";
  renderer.domElement.style.height = "100%";

  renderer.domElement.style.touchAction = "pan-y";

  container.replaceChildren(renderer.domElement);

  // =========================================
  // CONTROLS
  // =========================================

  controls = new OrbitControls(
    camera,
    renderer.domElement
  );

  controls.enableDamping = !CONFIG.reducedMotion;

  controls.dampingFactor = 0.055;

  controls.enablePan = false;

  controls.minDistance = 7;
  controls.maxDistance = 19;

  controls.minPolarAngle = 0.35;
  controls.maxPolarAngle = Math.PI / 2.05;

  controls.target.set(0, 0.85, 0);

  controls.update();

  // =========================================
  // LIGHTING
  // =========================================

  const hemisphereLight = new THREE.HemisphereLight(
    0xc7edff,
    0x142033,
    2.1
  );

  scene.add(hemisphereLight);

  const mainLight = new THREE.DirectionalLight(
    0xffffff,
    2.7
  );

  mainLight.position.set(5, 9, 7);

  scene.add(mainLight);

  const cyanLight = new THREE.PointLight(
    CONFIG.cyan,
    28,
    20
  );

  cyanLight.position.set(-5, 3, 4);

  scene.add(cyanLight);

  const violetLight = new THREE.PointLight(
    CONFIG.violet,
    22,
    18
  );

  violetLight.position.set(4, 3, -5);

  scene.add(violetLight);

  const frontLight = new THREE.PointLight(
    0xffffff,
    8,
    15
  );

  frontLight.position.set(0, 5, 9);

  scene.add(frontLight);

  // =========================================
  // GROUND AND GRID
  // =========================================

  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(11, 96),

    new THREE.MeshStandardMaterial({
      color: 0x0b1a2b,
      roughness: 0.85,
      metalness: 0.12
    })
  );

  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.09;

  scene.add(ground);

  const grid = new THREE.GridHelper(
    22,
    44,
    0x1b6880,
    0x163149
  );

  grid.position.y = -0.075;

  grid.material.transparent = true;
  grid.material.opacity = 0.24;

  scene.add(grid);

  // =========================================
  // MATERIALS
  // =========================================

  const bottleMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x83e4ed,

    roughness: 0.13,
    metalness: 0.02,

    transmission: 0.3,
    transparent: true,
    opacity: 0.88,

    thickness: 0.7,

    clearcoat: 1,
    clearcoatRoughness: 0.08
  });

  const capMaterial = new THREE.MeshStandardMaterial({
    color: 0x24c9df,
    roughness: 0.28,
    metalness: 0.2
  });

  const flakeMaterial = new THREE.MeshStandardMaterial({
    color: 0x43d6c4,
    roughness: 0.32,
    metalness: 0.15
  });

  const spoolMaterial = new THREE.MeshStandardMaterial({
    color: 0x8b70ff,
    roughness: 0.3,
    metalness: 0.45
  });

  const filamentMaterial = new THREE.MeshStandardMaterial({
    color: CONFIG.green,

    roughness: 0.27,
    metalness: 0.2,

    emissive: 0x063b34,
    emissiveIntensity: 0.65
  });

  // =========================================
  // 01 — PLASTIC BOTTLE
  // =========================================

  const bottleGroup = new THREE.Group();

  const bottleProfile = [
    new THREE.Vector2(0, 0),
    new THREE.Vector2(0.43, 0),
    new THREE.Vector2(0.53, 0.08),
    new THREE.Vector2(0.57, 0.2),
    new THREE.Vector2(0.59, 0.42),
    new THREE.Vector2(0.59, 1.8),
    new THREE.Vector2(0.56, 2.0),
    new THREE.Vector2(0.48, 2.13),
    new THREE.Vector2(0.31, 2.27),
    new THREE.Vector2(0.22, 2.4),
    new THREE.Vector2(0.2, 2.55),
    new THREE.Vector2(0.2, 2.78),
    new THREE.Vector2(0, 2.78)
  ];

  const bottleGeometry = new THREE.LatheGeometry(
    bottleProfile,
    64
  );

  const bottle = new THREE.Mesh(
    bottleGeometry,
    bottleMaterial
  );

  bottle.position.y = 0.05;

  bottleGroup.add(bottle);

  // Neck ring
  const neckRing = new THREE.Mesh(
    new THREE.TorusGeometry(
      0.205,
      0.035,
      12,
      48
    ),
    capMaterial
  );

  neckRing.rotation.x = Math.PI / 2;
  neckRing.position.y = 2.55;

  bottleGroup.add(neckRing);

  // Bottle cap
  const cap = new THREE.Mesh(
    new THREE.CylinderGeometry(
      0.24,
      0.24,
      0.25,
      40
    ),
    capMaterial
  );

  cap.position.y = 2.85;

  bottleGroup.add(cap);

  // Cap details
  const grooveMaterial = new THREE.MeshStandardMaterial({
    color: 0x078da8
  });

  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;

    const groove = new THREE.Mesh(
      new THREE.BoxGeometry(
        0.018,
        0.17,
        0.018
      ),
      grooveMaterial
    );

    groove.position.set(
      Math.cos(angle) * 0.24,
      2.85,
      Math.sin(angle) * 0.24
    );

    bottleGroup.add(groove);
  }

  bottleGroup.position.set(-5, 0, 0);

  scene.add(bottleGroup);

  // =========================================
  // 02 — RECYCLED PLASTIC FLAKES
  // =========================================

  const flakesGroup = new THREE.Group();

  const flakeGeometry = new THREE.BoxGeometry(
    0.22,
    0.045,
    0.18
  );

  const flakes = new THREE.InstancedMesh(
    flakeGeometry,
    flakeMaterial,
    CONFIG.flakeCount
  );

  const dummy = new THREE.Object3D();

  for (let i = 0; i < CONFIG.flakeCount; i++) {
    dummy.position.set(
      (Math.random() - 0.5) * 1.8,
      0.45 + Math.random() * 1.7,
      (Math.random() - 0.5) * 1.5
    );

    dummy.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    );

    const scale = 0.65 + Math.random() * 0.8;

    dummy.scale.setScalar(scale);

    dummy.updateMatrix();

    flakes.setMatrixAt(i, dummy.matrix);
  }

  flakes.instanceMatrix.needsUpdate = true;

  flakesGroup.add(flakes);

  scene.add(flakesGroup);

  // =========================================
  // 03 — FILAMENT SPOOL
  // =========================================

  const spoolGroup = new THREE.Group();

  const spoolCore = new THREE.Mesh(
    new THREE.CylinderGeometry(
      0.48,
      0.48,
      1.05,
      64
    ),

    new THREE.MeshStandardMaterial({
      color: 0x273b57,
      metalness: 0.6,
      roughness: 0.3
    })
  );

  spoolCore.rotation.x = Math.PI / 2;

  spoolGroup.add(spoolCore);

  // Flanges
  const flangeGeometry = new THREE.CylinderGeometry(
    1,
    1,
    0.14,
    80
  );

  const flangeA = new THREE.Mesh(
    flangeGeometry,
    spoolMaterial
  );

  flangeA.rotation.x = Math.PI / 2;
  flangeA.position.z = -0.59;

  spoolGroup.add(flangeA);

  const flangeB = flangeA.clone();

  flangeB.position.z = 0.59;

  spoolGroup.add(flangeB);

  // Decorative rings
  const innerRingGeometry = new THREE.TorusGeometry(
    0.67,
    0.018,
    10,
    64
  );

  const innerRingMaterial = new THREE.MeshStandardMaterial({
    color: 0xc4b8ff,
    metalness: 0.6,
    roughness: 0.25
  });

  const innerRingA = new THREE.Mesh(
    innerRingGeometry,
    innerRingMaterial
  );

  innerRingA.position.z = -0.67;

  spoolGroup.add(innerRingA);

  const innerRingB = innerRingA.clone();

  innerRingB.position.z = 0.67;

  spoolGroup.add(innerRingB);

  // Filament coils
  const coilCount = 12;

  for (let i = 0; i < coilCount; i++) {
    const radius = 0.53 + i * 0.029;

    const points = [];

    for (let j = 0; j <= 180; j++) {
      const t = j / 180;

      const angle = t * Math.PI * 10;

      points.push(
        new THREE.Vector3(
          radius * Math.cos(angle),
          radius * Math.sin(angle),
          -0.49 + t * 0.98
        )
      );
    }

    const curve = new THREE.CatmullRomCurve3(points);

    const coil = new THREE.Mesh(
      new THREE.TubeGeometry(
        curve,
        180,
        0.026,
        6,
        false
      ),
      filamentMaterial
    );

    spoolGroup.add(coil);
  }

  spoolGroup.position.set(5, 1.05, 0);

  scene.add(spoolGroup);

  // =========================================
  // CONNECTING ENERGY PATH
  // =========================================

  const routePoints = [
    new THREE.Vector3(-3.8, 1, 0),
    new THREE.Vector3(-2.8, 1.8, -0.3),
    new THREE.Vector3(-1.5, 1.1, 0.4),
    new THREE.Vector3(0.8, 1.3, 0.2),
    new THREE.Vector3(2.7, 1.8, -0.2),
    new THREE.Vector3(3.9, 1.1, 0)
  ];

  const routeCurve = new THREE.CatmullRomCurve3(
    routePoints
  );

  const routeMaterial = new THREE.MeshStandardMaterial({
    color: CONFIG.cyan,

    emissive: 0x08778a,
    emissiveIntensity: 1.25,

    roughness: 0.25,
    metalness: 0.2
  });

  const route = new THREE.Mesh(
    new THREE.TubeGeometry(
      routeCurve,
      140,
      0.027,
      10,
      false
    ),
    routeMaterial
  );

  scene.add(route);

  // Route markers
  const markerGeometry = new THREE.SphereGeometry(
    0.085,
    20,
    16
  );

  const markerMaterial = new THREE.MeshBasicMaterial({
    color: 0x9cf8ff
  });

  routePoints.forEach(point => {
    const marker = new THREE.Mesh(
      markerGeometry,
      markerMaterial
    );

    marker.position.copy(point);

    scene.add(marker);
  });

  // =========================================
  // FLOATING PARTICLES
  // =========================================

  const particleGeometry = new THREE.SphereGeometry(
    0.025,
    8,
    8
  );

  const particleMaterial = new THREE.MeshBasicMaterial({
    color: 0x65dff2
  });

  const particles = new THREE.InstancedMesh(
    particleGeometry,
    particleMaterial,
    CONFIG.particleCount
  );

  for (let i = 0; i < CONFIG.particleCount; i++) {
    dummy.position.set(
      (Math.random() - 0.5) * 14,
      Math.random() * 4.8,
      (Math.random() - 0.5) * 8
    );

    const scale = 0.5 + Math.random() * 1.2;

    dummy.scale.setScalar(scale);

    dummy.updateMatrix();

    particles.setMatrixAt(i, dummy.matrix);
  }

  particles.instanceMatrix.needsUpdate = true;

  scene.add(particles);

  // =========================================
  // ANIMATION
  // =========================================

  function renderScene() {
    if (disposed || contextLost) return;

    renderer.render(scene, camera);
  }

  function updateAnimation(time) {
    if (CONFIG.reducedMotion) return;

    bottleGroup.rotation.y =
      Math.sin(time * 0.42) * 0.1;

    flakesGroup.rotation.y = time * 0.15;

    spoolGroup.rotation.z =
      Math.sin(time * 0.32) * 0.065;

    particles.rotation.y = time * 0.015;
  }

  function renderFrame() {
    if (disposed || contextLost) return;

    const time = clock.getElapsedTime();

    updateAnimation(time);

    controls.update();

    renderScene();
  }

  // =========================================
  // ANIMATION LOOP
  // =========================================

  function stopRendering() {
    if (animationFrame !== null) {
      cancelAnimationFrame(animationFrame);
      animationFrame = null;
    }
  }

  function animate() {
    if (
      disposed ||
      contextLost ||
      !isVisible ||
      !isPageVisible ||
      CONFIG.reducedMotion
    ) {
      stopRendering();
      return;
    }

    renderFrame();

    animationFrame = requestAnimationFrame(animate);
  }

  function startRendering() {
    if (
      disposed ||
      contextLost ||
      !isVisible ||
      !isPageVisible
    ) {
      return;
    }

    if (CONFIG.reducedMotion) {
      renderScene();
      return;
    }

    if (animationFrame !== null) return;

    renderFrame();

    animationFrame = requestAnimationFrame(animate);
  }

  // =========================================
  // REDUCED MOTION
  // =========================================

  const motionQuery = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  function handleMotionChange(event) {
    CONFIG.reducedMotion = event.matches;

    controls.enableDamping = !CONFIG.reducedMotion;

    stopRendering();

    if (CONFIG.reducedMotion) {
      renderScene();
    } else {
      startRendering();
    }
  }

  if (motionQuery.addEventListener) {
    motionQuery.addEventListener(
      "change",
      handleMotionChange
    );
  } else {
    motionQuery.addListener(handleMotionChange);
  }

  // Render after user interaction in reduced-motion mode
  controls.addEventListener("change", () => {
    if (CONFIG.reducedMotion) {
      renderScene();
    }
  });

  // =========================================
  // PAGE VISIBILITY
  // =========================================

  function handleVisibilityChange() {
    isPageVisible = !document.hidden;

    if (isPageVisible) {
      startRendering();
    } else {
      stopRendering();
    }
  }

  document.addEventListener(
    "visibilitychange",
    handleVisibilityChange
  );

  // =========================================
  // INTERSECTION OBSERVER
  // =========================================

  const intersectionObserver = new IntersectionObserver(
    entries => {
      const entry = entries[0];

      if (!entry) return;

      isVisible = entry.isIntersecting;

      if (isVisible) {
        startRendering();
      } else {
        stopRendering();
      }
    },
    {
      threshold: 0.01
    }
  );

  intersectionObserver.observe(container);

  // =========================================
  // RESPONSIVE RESIZING
  // =========================================

  function resizeScene() {
    if (disposed || contextLost) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    if (!width || !height) return;

    camera.aspect = width / height;

    camera.updateProjectionMatrix();

    renderer.setSize(
      width,
      height,
      false
    );

    const pixelRatio = Math.min(
      window.devicePixelRatio || 1,
      CONFIG.maxPixelRatio
    );

    if (pixelRatio !== lastPixelRatio) {
      renderer.setPixelRatio(pixelRatio);
      lastPixelRatio = pixelRatio;
    }

    if (!isVisible || !isPageVisible || CONFIG.reducedMotion) {
      renderScene();
    }
  }

  const resizeObserver = new ResizeObserver(() => {
    resizeScene();
  });

  resizeObserver.observe(container);

  window.addEventListener(
    "resize",
    resizeScene,
    { passive: true }
  );

  // =========================================
  // WEBGL CONTEXT MANAGEMENT
  // =========================================

  function handleContextLost(event) {
    event.preventDefault();

    contextLost = true;

    stopRendering();

    console.warn(
      "EcoFilament: WebGL context lost."
    );
  }

  function handleContextRestored() {
    contextLost = false;

    console.info(
      "EcoFilament: WebGL context restored."
    );

    resizeScene();

    startRendering();
  }

  renderer.domElement.addEventListener(
    "webglcontextlost",
    handleContextLost,
    false
  );

  renderer.domElement.addEventListener(
    "webglcontextrestored",
    handleContextRestored,
    false
  );

  // =========================================
  // CLEANUP
  // =========================================

  function cleanup() {
    if (disposed) return;

    disposed = true;

    stopRendering();

    intersectionObserver.disconnect();
    resizeObserver.disconnect();

    document.removeEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    window.removeEventListener(
      "resize",
      resizeScene
    );

    if (motionQuery.removeEventListener) {
      motionQuery.removeEventListener(
        "change",
        handleMotionChange
      );
    } else {
      motionQuery.removeListener(handleMotionChange);
    }

    renderer.domElement.removeEventListener(
      "webglcontextlost",
      handleContextLost
    );

    renderer.domElement.removeEventListener(
      "webglcontextrestored",
      handleContextRestored
    );

    controls.removeEventListener(
      "change",
      renderScene
    );

    controls.dispose();

    // Dispose scene geometries and materials
    scene.traverse(object => {
      if (object.geometry) {
        object.geometry.dispose();
      }

      if (object.material) {
        const materials = Array.isArray(object.material)
          ? object.material
          : [object.material];

        materials.forEach(material => {
          material.dispose();
        });
      }
    });

    renderer.dispose();

    renderer.domElement.remove();

    delete container.dataset.sceneInitialized;

    console.info(
      "EcoFilament: 3D scene cleaned up."
    );
  }

  // Observe removal of the scene container
  const removalObserver = new MutationObserver(() => {
    if (!container.isConnected) {
      removalObserver.disconnect();
      cleanup();
    }
  });

  removalObserver.observe(
    document.documentElement,
    {
      childList: true,
      subtree: true
    }
  );

  // =========================================
  // INITIALIZATION
  // =========================================

  resizeScene();

  startRendering();

  console.info(
    "EcoFilament 3D scene initialized successfully."
  );

})();
