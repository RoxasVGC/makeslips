# PKM Tools

A centralized collection of web tools and utilities for competitive Pokémon VGC and TCG tournaments.

Hosted on **GitHub Pages**.

## Tools Included

- [**Match Slips Generator**](makeslips/): Generate and print tournament match slips with Code 128 barcodes and check-digit validation. Supports direct roster import from TOM.
- **VGC Teamlist Generator** *(Coming Soon)*: Generate graphic and printable team sheets from Poképaste.
- **VGC EVs Converter** *(Coming Soon)*: EV conversions and damage calc paste formatting.

## Project Structure

```text
pkmtools/
├── index.html              # Main Portal / Hub landing page
├── makeslips/              # Match Slips Generator
│   └── index.html
└── .github/
    └── workflows/
        └── deploy.yml      # Automatic GitHub Pages deployment
```

## Deployment

Pushes to the `main` branch automatically build and deploy the entire hub to GitHub Pages.

To enable GitHub Pages in your repository:
1. Go to **Settings** > **Pages**.
2. Under **Build and deployment** > **Source**, choose **GitHub Actions**.
3. Push changes to `main`.
