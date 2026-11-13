import { KeralaFarmer } from './Character.js';

/**
 * Real-Time Multiplayer Network Client
 * Connects via WebSocket to server.py to sync players, farm actions, and chat.
 */
export class NetworkClient {
  constructor(scene, farmGrid, onChatReceived, onPlayerCountUpdate) {
    this.scene = scene;
    this.farmGrid = farmGrid;
    this.onChatReceived = onChatReceived;
    this.onPlayerCountUpdate = onPlayerCountUpdate;

    this.socket = null;
    this.connected = false;
    this.myId = null;

    // Remote players: id -> { farmer: KeralaFarmer, targetPos, targetRot }
    this.remotePlayers = new Map();

    // Throttled movement sender
    this.lastSendTime = 0;

    this.connect();
  }

  connect() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host || 'localhost:3000';
    const wsUrl = `${protocol}//${host}/ws`;

    try {
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        this.connected = true;
        console.log('✅ Connected to Kerala Farm Multiplayer Server!');
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (e) {
          console.error('Invalid message from server:', e);
        }
      };

      this.socket.onclose = () => {
        this.connected = false;
        console.log('Multiplayer server disconnected. Running in Local Mode.');
        setTimeout(() => this.connect(), 4000); // Auto reconnect attempt
      };
    } catch (e) {
      console.warn('WebSocket connection failed. Running offline.', e);
    }
  }

  handleMessage(msg) {
    switch (msg.type) {
      case 'init':
        this.myId = msg.id;
        if (msg.farmState) {
          this.farmGrid.applyServerState(msg.farmState);
        }
        break;

      case 'player_joined':
        if (msg.id !== this.myId) {
          this.addRemotePlayer(msg.id, msg.name || `കർഷകൻ ${msg.id.substr(0, 4)}`);
        }
        if (msg.playerCount && this.onPlayerCountUpdate) {
          this.onPlayerCountUpdate(msg.playerCount);
        }
        break;

      case 'player_left':
        this.removeRemotePlayer(msg.id);
        if (msg.playerCount && this.onPlayerCountUpdate) {
          this.onPlayerCountUpdate(msg.playerCount);
        }
        break;

      case 'player_move':
        if (msg.id !== this.myId) {
          this.updateRemotePlayer(msg.id, msg.pos, msg.rotY, msg.isMoving, msg.tool);
        }
        break;

      case 'farm_update':
        if (msg.tiles) {
          this.farmGrid.applyServerState(msg.tiles);
        }
        break;

      case 'chat':
        if (this.onChatReceived) {
          this.onChatReceived(msg.sender, msg.text);
        }
        break;
    }
  }

  addRemotePlayer(id, name) {
    if (this.remotePlayers.has(id)) return;
    const farmer = new KeralaFarmer(false, name);
    this.scene.add(farmer.group);
    this.remotePlayers.set(id, {
      farmer,
      targetPos: new THREE.Vector3(0, 0, 0),
      targetRot: 0,
      isMoving: false
    });
  }

  removeRemotePlayer(id) {
    const p = this.remotePlayers.get(id);
    if (p) {
      this.scene.remove(p.farmer.group);
      this.remotePlayers.delete(id);
    }
  }

  updateRemotePlayer(id, pos, rotY, isMoving, tool) {
    let p = this.remotePlayers.get(id);
    if (!p) {
      this.addRemotePlayer(id, `കർഷകൻ`);
      p = this.remotePlayers.get(id);
    }

    if (p) {
      p.targetPos.set(pos.x, pos.y, pos.z);
      p.targetRot = rotY;
      p.isMoving = isMoving;
      if (tool && tool !== p.farmer.heldToolName) {
        p.farmer.updateHeldTool(tool);
      }
    }
  }

  // Send local movement to peers
  sendMovement(pos, rotY, isMoving, tool) {
    if (!this.connected || !this.socket || this.socket.readyState !== WebSocket.OPEN) return;

    const now = performance.now();
    if (now - this.lastSendTime < 45) return; // ~22 updates/sec
    this.lastSendTime = now;

    this.socket.send(JSON.stringify({
      type: 'move',
      pos: { x: Number(pos.x.toFixed(2)), y: Number(pos.y.toFixed(2)), z: Number(pos.z.toFixed(2)) },
      rotY: Number(rotY.toFixed(2)),
      isMoving,
      tool
    }));
  }

  // Broadcast farm tile changes
  sendFarmUpdate(tiles) {
    if (!this.connected || !this.socket || this.socket.readyState !== WebSocket.OPEN) return;
    this.socket.send(JSON.stringify({
      type: 'farm_update',
      tiles
    }));
  }

  // Send chat message
  sendChat(text) {
    if (!this.connected || !this.socket || this.socket.readyState !== WebSocket.OPEN) return;
    this.socket.send(JSON.stringify({
      type: 'chat',
      text
    }));
  }

  // Interpolate remote players smoothly in render loop
  update(delta) {
    for (let [id, p] of this.remotePlayers) {
      p.farmer.group.position.lerp(p.targetPos, delta * 12);
      p.farmer.group.rotation.y = THREE.MathUtils.lerp(p.farmer.group.rotation.y, p.targetRot, delta * 12);
      p.farmer.update(delta, p.isMoving);
    }
  }
}
