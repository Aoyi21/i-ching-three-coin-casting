const TRIGRAM_BY_BITS = Object.freeze({
  "111": "qian",
  "110": "dui",
  "101": "li",
  "100": "zhen",
  "011": "xun",
  "010": "kan",
  "001": "gen",
  "000": "kun",
});

const KING_WEN_GRID = Object.freeze({
  qian: { qian: 1, dui: 10, li: 13, zhen: 25, xun: 44, kan: 6, gen: 33, kun: 12 },
  dui: { qian: 43, dui: 58, li: 49, zhen: 17, xun: 28, kan: 47, gen: 31, kun: 45 },
  li: { qian: 14, dui: 38, li: 30, zhen: 21, xun: 50, kan: 64, gen: 56, kun: 35 },
  zhen: { qian: 34, dui: 54, li: 55, zhen: 51, xun: 32, kan: 40, gen: 62, kun: 16 },
  xun: { qian: 9, dui: 61, li: 37, zhen: 42, xun: 57, kan: 59, gen: 53, kun: 20 },
  kan: { qian: 5, dui: 60, li: 63, zhen: 3, xun: 48, kan: 29, gen: 39, kun: 8 },
  gen: { qian: 26, dui: 41, li: 22, zhen: 27, xun: 18, kan: 4, gen: 52, kun: 23 },
  kun: { qian: 11, dui: 19, li: 36, zhen: 24, xun: 46, kan: 7, gen: 15, kun: 2 },
});

export const LINE_STATES = Object.freeze({
  6: Object.freeze({ label: "Old Yin", polarity: "yin", changing: true, relating: "yang" }),
  7: Object.freeze({ label: "Young Yang", polarity: "yang", changing: false, relating: "yang" }),
  8: Object.freeze({ label: "Young Yin", polarity: "yin", changing: false, relating: "yin" }),
  9: Object.freeze({ label: "Old Yang", polarity: "yang", changing: true, relating: "yin" }),
});

export const METHOD_VERSION = "three_coin_v1";

export function createCast(coins) {
  if (!Array.isArray(coins) || coins.length !== 3) {
    throw new TypeError("A cast requires exactly three coins.");
  }

  if (coins.some((coin) => coin !== 2 && coin !== 3)) {
    throw new TypeError("Each coin must be either 2 or 3.");
  }

  const total = coins.reduce((sum, coin) => sum + coin, 0);
  return { coins: [...coins], total, ...LINE_STATES[total] };
}

export function generateCoinCast(randomSource = globalThis.crypto) {
  if (!randomSource || typeof randomSource.getRandomValues !== "function") {
    throw new TypeError("A Web Crypto-compatible random source is required.");
  }

  const randomBytes = new Uint8Array(3);
  randomSource.getRandomValues(randomBytes);
  return createCast(Array.from(randomBytes, (byte) => (byte & 1 ? 3 : 2)));
}

function bitsForPolarities(polarities) {
  if (!Array.isArray(polarities)) {
    throw new TypeError("Polarities must be an array.");
  }

  if (polarities.some((polarity) => polarity !== "yin" && polarity !== "yang")) {
    throw new TypeError('Each polarity must be either "yin" or "yang".');
  }

  return polarities.map((polarity) => (polarity === "yang" ? "1" : "0")).join("");
}

export function hexagramNumberFromPolarities(polarities) {
  if (!Array.isArray(polarities) || polarities.length !== 6) {
    throw new TypeError("A hexagram requires exactly six lines.");
  }

  const lower = TRIGRAM_BY_BITS[bitsForPolarities(polarities.slice(0, 3))];
  const upper = TRIGRAM_BY_BITS[bitsForPolarities(polarities.slice(3, 6))];
  return KING_WEN_GRID[upper][lower];
}

export function resolveReading(lineTotals) {
  if (!Array.isArray(lineTotals) || lineTotals.length !== 6) {
    throw new TypeError("A reading requires exactly six line totals.");
  }

  lineTotals.forEach((total, index) => {
    if (!Number.isInteger(total) || !LINE_STATES[total]) {
      throw new TypeError(`Line ${index + 1} must have a total of 6, 7, 8, or 9.`);
    }
  });

  const primaryPolarities = lineTotals.map((total) => LINE_STATES[total].polarity);
  const relatingPolarities = lineTotals.map((total) => LINE_STATES[total].relating);
  const changingLines = lineTotals.flatMap((total, index) =>
    LINE_STATES[total].changing ? [index + 1] : [],
  );

  return {
    primaryHexagram: hexagramNumberFromPolarities(primaryPolarities),
    relatingHexagram:
      changingLines.length > 0 ? hexagramNumberFromPolarities(relatingPolarities) : null,
    changingLines,
    primaryPolarities,
    relatingPolarities,
  };
}
