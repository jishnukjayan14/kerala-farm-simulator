import * as THREE from 'three';

/**
 * High-Fidelity 3D Crop Models with 4 Authentic Kerala Growth Stages
 * Supports:
 * - Paddy / Rice (നെല്ല്): ഞാറു നടീൽ ➔ പച്ചക്കണ്ടം ➔ കതിരിടൽ ➔ വിളഞ്ഞ സ്വർണ്ണക്കതിരുകൾ
 * - Tapioca / Cassava (കപ്പ / മരച്ചീനി): തണ്ട് ➔ തളിരിലകൾ ➔ തഴച്ചുവളരൽ ➔ വിളവെടുത്ത കപ്പക്കിഴങ്ങ്
 * - Tomato (തക്കാളി), Carrot (കാരറ്റ്), Pumpkin (മത്തങ്ങ)
 */
export class CropModels {
  static createCropMesh(cropType, stage = 0) {
    const group = new THREE.Group();

    // 1. PADDY / RICE (നെല്ല്) - Authentic Kerala Wetland Rice Cycle
    if (cropType === 'wheat' || cropType === 'paddy') {
      if (stage === 0) {
        // Stage 0: ഞാറു നടീൽ (Young transplanted paddy seedlings in flooded water)
        const shootMat = new THREE.MeshStandardMaterial({
          color: 0x9ccc65, // Bright tender seedling green
          roughness: 0.5,
          side: THREE.DoubleSide
        });

        // 3 seedling clumps per planting hill
        for (let clump = 0; clump < 3; clump++) {
          const cx = (clump - 1) * 0.14;
          for (let i = 0; i < 4; i++) {
            const ang = (i / 4) * Math.PI * 2 + Math.random() * 0.4;
            const shoot = new THREE.Mesh(new THREE.ConeGeometry(0.015, 0.42, 4), shootMat);
            shoot.position.set(cx + Math.cos(ang) * 0.06, 0.2, Math.sin(ang) * 0.06);
            shoot.rotation.z = Math.sin(ang) * 0.22;
            shoot.castShadow = true;
            group.add(shoot);
          }
        }
        return group;
      }

      if (stage === 1) {
        // Stage 1: പച്ചക്കണ്ടം (Lush tillering phase - dense emerald blades)
        const tillerMat = new THREE.MeshStandardMaterial({
          color: 0x388e3c, // Deep rich tropical rice green
          roughness: 0.4,
          side: THREE.DoubleSide
        });

        for (let i = 0; i < 18; i++) {
          const ang = (i / 18) * Math.PI * 2;
          const dist = 0.08 + Math.random() * 0.12;
          const blade = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.8, 4), tillerMat);
          blade.position.set(Math.cos(ang) * dist, 0.38, Math.sin(ang) * dist);
          blade.rotation.z = Math.sin(ang) * 0.32;
          blade.rotation.x = Math.cos(ang) * 0.32;
          blade.castShadow = true;
          group.add(blade);
        }
        return group;
      }

      if (stage === 2) {
        // Stage 2: കതിരിടൽ (Heading & flowering phase - emergent pale green panicles)
        const stalkMat = new THREE.MeshStandardMaterial({ color: 0x558b2f, roughness: 0.5 });
        const panicleMat = new THREE.MeshStandardMaterial({ color: 0x9e9d24, roughness: 0.45 });

        for (let i = 0; i < 22; i++) {
          const ang = (i / 22) * Math.PI * 2;
          const dist = 0.1 + Math.random() * 0.14;
          const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.028, 0.95, 4), stalkMat);
          stalk.position.set(Math.cos(ang) * dist, 0.46, Math.sin(ang) * dist);
          stalk.rotation.z = Math.sin(ang) * 0.28;
          stalk.castShadow = true;
          group.add(stalk);

