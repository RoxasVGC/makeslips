# Match Slips Generator

Web tool to quickly generate and print tournament match slips with Code 128 barcodes and check-digit validation. Built for Pokémon TCG / VGC events using TOM (Tournament Operation Manager) or RK9.

## What it does

- **TOM Roster Import**: Paste standings or pairings copied directly from TOM to automatically load the tournament name, round number, and the full player roster.
- **Player Dropdowns**: Pick players from the imported list to auto-fill their names and current scores, or choose "Other" to enter a custom name manually.
- **On-Demand Slips**: Add only the specific tables you need to print (late entries, penalty slips, reprints, or fixed pairings).
- **Print Ready**: Generates printable slips formatted for US Letter and A4 with standard cut lines and barcode scanner keys.

## Usage

1. Open `index.html` in your browser (or use the GitHub Pages link).
2. Click **"Paste from TOM"** and paste the text copied from TOM's standings or pairings screen.
3. Add tables as needed with **"+ Add Table"**.
4. Select players from the dropdown (or type custom names).
5. Click **"Generate Match Slips"** and print (`Ctrl + P`).

## Deployment

The project is deployed to GitHub Pages via GitHub Actions on push to `main`.
To enable it in your fork:
1. Go to repository **Settings** > **Pages**.
2. Set **Source** to **GitHub Actions**.
3. Push to `main`.
