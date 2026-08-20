# I Ching Three-Coin Casting

A transparent, testable reference for forming an I Ching hexagram with three coins.

The method is small enough to explain completely:

1. Assign one face of each coin the value `3` and the other face `2`.
2. Cast three coins six times.
3. Record the first total as the bottom line and build upward.
4. Use totals `6`, `7`, `8`, and `9` to identify yin, yang, and changing lines.
5. Derive the primary hexagram from all six lines.
6. If any lines are changing, turn every changing line to derive one relating hexagram.

Nothing outside those six casts selects or revises the pattern. A question, interface, animation, AI system, or later interpretation may add context, but it must not change the coin totals or the hexagram they form.

> This repository documents a casting procedure. It is not a translation of the *I Ching*, a claim of cultural authority, or a promise about the future.

## Line states

| Total | Traditional label | Primary line | Changes to | Probability per cast |
|---:|---|---|---|---:|
| 6 | Old yin | Yin, broken | Yang | 1/8 |
| 7 | Young yang | Yang, solid | Yang | 3/8 |
| 8 | Young yin | Yin, broken | Yin | 3/8 |
| 9 | Old yang | Yang, solid | Yin | 1/8 |

The probabilities follow directly from the eight equally likely outcomes of three two-sided coins. Reversing which physical face is called `2` or `3` changes the recorded cast, so choose the convention before starting and keep it fixed for all six casts.

## Bottom-to-top order

Arrays in this repository are always ordered from line 1 to line 6:

```text
index 5  -> line 6, top
index 4  -> line 5
index 3  -> line 4
index 2  -> line 3
index 1  -> line 2
index 0  -> line 1, bottom
```

This is structural, not decorative. Reversing the array can produce a different hexagram.

## Example

```js
import { createCast, resolveReading } from "./src/three-coin.js";

const casts = [
  [2, 2, 2], // line 1: 6, old yin, changing
  [2, 2, 3], // line 2: 7, young yang
  [2, 3, 3], // line 3: 8, young yin
  [3, 3, 3], // line 4: 9, old yang, changing
  [2, 3, 3], // line 5: 8, young yin
  [2, 2, 3], // line 6: 7, young yang
].map(createCast);

console.log(resolveReading(casts.map(({ total }) => total)));
```

Result:

```js
{
  primaryHexagram: 64,
  relatingHexagram: 41,
  changingLines: [1, 4],
  primaryPolarities: ["yin", "yang", "yin", "yang", "yin", "yang"],
  relatingPolarities: ["yang", "yang", "yin", "yin", "yin", "yang"]
}
```

## Verification

The test suite checks:

- all eight raw outcomes of one three-coin cast;
- the expected `1:3:3:1` distribution of totals `6:7:8:9`;
- all 64 primary yin/yang patterns against an independent King Wen sequence table;
- all `4^6 = 4,096` combinations of six line states;
- bottom-to-top ordering and changing-line derivation;
- malformed inputs and the no-changing-lines case.

`4,096` counts combinations of the four line states. If individual coin faces are retained, there are `8^6 = 262,144` raw six-cast outcomes. The repository does not confuse these two spaces.

Run the tests with a current Node.js release:

```bash
npm test
```

No third-party packages are required.

## Method boundaries

- Coin results are the only random input.
- The first cast is the bottom line.
- Every changing line is preserved; none is silently selected as “the answer.”
- No changing lines means there is no derived relating hexagram.
- A relating hexagram is a pattern derived from changed lines, not a guaranteed future.
- A user’s question is optional context and cannot alter the cast.
- This repository contains no user questions, reading histories, identities, tracking data, or modern copyrighted translations.

For a visual walkthrough and a live reflective experience, see [How to cast the I Ching with three coins](https://ichingreflection.com/how-to-cast/).

## Files

- [`SPEC.md`](SPEC.md) — normative method contract
- [`src/three-coin.js`](src/three-coin.js) — zero-dependency reference implementation
- [`test/three-coin.test.js`](test/three-coin.test.js) — exhaustive and fixed-reference tests
- [`README.zh-CN.md`](README.zh-CN.md) — Chinese review version

## License

Code is available under the [MIT License](LICENSE). Documentation is available under [CC BY 4.0](LICENSE-DOCS).
