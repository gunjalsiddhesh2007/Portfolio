import * as THREE from 'three';

// ============================================================================
// 1. Scene, Camera & Renderer Setup (Grey #808080 Background & Fog)
// ============================================================================
const canvas = document.querySelector('#bg');
const scene = new THREE.Scene();

// Authentic #808080 Grey scene background & atmospheric fog
const greyColor = 0x808080;
scene.background = new THREE.Color(greyColor);
scene.fog = new THREE.FogExp2(greyColor, 0.012);

const camera = new THREE.PerspectiveCamera(
  70,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
  alpha: false,
});

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;

camera.position.setZ(30);
camera.position.setX(-2);
camera.position.setY(0);

// ============================================================================
// 2. Texture Loader
// ============================================================================
const textureLoader = new THREE.TextureLoader();

// ============================================================================
// 3. Lighting (Silver #C0C0C0 Highlights with Delicate Crimson #ef4444 Rim Light)
// ============================================================================
// Cool silver ambient illumination
const ambientLight = new THREE.AmbientLight(0xC0C0C0, 1.15);
scene.add(ambientLight);

// Primary Silver #C0C0C0 Specular Point Light
const silverLight = new THREE.PointLight(0xC0C0C0, 3.0, 130);
silverLight.position.set(12, 10, 20);
scene.add(silverLight);

// Secondary Subtle Crimson Point Light (Edge glow - kept as is)
const crimsonLight = new THREE.PointLight(0xef4444, 1.8, 110);
crimsonLight.position.set(-16, -10, 15);
scene.add(crimsonLight);

// Directional metallic fill light
const dirLight = new THREE.DirectionalLight(0xC0C0C0, 0.9);
dirLight.position.set(0, 20, 25);
scene.add(dirLight);

// ============================================================================
// 4. 3D Elements (Silver #C0C0C0 & Crimson #ef4444 Accents)
// ============================================================================

// --- A. Torus Knot (Silver #C0C0C0 Core) ---
const torusGeo = new THREE.TorusKnotGeometry(8, 2.2, 120, 24);
const torusMat = new THREE.MeshStandardMaterial({
  color: 0xC0C0C0, // Silver #C0C0C0
  roughness: 0.22,
  metalness: 0.88,
  wireframe: false,
});
const torus = new THREE.Mesh(torusGeo, torusMat);
torus.position.set(0, 0, -5);
scene.add(torus);

// --- B. Subtle Crimson Wireframe Ring ---
const ringGeo = new THREE.TorusGeometry(14, 0.28, 16, 100);
const ringMat = new THREE.MeshBasicMaterial({
  color: 0xef4444, // Red accent kept intact
  wireframe: true,
  transparent: true,
  opacity: 0.45,
});
const ring = new THREE.Mesh(ringGeo, ringMat);
ring.position.set(0, 0, -5);
scene.add(ring);

// --- C. Starfield Particles (Silver #C0C0C0 Dust & Sparse Ruby) ---
const starGeometry = new THREE.BufferGeometry();
const starCount = 380;
const starCoords = new Float32Array(starCount * 3);
const starColors = new Float32Array(starCount * 3);

const colorPalette = [
  new THREE.Color(0xC0C0C0), // Silver #C0C0C0
  new THREE.Color(0xdadada), // Soft Silver
  new THREE.Color(0x808080), // Grey #808080
  new THREE.Color(0xf87171), // Occasional soft red star
];

for (let i = 0; i < starCount * 3; i += 3) {
  starCoords[i] = THREE.MathUtils.randFloatSpread(180);
  starCoords[i + 1] = THREE.MathUtils.randFloatSpread(180);
  starCoords[i + 2] = THREE.MathUtils.randFloatSpread(180);

  // Bias towards silver/grey (only 1 in ~8 stars is ruby red)
  const isRuby = Math.random() < 0.12;
  const pickedColor = isRuby ? colorPalette[3] : colorPalette[Math.floor(Math.random() * 3)];

  starColors[i] = pickedColor.r;
  starColors[i + 1] = pickedColor.g;
  starColors[i + 2] = pickedColor.b;
}

starGeometry.setAttribute('position', new THREE.BufferAttribute(starCoords, 3));
starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

const starMaterial = new THREE.PointsMaterial({
  size: 0.65,
  vertexColors: true,
  transparent: true,
  opacity: 0.85,
});

const starField = new THREE.Points(starGeometry, starMaterial);
scene.add(starField);

// --- D. Realistic Textured Moon ---
const moonTexture = textureLoader.load('moon.jpg');
const normalTexture = textureLoader.load('normal.jpg');

const moon = new THREE.Mesh(
  new THREE.SphereGeometry(3.6, 64, 64),
  new THREE.MeshStandardMaterial({
    map: moonTexture,
    normalMap: normalTexture,
    roughness: 0.75,
    metalness: 0.15,
  })
);

moon.position.set(-12, 2, 25);
scene.add(moon);

// --- E. Siddhesh 3D Rotating Avatar Cube (Updated with new image) ---
const siddTexture = textureLoader.load('siddhesh.jpg');
const cubeGeo = new THREE.BoxGeometry(3.6, 3.6, 3.6);

const cubeMat = new THREE.MeshStandardMaterial({
  map: siddTexture,
  roughness: 0.28,
  metalness: 0.22,
});

