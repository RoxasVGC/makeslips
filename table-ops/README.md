# Table Operations Grid - Developer Documentation

This document provides a comprehensive overview of the JavaScript architecture, state management, and core logic used in `index.html` for the **Table Operations Grid**. It is specifically designed to assist developers in migrating the Vanilla JavaScript codebase to TypeScript.

## 🏗️ Architecture Overview

The application is a single-page HTML file (`index.html`) that uses **Vanilla JavaScript (ES6)**. It utilizes the **PeerJS** library (WebRTC wrapper) to establish direct Peer-to-Peer (P2P) connections between devices without a central database server.

The app operates in two distinct modes depending on the URL parameters:
1. **Host Mode**: Runs on the main PC. Maintains the master state, accepts incoming connections from Judges (Clients), and broadcasts state changes.
2. **Client Mode** (Judge): Runs on smartphones. Connects to the Host via a PIN (`?room=...`), receives the master state, and sends table status updates back to the Host.

## 💾 State Management (Data Structures)

If translating to TypeScript, these are the core interfaces that define the application's global state.

### 1. `tournament` Object
Holds the parsed tournament pairings data. This data is read-only from the perspective of the application (it is overwritten only when new pairings are injected via Bookmarklet or Paste).

```typescript
interface Table {
    num: number;             // Table number
    p1: string;              // Hardcoded to "Player 1" for privacy
    p2: string;              // Hardcoded to "Player 2" for privacy
    isOfficialDone: boolean; // True if the table has a result on the official pairings
}

interface Division {
    name: string;
    round: number;
    rawLabel: string;
    tables: Table[];
}

interface TournamentData {
    title: string;
    dateStr: string;
    activeDivisionId: string;
    divisions: Record<string, Division>; // Keyed by HTML division ID
}
```

### 2. `tableStates` Object
Holds the dynamic state of each table manipulated by the Judges. The key is a composite string: `${divId}_R${round}_${tableNum}`.

```typescript
type TableStatus = 'default' | 'playing' | 'judge' | 'empty';

interface TableState {
    status: TableStatus;
    timestamp: number;       // Date.now() when the status changed
    peerId: string;          // The Peer ID of the judge who made the change
}

// Global Dictionary
let tableStates: Record<string, TableState> = {};
```

## 🌐 WebRTC (PeerJS) Lifecycle

The application uses `PeerJS` to sync the `tournament` and `tableStates` objects across devices.

### Core Variables
- `let myPeer: any`: The PeerJS instance for the current device.
- `let isHost: boolean`: `true` if this device created the room, `false` if joined via `?room=`.
- `let myRoomId: string`: The current device's Peer ID.
- `let connectedPeers: any[]`: (Host only) Array of active `DataConnection` objects.

### Message Protocol
Devices communicate by sending JSON objects over the WebRTC `DataChannel`.
```typescript
interface SyncBoardMessage {
    type: 'SYNC_BOARD';
    tournament: TournamentData;
    tableStates: Record<string, TableState>;
}

interface UpdateTableMessage {
    type: 'UPDATE_TABLE';
    key: string;            // e.g., 'div1_R1_12'
    status: TableStatus;
    timestamp: number;
    peerId: string;
}
```

### Flow:
1. **Client Action**: A Judge taps a table. `changeTableStatus()` updates the local `tableStates` and sends an `UPDATE_TABLE` message to the Host.
2. **Host Reception**: The Host receives `UPDATE_TABLE`, updates its master `tableStates`, and broadcasts the `UPDATE_TABLE` message to *all other* connected Clients.
3. **Client Reception**: Other Clients receive `UPDATE_TABLE`, update their local `tableStates`, and re-render the affected table.

## 🔄 Core Functions

### Data Ingestion
- `setupBookmarklet()`: Injects a JavaScript URI into the bookmark button. When clicked on the pairings page, it scrapes the DOM, serializes it, and sends it to `table-ops` via URL hash (`#data=...`).
- `parsePairingsData(html: string)`: Parses raw HTML pasted in the modal, extracts tables using `DOMParser`, and populates the `tournament` object.

### Rendering
- `renderDivisions()`: Renders the pill-navigation for different age divisions.
- `renderTables()`: Renders the grid of tables based on `tournament.divisions[activeDivisionId]`. It merges the static data (`isOfficialDone`) with the dynamic `tableStates`.
- `createTableElement(...)`: Generates the HTML string for a single table card.

### Ghost Table Engine
- `startGhostTimer()`: Starts a `setInterval` that fires every 1000ms.
- `updateTimerDisplays()`: Iterates through all rendered tables. If a table has `status === 'empty'` and has been empty for $\ge 120$ seconds without being officially reported (`!isOfficialDone`), it applies the `st-ghost` CSS class and alerts the UI.

## 📱 Network Constraints (Important for TS Migration)

When porting this logic or hosting it on a restricted corporate/official domain:
- The app relies on **public STUN servers** (`stun.l.google.com`) and a **fallback TURN server** (`openrelay.metered.ca`) configured in the `new Peer(...)` initialization.
- The app requires the host and clients to be on the same local network without AP Isolation, OR have access to the TURN server, to establish WebRTC channels successfully.
