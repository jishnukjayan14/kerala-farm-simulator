import * as THREE from 'three';

/**
 * High-Fidelity Procedural PBR Texture Generator for Kerala Open World
 * Generates photorealistic Albedo, Normal, and Roughness maps:
 * - Asphalt Tar Road with aggregates, lane marks & wear
 * - Kerala Red Laterite Soil (ചെമ്മണ്ണ് & ചെങ്കല്ല്)
 * - Wetland Silt Mud with wet sheen (വയലിലെ കറുത്ത ചെളി)
 * - Tropical Blade Grass with depth (പച്ചപ്പുല്ല്)
 * - Traditional Terracotta Roof Tiles (ഓട്)
 * - Ringed Coconut Trunk Bark (തെങ്ങിൻ തടി)
 * - Kerala Teak & Anjili Wood Grain (തേക്ക് / ആഞ്ഞിലി തടി)
 * - Banana Broad Leaf with midrib veins (വാഴയില)
 * - Water Ripple Normal Map (തോട്ടിലെയും വയലിലെയും ഓളങ്ങൾ)
 */
export class TextureGenerator {
  // 1. Asphalt Road Texture (അഗ്രിഗേറ്റുകൾ ഉള്ള ടാർ റോഡ്)
  static createAsphaltTexture() {
    const size = 1024;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Base charcoal asphalt
    ctx.fillStyle = '#1c1e20';
    ctx.fillRect(0, 0, size, size);

    // Stone aggregates and gravel flecks
    const imgData = ctx.getImageData(0, 0, size, size);
    const data = imgData.data;

    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 40;
      const stoneFleck = Math.random() > 0.94 ? (Math.random() * 55 + 20) : 0;
      const darkPatch = Math.random() > 0.85 ? -15 : 0;
      const val = Math.min(255, Math.max(12, 32 + noise + stoneFleck + darkPatch));
      
      data[i] = val;              // R
      data[i + 1] = val + 1;      // G
      data[i + 2] = val + 3;      // B (subtle cool tarmac tint)
      data[i + 3] = 255;
    }
    ctx.putImageData(imgData, 0, 0);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }

  // 2. Kerala Red Laterite Soil (ചെങ്കല്ല് / ചെമ്മണ്ണ്)
  static createRedLateriteTexture() {
    const size = 1024;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Base deep Kerala red-brown
    ctx.fillStyle = '#7a2818';
    ctx.fillRect(0, 0, size, size);

    const imgData = ctx.getImageData(0, 0, size, size);
    const data = imgData.data;

    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 60;
      const pebble = Math.random() > 0.96 ? 50 : 0;
      const ironOxide = Math.random() > 0.7 ? 20 : 0;

      data[i] = Math.min(255, Math.max(30, 138 + noise + pebble + ironOxide)); // R
      data[i + 1] = Math.min(255, Math.max(15, 52 + noise * 0.6));            // G
      data[i + 2] = Math.min(255, Math.max(10, 32 + noise * 0.4));            // B
      data[i + 3] = 255;
    }
    ctx.putImageData(imgData, 0, 0);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }

  // 3. Flooded Wetland Silt Mud (വയലിലെ കറുത്ത നനഞ്ഞ ചെളി)
  static createWetSiltMudTexture() {
    const size = 1024;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#1c140f';
    ctx.fillRect(0, 0, size, size);

    const imgData = ctx.getImageData(0, 0, size, size);
    const data = imgData.data;

    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 35;
      const siltFleck = Math.random() > 0.95 ? 15 : 0;
      data[i] = Math.min(255, Math.max(8, 42 + noise + siltFleck));      // Dark organic clay
      data[i + 1] = Math.min(255, Math.max(6, 32 + noise * 0.8));
      data[i + 2] = Math.min(255, Math.max(4, 22 + noise * 0.6));
      data[i + 3] = 255;
    }
    ctx.putImageData(imgData, 0, 0);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }

  // 4. Tropical Blade Grass Texture (പച്ചപ്പുല്ല്)
  static createTropicalGrassTexture() {
    const size = 1024;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#22591d';
    ctx.fillRect(0, 0, size, size);

    const imgData = ctx.getImageData(0, 0, size, size);
    const data = imgData.data;

    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 50;
      const lushGreen = Math.random() > 0.6 ? 25 : 0;
      data[i] = Math.min(255, Math.max(15, 45 + noise * 0.6));            // R
      data[i + 1] = Math.min(255, Math.max(35, 105 + noise + lushGreen)); // G (vibrant tropical green)
      data[i + 2] = Math.min(255, Math.max(10, 35 + noise * 0.5));        // B
      data[i + 3] = 255;
    }
    ctx.putImageData(imgData, 0, 0);

    // Overlay fine grass blade streaks
    ctx.strokeStyle = 'rgba(76, 175, 80, 0.25)';
    ctx.lineWidth = 1.5;
    for (let j = 0; j < 3000; j++) {
      const gx = Math.random() * size;
      const gy = Math.random() * size;
      const len = 4 + Math.random() * 8;
      ctx.beginPath();
      ctx.moveTo(gx, gy);
      ctx.lineTo(gx + (Math.random() - 0.5) * 4, gy - len);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }

  // 5. Traditional Terracotta Roof Tiles (മംഗലാപുരം ഓട്)
  static createRoofTileTexture() {
    const size = 1024;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#8f291b'; // Burnt clay terracotta
    ctx.fillRect(0, 0, size, size);

    const rows = 32;
    const cols = 16;
    const rowH = size / rows;
    const colW = size / cols;

    for (let r = 0; r < rows; r++) {
      const y = r * rowH;
      // Tile top shadow edge
      ctx.fillStyle = 'rgba(0, 0, 0, 0.42)';
      ctx.fillRect(0, y, size, 5);

      // Tile curved vertical fluted highlights
      for (let c = 0; c < cols; c++) {
        const x = c * colW + (r % 2 === 0 ? 0 : colW / 2);
        const grad = ctx.createLinearGradient(x, y, x + colW, y);
        grad.addColorStop(0, 'rgba(40, 10, 5, 0.45)');
        grad.addColorStop(0.2, 'rgba(255, 140, 110, 0.22)');
        grad.addColorStop(0.5, 'rgba(255, 180, 150, 0.35)');
        grad.addColorStop(0.8, 'rgba(255, 120, 90, 0.2)');
        grad.addColorStop(1, 'rgba(30, 8, 4, 0.5)');
        ctx.fillStyle = grad;
        ctx.fillRect(x, y, colW, rowH);
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }

  // 6. Coconut Palm Trunk Bark Texture (തെങ്ങിന്റെ തടി - ringed fibrous bark)
  static createCoconutBarkTexture() {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Base greyish-brown fibrous wood
    ctx.fillStyle = '#4e382a';
    ctx.fillRect(0, 0, size, size);

    // Weathered trunk rings
    for (let y = 0; y < size; y += 24) {
      // Ring shadow notch
      ctx.fillStyle = 'rgba(20, 12, 8, 0.6)';
      ctx.fillRect(0, y, size, 5);

      // Ring highlight lip
      ctx.fillStyle = 'rgba(160, 130, 100, 0.3)';
      ctx.fillRect(0, y + 5, size, 4);
    }

    // Vertical fiber grain
    ctx.strokeStyle = 'rgba(20, 15, 10, 0.25)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 500; i++) {
      const x = Math.random() * size;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + (Math.random() - 0.5) * 6, size);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }

  // 7. Kerala Teak Wood Grain (തേക്ക് / ആഞ്ഞിലി തടി)
  static createTeakWoodTexture() {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#5c3317'; // Rich warm oiled teak
    ctx.fillRect(0, 0, size, size);

    // Organic longitudinal wood rings & grain
    for (let i = 0; i < 80; i++) {
      const y = Math.random() * size;
      ctx.fillStyle = i % 2 === 0 ? 'rgba(35, 15, 5, 0.28)' : 'rgba(145, 85, 45, 0.22)';
      ctx.fillRect(0, y, size, 3 + Math.random() * 8);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }

  // 8. Banana Broad Leaf Texture (പച്ച വാഴയില)
  static createBananaLeafTexture() {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Vibrant tropical banana green
    ctx.fillStyle = '#388e3c';
    ctx.fillRect(0, 0, size, size);

    // Center pale green midrib vein
    const midrib = ctx.createLinearGradient(size / 2 - 12, 0, size / 2 + 12, 0);
    midrib.addColorStop(0, '#2e7d32');
    midrib.addColorStop(0.5, '#aed581');
    midrib.addColorStop(1, '#2e7d32');
    ctx.fillStyle = midrib;
    ctx.fillRect(size / 2 - 12, 0, 24, size);

    // Parallel leaf veins branching outward
    ctx.strokeStyle = 'rgba(200, 230, 160, 0.22)';
    ctx.lineWidth = 1.5;
    for (let y = 0; y < size; y += 8) {
      // Left vein
      ctx.beginPath();
      ctx.moveTo(size / 2 - 12, y);
      ctx.lineTo(0, y + 25);
      ctx.stroke();

      // Right vein
      ctx.beginPath();
      ctx.moveTo(size / 2 + 12, y);
      ctx.lineTo(size, y + 25);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    return texture;
  }

  // 9. Water Ripple Normal Map for dynamic reflections & ripples
  static createWaterNormalMap() {
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    const imgData = ctx.createImageData(size, size);
    const data = imgData.data;

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const i = (y * size + x) * 4;
        // Smooth sine wave ripples
        const wave1 = Math.sin(x * 0.12) * Math.cos(y * 0.12);
        const wave2 = Math.sin(x * 0.06 + y * 0.08);
        const wave = (wave1 + wave2) * 0.5;

        data[i] = Math.floor(128 + wave * 45);     // X normal
        data[i + 1] = Math.floor(128 + wave * 45); // Y normal
        data[i + 2] = 255;                         // Z facing up
        data[i + 3] = 255;
      }
    }
    ctx.putImageData(imgData, 0, 0);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }

  // 10. General PBR Normal Map Generator
  static createBumpNormalMap() {
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    const imgData = ctx.createImageData(size, size);
    const data = imgData.data;

    for (let i = 0; i < data.length; i += 4) {
      data[i] = 128 + (Math.random() - 0.5) * 45;
      data[i + 1] = 128 + (Math.random() - 0.5) * 45;
      data[i + 2] = 240 + Math.random() * 15;
      data[i + 3] = 255;
    }
    ctx.putImageData(imgData, 0, 0);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }
}
