import { test, expect } from "vitest";
import { isValidWord, WordLetter } from "~/db/game"

test("is straight line", () => {
  const word_000_001_010: WordLetter[] = [
    { tileRow: 0, tileColumn: 0, letterIndex: 0 },
    { tileRow: 0, tileColumn: 0, letterIndex: 1 },
    { tileRow: 0, tileColumn: 1, letterIndex: 0 },
  ];
  expect(isValidWord(word_000_001_010)).toBe(true);

  const word_002_001_010: WordLetter[] = [
    { tileRow: 0, tileColumn: 0, letterIndex: 2 },
    { tileRow: 0, tileColumn: 0, letterIndex: 1 },
    { tileRow: 0, tileColumn: 1, letterIndex: 0 },
  ];
  expect(isValidWord(word_002_001_010)).toBe(false);

  const word_000_003_110_113: WordLetter[] = [
    { tileRow: 0, tileColumn: 0, letterIndex: 0 },
    { tileRow: 0, tileColumn: 0, letterIndex: 3 },
    { tileRow: 1, tileColumn: 1, letterIndex: 0 },
    { tileRow: 1, tileColumn: 1, letterIndex: 3 },
  ];
  expect(isValidWord(word_000_003_110_113)).toBe(true);

  const word_000_003_110_111: WordLetter[] = [
    { tileRow: 0, tileColumn: 0, letterIndex: 0 },
    { tileRow: 0, tileColumn: 0, letterIndex: 3 },
    { tileRow: 1, tileColumn: 1, letterIndex: 0 },
    { tileRow: 1, tileColumn: 1, letterIndex: 1 },
  ];
  expect(isValidWord(word_000_003_110_111)).toBe(false);

  const word_002_101_112: WordLetter[] = [
    { tileRow: 0, tileColumn: 0, letterIndex: 2 },
    { tileRow: 1, tileColumn: 0, letterIndex: 1 },
    { tileRow: 1, tileColumn: 1, letterIndex: 2 },
  ];
  expect(isValidWord(word_002_101_112)).toBe(true);

  const word__1_10__1_11__100: WordLetter[] = [
    { tileRow: -1, tileColumn: -1, letterIndex: 0 },
    { tileRow: -1, tileColumn: -1, letterIndex: 1 },
    { tileRow: -1, tileColumn: 0, letterIndex: 0 },
  ];
  expect(isValidWord(word__1_10__1_11__100)).toBe(true);

  const word__1_10__1_11__102: WordLetter[] = [
    { tileRow: -1, tileColumn: -1, letterIndex: 0 },
    { tileRow: -1, tileColumn: -1, letterIndex: 1 },
    { tileRow: -1, tileColumn: 0, letterIndex: 2 },
  ];
  expect(isValidWord(word__1_10__1_11__102)).toBe(false);
  
  const word_000_003_110_220: WordLetter[] = [
    { tileRow: 0, tileColumn: 0, letterIndex: 0 },
    { tileRow: 0, tileColumn: 0, letterIndex: 3 },
    { tileRow: 1, tileColumn: 1, letterIndex: 0 },
    { tileRow: 2, tileColumn: 2, letterIndex: 0 },
  ];
  expect(isValidWord(word_000_003_110_220)).toBe(false);
});
