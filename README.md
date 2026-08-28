# PKM Tools

A centralized, open-source collection of web tools and utilities for competitive Pokémon VGC and TCG tournaments.

Hosted on **GitHub Pages**.

---

## 🛠️ Tools Included

- [**Match Slips Generator**](makeslips/): Create and print tournament match slips with Code 128 barcodes, check-digit calculations, and direct roster import from TOM (Tournament Operation Manager).
- [**RK9 Round Monitor**](rk9-monitor/): Live round progress tracker for official RK9 pairings with multi-division support (Masters, Seniors, Juniors) and native browser push notifications when rounds near completion.
- [**Table Operations Grid**](table-ops/): Real-time collaborative table management and floor operations grid for judges and staff. Features instant P2P smartphone sync via QR code, active ruling timers, and automatic **Ghost Table** detection ($T \ge 2\text{ min}$ empty without result).
- **VGC Teamlist Generator** *(Coming Soon)*: Generate graphic and printable team sheets from Poképaste URLs.
- **VGC EVs Converter** *(Coming Soon)*: EV conversions and damage calculation paste formatting.

---

## ⚖️ RK9 Terms of Service Compliance & Architectural Design

The **RK9 Round Monitor** and **Table Operations Grid** have been designed from the ground up to operate in full accordance with the spirit and text of **RK9 Labs' Terms of Service** (specifically *Section 3: Your Use of the Services* and *Section 5.3: Prohibited Uses*).

### 1. No Data Harvesting or Personal Data Storage (Section 5.3, Clauses 1 & 8)
* **What the ToS Prohibits**: Collecting, harvesting, or storing personal data about users or misappropriating event data for commercial gain.
* **Our Architecture**:
  * The tool does **not** collect, store, index, or database player personal info or tournament archives.
  * Calculations (such as table status tracking and completed tables) are computed **in-memory** in the user's browser session and immediately discarded on page refresh. Zero data is persisted or shared externally.

### 2. Conservative, Human-Equivalent Polling (Section 5.3, Clause 5)
* **What the ToS Prohibits**: Taking any action that imposes an unreasonable load on RK9 computer or network equipment.
* **Our Architecture**:
  * Polling is strictly throttled to conservative intervals (**45–60 seconds** by default).
  * This generates approximately **1 request per minute** per monitored tournament—an identical footprint to a single attendee manually refreshing the pairings page on their smartphone.

### 3. Read-Only Public Event Data (Section 5.3, Clauses 2 & 10)
* **What the ToS Prohibits**: Using automated bots or scripts to modify or automate operations within the Service (e.g. automating tournament registration, botting deck submissions, or bypassing authentication/security controls).
* **Our Architecture**:
  * The monitor is **strictly read-only**. It does not automate any actions, submissions, or account interactions.
  * It only queries public tournament URLs (`rk9.gg/pairings/...`) that are intentionally made public for players and spectators during live events.

### 4. Direct Client-Side Proxy Architecture
* **How it works**: A dedicated, stateless Cloudflare Worker acts as a lightweight CORS pass-through between the user's browser and the public RK9 pairings page.
* **Integrity**: The proxy does not cache, alter, or inject payloads; it passes standard browser headers to request public event markup.

---

## 📁 Project Structure

```text
pkmtools/
├── index.html              # Main Portal / Hub landing page
├── makeslips/              # Tool: Match Slips Generator
│   └── index.html
├── rk9-monitor/            # Tool: RK9 Round Monitor
│   └── index.html
├── table-ops/              # Tool: Table Operations Grid
│   └── index.html
└── .github/
    └── workflows/
        └── deploy.yml      # Automatic GitHub Pages deployment
```

---

## 🚀 Deployment

Pushes to the `main` branch automatically build and deploy the entire hub to GitHub Pages.

To enable GitHub Pages in your repository:
1. Go to repository **Settings** > **Pages**.
2. Under **Build and deployment** > **Source**, select **GitHub Actions**.
3. Push changes to `main`.
