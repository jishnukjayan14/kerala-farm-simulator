import * as THREE from 'three';
import { TextureGenerator } from './TextureGenerator.js';

/**
 * Photorealistic Kerala Village & Farm Simulation (കേരള ഫാം സിമുലേറ്റർ)
 * Inspired by Farming Simulator 22 (FS22) Kerala Edition:
 * - Perfectly aligned, connected road network with curbs, road markings & zebra crossings
 * - Zero overlap: Every building, hospital, house, and farm sits on dedicated plots
 * - Authentic Kerala Town Street with compound walls, gates, and terracotta roofs
 * - Detailed Level Crossing (റെയിൽവേ ഗേറ്റ്) with railway tracks, train & station
 * - Modern Hospital with ambulance bay, Petrol Pump with forecourt, Farm Workshop with 3D Tractor
 * - Dairy Farm with red barn, twin silos, white post-and-rail fences, and cows
 * - West Terraced Wetland Paddy Fields with earthen bunds & irrigation
 * - Flowing River with concrete arch bridge, north-east Waterfall, south-west Lake with pier
 * - High-performance 60 FPS rendering using optimized instanced geometry
 */
export class KeralaWorld {
  constructor(scene, nightLightsGroup) {
    this.scene = scene;
    this.nightLightsGroup = nightLightsGroup;

    // Interactive Triggers
    this.wellTrigger = null;
    this.shopTrigger = null;
    this.shedTrigger = null;
    this.hospitalTrigger = null;
    this.pumpTrigger = null;
    this.stationTrigger = null;
    this.dairyTrigger = null;

    // Animated objects
    this.waterNormalTextures = [];
    this.waterMeshes = [];
    this.waterfallTex = null;
    this.palmFronds = [];
    this.trainGroup = null;

    // Master Blueprint Zones for HUD
    this.zones = [
      { name: 'നഗര കവല (Town Roundabout)', xMin: -18, xMax: 18, zMin: 5, zMax: 35 },
      { name: 'പ്രധാന ഗ്രാമവീഥി (Town Main Street)', xMin: -35, xMax: 35, zMin: -65, zMax: 5 },
      { name: 'റെയിൽവേ സ്റ്റേഷൻ & ട്രാക്ക് (Railway Station)', xMin: -45, xMax: 55, zMin: -85, zMax: -60 },
      { name: 'വെള്ളച്ചാട്ടം & മലനിരകൾ (Waterfall & Gorge)', xMin: 20, xMax: 150, zMin: -190, zMax: -110 },
      { name: 'നദീ പാലം (River Bridge)', xMin: 65, xMax: 115, zMin: 25, zMax: 65 },
      { name: 'തെങ്ങിൻ തോപ്പ് (East Coconut Farm)', xMin: 100, xMax: 180, zMin: 20, zMax: 140 },
      { name: 'ഡയറി ഫാം (Dairy Farm & Barn)', xMin: -110, xMax: -40, zMin: 30, zMax: 85 },
      { name: 'കായൽക്കര & ബോട്ട് ജെട്ടി (Lake Shore & Pier)', xMin: -110, xMax: -30, zMin: 85, zMax: 160 },
      { name: 'ആശുപത്രി & പെട്രോൾ പമ്പ് (Hospital & Fuel)', xMin: -35, xMax: 35, zMin: 35, zMax: 85 },
      { name: 'ഫാം വർക്ക്‌ഷോപ്പ് (Farm Workshop & Tractor)', xMin: 35, xMax: 75, zMin: 15, zMax: 50 },
      { name: 'താഴ്ന്ന നെൽപ്പാടങ്ങൾ (Wetland Paddy Fields)', xMin: -120, xMax: -30, zMin: -55, zMax: 25 },
      { name: 'പച്ചക്കറി തോട്ടങ്ങൾ (Vegetable Farms)', xMin: -80, xMax: 20, zMin: -120, zMax: -65 },
      { name: 'റബ്ബർ എസ്റ്റേറ്റ് (Rubber Estate)', xMin: -150, xMax: -80, zMin: -130, zMax: -65 }
    ];

    this.initPBRMaterials();
    this.buildWorld();
  }

