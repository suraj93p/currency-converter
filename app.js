/*
  APPLICATION STATE
*/
const currencies = [
    config.baseCurrency,
    ...config.convertedCurrencies
];

/** @type {Record<string, HTMLInputElement>} */
const inputs = {};

/** @type {Record<string, number>} */
const rates = {
    [config.baseCurrency]: 1
};

/** @type {Record<string, string>} */
const currencyNames = {};

const CACHE_KEYS = {
    rates: "currency-converter-rates",
    names: "currency-converter-names"
};


/*
  DOM REFERENCES
*/
const converterElement =
    document.getElementById("converter");

const ratesElement =
    document.getElementById("rates");

const statusElement =
    document.getElementById("status");

const pageTitleElement =
    document.getElementById("page-title");


/*
  HELPERS
*/

/**
 * @param {string} value
 * @returns {number}
 */
function hashString (value) {
    let hash = 0;

    for (let i = 0; i < value.length; i++) {
        hash =
            value.charCodeAt(i) +
            ((hash << 5) - hash);

        hash |= 0;
    }

    return Math.abs(hash);
}


/**
 * @param {string} currency
 * @returns {string}
 */
function getAccentColor (currency) {
    const hash =
        hashString(currency);

    const hue =
        hash % 360;

    return `hsl(${ hue } 72% 64%)`;
}


/**
 * @param {string} currency
 * @returns {string}
 */
function getCurrencyName (currency) {
    return (
        currencyNames[currency] ??
        currency
    );
}


/**
 * @param {number} value
 * @returns {number|string}
 */
function formatAmount (value) {
    if (!Number.isFinite(value)) {
        return "";
    }

    if (Math.abs(value) >= 1000) {
        return Number(
            value.toFixed(0)
        );
    }

    return Number(
        value.toFixed(2)
    );
}


/**
 * @param {number} value
 * @returns {string}
 */
function formatRate (value) {
    if (!Number.isFinite(value)) {
        return "";
    }

    if (value >= 1) {
        return value.toFixed(2);
    }

    if (value >= 0.01) {
        return value.toFixed(4);
    }

    return value.toFixed(6);
}

function getRateDate (
    rateData
) {
    return rateData?.[0]?.date;
}


/*
  RENDERING
*/
function renderTitle () {
    pageTitleElement.textContent =
        "Currency converter";
}


function renderCurrencyInterface () {
    renderCurrencyCards();
    attachInputListeners();
}


function renderConversionData () {
    convert(
        config.baseCurrency
    );

    renderRateSummary();
}


function renderConverter () {
    renderCurrencyInterface();
    renderConversionData();
}


function renderCachedData () {
    const cachedRates =
        loadRatesFromCache();

    const hasCachedRates =
        applyCachedRates(
            cachedRates
        );

    loadNamesFromCache();

    renderCurrencyInterface();

    if (!hasCachedRates) {
        showErrorStatus(
            "Unable to load exchange rates."
        );

        return;
    }

    renderConversionData();

    showOfflineStatus(
        cachedRates
    );
}

function renderCurrencyCards () {
    converterElement.innerHTML = "";

    currencies.forEach(currency => {
        const card =
            document.createElement("div");

        card.className =
            "currency-card";

        card.style.setProperty(
            "--accent",
            getAccentColor(currency)
        );

        card.innerHTML = `
    <div class="amount-wrap">
        <input
            id="currency-${ currency }"
            class="amount-input"
            type="number"
            inputmode="decimal"
            step="any"
            ${ currency === config.baseCurrency ? 'value="1"' : "" }
        />
    </div>

    <div class="currency-info">
        <div class="currency-code">
            ${ currency }
        </div>

        <div class="currency-name">
            ${ getCurrencyName(currency) }
        </div>
    </div>
    `;

        converterElement.appendChild(card);

        inputs[currency] =
            card.querySelector(
                ".amount-input"
            );
    });
}


function renderRateSummary () {
    ratesElement.innerHTML = "";

    if (
        config.convertedCurrencies.length === 0
    ) {
        return;
    }

    const parts = [
        `1 ${ config.baseCurrency }`
    ];

    config.convertedCurrencies.forEach(
        currency => {
            const rate =
                rates[currency];

            if (!Number.isFinite(rate)) {
                return;
            }

            parts.push(
                `${ formatRate(rate) } ${ currency }`
            );
        }
    );

    const row =
        document.createElement("div");

    row.textContent =
        parts.join(" = ");

    ratesElement.appendChild(row);
}


