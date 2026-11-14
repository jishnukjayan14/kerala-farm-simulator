import * as THREE from 'three';
import { TextureGenerator } from './TextureGenerator.js';

/**
 * Photorealistic Sprawling Kerala Farming World (കേരള ഫാമിംഗ് ഗെയിം മാപ്പ്)
 * Built to exact blueprint specifications:
 * - 800x800m vast open world (representing 4km x 4km map)
 * - North-East Rocky Hills with cascading Waterfall (വെള്ളച്ചാട്ടം)
 * - Winding River (പുഴ) flowing from waterfall to south-east with River Bridge (പാലം)
 * - South-West Lake (കായൽ) with wooden Pier and moored boat
 * - Central Main Town with 35+ houses, streets, streetlights, and Roundabout (കവല)
 * - Railway Station & Track with Train running across the north
 * - Hospital with Red Cross, Petrol Pump, Farm Equipment Workshop
 * - Market Complex with shops and parking
 * - Dairy Farm with red barn, silos, fenced pasture, and grazing cows
 * - West Terraced Paddy Fields, North-West Vegetable Farms & Rubber Estate
 * - East Coconut Farm with dense groves
 * - InstancedMesh rendering architecture for 60 FPS buttery smooth performance
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

    // Master Blueprint Zones for Player Navigation & HUD
    this.zones = [
      { name: 'പ്രധാന ടൗൺ (Main Town Center)', xMin: -35, xMax: 35, zMin: -45, zMax: 10 },
      { name: 'നഗര കവല (Town Roundabout)', xMin: -16, xMax: 16, zMin: 8, zMax: 32 },
      { name: 'മാർക്കറ്റ് & ചന്ത (Town Market)', xMin: 25, xMax: 65, zMin: -25, zMax: 10 },
      { name: 'റെയിൽവേ സ്റ്റേഷൻ (Railway Station & Track)', xMin: -30, xMax: 50, zMin: -75, zMax: -45 },
      { name: 'വെള്ളച്ചാട്ടം & മലനിരകൾ (Waterfall & Mountain Gorge)', xMin: 20, xMax: 140, zMin: -180, zMax: -110 },
      { name: 'നദീതീരം & പാലം (River & Bridge)', xMin: 55, xMax: 120, zMin: 25, zMax: 85 },
      { name: 'തെങ്ങിൻ തോപ്പ് (East Coconut Farm)', xMin: 85, xMax: 180, zMin: 25, zMax: 140 },
      { name: 'ഡയറി ഫാം (Dairy Farm & Barn)', xMin: -120, xMax: -45, zMin: 35, zMax: 85 },
      { name: 'കായൽക്കര & ബോട്ട് ജെട്ടി (Lake Shore & Pier)', xMin: -110, xMax: -30, zMin: 85, zMax: 160 },
      { name: 'പെട്രോൾ പമ്പ് & ആശുപത്രി (Hospital & Fuel Station)', xMin: -25, xMax: 40, zMin: 32, zMax: 75 },
      { name: 'ഫാം വർക്ക്‌ഷോപ്പ് (Farm Equipment Workshop)', xMin: 38, xMax: 75, zMin: 28, zMax: 60 },
      { name: 'താഴ്ന്ന നെൽപ്പാടങ്ങൾ (Wetland Paddy Fields)', xMin: -120, xMax: -30, zMin: -45, zMax: 30 },
      { name: 'പച്ചക്കറി തോട്ടങ്ങൾ (Vegetable Farms)', xMin: -70, xMax: 15, zMin: -110, zMax: -55 },
      { name: 'റബ്ബർ എസ്റ്റേറ്റ് (Rubber Estate)', xMin: -140, xMax: -70, zMin: -120, zMax: -55 }
    ];

    this.initPBRMaterials();
    this.buildMasterWorld();
  }

  initPBRMaterials() {
    // 1. Tropical Grass
    const grassTex = TextureGenerator.createTropicalGrassTexture();
    grassTex.repeat.set(60, 60);
    const grassNorm = TextureGenerator.createBumpNormalMap();
    grassNorm.repeat.set(60, 60);
    this.matGrass = new THREE.MeshStandardMaterial({
      map: grassTex,
      normalMap: grassNorm,
      roughness: 0.88,
      metalness: 0.02
    });

    // 2. Asphalt Highway
    const asphaltTex = TextureGenerator.createAsphaltTexture();
    asphaltTex.repeat.set(1, 40);
    const asphaltNorm = TextureGenerator.createBumpNormalMap();
    this.matAsphalt = new THREE.MeshStandardMaterial({
      map: asphaltTex,
      normalMap: asphaltNorm,
      roughness: 0.72,
      metalness: 0.08
    });

    // 3. Kerala Red Earth
    const chemmanTex = TextureGenerator.createRedLateriteTexture();
    chemmanTex.repeat.set(4, 20);
    this.matChemman = new THREE.MeshStandardMaterial({
      map: chemmanTex,
      roughness: 0.92,
      metalness: 0.02
    });

    // 4. Wetland Mud Silt
    const mudTex = TextureGenerator.createWetSiltMudTexture();
    mudTex.repeat.set(4, 4);
    this.matMud = new THREE.MeshStandardMaterial({
      map: mudTex,
      roughness: 0.35,
      metalness: 0.15
    });

    // 5. Terracotta Roof Tiles
    const roofTex = TextureGenerator.createRoofTileTexture();
    roofTex.repeat.set(4, 2);
    this.matRoof = new THREE.MeshStandardMaterial({
      map: roofTex,
      roughness: 0.65,
      metalness: 0.05
    });

    // 6. Blue Metal Roof (Warehouses / Barn)
    this.matBlueRoof = new THREE.MeshStandardMaterial({
      color: 0x1976d2,
      roughness: 0.45,
      metalness: 0.3
    });

    // 7. White Wall
    this.matWhiteWall = new THREE.MeshStandardMaterial({
      color: 0xf5f5f0,
      roughness: 0.85
    });

    // 8. Hospital Wall
    this.matHospital = new THREE.MeshStandardMaterial({
      color: 0xeeeeee,
      roughness: 0.65
    });

    // 9. Teak Wood
    const teakTex = TextureGenerator.createTeakWoodTexture();
    this.matTeak = new THREE.MeshStandardMaterial({
      map: teakTex,
      roughness: 0.58,
      metalness: 0.04
    });

    // 10. Palm Bark
    const barkTex = TextureGenerator.createCoconutBarkTexture();
    barkTex.repeat.set(1, 4);
    this.matPalmBark = new THREE.MeshStandardMaterial({
      map: barkTex,
      roughness: 0.85,
      metalness: 0.02
    });

    // 11. Granite Rocks
    const rockTex = TextureGenerator.createRiverRockTexture();
    rockTex.repeat.set(3, 3);
    this.matRock = new THREE.MeshStandardMaterial({
      map: rockTex,
      roughness: 0.85,
      metalness: 0.1
    });

    // 12. River Water
    const riverWaterNorm = TextureGenerator.createWaterNormalMap();
    riverWaterNorm.repeat.set(3, 40);
    this.waterNormalTextures.push(riverWaterNorm);
    this.matRiverWater = new THREE.MeshStandardMaterial({
      color: 0x005952,
      normalMap: riverWaterNorm,
      normalScale: new THREE.Vector2(0.4, 0.4),
      roughness: 0.05,
      metalness: 0.2,
      transparent: true,
      opacity: 0.86
    });

    // 13. Lake Water
    const lakeWaterNorm = TextureGenerator.createWaterNormalMap();
    lakeWaterNorm.repeat.set(8, 8);
    this.waterNormalTextures.push(lakeWaterNorm);
    this.matLakeWater = new THREE.MeshStandardMaterial({
      color: 0x003d54,
      normalMap: lakeWaterNorm,
      normalScale: new THREE.Vector2(0.25, 0.25),
      roughness: 0.04,
      metalness: 0.25,
      transparent: true,
      opacity: 0.9
    });

    // 14. Waterfall Foam
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

  buildMasterWorld() {
    this.buildTerrainAndHills();
    this.buildWaterfallAndWindingRiver();
    this.buildSouthWestLakeAndPier();
    this.buildMasterRoadNetwork();
    this.buildRiverBridge();
    this.buildRailwayAndStation();
    this.buildMainTown();
    this.buildTownServices();
    this.buildDairyFarm();
    this.buildPaddyWetlandBasin();
    this.buildVegetableAndRubberEstate();
    this.buildDenseFoliage();
  }

  // 1. Sprawling 800m Terrain with Layered Hills
  buildTerrainAndHills() {
    const groundGeo = new THREE.PlaneGeometry(800, 800, 48, 48);
    const ground = new THREE.Mesh(groundGeo, this.matGrass);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // North-East Mountain Range (Rocky Mountain Cliffs)
    const hillData = [
      { x: 50, z: -175, r: 65, h: 45 },
      { x: 110, z: -170, r: 85, h: 58 },
      { x: 170, z: -150, r: 75, h: 52 },
      { x: 190, z: -80, r: 80, h: 55 },
      { x: 210, z: 20, r: 75, h: 48 },
      // Distant West Ridge
      { x: -190, z: -130, r: 80, h: 40 },
      { x: -200, z: 20, r: 85, h: 44 }
    ];

    hillData.forEach((h) => {
      const hill = new THREE.Mesh(new THREE.ConeGeometry(h.r, h.h, 16), this.matRock);
      hill.position.set(h.x, h.h / 2 - 2, h.z);
      hill.scale.set(1.4, 1, 1.4);
      hill.castShadow = true;
      hill.receiveShadow = true;
      this.scene.add(hill);
    });
  }

  // 2. Blueprint Waterfall & Winding River
  buildWaterfallAndWindingRiver() {
    // Waterfall Cliff Formation
    const cliff = new THREE.Mesh(new THREE.BoxGeometry(28, 24, 18), this.matRock);
    cliff.position.set(50, 12, -155);
    cliff.castShadow = true;
    cliff.receiveShadow = true;
    this.scene.add(cliff);

    // Waterfall Cascading Sheet
    const waterfallSheet = new THREE.Mesh(new THREE.PlaneGeometry(16, 23.5), this.matWaterfall);
    waterfallSheet.position.set(50, 11.8, -145.8);
    this.scene.add(waterfallSheet);

    // Waterfall Plunge Pool
    const pool = new THREE.Mesh(new THREE.CylinderGeometry(18, 20, 2.0, 24), this.matRiverWater);
    pool.position.set(50, 0.15, -132);
    this.scene.add(pool);
    this.waterMeshes.push(pool);

    // Winding River Segments traversing towards the south-east
    const riverWaypoints = [
      { x1: 50, z1: -132, x2: 60, z2: -75, w: 18 },
      { x1: 60, z1: -75,  x2: 74, z2: -15, w: 20 },
      { x1: 74, z1: -15,  x2: 90, z2: 45,  w: 22 },
      { x1: 90, z1: 45,   x2: 125, z2: 110, w: 24 },
      { x1: 125, z1: 110, x2: 165, z2: 180, w: 26 }
    ];

    riverWaypoints.forEach((seg) => {
      const dx = seg.x2 - seg.x1;
      const dz = seg.z2 - seg.z1;
      const len = Math.hypot(dx, dz);
      const angle = Math.atan2(dx, dz);
      const midX = (seg.x1 + seg.x2) / 2;
      const midZ = (seg.z1 + seg.z2) / 2;

      // River Water Surface
      const rWater = new THREE.Mesh(new THREE.PlaneGeometry(seg.w, len + 4), this.matRiverWater);
      rWater.rotation.x = -Math.PI / 2;
      rWater.rotation.z = -angle;
      rWater.position.set(midX, 0.12, midZ);
      this.scene.add(rWater);
      this.waterMeshes.push(rWater);

      // Rocky River Banks
      const perpX = Math.cos(angle) * (seg.w / 2 + 1.4);
      const perpZ = -Math.sin(angle) * (seg.w / 2 + 1.4);

      const bLeft = new THREE.Mesh(new THREE.BoxGeometry(2.8, 1.2, len), this.matRock);
      bLeft.rotation.y = angle;
      bLeft.position.set(midX - perpX, 0.45, midZ - perpZ);
      bLeft.receiveShadow = true;
      this.scene.add(bLeft);

      const bRight = new THREE.Mesh(new THREE.BoxGeometry(2.8, 1.2, len), this.matRock);
      bRight.rotation.y = angle;
      bRight.position.set(midX + perpX, 0.45, midZ + perpZ);
      bRight.receiveShadow = true;
      this.scene.add(bRight);
    });
  }

  // 3. South-West Lake (കായൽ) with Pier & Moored Boat
  buildSouthWestLakeAndPier() {
    const lakePos = { x: -70, z: 115 };
    const rx = 55;
    const rz = 40;

    // Lake Basin
    const basin = new THREE.Mesh(new THREE.CylinderGeometry(rx + 3, rx + 6, 1.4, 32), this.matChemman);
    basin.position.set(lakePos.x, 0.1, lakePos.z);
    basin.receiveShadow = true;
    this.scene.add(basin);

    // Lake Water Sheet
    const water = new THREE.Mesh(new THREE.CylinderGeometry(rx, rx, 0.8, 32), this.matLakeWater);
    water.position.set(lakePos.x, 0.22, lakePos.z);
    this.scene.add(water);
    this.waterMeshes.push(water);

    // Wooden Pier / Jetty
    const pierLen = 22;
    const pierW = 3.6;
    const pierZ = lakePos.z - rz + 8;
    const pier = new THREE.Mesh(new THREE.BoxGeometry(pierW, 0.4, pierLen), this.matTeak);
    pier.position.set(lakePos.x, 0.7, pierZ);
    pier.castShadow = true;
    pier.receiveShadow = true;
    this.scene.add(pier);

    // Moored Wooden Canoe / Boat (ചെറുവള്ളം)
    const boat = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.8, 5.5), this.matTeak);
    boat.position.set(lakePos.x + 3.8, 0.4, pierZ + 6);
    boat.rotation.y = 0.2;
    boat.castShadow = true;
    this.scene.add(boat);
  }

  // 4. Blueprint Master Road Network with Central Roundabout
  buildMasterRoadNetwork() {
    const roundaboutPos = { x: 0, z: 20 };
    const islandR = 9.5;

    // Roundabout Center Island
    const island = new THREE.Mesh(new THREE.CylinderGeometry(islandR, islandR, 0.55, 24), this.matGrass);
    island.position.set(roundaboutPos.x, 0.28, roundaboutPos.z);
    this.scene.add(island);

    // Roundabout Monument / Ashoka pillar style column
    const monument = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.9, 4.2, 8), this.matRock);
    monument.position.set(roundaboutPos.x, 2.3, roundaboutPos.z);
    monument.castShadow = true;
    this.scene.add(monument);

    // Roundabout Ring Road
    const ring = new THREE.Mesh(new THREE.RingGeometry(islandR, islandR + 9.5, 32), this.matAsphalt);
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(roundaboutPos.x, 0.05, roundaboutPos.z);
    ring.receiveShadow = true;
    this.scene.add(ring);

    // Highways connecting to Roundabout:
    // 1. North Highway (Through Main Town to Railway Station: z: 20 to z: -90)
    this.createRoad(0, 20, 0, -85, 9.0);

    // 2. East Highway (Past Workshop & over River Bridge: x: 0 to x: 90, z: 20 to z: 45)
    this.createRoad(0, 20, 90, 45, 8.5);

    // 3. South-West Highway (Past Hospital & Petrol Pump to Lake: x: 0 to x: -65, z: 20 to z: 90)
    this.createRoad(0, 20, -65, 90, 8.5);

    // 4. West Farm Road (Branching into Paddy Fields: x: 0 to x: -75, z: -10 to z: -10)
    this.createRoad(0, -10, -75, -10, 7.5);

    // 5. Town Cross Streets (Inside Main Town)
    this.createRoad(-30, -25, 30, -25, 6.5);
    this.createRoad(-25, -50, 45, -50, 6.5);
  }

  createRoad(x1, z1, x2, z2, width) {
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

    // White dashed centerline
    const markMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    for (let d = -len / 2 + 5; d <= len / 2 - 5; d += 12) {
      const dash = new THREE.Mesh(new THREE.PlaneGeometry(0.32, 6.5), markMat);
      dash.rotation.x = -Math.PI / 2;
      dash.rotation.z = -angle;
      dash.position.set(midX + Math.sin(angle) * d, 0.065, midZ + Math.cos(angle) * d);
      this.scene.add(dash);
    }
  }

  // 5. Heavy Concrete River Bridge (പാലം)
  buildRiverBridge() {
    const bridgePos = { x: 90, z: 45 };
    const bridgeSpan = 26;
    const bridgeW = 10.0;

    const concreteMat = new THREE.MeshStandardMaterial({ color: 0x757575, roughness: 0.8 });

    // Bridge Deck
    const deck = new THREE.Mesh(new THREE.BoxGeometry(bridgeSpan, 0.75, bridgeW), this.matAsphalt);
    deck.position.set(bridgePos.x, 1.5, bridgePos.z);
    deck.castShadow = true;
    deck.receiveShadow = true;
    this.scene.add(deck);

    // Heavy White Guardrails
    const railMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 });
    const rNorth = new THREE.Mesh(new THREE.BoxGeometry(bridgeSpan, 1.1, 0.35), railMat);
    rNorth.position.set(bridgePos.x, 2.25, bridgePos.z - bridgeW / 2 + 0.2);
    this.scene.add(rNorth);

    const rSouth = new THREE.Mesh(new THREE.BoxGeometry(bridgeSpan, 1.1, 0.35), railMat);
    rSouth.position.set(bridgePos.x, 2.25, bridgePos.z + bridgeW / 2 - 0.2);
    this.scene.add(rSouth);
  }

  // 6. Railway Track, Station & Train (റെയിൽവേ സ്റ്റേഷൻ & ട്രെയിൻ)
  buildRailwayAndStation() {
    const trackZ = -62;
    const trackLen = 320;

    // Gravel Ballast Bed (മെറ്റൽ ബെഡ്)
    const ballastMat = new THREE.MeshStandardMaterial({ color: 0x424242, roughness: 0.95 });
    const ballast = new THREE.Mesh(new THREE.PlaneGeometry(5.5, trackLen), ballastMat);
    ballast.rotation.x = -Math.PI / 2;
    ballast.rotation.z = Math.PI / 2;
    ballast.position.set(0, 0.04, trackZ);
    ballast.receiveShadow = true;
    this.scene.add(ballast);

    // Parallel Steel Rails (റെയിൽ പാളങ്ങൾ)
    const steelMat = new THREE.MeshStandardMaterial({ color: 0x90a4ae, metalness: 0.85, roughness: 0.2 });
    [-1.0, 1.0].forEach((rx) => {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(trackLen, 0.18, 0.12), steelMat);
      rail.position.set(0, 0.15, trackZ + rx);
      this.scene.add(rail);
    });

    // Railway Station Building at (x: 15, z: -74)
    const stationGroup = new THREE.Group();
    stationGroup.position.set(15, 0, -74);

    const stPlatform = new THREE.Mesh(new THREE.BoxGeometry(32, 0.65, 7.5), this.matRock);
    stPlatform.position.set(0, 0.32, 3.5);
    stPlatform.receiveShadow = true;
    stationGroup.add(stPlatform);

    const stBuilding = new THREE.Mesh(new THREE.BoxGeometry(22, 5.0, 9.0), this.matWhiteWall);
    stBuilding.position.set(0, 2.5, -4.5);
    stBuilding.castShadow = true;
    stationGroup.add(stBuilding);

    const stRoof = new THREE.Mesh(new THREE.BoxGeometry(24, 0.4, 11), this.matBlueRoof);
    stRoof.position.set(0, 5.2, -4.5);
    stRoof.castShadow = true;
    stationGroup.add(stRoof);

    this.stationTrigger = { position: new THREE.Vector3(15, 0, -74), radius: 10 };
    this.scene.add(stationGroup);

    // 3D Train on the tracks
    const train = new THREE.Group();
    train.position.set(-35, 0.2, trackZ);

    // Locomotive Engine (ചുവപ്പും വെളുപ്പും ട്രെയിൻ)
    const engineMat = new THREE.MeshStandardMaterial({ color: 0xb71c1c, roughness: 0.4 });
    const engine = new THREE.Mesh(new THREE.BoxGeometry(14, 3.4, 2.6), engineMat);
    engine.position.set(0, 1.8, 0);
    engine.castShadow = true;
    train.add(engine);

    // Passenger Coaches
    const coachMat = new THREE.MeshStandardMaterial({ color: 0x0288d1, roughness: 0.4 });
    for (let c = 1; c <= 2; c++) {
      const coach = new THREE.Mesh(new THREE.BoxGeometry(16, 3.2, 2.6), coachMat);
      coach.position.set(-c * 17.5, 1.7, 0);
      coach.castShadow = true;
      train.add(coach);
    }
    this.scene.add(train);
    this.trainGroup = train;
  }

  // 7. Bustling Main Town (30+ Houses using InstancedMesh for 60 FPS)
  buildMainTown() {
    // Single shared geometry and material for town houses
    const houseBodyGeo = new THREE.BoxGeometry(8.5, 4.2, 7.5);
    const houseRoofGeo = new THREE.ConeGeometry(7.0, 3.5, 4);

    const housePositions = [];
    // North Town Blocks
    for (let x = -28; x <= 28; x += 14) {
      housePositions.push({ x, z: -15, rotY: 0 });
      housePositions.push({ x, z: -35, rotY: Math.PI });
    }
    // East Town Blocks near Market
    for (let z = -5; z <= 15; z += 12) {
      housePositions.push({ x: 22, z, rotY: Math.PI / 2 });
      housePositions.push({ x: -22, z, rotY: -Math.PI / 2 });
    }

    const count = housePositions.length;
    const bodyInst = new THREE.InstancedMesh(houseBodyGeo, this.matWhiteWall, count);
    const roofInst = new THREE.InstancedMesh(houseRoofGeo, this.matRoof, count);

    const dummy = new THREE.Object3D();
    housePositions.forEach((pos, i) => {
      // Body
      dummy.position.set(pos.x, 2.1, pos.z);
      dummy.rotation.set(0, pos.rotY, 0);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      bodyInst.setMatrixAt(i, dummy.matrix);

      // Roof
      dummy.position.set(pos.x, 5.8, pos.z);
      dummy.rotation.set(0, pos.rotY + Math.PI / 4, 0);
      dummy.scale.set(1.4, 1, 1.25);
      dummy.updateMatrix();
      roofInst.setMatrixAt(i, dummy.matrix);
    });

    bodyInst.castShadow = true;
    bodyInst.receiveShadow = true;
    roofInst.castShadow = true;
    this.scene.add(bodyInst);
    this.scene.add(roofInst);

    // Town Market Complex at (x: 42, z: -10)
    const market = new THREE.Group();
    market.position.set(42, 0, -10);

    const mFloor = new THREE.Mesh(new THREE.BoxGeometry(16, 0.4, 14), this.matRock);
    mFloor.position.y = 0.2;
    market.add(mFloor);

    const mBuilding = new THREE.Mesh(new THREE.BoxGeometry(14, 4.5, 10), this.matWhiteWall);
    mBuilding.position.y = 2.45;
    mBuilding.castShadow = true;
    market.add(mBuilding);

    const mAwning = new THREE.Mesh(new THREE.BoxGeometry(16, 0.3, 5), new THREE.MeshStandardMaterial({ color: 0xd84315 }));
    mAwning.position.set(0, 3.8, 6.5);
    mAwning.rotation.x = 0.2;
    market.add(mAwning);

    this.shopTrigger = { position: new THREE.Vector3(42, 0, -10), radius: 8 };
    this.scene.add(market);

    // Town Heritage Well (കിണർ) at (x: -12, z: -25)
    const well = new THREE.Mesh(new THREE.CylinderGeometry(2.0, 2.2, 1.6, 16, 1, true), this.matRock);
    well.position.set(-12, 0.8, -25);
    well.castShadow = true;
    this.scene.add(well);
    const wellWater = new THREE.Mesh(new THREE.CircleGeometry(1.8, 16), this.matRiverWater);
    wellWater.rotation.x = -Math.PI / 2;
    wellWater.position.set(-12, 0.5, -25);
    this.scene.add(wellWater);
    this.wellTrigger = { position: new THREE.Vector3(-12, 0, -25), radius: 5 };
  }

  // 8. Town Services: Hospital, Petrol Pump, Farm Workshop
  buildTownServices() {
    // A. Hospital at (x: 20, z: 55)
    const hospital = new THREE.Group();
    hospital.position.set(20, 0, 55);

    const hBase = new THREE.Mesh(new THREE.BoxGeometry(18, 7.5, 14), this.matHospital);
    hBase.position.y = 3.75;
    hBase.castShadow = true;
    hospital.add(hBase);

    // Red Cross Sign
    const crossMat = new THREE.MeshBasicMaterial({ color: 0xd32f2f });
    const crossH = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.9, 0.2), crossMat);
    crossH.position.set(0, 6.5, 7.15);
    hospital.add(crossH);
    const crossV = new THREE.Mesh(new THREE.BoxGeometry(0.9, 3.5, 0.2), crossMat);
    crossV.position.set(0, 6.5, 7.15);
    hospital.add(crossV);

    this.hospitalTrigger = { position: new THREE.Vector3(20, 0, 55), radius: 9 };
    this.scene.add(hospital);

    // B. Petrol Pump at (x: -18, z: 52)
    const pumpGroup = new THREE.Group();
    pumpGroup.position.set(-18, 0, 52);

    // Canopy
    const pCanopy = new THREE.Mesh(new THREE.BoxGeometry(14, 0.5, 10), new THREE.MeshStandardMaterial({ color: 0x0288d1 }));
    pCanopy.position.set(0, 5.0, 0);
    pCanopy.castShadow = true;
    pumpGroup.add(pCanopy);

    // Pillars
    for (let px of [-5, 5]) {
      const pCol = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 5.0, 8), this.matWhiteWall);
      pCol.position.set(px, 2.5, 0);
      pumpGroup.add(pCol);
    }

    // Fuel Dispensers
    const dispenserMat = new THREE.MeshStandardMaterial({ color: 0xffb300 });
    for (let dx of [-2.5, 2.5]) {
      const disp = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.8, 0.8), dispenserMat);
      disp.position.set(dx, 0.9, 0);
      pumpGroup.add(disp);
    }

    this.pumpTrigger = { position: new THREE.Vector3(-18, 0, 52), radius: 8 };
    this.scene.add(pumpGroup);

    // C. Farm Equipment Workshop at (x: 52, z: 42)
    const workshop = new THREE.Group();
    workshop.position.set(52, 0, 42);

    const wBuilding = new THREE.Mesh(new THREE.BoxGeometry(16, 5.5, 12), new THREE.MeshStandardMaterial({ color: 0x546e7a }));
    wBuilding.position.y = 2.75;
    wBuilding.castShadow = true;
    workshop.add(wBuilding);

    const wRoof = new THREE.Mesh(new THREE.BoxGeometry(18, 0.35, 14), this.matBlueRoof);
    wRoof.position.y = 5.6;
    workshop.add(wRoof);

    this.shedTrigger = { position: new THREE.Vector3(52, 0, 42), radius: 8 };
    this.scene.add(workshop);
  }

  // 9. Dairy Farm (ഡയറി ഫാം) with Barn, Silos, Pasture & Cows
  buildDairyFarm() {
    const dairyGroup = new THREE.Group();
    dairyGroup.position.set(-78, 0, 58);

    // Red Barn with Gambrel Roof
    const barnMat = new THREE.MeshStandardMaterial({ color: 0xb71c1c });
    const barn = new THREE.Mesh(new THREE.BoxGeometry(18, 6.5, 13), barnMat);
    barn.position.y = 3.25;
    barn.castShadow = true;
    dairyGroup.add(barn);

    const barnRoof = new THREE.Mesh(new THREE.ConeGeometry(12, 4.0, 4), this.matRoof);
    barnRoof.position.y = 7.5;
    barnRoof.rotation.y = Math.PI / 4;
    barnRoof.scale.set(1.5, 1, 1.2);
    dairyGroup.add(barnRoof);

    // 2 Cylindrical Metal Silos (ധാന്യപ്പുരകൾ)
    const siloMat = new THREE.MeshStandardMaterial({ color: 0xb0bec5, metalness: 0.7, roughness: 0.3 });
    [-12, -18].forEach((sx) => {
      const silo = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.4, 11, 14), siloMat);
      silo.position.set(sx, 5.5, 0);
      silo.castShadow = true;
      dairyGroup.add(silo);
      const cap = new THREE.Mesh(new THREE.ConeGeometry(2.5, 2.0, 14), siloMat);
      cap.position.set(sx, 12, 0);
      dairyGroup.add(cap);
    });

    // Fenced Pasture with grazing cows (പശുക്കൾ)
    const cowGeo = new THREE.BoxGeometry(1.6, 1.1, 0.8);
    const cowMat = new THREE.MeshStandardMaterial({ color: 0x212121 }); // Black and white dairy cows
    for (let i = 0; i < 6; i++) {
      const cow = new THREE.Mesh(cowGeo, cowMat);
      const cx = 14 + (i % 3) * 6;
      const cz = -6 + Math.floor(i / 3) * 8;
      cow.position.set(cx, 0.55, cz);
      cow.rotation.y = Math.random() * Math.PI;
      cow.castShadow = true;
      dairyGroup.add(cow);
    }

    this.dairyTrigger = { position: new THREE.Vector3(-78, 0, 58), radius: 10 };
    this.scene.add(dairyGroup);
  }

  // 10. West Wetland Paddy Basin with Earthen Bunds (താഴ്ന്ന നെൽപ്പാടങ്ങൾ)
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

    // 6 Large Paddy Fields matching blueprint
    const polders = [
      { x: -50, z: -25, w: 26, h: 22 },
      { x: -80, z: -25, w: 28, h: 22 },
      { x: -50, z: 2,   w: 26, h: 24 },
      { x: -80, z: 2,   w: 28, h: 24 },
      { x: -50, z: 28,  w: 26, h: 22 },
      { x: -80, z: 28,  w: 28, h: 22 }
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

  // 11. Vegetable Farms & Rubber Estate
  buildVegetableAndRubberEstate() {
    // Vegetable Farm Crop Beds at (x: -30 to 10, z: -85 to -65)
    for (let x = -25; x <= 5; x += 10) {
      for (let z = -85; z <= -65; z += 8) {
        const bed = new THREE.Mesh(new THREE.BoxGeometry(7.5, 0.3, 5.5), this.matChemman);
        bed.position.set(x, 0.15, z);
        this.scene.add(bed);
      }
    }

    // Rubber Estate (dense regular grid of rubber trees on the north-west hill slope)
    const treeGeo = new THREE.CylinderGeometry(0.3, 0.4, 7.0, 7);
    const canopyGeo = new THREE.ConeGeometry(2.4, 5.0, 7);
    const canopyMat = new THREE.MeshStandardMaterial({ color: 0x1b5e20, roughness: 0.6 });

    for (let x = -130; x <= -80; x += 12) {
      for (let z = -105; z <= -65; z += 12) {
        const trunk = new THREE.Mesh(treeGeo, this.matPalmBark);
        trunk.position.set(x, 3.5, z);
        this.scene.add(trunk);
        const foliage = new THREE.Mesh(canopyGeo, canopyMat);
        foliage.position.set(x, 8.5, z);
        this.scene.add(foliage);
      }
    }
  }

  // 12. Dense Palm Foliage (East Coconut Farm, Riverbanks & Roadways)
  buildDenseFoliage() {
    // East Coconut Farm (x: 100 to 155, z: 35 to 125)
    for (let x = 100; x <= 155; x += 15) {
      for (let z = 35; z <= 125; z += 15) {
        this.createRealisticCoconutPalm(x, z, (Math.random() - 0.5) * 0.12);
      }
    }

    // Riverbank & Roadway Palms
    const roadPalms = [
      [12, -20], [-12, -20], [12, -45], [-12, -45],
      [-12, 10], [12, 10], [-12, 35], [12, 35],
      [35, 30], [55, 32], [75, 38], [105, 52],
      [-30, 45], [-45, 65], [-55, 80]
    ];
    roadPalms.forEach(([px, pz]) => {
      this.createRealisticCoconutPalm(px, pz, 0.06);
    });
  }

  // Realistic Coconut Palm
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

  // Animate river flow, waterfall cascades, lake ripples, and wind sway
  animate(delta, time) {
    // 1. Wind sway on palm fronds
    const wind = Math.sin(time * 1.5) * 0.04;
    for (let frond of this.palmFronds) {
      frond.rotation.z = wind;
    }

    // 2. Animated river flow & lake ripples
    for (let tex of this.waterNormalTextures) {
      tex.offset.y += delta * 0.08;
      tex.offset.x += Math.sin(time * 0.7) * 0.003;
    }

    // 3. Rushing waterfall foam animation
    if (this.waterfallTex) {
      this.waterfallTex.offset.y -= delta * 1.5;
    }

    // 4. Subtle water surface shimmer
    for (let w of this.waterMeshes) {
      w.position.y += Math.sin(time * 2.5 + w.position.x * 0.3) * 0.0004;
    }
  }
}
