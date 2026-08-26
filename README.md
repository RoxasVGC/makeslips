# Match Slips Generator

A lightweight, high-performance web tool for generating printable tournament match slips with Code 128 barcodes, check-digit calculation, and player metadata (compatible with TOM, RK9, Play! Pokémon, and similar tournament systems).

Hosted directly via **GitHub Pages**.

---

## 🚀 GitHub Pages Integration & Automation

### Automated Deployment
The repository includes a GitHub Actions workflow in [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) that deploys the application automatically to GitHub Pages whenever changes are pushed to the `main` branch.

To enable GitHub Pages in your repository:
1. Go to your GitHub repository **Settings** > **Pages**.
2. Under **Build and deployment** > **Source**, select **GitHub Actions**.
3. Push to `main` (or run the workflow manually via **Actions** tab).

---

## 📋 Direct Clipboard Import from TOM (Tournament Operation Manager)

You can click **"📋 Paste from TOM"** on the control panel to paste raw text copied directly from TOM:
- **Standings sheet** (e.g. `Standings - Round 1/7 (Preliminary Results)`)
- **Pairings sheet** (e.g. `Pairings - Round 1`)

The parser will automatically:
1. Extract **Tournament Name** (from `Tournament: <Name>` or footer).
2. Extract **Round Number** (from `Round X/Y`).
3. Extract **Category / Pod** (e.g., `Categoria Master`).
4. Ignore table headers, page labels, and timestamps.
5. Auto-pair players into match slips with player records and IDs.

---

## 🔌 Chrome Extension & URL Ingestion API

You can programmatically populate and generate match slips directly from a Chrome Extension, bookmarklet, or external script using **URL Hash**, **Query Parameters**, or **`window.postMessage`**.

### 1. JSON Payload Structure

```json
{
  "tournamentName": "Regional Championship Bologna",
  "podId": "2",
  "roundNum": 1,
  "autoGenerate": true,
  "autoPrint": false,
  "matches": [
    {
      "table": "1",
      "p1Name": "Andrea Ceolin [IT]",
      "p1Id": "123456",
      "p1Stats": "3/0/0 (9)",
      "p2Name": "Marco Silva [ES]",
      "p2Id": "654321",
      "p2Stats": "3/0/0 (9)"
    },
    {
      "table": "2",
      "p1Name": "Alex Vance [US]",
      "p1Id": "789012",
      "p1Stats": "3/0/0 (9)",
      "p2Name": "Jean Dupont [FR]",
      "p2Id": "345678",
      "p2Stats": "3/0/0 (9)"
    }
  ]
}
```

*Note: The parser is lenient and accepts aliases (e.g., `p1_name`, `player1`, `p1Id`, `player1Id`, etc.).*

---

### 2. Passing Data via URL Hash (Recommended for large payloads)

Passing data in the hash (`#data=...` or `#b64=...`) prevents server request length limit errors.

#### Option A: URL-Encoded JSON
```javascript
const payload = {
  tournamentName: "VGC Special Event",
  podId: "2",
  roundNum: 1,
  autoGenerate: true,
  matches: [ /* ... array of matches ... */ ]
};

const url = `https://<username>.github.io/makeslips/#data=${encodeURIComponent(JSON.stringify(payload))}`;
window.open(url, '_blank');
```

#### Option B: UTF-8 Base64 Encoded
```javascript
function toBase64Utf8(str) {
  return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) => String.fromCharCode('0x' + p1)));
}

const b64 = toBase64Utf8(JSON.stringify(payload));
const url = `https://<username>.github.io/makeslips/#b64=${b64}`;
window.open(url, '_blank');
```

---

### 3. Passing Data via Query String (for quick presets)

```
https://<username>.github.io/makeslips/?tournamentName=Bologna+Regional&podId=2&roundNum=3&autoGenerate=true
```

---

### 4. Direct Communication via `window.postMessage`

If your Chrome extension injects or embeds the generator:

```javascript
// Target window or iframe reference
targetWindow.postMessage({
  type: 'MAKESLIPS_IMPORT',
  payload: tournamentPayload
}, '*');
```

---

## 🖨️ Printing & Layout
- **Page Layout**: Formatted for standard 8.5" x 11" (US Letter) or A4 paper.
- **Barcodes**: Generated dynamically using `JsBarcode` (Code 128) with rotation and check-digit computation for automatic scanner processing.
