# Table Ops - How It Works Under the Hood

Hey there! If you're looking at `index.html` and wondering how all this Vanilla JavaScript ties together to create a real-time, peer-to-peer table management system, you're in the right place. 

This document is a quick, human-readable breakdown of the architecture. The goal of this app was to keep things as simple and lightweight as possible—no build tools, no Node.js server, no database. Just one HTML file, some CSS, and plain ES6 JavaScript.

## 🏗️ The Big Picture

The whole app revolves around two main concepts:
1. **The Data**: Parsing and displaying the tournament pairings.
2. **The Sync**: Using **PeerJS** (WebRTC) to sync the status of each table across multiple phones in real-time, without needing a backend server.

When you open the page, it can run in one of two modes:
- **Host Mode**: If you just open the page normally, you're the Host. The app generates a random PIN (like `PKM-MRV6T`), creates a WebRTC room, and waits for people to connect.
- **Client (Judge) Mode**: If you open the page with a URL parameter like `?room=MRV6T`, the app knows you're a judge trying to connect to a Host. It skips creating a new room and immediately connects to the Host PC.

---

## 💾 The State (How we store data)

Since we don't use React or Vue, all the "state" lives in a few global JavaScript variables at the top of the script. The two most important ones are:

### 1. The `tournament` Object
This holds the static data about the tournament (the pairings). We get this data when the user clicks the Bookmarklet on the official pairings page, or pastes the HTML.
It looks like this:
```javascript
let tournament = {
    title: "Regional Championships",
    dateStr: "August 2026",
    activeDivisionId: "masters",
    divisions: {
        "masters": {
            name: "Masters",
            round: 5,
            tables: [
                { num: 1, p1: "Player 1", p2: "Player 2", isOfficialDone: false },
                // ... more tables
            ]
        }
    }
};
```
*(Note: We hardcode `p1` and `p2` to "Player 1/2" for privacy reasons, so we don't accidentally leak real names if the screen is visible to the public).*

### 2. The `tableStates` Object
While `tournament` holds the static pairings, `tableStates` holds the *dynamic* stuff—the buttons the judges are tapping on their phones.
It's just a big dictionary (object) where the key is a combination of the division, round, and table number (e.g., `masters_R5_12`).
```javascript
let tableStates = {
    "masters_R5_12": {
        status: "playing", // can be 'default', 'playing', 'judge', or 'empty'
        timestamp: 1693400000000, // when the button was tapped
        peerId: "PKM-JUDGE-xyz"   // who tapped it
    }
};
```

---

## 📡 The P2P Magic (PeerJS)

We use [PeerJS](https://peerjs.com/) to handle the WebRTC connections. WebRTC is notoriously annoying to set up manually, but PeerJS makes it as easy as opening a WebSocket.

Here's the flow of how data moves around:
1. **Connecting**: The Host runs `new Peer(myRoomId)`. The Client runs `myPeer.connect(targetRoom)`. 
2. **The Handshake**: PeerJS uses a free signaling server (`0.peerjs.com`) just to exchange IP addresses. Because mobile networks can be strict with NATs, we also explicitly pass Google's STUN servers and a free TURN server (`openrelay.metered.ca`) in the config to guarantee the connection works even on cellular data.
3. **Syncing**: Once connected, the Host immediately sends a `SYNC_BOARD` message containing the entire `tournament` and `tableStates` objects to the Client.
4. **Updating**: When a judge taps a table to mark it as "Judge Call", the Client updates its local `tableStates` and sends an `UPDATE_TABLE` message to the Host. The Host receives it, updates its own master state, and rebroadcasts it to *all other* connected judges so everyone's screen updates instantly.

---

## ⚙️ The Core Functions to Know

If you're digging through the code, these are the main functions doing the heavy lifting:

- **`handleUrlHash()` & `processPastedHtml()`**: These functions ingest the raw HTML from the pairings page. They use standard `DOMParser` to read the HTML, extract the tables, and populate the `tournament` object.
- **`renderTables()`**: The core UI loop. It clears the grid and rebuilds the HTML for every table. It checks both the static `tournament` data and the dynamic `tableStates` to figure out what color/timer the table should have.
- **`startGhostTimer()`**: A simple `setInterval` that runs every second. It checks if any table has a status of `'empty'`. If it's been empty for more than 120 seconds (and isn't officially marked as done), it flags it as a **Ghost Table** (`st-ghost`) to alert the staff that something is wrong.

And that's pretty much it! It's just a bunch of DOM manipulation and simple JSON messages flying back and forth over WebRTC. Feel free to tweak it!
