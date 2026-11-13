import * as THREE from 'three';

/**
 * Player Controller: Smooth Keyboard/Mouse & Mobile Touch Controls
 * Controls camera follow, character movement, jump, and orientation.
 */
export class PlayerController {
  constructor(camera, characterGroup, domElement) {
    this.camera = camera;
    this.character = characterGroup;
    this.domElement = domElement;

    // Movement state
    this.moveVector = new THREE.Vector3();
    this.velocity = new THREE.Vector3();
    this.speed = 7.0;
    this.sprintMultiplier = 1.6;
    this.isSprinting = false;

    // Jump / Gravity
    this.isGrounded = true;
    this.jumpForce = 8.5;
    this.gravity = -24.0;
    this.verticalVelocity = 0;

    // Camera Orbit angles
    this.cameraPitch = 0.35; // Vertical angle
    this.cameraYaw = 0.0;    // Horizontal angle
    this.cameraDistance = 8.5;
    this.minPitch = 0.05;
    this.maxPitch = 1.35;

    // Key states
    this.keys = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      sprint: false,
      jump: false
    };

    // Mouse drag state
    this.isMouseDown = false;
    this.prevMouseX = 0;
    this.prevMouseY = 0;

    // Mobile touch joystick state
    this.joystickDelta = { x: 0, y: 0 };

