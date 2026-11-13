import * as THREE from 'three';
import { SceneManager } from './SceneManager.js';
import { KeralaWorld } from './KeralaWorld.js';
import { KeralaFarmer } from './Character.js';
import { FarmGrid } from './FarmGrid.js';
import { PlayerController } from './PlayerController.js';
import { UIManager } from './UI.js';
import { NetworkClient } from './NetworkClient.js';
import { sounds } from './Audio.js';

/**
 * Main Game Controller
 */
class Game {
  constructor() {
    this.container = document.getElementById('game-container');

    // Player inventory state
    this.inventory = {
      coins: 100,
      water: 100, // 0 - 100%
      carrot: 5,
      tomato: 5,
      pumpkin: 3,
      wheat: 5,
      crops: {
        carrot: 0,
        tomato: 0,
        pumpkin: 0,
        wheat: 0
      }
    };

    this.clock = new THREE.Clock();
    this.loadSavedData();
    this.init();
  }

  loadSavedData() {
    try {
      const savedInv = localStorage.getItem('kerala_farm_inventory');
      if (savedInv) {
        const parsed = JSON.parse(savedInv);
        this.inventory = Object.assign(this.inventory, parsed);
        console.log('📦 Loaded saved inventory from LocalStorage');
      }
    } catch (e) {
      console.warn('Error loading saved inventory:', e);
    }
  }

  saveData(showMessage = false) {
    try {
      localStorage.setItem('kerala_farm_inventory', JSON.stringify(this.inventory));
      if (this.farmGrid) {
        const plots = this.farmGrid.exportState();
        localStorage.setItem('kerala_farm_plots', JSON.stringify(plots));
      }
      if (showMessage && this.ui) {
        this.ui.showToast('💾 ഗെയിം വിജയകരമായി സേവ് ചെയ്തു! (Game Saved)');
        sounds.playCoin();
      }
    } catch (e) {
      console.warn('Error saving game data:', e);
    }
  }

  init() {
    // 1. Scene & Environment
    this.sceneMgr = new SceneManager(this.container);
    this.world = new KeralaWorld(this.sceneMgr.scene, this.sceneMgr.nightLights);

    // 2. Farm Grid (Placed inside the Wetland Paddy Basin)
    this.farmGrid = new FarmGrid(this.sceneMgr.scene, 8, 2.4, -36, 12);
    try {
      const savedPlots = localStorage.getItem('kerala_farm_plots');
      if (savedPlots) {
        this.farmGrid.applyServerState(JSON.parse(savedPlots));
        console.log('🌱 Applied saved plots from LocalStorage');
      }
    } catch (e) {}

    // 3. Local Player (Spawns at the Farmhouse Courtyard)
    this.player = new KeralaFarmer(true, 'ഞാൻ');
    this.player.group.position.set(-6, 0, -36);
    this.sceneMgr.scene.add(this.player.group);

    // 4. Player Controller
    this.controller = new PlayerController(
      this.sceneMgr.camera,
      this.player.group,
      this.sceneMgr.renderer.domElement
    );

    // 5. UI Manager
    this.ui = new UIManager(
      this.inventory,
      (toolName) => {
        this.player.updateHeldTool(toolName);
      },
      () => {
        this.ui.updateHUD();
        this.saveData(false);
      }
    );

    // 6. Network Client
    this.network = new NetworkClient(
      this.sceneMgr.scene,
      this.farmGrid,
      (sender, text) => this.displayChatMessage(sender, text),
      (count) => {
        const el = document.getElementById('players-count');
        if (el) el.innerText = `${count} ഓൺലൈൻ`;
      }
    );

    // 7. Event Listeners for Actions
    this.bindActionEvents();

    // 8. Start ambient nature sound on first user click
    window.addEventListener('pointerdown', () => {
      sounds.init();
      sounds.startAmbient();
    }, { once: true });

    // 9. Start Main Game Loop
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);

