#!/usr/bin/env python3
"""
🌴 Kerala 3D Farm Simulator - Real-time Multiplayer Server
Built with Python 3 + Tornado WebSockets & Static File Server.
"""

import os
import sys
import json
import uuid
import asyncio

# Ensure UTF-8 console output on Windows
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass
import tornado.ioloop
import tornado.web
import tornado.websocket

PORT = 3000
DATA_FILE = os.path.join(os.path.dirname(__file__), "farm_state.json")

# In-memory global state
connected_players = {}  # socket -> player_id
player_info = {}        # player_id -> { name, pos, rotY, tool }
global_farm_state = []  # list of tile states

def load_farm_state():
    global global_farm_state
    if os.path.exists(DATA_FILE):
        try:
            with open(DATA_FILE, "r", encoding="utf-8") as f:
                global_farm_state = json.load(f)
                print(f"Loaded {len(global_farm_state)} farm tiles from disk.")
        except Exception as e:
            print("Could not load farm state, starting fresh:", e)
            global_farm_state = []

def save_farm_state():
    try:
        with open(DATA_FILE, "w", encoding="utf-8") as f:
            json.dump(global_farm_state, f)
    except Exception as e:
        print("Error saving farm state:", e)

class GameWebSocketHandler(tornado.websocket.WebSocketHandler):
    def check_origin(self, origin):
        return True  # Allow connections from any local client

    def open(self):
        self.player_id = str(uuid.uuid4())[:8]
        connected_players[self] = self.player_id
        player_info[self.player_id] = {
            "name": f"കർഷകൻ {self.player_id[:4]}",
            "pos": {"x": 0, "y": 0, "z": 8},
            "rotY": 0,
            "tool": "hoe"
        }

        print(f"🌾 Player connected: {self.player_id} (Total: {len(connected_players)})")

        # 1. Send init message to new player with current farm state
        self.write_message(json.dumps({
            "type": "init",
            "id": self.player_id,
            "farmState": global_farm_state
        }))

        # 2. Tell new player about existing players
        for sock, pid in connected_players.items():
            if pid != self.player_id and pid in player_info:
                p = player_info[pid]
                self.write_message(json.dumps({
                    "type": "player_joined",
                    "id": pid,
                    "name": p["name"]
                }))
                self.write_message(json.dumps({
                    "type": "player_move",
                    "id": pid,
                    "pos": p["pos"],
                    "rotY": p["rotY"],
                    "isMoving": False,
                    "tool": p["tool"]
                }))

        # 3. Announce new player to all others
        self.broadcast({
            "type": "player_joined",
            "id": self.player_id,
            "name": player_info[self.player_id]["name"],
            "playerCount": len(connected_players)
        }, exclude_self=True)

    def on_message(self, message):
        try:
            data = json.loads(message)
            msg_type = data.get("type")

            if msg_type == "move":
                # Update player cache
                if self.player_id in player_info:
                    player_info[self.player_id]["pos"] = data.get("pos")
                    player_info[self.player_id]["rotY"] = data.get("rotY")
                    player_info[self.player_id]["tool"] = data.get("tool")

                # Broadcast movement to all other players
                self.broadcast({
                    "type": "player_move",
                    "id": self.player_id,
                    "pos": data.get("pos"),
                    "rotY": data.get("rotY"),
                    "isMoving": data.get("isMoving", False),
                    "tool": data.get("tool", "hoe")
                }, exclude_self=True)

            elif msg_type == "farm_update":
                global global_farm_state
                tiles = data.get("tiles", [])
                global_farm_state = tiles
                save_farm_state()

                # Broadcast updated tiles to all other players
                self.broadcast({
                    "type": "farm_update",
                    "tiles": tiles
                }, exclude_self=True)

            elif msg_type == "chat":
                text = data.get("text", "").strip()
                if text:
                    sender_name = player_info.get(self.player_id, {}).get("name", "കർഷകൻ")
                    self.broadcast({
                        "type": "chat",
                        "sender": sender_name,
                        "text": text
                    }, exclude_self=False)

        except Exception as e:
            print("Error processing message:", e)

    def on_close(self):
        if self in connected_players:
            pid = connected_players.pop(self)
            player_info.pop(pid, None)
            print(f"🚪 Player left: {pid} (Total: {len(connected_players)})")

            self.broadcast({
                "type": "player_left",
                "id": pid,
                "playerCount": len(connected_players)
            })

    def broadcast(self, data, exclude_self=False):
        msg = json.dumps(data)
        for sock in list(connected_players.keys()):
            if exclude_self and sock == self:
                continue
            try:
                sock.write_message(msg)
            except Exception:
                pass

class NoCacheStaticFileHandler(tornado.web.StaticFileHandler):
    def set_extra_headers(self, path):
        self.set_header("Cache-Control", "no-cache, no-store, must-revalidate")
        self.set_header("Pragma", "no-cache")
        self.set_header("Expires", "0")

def make_app():
    public_path = os.path.join(os.path.dirname(__file__), "public")
    return tornado.web.Application([
        (r"/ws", GameWebSocketHandler),
        (r"/(.*)", NoCacheStaticFileHandler, {
            "path": public_path,
            "default_filename": "index.html"
        }),
    ])

def main():
    load_farm_state()
    app = make_app()
    app.listen(PORT, address="0.0.0.0")
    print("=" * 60)
    print(f"🌴 കേരള 3D ഫാമിംഗ് സിമുലേറ്റർ സെർവർ തയ്യാറാണ്! (Server Online)")
    print(f"👉 Local URL: http://localhost:{PORT}")
    print(f"👉 Mobile / LAN: http://<Your-PC-IP>:{PORT}")
    print("=" * 60)
    try:
        tornado.ioloop.IOLoop.current().start()
    except KeyboardInterrupt:
        print("\nSaving farm state before exit...")
        save_farm_state()
        print("Server stopped cleanly.")

if __name__ == "__main__":
    main()