          // Nodding green grain ear
          const ear = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.35, 5), panicleMat);
          ear.position.set(Math.cos(ang) * (dist + 0.12), 0.98, Math.sin(ang) * (dist + 0.12));
          ear.rotation.z = Math.sin(ang) * 0.5;
          ear.castShadow = true;
          group.add(ear);
        }
        return group;
      }

      // Stage 3: വിളഞ്ഞ സ്വർണ്ണക്കതിരുകൾ (Golden Ripe Harvestable Paddy)
      const goldStalkMat = new THREE.MeshStandardMaterial({ color: 0xe6a117, roughness: 0.55 });
      const goldEarMat = new THREE.MeshStandardMaterial({
        color: 0xfbc02d, // Rich golden yellow
        roughness: 0.4,
        metalness: 0.08
      });

      for (let i = 0; i < 26; i++) {
        const ang = (i / 26) * Math.PI * 2;
        const dist = 0.12 + Math.random() * 0.16;

        const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.026, 1.05, 4), goldStalkMat);
        stalk.position.set(Math.cos(ang) * dist, 0.5, Math.sin(ang) * dist);
        stalk.rotation.z = Math.sin(ang) * 0.32;
        stalk.castShadow = true;
        group.add(stalk);

        // Heavy bending ripe panicles (ചാഞ്ഞു കിടക്കുന്ന നെൽക്കതിരുകൾ)
        const ear = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.45, 6), goldEarMat);
        ear.position.set(Math.cos(ang) * (dist + 0.18), 1.02, Math.sin(ang) * (dist + 0.18));
        ear.rotation.x = 0.45;
        ear.rotation.z = Math.sin(ang) * 0.6;
        ear.castShadow = true;
        group.add(ear);
      }

      // Golden harvest aura ring on ready crop
      const auraMat = new THREE.MeshBasicMaterial({ color: 0xffd54f, transparent: true, opacity: 0.35 });
      const aura = new THREE.Mesh(new THREE.RingGeometry(0.5, 0.72, 16), auraMat);
      aura.rotation.x = -Math.PI / 2;
      aura.position.y = 0.06;
      group.add(aura);

      return group;
    }

    // 2. TAPIOCA / CASSAVA (കപ്പ / മരച്ചീനി)
    if (cropType === 'tapioca') {
      const stemMat = new THREE.MeshStandardMaterial({ color: 0x6d4c41, roughness: 0.8 });
      const leafMat = new THREE.MeshStandardMaterial({ color: 0x2e7d32, roughness: 0.45, side: THREE.DoubleSide });

      if (stage === 0) {
        // Cutting stick with green sprout (കപ്പത്തണ്ട്)
        const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.4, 6), stemMat);
        stick.position.y = 0.2;
        stick.rotation.z = 0.15;
        group.add(stick);

        const sprout = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.15, 4), leafMat);
        sprout.position.set(0.05, 0.36, 0);
        group.add(sprout);
        return group;
      }

      if (stage === 1) {
        // Young plant with first palmate fans
        const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.75, 6), stemMat);
        stalk.position.y = 0.38;
        group.add(stalk);

        for (let i = 0; i < 3; i++) {
          const ang = (i / 3) * Math.PI * 2;
          const fan = new THREE.Mesh(new THREE.CircleGeometry(0.2, 5), leafMat);
          fan.position.set(Math.cos(ang) * 0.22, 0.65, Math.sin(ang) * 0.22);
          fan.rotation.x = Math.PI / 3;
          group.add(fan);
        }
        return group;
      }

      // Stage 2 & 3: Full grown Tapioca plant
      const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.065, 1.4, 6), stemMat);
      stalk.position.y = 0.7;
      group.add(stalk);

      for (let h of [0.6, 1.0, 1.35]) {
        for (let i = 0; i < 4; i++) {
          const ang = (i / 4) * Math.PI * 2;
          const fan = new THREE.Mesh(new THREE.CircleGeometry(0.28, 6), leafMat);
          fan.position.set(Math.cos(ang) * 0.35, h + 0.1, Math.sin(ang) * 0.35);
          fan.rotation.x = Math.PI / 3;
          group.add(fan);
        }
      }

      if (stage === 3) {
        // Visible ready tuber top & harvest indicator
        const tuberMat = new THREE.MeshStandardMaterial({ color: 0x4e342e, roughness: 0.9 });
        for (let t = 0; t < 3; t++) {
          const tAng = (t / 3) * Math.PI * 2;
          const tuber = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.04, 0.35, 6), tuberMat);
          tuber.position.set(Math.cos(tAng) * 0.15, 0.12, Math.sin(tAng) * 0.15);
          tuber.rotation.z = Math.cos(tAng) * 0.4;
          group.add(tuber);
        }
      }
      return group;
    }

    // 3. CARROT, TOMATO, PUMPKIN
    if (stage === 0) {
      const stemMat = new THREE.MeshStandardMaterial({ color: 0x81c784, roughness: 0.5 });
      const shoot1 = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.28, 4), stemMat);
      shoot1.position.set(-0.05, 0.14, 0);
      shoot1.rotation.z = 0.2;
      group.add(shoot1);
      return group;
    }

    if (stage === 1) {
      const stemMat = new THREE.MeshStandardMaterial({ color: 0x4caf50, roughness: 0.5 });
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.55, 6), stemMat);
      stem.position.y = 0.28;
      group.add(stem);
      return group;
    }

    if (stage === 2) {
      const plantMat = new THREE.MeshStandardMaterial({ color: 0x2e7d32, roughness: 0.6 });
      const bush = new THREE.Mesh(new THREE.DodecahedronGeometry(0.38, 1), plantMat);
      bush.position.y = 0.42;
      group.add(bush);
      return group;
    }

    // Stage 3: Ready Harvest
    if (cropType === 'carrot') {
      const leafMat = new THREE.MeshStandardMaterial({ color: 0x1b5e20, roughness: 0.5 });
      for (let i = 0; i < 6; i++) {
        const ang = (i / 6) * Math.PI * 2;
        const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.65, 4), leafMat);
        leaf.position.set(Math.cos(ang) * 0.1, 0.38, Math.sin(ang) * 0.1);
        group.add(leaf);
      }
      const carrotMat = new THREE.MeshStandardMaterial({ color: 0xe65100, roughness: 0.4 });
      const carrot = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.55, 8), carrotMat);
      carrot.rotation.x = Math.PI;
      carrot.position.y = 0.18;
      group.add(carrot);

    } else if (cropType === 'tomato') {
      const vineMat = new THREE.MeshStandardMaterial({ color: 0x2e7d32, roughness: 0.6 });
      const vine = new THREE.Mesh(new THREE.DodecahedronGeometry(0.45, 1), vineMat);
      vine.position.y = 0.52;
      group.add(vine);

      const tomatoMat = new THREE.MeshStandardMaterial({ color: 0xc62828, roughness: 0.25, metalness: 0.05 });
      for (let pos of [[0.28, 0.48, 0.18], [-0.22, 0.52, 0.22], [0.06, 0.38, -0.3]]) {
        const tomato = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 10), tomatoMat);
        tomato.position.set(pos[0], pos[1], pos[2]);
        group.add(tomato);
      }

    } else if (cropType === 'pumpkin') {
      const pumpMat = new THREE.MeshStandardMaterial({ color: 0xef6c00, roughness: 0.45 });
      const pumpkin = new THREE.Mesh(new THREE.SphereGeometry(0.48, 12, 10), pumpMat);
      pumpkin.scale.set(1.25, 0.85, 1.25);
      pumpkin.position.y = 0.38;
      group.add(pumpkin);
    }

    return group;
  }
}
