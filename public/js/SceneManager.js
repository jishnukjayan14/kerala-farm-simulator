import * as THREE from 'three';

/**
 * Three.js Scene, Camera, Renderer, and Tropical Kerala Daylight Cycle
 */
export class SceneManager {
  constructor(container) {
    this.container = container;

    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87ceeb); // Tropical sky blue
    this.scene.fog = new THREE.FogExp2(0xa7d8de, 0.012);

    // Camera
    this.camera = new THREE.PerspectiveCamera(
      55,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 10, 15);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    this.container.appendChild(this.renderer.domElement);

    // Lighting
    this.setupLighting();

    // Time of day (0.0 to 1.0, 0.25 = sunrise 6am, 0.5 = noon 12pm, 0.75 = sunset 6pm, 0 = midnight)
    this.timeOfDay = 0.35; // 8:24 AM
    this.timeSpeed = 0.005; // Progression speed

    // Resize handler
    window.addEventListener('resize', () => this.onWindowResize());
  }

  setupLighting() {
    // Ambient / Hemisphere Light (tropical lush ground bounce)
    this.hemiLight = new THREE.HemisphereLight(0xfff7e6, 0x3d5c3a, 0.65);
    this.scene.add(this.hemiLight);

    // Directional Sun Light
    this.sunLight = new THREE.DirectionalLight(0xfff2cc, 1.4);
    this.sunLight.position.set(30, 45, 20);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 1024;
    this.sunLight.shadow.mapSize.height = 1024;
    this.sunLight.shadow.camera.near = 0.5;
    this.sunLight.shadow.camera.far = 120;
    const d = 35;
    this.sunLight.shadow.camera.left = -d;
    this.sunLight.shadow.camera.right = d;
    this.sunLight.shadow.camera.top = d;
    this.sunLight.shadow.camera.bottom = -d;
    this.sunLight.shadow.bias = -0.0002;
    this.sunLight.shadow.normalBias = 0.02;
    this.scene.add(this.sunLight);

    // Lanterns group (turns on at night)
    this.nightLights = new THREE.Group();
    this.scene.add(this.nightLights);
  }

  updateDayNightCycle(delta) {
    this.timeOfDay = (this.timeOfDay + delta * this.timeSpeed * 0.1) % 1.0;

    // Angle of sun
    const sunAngle = this.timeOfDay * Math.PI * 2 - Math.PI / 2;
    const sunDistance = 60;
    this.sunLight.position.x = Math.cos(sunAngle) * sunDistance;
    this.sunLight.position.y = Math.sin(sunAngle) * sunDistance;
    this.sunLight.position.z = Math.sin(sunAngle * 0.5) * 20;

    const isDay = this.sunLight.position.y > 0;
    const sunElevation = Math.max(0, this.sunLight.position.y / sunDistance);

    // Sky and fog color interpolation
    const daySky = new THREE.Color(0x87ceeb);
    const sunsetSky = new THREE.Color(0xf57c00);
    const nightSky = new THREE.Color(0x0a141e);

    let currentSky;
    if (sunElevation > 0.3) {
      currentSky = daySky;
      this.sunLight.intensity = 1.3;
      this.hemiLight.intensity = 0.65;
    } else if (sunElevation > 0.0) {
      const t = sunElevation / 0.3;
      currentSky = new THREE.Color().lerpColors(sunsetSky, daySky, t);
      this.sunLight.intensity = 0.8 * t + 0.2;
      this.hemiLight.intensity = 0.4;
    } else {
      currentSky = nightSky;
      this.sunLight.intensity = 0.05;
      this.hemiLight.intensity = 0.18;
    }

    this.scene.background = currentSky;
    this.scene.fog.color = currentSky;

    // Toggle night lanterns
    this.nightLights.visible = !isDay || sunElevation < 0.15;
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