/*
  CONVERSION
*/
function convert (sourceCurrency) {
    if (!Number.isFinite(rates[sourceCurrency])) {
        return;
    }

    const sourceValue =
        parseFloat(
            inputs[sourceCurrency].value
        );

    if (Number.isNaN(sourceValue)) {
        currencies.forEach(currency => {
            if (currency !== sourceCurrency) {
                inputs[currency].value = "";
            }
        });

        return;
    }

    const valueInBaseCurrency =
        sourceValue /
        rates[sourceCurrency];

    currencies.forEach(currency => {
        if (currency === sourceCurrency) {
            return;
        }

        if (!Number.isFinite(rates[currency])) {
            return;
        }

        inputs[currency].value =
            formatAmount(
                valueInBaseCurrency *
                rates[currency]
            );
    });
}


/*
  EVENTS
*/
function attachInputListeners () {
    currencies.forEach(currency => {
        inputs[currency].addEventListener(
            "input",
            () => convert(currency)
        );
    });
}


/*
  CACHE
*/
function saveRatesToCache (
    rateData
) {
    localStorage.setItem(
        CACHE_KEYS.rates,
        JSON.stringify({
            savedAt:
                new Date().toISOString(),

            data:
                rateData
        })
    );
}


function loadRatesFromCache () {
    const cached =
        localStorage.getItem(
            CACHE_KEYS.rates
        );

    if (!cached) {
        return null;
    }

    try {
        return JSON.parse(cached);
    } catch {
        return null;
    }
}


function saveNamesToCache () {
    localStorage.setItem(
        CACHE_KEYS.names,
        JSON.stringify(
            currencyNames
        )
    );
}


function loadNamesFromCache () {
    const cached =
        localStorage.getItem(
            CACHE_KEYS.names
        );

    if (!cached) {
        return false;
    }

    try {
        Object.assign(
            currencyNames,
            JSON.parse(cached)
        );

        return true;
    } catch {
        return false;
    }
}


/*
  API CALLS
*/
async function loadCurrencyNames () {
    const response =
        await fetch(
            config.api.baseUrl +
            config.api.currenciesEndpoint
        );

    if (!response.ok) {
        throw new Error(
            `Currencies HTTP ${ response.status }`
        );
    }

    const data =
        await response.json();

    data.forEach(currency => {
        currencyNames[
            currency.iso_code
        ] = currency.name;
    });

    saveNamesToCache();
}


async function loadExchangeRates () {
    const quotes =
        config.convertedCurrencies.join(",");

    const url =
        config.api.baseUrl +
        config.api.ratesEndpoint +
        `?base=${ config.baseCurrency }` +
        `&quotes=${ quotes }`;

    const response =
        await fetch(url);

    if (!response.ok) {
        throw new Error(
            `Rates HTTP ${ response.status }`
        );
    }

    const data =
        await response.json();

    data.forEach(item => {
        rates[item.quote] =
            item.rate;
    });

    saveRatesToCache(data);

    return data;
}


/*
  Cached rates are only valid when they contain
  every currency required by the current config.
*/
function applyCachedRates (
    cached
) {
    if (
        !cached ||
        !Array.isArray(cached.data)
    ) {
        return false;
    }

    const cachedCurrencies =
        new Set(
            cached.data.map(
                item => item.quote
            )
        );

    const hasAllRequiredCurrencies =
        config.convertedCurrencies.every(
            currency =>
                cachedCurrencies.has(currency)
        );

    if (!hasAllRequiredCurrencies) {
        return false;
    }

    cached.data.forEach(item => {
        rates[item.quote] =
            item.rate;
    });

    return true;
}


/*
  STATUS
*/
function showOnlineStatus (
    rateData
) {
    const rateDate =
        getRateDate(rateData);

    statusElement.classList.remove(
        "error"
    );

    statusElement.textContent =
        rateDate
            ? `Reference rates for ${ rateDate }`
            : "Latest reference rates";
}


function showOfflineStatus (
    cached
) {
    statusElement.classList.remove(
        "error"
    );

    const rateDate =
        cached?.data?.[0]?.date;

    statusElement.textContent =
        rateDate
            ? `Offline · cached rates from ${ rateDate }`
            : "Offline · using cached rates";
}


function showErrorStatus (
    message
) {
    statusElement.classList.add(
        "error"
    );

    statusElement.textContent =
        message;
}


async function refreshData () {
    try {
        const [
            ,
            rateData
        ] = await Promise.all([
            loadCurrencyNames(),
            loadExchangeRates()
        ]);

        renderConverter();

        showOnlineStatus(
            rateData
        );

    } catch (error) {
        console.error(error);

        renderCachedData();
    }
}


/*
  INITIALISATION
*/
async function initialise () {
    renderTitle();

    loadNamesFromCache();

    const cachedRates =
        loadRatesFromCache();

    if (
        applyCachedRates(
            cachedRates
        )
    ) {
        renderConverter();

        showOfflineStatus(
            cachedRates
        );
    }

    await refreshData();
}


window.addEventListener(
    "online",
    () => {
        refreshData();
    }
);


if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register(
        "./service-worker.js"
    );
}


initialise();

