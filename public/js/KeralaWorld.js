import * as THREE from 'three';
import { TextureGenerator } from './TextureGenerator.js';

/**
 * Photorealistic Open World Kerala Village Environment (യാഥാർത്ഥ്യബോധമുള്ള കേരള ഗ്രാമം)
 * Features:
 * - High-Fidelity PBR Materials (Albedo + Normal + Roughness)
 * - 360x360m Open World terrain with rolling hills & atmospheric horizon
 * - Elevated Asphalt Road with lane stripes & red laterite shoulders
 * - Chemman laterite tracks with organic tire ruts
 * - Flowing Irrigation Canal with animated water ripple normal maps & culvert bridge
 * - Sunken Wetland Paddy Basin with flooded reflective water & earthen bunds (വരമ്പുകൾ)
 * - Highland Banana Plantation with broad drooping ribbed leaves & flower bunch (നേന്ത്രവാഴ)
 * - Tapioca field with authentic soil mounds (കപ്പത്തടങ്ങൾ)
 * - Traditional Kerala Heritage Nalukettu House with terracotta tiled roof & teak pillars
 * - Weathered stone well with iron pulley & bucket
 * - Village Tea Stall / Market with benches & kettle
 * - Organic curved Coconut Palms (തെങ്ങുകൾ) with ringed bark, drooping fronds & coconuts
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
    this.waterNormalTextures = [];
    this.waterMeshes = [];
    this.bananaLeaves = [];

    // Defined world zones for player navigation & HUD
    this.zones = [
      { name: 'താഴ്ന്ന നെൽപ്പാടം (Wetland Paddy Basin)', xMin: -75, xMax: -12, zMin: -25, zMax: 55 },
      { name: 'നേന്ത്രവാഴത്തോട്ടം (Banana Grove)', xMin: -70, xMax: -15, zMin: -75, zMax: -28 },
      { name: 'കപ്പത്തോട്ടം (Tapioca Field)', xMin: 18, xMax: 70, zMin: -75, zMax: -25 },
      { name: 'പച്ചക്കറി പന്തൽ (Vegetable Trellis)', xMin: 18, xMax: 70, zMin: -22, zMax: 22 },
      { name: 'നാടൻ ചായക്കട & ചന്ത (Village Tea Stall)', xMin: 12, xMax: 55, zMin: 25, zMax: 70 },
      { name: 'നാലുകെട്ട് തറവാട് (Heritage Farmhouse)', xMin: -25, xMax: 10, zMin: -70, zMax: -30 },
      { name: 'മെയിൻ റോഡ് (Main Village Highway)', xMin: -9, xMax: 9, zMin: -140, zMax: 140 }
    ];

    // Pre-generate Shared PBR Materials for optimal performance & realism
    this.initPBRMaterials();

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
    asphaltTex.repeat.set(1, 40);
    const asphaltNorm = TextureGenerator.createBumpNormalMap();
    asphaltNorm.repeat.set(1, 40);
    this.matAsphalt = new THREE.MeshStandardMaterial({
      map: asphaltTex,
      normalMap: asphaltNorm,
      roughness: 0.72,
      metalness: 0.08
    });

    // 3. Kerala Red Laterite Soil PBR (ചെമ്മണ്ണ്)
    const chemmanTex = TextureGenerator.createRedLateriteTexture();
    chemmanTex.repeat.set(3, 20);
    const chemmanNorm = TextureGenerator.createBumpNormalMap();
    chemmanNorm.repeat.set(3, 20);
    this.matChemman = new THREE.MeshStandardMaterial({
      map: chemmanTex,
      normalMap: chemmanNorm,
      roughness: 0.92,
      metalness: 0.02
    });

    // 4. Flooded Wetland Mud Silt PBR (വയലിലെ ചെളി)
    const mudTex = TextureGenerator.createWetSiltMudTexture();
    mudTex.repeat.set(6, 6);
    const mudNorm = TextureGenerator.createBumpNormalMap();
    mudNorm.repeat.set(6, 6);
    this.matMud = new THREE.MeshStandardMaterial({
      map: mudTex,
      normalMap: mudNorm,
      roughness: 0.35, // Glistening wet surface
      metalness: 0.15
    });

    // 5. Terracotta Clay Roof Tiles PBR (മംഗലാപുരം ഓട്)
    const roofTex = TextureGenerator.createRoofTileTexture();
    roofTex.repeat.set(8, 4);
    const roofNorm = TextureGenerator.createBumpNormalMap();
    roofNorm.repeat.set(8, 4);
    this.matRoof = new THREE.MeshStandardMaterial({
      map: roofTex,
      normalMap: roofNorm,
      roughness: 0.65,
      metalness: 0.05
    });

    // 6. Weathered Kerala Teak Wood PBR (തേക്ക് തടി)
    const teakTex = TextureGenerator.createTeakWoodTexture();
    this.matTeak = new THREE.MeshStandardMaterial({
      map: teakTex,
      roughness: 0.58,
      metalness: 0.04
    });

    // 7. Coconut Palm Ringed Bark PBR (തെങ്ങിൻ തടി)
    const barkTex = TextureGenerator.createCoconutBarkTexture();
    barkTex.repeat.set(1, 4);
    this.matPalmBark = new THREE.MeshStandardMaterial({
      map: barkTex,
      roughness: 0.85,
      metalness: 0.02
    });

    // 8. Banana Broad Leaf PBR
    const leafTex = TextureGenerator.createBananaLeafTexture();
    this.matBananaLeaf = new THREE.MeshStandardMaterial({
      map: leafTex,
      roughness: 0.45,
      metalness: 0.05,
      side: THREE.DoubleSide
    });

    // 9. Flowing Canal Water Shader Material
    const canalWaterNorm = TextureGenerator.createWaterNormalMap();
    canalWaterNorm.repeat.set(2, 35);
    this.waterNormalTextures.push(canalWaterNorm);
    this.matCanalWater = new THREE.MeshStandardMaterial({
      color: 0x005548, // Deep tropical teal river water
      normalMap: canalWaterNorm,
      normalScale: new THREE.Vector2(0.35, 0.35),
      roughness: 0.08,
      metalness: 0.2,
      transparent: true,
      opacity: 0.86
    });

    // 10. Flooded Paddy Water Sheet Material
    const paddyWaterNorm = TextureGenerator.createWaterNormalMap();
    paddyWaterNorm.repeat.set(6, 6);
    this.waterNormalTextures.push(paddyWaterNorm);
    this.matPaddyWater = new THREE.MeshStandardMaterial({
      color: 0x1f3c2b, // Calm flooded paddy sheen
      normalMap: paddyWaterNorm,
      normalScale: new THREE.Vector2(0.2, 0.2),
      roughness: 0.06,
      metalness: 0.25,
      transparent: true,
      opacity: 0.76
    });
  }

  buildWorld() {
    this.buildOpenWorldTerrain();
    this.buildRoadNetwork();
    this.buildIrrigationCanal();
    this.buildPaddyWetlandBasin();
    this.buildHighlandBananaPlantation();
    this.buildTapiocaField();
    this.buildVegetableTrellis();
    this.buildKeralaNalukettuHouse();
    this.buildTractorShed();
    this.buildStoneWell();
    this.buildVillageTeaShop();
    this.buildFlora();
  }

  // 1. Broad Open-World Landscape (360x360m) with Distant Western Ghats Hills
  buildOpenWorldTerrain() {
    // Base rolling green terrain
    const groundGeo = new THREE.PlaneGeometry(360, 360, 64, 64);
    const ground = new THREE.Mesh(groundGeo, this.matGrass);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Distant tropical Western Ghats mountain backdrop (സഹ്യാദ്രി മലനിരകൾ)
    const hillMat = new THREE.MeshStandardMaterial({
      color: 0x1d4722, // Deep misty rainforest green
      roughness: 0.95
    });

    const hillPositions = [
      [-140, 16, -150, 85], [0, 22, -165, 110], [130, 18, -150, 95],
      [-165, 18, -20, 90], [165, 20, 20, 100],
      [-140, 15, 140, 85], [0, 18, 160, 105], [140, 17, 145, 90]
    ];

    hillPositions.forEach(([x, y, z, rad]) => {
      const hill = new THREE.Mesh(new THREE.ConeGeometry(rad, y * 2.4, 18), hillMat);
      hill.position.set(x, y - 2, z);
      hill.scale.set(1.5, 1, 1.5);
      this.scene.add(hill);
    });
  }

  // 2. Road Network: Elevated Asphalt Highway + Chemman Village Tracks + Gravel Shoulders
  buildRoadNetwork() {
    const markMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const edgeMarkMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    // A. Main North-South Village Asphalt Road (Elevated Embankment)
    const roadWidth = 8.5;
    const roadLen = 300;
    const mainRoadGeo = new THREE.PlaneGeometry(roadWidth, roadLen);
    const mainRoad = new THREE.Mesh(mainRoadGeo, this.matAsphalt);
    mainRoad.rotation.x = -Math.PI / 2;
    mainRoad.position.set(0, 0.05, 0);
    mainRoad.receiveShadow = true;
    this.scene.add(mainRoad);

    // Laterite Gravel Shoulders on both sides of asphalt road (റോഡ് വക്കുകൾ)
    const shoulderGeo = new THREE.PlaneGeometry(1.6, roadLen);
    const leftShoulder = new THREE.Mesh(shoulderGeo, this.matChemman);
    leftShoulder.rotation.x = -Math.PI / 2;
    leftShoulder.position.set(-roadWidth / 2 - 0.8, 0.03, 0);
    leftShoulder.receiveShadow = true;
    this.scene.add(leftShoulder);

    const rightShoulder = new THREE.Mesh(shoulderGeo, this.matChemman);
    rightShoulder.rotation.x = -Math.PI / 2;
    rightShoulder.position.set(roadWidth / 2 + 0.8, 0.03, 0);
    rightShoulder.receiveShadow = true;
    this.scene.add(rightShoulder);

    // Center Dashed White Road Markings
    for (let z = -140; z <= 140; z += 14) {
      const dash = new THREE.Mesh(new THREE.PlaneGeometry(0.32, 7.5), markMat);
      dash.rotation.x = -Math.PI / 2;
      dash.position.set(0, 0.065, z);
      this.scene.add(dash);
    }

    // Outer Solid White Lane Boundaries
    const leftLine = new THREE.Mesh(new THREE.PlaneGeometry(0.18, roadLen), edgeMarkMat);
    leftLine.rotation.x = -Math.PI / 2;
    leftLine.position.set(-roadWidth / 2 + 0.4, 0.065, 0);
    this.scene.add(leftLine);

    const rightLine = new THREE.Mesh(new THREE.PlaneGeometry(0.18, roadLen), edgeMarkMat);
    rightLine.rotation.x = -Math.PI / 2;
    rightLine.position.set(roadWidth / 2 - 0.4, 0.065, 0);
    this.scene.add(rightLine);

    // B. East Branch Asphalt Road towards Market & Shop
    const eastRoadGeo = new THREE.PlaneGeometry(55, 7.5);
    const eastRoad = new THREE.Mesh(eastRoadGeo, this.matAsphalt);
    eastRoad.rotation.x = -Math.PI / 2;
    eastRoad.position.set(32, 0.05, 38);
    eastRoad.receiveShadow = true;
    this.scene.add(eastRoad);

    // C. West Chemman Laterite Road to Paddy Fields (ചെമ്മൺ റോഡ്)
    const westRoadGeo = new THREE.PlaneGeometry(65, 6.2);
    const westRoad = new THREE.Mesh(westRoadGeo, this.matChemman);
    westRoad.rotation.x = -Math.PI / 2;
    westRoad.position.set(-36, 0.045, 12);
    westRoad.receiveShadow = true;
    this.scene.add(westRoad);

    // D. North Chemman Track to House & Highlands
    const northTrackGeo = new THREE.PlaneGeometry(45, 5);
    const northTrack = new THREE.Mesh(northTrackGeo, this.matChemman);
    northTrack.rotation.x = -Math.PI / 2;
    northTrack.position.set(-20, 0.045, -45);
    northTrack.receiveShadow = true;
    this.scene.add(northTrack);
  }

  // 3. Irrigation Canal (ജലസേചന കനാൽ) with Flowing Water & Culvert Bridge
  buildIrrigationCanal() {
    const canalLen = 160;
    const canalWidth = 5.5;
    const canalX = -12;

    // Textured concrete embankments (തോട്ടുവരമ്പ്)
    const bankMat = new THREE.MeshStandardMaterial({
      color: 0x616161,
      roughness: 0.85
    });

    const leftBank = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.4, canalLen), bankMat);
    leftBank.position.set(canalX - canalWidth / 2, 0.35, 15);
    leftBank.castShadow = true;
    this.scene.add(leftBank);

    const rightBank = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.4, canalLen), bankMat);
    rightBank.position.set(canalX + canalWidth / 2, 0.35, 15);
    rightBank.castShadow = true;
    this.scene.add(rightBank);

    // Glistening Flowing Water Surface inside canal
    const waterGeo = new THREE.PlaneGeometry(canalWidth * 0.96, canalLen);
    const waterMesh = new THREE.Mesh(waterGeo, this.matCanalWater);
    waterMesh.rotation.x = -Math.PI / 2;
    waterMesh.position.set(canalX, 0.16, 15);
    this.scene.add(waterMesh);
    this.waterMeshes.push(waterMesh);

    // Weathered Timber / Stone Culvert Bridge (പാലം) where West Road crosses
    const bridgeFloor = new THREE.Mesh(new THREE.BoxGeometry(canalWidth + 2.8, 0.45, 8.5), this.matTeak);
    bridgeFloor.position.set(canalX, 0.72, 12);
    bridgeFloor.castShadow = true;
    bridgeFloor.receiveShadow = true;
    this.scene.add(bridgeFloor);

    // Heavy Timber Bridge Railings
    const railingGeo = new THREE.BoxGeometry(canalWidth + 2.8, 0.85, 0.2);
    const railNorth = new THREE.Mesh(railingGeo, this.matTeak);
    railNorth.position.set(canalX, 1.4, 16);
    this.scene.add(railNorth);

    const railSouth = new THREE.Mesh(railingGeo, this.matTeak);
    railSouth.position.set(canalX, 1.4, 8);
    this.scene.add(railSouth);
  }

  // 4. Wetland Paddy Basin with Earthen Bunds (ചെളിക്കണ്ടങ്ങളും വരമ്പുകളും)
  buildPaddyWetlandBasin() {
    const bundMat = new THREE.MeshStandardMaterial({
      color: 0x5a3e36, // Clay/laterite earthen bund (വരമ്പ്)
      roughness: 0.92
    });

    // 4 Authentic Paddy Polders / Fields (നാല് വലിയ കണ്ടങ്ങൾ)
    const polders = [
      { x: -30, z: -2, w: 28, h: 24 },
      { x: -62, z: -2, w: 30, h: 24 },
      { x: -30, z: 26, w: 28, h: 26 },
      { x: -62, z: 26, w: 30, h: 26 }
    ];

    polders.forEach((p) => {
      // Sunken Organic Mud Bed (കണ്ടത്തിലെ ചെളി)
      const mud = new THREE.Mesh(new THREE.PlaneGeometry(p.w, p.h), this.matMud);
      mud.rotation.x = -Math.PI / 2;
      mud.position.set(p.x, 0.02, p.z);
      mud.receiveShadow = true;
      this.scene.add(mud);

      // Flooded Shallow Water Sheet with sky reflections (കെട്ടിനിൽക്കുന്ന വെള്ളം)
      const water = new THREE.Mesh(new THREE.PlaneGeometry(p.w * 0.98, p.h * 0.98), this.matPaddyWater);
      water.rotation.x = -Math.PI / 2;
      water.position.set(p.x, 0.05, p.z);
      this.scene.add(water);
      this.waterMeshes.push(water);

      // Surrounding Elevated Earthen Bunds (വരമ്പുകൾ)
      const bundThickness = 1.0;
      const bundHeight = 0.28;

      // North bund
      const bNorth = new THREE.Mesh(new THREE.BoxGeometry(p.w + bundThickness, bundHeight, bundThickness), bundMat);
      bNorth.position.set(p.x, bundHeight / 2, p.z - p.h / 2);
      bNorth.receiveShadow = true;
      this.scene.add(bNorth);

      // South bund
      const bSouth = new THREE.Mesh(new THREE.BoxGeometry(p.w + bundThickness, bundHeight, bundThickness), bundMat);
      bSouth.position.set(p.x, bundHeight / 2, p.z + p.h / 2);
      bSouth.receiveShadow = true;
      this.scene.add(bSouth);

      // West bund
      const bWest = new THREE.Mesh(new THREE.BoxGeometry(bundThickness, bundHeight, p.h), bundMat);
      bWest.position.set(p.x - p.w / 2, bundHeight / 2, p.z);
      bWest.receiveShadow = true;
      this.scene.add(bWest);

      // East bund
      const bEast = new THREE.Mesh(new THREE.BoxGeometry(bundThickness, bundHeight, p.h), bundMat);
      bEast.position.set(p.x + p.w / 2, bundHeight / 2, p.z);
      bEast.receiveShadow = true;
      this.scene.add(bEast);
    });
  }

  // 5. Highland Banana Plantation (വാഴത്തോട്ടം)
  buildHighlandBananaPlantation() {
    // Raised terrace ground for bananas
    const moundGeo = new THREE.BoxGeometry(50, 0.5, 45);
    const mound = new THREE.Mesh(moundGeo, this.matChemman);
    mound.position.set(-44, 0.25, -50);
    mound.receiveShadow = true;
    this.scene.add(mound);

    // Rows of lush Banana trees (നേന്ത്രവാഴകൾ)
    for (let x = -62; x <= -26; x += 9) {
      for (let z = -68; z <= -34; z += 9) {
        this.createBananaPlant(x, z, true);
      }
    }
  }

  // 6. Tapioca Field (കപ്പത്തോട്ടം) with authentic earthen mounds
  buildTapiocaField() {
    // Raised red laterite field
    const field = new THREE.Mesh(new THREE.BoxGeometry(48, 0.45, 45), this.matChemman);
    field.position.set(44, 0.22, -50);
    field.receiveShadow = true;
    this.scene.add(field);

    // Tapioca mounds (കപ്പത്തടങ്ങൾ)
    for (let x = 24; x <= 62; x += 8) {
      for (let z = -68; z <= -34; z += 8) {
        // Red soil mound
        const mound = new THREE.Mesh(new THREE.ConeGeometry(1.8, 0.55, 10), this.matChemman);
        mound.position.set(x, 0.5, z);
        this.scene.add(mound);

        // Tapioca palmate plant
        this.createTapiocaPlant(x, z);
      }
    }
  }

  // Procedural Tapioca Plant (കപ്പച്ചെടി)
  createTapiocaPlant(x, z) {
    const plantGroup = new THREE.Group();
    plantGroup.position.set(x, 0.72, z);

    const stemMat = new THREE.MeshStandardMaterial({ color: 0x795548, roughness: 0.8 });
    const leafMat = new THREE.MeshStandardMaterial({
      color: 0x2e7d32,
      roughness: 0.5,
      side: THREE.DoubleSide
    });

    // Stalk with knots
    const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.07, 1.9, 7), stemMat);
    stalk.position.y = 0.95;
    stalk.castShadow = true;
    plantGroup.add(stalk);

    // Signature 5-7 finger palmate leaves
    for (let h of [0.9, 1.45, 1.9]) {
      for (let i = 0; i < 4; i++) {
        const ang = (i / 4) * Math.PI * 2;
        const petiole = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.45), stemMat);
        petiole.position.set(0, h, 0);
        petiole.rotation.z = Math.PI / 3;
        petiole.rotation.y = ang;

        // Leaf fan
        const fan = new THREE.Mesh(new THREE.CircleGeometry(0.32, 6), leafMat);
        fan.position.set(0.38, h + 0.18, 0);
        fan.rotation.x = Math.PI / 4;
        plantGroup.add(fan);
      }
    }

    this.scene.add(plantGroup);
  }

  // 7. Vegetable Trellis (പച്ചക്കറി പന്തൽ)
  buildVegetableTrellis() {
    const trellisGroup = new THREE.Group();
    trellisGroup.position.set(44, 0, 0);

    const bambooMat = new THREE.MeshStandardMaterial({ color: 0xcddc39, roughness: 0.6 }); // Bamboo
    const vineMat = new THREE.MeshStandardMaterial({ color: 0x1b5e20, roughness: 0.7 });   // Climbing vines
    const gourdMat = new THREE.MeshStandardMaterial({ color: 0x81c784, roughness: 0.4 });  // Hanging gourds

    const width = 30;
    const depth = 22;
    const height = 2.5;

    // Upright bamboo poles
    for (let x = -width / 2; x <= width / 2; x += 7.5) {
      for (let z = -depth / 2; z <= depth / 2; z += 5.5) {
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.08, height, 7), bambooMat);
        pole.position.set(x, height / 2, z);
        pole.castShadow = true;
        trellisGroup.add(pole);
      }
    }

    // Overhead roof grid (പന്തൽ തട്ട്)
    const roofGrid = new THREE.Mesh(new THREE.BoxGeometry(width, 0.12, depth), vineMat);
    roofGrid.position.y = height;
    roofGrid.castShadow = true;
    trellisGroup.add(roofGrid);

    // Hanging vegetables (പാവൽ, പടവലം)
    for (let i = 0; i < 22; i++) {
      const rx = (Math.random() - 0.5) * (width - 4);
      const rz = (Math.random() - 0.5) * (depth - 4);
      const gourd = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.09, 0.8, 6), gourdMat);
      gourd.position.set(rx, height - 0.42, rz);
      gourd.castShadow = true;
      trellisGroup.add(gourd);
    }

    this.scene.add(trellisGroup);
  }

  // 8. Traditional Kerala Nalukettu Heritage House (ഓടുമേഞ്ഞ നാലുകെട്ട് തറവാട്)
  buildKeralaNalukettuHouse() {
    const houseGroup = new THREE.Group();
    houseGroup.position.set(-6, 0, -48);

    const wallMat = new THREE.MeshStandardMaterial({
      color: 0xf5f3ea, // Warm limestone whitewash
      roughness: 0.82
    });

    const foundationMat = new THREE.MeshStandardMaterial({
      color: 0x5d4037, // Heavy laterite stone plinth
      roughness: 0.95
    });

    // 1. Raised Stone Plinth Foundation (തറ)
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(20, 0.8, 16), foundationMat);
    plinth.position.y = 0.4;
    plinth.receiveShadow = true;
    houseGroup.add(plinth);

    // 2. Main Whitewashed House Walls
    const mainBody = new THREE.Mesh(new THREE.BoxGeometry(18, 4.8, 12), wallMat);
    mainBody.position.y = 3.2;
    mainBody.castShadow = true;
    mainBody.receiveShadow = true;
    houseGroup.add(mainBody);

    // 3. Front Verandah (വരാന്ത & ചാരുപടി)
    const verandahFloor = new THREE.Mesh(new THREE.BoxGeometry(18, 0.35, 4.5), this.matTeak);
    verandahFloor.position.set(0, 0.8, 7.8);
    verandahFloor.receiveShadow = true;
    houseGroup.add(verandahFloor);

    // Carved Teak Verandah Railing (ചാരുപടി)
    const charupadi = new THREE.Mesh(new THREE.BoxGeometry(18, 0.75, 0.3), this.matTeak);
    charupadi.position.set(0, 1.4, 9.8);
    houseGroup.add(charupadi);

    // 4. Lathe-Turned Teak Wood Verandah Pillars (തേക്ക് തൂണുകൾ)
    for (let x of [-7.5, -2.5, 2.5, 7.5]) {
      const pillarBase = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.5, 0.55), foundationMat);
      pillarBase.position.set(x, 1.05, 9.7);
      houseGroup.add(pillarBase);

      const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 4.0, 10), this.matTeak);
      pillar.position.set(x, 3.2, 9.7);
      pillar.castShadow = true;
      houseGroup.add(pillar);
    }

    // 5. Classic Mangalore Terracotta Clay Tiled Roof (മംഗലാപുരം ഓടുമേഞ്ഞ മേൽക്കൂര)
    // Front and Back Sloping Gables
    const roofMain = new THREE.Mesh(new THREE.ConeGeometry(15.5, 5.8, 4), this.matRoof);
    roofMain.position.y = 8.2;
    roofMain.rotation.y = Math.PI / 4;
    roofMain.scale.set(1.65, 1, 1.35);
    roofMain.castShadow = true;
    houseGroup.add(roofMain);

    // Extended Verandah Lower Roof Slope (താഴത്തെ ഇറക്കം)
    const porchRoof = new THREE.Mesh(new THREE.BoxGeometry(20, 0.4, 5.5), this.matRoof);
    porchRoof.position.set(0, 5.4, 8.2);
    porchRoof.rotation.x = 0.35;
    porchRoof.castShadow = true;
    houseGroup.add(porchRoof);

    // Traditional Kerala Carved Wooden Front Door (മണിചിത്രത്താഴ് ഉള്ള വാതിൽ)
    const doorFrame = new THREE.Mesh(new THREE.BoxGeometry(2.6, 3.8, 0.2), this.matTeak);
    doorFrame.position.set(0, 2.7, 6.02);
    houseGroup.add(doorFrame);

    const doorInner = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 3.4), this.matTeak);
    doorInner.position.set(0, 2.7, 6.13);
    houseGroup.add(doorInner);

    // Traditional Kerala Windows with Teak Louvers (ജാലകങ്ങൾ)
    [-5, 5].forEach((wx) => {
      const win = new THREE.Mesh(new THREE.BoxGeometry(2.0, 2.2, 0.15), this.matTeak);
      win.position.set(wx, 3.0, 6.02);
      houseGroup.add(win);
    });

    this.scene.add(houseGroup);
  }

  // 9. Tractor & Equipment Shed (ട്രാക്ടർ ഷെഡ്)
  buildTractorShed() {
    const shedGroup = new THREE.Group();
    shedGroup.position.set(-30, 0, -48);

    const steelMat = new THREE.MeshStandardMaterial({
      color: 0x455a64,
      metalness: 0.65,
      roughness: 0.45
    });

    const tinRoofMat = new THREE.MeshStandardMaterial({
      color: 0x78909c,
      metalness: 0.55,
      roughness: 0.5
    });

    // Heavy Steel Uprights
    for (let x of [-6.5, 6.5]) {
      for (let z of [-5.5, 5.5]) {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 5.2, 8), steelMat);
        post.position.set(x, 2.6, z);
        post.castShadow = true;
        shedGroup.add(post);
      }
    }

    // Corrugated Metal Sloped Roof (ഷീറ്റ് മേൽക്കൂര)
    const roof = new THREE.Mesh(new THREE.BoxGeometry(15, 0.22, 13), tinRoofMat);
    roof.position.set(0, 5.3, 0);
    roof.rotation.z = -0.07;
    roof.castShadow = true;
    shedGroup.add(roof);

    // Workbench & Tractor Implements
    const bench = new THREE.Mesh(new THREE.BoxGeometry(4.5, 1.2, 1.5), this.matTeak);
    bench.position.set(0, 0.6, -4.2);
    shedGroup.add(bench);

    // Fuel Drums
    const drumMat = new THREE.MeshStandardMaterial({ color: 0x0d47a1, metalness: 0.8, roughness: 0.25 });
    const drum = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 1.5, 12), drumMat);
    drum.position.set(4.2, 0.75, -3.8);
    shedGroup.add(drum);

    this.shedTrigger = { position: shedGroup.position, radius: 7 };
    this.scene.add(shedGroup);
  }

  // 10. Stone Well (തുടികെട്ടിയ കിണർ) - Refills water bucket!
  buildStoneWell() {
    const wellGroup = new THREE.Group();
    wellGroup.position.set(12, 0, -32);

    const stoneMat = new THREE.MeshStandardMaterial({
      color: 0x546e7a, // Mossy weathered laterite blocks
      roughness: 0.95
    });

    const ironMat = new THREE.MeshStandardMaterial({
      color: 0x263238,
      metalness: 0.8,
      roughness: 0.3
    });

    // Circular stone well curb
    const wall = new THREE.Mesh(new THREE.CylinderGeometry(2.3, 2.5, 1.7, 20, 1, true), stoneMat);
    wall.position.y = 0.85;
    wall.castShadow = true;
    wall.receiveShadow = true;
    wellGroup.add(wall);

    // Deep water mirror inside well
    const water = new THREE.Mesh(new THREE.CircleGeometry(2.1, 20), this.matCanalWater);
    water.rotation.x = -Math.PI / 2;
    water.position.y = 0.55;
    wellGroup.add(water);

    // Heavy Timber Gantry Posts & Crossbeam
    for (let x of [-1.9, 1.9]) {
      const p = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 3.8), this.matTeak);
      p.position.set(x, 1.9, 0);
      p.castShadow = true;
      wellGroup.add(p);
    }

    const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 4.2), this.matTeak);
    beam.rotation.z = Math.PI / 2;
    beam.position.y = 3.7;
    beam.castShadow = true;
    wellGroup.add(beam);

    // Iron Pulley Wheel (കപ്പി)
    const pulley = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.06, 8, 16), ironMat);
    pulley.position.set(0, 3.3, 0);
    wellGroup.add(pulley);

    this.wellTrigger = { position: wellGroup.position, radius: 5 };
    this.scene.add(wellGroup);
  }

  // 11. Village Tea Shop & Market (നാടൻ ചായക്കട & ചന്ത)
  buildVillageTeaShop() {
    const shopGroup = new THREE.Group();
    shopGroup.position.set(38, 0, 42);

    const awningMat = new THREE.MeshStandardMaterial({ color: 0xd84315, roughness: 0.7 }); // Orange canvas awning

    // Shop Raised Platform Floor
    const floor = new THREE.Mesh(new THREE.BoxGeometry(10, 0.5, 8), this.matTeak);
    floor.position.y = 0.25;
    shopGroup.add(floor);

    // Serving Counter
    const counter = new THREE.Mesh(new THREE.BoxGeometry(8.5, 1.4, 1.3), this.matTeak);
    counter.position.set(0, 0.95, 2.0);
    counter.castShadow = true;
    shopGroup.add(counter);

    // Roof Posts
    for (let x of [-4.5, 4.5]) {
      for (let z of [-3.5, 3.5]) {
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 4.4), this.matTeak);
        pole.position.set(x, 2.2, z);
        pole.castShadow = true;
        shopGroup.add(pole);
      }
    }

    // Sloped Awning Roof
    const roof = new THREE.Mesh(new THREE.BoxGeometry(11.5, 0.3, 9.5), awningMat);
    roof.position.set(0, 4.4, 0.5);
    roof.rotation.x = 0.16;
    roof.castShadow = true;
    shopGroup.add(roof);

    // Steel Tea Kettle (ചായ കെറ്റിൽ)
    const kettleMat = new THREE.MeshStandardMaterial({ color: 0xe0e0e0, metalness: 0.9, roughness: 0.15 });
    const kettle = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.35, 0.7, 10), kettleMat);
    kettle.position.set(2.8, 1.85, 2.0);
    shopGroup.add(kettle);

    // Glass sweet display jar (മിഠായി കുപ്പി)
    const jarMat = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.6, roughness: 0.1 });
    const jar = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.5, 8), jarMat);
    jar.position.set(-2.5, 1.85, 2.0);
    shopGroup.add(jar);

    // Friendly Shopkeeper NPC
    const vendorBody = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.46, 1.7, 9), new THREE.MeshStandardMaterial({ color: 0xfff9c4 }));
    vendorBody.position.set(0, 1.7, 0.2);
    shopGroup.add(vendorBody);

    const vendorHead = new THREE.Mesh(new THREE.SphereGeometry(0.32, 12, 12), new THREE.MeshStandardMaterial({ color: 0x8d5524, roughness: 0.6 }));
    vendorHead.position.set(0, 2.8, 0.2);
    shopGroup.add(vendorHead);

    this.shopTrigger = { position: shopGroup.position, radius: 7.0 };
    this.scene.add(shopGroup);
  }

  // 12. Flora: Organic Curved Coconut Palms (തെങ്ങുകൾ) lining canals, roads & village borders
  buildFlora() {
    // Palms lining both sides of the main road
    const roadPalms = [];
    for (let z = -120; z <= 120; z += 20) {
      roadPalms.push([7.5, z, (Math.random() - 0.5) * 0.15]);
      roadPalms.push([-7.5, z, (Math.random() - 0.5) * 0.15]);
    }

    // Palms around paddy basin perimeter
    const basinPalms = [
      [-78, -2, 0.1], [-78, 24, -0.1], [-78, 48, 0.08],
      [-62, 45, -0.12], [-32, 45, 0.1], [-16, 45, -0.08],
      [-46, -26, 0.1], [-26, -26, -0.1]
    ];

    [...roadPalms, ...basinPalms].forEach(([x, z, lean]) => {
      this.createRealisticCoconutPalm(x, z, lean || 0.05);
    });
  }

  // Ultra-Realistic Coconut Palm (സൂപ്പർ റിയലിസ്റ്റിക് തെങ്ങ്)
  createRealisticCoconutPalm(x, z, leanAngle = 0.08) {
    const palmGroup = new THREE.Group();
    palmGroup.position.set(x, 0, z);

    // Segmented natural curved trunk (3 angled segments for natural organic bend)
    const segHeight = 4.2;
    const baseTrunk = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.6, segHeight, 9), this.matPalmBark);
    baseTrunk.position.y = segHeight / 2;
    baseTrunk.rotation.z = leanAngle;
    baseTrunk.castShadow = true;
    palmGroup.add(baseTrunk);

    const midTrunk = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.42, segHeight, 9), this.matPalmBark);
    midTrunk.position.set(Math.sin(leanAngle) * segHeight, segHeight * 1.5 - 0.1, 0);
    midTrunk.rotation.z = leanAngle * 1.5;
    midTrunk.castShadow = true;
    palmGroup.add(midTrunk);

    const topTrunk = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.35, segHeight, 9), this.matPalmBark);
    const topX = Math.sin(leanAngle) * segHeight + Math.sin(leanAngle * 1.5) * segHeight;
    topTrunk.position.set(topX, segHeight * 2.5 - 0.2, 0);
    topTrunk.rotation.z = leanAngle * 2.0;
    topTrunk.castShadow = true;
    palmGroup.add(topTrunk);

    // Crown of Fronds (ഓലകൾ) at top of trunk
    const crown = new THREE.Group();
    crown.position.set(topX + Math.sin(leanAngle * 2.0) * segHeight * 0.5, segHeight * 3.0, 0);

    const frondLeafMat = new THREE.MeshStandardMaterial({
      color: 0x2e7d32,
      roughness: 0.55,
      side: THREE.DoubleSide
    });

    // 14 Realistic Arched Pinnate Fronds
    const frondCount = 14;
    for (let i = 0; i < frondCount; i++) {
      const angle = (i / frondCount) * Math.PI * 2;
      const frond = new THREE.Group();
      frond.rotation.y = angle;

      // Parabolic drooping leaf blade
      const leafGeo = new THREE.PlaneGeometry(1.4, 6.2, 3, 5);
      const leaf = new THREE.Mesh(leafGeo, frondLeafMat);
      leaf.position.set(0, -0.6, 3.0);
      leaf.rotation.x = Math.PI / 2 - 0.45;
      leaf.castShadow = true;
      frond.add(leaf);

      crown.add(frond);
      this.palmFronds.push(leaf);
    }

    // Cluster of 10-12 Coconuts (ഇളനീർ & പച്ചത്തേങ്ങ)
    const nutMat = new THREE.MeshStandardMaterial({ color: 0x689f38, roughness: 0.5 });
    for (let c = 0; c < 10; c++) {
      const nutAng = (c / 10) * Math.PI * 2;
      const nut = new THREE.Mesh(new THREE.SphereGeometry(0.3, 7, 7), nutMat);
      nut.scale.set(1, 1.25, 1);
      nut.position.set(Math.cos(nutAng) * 0.55, -0.4, Math.sin(nutAng) * 0.55);
      crown.add(nut);
    }

    palmGroup.add(crown);
    this.scene.add(palmGroup);
  }

  // Ultra-Realistic Banana Plant with Broad Arching Leaves & Fruit Bunch (നേന്ത്രവാഴ)
  createBananaPlant(x, z, hasBunch = true) {
    const bananaGroup = new THREE.Group();
    bananaGroup.position.set(x, 0.25, z);

    // Juicy green/brown layered pseudostem
    const stemMat = new THREE.MeshStandardMaterial({ color: 0x7cb342, roughness: 0.6 });
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.42, 3.4, 8), stemMat);
    stem.position.y = 1.7;
    stem.castShadow = true;
    bananaGroup.add(stem);

    // 8 Grand Arching Broad Leaves with midribs (പച്ച വാഴയിലകൾ)
    const leafCount = 8;
    for (let i = 0; i < leafCount; i++) {
      const angle = (i / leafCount) * Math.PI * 2;
      const leafGroup = new THREE.Group();
      leafGroup.position.set(0, 3.2, 0);
      leafGroup.rotation.y = angle;

      // Curved wide paddle leaf
      const leafGeo = new THREE.PlaneGeometry(1.4, 3.8, 4, 4);
      const leaf = new THREE.Mesh(leafGeo, this.matBananaLeaf);
      leaf.position.set(0, -0.4, 1.8);
      leaf.rotation.x = 0.55;
      leaf.castShadow = true;
      leafGroup.add(leaf);

      bananaGroup.add(leafGroup);
      this.bananaLeaves.push(leaf);
    }

    // Heavy Golden-Green Banana Fruit Bunch (ഏത്തക്കുല & വാഴക്കൂമ്പ്)
    if (hasBunch) {
      const bunchGroup = new THREE.Group();
      bunchGroup.position.set(0, 2.4, 0.65);

      // Curved stalk
      const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 1.1), stemMat);
      stalk.rotation.x = 0.4;
      bunchGroup.add(stalk);

      // Tiered banana fingers (കൈകൾ)
      const bananaMat = new THREE.MeshStandardMaterial({ color: 0xd4e157, roughness: 0.5 });
      for (let tier = 0; tier < 4; tier++) {
        for (let b = 0; b < 6; b++) {
          const bAng = (b / 6) * Math.PI * 2;
          const finger = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.35, 5), bananaMat);
          finger.position.set(Math.cos(bAng) * 0.28, -tier * 0.22, Math.sin(bAng) * 0.28);
          finger.rotation.z = Math.cos(bAng) * 0.4;
          bunchGroup.add(finger);
        }
      }

      // Purple/Maroon Terminal Inflorescence Bell (വാഴക്കൂമ്പ്)
      const budMat = new THREE.MeshStandardMaterial({ color: 0x4a148c, roughness: 0.4 });
      const bud = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.5, 7), budMat);
      bud.rotation.x = Math.PI;
      bud.position.set(0, -1.1, 0);
      bunchGroup.add(bud);

      bananaGroup.add(bunchGroup);
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

  // Animate water ripples, flowing canal, and swaying foliage in render loop
  animate(delta, time) {
    // 1. Sway palm leaves & banana leaves in the tropical breeze
    const wind = Math.sin(time * 1.6) * 0.045;
    for (let frond of this.palmFronds) {
      frond.rotation.z = wind;
    }

    const bananaWind = Math.sin(time * 1.2) * 0.035;
    for (let bLeaf of this.bananaLeaves) {
      bLeaf.rotation.z = bananaWind;
    }

    // 2. Animate flowing canal water ripples (continuous fluid downstream flow)
    for (let tex of this.waterNormalTextures) {
      tex.offset.y += delta * 0.05;
      tex.offset.x += Math.sin(time * 0.8) * 0.005;
    }

    // 3. Gentle water surface elevation shimmer
    for (let w of this.waterMeshes) {
      w.position.y += Math.sin(time * 2.8 + w.position.x * 0.5) * 0.0006;
    }
  }
}
