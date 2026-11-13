import * as THREE from 'three';
import { GLTFLoader } from './libs/GLTFLoader.js';
import { MeshoptDecoder } from './libs/meshopt_decoder.module.js';

/**
 * Realistic 3D Human Farmer Character
 * Loads rigged 3D human civilian avatar with skeletal mocap animations (Idle, Walk, Run).
 */
export class KeralaFarmer {
  constructor(isLocal = true, playerName = 'കർഷകൻ') {
    this.isLocal = isLocal;
    this.playerName = playerName;

    this.group = new THREE.Group();
    this.modelReady = false;

    // Animation states
    this.mixer = null;
    this.actions = {
      idle: null,
      walk: null,
      run: null
    };
    this.activeAction = null;
    this.isWalking = false;
    this.isSprinting = false;

    // Action swing state
    this.isActionAnimating = false;
    this.actionProgress = 0;

    // Held tool
    this.heldToolName = 'hoe';
    this.rightHandBone = null;
    this.activeToolMesh = null;
    this.toolPivot = new THREE.Group();

    if (!isLocal) {
      this.createNameTag(playerName);
    }

    // Load Realistic Human Model
    this.loadRealisticModel();
  }

  async loadRealisticModel() {
    const loader = new GLTFLoader();

    try {
      // 1. Initialize MeshoptDecoder for realistic compressed avatars
      if (typeof MeshoptDecoder !== 'undefined' && MeshoptDecoder.ready) {
        await MeshoptDecoder.ready;
        loader.setMeshoptDecoder(MeshoptDecoder);
      }

      let avatarGltf = null;
      let usedModel = 'default_avatar';

      // 2. Try loading ReadyPlayerMe Civilian Human Avatar first
      try {
        avatarGltf = await loader.loadAsync('models/default_avatar.glb');
        console.log('✅ Loaded ReadyPlayerMe Civilian Human Avatar!');
      } catch (err) {
        console.warn('default_avatar.glb load failed, using human.glb fallback...', err);
        usedModel = 'human';
        avatarGltf = await loader.loadAsync('models/human.glb');
      }

      this.avatar = avatarGltf.scene;
      this.avatar.scale.set(1.0, 1.0, 1.0);
      this.avatar.position.set(0, 0, 0);

      // Enhance materials and hide any robotic visors
      this.avatar.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;

          // Remove robotic visor if present
          if (child.name.toLowerCase().includes('visor')) {
            child.visible = false;
          }

          // Make materials soft and human-like (cloth, skin, denim) instead of shiny metal
          if (child.material) {
            child.material.metalness = Math.min(0.1, child.material.metalness || 0);
            child.material.roughness = Math.max(0.7, child.material.roughness || 0.8);
          }
        }

        // Locate Right Hand bone for tool holding
        if (child.isBone && (child.name === 'RightHand' || child.name === 'mixamorig:RightHand' || child.name.includes('RightHand'))) {
          this.rightHandBone = child;
        }
      });

      this.group.add(this.avatar);

      // 3. Setup Animation Mixer
      this.mixer = new THREE.AnimationMixer(this.avatar);

      if (avatarGltf.animations && avatarGltf.animations.length > 0) {
        // Built-in animations in the model
        avatarGltf.animations.forEach((clip) => {
          const name = clip.name.toLowerCase();
          if (name.includes('idle')) this.actions.idle = this.mixer.clipAction(clip);
          if (name.includes('walk')) this.actions.walk = this.mixer.clipAction(clip);
          if (name.includes('run')) this.actions.run = this.mixer.clipAction(clip);
        });
      }

      // If separate mocap animation files are present, load them
      if (!this.actions.idle || !this.actions.walk || !this.actions.run) {
        try {
          const [idleGltf, walkGltf, runGltf] = await Promise.all([
            loader.loadAsync('models/idle.glb'),
            loader.loadAsync('models/walk.glb'),
            loader.loadAsync('models/run.glb')
          ]);

          if (idleGltf.animations[0]) this.actions.idle = this.mixer.clipAction(idleGltf.animations[0]);
          if (walkGltf.animations[0]) this.actions.walk = this.mixer.clipAction(walkGltf.animations[0]);
          if (runGltf.animations[0]) this.actions.run = this.mixer.clipAction(runGltf.animations[0]);
        } catch (e) {
          console.warn('Could not load separate animation files:', e);
        }
      }

      // Start in Idle
      if (this.actions.idle) {
        this.actions.idle.play();
        this.activeAction = this.actions.idle;
      }

      // Attach tool pivot to right hand
      if (this.rightHandBone) {
        this.rightHandBone.add(this.toolPivot);
      } else {
        this.toolPivot.position.set(0.35, 1.1, 0.2);
        this.avatar.add(this.toolPivot);
      }

      this.modelReady = true;
      this.updateHeldTool(this.heldToolName);
      console.log('✅ Realistic 3D Human Character ready!');

    } catch (e) {
      console.error('Failed to load realistic model, falling back to procedural mesh:', e);
      this.buildProceduralFallback();
    }
  }

  // Smoothly blend between Idle, Walk, and Run
  switchAnimation(targetName) {
    if (!this.modelReady || !this.actions[targetName]) return;
    const targetAction = this.actions[targetName];

    if (this.activeAction !== targetAction) {
      if (this.activeAction) {
        this.activeAction.fadeOut(0.2);
      }
      targetAction.reset().fadeIn(0.2).play();
      this.activeAction = targetAction;
    }
  }

  // Floating 3D Nametag for multiplayer peers
  createNameTag(name) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = 'rgba(20, 36, 20, 0.85)';
    ctx.roundRect(10, 10, 236, 44, 12);
    ctx.fill();
    ctx.strokeStyle = '#81c784';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(name, 128, 40);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.position.y = 2.4;
    sprite.scale.set(1.8, 0.45, 1);
    this.group.add(sprite);
  }

  // Change held tool
  updateHeldTool(toolName) {
    this.heldToolName = toolName;
    if (this.activeToolMesh) {
      this.toolPivot.remove(this.activeToolMesh);
      this.activeToolMesh = null;
    }

    const toolGroup = new THREE.Group();
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x5d4037, roughness: 0.7 });
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x90a4ae, metalness: 0.8, roughness: 0.3 });

    if (toolName === 'hoe') {
      // Kerala Thumba / Farm Hoe (തൂമ്പ)
      const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.2, 8), woodMat);
      handle.position.set(0, 0.3, 0);
      handle.rotation.x = Math.PI / 2;
      toolGroup.add(handle);

      const blade = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.16, 0.025), metalMat);
      blade.position.set(0, 0.3, 0.6);
      blade.rotation.x = Math.PI / 4;
      toolGroup.add(blade);
      toolGroup.position.set(0, -0.05, 0.05);
      toolGroup.rotation.set(0, -Math.PI / 2, Math.PI / 2);

    } else if (toolName === 'water') {
      // Realistic Watering Can (നനയ്ക്കുന്ന പാത്രം)
      const canBody = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 0.3, 12), metalMat);
      canBody.position.set(0, 0, 0.15);
      toolGroup.add(canBody);

      const spout = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.05, 0.25, 8), metalMat);
      spout.position.set(0, 0.12, 0.3);
      spout.rotation.x = -Math.PI / 4;
      toolGroup.add(spout);
      toolGroup.position.set(0, -0.1, 0.05);

    } else if (toolName === 'scythe') {
      // Traditional Scythe / Sickle (കൊയ്ത്തരിവാൾ)
      const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.45, 8), woodMat);
      handle.position.set(0, 0.1, 0);
      toolGroup.add(handle);

      const blade = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.025, 6, 16, Math.PI), metalMat);
      blade.position.set(0.12, 0.28, 0.05);
      blade.rotation.z = Math.PI / 3;
      toolGroup.add(blade);
      toolGroup.position.set(0, -0.05, 0.05);

    } else {
      // Seed Pouch / Bag (വിത്ത് സഞ്ചി)
      const bagMat = new THREE.MeshStandardMaterial({ color: 0x8d6e63, roughness: 0.9 });
      const bag = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 10), bagMat);
      bag.scale.set(0.9, 1.2, 0.8);
      bag.position.set(0, 0, 0.1);
      toolGroup.add(bag);
      toolGroup.position.set(0, -0.08, 0.05);
    }

    this.activeToolMesh = toolGroup;
    this.toolPivot.add(toolGroup);
  }

  // Trigger realistic tool swing
  triggerActionAnimation() {
    this.isActionAnimating = true;
    this.actionProgress = 0;
  }

  // Procedural fallback if 3D model fails to load
  buildProceduralFallback() {
    const skinMat = new THREE.MeshLambertMaterial({ color: 0x8d5524 });
    const shirtMat = new THREE.MeshLambertMaterial({ color: 0x37474f });
    const pantsMat = new THREE.MeshLambertMaterial({ color: 0x1565c0 });

    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.85, 0.35), shirtMat);
    torso.position.y = 1.35;
    torso.castShadow = true;
    this.group.add(torso);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 12), skinMat);
    head.position.y = 1.95;
    head.castShadow = true;
    this.group.add(head);

    const legs = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.85, 0.3), pantsMat);
    legs.position.y = 0.45;
    legs.castShadow = true;
    this.group.add(legs);

    this.modelReady = true;
  }

  // Update in render loop
  update(delta, isMoving, isSprinting = false) {
    this.isWalking = isMoving;
    this.isSprinting = isSprinting;

    // 1. Advance Skeletal Animation Mixer
    if (this.mixer) {
      if (this.isWalking) {
        if (this.isSprinting && this.actions.run) {
          this.switchAnimation('run');
        } else {
          this.switchAnimation('walk');
        }
      } else {
        this.switchAnimation('idle');
      }
      this.mixer.update(delta);
    }

    // 2. Tool action swing animation
    if (this.isActionAnimating) {
      this.actionProgress += delta * 5.5;
      if (this.actionProgress <= 1.0) {
        const swing = Math.sin(this.actionProgress * Math.PI) * 1.5;
        this.toolPivot.rotation.x = -swing;
        this.toolPivot.rotation.z = swing * 0.3;
      } else {
        this.isActionAnimating = false;
        this.toolPivot.rotation.set(0, 0, 0);
      }
    }
  }
}
