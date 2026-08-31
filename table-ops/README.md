# Table Ops - The Developer Deep Dive

Hey there! If you're looking to understand, tweak, or port the `index.html` file of the **Table Operations Grid**, you've come to the right place.

This app is built entirely in **Vanilla JavaScript (ES6)**. There are no build tools, no Node.js backend, and no React. It's just you, the DOM, and WebRTC. The architecture is designed to be a completely serverless, peer-to-peer (P2P) mesh using the **PeerJS** library.

Here's a conversational breakdown of how all the moving parts fit together.

---

## 🏗️ 1. The Global State (Our "Database")

Since we don't have a backend database, the "truth" lives in memory on the Host PC and is mirrored to the Judges' smartphones. We use two main objects to store everything:

### The `tournament` Object (Static Data)
This is where we store the actual tournament pairings. We treat this as "read-only" data once it's imported.
It looks exactly like this under the hood:
```javascript
let tournament = {
    title: "Regional Championships",
    dateStr: "August 2026",
    activeDivisionId: "masters", // Keeps track of which tab is currently selected
    divisions: {
        "masters": {
            name: "Masters",
            round: 5,
            rawLabel: "Masters in Round 5",
            tables: [
                {
                    num: 1, 
                    p1: "Player 1", // Hardcoded for privacy
                    p2: "Player 2", 
                    isOfficialDone: false // True if the official pairings show a result
                }
            ]
        }
    }
};
```

### The `tableStates` Object (Dynamic Data)
This is where the magic happens. Every time a judge taps a table on their phone, we record it here. 
Instead of arrays, this is a giant Dictionary (Object) where the key is a unique string `"{division}_R{round}_{tableNum}"`. This makes it insanely fast to look up a table without looping through arrays.

```javascript
let tableStates = {
    "masters_R5_12": {
        status: "playing",       // The current state
        timestamp: 1693400000,   // Date.now() when the button was tapped
        peerId: "PKM-JUDGE-xyz"  // The ID of the device that made the change
    }
};
```

*(Note: The allowed statuses are `'default'`, `'playing'`, `'judge'`, and `'empty'`)*.

---

## 🎨 2. The CSS Classes (UI States)

When we render the tables in the HTML grid, we map the JavaScript `status` to specific CSS classes. This is what changes the colors on the screen:

- `.table-card` (Default state, gray border, unassigned)
- `.table-card.st-playing` (Green background: players are seated and playing)
- `.table-card.st-judge` (Red background: active judge call)
- `.table-card.st-empty` (Yellow background: match finished, slip picked up, but result not reported yet)
- `.table-card.st-ghost` (Blinking warning: table has been `st-empty` for over 2 minutes. Something is wrong!)
- `.table-card.complete` (Dark gray, crossed out: the official pairings confirm the match is over).

---

## 📡 3. The P2P Networking (PeerJS)

We use WebRTC to let browsers talk directly to each other. 
- **`isHost`**: A boolean. If you open the page normally, you are the Host (`isHost = true`).
- **`myRoomId`**: Your device's unique ID.
- **`connectedPeers`**: An array (Host only) keeping track of all connected Judges.

### The Handshake
1. The Host initializes `new Peer(myRoomId)`.
2. A Judge scans the QR code (which adds `?room=PKM-XYZ` to the URL).
3. The Judge's browser reads the URL, sees the room code, and calls `myPeer.connect("PKM-XYZ")`.

*Network Tip: We pass Google STUN servers and a free TURN server (`openrelay.metered.ca`) to the PeerJS config. Without this, smartphones on 4G/5G wouldn't be able to punch through NAT firewalls to reach the Host PC!*

### The Communication Loop
When someone taps a table, we don't just change the color locally. We call:
`broadcastAction({ type: 'UPDATE_TABLE', key: 'masters_R5_12', status: 'judge', timestamp: Date.now(), peerId: myRoomId })`
- **If a Judge calls it**: The JSON goes to the Host. The Host updates its master `tableStates`, then bounces that JSON out to *all other* connected judges.
- **If the Host calls it**: The JSON goes directly to all judges.

---

## ⚙️ 4. The Core Functions (What does what?)

If you're reading through the code top-to-bottom, here are the functions doing the heavy lifting:

### Data Ingestion
- **`setupBookmarklet()`**: This builds the JavaScript code that lives inside the "🔖 Sync to Table Ops" button. When clicked on the official pairings page, it scrapes the DOM, builds the `tournament` object, and sends it to our app via the URL Hash (`#data=...`).
- **`handleUrlHash()`**: Listens for that `#data=` string on page load, parses the JSON, and loads the tournament.
- **`processPastedHtml()` & `parsePairingsData()`**: If the user uses the "Paste HTML" modal instead of the bookmarklet, these functions use `DOMParser` to read the raw HTML string, hunt down the tables using CSS selectors, and build the `tournament` object.

### The UI Engine
- **`renderDivisions()`**: Builds the top tabs (Masters, Seniors, Juniors).
- **`renderTables()`**: The most important visual function. It loops through `tournament.divisions[activeDivisionId].tables`, checks `tableStates` to see what color the table should be, and calls...
- **`createTableElement(table, state)`**: Returns the raw HTML string (`<div class="table-card...">...</div>`) for a single table.

### The Logic Engine
- **`changeTableStatus(tNum, status)`**: Triggered when a table card is clicked. Updates `tableStates` and fires the network broadcast.
- **`startGhostTimer()` & `updateTimerDisplays()`**: A heartbeat function that runs every 1 second (`setInterval`). It scans all rendered tables. If a table is marked as `empty`, it calculates `Date.now() - timestamp`. If it's over 120 seconds, it forcibly applies the `st-ghost` CSS class and changes the text to "⚠️ GHOST".

And that's the whole app in a nutshell! Simple, stateless, and entirely client-side.