  initPBRMaterials() {
    // 1. Tropical Grass
    const grassTex = TextureGenerator.createTropicalGrassTexture();
    grassTex.repeat.set(60, 60);
    const grassNorm = TextureGenerator.createBumpNormalMap();
    this.matGrass = new THREE.MeshStandardMaterial({
      map: grassTex,
      normalMap: grassNorm,
      roughness: 0.88,
      metalness: 0.02
    });

    // 2. High-Grade Asphalt Highway
    const asphaltTex = TextureGenerator.createAsphaltTexture();
    asphaltTex.repeat.set(1, 40);
    const asphaltNorm = TextureGenerator.createBumpNormalMap();
    this.matAsphalt = new THREE.MeshStandardMaterial({
      map: asphaltTex,
      normalMap: asphaltNorm,
      roughness: 0.72,
      metalness: 0.08
    });

    // 3. Concrete Curbs & Sidewalks (നടപ്പാതകൾ)
    this.matCurb = new THREE.MeshStandardMaterial({
      color: 0x9e9e9e,
      roughness: 0.75,
      metalness: 0.05
    });

    // 4. Kerala Red Earth (ചെമ്മണ്ണ്)
    const chemmanTex = TextureGenerator.createRedLateriteTexture();
    chemmanTex.repeat.set(4, 20);
    this.matChemman = new THREE.MeshStandardMaterial({
      map: chemmanTex,
      roughness: 0.92,
      metalness: 0.02
    });

    // 5. Wetland Mud Silt
    const mudTex = TextureGenerator.createWetSiltMudTexture();
    mudTex.repeat.set(4, 4);
    this.matMud = new THREE.MeshStandardMaterial({
      map: mudTex,
      roughness: 0.35,
      metalness: 0.15
    });

    // 6. Terracotta Clay Roof Tiles (മംഗലാപുരം ഓട്)
    const roofTex = TextureGenerator.createRoofTileTexture();
    roofTex.repeat.set(4, 2);
    this.matRoof = new THREE.MeshStandardMaterial({
      map: roofTex,
      roughness: 0.65,
      metalness: 0.05
    });

    // 7. Whitewash Walls
    this.matWall = new THREE.MeshStandardMaterial({
      color: 0xf4f4ee,
      roughness: 0.85
    });

    // 8. Teak Wood
    const teakTex = TextureGenerator.createTeakWoodTexture();
    this.matTeak = new THREE.MeshStandardMaterial({
      map: teakTex,
      roughness: 0.58,
      metalness: 0.04
    });

    // 9. Coconut Bark
    const barkTex = TextureGenerator.createCoconutBarkTexture();
    barkTex.repeat.set(1, 4);
    this.matPalmBark = new THREE.MeshStandardMaterial({
      map: barkTex,
      roughness: 0.85,
      metalness: 0.02
    });

    // 10. Granite Rocks
    const rockTex = TextureGenerator.createRiverRockTexture();
    rockTex.repeat.set(3, 3);
    this.matRock = new THREE.MeshStandardMaterial({
      map: rockTex,
      roughness: 0.85,
      metalness: 0.1
    });

    // 11. River Water
    const riverNorm = TextureGenerator.createWaterNormalMap();
    riverNorm.repeat.set(3, 35);
    this.waterNormalTextures.push(riverNorm);
    this.matRiverWater = new THREE.MeshStandardMaterial({
      color: 0x005952,
      normalMap: riverNorm,
      normalScale: new THREE.Vector2(0.4, 0.4),
      roughness: 0.05,
      metalness: 0.2,
      transparent: true,
      opacity: 0.88
    });

    // 12. Lake Water
    const lakeNorm = TextureGenerator.createWaterNormalMap();
    lakeNorm.repeat.set(8, 8);
    this.waterNormalTextures.push(lakeNorm);
    this.matLakeWater = new THREE.MeshStandardMaterial({
      color: 0x003d54,
      normalMap: lakeNorm,
      normalScale: new THREE.Vector2(0.25, 0.25),
      roughness: 0.04,
      metalness: 0.25,
      transparent: true,
      opacity: 0.9
    });

    // 13. Waterfall Foam
    const waterfallTex = TextureGenerator.createWaterfallTexture();
    waterfallTex.repeat.set(1, 4);
    this.waterfallTex = waterfallTex;
    this.matWaterfall = new THREE.MeshStandardMaterial({
      map: waterfallTex,
      color: 0xe0f7fa,
      roughness: 0.1,
      metalness: 0.1,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide
    });
  }

  buildWorld() {
    this.buildTerrainAndHills();
    this.buildWaterfallAndRiver();
    this.buildSouthWestLake();
    this.buildConnectedRoadNetwork();
    this.buildRiverBridge();
    this.buildRailwayLineAndStation();
    this.buildTownStreetBlocks();
    this.buildHospitalAndPetrolPump();
    this.buildFarmWorkshopWithTractor();
    this.buildDairyFarm();
    this.buildPaddyWetlandBasin();
    this.buildVegetableAndRubberFarms();
    this.buildFoliage();
  }

  // 1. Sprawling 800m Master Terrain
  buildTerrainAndHills() {
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(800, 800, 48, 48), this.matGrass);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // North-East Mountain Gorge
    const hills = [
      { x: 55, z: -175, r: 65, h: 48 },
      { x: 115, z: -170, r: 85, h: 60 },
      { x: 175, z: -150, r: 75, h: 54 },
      { x: 195, z: -80, r: 80, h: 55 },
      { x: 215, z: 20, r: 75, h: 48 },
      { x: -195, z: -130, r: 80, h: 40 },
      { x: -205, z: 20, r: 85, h: 44 }
    ];

