import * as THREE from
  "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

const container = document.getElementById("plastic-scene");

if (container) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#0b1725");

  const camera = new THREE.PerspectiveCamera(
    45,
    container.clientWidth / 400,
    0.1,
    100
  );

  camera.position.set(4, 3, 6);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({
    antialias: true
  });

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(container.clientWidth, 400);
  container.appendChild(renderer.domElement);

  const light = new THREE.DirectionalLight("#ffffff", 3);
  light.position.set(4, 5, 5);
  scene.add(light);

  scene.add(new THREE.AmbientLight("#54e5ff", 1.5));

  const geometry = new THREE.TorusKnotGeometry(1, 0.3, 100, 16);
  const material = new THREE.MeshStandardMaterial({
    color: "#54e5ff",
    metalness: 0.5,
    roughness: 0.25
  });

  const object = new THREE.Mesh(geometry, material);
  scene.add(object);

  function animate() {
    requestAnimationFrame(animate);

    object.rotation.x += 0.003;
    object.rotation.y += 0.006;

    renderer.render(scene, camera);
  }

  animate();

  window.addEventListener("resize", () => {
    const width = container.clientWidth;

    camera.aspect = width / 400;
    camera.updateProjectionMatrix();

    renderer.setSize(width, 400);
  });
}
