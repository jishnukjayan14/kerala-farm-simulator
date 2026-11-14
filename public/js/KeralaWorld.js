import * as THREE from 'three';
import { TextureGenerator } from './TextureGenerator.js';

/**
 * Photorealistic Open World Kerala Farming Simulation (കേരള ഫാമിംഗ് സിമുലേറ്റർ)
 * Based on Master Blueprint:
 * - 400x400m Open World with North-East Rocky Hills & Waterfall (വെള്ളച്ചാട്ടം)
 * - Curving Flowing River (വളഞ്ഞൊഴുകുന്ന പുഴ) traversing from the waterfall to the south-east
 * - Heavy River Bridge (നദീ പാലം) connecting the town to the Coconut Farm
 * - South-West Lake (കായൽ / തടാകം) with wooden Pier / Dock
 * - Central Town Roundabout Junction (കവല) with connected asphalt highway network
 * - Wetland Paddy Basin (താഴ്ന്ന നെൽപ്പാടം) on the West with earthen bunds (വരമ്പുകൾ)
 * - Highland Banana & Tapioca Farms, Heritage House, Tea Stall, Well & Tractor Shed
 * - Dedicated Blueprint Zones for HUD navigation
 */
export class KeralaWorld {
  constructor(scene, nightLightsGroup) {
    this.scene = scene;
    this.nightLightsGroup = nightLightsGroup;

    // Interactive Triggers
    this.wellTrigger = null;
    this.shopTrigger = null;
    this.shedTrigger = null;

    // Animated objects
    this.palmFronds = [];
    this.bananaLeaves = [];
    this.waterNormalTextures = [];
    this.waterMeshes = [];
    this.waterfallMaterials = [];

    // Master Blueprint Zones for Player Navigation & HUD
    this.zones = [
      { name: 'പ്രധാന ടൗൺ (Main Town Center)', xMin: -30, xMax: 30, zMin: -35, zMax: 15 },
      { name: 'നഗര കവല (Town Roundabout)', xMin: -16, xMax: 16, zMin: 5, zMax: 32 },
      { name: 'കായൽക്കര & ബോട്ട് ജെട്ടി (Lake Shore & Pier)', xMin: -95, xMax: -25, zMin: 65, zMax: 135 },
      { name: 'പുഴയോരം & നദീ പാലം (River & Bridge)', xMin: 55, xMax: 115, zMin: 20, zMax: 85 },
      { name: 'വെള്ളച്ചാട്ടം & മലനിരകൾ (Waterfall & Hills)', xMin: 20, xMax: 110, zMin: -165, zMax: -95 },
      { name: 'താഴ്ന്ന നെൽപ്പാടം (Wetland Paddy Fields)', xMin: -95, xMax: -25, zMin: -40, zMax: 35 },
      { name: 'പച്ചക്കറി തോട്ടങ്ങൾ (Vegetable Farms)', xMin: -70, xMax: 15, zMin: -95, zMax: -45 },
      { name: 'ഡയറി ഫാം (Dairy Farm)', xMin: -95, xMax: -30, zMin: 35, zMax: 75 },
      { name: 'പെട്രോൾ പമ്പ് & ആശുപത്രി (Town Services)', xMin: -25, xMax: 40, zMin: 32, zMax: 75 },
      { name: 'തെങ്ങിൻ തോപ്പ് (East Coconut Farm)', xMin: 85, xMax: 155, zMin: 30, zMax: 125 }
    ];

    // Initialize Shared PBR Materials
    this.initPBRMaterials();

    // Build the World following the Blueprint
    this.buildWorld();
  }

