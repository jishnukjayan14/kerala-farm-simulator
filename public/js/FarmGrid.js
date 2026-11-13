import * as THREE from 'three';
import { CropModels } from './Crops.js';
import { sounds } from './Audio.js';
import { TextureGenerator } from './TextureGenerator.js';

/**
 * 3D Farm Grid System
 * Manages farm plots, tile states (untilled, tilled, watered), crop growth, and targeting cursor.
 */
export class FarmGrid {
  constructor(scene, gridSize = 8, tileSize = 2.4, centerX = -36, centerZ = 12) {
    this.scene = scene;
    this.gridSize = gridSize; // 8x8 = 64 plots
    this.tileSize = tileSize;
    this.originX = centerX - ((gridSize * tileSize) / 2);
    this.originZ = centerZ - ((gridSize * tileSize) / 2);

    // Tile data map: "x,z" -> { state, crop, moisture, mesh, cropMesh }
    this.tiles = new Map();

    // High-Fidelity PBR Wetland Soil Materials
    const grassTex = TextureGenerator.createTropicalGrassTexture();
    grassTex.repeat.set(1, 1);
    this.matUntilled = new THREE.MeshStandardMaterial({
      map: grassTex,
      roughness: 0.85,
      metalness: 0.02
    });

    const mudTex = TextureGenerator.createWetSiltMudTexture();
    mudTex.repeat.set(1, 1);
    const mudNorm = TextureGenerator.createBumpNormalMap();
    this.matTilled = new THREE.MeshStandardMaterial({
      map: mudTex,
      normalMap: mudNorm,
      roughness: 0.7, // Prepared dark paddy soil
      metalness: 0.05
    });

    this.matWatered = new THREE.MeshStandardMaterial({
      map: mudTex,
      normalMap: mudNorm,
      roughness: 0.18, // Glistening waterlogged paddy mud (നനഞ്ഞ ചെളി)
      metalness: 0.2
    });

    // Tile outline cursor
    this.cursorMesh = null;
    this.activeTileCoord = null;

    this.buildGrid();
    this.buildCursor();
  }

  buildGrid() {
    const geo = new THREE.BoxGeometry(this.tileSize * 0.95, 0.12, this.tileSize * 0.95);

    for (let gx = 0; gx < this.gridSize; gx++) {
      for (let gz = 0; gz < this.gridSize; gz++) {
        const posX = this.originX + gx * this.tileSize;
        const posZ = this.originZ + gz * this.tileSize;

        const tileMesh = new THREE.Mesh(geo, this.matUntilled);
        tileMesh.position.set(posX, 0.06, posZ);
        tileMesh.receiveShadow = true;
        this.scene.add(tileMesh);

        const key = `${gx},${gz}`;
        this.tiles.set(key, {
          gx, gz,
          x: posX, z: posZ,
          status: 'untilled', // untilled | tilled | watered
          crop: null, // { type, stage, progress }
          moistureTime: 0,
          mesh: tileMesh,
          cropMesh: null
        });
      }
    }
  }

  buildCursor() {
    const geo = new THREE.RingGeometry(0.7, 0.85, 4);
    const mat = new THREE.MeshBasicMaterial({ color: 0xffeb3b, side: THREE.DoubleSide });
    this.cursorMesh = new THREE.Mesh(geo, mat);
    this.cursorMesh.rotation.x = -Math.PI / 2;
    this.cursorMesh.position.y = 0.15;
    this.cursorMesh.visible = false;
    this.scene.add(this.cursorMesh);
  }

  // Update cursor position based on player location & forward facing
  updateTargetCursor(playerPos, playerRotationY) {
    // Project 1.8 units forward from player facing direction
    const forwardX = playerPos.x + Math.sin(playerRotationY) * 1.8;
    const forwardZ = playerPos.z + Math.cos(playerRotationY) * 1.8;

    // Find closest tile
    let closestTile = null;
    let minDistance = 2.0;

    for (let [key, tile] of this.tiles) {
      const dist = Math.hypot(tile.x - forwardX, tile.z - forwardZ);
      if (dist < minDistance) {
        minDistance = dist;
        closestTile = tile;
      }
    }

    if (closestTile) {
      this.cursorMesh.position.set(closestTile.x, 0.14, closestTile.z);
      this.cursorMesh.visible = true;
      this.activeTileCoord = { gx: closestTile.gx, gz: closestTile.gz };
      return closestTile;
    } else {
      this.cursorMesh.visible = false;
      this.activeTileCoord = null;
      return null;
    }
  }