const avatarCube = new THREE.Mesh(cubeGeo, cubeMat);
avatarCube.position.set(4, -2, -3);
scene.add(avatarCube);

// Silver #C0C0C0 wireframe halo around avatar cube
const cubeWireGeo = new THREE.BoxGeometry(3.8, 3.8, 3.8);
const cubeWireMat = new THREE.MeshBasicMaterial({
  color: 0xC0C0C0, // Silver #C0C0C0
  wireframe: true,
  transparent: true,
  opacity: 0.45,
});
const cubeWire = new THREE.Mesh(cubeWireGeo, cubeWireMat);
avatarCube.add(cubeWire);

// ============================================================================
// 5. Scroll Interaction & Camera Choreography
// ============================================================================
let targetCameraZ = 30;
let targetCameraX = -2;
let targetCameraRotY = 0;

function moveCamera() {
  const scrollY = window.scrollY || window.pageYOffset;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const scrollFraction = maxScroll > 0 ? scrollY / maxScroll : 0;

  // Move camera through 3D space
  targetCameraZ = 30 - scrollFraction * 40;
  targetCameraX = -2 + scrollFraction * 12;
  targetCameraRotY = scrollFraction * 0.45;

  // Moon rotation on scroll
  moon.rotation.x = scrollY * 0.002;
  moon.rotation.y = scrollY * 0.004;

  // Avatar cube dynamic tumble
  avatarCube.rotation.y = scrollY * 0.005;
  avatarCube.rotation.x = scrollY * 0.003;

  // Update progress bar
  const progressBar = document.querySelector('.scroll-progress-bar');
  if (progressBar) {
    progressBar.style.width = `${scrollFraction * 100}%`;
  }

  // Back to top visibility
  const backToTopBtn = document.querySelector('.back-to-top');
  if (backToTopBtn) {
    if (scrollY > 400) {
      backToTopBtn.classList.add('visible');
    } else {
      backToTopBtn.classList.remove('visible');
    }
  }
}

window.addEventListener('scroll', moveCamera, { passive: true });
moveCamera();

// ============================================================================
// 6. Mouse Parallax Effect
// ============================================================================
let mouseX = 0;
let mouseY = 0;
let targetMouseX = 0;
let targetMouseY = 0;

window.addEventListener('mousemove', (e) => {
  const normX = (e.clientX / window.innerWidth) * 2 - 1;
  const normY = -(e.clientY / window.innerHeight) * 2 + 1;

  targetMouseX = normX * 1.5;
  targetMouseY = normY * 1.5;
});

// ============================================================================
// 7. Responsive Window Resize
// ============================================================================
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// ============================================================================
// 8. Animation Render Loop
// ============================================================================
let clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();

  // Smooth lerp for camera & mouse parallax
  mouseX += (targetMouseX - mouseX) * 0.05;
  mouseY += (targetMouseY - mouseY) * 0.05;

  camera.position.z += (targetCameraZ - camera.position.z) * 0.08;
  camera.position.x += (targetCameraX + mouseX - camera.position.x) * 0.08;
  camera.position.y += (mouseY * 0.8 - camera.position.y) * 0.08;
  camera.rotation.y += (targetCameraRotY - camera.rotation.y) * 0.08;

  // Continuous subtle rotations
  torus.rotation.x += 0.22 * delta;
  torus.rotation.y += 0.3 * delta;

  ring.rotation.x -= 0.12 * delta;
  ring.rotation.z += 0.18 * delta;

  moon.rotation.y += 0.08 * delta;

  avatarCube.rotation.y += 0.35 * delta;
  avatarCube.rotation.z += 0.18 * delta;

  starField.rotation.y += 0.02 * delta;

  renderer.render(scene, camera);
}

animate();

// ============================================================================
// 9. UI Utilities (Clipboard, Mobile Drawer, Forms, Toast)
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
  // Toast notification helper
  const toast = document.querySelector('.toast-notice');
  const showToast = (message) => {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3200);
  };

  // Copy email button
  const copyBtn = document.querySelector('#copyEmailBtn');
  if (copyBtn) {
    copyBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const email = 'gunjalsiddhesh27@gmail.com';
      navigator.clipboard.writeText(email).then(() => {
        showToast('✓ Email copied to clipboard: gunjalsiddhesh27@gmail.com');
      }).catch(() => {
        showToast('Email: gunjalsiddhesh27@gmail.com');
      });
    });
  }

  // Mobile menu toggle
  const mobileToggle = document.querySelector('.mobile-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });

    document.querySelectorAll('.nav-link').forEach((link) => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
      });
    });
  }

  // Quick message form handler
  const contactForm = document.querySelector('#contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.querySelector('#senderName')?.value || 'Friend';
      showToast(`Thanks ${name}! Your email client will open to send.`);
      const email = 'gunjalsiddhesh27@gmail.com';
      const subject = encodeURIComponent(`Portfolio Inquiry from ${name}`);
      const body = encodeURIComponent(document.querySelector('#senderMessage')?.value || '');
      setTimeout(() => {
        window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
      }, 700);
    });
  }

  // Back to top button
  const backToTopBtn = document.querySelector('.back-to-top');
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
});
