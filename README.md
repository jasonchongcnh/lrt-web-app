# Macao LRT Web App

A React + Vite website for Macao Light Rapid Transit (LRT) information, with station details, route planning, fare lookup, and four-language support.

## Live Site

- https://jasonchongcnh.github.io/lrt-web-app/

## Features

- Station list and station detail pages
- Route planning between stations
- Fare query with ticket type options
- Traditional Chinese, Simplified Chinese, English, and Portuguese UI
- September 2026 timetables for all 15 stations and 28 platform directions
- Station images and branding assets
- Leaflet + OpenStreetMap map view
- Saved stations, persistent language/theme preferences, and configurable arrival reminders

## Tech Stack

- React 19
- Vite 7
- React Router
- Leaflet
- Tailwind CSS
- Lucide React

## Deployment

This repository is configured for GitHub Pages deployment at:

- `https://jasonchongcnh.github.io/lrt-web-app`

The app is built with the correct base path for that URL.

## Development and validation

```sh
npm ci
npm run dev
npm run lint
npm test
npm run build
npm run test:browser
```

The timetable tests use the reviewed transcription included in
`scripts/fixtures/2026-09/`, so they also run from a standalone checkout.
They cover every schedule, arrival boundaries, Macau time across device timezones,
public holidays, after-midnight service, and station service hours. The full
suite also covers route/fare symmetry, same-station journeys, and per-train
reminder identity and delivery rules. See the
[fixture notes](scripts/fixtures/2026-09/README.md) for provenance and the Airport
hour-label interpretation.

Arrival countdowns refresh from bundled schedules on the home, station-list,
and station-detail pages. Public-holiday calendars cover 2026 and 2027, using
the published government holiday lists (excluding public-employee compensatory
rest days). Unknown years display a notice to check holiday schedules.

Reminders run while the app is open. A one-time reminder targets the selected
next train; weekday/weekend reminders apply to each upcoming train on the
matching operating days. Each departure is notified once. Cancel reminders in
the station/home pages or Settings. Preferences, saved stations, and reminders
are kept in this browser; browser notifications require permission requested
when a reminder is saved. An in-app message works without OS notifications.

`npm run test:browser` uses an installed Chromium browser (Chrome/Edge on Windows,
Chrome/Chromium on Linux; set `BROWSER_PATH` for another executable). It checks
the production build using local assets and mocked geolocation, time, and
notifications, without contacting external services.

Station photos and route-map images use the existing GitHub Pages asset URL by
default. To serve them from another location, set `VITE_ASSET_BASE` when building;
include a trailing slash, for example `VITE_ASSET_BASE=/lrt-web-app/` to use the
assets bundled with this deployment. The web router, logo, and favicon retain
their GitHub Pages base-path configuration.
The production build also creates `404.html` so GitHub Pages can render direct
station/route URLs and reloads with the same app entry point.
