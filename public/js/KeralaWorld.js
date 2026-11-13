import * as THREE from 'three';

/**
 * Procedural 3D Kerala Village Environment
 * Generates coconut palms, banana trees, traditional tile-roof house,
 * stone well, village market stall, and farm boundaries.
 */
export class KeralaWorld {
  constructor(scene, nightLightsGroup) {
    this.scene = scene;
    this.nightLightsGroup = nightLightsGroup;

    // Interactive objects
    this.wellTrigger = null;
    this.shopTrigger = null;

    // Animated objects (wind sway)
    this.palmFronds = [];

    this.buildWorld();
  }

  buildWorld() {
    this.buildTerrain();
    this.buildKeralaHouse();
    this.buildStoneWell();
    this.buildVillageShop();
    this.buildFlora();
    this.buildFences();
  }

  // 1. Terrain: Grass + Red Laterite Soil Roads
  buildTerrain() {
    // Main grass meadow
    const groundGeo = new THREE.PlaneGeometry(160, 160, 32, 32);
    const groundMat = new THREE.MeshLambertMaterial({ color: 0x4caf50 }); // Lush tropical green
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Red Laterite / Chemman path to the house and market
    const pathGeo = new THREE.PlaneGeometry(6, 40);
    const pathMat = new THREE.MeshLambertMaterial({ color: 0xbf360c }); // Rich Kerala red earth
    const path = new THREE.Mesh(pathGeo, pathMat);
    path.rotation.x = -Math.PI / 2;
    path.position.set(0, 0.02, 12);
    path.receiveShadow = true;
    this.scene.add(path);

    // Lateral path to market
    const pathEastGeo = new THREE.PlaneGeometry(24, 5);
    const pathEast = new THREE.Mesh(pathEastGeo, pathMat);
    pathEast.rotation.x = -Math.PI / 2;
    pathEast.position.set(12, 0.02, 2);
    pathEast.receiveShadow = true;
    this.scene.add(pathEast);
  }

