# Currency Converter

A lightweight, responsive currency converter built with vanilla HTML, CSS and JavaScript.

The config-driven application supports conversion between multiple currencies using live exchange rates from the [Frankfurter API](https://frankfurter.dev/) and also offline fallback through cached data. It can also be installed as a Progressive Web App (PWA) on supported devices.

## Features

- Convert between multiple currencies in real time
- Edit any currency field to recalculate all others
- Live exchange rates from the Frankfurter API
- Currency names loaded dynamically from the API
- Config-driven currency selection
- Deterministic accent colors for each currency
- Responsive dark-mode interface
- Adaptive exchange-rate precision
- Offline support using cached exchange rates
- Installable as a PWA

## Configuration

Application configuration is defined in `config.js`.

```js
const config = {
  baseCurrency: "SGD",

  convertedCurrencies: [
    "LAK",
    "MYR",
    "INR",
    "USD",
    "EUR",
    "THB",
    "IDR",
    "VND",
    "PHP"
  ],

  api: {
    baseUrl: "https://api.frankfurter.dev/v2",
    currenciesEndpoint: "/currencies",
    ratesEndpoint: "/rates"
  }
};
```

The first currency is defined by `baseCurrency`. Additional currencies are listed under `convertedCurrencies`.

Currencies can be added, removed or reordered without changing the application logic.

## Project Structure

```text
currency-converter/
├── index.html
├── app.js
├── config.js
├── styles.css
├── manifest.json
├── service-worker.js
├── icon-180.png
├── icon-192.png
├── icon-512.png
└── README.md
```

## Architecture

The application is intentionally kept simple and framework-free.

- `index.html` contains the page structure and PWA metadata.
- `styles.css` contains the application styles.
- `config.js` contains currency and API configuration.
- `app.js` contains conversion logic, rendering, caching and API integration.
- `service-worker.js` manages the PWA application cache.
- `manifest.json` defines installable PWA metadata.

## Offline Behaviour

The application uses two caching mechanisms:

- The service worker caches the application shell, including HTML, JavaScript, CSS, manifest and icons.
- `localStorage` stores the most recently downloaded exchange rates and currency metadata.

When the network is unavailable, the application can use previously cached exchange-rate data where available.

The Frankfurter API responses themselves are not cached by the service worker.

## Service Worker Updates

The service worker uses a versioned cache name.

When making changes to cached application files, increment the cache version in `service-worker.js`, for example:

```js
const CACHE_NAME =
  "currency-converter-v2";

## Running Locally

Because the application uses a service worker and web app manifest, it should be served through HTTP rather than opening `index.html` directly.

From the project directory:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## Live Demo

[Open Currency Converter](https://suraj93p.github.io/currency-converter/)

## PWA Installation

The application can be installed as a Progressive Web App (PWA) on supported devices.

### iPhone / iPad

1. Open the [Currency Converter](https://suraj93p.github.io/currency-converter/) in Safari.
2. Tap the **Share** button.
3. Select **Add to Home Screen**.
4. Tap **Add**.
5. Launch Currency Converter from the Home Screen.

### Android

1. Open the [Currency Converter](https://suraj93p.github.io/currency-converter/) in Chrome.
2. Tap the **three-dot menu** in Chrome.
3. Select **Add to Home screen** or **Install app**, depending on the Chrome version.
4. Confirm the installation.
5. Launch Currency Converter from the Home Screen or app launcher.

## Exchange Rate Data

Exchange rates and currency metadata are provided by the [Frankfurter API](https://frankfurter.dev/).

The application fetches current rates when online and stores the latest successfully retrieved rates locally for offline use.

## Tech Stack

- HTML
- CSS
- Vanilla JavaScript
- Web App Manifest
- Service Worker
- Frankfurter API
