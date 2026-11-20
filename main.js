// ============================================================================
// Siddhesh Dinesh Gunjal - 3D Three.js Interactive Universe Engine
// Compatibility: Runs both offline (file://) and online (http://)
// Palette: Grey (#808080), Silver (#C0C0C0), Crimson Red (#ef4444)
// ============================================================================

(function () {
  'use strict';

  // Ensure Three.js is loaded
  if (typeof THREE === 'undefined') {
    console.warn('Three.js not loaded yet. Canvas background will rely on CSS cyber-grid.');
    return;
  }

  const canvas = document.querySelector('#bg');
  if (!canvas) return;

  // Scene setup
  const scene = new THREE.Scene();
  const greyColor = 0x222630; // Deep titanium grey for depth
  scene.background = new THREE.Color(greyColor);
  scene.fog = new THREE.FogExp2(greyColor, 0.015);

  const camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true,
  });

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;

  camera.position.setZ(30);
  camera.position.setX(-2);
  camera.position.setY(0);

  // --------------------------------------------------------------------------
  // Lighting (Silver #C0C0C0 Keylight & Subtle Crimson #ef4444 Rimlight)
  // --------------------------------------------------------------------------
  const ambientLight = new THREE.AmbientLight(0xc0c0c0, 1.2);
  scene.add(ambientLight);

  const silverLight = new THREE.PointLight(0xc0c0c0, 3.2, 130);
  silverLight.position.set(12, 12, 20);
  scene.add(silverLight);

  const crimsonLight = new THREE.PointLight(0xef4444, 2.0, 110);
  crimsonLight.position.set(-16, -10, 15);
  scene.add(crimsonLight);

  const dirLight = new THREE.DirectionalLight(0xdcdcdc, 1.0);
  dirLight.position.set(0, 20, 25);
  scene.add(dirLight);

  // --------------------------------------------------------------------------
  // 3D Objects
  // --------------------------------------------------------------------------
  // 1. Torus Knot Core (Polished Silver Steel)
  const torusGeo = new THREE.TorusKnotGeometry(8, 2.2, 120, 24);
  const torusMat = new THREE.MeshStandardMaterial({
    color: 0xc0c0c0,
    roughness: 0.2,
    metalness: 0.9,
    wireframe: false,
  });
  const torus = new THREE.Mesh(torusGeo, torusMat);
  torus.position.set(0, 0, -5);
  scene.add(torus);

  // 2. Crimson Accent Wireframe Ring
  const ringGeo = new THREE.TorusGeometry(14, 0.28, 16, 100);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0xef4444,
    wireframe: true,
    transparent: true,
    opacity: 0.45,
  });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.position.set(0, 0, -5);
  scene.add(ring);

  // 3. Starfield / Floating Silver Dust Particles
  const starGeometry = new THREE.BufferGeometry();
  const starCount = 420;
  const starCoords = new Float32Array(starCount * 3);
  const starColors = new Float32Array(starCount * 3);

  const colorPalette = [
    new THREE.Color(0xc0c0c0), // Silver
    new THREE.Color(0xe0e0e0), // Bright silver
    new THREE.Color(0x808080), // Grey
    new THREE.Color(0xf87171), // Crimson accent
  ];

  for (let i = 0; i < starCount * 3; i += 3) {
    starCoords[i] = THREE.MathUtils.randFloatSpread(180);
    starCoords[i + 1] = THREE.MathUtils.randFloatSpread(180);
    starCoords[i + 2] = THREE.MathUtils.randFloatSpread(180);

    const isRuby = Math.random() < 0.12;
    const pickedColor = isRuby
      ? colorPalette[3]
      : colorPalette[Math.floor(Math.random() * 3)];

    starColors[i] = pickedColor.r;
    starColors[i + 1] = pickedColor.g;
    starColors[i + 2] = pickedColor.b;
  }

  starGeometry.setAttribute('position', new THREE.BufferAttribute(starCoords, 3));
  starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

  const starMaterial = new THREE.PointsMaterial({
    size: 0.7,
    vertexColors: true,
    transparent: true,
    opacity: 0.85,
  });

  const starField = new THREE.Points(starGeometry, starMaterial);
  scene.add(starField);

  // 4. Textured Moon (Safe Texture Loading)
  const textureLoader = new THREE.TextureLoader();
  const moonGeo = new THREE.SphereGeometry(3.6, 64, 64);
  const moonMat = new THREE.MeshStandardMaterial({
    color: 0x808080,
    roughness: 0.75,
    metalness: 0.2,
  });
  const moon = new THREE.Mesh(moonGeo, moonMat);
  moon.position.set(-12, 2, 25);
  scene.add(moon);

  textureLoader.load(
    'moon.jpg',
    function (texture) {
      moon.material.map = texture;
      moon.material.needsUpdate = true;
    },
    undefined,
    function () {
      // Graceful fallback to procedural shaded sphere
    }
  );

  textureLoader.load(
    'normal.jpg',
    function (texture) {
      moon.material.normalMap = texture;
      moon.material.needsUpdate = true;
    },
    undefined,
    function () {}
  );


  // --------------------------------------------------------------------------
  // Camera Scroll Choreography & Mouse Parallax
  // --------------------------------------------------------------------------
  let targetCameraZ = 30;
  let targetCameraX = -2;
  let targetCameraRotY = 0;

  function moveCamera() {
    const scrollY = window.scrollY || window.pageYOffset;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const scrollFraction = maxScroll > 0 ? scrollY / maxScroll : 0;

    targetCameraZ = 30 - scrollFraction * 40;
    targetCameraX = -2 + scrollFraction * 12;
    targetCameraRotY = scrollFraction * 0.45;

    moon.rotation.x = scrollY * 0.002;
    moon.rotation.y = scrollY * 0.004;


    const progressBar = document.querySelector('.scroll-progress-bar');
    if (progressBar) {
      progressBar.style.width = `${scrollFraction * 100}%`;
    }

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

  let mouseX = 0;
  let mouseY = 0;
  let targetMouseX = 0;
  let targetMouseY = 0;

  window.addEventListener('mousemove', function (e) {
    const normX = (e.clientX / window.innerWidth) * 2 - 1;
    const normY = -(e.clientY / window.innerHeight) * 2 + 1;
    targetMouseX = normX * 1.5;
    targetMouseY = normY * 1.5;
  });

  window.addEventListener('resize', function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  });

  // --------------------------------------------------------------------------
  // Animation Render Loop
  // --------------------------------------------------------------------------
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();

    mouseX += (targetMouseX - mouseX) * 0.05;
    mouseY += (targetMouseY - mouseY) * 0.05;

    camera.position.z += (targetCameraZ - camera.position.z) * 0.08;
    camera.position.x += (targetCameraX + mouseX - camera.position.x) * 0.08;
    camera.position.y += (mouseY * 0.8 - camera.position.y) * 0.08;
    camera.rotation.y += (targetCameraRotY - camera.rotation.y) * 0.08;

    torus.rotation.x += 0.22 * delta;
    torus.rotation.y += 0.3 * delta;

    ring.rotation.x -= 0.12 * delta;
    ring.rotation.z += 0.18 * delta;

    moon.rotation.y += 0.08 * delta;


    starField.rotation.y += 0.02 * delta;

    renderer.render(scene, camera);
  }

  animate();
})();

