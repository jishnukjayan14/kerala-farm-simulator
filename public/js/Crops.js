import * as THREE from 'three';

/**
 * Procedural 3D Crop Models with 4 Growth Stages
 * Supports: Carrot (കാരറ്റ്), Tomato (തക്കാളി), Pumpkin (മത്തങ്ങ), Wheat/Paddy (നെല്ല്)
 */
export class CropModels {
  static createCropMesh(cropType, stage = 0) {
    const group = new THREE.Group();

    // Stage 0: Sprout (ചെറിയ പച്ച മുള)
    if (stage === 0) {
      const stemMat = new THREE.MeshLambertMaterial({ color: 0x81c784 });
      const shoot1 = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.25, 4), stemMat);
      shoot1.position.set(-0.06, 0.12, 0);
      shoot1.rotation.z = 0.2;
      group.add(shoot1);

      const shoot2 = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.3, 4), stemMat);
      shoot2.position.set(0.06, 0.14, 0);
      shoot2.rotation.z = -0.2;
      group.add(shoot2);
      return group;
    }

    // Stage 1: Seedling (വളരുന്ന ചെടി)
    if (stage === 1) {
      const stemMat = new THREE.MeshLambertMaterial({ color: 0x4caf50 });
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.06, 0.5, 5), stemMat);
      stem.position.y = 0.25;
      group.add(stem);

      const leafGeo = new THREE.PlaneGeometry(0.2, 0.3);
      for (let a of [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2]) {
        const leaf = new THREE.Mesh(leafGeo, stemMat);
        leaf.position.set(0, 0.4, 0);
        leaf.rotation.y = a;
        leaf.rotation.x = 0.4;
        group.add(leaf);
      }
      return group;
    }

    // Stage 2: Vegetative Bush / Flowering
    if (stage === 2) {
      const plantMat = new THREE.MeshLambertMaterial({ color: 0x388e3c });
      const bush = new THREE.Mesh(new THREE.DodecahedronGeometry(0.35, 1), plantMat);
      bush.position.y = 0.4;
      bush.scale.set(1.2, 1, 1.2);
      group.add(bush);

      // Yellow flower buds
      const flowerMat = new THREE.MeshBasicMaterial({ color: 0xffeb3b });
      for (let i = 0; i < 4; i++) {
        const flower = new THREE.Mesh(new THREE.SphereGeometry(0.05, 4, 4), flowerMat);
        const ang = (i / 4) * Math.PI * 2;
        flower.position.set(Math.cos(ang) * 0.25, 0.55, Math.sin(ang) * 0.25);
        group.add(flower);
      }
      return group;
    }

    // Stage 3: Fully Mature & Harvestable!
    if (cropType === 'carrot') {
      // Carrot foliage
      const leafMat = new THREE.MeshLambertMaterial({ color: 0x2e7d32 });
      for (let i = 0; i < 5; i++) {
        const ang = (i / 5) * Math.PI * 2;
        const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.6, 4), leafMat);
        leaf.position.set(Math.cos(ang) * 0.1, 0.35, Math.sin(ang) * 0.1);
        leaf.rotation.z = Math.sin(ang) * 0.3;
        leaf.rotation.x = Math.cos(ang) * 0.3;
        group.add(leaf);
      }

      // Plump orange carrot top protruding from dirt
      const carrotMat = new THREE.MeshLambertMaterial({ color: 0xf57c00 });
      const carrot = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.5, 8), carrotMat);
      carrot.rotation.x = Math.PI;
      carrot.position.y = 0.15;
      group.add(carrot);

    } else if (cropType === 'tomato') {
      // Tomato vine bush
      const vineMat = new THREE.MeshLambertMaterial({ color: 0x2e7d32 });
      const vine = new THREE.Mesh(new THREE.DodecahedronGeometry(0.42, 1), vineMat);
      vine.position.y = 0.5;
      group.add(vine);

      // Juicy ripe red tomatoes
      const tomatoMat = new THREE.MeshLambertMaterial({ color: 0xd32f2f });
      const positions = [
        [0.25, 0.45, 0.15],
        [-0.2, 0.5, 0.2],
        [0.05, 0.35, -0.28],
        [-0.15, 0.6, -0.15]
      ];
      positions.forEach(([x, y, z]) => {
        const tomato = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), tomatoMat);
        tomato.position.set(x, y, z);
        group.add(tomato);
      });

    } else if (cropType === 'pumpkin') {
      // Large sprawling pumpkin
      const leafMat = new THREE.MeshLambertMaterial({ color: 0x33691e });
      const leaf1 = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.4), leafMat);
      leaf1.position.set(-0.35, 0.12, 0);
      leaf1.rotation.x = -Math.PI / 3;
      group.add(leaf1);

      const leaf2 = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.4), leafMat);
      leaf2.position.set(0.35, 0.12, 0.2);
      leaf2.rotation.x = -Math.PI / 3;
      group.add(leaf2);

      // Golden pumpkin body
      const pumpMat = new THREE.MeshLambertMaterial({ color: 0xe65100 });
      const pumpkin = new THREE.Mesh(new THREE.SphereGeometry(0.45, 10, 8), pumpMat);
      pumpkin.scale.set(1.2, 0.85, 1.2);
      pumpkin.position.y = 0.35;
      group.add(pumpkin);

      // Green stem
      const stemMat = new THREE.MeshLambertMaterial({ color: 0x558b2f });
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.18), stemMat);
      stem.position.y = 0.72;
      group.add(stem);

    } else {
      // Wheat / Paddy (നെല്ല് / ഗോതമ്പ്) - Golden sheaf
      const paddyMat = new THREE.MeshLambertMaterial({ color: 0xfbc02d }); // Golden yellow
      for (let i = 0; i < 7; i++) {
        const angle = (i / 7) * Math.PI * 2;
        const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.03, 0.8), paddyMat);
        stalk.position.set(Math.cos(angle) * 0.12, 0.4, Math.sin(angle) * 0.12);
        stalk.rotation.z = Math.sin(angle) * 0.15;
        group.add(stalk);

        const ear = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.35, 5), paddyMat);
        ear.position.set(Math.cos(angle) * 0.18, 0.85, Math.sin(angle) * 0.18);
        group.add(ear);
      }
    }

    // Golden harvest bounce aura
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0xffeb3b,
      wireframe: true,
      transparent: true,
      opacity: 0.25
    });
    const aura = new THREE.Mesh(new THREE.RingGeometry(0.35, 0.45, 8), glowMat);
    aura.rotation.x = -Math.PI / 2;
    aura.position.y = 0.02;
    group.add(aura);

    return group;
  }
}