  initPBRMaterials() {
    // 1. Tropical Blade Grass PBR
    const grassTex = TextureGenerator.createTropicalGrassTexture();
    grassTex.repeat.set(45, 45);
    const grassNorm = TextureGenerator.createBumpNormalMap();
    grassNorm.repeat.set(45, 45);
    this.matGrass = new THREE.MeshStandardMaterial({
      map: grassTex,
      normalMap: grassNorm,
      roughness: 0.88,
      metalness: 0.02
    });

    // 2. Asphalt Road PBR
    const asphaltTex = TextureGenerator.createAsphaltTexture();
    asphaltTex.repeat.set(1, 35);
    const asphaltNorm = TextureGenerator.createBumpNormalMap();
    asphaltNorm.repeat.set(1, 35);
    this.matAsphalt = new THREE.MeshStandardMaterial({
      map: asphaltTex,
      normalMap: asphaltNorm,
      roughness: 0.72,
      metalness: 0.08
    });

    // 3. Kerala Red Laterite Soil PBR (ചെമ്മണ്ണ്)
    const chemmanTex = TextureGenerator.createRedLateriteTexture();
    chemmanTex.repeat.set(3, 15);
    const chemmanNorm = TextureGenerator.createBumpNormalMap();
    this.matChemman = new THREE.MeshStandardMaterial({
      map: chemmanTex,
      normalMap: chemmanNorm,
      roughness: 0.92,
      metalness: 0.02
    });

    // 4. Wetland Mud Silt PBR
    const mudTex = TextureGenerator.createWetSiltMudTexture();
    mudTex.repeat.set(4, 4);
    const mudNorm = TextureGenerator.createBumpNormalMap();
    this.matMud = new THREE.MeshStandardMaterial({
      map: mudTex,
      normalMap: mudNorm,
      roughness: 0.35,
      metalness: 0.15
    });

    // 5. Terracotta Clay Roof Tiles PBR
    const roofTex = TextureGenerator.createRoofTileTexture();
    roofTex.repeat.set(6, 3);
    const roofNorm = TextureGenerator.createBumpNormalMap();
    this.matRoof = new THREE.MeshStandardMaterial({
      map: roofTex,
      normalMap: roofNorm,
      roughness: 0.65,
      metalness: 0.05
    });

    // 6. Teak Wood PBR
    const teakTex = TextureGenerator.createTeakWoodTexture();
    this.matTeak = new THREE.MeshStandardMaterial({
      map: teakTex,
      roughness: 0.58,
      metalness: 0.04
    });

    // 7. Coconut Bark PBR
    const barkTex = TextureGenerator.createCoconutBarkTexture();
    barkTex.repeat.set(1, 4);
    this.matPalmBark = new THREE.MeshStandardMaterial({
      map: barkTex,
      roughness: 0.85,
      metalness: 0.02
    });

    // 8. Banana Leaf PBR
    const leafTex = TextureGenerator.createBananaLeafTexture();
    this.matBananaLeaf = new THREE.MeshStandardMaterial({
      map: leafTex,
      roughness: 0.45,
      metalness: 0.05,
      side: THREE.DoubleSide
    });

    // 9. Granite River Rocks & Cliffs PBR
    const rockTex = TextureGenerator.createRiverRockTexture();
    rockTex.repeat.set(3, 3);
    this.matRock = new THREE.MeshStandardMaterial({
      map: rockTex,
      roughness: 0.85,
      metalness: 0.1
    });

    // 10. Flowing River Water Shader Material
    const riverWaterNorm = TextureGenerator.createWaterNormalMap();
    riverWaterNorm.repeat.set(3, 40);
    this.waterNormalTextures.push(riverWaterNorm);
    this.matRiverWater = new THREE.MeshStandardMaterial({
      color: 0x005952, // Clear deep emerald river water
      normalMap: riverWaterNorm,
      normalScale: new THREE.Vector2(0.4, 0.4),
      roughness: 0.05,
      metalness: 0.2,
      transparent: true,
      opacity: 0.86
    });

    // 11. Serene South-West Lake Water Material
    const lakeWaterNorm = TextureGenerator.createWaterNormalMap();
    lakeWaterNorm.repeat.set(8, 8);
    this.waterNormalTextures.push(lakeWaterNorm);
    this.matLakeWater = new THREE.MeshStandardMaterial({
      color: 0x00415a, // Deep calm tropical blue
      normalMap: lakeWaterNorm,
      normalScale: new THREE.Vector2(0.25, 0.25),
      roughness: 0.04,
      metalness: 0.25,
      transparent: true,
      opacity: 0.88
    });

    // 12. Cascading Waterfall Foam Material
    const waterfallTex = TextureGenerator.createWaterfallTexture();
    waterfallTex.repeat.set(1, 4);
    this.waterfallTex = waterfallTex;
    this.matWaterfall = new THREE.MeshStandardMaterial({
      map: waterfallTex,
      color: 0xe0f7fa,
      roughness: 0.1,
      metalness: 0.1,
      transparent: true,
      opacity: 0.88,
      side: THREE.DoubleSide
    });
    this.waterfallMaterials.push(this.matWaterfall);
  }

  buildWorld() {
    this.buildTerrainAndHills();
    this.buildWaterfallAndRiver();
    this.buildSouthWestLake();
    this.buildMasterRoadNetwork();
    this.buildRiverBridge();
    this.buildPaddyWetlandBasin();
    this.buildBananaAndTapiocaFarms();
    this.buildHeritageStructures();
    this.buildFlora();
  }