    this.bindInputs();
  }

  bindInputs() {
    // Keyboard down
    window.addEventListener('keydown', (e) => {
      // Don't capture inputs if typing in chat
      if (document.activeElement && document.activeElement.tagName === 'INPUT') return;

      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          this.keys.forward = true;
          break;
        case 'KeyS':
        case 'ArrowDown':
          this.keys.backward = true;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          this.keys.left = true;
          break;
        case 'KeyD':
        case 'ArrowRight':
          this.keys.right = true;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          this.keys.sprint = true;
          break;
        case 'Space':
          this.jump();
          break;
      }
    });

    // Keyboard up
    window.addEventListener('keyup', (e) => {
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          this.keys.forward = false;
          break;
        case 'KeyS':
        case 'ArrowDown':
          this.keys.backward = false;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          this.keys.left = false;
          break;
        case 'KeyD':
        case 'ArrowRight':
          this.keys.right = false;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          this.keys.sprint = false;
          break;
      }
    });

    // Mouse Drag for Camera Orbit
    this.domElement.addEventListener('mousedown', (e) => {
      if (e.button === 0 || e.button === 2) {
        this.isMouseDown = true;
        this.prevMouseX = e.clientX;
        this.prevMouseY = e.clientY;
      }
    });

    window.addEventListener('mouseup', () => {
      this.isMouseDown = false;
    });

    window.addEventListener('mousemove', (e) => {
      if (this.isMouseDown) {
        const deltaX = e.clientX - this.prevMouseX;
        const deltaY = e.clientY - this.prevMouseY;

        this.cameraYaw -= deltaX * 0.006;
        this.cameraPitch = Math.max(
          this.minPitch,
          Math.min(this.maxPitch, this.cameraPitch + deltaY * 0.005)
        );

        this.prevMouseX = e.clientX;
        this.prevMouseY = e.clientY;
      }
    });

    // Mouse Wheel Zoom
    window.addEventListener('wheel', (e) => {
      this.cameraDistance = Math.max(4.0, Math.min(18.0, this.cameraDistance + e.deltaY * 0.01));
    });

    // Setup Mobile Touch Joystick
    this.setupTouchJoystick();
  }

  setupTouchJoystick() {
    const zone = document.getElementById('joystick-zone');
    const stick = document.getElementById('joystick-stick');
    if (!zone || !stick) return;

    let touchId = null;
    let startX = 0, startY = 0;

    zone.addEventListener('touchstart', (e) => {
      const touch = e.changedTouches[0];
      touchId = touch.identifier;
      const rect = zone.getBoundingClientRect();
      startX = rect.left + rect.width / 2;
      startY = rect.top + rect.height / 2;
    });

    zone.addEventListener('touchmove', (e) => {
      for (let t of e.changedTouches) {
        if (t.identifier === touchId) {
          const dx = t.clientX - startX;
          const dy = t.clientY - startY;
          const dist = Math.hypot(dx, dy);
          const maxDist = 40;

          const clampedDist = Math.min(dist, maxDist);
          const angle = Math.atan2(dy, dx);
          const clampedX = Math.cos(angle) * clampedDist;
          const clampedY = Math.sin(angle) * clampedDist;

          stick.style.transform = `translate(${clampedX}px, ${clampedY}px)`;
          this.joystickDelta.x = clampedX / maxDist;
          this.joystickDelta.y = clampedY / maxDist;
        }
      }
    });

    const resetStick = (e) => {
      for (let t of e.changedTouches) {
        if (t.identifier === touchId) {
          touchId = null;
          stick.style.transform = 'translate(0px, 0px)';
          this.joystickDelta.x = 0;
          this.joystickDelta.y = 0;
        }
      }
    };

    zone.addEventListener('touchend', resetStick);
    zone.addEventListener('touchcancel', resetStick);

    // Mobile Jump button
    const btnJump = document.getElementById('btn-mobile-jump');
    if (btnJump) {
      btnJump.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.jump();
      });
    }
  }

  jump() {
    if (this.isGrounded) {
      this.verticalVelocity = this.jumpForce;
      this.isGrounded = false;
    }
  }

  update(delta) {
    // 1. Calculate input direction: W/Up is forward, S/Down is backward, D is right, A is left
    let forwardInput = 0;
    let rightInput = 0;

    if (this.keys.forward) forwardInput += 1;
    if (this.keys.backward) forwardInput -= 1;
    if (this.keys.right) rightInput += 1;
    if (this.keys.left) rightInput -= 1;

    // Add joystick input (stick up is negative Y, so -dy is forward)
    forwardInput -= this.joystickDelta.y;
    rightInput += this.joystickDelta.x;

    const isMoving = Math.hypot(forwardInput, rightInput) > 0.1;

    if (isMoving) {
      // Camera forward vector on XZ plane: pointing forward into the scene away from camera
      const fwdX = -Math.sin(this.cameraYaw);
      const fwdZ = -Math.cos(this.cameraYaw);

      // Camera right vector on XZ plane
      const rightX = Math.cos(this.cameraYaw);
      const rightZ = -Math.sin(this.cameraYaw);

      // Combine inputs into world move vector
      let dirX = fwdX * forwardInput + rightX * rightInput;
      let dirZ = fwdZ * forwardInput + rightZ * rightInput;
      const len = Math.hypot(dirX, dirZ);
      dirX /= len;
      dirZ /= len;

      const currentSpeed = (this.keys.sprint ? this.speed * this.sprintMultiplier : this.speed);
      this.velocity.x = dirX * currentSpeed;
      this.velocity.z = dirZ * currentSpeed;

      // Rotate character to face movement direction smoothly
      const targetRotationY = Math.atan2(dirX, dirZ);
      let diff = (targetRotationY - this.character.rotation.y) % (Math.PI * 2);
      if (diff < -Math.PI) diff += Math.PI * 2;
      if (diff > Math.PI) diff -= Math.PI * 2;
      this.character.rotation.y += diff * delta * 15;
    } else {
      this.velocity.x = THREE.MathUtils.lerp(this.velocity.x, 0, delta * 12);
      this.velocity.z = THREE.MathUtils.lerp(this.velocity.z, 0, delta * 12);
    }

    // 2. Vertical motion (Gravity & Jumping)
    this.verticalVelocity += this.gravity * delta;
    this.character.position.y += this.verticalVelocity * delta;

    if (this.character.position.y <= 0) {
      this.character.position.y = 0;
      this.verticalVelocity = 0;
      this.isGrounded = true;
    }

    // 3. Apply horizontal movement
    this.character.position.x += this.velocity.x * delta;
    this.character.position.z += this.velocity.z * delta;

    // Boundary constraints (Expanded for 360x360m Kerala Open World)
    this.character.position.x = Math.max(-160, Math.min(160, this.character.position.x));
    this.character.position.z = Math.max(-160, Math.min(160, this.character.position.z));

    // 4. Update Camera smooth third-person follow
    const targetOffset = new THREE.Vector3(
      Math.sin(this.cameraYaw) * Math.cos(this.cameraPitch) * this.cameraDistance,
      Math.sin(this.cameraPitch) * this.cameraDistance + 1.6,
      Math.cos(this.cameraYaw) * Math.cos(this.cameraPitch) * this.cameraDistance
    );

    const cameraTarget = this.character.position.clone().add(targetOffset);
    this.camera.position.lerp(cameraTarget, delta * 10);
    this.camera.lookAt(this.character.position.x, this.character.position.y + 1.4, this.character.position.z);

    return isMoving;
  }
}
