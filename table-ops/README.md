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

## ⚙️ 4. The Exhaustive Function Map

If you're reading through the code top-to-bottom, here is **EVERY** function in `index.html` and what it does. This will be critical for porting to TypeScript.

### 📊 Data Ingestion & Parsing
These functions are responsible for scraping external websites (RK9/TOM) or parsing pasted HTML/XML.
- **`setupBookmarklet()`**: Injects the "Sync to Table Ops" code into the current session to extract pairing HTML.
- **`handleUrlHash()`**: Extracts the base64-encoded `#data=` from the URL on load and builds the `tournament` object.
- **`processPastedHtml()` & `parsePairingsData()`**: Parses manually pasted RK9 HTML using `DOMParser`.
- **`parseTomData(xmlString)`**: Parses Pokemon TOM (Tournament Operations Manager) XML files.
- **`startTomSync()`, `startTomInterval()`, `applyTomSettings()`, `forceTomSync()`**: Functions for pinging a local TOM print-server endpoint repeatedly to auto-fetch XML pairings.

### 🖼️ UI & Rendering Engine
These functions take the state objects and forcefully inject them into the DOM.
- **`renderDivisions()`**: Draws the tabs (Masters, Seniors, Juniors) at the top of the screen.
- **`renderTables()`**: The massive god-function that loops through every table, calculates CSS classes/timers, and injects `innerHTML` into the grid.
- **`selectDivision(divId)`**: Switches the active tab and triggers a re-render.
- **`setFilter(filterType)`**: Filters the view to show only "ghost", "empty", "judge", etc.

### 🎮 Table & Player State Logic
- **`cycleTableState(divId, tableNum)`**: Changes a table from Default -> Playing -> Judge -> Empty.
- **`cycleTableStateWrapper()`**: Prevents a normal click from firing if the user just did a "Long Press".
- **`startTableLongPress()`, `endTableLongPress()`**: Sets a 500ms timer on touch/mousedown. If it completes, opens the Deck Check Modal.
- **`updatePlayerCheck(playerIndex, checkType, isChecked)`**: Updates `playerStates` when a Partial/Full check box is ticked and broadcasts the change.

### 🌐 Networking (PeerJS)
- **`initP2P()`**: The main bootstrapper. Checks if the URL has `?room=`, and either boots as Host or Client.
- **`startHost(pin)`**: Creates a Host Peer, manages `connectedPeers`, and listens for incoming connections.
- **`setupClientConnection(conn, roomName)`**: Creates the Client Peer and establishes the WebRTC DataChannel to the Host.
- **`broadcastAction(action)`**: The main network emitter.
- **`handleIncomingAction(data)`**: The router that reads `data.type` (`SYNC_BOARD`, `UPDATE_TABLE_STATE`, etc.) and applies it.
- **`normalizeRoomId()`**: Cleans up typos in manually entered room codes.

### 📱 Modals & UI Interactions
- **`openPasteModal()`, `closePasteModal()`**: For RK9 HTML pasting.
- **`openQrModal()`, `closeQrModal()`, `generateQrCode()`, `getShareUrl()`, `copyRoomLink()`**: For letting Judges scan to join.
- **`openJoinModal()`, `closeJoinModal()`, `connectWithPin()`, `applyCustomRoomPin()`**: For manually entering a PIN or setting a custom Host PIN.
- **`toggleHaptics()`, `updateHapticButton()`**: Enables/Disables vibration on phone devices.
- **`confirmResetRound()`, `clearSession()`**: Nukes the `localStorage` and resets the board.

### 🗣️ Deck Checks & Translations
- **`openDeckCheckModal()`, `closeDeckCheckModal()`**: Controls the modal that opens on Long Press.
- **`openTranslationModal()`, `sendTranslationRequest(language)`**: When clicking "Req. Translation", builds the `TRANSLATION_REQUEST` packet.
- **`handleTranslationEvent(data)`**: If a translation is requested, checks if the Judge speaks that language and shows the red banner.
- **`acceptTranslation()`, `dismissTranslationBanner()`**: The logic when a Judge taps "Accept" on the translation banner.

### ⏳ Timers, Background, & Utils
- **`startGhostTimer()`, `updateTimerDisplays()`**: Runs a `setInterval` every second to update timestamps and trigger the yellow/blinking warning CSS on old tables.
- **`saveLocalState()`, `loadLocalState()`**: Syncs `tournament`, `tableStates`, `playerStates`, and `myProfile` to the browser's `localStorage`.
- **`escapeHtml(str)`**: Protects against XSS attacks from weird player names.
- **`logDebug(msg)`**: Console logger.

---

## 🚀 5. TypeScript Migration Guide (The Future)