  // 2. Traditional Kerala House (ഓടുമേഞ്ഞ വീട്)
  buildKeralaHouse() {
    const houseGroup = new THREE.Group();
    houseGroup.position.set(-16, 0, -18);

    // White plaster base walls
    const wallMat = new THREE.MeshLambertMaterial({ color: 0xf5f5f0 });
    const woodMat = new THREE.MeshLambertMaterial({ color: 0x4e342e }); // Dark teak wood
    const tileMat = new THREE.MeshLambertMaterial({ color: 0xc62828 }); // Red clay tiles (ഓട്)

    // Main building
    const mainBody = new THREE.Mesh(new THREE.BoxGeometry(14, 5, 10), wallMat);
    mainBody.position.y = 2.5;
    mainBody.castShadow = true;
    mainBody.receiveShadow = true;
    houseGroup.add(mainBody);

    // Wooden Verandah / Charupadi (ചാരുപടി)
    const porchFloor = new THREE.Mesh(new THREE.BoxGeometry(14, 0.4, 4), woodMat);
    porchFloor.position.set(0, 0.2, 7);
    porchFloor.receiveShadow = true;
    houseGroup.add(porchFloor);

    // Wooden pillars (തൂണുകൾ)
    for (let x of [-6, -2, 2, 6]) {
      const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 4.5), woodMat);
      pillar.position.set(x, 2.25, 8.5);
      pillar.castShadow = true;
      houseGroup.add(pillar);
    }

    // Traditional Sloping Tile Roof (ഓടുമേഞ്ഞ മേൽക്കൂര)
    const roofGeo = new THREE.ConeGeometry(12, 4.5, 4);
    const roof = new THREE.Mesh(roofGeo, tileMat);
    roof.position.y = 7;
    roof.rotation.y = Math.PI / 4;
    roof.scale.set(1.4, 1, 1.1);
    roof.castShadow = true;
    houseGroup.add(roof);

    // Porch awning roof
    const porchRoofGeo = new THREE.BoxGeometry(14.4, 0.5, 4.5);
    const porchRoof = new THREE.Mesh(porchRoofGeo, tileMat);
    porchRoof.position.set(0, 4.8, 7.2);
    porchRoof.rotation.x = 0.2;
    porchRoof.castShadow = true;
    houseGroup.add(porchRoof);

    // Door
    const door = new THREE.Mesh(new THREE.PlaneGeometry(2, 3.5), woodMat);
    door.position.set(0, 2, 5.02);
    houseGroup.add(door);

    // Windows
    const winMat = new THREE.MeshLambertMaterial({ color: 0x3e2723 });
    const win1 = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 1.8), winMat);
    win1.position.set(-4, 2.5, 5.02);
    const win2 = win1.clone();
    win2.position.x = 4;
    houseGroup.add(win1);
    houseGroup.add(win2);

    // Warm veranda lantern (turns on at dusk)
    const lantern = new THREE.PointLight(0xffa726, 0.8, 12);
    lantern.position.set(0, 3.8, 8);
    this.nightLightsGroup.add(lantern);

    this.scene.add(houseGroup);
  }

  // 3. Stone Well (തുടികെട്ടിയ കിണർ) - Refills water!
  buildStoneWell() {
    const wellGroup = new THREE.Group();
    wellGroup.position.set(-8, 0, 8);

    const stoneMat = new THREE.MeshLambertMaterial({ color: 0x78909c }); // Granite grey stone
    const woodMat = new THREE.MeshLambertMaterial({ color: 0x5d4037 });
    const waterMat = new THREE.MeshBasicMaterial({ color: 0x0288d1 }); // Blue water inside

    // Circular stone wall
    const wallGeo = new THREE.CylinderGeometry(2.2, 2.4, 1.6, 16, 1, true);
    const wall = new THREE.Mesh(wallGeo, stoneMat);
    wall.position.y = 0.8;
    wall.castShadow = true;
    wall.receiveShadow = true;
    wellGroup.add(wall);

    // Water surface inside
    const water = new THREE.Mesh(new THREE.CircleGeometry(2, 16), waterMat);
    water.rotation.x = -Math.PI / 2;
    water.position.y = 0.5;
    wellGroup.add(water);

    // Wooden upright supports
    const postGeo = new THREE.CylinderGeometry(0.12, 0.12, 3.5);
    const postLeft = new THREE.Mesh(postGeo, woodMat);
    postLeft.position.set(-1.8, 1.75, 0);
    postLeft.castShadow = true;
    const postRight = postLeft.clone();
    postRight.position.x = 1.8;
    wellGroup.add(postLeft);
    wellGroup.add(postRight);

    // Top crossbeam
    const crossBeam = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 4), woodMat);
    crossBeam.rotation.z = Math.PI / 2;
    crossBeam.position.y = 3.5;
    wellGroup.add(crossBeam);

    // Pulley wheel (കപ്പി)
    const pulley = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.15, 12), woodMat);
    pulley.rotation.x = Math.PI / 2;
    pulley.position.set(0, 3.1, 0);
    wellGroup.add(pulley);

    // Hanging rope & bucket
    const ropeMat = new THREE.MeshBasicMaterial({ color: 0xd7ccc8 });
    const rope = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.8), ropeMat);
    rope.position.set(0, 2.2, 0);
    wellGroup.add(rope);

    const bucketMat = new THREE.MeshLambertMaterial({ color: 0x37474f });
    const bucket = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.25, 0.5, 8), bucketMat);
    bucket.position.set(0, 1.2, 0);
    bucket.castShadow = true;
    wellGroup.add(bucket);

    this.wellTrigger = {
      position: wellGroup.position,
      radius: 4.5
    };

    this.scene.add(wellGroup);
  }

  // 4. Village Market Stall (നാടൻ പച്ചക്കറി ചന്ത / ചായക്കട)
  buildVillageShop() {
    const shopGroup = new THREE.Group();
    shopGroup.position.set(24, 0, 4);

    const woodMat = new THREE.MeshLambertMaterial({ color: 0x5d4037 });
    const awningMat = new THREE.MeshLambertMaterial({ color: 0xe65100 }); // Saffron/Orange awning
    const counterMat = new THREE.MeshLambertMaterial({ color: 0x8d6e63 });

    // Stall base and wooden floor
    const floor = new THREE.Mesh(new THREE.BoxGeometry(8, 0.4, 6), woodMat);
    floor.position.y = 0.2;
    shopGroup.add(floor);

    // Counter table
    const counter = new THREE.Mesh(new THREE.BoxGeometry(7, 1.4, 1.2), counterMat);
    counter.position.set(0, 0.9, 1.5);
    counter.castShadow = true;
    shopGroup.add(counter);

    // Wooden upright posts
    for (let x of [-3.5, 3.5]) {
      for (let z of [-2.5, 2.5]) {
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 4), woodMat);
        pole.position.set(x, 2, z);
        pole.castShadow = true;
        shopGroup.add(pole);
      }
    }

    // Slanted striped awning roof
    const roof = new THREE.Mesh(new THREE.BoxGeometry(9, 0.3, 7.5), awningMat);
    roof.position.set(0, 4.1, 0.3);
    roof.rotation.x = 0.15;
    roof.castShadow = true;
    shopGroup.add(roof);

    // Vegetable crates on the counter
    const crateMat = new THREE.MeshLambertMaterial({ color: 0xa1887f });
    for (let i = -2; i <= 2; i += 2) {
      const crate = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.4, 0.8), crateMat);
      crate.position.set(i, 1.7, 1.5);
      shopGroup.add(crate);
    }

    // Friendly Shopkeeper NPC
    const vendorGroup = new THREE.Group();
    vendorGroup.position.set(0, 0, -0.2);

    // Vendor Body & Shirt
    const bodyMat = new THREE.MeshLambertMaterial({ color: 0xfff9c4 }); // Cream jubba
    const vendorBody = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.45, 1.6, 8), bodyMat);
    vendorBody.position.y = 1.6;
    vendorGroup.add(vendorBody);

    // Head
    const skinMat = new THREE.MeshLambertMaterial({ color: 0x8d5524 });
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.32, 10, 10), skinMat);
    head.position.y = 2.65;
    vendorGroup.add(head);

    shopGroup.add(vendorGroup);

    // Shop sign
    const signBoard = new THREE.Mesh(new THREE.BoxGeometry(4.5, 1, 0.15), woodMat);
    signBoard.position.set(0, 4.4, 2.8);
    shopGroup.add(signBoard);

    // Night lantern
    const shopLantern = new THREE.PointLight(0xffb74d, 1.0, 15);
    shopLantern.position.set(24, 3.8, 6);
    this.nightLightsGroup.add(shopLantern);

    this.shopTrigger = {
      position: shopGroup.position,
      radius: 5.5
    };

    this.scene.add(shopGroup);
  }

  // 5. Kerala Flora: Coconut Palms (തെങ്ങുകൾ) & Banana Plants (വാഴകൾ)
  buildFlora() {
    // Coconut Palm positions around the farm perimeter and house
    const palmPositions = [
      [-28, -25], [-22, -28], [-12, -32], [0, -30], [15, -28], [28, -22],
      [-32, 0], [-35, 15], [-28, 28], [32, 18], [35, -5], [20, 28], [5, 32], [-10, 30]
    ];

    palmPositions.forEach(([x, z]) => {
      this.createCoconutPalm(x, z);
    });

    // Banana plants near the water well and house
    const bananaPositions = [
      [-14, 6], [-12, 10], [-15, 12], [-6, 14], [-24, -8], [-22, -5], [16, -12]
    ];

    bananaPositions.forEach(([x, z]) => {
      this.createBananaPlant(x, z);
    });
  }

  // Procedural Coconut Palm (തെങ്ങ്)
  createCoconutPalm(x, z) {
    const palm = new THREE.Group();
    palm.position.set(x, 0, z);

    const trunkMat = new THREE.MeshLambertMaterial({ color: 0x6d4c41 }); // Grey-brown trunk
    const leafMat = new THREE.MeshLambertMaterial({ color: 0x2e7d32, side: THREE.DoubleSide }); // Palm green
    const nutMat = new THREE.MeshLambertMaterial({ color: 0x4e342e });

    // Curved segmented trunk (leaning naturally)
    const trunkSegments = 7;
    let currentY = 0;
    const leanAngle = (Math.random() - 0.5) * 0.18;
    let currentXOffset = 0;

    for (let i = 0; i < trunkSegments; i++) {
      const radiusBottom = 0.55 - i * 0.035;
      const radiusTop = radiusBottom - 0.035;
      const height = 1.6;

      const seg = new THREE.Mesh(
        new THREE.CylinderGeometry(radiusTop, radiusBottom, height, 8),
        trunkMat
      );
      currentXOffset += Math.sin(leanAngle) * 0.4;
      seg.position.set(currentXOffset, currentY + height / 2, 0);
      seg.rotation.z = -leanAngle * (i * 0.15);
      seg.castShadow = true;
      palm.add(seg);

      currentY += height;
    }

    // Crown of Coconut Fronds (ഓലകൾ)
    const frondsGroup = new THREE.Group();
    frondsGroup.position.set(currentXOffset, currentY, 0);

    const numFronds = 10;
    for (let i = 0; i < numFronds; i++) {
      const angle = (i / numFronds) * Math.PI * 2;
      const frond = new THREE.Group();
      frond.rotation.y = angle;

      // Curved palm leaf geometry
      const leafGeo = new THREE.PlaneGeometry(1.2, 5.5, 2, 6);
      const leafMesh = new THREE.Mesh(leafGeo, leafMat);
      leafMesh.position.set(0, 0, 2.5);
      leafMesh.rotation.x = Math.PI / 2 - 0.45;
      leafMesh.castShadow = true;
      frond.add(leafMesh);

      frondsGroup.add(frond);
      this.palmFronds.push(leafMesh);
    }

    // Coconuts cluster
    for (let c = 0; c < 5; c++) {
      const nut = new THREE.Mesh(new THREE.SphereGeometry(0.3, 6, 6), nutMat);
      const nutAngle = (c / 5) * Math.PI * 2;
      nut.position.set(Math.cos(nutAngle) * 0.5, -0.2, Math.sin(nutAngle) * 0.5);
      frondsGroup.add(nut);
    }

    palm.add(frondsGroup);
    this.scene.add(palm);
  }

  // Procedural Banana Plant (വാഴ)
  createBananaPlant(x, z) {
    const banana = new THREE.Group();
    banana.position.set(x, 0, z);

    const stemMat = new THREE.MeshLambertMaterial({ color: 0x66bb6a });
    const leafMat = new THREE.MeshLambertMaterial({ color: 0x388e3c, side: THREE.DoubleSide });

    // Stem
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.35, 3, 7), stemMat);
    stem.position.y = 1.5;
    stem.castShadow = true;
    banana.add(stem);

    // Broad tropical leaves
    const numLeaves = 6;
    for (let i = 0; i < numLeaves; i++) {
      const angle = (i / numLeaves) * Math.PI * 2;
      const leafGeo = new THREE.PlaneGeometry(1.3, 3.2);
      const leaf = new THREE.Mesh(leafGeo, leafMat);
      leaf.position.set(0, 2.8, 0);
      leaf.rotation.y = angle;
      leaf.rotation.x = 0.6;
      leaf.rotation.z = 0.2;
      leaf.castShadow = true;
      banana.add(leaf);
    }

    this.scene.add(banana);
  }

  // 6. Perimeter Wooden Fences
  buildFences() {
    const fenceMat = new THREE.MeshLambertMaterial({ color: 0x5d4037 });
    const postGeo = new THREE.CylinderGeometry(0.1, 0.1, 1.4);
    const railGeo = new THREE.BoxGeometry(3, 0.1, 0.08);

    // Boundary perimeter
    const side = 40;
    const addFenceSegment = (x, z, rotY) => {
      const group = new THREE.Group();
      group.position.set(x, 0, z);
      group.rotation.y = rotY;

      const post1 = new THREE.Mesh(postGeo, fenceMat);
      post1.position.set(-1.5, 0.7, 0);
      post1.castShadow = true;
      group.add(post1);

      const post2 = new THREE.Mesh(postGeo, fenceMat);
      post2.position.set(1.5, 0.7, 0);
      post2.castShadow = true;
      group.add(post2);

      const rail1 = new THREE.Mesh(railGeo, fenceMat);
      rail1.position.y = 0.5;
      group.add(rail1);

      const rail2 = new THREE.Mesh(railGeo, fenceMat);
      rail2.position.y = 1.0;
      group.add(rail2);

      this.scene.add(group);
    };

    // Border along north and west
    for (let x = -30; x <= 30; x += 3) {
      if (Math.abs(x) > 6) addFenceSegment(x, -35, 0);
    }
  }

  // Wind animation loop
  animate(time) {
    const wind = Math.sin(time * 1.5) * 0.05;
    for (let frond of this.palmFronds) {
      frond.rotation.z = wind;
    }
  }
}