  // 1. Broad Open-World Landscape & Rocky Hill Formations
  buildTerrainAndHills() {
    // 400x400m Master Terrain
    const groundGeo = new THREE.PlaneGeometry(400, 400, 48, 48);
    const ground = new THREE.Mesh(groundGeo, this.matGrass);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // North-East High Rocky Mountain Ridge (Hill Area above Waterfall)
    const hillConfigs = [
      { x: 45, y: 16, z: -160, rad: 60, h: 36 },
      { x: 95, y: 22, z: -155, rad: 75, h: 48 },
      { x: 145, y: 18, z: -140, rad: 65, h: 42 },
      { x: 165, y: 20, z: -70, rad: 70, h: 45 },
      { x: 175, y: 16, z: 20, rad: 65, h: 38 },
      // Distant West horizon hills
      { x: -165, y: 14, z: -120, rad: 70, h: 32 },
      { x: -170, y: 16, z: 20, rad: 75, h: 36 }
    ];

    hillConfigs.forEach((c) => {
      const hill = new THREE.Mesh(new THREE.ConeGeometry(c.rad, c.h, 16), this.matRock);
      hill.position.set(c.x, c.h / 2 - 2, c.z);
      hill.scale.set(1.4, 1, 1.4);
      hill.castShadow = true;
      hill.receiveShadow = true;
      this.scene.add(hill);
    });
  }

