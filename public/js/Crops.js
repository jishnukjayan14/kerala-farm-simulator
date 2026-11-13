import * as THREE from 'three';

/**
 * Procedural 3D Crop Models with 4 Authentic Kerala Growth Stages
 * Supports:
 * - Paddy / Rice (നെല്ല്): ഞാറു നടീൽ ➔ പച്ചക്കണ്ടം ➔ കതിരിടൽ ➔ സ്വർണ്ണക്കതിരുകൾ
 * - Tapioca / Cassava (കപ്പ / മരച്ചീനി): തണ്ട് ➔ തളിരിലകൾ ➔ തഴച്ചുവളരൽ ➔ വിളവെടുത്ത കപ്പക്കിഴങ്ങ്
 * - Carrot (കാരറ്റ്), Tomato (തക്കാളി), Pumpkin (മത്തങ്ങ)
 */
export class CropModels {
  static createCropMesh(cropType, stage = 0) {
    const group = new THREE.Group();

    // 1. PADDY / RICE (നെല്ല്) - Authentic Kerala Paddy Cycle
    if (cropType === 'wheat' || cropType === 'paddy') {
      if (stage === 0) {
        // Stage 0: ഞാറു നടീൽ (Young transplanted rice seedlings in water)
        const shootMat = new THREE.MeshLambertMaterial({ color: 0x81c784 });
        for (let i = 0; i < 4; i++) {
          const shoot = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.02, 0.35, 4), shootMat);
          const ang = (i / 4) * Math.PI * 2;
          shoot.position.set(Math.cos(ang) * 0.08, 0.17, Math.sin(ang) * 0.08);
          shoot.rotation.z = (Math.random() - 0.5) * 0.25;
          group.add(shoot);
        }
        return group;
      }

      if (stage === 1) {
        // Stage 1: പച്ചക്കണ്ടം (Thick emerald green vegetative tillers)
        const tillerMat = new THREE.MeshLambertMaterial({ color: 0x43a047 });
        for (let i = 0; i < 8; i++) {
          const ang = (i / 8) * Math.PI * 2;
          const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.65, 4), tillerMat);
          leaf.position.set(Math.cos(ang) * 0.12, 0.32, Math.sin(ang) * 0.12);
          leaf.rotation.z = Math.sin(ang) * 0.2;
          group.add(leaf);
        }
        return group;
      }

      if (stage === 2) {
        // Stage 2: കതിരിടൽ (Tender young panicle heading)
        const greenGrainMat = new THREE.MeshLambertMaterial({ color: 0x7cb342 });
        for (let i = 0; i < 12; i++) {
          const ang = (i / 12) * Math.PI * 2;
          const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.03, 0.85, 4), greenGrainMat);
          stalk.position.set(Math.cos(ang) * 0.15, 0.42, Math.sin(ang) * 0.15);
          stalk.rotation.z = Math.sin(ang) * 0.25;
          group.add(stalk);

          const head = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.3, 4), greenGrainMat);
          head.position.set(Math.cos(ang) * 0.22, 0.88, Math.sin(ang) * 0.22);
          group.add(head);
        }
        return group;
      }

      // Stage 3: സ്വർണ്ണക്കതിരുകൾ (Golden Ripe Harvestable Paddy)
      const goldMat = new THREE.MeshStandardMaterial({
        color: 0xfbc02d, // Golden ripe yellow
        roughness: 0.6,
        metalness: 0.1
      });
      for (let i = 0; i < 14; i++) {
        const ang = (i / 14) * Math.PI * 2;
        const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.03, 0.9, 4), goldMat);
        stalk.position.set(Math.cos(ang) * 0.16, 0.45, Math.sin(ang) * 0.16);
        stalk.rotation.z = Math.sin(ang) * 0.3;
        group.add(stalk);

        // Heavy bending golden panicles
        const ear = new THREE.Mesh(new THREE.ConeGeometry(0.065, 0.38, 5), goldMat);
        ear.position.set(Math.cos(ang) * 0.25, 0.92, Math.sin(ang) * 0.25);
        ear.rotation.x = 0.35;
        group.add(ear);
      }

      // Golden harvest aura
      const auraMat = new THREE.MeshBasicMaterial({ color: 0xffeb3b, transparent: true, opacity: 0.25 });
      const aura = new THREE.Mesh(new THREE.RingGeometry(0.4, 0.55, 8), auraMat);
      aura.rotation.x = -Math.PI / 2;
      aura.position.y = 0.05;
      group.add(aura);

      return group;
    }

    // 2. CARROT, TOMATO, PUMPKIN
    if (stage === 0) {
      // Small sprout
      const stemMat = new THREE.MeshLambertMaterial({ color: 0x81c784 });
      const shoot1 = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.25, 4), stemMat);
      shoot1.position.set(-0.06, 0.12, 0);
      shoot1.rotation.z = 0.2;
      group.add(shoot1);
      return group;
    }

    if (stage === 1) {
      // Seedling
      const stemMat = new THREE.MeshLambertMaterial({ color: 0x4caf50 });
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.06, 0.5, 5), stemMat);
      stem.position.y = 0.25;
      group.add(stem);
      return group;
    }

    if (stage === 2) {
      // Flowering bush
      const plantMat = new THREE.MeshLambertMaterial({ color: 0x388e3c });
      const bush = new THREE.Mesh(new THREE.DodecahedronGeometry(0.35, 1), plantMat);
      bush.position.y = 0.4;
      group.add(bush);
      return group;
    }

    // Stage 3: Ready
    if (cropType === 'carrot') {
      const leafMat = new THREE.MeshLambertMaterial({ color: 0x2e7d32 });
      for (let i = 0; i < 5; i++) {
        const ang = (i / 5) * Math.PI * 2;
        const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.6, 4), leafMat);
        leaf.position.set(Math.cos(ang) * 0.1, 0.35, Math.sin(ang) * 0.1);
        group.add(leaf);
      }
      const carrotMat = new THREE.MeshLambertMaterial({ color: 0xf57c00 });
      const carrot = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.5, 8), carrotMat);
      carrot.rotation.x = Math.PI;
      carrot.position.y = 0.15;
      group.add(carrot);

    } else if (cropType === 'tomato') {
      const vineMat = new THREE.MeshLambertMaterial({ color: 0x2e7d32 });
      const vine = new THREE.Mesh(new THREE.DodecahedronGeometry(0.42, 1), vineMat);
      vine.position.y = 0.5;
      group.add(vine);

      const tomatoMat = new THREE.MeshLambertMaterial({ color: 0xd32f2f });
      for (let pos of [[0.25, 0.45, 0.15], [-0.2, 0.5, 0.2], [0.05, 0.35, -0.28]]) {
        const tomato = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), tomatoMat);
        tomato.position.set(pos[0], pos[1], pos[2]);
        group.add(tomato);
      }

    } else if (cropType === 'pumpkin') {
      const pumpMat = new THREE.MeshLambertMaterial({ color: 0xe65100 });
      const pumpkin = new THREE.Mesh(new THREE.SphereGeometry(0.45, 10, 8), pumpMat);
      pumpkin.scale.set(1.2, 0.85, 1.2);
      pumpkin.position.y = 0.35;
      group.add(pumpkin);
    }

    return group;
  }
}
