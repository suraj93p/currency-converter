# Currency Converter

A lightweight, responsive currency converter built with vanilla HTML, CSS and JavaScript.

The application supports conversion between multiple currencies using live exchange rates from the [Frankfurter API](https://frankfurter.dev/). It can also be installed as a Progressive Web App (PWA) on supported devices.

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

Currencies are configured in `config.js`.

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
  ]
};
```

The first currency is defined by `baseCurrency`. Additional currencies are listed under `convertedCurrencies`.

Currencies can be added, removed or reordered without changing the application logic.

## Project Structure

```text
currency-converter/
├── index.html
├── styles.css
├── config.js
├── manifest.json
├── service-worker.js
├── icon-180.png
├── icon-192.png
├── icon-512.png
└── README.md
```

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