  // Perform tool action on target tile
  performAction(tileCoord, toolName, inventory) {
    if (!tileCoord) return { success: false, message: 'ഫാം പ്ലോട്ടിനടുത്ത് നിൽക്കുക' };
    const key = `${tileCoord.gx},${tileCoord.gz}`;
    const tile = this.tiles.get(key);
    if (!tile) return { success: false };

    // 1. Hoe (തൂമ്പ) - Till untilled soil
    if (toolName === 'hoe') {
      if (tile.status === 'untilled') {
        tile.status = 'tilled';
        tile.mesh.material = this.matTilled;
        sounds.playDig();
        return { success: true, message: 'മണ്ണ് കിളച്ചൊരുക്കി! (Tilled)' };
      } else {
        return { success: false, message: 'ഇവിടെ നിലം നേരത്തെ ഒരുക്കിയതാണ്' };
      }
    }

    // 2. Watering Can (വെള്ളം നനയ്ക്കൽ)
    if (toolName === 'water') {
      if (tile.status === 'untilled') {
        return { success: false, message: 'ആദ്യം തൂമ്പ വെച്ച് മണ്ണ് കിളയ്ക്കുക' };
      }
      if (inventory.water <= 0) {
        return { success: false, message: 'പാത്രത്തിൽ വെള്ളം തീർന്നു! കിണറ്റിൽ പോയി വെള്ളം കോരൂ' };
      }

      inventory.water = Math.max(0, inventory.water - 10);
      tile.status = 'watered';
      tile.moistureTime = 60; // 60 seconds wet
      tile.mesh.material = this.matWatered;
      sounds.playWater();
      return { success: true, message: 'നനച്ചു! (Watered)', waterLevel: inventory.water };
    }

    // 3. Planting Seeds (വിത്ത് നടൽ)
    if (['carrot', 'tomato', 'pumpkin', 'wheat'].includes(toolName)) {
      if (tile.status === 'untilled') {
        return { success: false, message: 'ആദ്യം തൂമ്പ വെച്ച് മണ്ണ് കിളയ്ക്കുക' };
      }
      if (tile.crop) {
        return { success: false, message: 'ഇവിടെ നേരത്തെ വിത്ത് നട്ടതാണ്' };
      }
      if ((inventory[toolName] || 0) <= 0) {
        return { success: false, message: `${toolName} വിത്തുകൾ തീർന്നു! കടയിൽ നിന്ന് വാങ്ങുക` };
      }

      inventory[toolName]--;
      tile.crop = {
        type: toolName,
        stage: 0,
        progress: 0,
        growthSpeed: 1.0
      };

      this.updateCropMesh(tile);
      sounds.playPlant();
      return { success: true, message: `${toolName} വിത്ത് നട്ടു!`, seedCount: inventory[toolName] };
    }

    // 4. Scythe / Harvest (വിളവെടുപ്പ്)
    if (toolName === 'scythe') {
      if (!tile.crop) {
        return { success: false, message: 'ഇവിടെ വിളവെടുക്കാൻ ഒന്നുമില്ല' };
      }
      if (tile.crop.stage < 3) {
        return { success: false, message: 'വിള മൂത്തിട്ടില്ല! കുറച്ചുകൂടി കാത്തിരിക്കുക' };
      }

      // Harvested!
      const cropType = tile.crop.type;
      inventory.crops[cropType] = (inventory.crops[cropType] || 0) + 1;

      // Remove crop mesh
      if (tile.cropMesh) {
        this.scene.remove(tile.cropMesh);
        tile.cropMesh = null;
      }
      tile.crop = null;
      tile.status = 'tilled';
      tile.mesh.material = this.matTilled;

      sounds.playHarvest();
      return {
        success: true,
        harvestedCrop: cropType,
        totalHarvested: inventory.crops[cropType],
        message: `${cropType} വിളവെടുത്തു! ചന്തയിൽ വിൽക്കാം`
      };
    }

    return { success: false };
  }

  // Visual update for crops
  updateCropMesh(tile) {
    if (tile.cropMesh) {
      this.scene.remove(tile.cropMesh);
      tile.cropMesh = null;
    }

    if (tile.crop) {
      const mesh = CropModels.createCropMesh(tile.crop.type, tile.crop.stage);
      mesh.position.set(tile.x, 0.12, tile.z);
      this.scene.add(mesh);
      tile.cropMesh = mesh;
    }
  }

  // Periodic Crop growth loop (run every delta seconds)
  updateCrops(delta) {
    for (let [key, tile] of this.tiles) {
      if (tile.status === 'watered') {
        tile.moistureTime -= delta;
        if (tile.moistureTime <= 0) {
          tile.status = 'tilled';
          tile.mesh.material = this.matTilled;
        }
      }

      // Grow crops if watered
      if (tile.crop && tile.crop.stage < 3) {
        // Growth rate boosted when watered
        const rate = tile.status === 'watered' ? 0.15 : 0.03;
        tile.crop.progress += delta * rate;

        const expectedStage = Math.min(3, Math.floor(tile.crop.progress));
        if (expectedStage !== tile.crop.stage) {
          tile.crop.stage = expectedStage;
          this.updateCropMesh(tile);
        }
      }

      // Gentle ready-to-harvest bounce animation
      if (tile.crop && tile.crop.stage === 3 && tile.cropMesh) {
        tile.cropMesh.position.y = 0.12 + Math.abs(Math.sin(Date.now() * 0.004)) * 0.06;
      }
    }
  }

  // Network state sync: overwrite tile state from server
  applyServerState(serverTiles) {
    if (!Array.isArray(serverTiles)) return;
    for (let sTile of serverTiles) {
      const key = `${sTile.gx},${sTile.gz}`;
      const tile = this.tiles.get(key);
      if (tile) {
        tile.status = sTile.status;
        tile.mesh.material = tile.status === 'watered' ? this.matWatered : (tile.status === 'tilled' ? this.matTilled : this.matUntilled);
        tile.crop = sTile.crop;
        this.updateCropMesh(tile);
      }
    }
  }

  // Export current state
  exportState() {
    const list = [];
    for (let [key, tile] of this.tiles) {
      list.push({
        gx: tile.gx,
        gz: tile.gz,
        status: tile.status,
        crop: tile.crop
      });
    }
    return list;
  }
}