If you're planning to port this Vanilla JS/HTML monolith into a modern **TypeScript** application (e.g., using React, Vue, or even just Vite + TS), here is a breakdown of what needs to change, what to throw away, and how to structure it based on the exhaustive function list above.

### 🗑️ What to THROW AWAY and COMPLETELY REWRITE:
1. **The God Object (`index.html`)**: Currently, CSS, HTML, and JS are stuffed into one 2000+ line file. In TS, you must split this into components.
2. **All Rendering Functions (`renderTables()`, `renderDivisions()`)**: The string-based DOM manipulation (`innerHTML += ...`) is completely deprecated. In TS (with a framework like React), you'll map over arrays and return strongly-typed JSX/TSX elements. You will NEVER manually build an HTML string again.
3. **Global Variables**: `let tournament`, `let tableStates`, `let playerStates` must be removed from the global scope. In TS, these should be managed by a strict state manager (Zustand, Redux, or React Context) to ensure type safety and reactivity.
4. **`onclick` attributes in HTML strings**: Inline handlers like `onclick="cycleTableState('...', 1)"` are bad practice. They should be passed as typed callback props to your child components.
5. **Direct Modal Functions (`openQrModal()`, `closeQrModal()`)**: You won't manually change `style.display = 'flex'`. Instead, you will use boolean state variables (e.g., `const [isQrModalOpen, setIsQrModalOpen] = useState(false)`).

### 🔄 What to KEEP (but Strongly Type):
1. **The State Data Structures**: The core concept of separating static `tournament` data from dynamic `tableStates` and `playerStates` dictionaries is solid. You just need to define Interfaces for them!
2. **PeerJS Networking**: WebRTC logic (`initP2P`, `startHost`, `setupClientConnection`) stays roughly the same, but the payload must be strictly typed as a Discriminated Union. It should be wrapped in a custom hook (e.g., `usePeerNetwork.ts`) or a Zustand middleware.
3. **Parsers**: Functions like `parsePairingsData()` and `parseTomData()` should be extracted verbatim into a pure utility file (e.g., `parsers.ts`).

### 📝 Required TypeScript Interfaces

To migrate, you must start by defining your types. Here is the blueprint you'll need:

```typescript
// 1. Core Data Models
export interface Table {
    num: number;
    p1: string;
    p2: string;
    isOfficialDone: boolean;
}

export interface Division {
    name: string;
    round: number;
    rawLabel: string;
    tables: Table[];
}

export interface TournamentData {
    url: string;
    id: string;
    title: string;
    dateStr: string;
    activeDivisionId: string;
    divisions: Record<string, Division>;
}

// 2. Dynamic States
export type TableStatus = 'default' | 'playing' | 'judge' | 'empty' | 'ghost' | 'complete';

export interface TableState {
    status: TableStatus;
    timestamp: number;
}

export interface PlayerState {
    partial: boolean;
    full: boolean;
}

export interface MyProfile {
    name: string;
    languages: string[];
}

// 3. Network Payloads (Discriminated Unions)
export type PeerAction = 
  | { type: 'SYNC_BOARD', tournament: TournamentData, tableStates: Record<string, TableState>, playerStates: Record<string, PlayerState> }
  | { type: 'UPDATE_TABLE_STATE', key: string, state: TableState }
  | { type: 'UPDATE_PLAYER_STATE', key: string, state: PlayerState }
  | { type: 'TRANSLATION_REQUEST', key: string, tableNum: number, language: string, sender: string }
  | { type: 'TRANSLATION_ACCEPTED', key: string, acceptor: string };
```

### 🛠️ Component Mapping (How functions become Files)
When you scaffold your new project (`npm create vite@latest table-ops-v2 -- --template react-ts`), here is how the spaghetti unwinds:

- **`App.tsx`**: The main wrapper. Calls `loadLocalState` (via Zustand persist) and `initP2P` (via a `useEffect` hook).
- **`components/TableGrid.tsx`**: Replaces `renderTables()`. Maps over `tournament.divisions[activeId].tables` and outputs `<TableCard />` components.
- **`components/TableCard.tsx`**: Receives `p1`, `p2`, and `status` as props. Replaces the massive HTML template literal.
- **`components/Modals/DeckCheckModal.tsx`**: Replaces `openDeckCheckModal()` and its HTML. Takes `playerStates` from the global store and dispatches `updatePlayerCheck()`.
- **`components/Modals/TranslationModal.tsx`**: Handles `sendTranslationRequest()`.
- **`hooks/usePeerJS.ts`**: Encapsulates `startHost`, `setupClientConnection`, `broadcastAction`, and `handleIncomingAction`.
- **`store/useTableStore.ts`**: A Zustand store that replaces all global variables and handles `saveLocalState`/`loadLocalState` automatically using the `persist` middleware.
- **`utils/parsers.ts`**: Pure functions taking HTML/XML strings and returning typed `TournamentData` objects.
