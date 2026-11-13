import * as THREE from 'three';

/**
 * Three.js Scene, Camera, Renderer, and Dynamic Kerala Seasons & Weather Engine
 * Supports Open World viewing distance, Day/Night lighting, and Monsoon Rain (മഴ).
 */
export class SceneManager {
  constructor(container) {
    this.container = container;

    // Scene with tropical atmosphere
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87ceeb); // Tropical sky
    this.scene.fog = new THREE.FogExp2(0x9fc2b2, 0.005); // Expanded open world fog

    // Perspective Camera with expanded far plane
    this.camera = new THREE.PerspectiveCamera(
      52,
      window.innerWidth / window.innerHeight,
      0.1,
      1800
    );
    this.camera.position.set(0, 14, 22);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.container.appendChild(this.renderer.domElement);

    // Dynamic Lighting & Night Lights
    this.nightLights = new THREE.Group();
    this.scene.add(this.nightLights);
    this.setupLighting();

    // Monsoon Rain Particle System (ഇടവപ്പാതി മഴ)
    this.isRaining = false;
    this.setupRainParticles();

    // Time & Calendar Cycle
    this.timeOfDay = 0.35; // 8:24 AM
    this.timeSpeed = 0.004;

    window.addEventListener('resize', () => this.onWindowResize());
  }

  setupLighting() {
    // Ambient / Hemisphere light with lush green ground bounce
    this.hemiLight = new THREE.HemisphereLight(0xfff5e6, 0x2e542e, 0.7);
    this.scene.add(this.hemiLight);

    // Directional Tropical Sun
    this.sunLight = new THREE.DirectionalLight(0xfff0b3, 1.4);
    this.sunLight.position.set(50, 80, 40);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 0.5;
    this.sunLight.shadow.camera.far = 280;

    // Shadow coverage for Open World fields
    const d = 85;
    this.sunLight.shadow.camera.left = -d;
    this.sunLight.shadow.camera.right = d;
    this.sunLight.shadow.camera.top = d;
    this.sunLight.shadow.camera.bottom = -d;
    this.sunLight.shadow.bias = -0.0002;
    this.sunLight.shadow.normalBias = 0.02;
    this.scene.add(this.sunLight);
  }

  // Realistic Tropical Monsoon Rain (മഴ സിസ്റ്റം)
  setupRainParticles() {
    const rainCount = 1400;
    const rainGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(rainCount * 3);

    for (let i = 0; i < rainCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 120;
      positions[i * 3 + 1] = Math.random() * 45;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 120;
    }

    rainGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const rainMat = new THREE.PointsMaterial({
      color: 0x90caf9,
      size: 0.25,
      transparent: true,
      opacity: 0.65
    });

    this.rainSystem = new THREE.Points(rainGeo, rainMat);
    this.rainSystem.visible = false;
    this.scene.add(this.rainSystem);
  }

  setWeather(weatherName) {
    if (weatherName === 'rain') {
      this.isRaining = true;
      this.rainSystem.visible = true;
      this.sunLight.intensity = 0.5;
      this.hemiLight.intensity = 0.35;
      this.scene.fog.color = new THREE.Color(0x4a6572);
      this.scene.background = new THREE.Color(0x4a6572);
    } else {
      this.isRaining = false;
      this.rainSystem.visible = false;
    }
  }

  updateDayNightCycle(delta, playerPos) {
    this.timeOfDay = (this.timeOfDay + delta * this.timeSpeed * 0.1) % 1.0;

    const sunAngle = this.timeOfDay * Math.PI * 2 - Math.PI / 2;
    const sunDist = 120;
    this.sunLight.position.x = Math.cos(sunAngle) * sunDist;
    this.sunLight.position.y = Math.sin(sunAngle) * sunDist;
    this.sunLight.position.z = Math.sin(sunAngle * 0.4) * 50;

    const isDay = this.sunLight.position.y > 0;
    const sunElevation = Math.max(0, this.sunLight.position.y / sunDist);

    if (!this.isRaining) {
      const daySky = new THREE.Color(0x87ceeb);
      const sunsetSky = new THREE.Color(0xf57c00);
      const nightSky = new THREE.Color(0x0a141e);

      let currentSky;
      if (sunElevation > 0.3) {
        currentSky = daySky;
        this.sunLight.intensity = 1.35;
        this.hemiLight.intensity = 0.7;
      } else if (sunElevation > 0.0) {
        const t = sunElevation / 0.3;
        currentSky = new THREE.Color().lerpColors(sunsetSky, daySky, t);
        this.sunLight.intensity = 0.8 * t + 0.2;
        this.hemiLight.intensity = 0.4;
      } else {
        currentSky = nightSky;
        this.sunLight.intensity = 0.05;
        this.hemiLight.intensity = 0.2;
      }

      this.scene.background = currentSky;
      this.scene.fog.color = currentSky;
    }

    this.nightLights.visible = !isDay || sunElevation < 0.15;

    // Update Rain Particles falling around player
    if (this.isRaining && this.rainSystem && playerPos) {
      this.rainSystem.position.set(playerPos.x, 0, playerPos.z);
      const positions = this.rainSystem.geometry.attributes.position.array;
      for (let i = 1; i < positions.length; i += 3) {
        positions[i] -= delta * 32; // Fall speed
        if (positions[i] < 0) {
          positions[i] = 42;
        }
      }
      this.rainSystem.geometry.attributes.position.needsUpdate = true;
    }
  }

  getFormattedTime() {
    const totalMinutes = Math.floor(this.timeOfDay * 24 * 60);
    const hours24 = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    const ampm = hours24 >= 12 ? 'PM' : 'AM';
    const hours12 = hours24 % 12 || 12;
    const minStr = mins < 10 ? '0' + mins : mins;
    return `${hours12}:${minStr} ${ampm}`;
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }
}
