# PKM Tools

A centralized collection of web tools and utilities for competitive Pokémon VGC and TCG tournaments.

Hosted on **GitHub Pages**.

---

## 🛠️ Tools Included

- [**Match Slips Generator**](makeslips/): Generate and print tournament match slips with Code 128 barcodes and check-digit validation. Supports direct roster import from TOM.
- [**RK9 Round Monitor**](rk9-monitor/): Live round tracker for RK9 pairings with multi-division support (Masters, Seniors, Juniors) and native browser push notifications when rounds near completion.
- **VGC Teamlist Generator** *(Coming Soon)*: Generate graphic and printable team sheets from Poképaste URLs.
- **VGC EVs Converter** *(Coming Soon)*: EV conversions and damage calc paste formatting.

---

## ⚖️ RK9 Terms of Service Compliance & Design Philosophy

The **RK9 Round Monitor** was designed to be fully respectful of RK9 Labs' infrastructure, data privacy policies, and Terms of Service (specifically Section 5.3):

1. **Zero Data Harvesting & Privacy Respect**:
   - The tool does **not** scrape, collect, store, index, or redistribute player personal information, rosters, or tournament histories.
   - All calculations (total matches vs. completed tables) are executed entirely client-side in the user's browser memory and discarded upon page reload.

2. **Conservative, Rate-Limited Polling (No Server Overload)**:
   - Polling intervals are strictly throttled (default 45–60 seconds), generating less than 1–2 requests per minute per active tournament.
   - This traffic pattern is completely identical to a human player or judge refreshing the public pairings page on their phone during a live round.

3. **Public Data Only**:
   - The tool only accesses public tournament pairings pages intended for real-time viewing by players and spectators during live events. No private endpoints, hidden authentication tokens, or restricted administrative areas are accessed.

4. **Non-Commercial Utility**:
   - Built purely as a free, open-source utility for tournament attendees and staff to manage their time between rounds without needing to continuously stare at pairing screens.

---

## 📁 Project Structure

```text
pkmtools/
├── index.html              # Main Portal / Hub landing page
├── makeslips/              # Tool: Match Slips Generator
│   └── index.html
├── rk9-monitor/            # Tool: RK9 Round Monitor
│   └── index.html
└── .github/
    └── workflows/
        └── deploy.yml      # Automatic GitHub Pages deployment
```

---

## 🚀 Deployment

Pushes to the `main` branch automatically build and deploy the entire hub to GitHub Pages.

To enable GitHub Pages in your repository:
1. Go to **Settings** > **Pages**.
2. Under **Build and deployment** > **Source**, choose **GitHub Actions**.
3. Push changes to `main`.