// ============================================================================
// Interactive UI & Terminal Console System
// ============================================================================
document.addEventListener('DOMContentLoaded', function () {
  // Toast notification
  const toast = document.querySelector('.toast-notice');
  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(function () {
      toast.classList.remove('show');
    }, 3200);
  }

  // Copy email
  const copyBtn = document.querySelector('#copyEmailBtn');
  if (copyBtn) {
    copyBtn.addEventListener('click', function (e) {
      e.preventDefault();
      const email = 'gunjalsiddhesh27@gmail.com';
      navigator.clipboard
        .writeText(email)
        .then(function () {
          showToast('✓ Copied to clipboard: gunjalsiddhesh27@gmail.com');
        })
        .catch(function () {
          showToast('Email: gunjalsiddhesh27@gmail.com');
        });
    });
  }

  // Mobile drawer toggle
  const mobileToggle = document.querySelector('.mobile-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', function () {
      navLinks.classList.toggle('active');
    });

    document.querySelectorAll('.nav-link').forEach(function (link) {
      link.addEventListener('click', function () {
        navLinks.classList.remove('active');
      });
    });
  }

  // Direct contact message
  const contactForm = document.querySelector('#contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const name = document.querySelector('#senderName')?.value || 'Friend';
      showToast(`Thanks ${name}! Launching your email client...`);
      const email = 'gunjalsiddhesh27@gmail.com';
      const subject = encodeURIComponent(`Portfolio Inquiry from ${name}`);
      const body = encodeURIComponent(
        document.querySelector('#senderMessage')?.value || ''
      );
      setTimeout(function () {
        window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
      }, 700);
    });
  }

  // Back to top
  const backToTopBtn = document.querySelector('.back-to-top');
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Active navigation scrollspy
  const sections = document.querySelectorAll('section[id]');
  const navItems = document.querySelectorAll('.nav-link');

  function updateActiveNavLink() {
    const scrollPos = window.scrollY + 180;
    sections.forEach(function (section) {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');
      if (scrollPos >= top && scrollPos < top + height) {
        navItems.forEach(function (link) {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', updateActiveNavLink, { passive: true });
  updateActiveNavLink();
});
