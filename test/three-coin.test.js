import test from "node:test";
import assert from "node:assert/strict";
import {
  createCast,
  generateCoinCast,
  hexagramNumberFromPolarities,
  resolveReading,
} from "../src/three-coin.js";

const KING_WEN_GOLDEN = [
  [1, "111111"], [2, "000000"], [3, "100010"], [4, "010001"],
  [5, "111010"], [6, "010111"], [7, "010000"], [8, "000010"],
  [9, "111011"], [10, "110111"], [11, "111000"], [12, "000111"],
  [13, "101111"], [14, "111101"], [15, "001000"], [16, "000100"],
  [17, "100110"], [18, "011001"], [19, "110000"], [20, "000011"],
  [21, "100101"], [22, "101001"], [23, "000001"], [24, "100000"],
  [25, "100111"], [26, "111001"], [27, "100001"], [28, "011110"],
  [29, "010010"], [30, "101101"], [31, "001110"], [32, "011100"],
  [33, "001111"], [34, "111100"], [35, "000101"], [36, "101000"],
  [37, "101011"], [38, "110101"], [39, "001010"], [40, "010100"],
  [41, "110001"], [42, "100011"], [43, "111110"], [44, "011111"],
  [45, "000110"], [46, "011000"], [47, "010110"], [48, "011010"],
  [49, "101110"], [50, "011101"], [51, "100100"], [52, "001001"],
  [53, "001011"], [54, "110100"], [55, "101100"], [56, "001101"],
  [57, "011011"], [58, "110110"], [59, "010011"], [60, "110010"],
  [61, "110011"], [62, "001100"], [63, "101010"], [64, "010101"],
];

function allCoinTriples() {
  const triples = [];
  for (const a of [2, 3]) {
    for (const b of [2, 3]) {
      for (const c of [2, 3]) triples.push([a, b, c]);
    }
  }
  return triples;
}

test("all eight raw coin outcomes produce the 1:3:3:1 line distribution", () => {
  const counts = new Map([[6, 0], [7, 0], [8, 0], [9, 0]]);
  for (const coins of allCoinTriples()) {
    const { total } = createCast(coins);
    counts.set(total, counts.get(total) + 1);
  }
  assert.deepEqual(Object.fromEntries(counts), { 6: 1, 7: 3, 8: 3, 9: 1 });
});

test("creates the four line states from fixed coin values", () => {
  assert.deepEqual(createCast([2, 2, 2]), {
    coins: [2, 2, 2], total: 6, label: "Old Yin", polarity: "yin", changing: true, relating: "yang",
  });
  assert.equal(createCast([2, 2, 3]).total, 7);
  assert.equal(createCast([2, 3, 3]).total, 8);
  assert.equal(createCast([3, 3, 3]).total, 9);
});

test("uses one unbiased bit per generated coin", () => {
  const randomSource = {
    getRandomValues(bytes) {
      bytes.set([0, 1, 254]);
      return bytes;
    },
  };
  assert.deepEqual(generateCoinCast(randomSource).coins, [2, 3, 2]);
});

test("preserves bottom-to-top order and every changing line", () => {
  assert.deepEqual(resolveReading([6, 7, 8, 9, 8, 7]), {
    primaryHexagram: 64,
    relatingHexagram: 41,
    changingLines: [1, 4],
    primaryPolarities: ["yin", "yang", "yin", "yang", "yin", "yang"],
    relatingPolarities: ["yang", "yang", "yin", "yin", "yin", "yang"],
  });
});

test("does not invent a relating hexagram when no lines change", () => {
  const reading = resolveReading([7, 7, 7, 7, 7, 7]);
  assert.equal(reading.primaryHexagram, 1);
  assert.equal(reading.relatingHexagram, null);
  assert.deepEqual(reading.changingLines, []);
});

test("matches an independent King Wen reference for all 64 polarity patterns", () => {
  assert.equal(KING_WEN_GOLDEN.length, 64);
  assert.equal(new Set(KING_WEN_GOLDEN.map(([number]) => number)).size, 64);
  assert.equal(new Set(KING_WEN_GOLDEN.map(([, bits]) => bits)).size, 64);

  for (const [number, bits] of KING_WEN_GOLDEN) {
    const polarities = [...bits].map((bit) => (bit === "1" ? "yang" : "yin"));
    assert.equal(hexagramNumberFromPolarities(polarities), number, `hexagram ${number}: ${bits}`);
  }
});

test("all 4,096 six-line state combinations resolve", () => {
  const totals = [6, 7, 8, 9];
  let count = 0;

  for (const a of totals)
    for (const b of totals)
      for (const c of totals)
        for (const d of totals)
          for (const e of totals)
            for (const f of totals) {
              const reading = resolveReading([a, b, c, d, e, f]);
              assert.ok(reading.primaryHexagram >= 1 && reading.primaryHexagram <= 64);
              if (reading.relatingHexagram !== null) {
                assert.ok(reading.relatingHexagram >= 1 && reading.relatingHexagram <= 64);
              }
              count += 1;
            }

  assert.equal(count, 4096);
});

test("rejects malformed casts and readings", () => {
  assert.throws(() => createCast([2, 3]), /exactly three coins/);
  assert.throws(() => createCast([1, 2, 3]), /either 2 or 3/);
  assert.throws(() => resolveReading([7, 7, 7]), /exactly six line totals/);
  assert.throws(() => resolveReading([5, 7, 7, 7, 7, 7]), /6, 7, 8, or 9/);
  assert.throws(() => generateCoinCast({}), /Web Crypto-compatible/);
});