    console.log('🌴 Kerala 3D Farm Simulator initialized successfully!');
  }

  bindActionEvents() {
    // Mouse Click Action
    this.sceneMgr.renderer.domElement.addEventListener('pointerdown', (e) => {
      if (e.button === 0 && !this.controller.isMouseDown) {
        // Left click action
        this.performCurrentAction();
      }
    });

    // Space / 'F' / 'E' Keyboard Action
    window.addEventListener('keydown', (e) => {
      if (document.activeElement && document.activeElement.tagName === 'INPUT') return;

      if (e.code === 'KeyE') {
        this.handleContextInteraction();
      } else if (e.code === 'KeyF') {
        this.performCurrentAction();
      }
    });

    // Mobile Action Button
    const mobActionBtn = document.getElementById('btn-mobile-action');
    if (mobActionBtn) {
      mobActionBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.performCurrentAction();
      });
    }

    // Chat Send
    const chatInput = document.getElementById('chat-input');
    const chatBtn = document.getElementById('chat-send-btn');
    const sendChat = () => {
      const text = chatInput.value.trim();
      if (text) {
        this.network.sendChat(text);
        this.displayChatMessage('ഞാൻ', text);
        chatInput.value = '';
      }
    };

    chatBtn.addEventListener('click', sendChat);
    chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') sendChat();
    });

    // Save Game Button
    const saveCard = document.getElementById('save-card');
    if (saveCard) {
      saveCard.addEventListener('click', () => {
        this.saveData(true);
      });
    }

    // Auto-save every 10 seconds
    setInterval(() => {
      this.saveData(false);
    }, 10000);
  }

  // Check if player is near Stone Well or Village Shop
  handleContextInteraction() {
    const playerPos = this.player.group.position;

    // 1. Near Stone Well -> Refill water!
    if (this.world.wellTrigger) {
      const distToWell = playerPos.distanceTo(this.world.wellTrigger.position);
      if (distToWell <= this.world.wellTrigger.radius) {
        this.inventory.water = 100;
        this.ui.updateHUD();
        sounds.playRefill();
        this.ui.showToast('കിണറ്റിൽ നിന്ന് വെള്ളം നിറച്ചു! (100% Water)');
        return;
      }
    }

    // 2. Near Village Market -> Open Shop!
    if (this.world.shopTrigger) {
      const distToShop = playerPos.distanceTo(this.world.shopTrigger.position);
      if (distToShop <= this.world.shopTrigger.radius) {
        this.ui.openShop();
        return;
      }
    }

    // Otherwise do normal action
    this.performCurrentAction();
  }

  // Perform tool action on targeted farm plot
  performCurrentAction() {
    if (this.ui.isShopOpen) return;

    const tileCoord = this.farmGrid.activeTileCoord;
    if (!tileCoord) return;

    this.player.triggerActionAnimation();

    const result = this.farmGrid.performAction(tileCoord, this.ui.activeTool, this.inventory);
    if (result.message) {
      this.ui.showToast(result.message);
    }

    if (result.success) {
      this.ui.updateHUD();
      this.saveData(false);
      // Sync farm state to multiplayer peers
      this.network.sendFarmUpdate(this.farmGrid.exportState());
    }
  }

  displayChatMessage(sender, text) {
    const box = document.getElementById('chat-messages');
    if (!box) return;

    const msg = document.createElement('div');
    msg.className = 'chat-msg';
    msg.innerHTML = `<span class="chat-sender">${sender}:</span> ${text}`;
    box.appendChild(msg);
    box.scrollTop = box.scrollHeight;
  }

  animate() {
    requestAnimationFrame(this.animate);

    const delta = Math.min(this.clock.getDelta(), 0.1);
    const elapsedTime = this.clock.getElapsedTime();

    // 1. Update Player Movement & Camera
    const isMoving = this.controller.update(delta);
    this.player.update(delta, isMoving, this.controller.keys.sprint);

    // 2. Update Target Cursor & Prompt
    const targetTile = this.farmGrid.updateTargetCursor(
      this.player.group.position,
      this.player.group.rotation.y
    );

    // Update Player Zone HUD
    const currentZone = this.world.getPlayerZone(this.player.group.position);
    const zoneEl = document.getElementById('zone-text');
    if (zoneEl && zoneEl.innerText !== currentZone) zoneEl.innerText = currentZone;

    // Context prompts (Near well, shop, shed, or field)
    const distToWell = this.player.group.position.distanceTo(this.world.wellTrigger.position);
    const distToShop = this.player.group.position.distanceTo(this.world.shopTrigger.position);
    const distToShed = this.world.shedTrigger ? this.player.group.position.distanceTo(this.world.shedTrigger.position) : 999;

    if (distToWell < this.world.wellTrigger.radius) {
      this.ui.setTargetPrompt(true, 'കിണറ്റിൽ നിന്ന് വെള്ളം കോരാൻ [E] അമർത്തുക');
    } else if (distToShop < this.world.shopTrigger.radius) {
      this.ui.setTargetPrompt(true, 'കടയിൽ കച്ചവടം ചെയ്യാൻ [E] അമർത്തുക');
    } else if (distToShed < this.world.shedTrigger.radius) {
      this.ui.setTargetPrompt(true, '🚜 ട്രാക്ടർ & മെഷിനറി വർക്ക്ഷോപ്പ്');
    } else if (targetTile) {
      let promptText = 'പ്രവർത്തിക്കാൻ ക്ലിക്ക് ചെയ്യുക';
      if (this.ui.activeTool === 'hoe') promptText = 'കണ്ടം പൂട്ടി ഒരുക്കുക (Till/Puddle)';
      else if (this.ui.activeTool === 'water') promptText = 'വെള്ളം കയറ്റുക (Irrigate)';
      else if (this.ui.activeTool === 'scythe') promptText = 'വിളവെടുക്കുക (Harvest)';
      else if (this.ui.activeTool === 'wheat') promptText = 'ഞാറു നടുക (Transplant Paddy)';
      else promptText = `${this.ui.activeTool} വിത്ത് നടുക (Plant)`;
      this.ui.setTargetPrompt(true, promptText);
    } else {
      this.ui.setTargetPrompt(false);
    }

    // 3. Update Crops & Growth
    this.farmGrid.updateCrops(delta);

    // 4. Update Day/Night Cycle, Rain, & Clock
    this.sceneMgr.updateDayNightCycle(delta, this.player.group.position);
    const clockText = document.getElementById('clock-text');
    if (clockText) clockText.innerText = this.sceneMgr.getFormattedTime();

    // 5. Animate Water Flow & Palm Trees in Wind
    this.world.animate(delta, elapsedTime);

    // 6. Network update (send position & interpolate remote friends)
    this.network.sendMovement(
      this.player.group.position,
      this.player.group.rotation.y,
      isMoving,
      this.player.heldToolName
    );
    this.network.update(delta);

    // 7. Render 3D Scene
    this.sceneMgr.render();
  }
}

// Start Game on page load
window.addEventListener('DOMContentLoaded', () => {
  new Game();
});