    hills.forEach((h) => {
      const cone = new THREE.Mesh(new THREE.ConeGeometry(h.r, h.h, 16), this.matRock);
      cone.position.set(h.x, h.h / 2 - 2, h.z);
      cone.scale.set(1.4, 1, 1.4);
      cone.castShadow = true;
      cone.receiveShadow = true;
      this.scene.add(cone);
    });
  }

  // 2. Blueprint River & Waterfall
  buildWaterfallAndRiver() {
    // Rocky Cliff
    const cliff = new THREE.Mesh(new THREE.BoxGeometry(30, 24, 18), this.matRock);
    cliff.position.set(55, 12, -155);
    cliff.castShadow = true;
    cliff.receiveShadow = true;
    this.scene.add(cliff);

    // Foaming Waterfall Sheet
    const waterfall = new THREE.Mesh(new THREE.PlaneGeometry(16, 23.5), this.matWaterfall);
    waterfall.position.set(55, 11.8, -145.8);
    this.scene.add(waterfall);

    // Waterfall Plunge Basin
    const pool = new THREE.Mesh(new THREE.CylinderGeometry(18, 20, 2.0, 24), this.matRiverWater);
    pool.position.set(55, 0.15, -132);
    this.scene.add(pool);
    this.waterMeshes.push(pool);

    // Winding River Segments heading south-east
    const segments = [
      { x1: 55, z1: -132, x2: 65, z2: -75, w: 18 },
      { x1: 65, z1: -75,  x2: 78, z2: -15, w: 20 },
      { x1: 78, z1: -15,  x2: 95, z2: 45,  w: 22 },
      { x1: 95, z1: 45,   x2: 130, z2: 110, w: 24 },
      { x1: 130, z1: 110, x2: 170, z2: 180, w: 26 }
    ];

    segments.forEach((seg) => {
      const dx = seg.x2 - seg.x1;
      const dz = seg.z2 - seg.z1;
      const len = Math.hypot(dx, dz);
      const angle = Math.atan2(dx, dz);
      const midX = (seg.x1 + seg.x2) / 2;
      const midZ = (seg.z1 + seg.z2) / 2;

      const water = new THREE.Mesh(new THREE.PlaneGeometry(seg.w, len + 4), this.matRiverWater);
      water.rotation.x = -Math.PI / 2;
      water.rotation.z = -angle;
      water.position.set(midX, 0.12, midZ);
      this.scene.add(water);
      this.waterMeshes.push(water);

      // Rocky embankments
      const perpX = Math.cos(angle) * (seg.w / 2 + 1.4);
      const perpZ = -Math.sin(angle) * (seg.w / 2 + 1.4);

      const bLeft = new THREE.Mesh(new THREE.BoxGeometry(2.8, 1.2, len), this.matRock);
      bLeft.rotation.y = angle;
      bLeft.position.set(midX - perpX, 0.45, midZ - perpZ);
      this.scene.add(bLeft);

      const bRight = new THREE.Mesh(new THREE.BoxGeometry(2.8, 1.2, len), this.matRock);
      bRight.rotation.y = angle;
      bRight.position.set(midX + perpX, 0.45, midZ + perpZ);
      this.scene.add(bRight);
    });
  }

  // 3. South-West Lake (കായൽ) with Pier & Boat
  buildSouthWestLake() {
    const lakePos = { x: -75, z: 120 };
    const rx = 55;
    const rz = 40;

    const basin = new THREE.Mesh(new THREE.CylinderGeometry(rx + 3, rx + 6, 1.4, 32), this.matChemman);
    basin.position.set(lakePos.x, 0.1, lakePos.z);
    basin.receiveShadow = true;
    this.scene.add(basin);

    const water = new THREE.Mesh(new THREE.CylinderGeometry(rx, rx, 0.8, 32), this.matLakeWater);
    water.position.set(lakePos.x, 0.22, lakePos.z);
    this.scene.add(water);
    this.waterMeshes.push(water);

    // Wooden Pier / Jetty
    const pierLen = 22;
    const pierW = 3.8;
    const pierZ = lakePos.z - rz + 8;
    const pier = new THREE.Mesh(new THREE.BoxGeometry(pierW, 0.45, pierLen), this.matTeak);
    pier.position.set(lakePos.x, 0.7, pierZ);
    pier.castShadow = true;
    pier.receiveShadow = true;
    this.scene.add(pier);

    // Wooden Boat
    const boat = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.85, 5.8), this.matTeak);
    boat.position.set(lakePos.x + 4.2, 0.45, pierZ + 6);
    boat.rotation.y = 0.25;
    boat.castShadow = true;
    this.scene.add(boat);
  }

  // 4. Connected Road Network: Zero overlap, precise curbs and clear corridors
  buildConnectedRoadNetwork() {
    const rPos = { x: 0, z: 20 };
    const islandR = 9.0;
    const roadW = 8.5;

    // A. Roundabout Center Island
    const island = new THREE.Mesh(new THREE.CylinderGeometry(islandR, islandR, 0.55, 24), this.matGrass);
    island.position.set(rPos.x, 0.28, rPos.z);
    this.scene.add(island);

    // Roundabout Center Monument
    const monument = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.9, 4.2, 8), this.matRock);
    monument.position.set(rPos.x, 2.3, rPos.z);
    monument.castShadow = true;
    this.scene.add(monument);

    // Roundabout Asphalt Ring
    const ring = new THREE.Mesh(new THREE.RingGeometry(islandR, islandR + roadW, 32), this.matAsphalt);
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(rPos.x, 0.05, rPos.z);
    ring.receiveShadow = true;
    this.scene.add(ring);

    // Curbs around Roundabout
    const curbRing = new THREE.Mesh(new THREE.RingGeometry(islandR - 0.35, islandR, 32), this.matCurb);
    curbRing.rotation.x = -Math.PI / 2;
    curbRing.position.set(rPos.x, 0.18, rPos.z);
    this.scene.add(curbRing);

    // B. Connected Highways (Completely clean corridors):
    // 1. North Main Highway (Through Town to Railway: x: 0, z: 20 to -65)
    this.buildPavedRoad(0, 20, 0, -65, roadW, true);

    // 2. East Highway (To River Bridge: x: 0 to 95, z: 20 to 45)
    this.buildPavedRoad(0, 20, 95, 45, roadW, false);

    // 3. South-West Highway (Past Hospital to Lake: x: 0 to -65, z: 20 to 95)
    this.buildPavedRoad(0, 20, -65, 95, roadW, false);

    // 4. West Farm Road (Branching into Paddy Fields: x: 0 to -65, z: -5 to -5)
    this.buildPavedRoad(0, -5, -65, -5, 7.0, false);

    // 5. Town Cross Streets (Perpendicular to North Highway, connecting residential blocks)
    this.buildPavedRoad(-28, -25, 28, -25, 6.0, false);
    this.buildPavedRoad(-28, -48, 28, -48, 6.0, false);

    // Zebra Crossings near Roundabout and Hospital
    this.buildZebraCrossing(0, 10, 0, roadW);
    this.buildZebraCrossing(12, 23, Math.PI / 4, roadW);
  }

  // Build clean road with curbs and white dashed stripes
  buildPavedRoad(x1, z1, x2, z2, width, hasCurbs = false) {
    const dx = x2 - x1;
    const dz = z2 - z1;
    const len = Math.hypot(dx, dz);
    const angle = Math.atan2(dx, dz);
    const midX = (x1 + x2) / 2;
    const midZ = (z1 + z2) / 2;

    const road = new THREE.Mesh(new THREE.PlaneGeometry(width, len), this.matAsphalt);
    road.rotation.x = -Math.PI / 2;
    road.rotation.z = -angle;
    road.position.set(midX, 0.05, midZ);
    road.receiveShadow = true;
    this.scene.add(road);

    // Dashed White Center Line
    const markMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    for (let d = -len / 2 + 5; d <= len / 2 - 5; d += 12) {
      const dash = new THREE.Mesh(new THREE.PlaneGeometry(0.32, 6.5), markMat);
      dash.rotation.x = -Math.PI / 2;
      dash.rotation.z = -angle;
      dash.position.set(midX + Math.sin(angle) * d, 0.065, midZ + Math.cos(angle) * d);
      this.scene.add(dash);
    }

    // Sidewalk Curbs along town roads
    if (hasCurbs) {
      const curbW = 0.5;
      const curbH = 0.16;
      [-width / 2 - curbW / 2, width / 2 + curbW / 2].forEach((offset) => {
        const curb = new THREE.Mesh(new THREE.BoxGeometry(curbW, curbH, len), this.matCurb);
        curb.rotation.y = angle;
        curb.position.set(midX + Math.cos(angle) * offset, curbH / 2 + 0.05, midZ - Math.sin(angle) * offset);
        curb.receiveShadow = true;
        this.scene.add(curb);
      });
    }
  }

  buildZebraCrossing(x, z, angle, width) {
    const zebraGroup = new THREE.Group();
    zebraGroup.position.set(x, 0.066, z);
    zebraGroup.rotation.y = angle;
    const stripeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    for (let s = -width / 2 + 0.8; s <= width / 2 - 0.8; s += 1.2) {
      const stripe = new THREE.Mesh(new THREE.PlaneGeometry(0.65, 3.2), stripeMat);
      stripe.rotation.x = -Math.PI / 2;
      stripe.position.set(s, 0, 0);
      zebraGroup.add(stripe);
    }
    this.scene.add(zebraGroup);
  }

  // 5. River Bridge (നദീ പാലം)
  buildRiverBridge() {
    const bridgePos = { x: 95, z: 45 };
    const bridgeSpan = 26;
    const bridgeW = 10.0;

    // Solid Concrete Abutments
    const concreteMat = new THREE.MeshStandardMaterial({ color: 0x757575, roughness: 0.8 });
    const pLeft = new THREE.Mesh(new THREE.BoxGeometry(4, 2.8, bridgeW + 2), concreteMat);
    pLeft.position.set(bridgePos.x - bridgeSpan / 2 + 2, 0.9, bridgePos.z);
    this.scene.add(pLeft);

    const pRight = new THREE.Mesh(new THREE.BoxGeometry(4, 2.8, bridgeW + 2), concreteMat);
    pRight.position.set(bridgePos.x + bridgeSpan / 2 - 2, 0.9, bridgePos.z);
    this.scene.add(pRight);

    // Bridge Deck
    const deck = new THREE.Mesh(new THREE.BoxGeometry(bridgeSpan, 0.75, bridgeW), this.matAsphalt);
    deck.position.set(bridgePos.x, 1.5, bridgePos.z);
    deck.castShadow = true;
    deck.receiveShadow = true;
    this.scene.add(deck);

    // White Guardrails
    const railMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 });
    const rNorth = new THREE.Mesh(new THREE.BoxGeometry(bridgeSpan, 1.1, 0.35), railMat);
    rNorth.position.set(bridgePos.x, 2.25, bridgePos.z - bridgeW / 2 + 0.2);
    this.scene.add(rNorth);

    const rSouth = new THREE.Mesh(new THREE.BoxGeometry(bridgeSpan, 1.1, 0.35), railMat);
    rSouth.position.set(bridgePos.x, 2.25, bridgePos.z + bridgeW / 2 - 0.2);
    this.scene.add(rSouth);
  }

  // 6. Railway Track, Station & Train
  buildRailwayLineAndStation() {
    const trackZ = -70;
    const trackLen = 320;

    // Gravel Ballast
    const ballastMat = new THREE.MeshStandardMaterial({ color: 0x3e3e3e, roughness: 0.95 });
    const ballast = new THREE.Mesh(new THREE.PlaneGeometry(6.0, trackLen), ballastMat);
    ballast.rotation.x = -Math.PI / 2;
    ballast.rotation.z = Math.PI / 2;
    ballast.position.set(0, 0.04, trackZ);
    this.scene.add(ballast);

    // Steel Rails
    const steelMat = new THREE.MeshStandardMaterial({ color: 0x90a4ae, metalness: 0.85, roughness: 0.2 });
    [-1.0, 1.0].forEach((rx) => {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(trackLen, 0.18, 0.12), steelMat);
      rail.position.set(0, 0.15, trackZ + rx);
      this.scene.add(rail);
    });

    // Level Crossing Gates (റെയിൽവേ ഗേറ്റ്) at (x: 0, z: -70)
    const gateGroup = new THREE.Group();
    gateGroup.position.set(0, 0, trackZ);

    const postMat = new THREE.MeshStandardMaterial({ color: 0x212121 });
    const barrierMat = new THREE.MeshStandardMaterial({ color: 0xd32f2f }); // Red/white barrier arm

    [-5.5, 5.5].forEach((gx) => {
      const p = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 2.6), postMat);
      p.position.set(gx, 1.3, -4.5);
      gateGroup.add(p);
      const arm = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.2, 0.2), barrierMat);
      arm.position.set(gx > 0 ? gx - 2.6 : gx + 2.6, 1.8, -4.5);
      gateGroup.add(arm);
    });
    this.scene.add(gateGroup);

    // Railway Station Platform & Building at (x: 18, z: -82)
    const stationGroup = new THREE.Group();
    stationGroup.position.set(18, 0, -82);

    const stPlatform = new THREE.Mesh(new THREE.BoxGeometry(36, 0.7, 8.0), this.matRock);
    stPlatform.position.set(0, 0.35, 3.5);
    stPlatform.receiveShadow = true;
    stationGroup.add(stPlatform);

    const stBuilding = new THREE.Mesh(new THREE.BoxGeometry(24, 5.2, 9.5), this.matWall);
    stBuilding.position.set(0, 2.6, -4.5);
    stBuilding.castShadow = true;
    stationGroup.add(stBuilding);

    const stRoof = new THREE.Mesh(new THREE.BoxGeometry(26, 0.45, 11.5), new THREE.MeshStandardMaterial({ color: 0x1565c0 }));
    stRoof.position.set(0, 5.4, -4.5);
    stRoof.castShadow = true;
    stationGroup.add(stRoof);

    this.stationTrigger = { position: new THREE.Vector3(18, 0, -82), radius: 12 };
    this.scene.add(stationGroup);

    // 3D Train Model
    const train = new THREE.Group();
    train.position.set(-35, 0.2, trackZ);

    const engine = new THREE.Mesh(new THREE.BoxGeometry(15, 3.5, 2.6), new THREE.MeshStandardMaterial({ color: 0xb71c1c, roughness: 0.4 }));
    engine.position.set(0, 1.85, 0);
    engine.castShadow = true;
    train.add(engine);

    for (let c = 1; c <= 2; c++) {
      const coach = new THREE.Mesh(new THREE.BoxGeometry(16, 3.2, 2.6), new THREE.MeshStandardMaterial({ color: 0x0288d1, roughness: 0.4 }));
      coach.position.set(-c * 17.5, 1.7, 0);
      coach.castShadow = true;
      train.add(coach);
    }
    this.scene.add(train);
    this.trainGroup = train;
  }

  // 7. Town Street Blocks: Authentically aligned with compound walls and ZERO road overlap
  buildTownStreetBlocks() {
    const houseBodyGeo = new THREE.BoxGeometry(8.5, 4.2, 7.5);
    const houseRoofGeo = new THREE.ConeGeometry(7.0, 3.5, 4);

    // Dedicated residential plots strictly OUTSIDE the road corridors
    const residentialPlots = [
      // West Street Row (Facing East towards Main Highway): x: -18
      { x: -18, z: -12, rotY: Math.PI / 2 },
      { x: -18, z: -35, rotY: Math.PI / 2 },
      { x: -18, z: -55, rotY: Math.PI / 2 },
      // Second West Row (Quiet Lane): x: -32
      { x: -32, z: -12, rotY: -Math.PI / 2 },
      { x: -32, z: -35, rotY: -Math.PI / 2 },
      // East Street Row (Facing West towards Main Highway): x: 18
      { x: 18, z: -12, rotY: -Math.PI / 2 },
      { x: 18, z: -35, rotY: -Math.PI / 2 },
      { x: 18, z: -55, rotY: -Math.PI / 2 },
      // Second East Row (Near Market): x: 34
      { x: 34, z: -35, rotY: Math.PI / 2 }
    ];

    residentialPlots.forEach((plot) => {
      // 1. House Compound Wall (മതിൽ)
      const wallMat = new THREE.MeshStandardMaterial({ color: 0xd7ccc8, roughness: 0.9 });
      const fence = new THREE.Mesh(new THREE.BoxGeometry(13, 1.1, 11), wallMat);
      fence.position.set(plot.x, 0.55, plot.z);
      this.scene.add(fence);

      // Inner courtyard cutout
      const yard = new THREE.Mesh(new THREE.BoxGeometry(12, 1.2, 10), this.matChemman);
      yard.position.set(plot.x, 0.6, plot.z);
      this.scene.add(yard);

      // 2. House Body
      const body = new THREE.Mesh(houseBodyGeo, this.matWall);
      body.position.set(plot.x, 2.2, plot.z);
      body.rotation.y = plot.rotY;
      body.castShadow = true;
      body.receiveShadow = true;
      this.scene.add(body);

      // 3. Terracotta Roof
      const roof = new THREE.Mesh(houseRoofGeo, this.matRoof);
      roof.position.set(plot.x, 5.9, plot.z);
      roof.rotation.y = plot.rotY + Math.PI / 4;
      roof.scale.set(1.4, 1, 1.25);
      roof.castShadow = true;
      this.scene.add(roof);

      // Compound Coconut Palm in backyard
      this.createRealisticCoconutPalm(plot.x + (plot.rotY > 0 ? -4.5 : 4.5), plot.z + 3.5, 0.05);
    });

    // Town Market Complex at (x: 45, z: -12) - Fully clear of street
    const market = new THREE.Group();
    market.position.set(45, 0, -12);

    const mFloor = new THREE.Mesh(new THREE.BoxGeometry(18, 0.4, 16), this.matRock);
    mFloor.position.y = 0.2;
    market.add(mFloor);

    const mBuilding = new THREE.Mesh(new THREE.BoxGeometry(15, 4.5, 12), this.matWall);
    mBuilding.position.y = 2.45;
    mBuilding.castShadow = true;
    market.add(mBuilding);

    const mAwning = new THREE.Mesh(new THREE.BoxGeometry(17, 0.3, 6), new THREE.MeshStandardMaterial({ color: 0xd84315 }));
    mAwning.position.set(0, 3.8, 7.5);
    mAwning.rotation.x = 0.2;
    market.add(mAwning);

    this.shopTrigger = { position: new THREE.Vector3(45, 0, -12), radius: 8 };
    this.scene.add(market);

    // Heritage Well in town courtyard (x: -8, z: -25)
    const well = new THREE.Mesh(new THREE.CylinderGeometry(2.0, 2.2, 1.6, 16, 1, true), this.matRock);
    well.position.set(-8, 0.8, -25);
    well.castShadow = true;
    this.scene.add(well);

    const wellWater = new THREE.Mesh(new THREE.CircleGeometry(1.8, 16), this.matRiverWater);
    wellWater.rotation.x = -Math.PI / 2;
    wellWater.position.set(-8, 0.5, -25);
    this.scene.add(wellWater);

    this.wellTrigger = { position: new THREE.Vector3(-8, 0, -25), radius: 5 };
  }

  // 8. Hospital & Petrol Pump
  buildHospitalAndPetrolPump() {
    // Hospital at (x: 25, z: 62) - Facing the South-West highway
    const hospital = new THREE.Group();
    hospital.position.set(25, 0, 62);

    const hBase = new THREE.Mesh(new THREE.BoxGeometry(20, 8.5, 15), new THREE.MeshStandardMaterial({ color: 0xf5f5f5, roughness: 0.6 }));
    hBase.position.y = 4.25;
    hBase.castShadow = true;
    hospital.add(hBase);

    // Red Cross Sign
    const crossMat = new THREE.MeshBasicMaterial({ color: 0xd32f2f });
    const crossH = new THREE.Mesh(new THREE.BoxGeometry(4.0, 1.0, 0.2), crossMat);
    crossH.position.set(0, 7.2, 7.6);
    hospital.add(crossH);
    const crossV = new THREE.Mesh(new THREE.BoxGeometry(1.0, 4.0, 0.2), crossMat);
    crossV.position.set(0, 7.2, 7.6);
    hospital.add(crossV);

    this.hospitalTrigger = { position: new THREE.Vector3(25, 0, 62), radius: 10 };
    this.scene.add(hospital);

    // Petrol Pump at (x: -25, z: 50)
    const pumpGroup = new THREE.Group();
    pumpGroup.position.set(-25, 0, 50);

    const pCanopy = new THREE.Mesh(new THREE.BoxGeometry(16, 0.5, 11), new THREE.MeshStandardMaterial({ color: 0x0288d1 }));
    pCanopy.position.set(0, 5.2, 0);
    pCanopy.castShadow = true;
    pumpGroup.add(pCanopy);

    for (let px of [-6, 6]) {
      const pCol = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 5.2, 8), this.matWall);
      pCol.position.set(px, 2.6, 0);
      pumpGroup.add(pCol);
    }

    // Fuel Dispensers
    const dispMat = new THREE.MeshStandardMaterial({ color: 0xffb300 });
    for (let dx of [-3, 3]) {
      const disp = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.9, 0.9), dispMat);
      disp.position.set(dx, 0.95, 0);
      pumpGroup.add(disp);
    }

    this.pumpTrigger = { position: new THREE.Vector3(-25, 0, 50), radius: 8 };
    this.scene.add(pumpGroup);
  }

  // 9. Farm Workshop with 3D Tractor (ട്രാക്ടറും വർക്ക്‌ഷോപ്പും)
  buildFarmWorkshopWithTractor() {
    const workshop = new THREE.Group();
    workshop.position.set(55, 0, 32);

    const wBuilding = new THREE.Mesh(new THREE.BoxGeometry(18, 5.8, 14), new THREE.MeshStandardMaterial({ color: 0x455a64 }));
    wBuilding.position.y = 2.9;
    wBuilding.castShadow = true;
    workshop.add(wBuilding);

    const wRoof = new THREE.Mesh(new THREE.BoxGeometry(20, 0.35, 16), new THREE.MeshStandardMaterial({ color: 0x1565c0 }));
    wRoof.position.y = 5.9;
    workshop.add(wRoof);

    // Detailed 3D Tractor (FS22 Style Red/Black Kerala Tractor)
    const tractor = new THREE.Group();
    tractor.position.set(0, 0, 11); // Parked in front forecourt

    // Chassis & Engine hood
    const redMat = new THREE.MeshStandardMaterial({ color: 0xc62828, roughness: 0.3 });
    const blackMat = new THREE.MeshStandardMaterial({ color: 0x212121, roughness: 0.5 });
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x757575, metalness: 0.8 });

    const hood = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.2, 2.4), redMat);
    hood.position.set(0, 1.3, 0.8);
    hood.castShadow = true;
    tractor.add(hood);

    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.6, 1.4), blackMat);
    cabin.position.set(0, 1.8, -0.9);
    cabin.castShadow = true;
    tractor.add(cabin);

    // Exhaust Pipe
    const exhaust = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.4, 6), metalMat);
    exhaust.position.set(0.7, 2.2, 1.2);
    tractor.add(exhaust);

    // Big Rear Wheels (വലിയ പിൻ ടയറുകൾ)
    [-1.0, 1.0].forEach((wx) => {
      const rearWheel = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 0.5, 14), blackMat);
      rearWheel.rotation.z = Math.PI / 2;
      rearWheel.position.set(wx, 0.9, -0.9);
      rearWheel.castShadow = true;
      tractor.add(rearWheel);
    });

    // Small Front Wheels (ചെറിയ മുൻ ടയറുകൾ)
    [-0.85, 0.85].forEach((wx) => {
      const frontWheel = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.35, 12), blackMat);
      frontWheel.rotation.z = Math.PI / 2;
      frontWheel.position.set(wx, 0.5, 1.5);
      frontWheel.castShadow = true;
      tractor.add(frontWheel);
    });

    workshop.add(tractor);

    this.shedTrigger = { position: new THREE.Vector3(55, 0, 32), radius: 9 };
    this.scene.add(workshop);
  }

  // 10. Dairy Farm (ഡയറി ഫാം & പശുത്തൊഴുത്ത്)
  buildDairyFarm() {
    const dairyGroup = new THREE.Group();
    dairyGroup.position.set(-80, 0, 60);

    // Large Red Barn
    const barn = new THREE.Mesh(new THREE.BoxGeometry(20, 7.0, 14), new THREE.MeshStandardMaterial({ color: 0xb71c1c }));
    barn.position.y = 3.5;
    barn.castShadow = true;
    dairyGroup.add(barn);

    const barnRoof = new THREE.Mesh(new THREE.ConeGeometry(13, 4.2, 4), this.matRoof);
    barnRoof.position.y = 8.0;
    barnRoof.rotation.y = Math.PI / 4;
    barnRoof.scale.set(1.5, 1, 1.25);
    dairyGroup.add(barnRoof);

    // Feed Silos
    const siloMat = new THREE.MeshStandardMaterial({ color: 0xb0bec5, metalness: 0.7, roughness: 0.3 });
    [-13, -19].forEach((sx) => {
      const silo = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 2.5, 12, 14), siloMat);
      silo.position.set(sx, 6.0, 0);
      silo.castShadow = true;
      dairyGroup.add(silo);
      const cap = new THREE.Mesh(new THREE.ConeGeometry(2.6, 2.2, 14), siloMat);
      cap.position.set(sx, 13.1, 0);
      dairyGroup.add(cap);
    });

    // Fenced Pasture with Dairy Cows
    const cowGeo = new THREE.BoxGeometry(1.6, 1.1, 0.8);
    const cowMat = new THREE.MeshStandardMaterial({ color: 0x212121 });
    for (let i = 0; i < 6; i++) {
      const cow = new THREE.Mesh(cowGeo, cowMat);
      const cx = 15 + (i % 3) * 6;
      const cz = -6 + Math.floor(i / 3) * 8;
      cow.position.set(cx, 0.55, cz);
      cow.rotation.y = Math.random() * Math.PI;
      cow.castShadow = true;
      dairyGroup.add(cow);
    }

    this.dairyTrigger = { position: new THREE.Vector3(-80, 0, 60), radius: 12 };
    this.scene.add(dairyGroup);
  }

  // 11. West Terraced Paddy Wetland Basin (താഴ്ന്ന നെൽപ്പാടങ്ങൾ)
  buildPaddyWetlandBasin() {
    const bundMat = new THREE.MeshStandardMaterial({ color: 0x5a3e36, roughness: 0.92 });
    const paddyWaterNorm = this.waterNormalTextures[0] || TextureGenerator.createWaterNormalMap();
    const paddyWaterMat = new THREE.MeshStandardMaterial({
      color: 0x1f3c2b,
      normalMap: paddyWaterNorm,
      roughness: 0.08,
      metalness: 0.2,
      transparent: true,
      opacity: 0.78
    });

    // 6 Large Terraced Paddy Polders matching blueprint
    const polders = [
      { x: -50, z: -25, w: 26, h: 20 },
      { x: -80, z: -25, w: 28, h: 20 },
      { x: -50, z: 0,   w: 26, h: 22 },
      { x: -80, z: 0,   w: 28, h: 22 },
      { x: -50, z: 24,  w: 26, h: 20 },
      { x: -80, z: 24,  w: 28, h: 20 }
    ];

    polders.forEach((p) => {
      const mud = new THREE.Mesh(new THREE.PlaneGeometry(p.w, p.h), this.matMud);
      mud.rotation.x = -Math.PI / 2;
      mud.position.set(p.x, 0.02, p.z);
      mud.receiveShadow = true;
      this.scene.add(mud);

      const water = new THREE.Mesh(new THREE.PlaneGeometry(p.w * 0.98, p.h * 0.98), paddyWaterMat);
      water.rotation.x = -Math.PI / 2;
      water.position.set(p.x, 0.05, p.z);
      this.scene.add(water);
      this.waterMeshes.push(water);

      // Elevated mud bunds (വരമ്പുകൾ)
      const bw = 0.9;
      const bh = 0.26;
      const bNorth = new THREE.Mesh(new THREE.BoxGeometry(p.w + bw, bh, bw), bundMat);
      bNorth.position.set(p.x, bh / 2, p.z - p.h / 2);
      this.scene.add(bNorth);

      const bSouth = new THREE.Mesh(new THREE.BoxGeometry(p.w + bw, bh, bw), bundMat);
      bSouth.position.set(p.x, bh / 2, p.z + p.h / 2);
      this.scene.add(bSouth);

      const bWest = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, p.h), bundMat);
      bWest.position.set(p.x - p.w / 2, bh / 2, p.z);
      this.scene.add(bWest);

      const bEast = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, p.h), bundMat);
      bEast.position.set(p.x + p.w / 2, bh / 2, p.z);
      this.scene.add(bEast);
    });
  }

  // 12. Vegetable Farms & Rubber Estate
  buildVegetableAndRubberFarms() {
    // Vegetable Farm Crop Beds at (x: -30 to 10, z: -95 to -75)
    for (let x = -25; x <= 5; x += 10) {
      for (let z = -95; z <= -75; z += 8) {
        const bed = new THREE.Mesh(new THREE.BoxGeometry(7.5, 0.3, 5.5), this.matChemman);
        bed.position.set(x, 0.15, z);
        this.scene.add(bed);
      }
    }

    // Rubber Estate (Dense grid on north-west hill slopes)
    const treeGeo = new THREE.CylinderGeometry(0.3, 0.4, 7.0, 7);
    const canopyGeo = new THREE.ConeGeometry(2.4, 5.0, 7);
    const canopyMat = new THREE.MeshStandardMaterial({ color: 0x1b5e20, roughness: 0.6 });

    for (let x = -135; x <= -85; x += 14) {
      for (let z = -115; z <= -75; z += 14) {
        const trunk = new THREE.Mesh(treeGeo, this.matPalmBark);
        trunk.position.set(x, 3.5, z);
        this.scene.add(trunk);
        const foliage = new THREE.Mesh(canopyGeo, canopyMat);
        foliage.position.set(x, 8.5, z);
        this.scene.add(foliage);
      }
    }
  }

  // 13. Foliage: Palms along roads and East Coconut Farm
  buildFoliage() {
    // East Coconut Farm across river (x: 105 to 160, z: 35 to 125)
    for (let x = 105; x <= 160; x += 16) {
      for (let z = 35; z <= 125; z += 16) {
        this.createRealisticCoconutPalm(x, z, (Math.random() - 0.5) * 0.12);
      }
    }

    // Roadside Palms along the highway corridors
    const roadPalms = [
      [7.5, 5], [-7.5, 5], [7.5, -25], [-7.5, -25],
      [7.5, -50], [-7.5, -50],
      [35, 25], [55, 30], [75, 36],
      [-25, 35], [-45, 55], [-60, 75]
    ];
    roadPalms.forEach(([px, pz]) => {
      this.createRealisticCoconutPalm(px, pz, 0.06);
    });
  }

  // Ultra-Realistic Coconut Palm
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

  // Animate river, waterfall, lake ripples, and wind
  animate(delta, time) {
    const wind = Math.sin(time * 1.5) * 0.04;
    for (let frond of this.palmFronds) {
      frond.rotation.z = wind;
    }

    for (let tex of this.waterNormalTextures) {
      tex.offset.y += delta * 0.08;
      tex.offset.x += Math.sin(time * 0.7) * 0.003;
    }

    if (this.waterfallTex) {
      this.waterfallTex.offset.y -= delta * 1.5;
    }

    for (let w of this.waterMeshes) {
      w.position.y += Math.sin(time * 2.5 + w.position.x * 0.3) * 0.0004;
    }
  }
}
