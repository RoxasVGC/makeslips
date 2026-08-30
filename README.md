# PKM Tools

A centralized, open-source collection of web tools and utilities for competitive Pokémon VGC and TCG tournaments.

Hosted on **GitHub Pages**.

---

## 🛠️ Tools Included

- [**Match Slips Generator**](makeslips/): Create and print tournament match slips with Code 128 barcodes, check-digit calculations, and direct roster import from TOM (Tournament Operation Manager).
- [**Round Monitor**](rk9-monitor/): Live round progress tracker for official tournament pairings with multi-division support (Masters, Seniors, Juniors) and native browser push notifications when rounds near completion.
- [**Table Operations Grid**](table-ops/): Real-time collaborative table management and floor operations grid for judges and staff. Features instant P2P smartphone sync via QR code, active ruling timers, and automatic **Ghost Table** detection ($T \ge 2\text{ min}$ empty without result).
  - **⚠️ Network Requirements for P2P Sync**: 
    1. **Same Local Network**: The Host PC and Judges' smartphones must be connected to the exact same Wi-Fi network (or a dedicated 4G/5G portable router).
    2. **No Client Isolation**: The Wi-Fi network MUST have "AP Isolation" / "Client Isolation" disabled. (Public guest networks and mobile phone hotspots often enable this by default, blocking WebRTC P2P).
    3. **Internet Access**: The local router must have an active internet connection (even a minimal data plan) to perform the initial 2-second PeerJS matchmaking handshake. After the devices connect, traffic remains 100% local.

---

## ⚖️ RK9 Terms of Service Compliance & Architectural Design

## 📁 Project Structure

```text
pkmtools/
├── index.html              # Main Portal / Hub landing page
├── makeslips/              # Tool: Match Slips Generator
│   └── index.html
├── rk9-monitor/            # Tool: Round Monitor
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
