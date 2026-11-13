import * as THREE from 'three';

/**
 * Open World Kerala Village Environment (വിശാലമായ കേരള ഗ്രാമം)
 * Features:
 * - 400x400m expandable terrain with hills and horizon
 * - Main asphalt road (ടാർ റോഡ്) with road markings
 * - Secondary red laterite tracks (ചെമ്മൺ റോഡ്)
 * - Sunken irrigation canal (ജലസേചന തോട്) with flowing water and bridges
 * - Wetland Paddy Basin with elevated mud bunds (വരമ്പുകൾ)
 * - Dedicated Agricultural Zones:
 *   1. താഴ്ന്ന നെൽപ്പാടം (Wetland Paddy Basin)
 *   2. വാഴത്തോട്ടം (Banana Plantation)
 *   3. കപ്പത്തോട്ടം (Tapioca Field)
 *   4. പച്ചക്കറി പന്തൽ (Vegetable Trellis)
 *   5. ഗ്രാമ ചന്ത & തറവാട് (Village Market, House, Well, Tractor Shed)
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
    this.waterMeshes = [];
    this.waterOffset = 0;

    // Defined world zones for player navigation & HUD
    this.zones = [
      { name: 'താഴ്ന്ന നെൽപ്പാടം (Wetland Paddy)', xMin: -70, xMax: -10, zMin: -20, zMax: 50 },
      { name: 'വാഴത്തോട്ടം (Banana Grove)', xMin: -65, xMax: -20, zMin: -70, zMax: -25 },
      { name: 'കപ്പത്തോട്ടം (Tapioca Field)', xMin: 20, xMax: 65, zMin: -70, zMax: -25 },
      { name: 'പച്ചക്കറി പന്തൽ (Vegetable Trellis)', xMin: 20, xMax: 65, zMin: -20, zMax: 20 },
      { name: 'ഗ്രാമ ചന്ത (Village Market)', xMin: 15, xMax: 50, zMin: 25, zMax: 60 },
      { name: 'തറവാട് വീട് (Farmhouse)', xMin: -25, xMax: 10, zMin: -65, zMax: -30 },
      { name: 'മെയിൻ റോഡ് (Main Village Road)', xMin: -8, xMax: 8, zMin: -100, zMax: 100 }
    ];

    this.buildWorld();
  }

  buildWorld() {
    this.buildOpenWorldTerrain();
    this.buildRoadNetwork();
    this.buildIrrigationCanal();
    this.buildPaddyWetlandBasin();
    this.buildHighlandBananaPlantation();
    this.buildTapiocaField();
    this.buildVegetableTrellis();
    this.buildKeralaHouse();
    this.buildTractorShed();
    this.buildStoneWell();
    this.buildVillageShop();
    this.buildFlora();
  }

  // 1. Broad Open-World Landscape (400x400m) with Distant Tropical Hills
  buildOpenWorldTerrain() {
    // Base green grass terrain
    const groundGeo = new THREE.PlaneGeometry(360, 360, 48, 48);
    const groundMat = new THREE.MeshLambertMaterial({ color: 0x3d7e34 }); // Deep tropical paddy green
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Distant tropical rolling hills around horizon (backdrop)
    const hillMat = new THREE.MeshLambertMaterial({ color: 0x245822 });
    const hillPositions = [
      [-130, 8, -140, 70], [0, 12, -150, 90], [120, 10, -140, 80],
      [-150, 9, 0, 75], [150, 11, 0, 85],
      [-130, 8, 140, 70], [0, 10, 150, 85], [130, 9, 140, 75]
    ];

    hillPositions.forEach(([x, y, z, rad]) => {
      const hill = new THREE.Mesh(new THREE.ConeGeometry(rad, y * 2.2, 12), hillMat);
      hill.position.set(x, y, z);
      hill.scale.set(1.4, 1, 1.4);
      this.scene.add(hill);
    });
  }

  // 2. Road Network: Asphalt Tar Road + Red Laterite Roads + Culvert Bridges
  buildRoadNetwork() {
    const roadMat = new THREE.MeshStandardMaterial({
      color: 0x2b2b2b, // Dark asphalt
      roughness: 0.9,
      metalness: 0.05
    });

    const markMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const chemmanMat = new THREE.MeshLambertMaterial({ color: 0xa84223 }); // Rich Kerala Red Earth

    // A. Main North-South Asphalt Village Road (Runs length of map)
    const mainRoadGeo = new THREE.PlaneGeometry(8, 260);
    const mainRoad = new THREE.Mesh(mainRoadGeo, roadMat);
    mainRoad.rotation.x = -Math.PI / 2;
    mainRoad.position.set(0, 0.03, 0);
    mainRoad.receiveShadow = true;
    this.scene.add(mainRoad);

    // Center Dashed White Road Markings
    for (let z = -120; z <= 120; z += 12) {
      const dash = new THREE.Mesh(new THREE.PlaneGeometry(0.35, 6), markMat);
      dash.rotation.x = -Math.PI / 2;
      dash.position.set(0, 0.04, z);
      this.scene.add(dash);
    }

    // B. East Branch Road to Village Market (Tar road)
    const eastRoadGeo = new THREE.PlaneGeometry(50, 7);
    const eastRoad = new THREE.Mesh(eastRoadGeo, roadMat);
    eastRoad.rotation.x = -Math.PI / 2;
    eastRoad.position.set(29, 0.03, 38);
    eastRoad.receiveShadow = true;
    this.scene.add(eastRoad);

    // C. West Chemman Laterite Road to Paddy Fields (ചെമ്മൺ റോഡ്)
    const westRoadGeo = new THREE.PlaneGeometry(60, 6);
    const westRoad = new THREE.Mesh(westRoadGeo, chemmanMat);
    westRoad.rotation.x = -Math.PI / 2;
    westRoad.position.set(-34, 0.035, 12);
    westRoad.receiveShadow = true;
    this.scene.add(westRoad);

    // North Chemman Track to House & Highlands
    const northTrackGeo = new THREE.PlaneGeometry(45, 5);
    const northTrack = new THREE.Mesh(northTrackGeo, chemmanMat);
    northTrack.rotation.x = -Math.PI / 2;
    northTrack.position.set(-20, 0.035, -45);
    northTrack.receiveShadow = true;
    this.scene.add(northTrack);
  }

  // 3. Irrigation Canal (ജലസേചന തോട്) with Flowing Water and Bridge
  buildIrrigationCanal() {
    const concreteMat = new THREE.MeshLambertMaterial({ color: 0x757575 });
    const canalWaterMat = new THREE.MeshStandardMaterial({
      color: 0x00695c, // Deep tropical teal water
      roughness: 0.15,
      metalness: 0.1,
      transparent: true,
      opacity: 0.85
    });

    // Canal trench running parallel to paddy fields from north to south
    const canalLen = 140;
    const canalWidth = 5;
    const canalX = -12;

    // Concrete embankments (തോട്ടുവരമ്പ്)
    const leftBank = new THREE.Mesh(new THREE.BoxGeometry(0.6, 1.2, canalLen), concreteMat);
    leftBank.position.set(canalX - canalWidth / 2, 0.4, 15);
    leftBank.castShadow = true;
    this.scene.add(leftBank);

    const rightBank = new THREE.Mesh(new THREE.BoxGeometry(0.6, 1.2, canalLen), concreteMat);
    rightBank.position.set(canalX + canalWidth / 2, 0.4, 15);
    rightBank.castShadow = true;
    this.scene.add(rightBank);

    // Water Surface inside canal
    const waterGeo = new THREE.PlaneGeometry(canalWidth * 0.95, canalLen);
    const waterMesh = new THREE.Mesh(waterGeo, canalWaterMat);
    waterMesh.rotation.x = -Math.PI / 2;
    waterMesh.position.set(canalX, 0.18, 15);
    this.scene.add(waterMesh);
    this.waterMeshes.push(waterMesh);

    // Stone / Wooden Culvert Bridge (തോട്ടിലെ പാലം) where West Road crosses
    const bridgeWoodMat = new THREE.MeshStandardMaterial({ color: 0x4e342e, roughness: 0.8 });
    const bridgeFloor = new THREE.Mesh(new THREE.BoxGeometry(canalWidth + 2.5, 0.35, 7.5), bridgeWoodMat);
    bridgeFloor.position.set(canalX, 0.7, 12);
    bridgeFloor.castShadow = true;
    bridgeFloor.receiveShadow = true;
    this.scene.add(bridgeFloor);

    // Bridge Railings
    const railingGeo = new THREE.BoxGeometry(canalWidth + 2.5, 0.8, 0.15);
    const railNorth = new THREE.Mesh(railingGeo, bridgeWoodMat);
    railNorth.position.set(canalX, 1.3, 15.6);
    this.scene.add(railNorth);

    const railSouth = new THREE.Mesh(railingGeo, bridgeWoodMat);
    railSouth.position.set(canalX, 1.3, 8.4);
    this.scene.add(railSouth);
  }

  // 4. Wetland Paddy Basin with Earthen Bunds (ചെളിക്കണ്ടങ്ങളും വരമ്പുകളും)
  buildPaddyWetlandBasin() {
    const mudMat = new THREE.MeshStandardMaterial({
      color: 0x3d271d, // Dark flooded clay/mud (ചെളി)
      roughness: 0.9
    });

    const bundMat = new THREE.MeshLambertMaterial({ color: 0x6d4c41 }); // Earthen bund walkways (വരമ്പ്)
    const paddyWaterMat = new THREE.MeshStandardMaterial({
      color: 0x2e4933,
      roughness: 0.1,
      metalness: 0.2,
      transparent: true,
      opacity: 0.7
    });

    // 4 Distinct Paddy Polders/Fields (നാല് വലിയ കണ്ടങ്ങൾ)
    const polders = [
      { x: -28, z: -2, w: 26, h: 22 },
      { x: -58, z: -2, w: 28, h: 22 },
      { x: -28, z: 24, w: 26, h: 24 },
      { x: -58, z: 24, w: 28, h: 24 }
    ];

    polders.forEach((p) => {
      // Sunken Mud Basin (കണ്ടം)
      const mud = new THREE.Mesh(new THREE.PlaneGeometry(p.w, p.h), mudMat);
      mud.rotation.x = -Math.PI / 2;
      mud.position.set(p.x, 0.02, p.z);
      mud.receiveShadow = true;
      this.scene.add(mud);

      // Flooded Shallow Water Sheet with sky sheen
      const water = new THREE.Mesh(new THREE.PlaneGeometry(p.w * 0.98, p.h * 0.98), paddyWaterMat);
      water.rotation.x = -Math.PI / 2;
      water.position.set(p.x, 0.05, p.z);
      this.scene.add(water);
      this.waterMeshes.push(water);

      // Surrounding Elevated Earthen Bunds (വരമ്പുകൾ)
      const bundThickness = 0.9;
      const bundHeight = 0.22;

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
    const soilMat = new THREE.MeshLambertMaterial({ color: 0x5d4037 });

    // Raised highland ground for bananas
    const moundGeo = new THREE.BoxGeometry(45, 0.4, 40);
    const mound = new THREE.Mesh(moundGeo, soilMat);
    mound.position.set(-42, 0.2, -48);
    mound.receiveShadow = true;
    this.scene.add(mound);

    // Rows of lush Banana trees (നേന്ത്രവാഴകൾ)
    for (let x = -58; x <= -26; x += 8) {
      for (let z = -64; z <= -32; z += 8) {
        this.createBananaPlant(x, z, true); // true = with ripe banana bunch
      }
    }
  }

  // 6. Tapioca Field (കപ്പത്തോട്ടം) with signature earthen mounds
  buildTapiocaField() {
    const redSoilMat = new THREE.MeshLambertMaterial({ color: 0xa84223 });

    // Raised red laterite field
    const field = new THREE.Mesh(new THREE.BoxGeometry(42, 0.35, 40), redSoilMat);
    field.position.set(42, 0.18, -48);
    field.receiveShadow = true;
    this.scene.add(field);

    // Tapioca mounds (കപ്പത്തടങ്ങൾ)
    for (let x = 25; x <= 58; x += 7) {
      for (let z = -64; z <= -32; z += 7) {
        // Soil mound
        const mound = new THREE.Mesh(new THREE.ConeGeometry(1.6, 0.45, 8), redSoilMat);
        mound.position.set(x, 0.45, z);
        this.scene.add(mound);

        // Tapioca palmate plant
        this.createTapiocaPlant(x, z);
      }
    }
  }

  // Procedural Tapioca Plant (കപ്പച്ചെടി)
  createTapiocaPlant(x, z) {
    const plantGroup = new THREE.Group();
    plantGroup.position.set(x, 0.65, z);

    const stemMat = new THREE.MeshLambertMaterial({ color: 0x8d6e63 }); // Brown segmented stem
    const leafMat = new THREE.MeshLambertMaterial({ color: 0x2e7d32, side: THREE.DoubleSide });

    // Stalk
    const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.06, 1.8, 6), stemMat);
    stalk.position.y = 0.9;
    stalk.castShadow = true;
    plantGroup.add(stalk);

    // Signature 5-7 finger palmate leaves
    for (let h of [0.8, 1.4, 1.8]) {
      for (let i = 0; i < 4; i++) {
        const ang = (i / 4) * Math.PI * 2;
        const petiole = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.4), stemMat);
        petiole.position.set(0, h, 0);
        petiole.rotation.z = Math.PI / 3;
        petiole.rotation.y = ang;

        // Leaf fan
        const fan = new THREE.Mesh(new THREE.CircleGeometry(0.28, 5), leafMat);
        fan.position.set(0.35, h + 0.15, 0);
        fan.rotation.x = Math.PI / 4;
        plantGroup.add(fan);
      }
    }

    this.scene.add(plantGroup);
  }

  // 7. Vegetable Trellis (പച്ചക്കറി പന്തൽ)
  buildVegetableTrellis() {
    const trellisGroup = new THREE.Group();
    trellisGroup.position.set(42, 0, 0);

    const bambooMat = new THREE.MeshLambertMaterial({ color: 0xdce775 }); // Bamboo yellow-green
    const vineMat = new THREE.MeshLambertMaterial({ color: 0x1b5e20 }); // Dark leafy vines
    const gourdMat = new THREE.MeshLambertMaterial({ color: 0x81c784 }); // Hanging gourds

    const width = 28;
    const depth = 20;
    const height = 2.4;

    // Upright bamboo poles
    for (let x = -width / 2; x <= width / 2; x += 7) {
      for (let z = -depth / 2; z <= depth / 2; z += 5) {
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, height, 6), bambooMat);
        pole.position.set(x, height / 2, z);
        pole.castShadow = true;
        trellisGroup.add(pole);
      }
    }

    // Overhead roof grid (പന്തൽ തട്ട്)
    const roofGrid = new THREE.Mesh(new THREE.BoxGeometry(width, 0.1, depth), vineMat);
    roofGrid.position.y = height;
    roofGrid.castShadow = true;
    trellisGroup.add(roofGrid);

    // Hanging vegetables (പാവൽ, പടവലം)
    for (let i = 0; i < 18; i++) {
      const rx = (Math.random() - 0.5) * (width - 4);
      const rz = (Math.random() - 0.5) * (depth - 4);
      const gourd = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.08, 0.7, 6), gourdMat);
      gourd.position.set(rx, height - 0.35, rz);
      trellisGroup.add(gourd);
    }

    this.scene.add(trellisGroup);
  }

  // 8. Traditional Kerala House (ഓടുമേഞ്ഞ തറവാട് വീട്)
  buildKeralaHouse() {
    const houseGroup = new THREE.Group();
    houseGroup.position.set(-6, 0, -48);

    const wallMat = new THREE.MeshLambertMaterial({ color: 0xf5f5f0 });
    const woodMat = new THREE.MeshLambertMaterial({ color: 0x4e342e }); // Dark teak
    const tileMat = new THREE.MeshLambertMaterial({ color: 0xb71c1c }); // Red clay tiles

    // Main house body
    const body = new THREE.Mesh(new THREE.BoxGeometry(16, 5.5, 11), wallMat);
    body.position.y = 2.75;
    body.castShadow = true;
    body.receiveShadow = true;
    houseGroup.add(body);

    // Verandah (വരാന്ത / ചാരുപടി)
    const porch = new THREE.Mesh(new THREE.BoxGeometry(16, 0.4, 4), woodMat);
    porch.position.set(0, 0.2, 7.5);
    porch.receiveShadow = true;
    houseGroup.add(porch);

    // Pillars
    for (let x of [-7, -2.5, 2.5, 7]) {
      const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 5), woodMat);
      pillar.position.set(x, 2.5, 9);
      pillar.castShadow = true;
      houseGroup.add(pillar);
    }

    // Classic Sloping Red Tile Roof (ഓടുമേഞ്ഞ മേൽക്കൂര)
    const roof = new THREE.Mesh(new THREE.ConeGeometry(13.5, 5, 4), tileMat);
    roof.position.y = 7.8;
    roof.rotation.y = Math.PI / 4;
    roof.scale.set(1.5, 1, 1.2);
    roof.castShadow = true;
    houseGroup.add(roof);

    // Door & windows
    const door = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 3.8), woodMat);
    door.position.set(0, 2.1, 5.52);
    houseGroup.add(door);

    this.scene.add(houseGroup);
  }

  // 9. Tractor & Equipment Shed (ട്രാക്ടർ ഷെഡ്)
  buildTractorShed() {
    const shedGroup = new THREE.Group();
    shedGroup.position.set(-28, 0, -48);

    const ironMat = new THREE.MeshStandardMaterial({ color: 0x546e7a, metalness: 0.5, roughness: 0.6 });
    const woodMat = new THREE.MeshLambertMaterial({ color: 0x5d4037 });

    // Open Shed Posts
    for (let x of [-6, 6]) {
      for (let z of [-5, 5]) {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 4.8), ironMat);
        post.position.set(x, 2.4, z);
        post.castShadow = true;
        shedGroup.add(post);
      }
    }

    // Corrugated Tin Roof (ഷീറ്റ് മേൽക്കൂര)
    const roof = new THREE.Mesh(new THREE.BoxGeometry(14, 0.25, 12), ironMat);
    roof.position.set(0, 4.9, 0);
    roof.rotation.z = -0.08;
    roof.castShadow = true;
    shedGroup.add(roof);

    // Tool workbench & oil barrels inside shed
    const bench = new THREE.Mesh(new THREE.BoxGeometry(4, 1.2, 1.4), woodMat);
    bench.position.set(0, 0.6, -3.8);
    shedGroup.add(bench);

    const barrelMat = new THREE.MeshStandardMaterial({ color: 0x0277bd, metalness: 0.8, roughness: 0.2 });
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 1.4, 10), barrelMat);
    barrel.position.set(4, 0.7, -3.5);
    shedGroup.add(barrel);

    this.shedTrigger = { position: shedGroup.position, radius: 7 };
    this.scene.add(shedGroup);
  }

  // 10. Stone Well (തുടികെട്ടിയ കിണർ) - Refills water!
  buildStoneWell() {
    const wellGroup = new THREE.Group();
    wellGroup.position.set(12, 0, -32);

    const stoneMat = new THREE.MeshLambertMaterial({ color: 0x78909c });
    const woodMat = new THREE.MeshLambertMaterial({ color: 0x5d4037 });
    const waterMat = new THREE.MeshBasicMaterial({ color: 0x0288d1 });

    const wall = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.4, 1.6, 16, 1, true), stoneMat);
    wall.position.y = 0.8;
    wall.castShadow = true;
    wall.receiveShadow = true;
    wellGroup.add(wall);

    const water = new THREE.Mesh(new THREE.CircleGeometry(2, 16), waterMat);
    water.rotation.x = -Math.PI / 2;
    water.position.y = 0.5;
    wellGroup.add(water);

    // Posts & Crossbeam
    for (let x of [-1.8, 1.8]) {
      const p = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 3.5), woodMat);
      p.position.set(x, 1.75, 0);
      p.castShadow = true;
      wellGroup.add(p);
    }

    const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 4), woodMat);
    beam.rotation.z = Math.PI / 2;
    beam.position.y = 3.5;
    wellGroup.add(beam);

    this.wellTrigger = { position: wellGroup.position, radius: 5 };
    this.scene.add(wellGroup);
  }

  // 11. Village Market & Tea Stall (ഗ്രാമ ചന്ത / നാടൻ കട)
  buildVillageShop() {
    const shopGroup = new THREE.Group();
    shopGroup.position.set(38, 0, 42);

    const woodMat = new THREE.MeshLambertMaterial({ color: 0x5d4037 });
    const awningMat = new THREE.MeshLambertMaterial({ color: 0xe65100 });
    const counterMat = new THREE.MeshLambertMaterial({ color: 0x8d6e63 });

    // Shop base
    const floor = new THREE.Mesh(new THREE.BoxGeometry(9, 0.4, 7), woodMat);
    floor.position.y = 0.2;
    shopGroup.add(floor);

    // Counter
    const counter = new THREE.Mesh(new THREE.BoxGeometry(8, 1.4, 1.2), counterMat);
    counter.position.set(0, 0.9, 1.8);
    counter.castShadow = true;
    shopGroup.add(counter);

    // Roof poles
    for (let x of [-4, 4]) {
      for (let z of [-3, 3]) {
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 4.2), woodMat);
        pole.position.set(x, 2.1, z);
        pole.castShadow = true;
        shopGroup.add(pole);
      }
    }

    // Awning roof
    const roof = new THREE.Mesh(new THREE.BoxGeometry(10.5, 0.3, 8.5), awningMat);
    roof.position.set(0, 4.2, 0.4);
    roof.rotation.x = 0.15;
    roof.castShadow = true;
    shopGroup.add(roof);

    // Friendly Shopkeeper NPC
    const vendorBody = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.45, 1.6, 8), new THREE.MeshLambertMaterial({ color: 0xfff9c4 }));
    vendorBody.position.set(0, 1.6, 0);
    shopGroup.add(vendorBody);

    const vendorHead = new THREE.Mesh(new THREE.SphereGeometry(0.3, 10, 10), new THREE.MeshLambertMaterial({ color: 0x8d5524 }));
    vendorHead.position.set(0, 2.65, 0);
    shopGroup.add(vendorHead);

    this.shopTrigger = { position: shopGroup.position, radius: 6.5 };
    this.scene.add(shopGroup);
  }

  // 12. Flora: Coconut Palms (തെങ്ങുകൾ) lining canals, roads, and village borders
  buildFlora() {
    // Palms lining the main road and canal
    const roadPalms = [];
    for (let z = -100; z <= 100; z += 18) {
      roadPalms.push([6.5, z]);
      roadPalms.push([-6.5, z]);
    }

    // Palms around paddy basin borders
    const basinPalms = [
      [-75, -2], [-75, 24], [-75, 45],
      [-58, 42], [-28, 42], [-14, 42],
      [-42, -24], [-24, -24]
    ];

    [...roadPalms, ...basinPalms].forEach(([x, z]) => {
      this.createCoconutPalm(x, z);
    });
  }

  // Procedural Coconut Palm
  createCoconutPalm(x, z) {
    const palm = new THREE.Group();
    palm.position.set(x, 0, z);

    const trunkMat = new THREE.MeshLambertMaterial({ color: 0x5d4037 });
    const leafMat = new THREE.MeshLambertMaterial({ color: 0x2e7d32, side: THREE.DoubleSide });

    // Trunk
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.48, 12, 8), trunkMat);
    trunk.position.y = 6;
    trunk.castShadow = true;
    palm.add(trunk);

    // Palm Fronds (ഓലകൾ)
    const crown = new THREE.Group();
    crown.position.y = 12;

    for (let i = 0; i < 9; i++) {
      const angle = (i / 9) * Math.PI * 2;
      const frond = new THREE.Group();
      frond.rotation.y = angle;

      const leaf = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 5.5, 2, 4), leafMat);
      leaf.position.set(0, 0, 2.4);
      leaf.rotation.x = Math.PI / 2 - 0.45;
      leaf.castShadow = true;
      frond.add(leaf);
      crown.add(frond);
      this.palmFronds.push(leaf);
    }

    palm.add(crown);
    this.scene.add(palm);
  }

  // Procedural Banana Plant with optional fruit bunch
  createBananaPlant(x, z, hasBunch = false) {
    const banana = new THREE.Group();
    banana.position.set(x, 0, z);

    const stemMat = new THREE.MeshLambertMaterial({ color: 0x66bb6a });
    const leafMat = new THREE.MeshLambertMaterial({ color: 0x388e3c, side: THREE.DoubleSide });

    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.35, 3.2, 7), stemMat);
    stem.position.y = 1.6;
    stem.castShadow = true;
    banana.add(stem);

    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const leaf = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 3.2), leafMat);
      leaf.position.set(0, 3.0, 0);
      leaf.rotation.y = angle;
      leaf.rotation.x = 0.6;
      leaf.castShadow = true;
      banana.add(leaf);
    }

    // Banana fruit bunch (വാഴക്കുല)
    if (hasBunch) {
      const bunchMat = new THREE.MeshLambertMaterial({ color: 0xfdd835 }); // Golden-yellow ripe bananas
      const bunch = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.35, 0.8, 6), bunchMat);
      bunch.position.set(0, 2.2, 0.4);
      banana.add(bunch);
    }

    this.scene.add(banana);
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

  // Animate water flow & palm fronds in render loop
  animate(delta, time) {
    // Sway palm leaves
    const wind = Math.sin(time * 1.5) * 0.04;
    for (let frond of this.palmFronds) {
      frond.rotation.z = wind;
    }

    // Gentle water shimmer
    for (let w of this.waterMeshes) {
      w.position.y += Math.sin(time * 2.5 + w.position.x) * 0.0008;
    }
  }
}
