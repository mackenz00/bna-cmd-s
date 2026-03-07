# Pet License Explorer

**Turning public pet license data into story-ready insights for journalists.**

[Live site →](https://mackenz00.github.io/bna-cmd-s/)

## What it does

Pet License Explorer is a browser-based tool that helps journalists analyze public pet licensing data. Upload a CSV of pet license records and the tool will:

- Generate interactive visualizations (top pet names, breed breakdowns, species ratios)
- Surface data-driven story ideas with real statistics from your data
- Provide ZIP code-level search with local pet data and U.S. Census demographic context
- Export publication-ready SVG charts with source attribution

All data processing happens in the browser — no data is sent to any server.

## Demo

The tool includes a built-in demo using [Seattle's open pet license data](https://data.seattle.gov/). Click "Demo with Seattle's Data" to explore the full feature set.

## Data requirements

Upload a CSV file with the following columns (column names must match exactly):

- `License Issue Date`
- `Animal's Name`
- `Species`
- `Primary Breed`
- `Secondary Breed`
- `ZIP Code`

## Tech stack

- **Front end:** JavaScript, HTML, CSS
- **Visualizations:** [Vega-Lite](https://vega.github.io/vega-lite/)
- **CSV parsing:** [PapaParse](https://www.papaparse.com/)
- **Demographic data:** [Data Commons API](https://datacommons.org/) (U.S. Census Bureau / American Community Survey)
- **API proxy:** Google Cloud Functions
- **Hosting:** GitHub Pages

## Data sources and attribution

- Pet license data: [Seattle Open Data](https://data.seattle.gov/)
- Demographic data: [Data Commons](https://datacommons.org/) sourcing from the U.S. Census Bureau's American Community Survey (ACS 5-year estimates)

Note: Demographic figures may differ from other sources like Census Reporter due to different ACS vintage years and ZCTA boundary definitions. Data vintage is displayed alongside all demographic results for transparency.

## About

Built by [Kenzie Possee](https://kenziepossee.com) at Stanford University for Building News Apps (winter 2026), with coding assistance from [Claude](https://claude.ai) by Anthropic.

Special thanks to Marnette Federis.