  // 2. Blueprint River (പുഴ) & Waterfall (വെള്ളച്ചാട്ടം)
  buildWaterfallAndRiver() {
    const riverGroup = new THREE.Group();

    // A. Cascading Waterfall at (x: 45, z: -142)
    const wfCliff = new THREE.Mesh(new THREE.BoxGeometry(22, 18, 14), this.matRock);
    wfCliff.position.set(45, 9, -142);
    wfCliff.castShadow = true;
    wfCliff.receiveShadow = true;
    this.scene.add(wfCliff);

    // Flowing Water Sheet on the cliff face
    const waterfallSheet = new THREE.Mesh(new THREE.PlaneGeometry(12, 17.5), this.matWaterfall);
    waterfallSheet.position.set(45, 8.8, -134.8);
    this.scene.add(waterfallSheet);

    // Waterfall Plunge Pool / Basin (വെള്ളച്ചാട്ടത്തിന്റെ കുളം)
    const plungePool = new THREE.Mesh(new THREE.CylinderGeometry(14, 16, 1.8, 20), this.matRiverWater);
    plungePool.position.set(45, 0.15, -125);
    this.scene.add(plungePool);
    this.waterMeshes.push(plungePool);

    // B. River Path segments curving south-east matching blueprint:
    // Flow points: (45, -120) -> (55, -60) -> (68, 0) -> (82, 50) -> (115, 120) -> (140, 160)
    const riverSegments = [
      { x1: 45, z1: -120, x2: 55, z2: -60, w: 15 },
      { x1: 55, z1: -60,  x2: 68, z2: 0,   w: 16 },
      { x1: 68, z1: 0,    x2: 82, z2: 50,  w: 17 },
      { x1: 82, z1: 50,   x2: 115, z2: 120, w: 18 },
      { x1: 115, z1: 120, x2: 145, z2: 170, w: 20 }
    ];

    riverSegments.forEach((seg) => {
      const dx = seg.x2 - seg.x1;
      const dz = seg.z2 - seg.z1;
      const len = Math.hypot(dx, dz);
      const angle = Math.atan2(dx, dz);
      const midX = (seg.x1 + seg.x2) / 2;
      const midZ = (seg.z1 + seg.z2) / 2;

      // River Water Surface
      const rWater = new THREE.Mesh(new THREE.PlaneGeometry(seg.w, len + 2), this.matRiverWater);
      rWater.rotation.x = -Math.PI / 2;
      rWater.rotation.z = -angle;
      rWater.position.set(midX, 0.12, midZ);
      this.scene.add(rWater);
      this.waterMeshes.push(rWater);

      // Rocky River Banks (ഇരുവശങ്ങളിലെയും പാറക്കെട്ടുകൾ)
      const perpX = Math.cos(angle) * (seg.w / 2 + 1.2);
      const perpZ = -Math.sin(angle) * (seg.w / 2 + 1.2);

      // Left Bank boulders
      const bLeft = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.9, len), this.matRock);
      bLeft.rotation.y = angle;
      bLeft.position.set(midX - perpX, 0.35, midZ - perpZ);
      bLeft.receiveShadow = true;
      this.scene.add(bLeft);

      // Right Bank boulders
      const bRight = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.9, len), this.matRock);
      bRight.rotation.y = angle;
      bRight.position.set(midX + perpX, 0.35, midZ + perpZ);
      bRight.receiveShadow = true;
      this.scene.add(bRight);
    });
  }

  // 3. Blueprint South-West Lake (കായൽ / തടാകം) with Wooden Jetty / Pier
  buildSouthWestLake() {
    const lakeCenter = { x: -60, z: 95 };
    const lakeRadiusX = 42;
    const lakeRadiusZ = 32;

    // A. Sunken Sandy/Laterite Lake Basin
    const basinGeo = new THREE.CylinderGeometry(lakeRadiusX + 2, lakeRadiusX + 5, 1.2, 28);
    const basin = new THREE.Mesh(basinGeo, this.matChemman);
    basin.position.set(lakeCenter.x, 0.1, lakeCenter.y || lakeCenter.z);
    basin.position.z = lakeCenter.z;
    basin.receiveShadow = true;
    this.scene.add(basin);

    // B. Glistening Deep Lake Water Sheet
    const lakeWaterGeo = new THREE.CylinderGeometry(lakeRadiusX, lakeRadiusX, 0.6, 28);
    const lakeWater = new THREE.Mesh(lakeWaterGeo, this.matLakeWater);
    lakeWater.position.set(lakeCenter.x, 0.22, lakeCenter.z);
    this.scene.add(lakeWater);
    this.waterMeshes.push(lakeWater);

    // C. Wooden Pier / Jetty (തടാകത്തിലെ ബോട്ട് ജെട്ടി) extending into the lake
    const pierLength = 18;
    const pierWidth = 3.2;
    const pierZ = lakeCenter.z - lakeRadiusZ + 6;

    const pierDeck = new THREE.Mesh(new THREE.BoxGeometry(pierWidth, 0.35, pierLength), this.matTeak);
    pierDeck.position.set(lakeCenter.x, 0.65, pierZ);
    pierDeck.castShadow = true;
    pierDeck.receiveShadow = true;
    this.scene.add(pierDeck);

    // Pier Timber Support Piles
    for (let pz = -pierLength / 2; pz <= pierLength / 2; pz += 4.5) {
      for (let px of [-pierWidth / 2 + 0.3, pierWidth / 2 - 0.3]) {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 1.6, 6), this.matTeak);
        post.position.set(lakeCenter.x + px, 0.4, pierZ + pz);
        post.castShadow = true;
        this.scene.add(post);
      }
    }
  }

  // 4. Blueprint Road Network with Central Roundabout Junction (കവല)
  buildMasterRoadNetwork() {
    const markMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const roundaboutCenter = { x: 0, z: 18 };

    // A. Central Roundabout Island (നഗര കവല)
    const islandRadius = 8.5;
    const island = new THREE.Mesh(new THREE.CylinderGeometry(islandRadius, islandRadius, 0.5, 24), this.matGrass);
    island.position.set(roundaboutCenter.x, 0.25, roundaboutCenter.y || roundaboutCenter.z);
    island.position.z = roundaboutCenter.z;
    this.scene.add(island);

    // Roundabout Signpost / Monument in center of junction
    const monument = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.8, 3.5, 8), this.matTeak);
    monument.position.set(roundaboutCenter.x, 2.0, roundaboutCenter.z);
    monument.castShadow = true;
    this.scene.add(monument);

    // Roundabout Asphalt Ring
    const ringRoad = new THREE.Mesh(new THREE.RingGeometry(islandRadius, islandRadius + 8.5, 32), this.matAsphalt);
    ringRoad.rotation.x = -Math.PI / 2;
    ringRoad.position.set(roundaboutCenter.x, 0.05, roundaboutCenter.z);
    ringRoad.receiveShadow = true;
    this.scene.add(ringRoad);

    // B. Highway Roads Connected to the Roundabout:
    // 1. North Road (To Main Town & Railway Station: z = 18 to z = -90)
    this.createRoadSegment(0, 18, 0, -85, 8.5);

    // 2. East Road (To Workshop & River Bridge: x = 0 to x = 82, z = 18 to z = 50)
    this.createRoadSegment(0, 18, 82, 50, 8.0);

    // 3. South-West Road (To Hospital, Petrol Pump & Lake: x = 0 to x = -55, z = 18 to z = 75)
    this.createRoadSegment(0, 18, -55, 75, 8.0);

    // 4. West Branch Road (To Paddy Fields & Dairy Farm: x = 0 to x = -65, z = -10 to z = -10)
    this.createRoadSegment(0, -10, -65, -10, 7.5);
  }

  // Helper: Create textured asphalt road segment with white stripes
  createRoadSegment(x1, z1, x2, z2, width) {
    const dx = x2 - x1;
    const dz = z2 - z1;
    const len = Math.hypot(dx, dz);
    const angle = Math.atan2(dx, dz);
    const midX = (x1 + x2) / 2;
    const midZ = (z1 + z2) / 2;

    const roadGeo = new THREE.PlaneGeometry(width, len);
    const road = new THREE.Mesh(roadGeo, this.matAsphalt);
    road.rotation.x = -Math.PI / 2;
    road.rotation.z = -angle;
    road.position.set(midX, 0.05, midZ);
    road.receiveShadow = true;
    this.scene.add(road);

    // Center Dashed White Line
    const markMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    for (let d = -len / 2 + 5; d <= len / 2 - 5; d += 12) {
      const dash = new THREE.Mesh(new THREE.PlaneGeometry(0.32, 6.5), markMat);
      dash.rotation.x = -Math.PI / 2;
      dash.rotation.z = -angle;
      const lx = midX + Math.sin(angle) * d;
      const lz = midZ + Math.cos(angle) * d;
      dash.position.set(lx, 0.065, lz);
      this.scene.add(dash);
    }
  }

  // 5. Blueprint Heavy River Bridge (നദീ പാലം)
  buildRiverBridge() {
    const bridgeCenter = { x: 82, z: 50 };
    const bridgeSpan = 22;
    const bridgeWidth = 9.5;

    // Concrete Abutments on both river shores
    const concreteMat = new THREE.MeshStandardMaterial({ color: 0x757575, roughness: 0.8 });
    const pierLeft = new THREE.Mesh(new THREE.BoxGeometry(4, 2.5, bridgeWidth + 2), concreteMat);
    pierLeft.position.set(bridgeCenter.x - bridgeSpan / 2 + 2, 0.8, bridgeCenter.z);
    pierLeft.castShadow = true;
    this.scene.add(pierLeft);

    const pierRight = new THREE.Mesh(new THREE.BoxGeometry(4, 2.5, bridgeWidth + 2), concreteMat);
    pierRight.position.set(bridgeCenter.x + bridgeSpan / 2 - 2, 0.8, bridgeCenter.z);
    pierRight.castShadow = true;
    this.scene.add(pierRight);

    // Bridge Deck (പാലത്തിന്റെ തട്ട്)
    const deck = new THREE.Mesh(new THREE.BoxGeometry(bridgeSpan, 0.7, bridgeWidth), this.matAsphalt);
    deck.position.set(bridgeCenter.x, 1.4, bridgeCenter.z);
    deck.castShadow = true;
    deck.receiveShadow = true;
    this.scene.add(deck);

    // Heavy White Guardrails on both sides of bridge
    const railMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 });
    const railNorth = new THREE.Mesh(new THREE.BoxGeometry(bridgeSpan, 1.0, 0.35), railMat);
    railNorth.position.set(bridgeCenter.x, 2.1, bridgeCenter.z - bridgeWidth / 2 + 0.2);
    this.scene.add(railNorth);

    const railSouth = new THREE.Mesh(new THREE.BoxGeometry(bridgeSpan, 1.0, 0.35), railMat);
    railSouth.position.set(bridgeCenter.x, 2.1, bridgeCenter.z + bridgeWidth / 2 - 0.2);
    this.scene.add(railSouth);
  }

  // 6. West Wetland Paddy Basin with Earthen Bunds (താഴ്ന്ന നെൽപ്പാടങ്ങൾ)
  buildPaddyWetlandBasin() {
    const bundMat = new THREE.MeshStandardMaterial({ color: 0x5a3e36, roughness: 0.92 });
    const paddyWaterNorm = this.waterNormalTextures[0] || TextureGenerator.createWaterNormalMap();
    const paddyWaterMat = new THREE.MeshStandardMaterial({
      color: 0x1f3c2b,
      normalMap: paddyWaterNorm,
      roughness: 0.08,
      metalness: 0.2,
      transparent: true,
      opacity: 0.76
    });

    // 4 Grand Paddy Fields matching blueprint
    const polders = [
      { x: -45, z: -15, w: 26, h: 22 },
      { x: -75, z: -15, w: 26, h: 22 },
      { x: -45, z: 12,  w: 26, h: 24 },
      { x: -75, z: 12,  w: 26, h: 24 }
    ];

    polders.forEach((p) => {
      // Mud bed
      const mud = new THREE.Mesh(new THREE.PlaneGeometry(p.w, p.h), this.matMud);
      mud.rotation.x = -Math.PI / 2;
      mud.position.set(p.x, 0.02, p.z);
      mud.receiveShadow = true;
      this.scene.add(mud);

      // Flooded water sheet
      const water = new THREE.Mesh(new THREE.PlaneGeometry(p.w * 0.98, p.h * 0.98), paddyWaterMat);
      water.rotation.x = -Math.PI / 2;
      water.position.set(p.x, 0.05, p.z);
      this.scene.add(water);
      this.waterMeshes.push(water);

      // Earthen bunds
      const bundW = 0.9;
      const bundH = 0.26;
      const bNorth = new THREE.Mesh(new THREE.BoxGeometry(p.w + bundW, bundH, bundW), bundMat);
      bNorth.position.set(p.x, bundH / 2, p.z - p.h / 2);
      this.scene.add(bNorth);

      const bSouth = new THREE.Mesh(new THREE.BoxGeometry(p.w + bundW, bundH, bundW), bundMat);
      bSouth.position.set(p.x, bundH / 2, p.z + p.h / 2);
      this.scene.add(bSouth);

      const bWest = new THREE.Mesh(new THREE.BoxGeometry(bundW, bundH, p.h), bundMat);
      bWest.position.set(p.x - p.w / 2, bundH / 2, p.z);
      this.scene.add(bWest);

      const bEast = new THREE.Mesh(new THREE.BoxGeometry(bundW, bundH, p.h), bundMat);
      bEast.position.set(p.x + p.w / 2, bundH / 2, p.z);
      this.scene.add(bEast);
    });
  }

  // 7. Banana & Tapioca Farms
  buildBananaAndTapiocaFarms() {
    // Highland Banana Plantation at (x: -55, z: -68)
    for (let x = -68; x <= -40; x += 10) {
      for (let z = -78; z <= -52; z += 10) {
        this.createBananaPlant(x, z, true);
      }
    }

    // Tapioca mounds at (x: -25, z: -68)
    for (let x = -32; x <= -16; x += 8) {
      for (let z = -78; z <= -52; z += 8) {
        const mound = new THREE.Mesh(new THREE.ConeGeometry(1.6, 0.5, 8), this.matChemman);
        mound.position.set(x, 0.25, z);
        this.scene.add(mound);
      }
    }
  }

  // 8. Heritage Farmhouse, Well & Shed
  buildHeritageStructures() {
    // Heritage Nalukettu House at (x: 18, z: -55) in Main Town
    const houseGroup = new THREE.Group();
    houseGroup.position.set(18, 0, -55);

    const wallMat = new THREE.MeshStandardMaterial({ color: 0xf5f3ea, roughness: 0.82 });
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(18, 0.7, 14), this.matRock);
    plinth.position.y = 0.35;
    houseGroup.add(plinth);

    const mainBody = new THREE.Mesh(new THREE.BoxGeometry(16, 4.5, 11), wallMat);
    mainBody.position.y = 2.95;
    mainBody.castShadow = true;
    houseGroup.add(mainBody);

    const verandah = new THREE.Mesh(new THREE.BoxGeometry(16, 0.35, 4.0), this.matTeak);
    verandah.position.set(0, 0.7, 7.2);
    houseGroup.add(verandah);

    for (let px of [-6, -2, 2, 6]) {
      const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, 3.8, 8), this.matTeak);
      pillar.position.set(px, 2.7, 8.8);
      pillar.castShadow = true;
      houseGroup.add(pillar);
    }

    const roof = new THREE.Mesh(new THREE.ConeGeometry(14, 5.2, 4), this.matRoof);
    roof.position.y = 7.6;
    roof.rotation.y = Math.PI / 4;
    roof.scale.set(1.5, 1, 1.3);
    roof.castShadow = true;
    houseGroup.add(roof);

    this.scene.add(houseGroup);

    // Stone Well at (x: 8, z: -45)
    const well = new THREE.Mesh(new THREE.CylinderGeometry(2.1, 2.3, 1.6, 16, 1, true), this.matRock);
    well.position.set(8, 0.8, -45);
    well.castShadow = true;
    this.scene.add(well);

    const wellWater = new THREE.Mesh(new THREE.CircleGeometry(1.9, 16), this.matRiverWater);
    wellWater.rotation.x = -Math.PI / 2;
    wellWater.position.set(8, 0.5, -45);
    this.scene.add(wellWater);

    this.wellTrigger = { position: new THREE.Vector3(8, 0, -45), radius: 5 };

    // Village Market Shop at (x: 28, z: 5)
    const shopGroup = new THREE.Group();
    shopGroup.position.set(28, 0, 5);
    const shopFloor = new THREE.Mesh(new THREE.BoxGeometry(9, 0.4, 7), this.matTeak);
    shopFloor.position.y = 0.2;
    shopGroup.add(shopFloor);

    const awning = new THREE.Mesh(new THREE.BoxGeometry(10, 0.25, 8.5), new THREE.MeshStandardMaterial({ color: 0xd84315 }));
    awning.position.set(0, 4.0, 0.3);
    awning.rotation.x = 0.15;
    awning.castShadow = true;
    shopGroup.add(awning);

    this.shopTrigger = { position: shopGroup.position, radius: 7 };
    this.scene.add(shopGroup);

    // Farm Equipment Workshop (ട്രാക്ടർ വർക്ക്‌ഷോപ്പ്) matching blueprint at (x: 48, z: 42)
    const shedGroup = new THREE.Group();
    shedGroup.position.set(48, 0, 42);

    const steelMat = new THREE.MeshStandardMaterial({ color: 0x455a64, metalness: 0.65, roughness: 0.45 });
    const tinRoofMat = new THREE.MeshStandardMaterial({ color: 0x78909c, metalness: 0.55, roughness: 0.5 });

    for (let x of [-5.5, 5.5]) {
      for (let z of [-4.5, 4.5]) {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 4.8, 8), steelMat);
        post.position.set(x, 2.4, z);
        post.castShadow = true;
        shedGroup.add(post);
      }
    }

    const shedRoof = new THREE.Mesh(new THREE.BoxGeometry(13, 0.22, 11), tinRoofMat);
    shedRoof.position.set(0, 4.9, 0);
    shedRoof.rotation.z = -0.06;
    shedRoof.castShadow = true;
    shedGroup.add(shedRoof);

    // Workbench & Oil Drums
    const bench = new THREE.Mesh(new THREE.BoxGeometry(4.2, 1.2, 1.4), this.matTeak);
    bench.position.set(0, 0.6, -3.5);
    shedGroup.add(bench);

    const drumMat = new THREE.MeshStandardMaterial({ color: 0x0d47a1, metalness: 0.7, roughness: 0.3 });
    const drum = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 1.4, 10), drumMat);
    drum.position.set(3.8, 0.7, -3.2);
    shedGroup.add(drum);

    this.shedTrigger = { position: new THREE.Vector3(48, 0, 42), radius: 8 };
    this.scene.add(shedGroup);
  }

  // 9. Flora: Palms lining roads, riverbanks, and East Coconut Farm
  buildFlora() {
    // East Coconut Farm grove across river (x: 95 to 135, z: 35 to 105)
    for (let x = 95; x <= 135; x += 14) {
      for (let z = 35; z <= 105; z += 14) {
        this.createRealisticCoconutPalm(x, z, (Math.random() - 0.5) * 0.12);
      }
    }

    // Riverbank Palms
    const riverPalms = [
      [35, -110], [42, -55], [52, -5], [65, 30], [90, 85], [105, 125]
    ];
    riverPalms.forEach(([px, pz]) => {
      this.createRealisticCoconutPalm(px, pz, 0.08);
    });

    // Town and Roadside Palms
    const roadPalms = [
      [-12, 10], [12, 10], [-12, 35], [12, 35],
      [-25, -2], [-25, 25], [25, -25]
    ];
    roadPalms.forEach(([px, pz]) => {
      this.createRealisticCoconutPalm(px, pz, 0.05);
    });
  }

  // Ultra-Realistic Coconut Palm (സൂപ്പർ റിയലിസ്റ്റിക് തെങ്ങ്)
  createRealisticCoconutPalm(x, z, leanAngle = 0.08) {
    const palmGroup = new THREE.Group();
    palmGroup.position.set(x, 0, z);

    const segHeight = 4.2;
    const baseTrunk = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.6, segHeight, 8), this.matPalmBark);
    baseTrunk.position.y = segHeight / 2;
    baseTrunk.rotation.z = leanAngle;
    baseTrunk.castShadow = true;
    palmGroup.add(baseTrunk);

    const midTrunk = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.42, segHeight, 8), this.matPalmBark);
    midTrunk.position.set(Math.sin(leanAngle) * segHeight, segHeight * 1.5 - 0.1, 0);
    midTrunk.rotation.z = leanAngle * 1.5;
    midTrunk.castShadow = true;
    palmGroup.add(midTrunk);

    const topTrunk = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.35, segHeight, 8), this.matPalmBark);
    const topX = Math.sin(leanAngle) * segHeight + Math.sin(leanAngle * 1.5) * segHeight;
    topTrunk.position.set(topX, segHeight * 2.5 - 0.2, 0);
    topTrunk.rotation.z = leanAngle * 2.0;
    topTrunk.castShadow = true;
    palmGroup.add(topTrunk);

    // Crown of Fronds
    const crown = new THREE.Group();
    crown.position.set(topX + Math.sin(leanAngle * 2.0) * segHeight * 0.5, segHeight * 3.0, 0);

    const frondLeafMat = new THREE.MeshStandardMaterial({
      color: 0x2e7d32,
      roughness: 0.55,
      side: THREE.DoubleSide
    });

    const frondCount = 10;
    for (let i = 0; i < frondCount; i++) {
      const angle = (i / frondCount) * Math.PI * 2;
      const frond = new THREE.Group();
      frond.rotation.y = angle;

      const leaf = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 5.5, 2, 4), frondLeafMat);
      leaf.position.set(0, -0.5, 2.6);
      leaf.rotation.x = Math.PI / 2 - 0.45;
      frond.add(leaf);
      crown.add(frond);
      this.palmFronds.push(leaf);
    }

    // Coconuts
    const nutMat = new THREE.MeshStandardMaterial({ color: 0x689f38, roughness: 0.5 });
    for (let c = 0; c < 5; c++) {
      const nutAng = (c / 5) * Math.PI * 2;
      const nut = new THREE.Mesh(new THREE.SphereGeometry(0.28, 5, 5), nutMat);
      nut.position.set(Math.cos(nutAng) * 0.45, -0.35, Math.sin(nutAng) * 0.45);
      crown.add(nut);
    }

    palmGroup.add(crown);
    this.scene.add(palmGroup);
  }

  // Banana Plant (നേന്ത്രവാഴ)
  createBananaPlant(x, z, hasBunch = true) {
    const bananaGroup = new THREE.Group();
    bananaGroup.position.set(x, 0, z);

    const stemMat = new THREE.MeshStandardMaterial({ color: 0x7cb342, roughness: 0.6 });
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.4, 3.2, 7), stemMat);
    stem.position.y = 1.6;
    stem.castShadow = true;
    bananaGroup.add(stem);

    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const leafGroup = new THREE.Group();
      leafGroup.position.set(0, 3.0, 0);
      leafGroup.rotation.y = angle;

      const leaf = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 3.5, 2, 2), this.matBananaLeaf);
      leaf.position.set(0, -0.35, 1.7);
      leaf.rotation.x = 0.55;
      leafGroup.add(leaf);

      bananaGroup.add(leafGroup);
      this.bananaLeaves.push(leaf);
    }

    if (hasBunch) {
      const bunchMat = new THREE.MeshStandardMaterial({ color: 0xd4e157, roughness: 0.5 });
      const bunch = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.36, 0.7, 6), bunchMat);
      bunch.position.set(0, 2.1, 0.55);
      bananaGroup.add(bunch);

      const budMat = new THREE.MeshStandardMaterial({ color: 0x4a148c, roughness: 0.4 });
      const bud = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.4, 6), budMat);
      bud.rotation.x = Math.PI;
      bud.position.set(0, 1.5, 0.55);
      bananaGroup.add(bud);
    }

    this.scene.add(bananaGroup);
  }

  // Get current Zone for Player HUD
  getPlayerZone(playerPos) {
    for (let z of this.zones) {
      if (
        playerPos.x >= z.xMin && playerPos.x <= z.xMax &&
        playerPos.z >= z.zMin && playerPos.z <= z.zMax
      ) {
        return z.name;
      }
    }
    return 'കേരള ഗ്രാമം (Kerala Countryside)';
  }

  // Animate river flow, waterfall cascades, lake ripples, and wind sway
  animate(delta, time) {
    // 1. Wind sway on palm and banana fronds
    const wind = Math.sin(time * 1.5) * 0.04;
    for (let frond of this.palmFronds) {
      frond.rotation.z = wind;
    }
    for (let bLeaf of this.bananaLeaves) {
      bLeaf.rotation.z = wind * 0.8;
    }

    // 2. Animated river flow & lake ripples
    for (let tex of this.waterNormalTextures) {
      tex.offset.y += delta * 0.08;
      tex.offset.x += Math.sin(time * 0.7) * 0.003;
    }

    // 3. Rushing waterfall foam animation
    if (this.waterfallTex) {
      this.waterfallTex.offset.y -= delta * 1.4; // Rapid downward torrent
    }

    // 4. Subtle water surface shimmer
    for (let w of this.waterMeshes) {
      w.position.y += Math.sin(time * 2.5 + w.position.x * 0.3) * 0.0004;
    }
  }
}
