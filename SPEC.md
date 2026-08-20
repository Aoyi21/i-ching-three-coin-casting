# Three-Coin Casting Contract — Version 1

This document defines a minimal, deterministic contract for deriving an I Ching hexagram from six three-coin casts. The keywords **MUST**, **MUST NOT**, **SHOULD**, and **MAY** describe interoperability requirements.

## 1. Scope

The contract covers:

- coin values;
- line-state derivation;
- line order;
- primary and relating polarities;
- lower and upper trigram placement;
- King Wen hexagram-number lookup;
- changing-line preservation.

It does not define a translation, interpretation system, prediction claim, visual design, question taxonomy, or user-data model.

## 2. Coin input

Each cast MUST contain exactly three values. Each value MUST be either `2` or `3`.

A digital implementation that generates casts MUST use an unbiased random bit for each coin. A physical implementation MUST decide which face represents `2` and which represents `3` before the first cast, then keep that assignment fixed.

The three values MUST be added. The only valid totals are `6`, `7`, `8`, and `9`.

## 3. Line states

| Total | Primary polarity | Changing | Relating polarity |
|---:|---|---|---|
| 6 | yin | yes | yang |
| 7 | yang | no | yang |
| 8 | yin | no | yin |
| 9 | yang | yes | yin |

An implementation MUST NOT infer a line from a question, timestamp, profile, animation, language model, or interpretation.

## 4. Six-line order

A reading MUST contain exactly six totals.

The ordered input is:

```text
[line 1, line 2, line 3, line 4, line 5, line 6]
```

Line 1 is the bottom line. Line 6 is the top line.

The lower trigram MUST use lines 1–3. The upper trigram MUST use lines 4–6. Within both trigrams, bit order remains bottom to top.

For binary lookup, yang is `1` and yin is `0`.

## 5. Primary hexagram

The primary polarity of every line MUST be derived from the table in section 3. The six primary polarities MUST determine one primary hexagram.

This repository uses the conventional King Wen numbering table. The numbering lookup is separate from the coin and changing-line logic; an implementation MAY expose the six-line pattern without a number, provided it preserves the same bottom-to-top structure.

## 6. Changing lines and relating hexagram

Every line with total `6` or `9` MUST be listed as changing. Line numbers are one-based and follow bottom-to-top order.

To derive a relating pattern:

- `6` changes from yin to yang;
- `9` changes from yang to yin;
- `7` remains yang;
- `8` remains yin.

If one or more lines are changing, all of them MUST change together to produce one relating pattern. An implementation MUST NOT silently choose only one changing line.

If no lines are changing, `relatingHexagram` MUST be `null` or omitted with an explicit no-change status. An implementation MUST NOT invent a second hexagram.

The relating pattern is a mathematical derivation from the cast. This contract does not label it as a guaranteed future.

## 7. Invariants

Given the same ordered six totals, a conforming implementation MUST return the same:

- primary polarities;
- changing-line positions;
- relating polarities;
- primary hexagram number;
- relating hexagram number or no-change status.

Changing a question or any display-layer value MUST NOT change those results.

## 8. Verification levels

A useful implementation SHOULD verify all of the following:

1. Eight raw outcomes for one cast produce totals in a `1:3:3:1` count.
2. Sixty-four yin/yang patterns map to sixty-four unique primary hexagrams.
3. All `4^6 = 4,096` line-state combinations resolve successfully.
4. No-changing-line inputs produce no relating hexagram.
5. Invalid coin counts, values, totals, and line counts are rejected.

## 9. Privacy boundary

Conformance does not require storing a question. Implementations SHOULD keep free text separate from the procedural result and MUST NOT include free text in telemetry merely to calculate or verify the cast.

## 10. Versioning

This contract is `three_coin_v1`. A future version that changes accepted input, line order, polarity mapping, or relating-hexagram derivation MUST use a different method-version identifier.
