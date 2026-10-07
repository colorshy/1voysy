/**
 * 1VOYSY — Global Interactive Knitted Textile System
 * Continuous Three.js/WebGL background.
 * HOVER DEFORMATION REMOVED: Textile is 100% stable during pointer movement.
 * INTERACTION OCCURS ON CLICK ONLY: Permanent physical textile damage (cuts/punctures).
 */

import * as THREE from 'three';

export function initGlobalTextile() {
  const canvas = document.getElementById('global-textile-canvas');
  if (!canvas) {
    console.warn('[1VOYSY Textile] Canvas element #global-textile-canvas not found.');
    return;
  }

  // ========================================================
  // 1. THREE.JS SCENE SETUP
  // ========================================================
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: false,
      antialias: false,
      powerPreference: 'high-performance',
      depth: false,
      stencil: false,
    });
  } catch (err) {
    console.warn('[1VOYSY Textile] WebGL not supported or context error:', err);
    document.body.classList.add('textile-webgl-fallback');
    return;
  }

  const getDpr = () => Math.min(window.devicePixelRatio || 1, 2);
  renderer.setPixelRatio(getDpr());

  // Screen metrics & responsive pattern scale
  let width = window.innerWidth;
  let height = window.innerHeight;
  let aspect = width / height;

  function computePatternScale() {
    // 9 squares horizontally, 5 squares vertically in the 2752x1536 texture
    const squarePx = width > 1200 ? 148 : width > 768 ? 128 : 96;
    const repeatX = (width / squarePx) / 9.0;
    const repeatY = (height / squarePx) / 5.0;
    return new THREE.Vector2(repeatX, repeatY);
  }

  // ========================================================
  // 2. TEXTURE LOADER
  // ========================================================
  const textureLoader = new THREE.TextureLoader();
  const textureAsset = '/assets/knitted-checkerboard.jpg';

  const textileTexture = textureLoader.load(
    textureAsset,
    (tex) => {
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.generateMipmaps = true;
      tex.needsUpdate = true;
      requestWake();
    },
    undefined,
    (err) => {
      console.warn('[1VOYSY Textile] Failed to load knitted texture asset:', err);
    }
  );

  // ========================================================
  // 3. GLSL SHADER MATERIAL
  // Zero hover distortion: interaction occurs ONLY on click
  // ========================================================
  const MAX_CUTS = 32;

  const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position.xy, 0.0, 1.0);
    }
  `;

  const fragmentShader = `
    precision highp float;

    #define MAX_CUTS 32

    uniform sampler2D u_texture;
    uniform vec2 u_resolution;
    uniform vec2 u_patternScale;
    uniform float u_scroll;
    uniform float u_time;

    uniform vec4 u_cuts[MAX_CUTS];      // xy: fabricX, fabricY; z: angleRad; w: scrollAtClick
    uniform vec4 u_cutParams[MAX_CUTS]; // x: age; y: halfLen; z: maxHalfWidth; w: seed
    uniform int u_cutCount;

    varying vec2 vUv;

    void main() {
      vec2 screenCoord = gl_FragCoord.xy / u_resolution.xy;

      // Continuous aspect-corrected knitted textile coordinates (perfect 1:1 squares)
      vec2 textileUV = screenCoord * u_patternScale;

      // Seamless scroll roll (feels like one continuous roll of knitted fabric)
      textileUV.y -= (u_scroll / u_resolution.y) * u_patternScale.y * 0.4;

      // ========================================================
      // PERMANENT TEXTILE DAMAGE (Punctures & Incisions from Clicks Only)
      // ZERO hover deformation — textile is completely stable during pointer movement
      // ========================================================
      vec2 cutDisp = vec2(0.0);
      float cutVoidAlpha = 0.0;
      float cutRimHighlight = 0.0;
      vec3 cutVoidColor = vec3(0.038, 0.055, 0.042); // deep dark interior under fabric

      for (int i = 0; i < MAX_CUTS; i++) {
        if (i >= u_cutCount) break;

        vec4 cutData = u_cuts[i];
        vec4 params = u_cutParams[i];

        // Screen position pinned to the exact fabric stitch where pierced:
        float cutScreenX = cutData.x;
        float cutScreenY = cutData.y + u_scroll * 0.4;

        vec2 diffCut = gl_FragCoord.xy - vec2(cutScreenX, cutScreenY);
        float dCut = length(diffCut);

        // Evaluate within localized cut influence radius (~60px)
        if (dCut < 60.0) {
          float ang = cutData.z;
          float cosA = cos(ang);
          float sinA = sin(ang);

          // Local rotated coordinates along incision
          // u: longitudinal (along cut), v: transverse (across slit width)
          float u = diffCut.x * cosA + diffCut.y * sinA;
          float v = -diffCut.x * sinA + diffCut.y * cosA;

          float halfLen = params.y;
          float maxHalfWidth = params.z;
          float seed = params.w;

          // Parabolic slit profile with irregular severed yarn loop edges
          if (abs(u) < halfLen) {
            float uNorm = u / halfLen;
            float taper = 1.0 - uNorm * uNorm;

            // Knitted fiber edge irregularity (jagged individual loops parted)
            float edgeNoise = sin(u * 0.85 + seed * 12.0) * 0.26 + cos(u * 2.2 + seed * 7.0) * 0.15;
            float localHalfWidth = maxHalfWidth * taper * (1.0 + edgeNoise);

            float vDist = abs(v);

            // 1. INSIDE THE INCISION: Dark interior underneath
            if (vDist < localHalfWidth) {
              float cavityDepth = 1.0 - (vDist / max(0.001, localHalfWidth));
              float voidFactor = smoothstep(0.0, 0.65, cavityDepth);
              cutVoidAlpha = max(cutVoidAlpha, voidFactor);
            }

            // 2. SURROUNDING FABRIC: Yarn loops permanently displaced outward
            float distOutside = vDist - localHalfWidth;
            if (distOutside >= 0.0 && distOutside < 24.0) {
              float pushFalloff = smoothstep(24.0, 0.0, distOutside) * taper;
              float vSign = v >= 0.0 ? 1.0 : -1.0;
              
              // Displace outward perpendicular to incision
              vec2 outwardDir = vec2(-sinA, cosA) * vSign;
              cutDisp += outwardDir * pushFalloff * 0.024;

              // Raised frayed edge catching ambient gallery light
              float frayGlint = (0.2 + 0.12 * sin(u * 3.5 + seed * 5.0)) * pushFalloff;
              cutRimHighlight = max(cutRimHighlight, frayGlint);
            }
          }
        }
      }

      // Sample textile texture with persistent cut displacement ONLY
      vec2 finalUV = textileUV + cutDisp;
      vec4 texColor = texture2D(u_texture, finalUV);

      // Apply permanent cut void (dark interior underneath)
      if (cutVoidAlpha > 0.0) {
        texColor.rgb = mix(texColor.rgb, cutVoidColor, cutVoidAlpha);
      }

      // ========================================================
      // PHYSICAL TACTILE LIGHTING & SPECULAR WOOL SHEEN ON CUT EDGES
      // ========================================================
      if (cutRimHighlight > 0.0) {
        vec3 surfaceNormal = normalize(vec3(-cutDisp.x * 28.0, -cutDisp.y * 28.0, 1.0));
        vec3 lightDir = normalize(vec3(-0.35, 0.55, 0.75));
        vec3 viewDir = vec3(0.0, 0.0, 1.0);
        vec3 halfVec = normalize(lightDir + viewDir);

        float spec = pow(max(dot(surfaceNormal, halfVec), 0.0), 12.0);
        vec3 woolSheen = vec3(0.96, 0.94, 0.88);
        texColor.rgb += woolSheen * (spec * 0.15 + cutRimHighlight);
      }

      // Editorial gallery vignette
      float vignette = smoothstep(1.35, 0.45, length(screenCoord - 0.5) * 1.35);
      texColor.rgb *= mix(0.94, 1.0, vignette);

      gl_FragColor = texColor;
    }
  `;

  // Persistent cuts state (capped at 32 for optimal GPU performance)
  const cutsData = [];
  const cutsParams = [];
  let cutCount = 0;
  let nextCutIdx = 0;

  const uCutsArray = [];
  const uCutParamsArray = [];
  for (let i = 0; i < MAX_CUTS; i++) {
    uCutsArray.push(new THREE.Vector4(0, 0, 0, 0));
    uCutParamsArray.push(new THREE.Vector4(0, 0, 0, 0));
  }

  const uniforms = {
    u_texture: { value: textileTexture },
    u_resolution: { value: new THREE.Vector2(width, height) },
    u_patternScale: { value: computePatternScale() },
    u_scroll: { value: 0 },
    u_time: { value: 0 },
    u_cuts: { value: uCutsArray },
    u_cutParams: { value: uCutParamsArray },
    u_cutCount: { value: 0 },
  };

  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms,
    depthTest: false,
    depthWrite: false,
  });

  const geometry = new THREE.PlaneGeometry(2, 2);
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  // ========================================================
  // 4. INTERACTION STATE & CUT ENGINE (CLICK ONLY)
  // ========================================================
  let targetScrollY = window.scrollY;
  let currentScrollY = targetScrollY;

  function updateCutUniforms() {
    for (let i = 0; i < cutCount; i++) {
      const c = cutsData[i];
      const p = cutsParams[i];
      if (c && p) {
        uniforms.u_cuts.value[i].set(c.fabricX, c.fabricY, c.angleRad, c.scrollAtClick);
        uniforms.u_cutParams.value[i].set(p.age, p.halfLen, p.maxHalfWidth, p.seed);
      }
    }
    uniforms.u_cutCount.value = cutCount;
  }

  function addPersistentCut(clientX, clientY, angleDeg = 32) {
    const angleRad = (angleDeg * Math.PI) / 180;
    const fabricX = clientX;
    // Y in WebGL coordinate space (0 at bottom, H at top), offset by current scroll
    const fabricY = (height - clientY) - currentScrollY * 0.4;

    const halfLen = 15.0 + Math.random() * 4.0; // 15-19px longitudinal half-length
    const maxHalfWidth = 3.5 + Math.random() * 1.5; // 3.5-5.0px transverse half-width
    const seed = Math.random() * 10.0;

    const idx = cutCount < MAX_CUTS ? cutCount : (nextCutIdx % MAX_CUTS);
    cutsData[idx] = { fabricX, fabricY, angleRad, scrollAtClick: currentScrollY };
    cutsParams[idx] = { age: 0, halfLen, maxHalfWidth, seed };

    if (cutCount < MAX_CUTS) {
      cutCount++;
    }
    nextCutIdx = (nextCutIdx + 1) % MAX_CUTS;

    updateCutUniforms();
    requestWake();
  }

  // ========================================================
  // 5. ENERGY-EFFICIENT RENDER LOOP
  // Emil Kowalski production standard: sleep when fully idle
  // ========================================================
  let isRunning = false;
  let lastTime = performance.now();
  let idleTimer = 0;

  function requestWake() {
    idleTimer = 0;
    if (!isRunning) {
      isRunning = true;
      lastTime = performance.now();
      requestAnimationFrame(render);
    }
  }

  function render(now) {
    const delta = Math.min((now - lastTime) / 1000, 0.064);
    lastTime = now;

    // A. Smooth scroll interpolation
    currentScrollY += (targetScrollY - currentScrollY) * 0.14;

    // B. Update cut ages for initial physical settling
    let hasFreshCuts = false;
    for (let i = 0; i < cutCount; i++) {
      if (cutsParams[i] && cutsParams[i].age < 0.6) {
        cutsParams[i].age += delta;
        hasFreshCuts = true;
      }
    }
    if (hasFreshCuts) {
      updateCutUniforms();
    }

    // C. Push uniforms to GPU
    uniforms.u_scroll.value = currentScrollY;
    uniforms.u_time.value = now * 0.001;

    // D. Draw WebGL frame
    renderer.render(scene, camera);

    // E. Idle sleep check: when settled, pause loop to save 100% CPU/GPU
    const isScrolling = Math.abs(currentScrollY - targetScrollY) > 0.3;

    if (!isScrolling && !hasFreshCuts) {
      idleTimer += delta;
      if (idleTimer > 0.6) {
        isRunning = false;
        return; // Sleep until requestWake() is triggered
      }
    } else {
      idleTimer = 0;
    }

    requestAnimationFrame(render);
  }

  // ========================================================
  // 6. RESIZE HANDLER
  // ========================================================
  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    aspect = width / height;

    renderer.setSize(width, height, false);
    uniforms.u_resolution.value.set(width, height);
    uniforms.u_patternScale.value.copy(computePatternScale());
    requestWake();
  }

  window.addEventListener('resize', resize, { passive: true });
  resize();

  // ========================================================
  // 7. EVENT LISTENERS: CLICK & SCROLL ONLY (NO POINTERMOVE)
  // Pointer movement is strictly handled by DOM needle cursor
  // ========================================================
  function getNeedleAngle() {
    const needleEl = document.getElementById('needle-cursor');
    if (needleEl && needleEl.dataset.needleAngle) {
      return parseFloat(needleEl.dataset.needleAngle);
    }
    return 32;
  }

  // Pointer penetration clicks (needle creates permanent cut ONLY on click)
  window.addEventListener('pointerdown', (e) => {
    const angle = getNeedleAngle();
    addPersistentCut(e.clientX, e.clientY, angle);
  }, { passive: true });

  // Scroll tracking (smooth continuous roll of textile)
  window.addEventListener('scroll', () => {
    targetScrollY = window.scrollY;
    requestWake();
  }, { passive: true });

  // Touch fallback (creates cut on tap)
  window.addEventListener('touchstart', (e) => {
    if (e.touches && e.touches.length > 0) {
      const touch = e.touches[0];
      addPersistentCut(touch.clientX, touch.clientY, 32);
    }
  }, { passive: true });

  // Initial wake to render base frame
  requestWake();

  console.info('🧵 1VOYSY — Global Knitted Textile (Click-Only Damage Engine) initialized.');
}
