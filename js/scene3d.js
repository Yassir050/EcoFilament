
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/controls/OrbitControls.js";

const container = document.getElementById("plastic-scene");

if (!container) {
  console.warn("EcoFilament: #plastic-scene not found.");
} else {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#081321");
  scene.fog = new THREE.Fog("#081321", 13, 27);

  const camera = new THREE.PerspectiveCamera(
    42,
    container.clientWidth / container.clientHeight,
    0.1,
    100
  );
  camera.position.set(8.5, 6.2, 11.5);

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: false
  });

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  container.innerHTML = "";
  container.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.minDistance = 7;
  controls.maxDistance = 21;
  controls.target.set(0, 0.7, 0);

  // LIGHTING
  scene.add(new THREE.HemisphereLight(0xb8e8ff, 0x142033, 2));

  const mainLight = new THREE.DirectionalLight(0xffffff, 2.6);
  mainLight.position.set(5, 9, 7);
  scene.add(mainLight);

  const cyanLight = new THREE.PointLight(0x20d9ff, 24, 18);
  cyanLight.position.set(-5, 3, 4);
  scene.add(cyanLight);

  const violetLight = new THREE.PointLight(0x9667ff, 18, 16);
  violetLight.position.set(4, 2, -5);
  scene.add(violetLight);

  // GROUND
  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(11, 80),
    new THREE.MeshStandardMaterial({
      color: 0x0b1a2b,
      roughness: 0.82,
      metalness: 0.12
    })
  );

  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.08;
  scene.add(ground);

  const grid = new THREE.GridHelper(20, 40, 0x1b6880, 0x163149);
  grid.position.y = -0.065;
  grid.material.transparent = true;
  grid.material.opacity = 0.28;
  scene.add(grid);

  // MATERIALS
  const bottleMat = new THREE.MeshPhysicalMaterial({
    color: 0x74dce8,
    roughness: 0.16,
    metalness: 0.05,
    transmission: 0.22,
    transparent: true,
    opacity: 0.82,
    thickness: 0.5,
    clearcoat: 0.9
  });

  const flakeMat = new THREE.MeshStandardMaterial({
    color: 0x43d6c4,
    roughness: 0.35,
    metalness: 0.16
  });

  const spoolMat = new THREE.MeshStandardMaterial({
    color: 0x8b70ff,
    roughness: 0.3,
    metalness: 0.48
  });

  const filamentMat = new THREE.MeshStandardMaterial({
    color: 0x48e7c1,
    roughness: 0.3,
    metalness: 0.22,
    emissive: 0x063b34,
    emissiveIntensity: 0.55
  });

  // 01 — PLASTIC BOTTLE
  const bottleGroup = new THREE.Group();

  const bottleBody = new THREE.Mesh(
    new THREE.CylinderGeometry(0.62, 0.62, 2.15, 40),
    bottleMat
  );
  bottleBody.position.y = 1.25;
  bottleGroup.add(bottleBody);

  const shoulder = new THREE.Mesh(
    new THREE.CylinderGeometry(0.25, 0.62, 0.45, 32),
    bottleMat
  );
  shoulder.position.y = 2.55;
  bottleGroup.add(shoulder);

  const neck = new THREE.Mesh(
    new THREE.CylinderGeometry(0.23, 0.25, 0.38, 32),
    bottleMat
  );
  neck.position.y = 2.96;
  bottleGroup.add(neck);

  const cap = new THREE.Mesh(
    new THREE.CylinderGeometry(0.27, 0.27, 0.24, 32),
    new THREE.MeshStandardMaterial({ color: 0x24c9df })
  );
  cap.position.y = 3.27;
  bottleGroup.add(cap);

  bottleGroup.position.set(-5, 0, 0);
  scene.add(bottleGroup);

  // 02 — RECYCLED FLAKES
  const flakesGroup = new THREE.Group();
  const flakeGeometry = new THREE.BoxGeometry(0.22, 0.045, 0.18);

  for (let i = 0; i < 24; i++) {
    const flake = new THREE.Mesh(flakeGeometry, flakeMat);

    flake.position.set(
      (Math.random() - 0.5) * 1.5,
      0.55 + Math.random() * 1.5,
      (Math.random() - 0.5) * 1.2
    );

    flake.rotation.set(
      Math.random() * 2,
      Math.random() * 2,
      Math.random() * 2
    );

    flakesGroup.add(flake);
  }

  scene.add(flakesGroup);

  // 03 — FILAMENT SPOOL
  const spoolGroup = new THREE.Group();

  const spoolCore = new THREE.Mesh(
    new THREE.CylinderGeometry(0.48, 0.48, 1.05, 48),
    new THREE.MeshStandardMaterial({
      color: 0x273b57,
      metalness: 0.55,
      roughness: 0.35
    })
  );

  spoolCore.rotation.x = Math.PI / 2;
  spoolGroup.add(spoolCore);

  const flangeGeometry = new THREE.CylinderGeometry(1, 1, 0.13, 64);

  const flangeA = new THREE.Mesh(flangeGeometry, spoolMat);
  flangeA.rotation.x = Math.PI / 2;
  flangeA.position.z = -0.58;
  spoolGroup.add(flangeA);

  const flangeB = flangeA.clone();
  flangeB.position.z = 0.58;
  spoolGroup.add(flangeB);

  // FILAMENT COILS
  for (let i = 0; i < 13; i++) {
    const radius = 0.53 + i * 0.028;
    const points = [];

    for (let j = 0; j <= 240; j++) {
      const t = j / 240;
      const angle = t * Math.PI * 10;

      points.push(
        new THREE.Vector3(
          radius * Math.cos(angle),
          radius * Math.sin(angle),
          -0.48 + t * 0.96
        )
      );
    }

    const curve = new THREE.CatmullRomCurve3(points);

    const coil = new THREE.Mesh(
      new THREE.TubeGeometry(curve, 240, 0.027, 6, false),
      filamentMat
    );

    spoolGroup.add(coil);
  }

  spoolGroup.position.set(5, 1.05, 0);
  scene.add(spoolGroup);

  // CONNECTING PATH
  const routePoints = [
    new THREE.Vector3(-3.8, 1, 0),
    new THREE.Vector3(-2.8, 1.8, -0.3),
    new THREE.Vector3(-1.5, 1.1, 0.4),
    new THREE.Vector3(0.8, 1.3, 0.2),
    new THREE.Vector3(2.7, 1.8, -0.2),
    new THREE.Vector3(3.9, 1.1, 0)
  ];

  const routeCurve = new THREE.CatmullRomCurve3(routePoints);

  const route = new THREE.Mesh(
    new THREE.TubeGeometry(routeCurve, 120, 0.025, 8, false),
    new THREE.MeshStandardMaterial({
      color: 0x1ccfe4,
      emissive: 0x08778a,
      emissiveIntensity: 1.1
    })
  );

  scene.add(route);

  // GLOWING MARKERS
  routePoints.forEach((point) => {
    const marker = new THREE.Mesh(
      new THREE.SphereGeometry(0.075, 16, 12),
      new THREE.MeshBasicMaterial({ color: 0x8cf7ff })
    );

    marker.position.copy(point);
    scene.add(marker);
  });

  // FLOATING PARTICLES
  const particles = new THREE.Group();

  for (let i = 0; i < 65; i++) {
    const particle = new THREE.Mesh(
      new THREE.SphereGeometry(0.025, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0x65dff2 })
    );

    particle.position.set(
      (Math.random() - 0.5) * 13,
      Math.random() * 4.5,
      (Math.random() - 0.5) * 7
    );

    particles.add(particle);
  }

  scene.add(particles);

  // ANIMATION
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);

    const time = clock.getElapsedTime();

    bottleGroup.rotation.y = Math.sin(time * 0.45) * 0.12;
    flakesGroup.rotation.y = time * 0.18;
    spoolGroup.rotation.z = Math.sin(time * 0.35) * 0.08;
    particles.rotation.y = time * 0.018;

    flakesGroup.children.forEach((flake, index) => {
      flake.rotation.x += 0.0015;
      flake.rotation.z += 0.001;
    });

    controls.update();
    renderer.render(scene, camera);
  }

  animate();

  // RESPONSIVE
  function resizeScene() {
    const width = container.clientWidth;
    const height = container.clientHeight;

    if (!width || !height) return;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  const resizeObserver = new ResizeObserver(resizeScene);
  resizeObserver.observe(container);
}
