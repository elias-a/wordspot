import { test, expect } from "vitest";
import { type UserAccount } from "~/db/session";
import {
  isValidMove,
  startGame,
  getGame,
  saveTurn,
  type WordLetter,
} from "~/db/game";
import { cleanUpDatabase } from "~/tests/helpers/cleanUpDatabase";
import { initializeDatabase } from "~/tests/helpers/initializeDatabase";

test("check if move is valid", () => {
  // Valid word moving horizontally to the right.
  const word_000_001_010: WordLetter[] = [
    { tileRow: 0, tileColumn: 0, letterIndex: 0 },
    { tileRow: 0, tileColumn: 0, letterIndex: 1 },
    { tileRow: 0, tileColumn: 1, letterIndex: 0 },
  ];
  expect(isValidMove(word_000_001_010)).toBe(true);

  // Invalid 3 letter word moving diagonally up but not linearly.
  const word_002_001_010: WordLetter[] = [
    { tileRow: 0, tileColumn: 0, letterIndex: 2 },
    { tileRow: 0, tileColumn: 0, letterIndex: 1 },
    { tileRow: 0, tileColumn: 1, letterIndex: 0 },
  ];
  expect(isValidMove(word_002_001_010)).toBe(false);

  // Valid 4 letter word moving diagonally down.
  const word_000_003_110_113: WordLetter[] = [
    { tileRow: 0, tileColumn: 0, letterIndex: 0 },
    { tileRow: 0, tileColumn: 0, letterIndex: 3 },
    { tileRow: 1, tileColumn: 1, letterIndex: 0 },
    { tileRow: 1, tileColumn: 1, letterIndex: 3 },
  ];
  expect(isValidMove(word_000_003_110_113)).toBe(true);

  // Invalid 4 letter word moving diagonally down but not linearly.
  const word_000_003_110_111: WordLetter[] = [
    { tileRow: 0, tileColumn: 0, letterIndex: 0 },
    { tileRow: 0, tileColumn: 0, letterIndex: 3 },
    { tileRow: 1, tileColumn: 1, letterIndex: 0 },
    { tileRow: 1, tileColumn: 1, letterIndex: 1 },
  ];
  expect(isValidMove(word_000_003_110_111)).toBe(false);

  // Valid word moving diagonally down and spanning 3 tiles.
  const word_002_101_112: WordLetter[] = [
    { tileRow: 0, tileColumn: 0, letterIndex: 2 },
    { tileRow: 1, tileColumn: 0, letterIndex: 1 },
    { tileRow: 1, tileColumn: 1, letterIndex: 2 },
  ];
  expect(isValidMove(word_002_101_112)).toBe(true);

  // Valid 3 letter word with some negative indices
  // moving horizontally.
  const word__1_10__1_11__100: WordLetter[] = [
    { tileRow: -1, tileColumn: -1, letterIndex: 0 },
    { tileRow: -1, tileColumn: -1, letterIndex: 1 },
    { tileRow: -1, tileColumn: 0, letterIndex: 0 },
  ];
  expect(isValidMove(word__1_10__1_11__100)).toBe(true);

  // Invalid 3 letter word with some negative indices
  // moving horizontally but with a gap.
  const word__1_10__1_11__102: WordLetter[] = [
    { tileRow: -1, tileColumn: -1, letterIndex: 0 },
    { tileRow: -1, tileColumn: -1, letterIndex: 1 },
    { tileRow: -1, tileColumn: 0, letterIndex: 2 },
  ];
  expect(isValidMove(word__1_10__1_11__102)).toBe(false);
  
  // Invalid 4 letter word moving diagonally down and linearly
  // but with a gap.
  const word_000_003_110_220: WordLetter[] = [
    { tileRow: 0, tileColumn: 0, letterIndex: 0 },
    { tileRow: 0, tileColumn: 0, letterIndex: 3 },
    { tileRow: 1, tileColumn: 1, letterIndex: 0 },
    { tileRow: 2, tileColumn: 2, letterIndex: 0 },
  ];
  expect(isValidMove(word_000_003_110_220)).toBe(false);

  // Valid word moving vertically up.
  const word_202_300_302: WordLetter[] = [
    { tileRow: 2, tileColumn: 0, letterIndex: 2 },
    { tileRow: 3, tileColumn: 0, letterIndex: 0 },
    { tileRow: 3, tileColumn: 0, letterIndex: 2 },
  ];
  expect(isValidMove(word_202_300_302)).toBe(true);

  // Invalid word moving vertically up but with a gap.
  const word_200_300_302: WordLetter[] = [
    { tileRow: 2, tileColumn: 0, letterIndex: 0 },
    { tileRow: 3, tileColumn: 0, letterIndex: 0 },
    { tileRow: 3, tileColumn: 0, letterIndex: 2 },
  ];
  expect(isValidMove(word_200_300_302)).toBe(false);

  // Valid word moving diagonally up.
  const word_321_322_411: WordLetter[] = [
    { tileRow: 3, tileColumn: 2, letterIndex: 1 },
    { tileRow: 3, tileColumn: 2, letterIndex: 2 },
    { tileRow: 4, tileColumn: 1, letterIndex: 1 },
  ];
  expect(isValidMove(word_321_322_411)).toBe(true);

  // Invalid 4 letter word moving diagonally up but not linearly.
  const word_330_321_322_411: WordLetter[] = [
    { tileRow: 3, tileColumn: 3, letterIndex: 0 },
    { tileRow: 3, tileColumn: 2, letterIndex: 1 },
    { tileRow: 3, tileColumn: 2, letterIndex: 2 },
    { tileRow: 4, tileColumn: 1, letterIndex: 1 },
  ];
  expect(isValidMove(word_330_321_322_411)).toBe(false);
});

test("test startGame function", async () => {
  await cleanUpDatabase();

  const user: UserAccount = {
    id: import.meta.env.VITE_USER1,
    userName: "test",
    phone: "test",
  };
  expect(await startGame(user)).toBeTypeOf("string");

  await cleanUpDatabase();
});

test("test endTurn function", async () => {
  await cleanUpDatabase();
  await initializeDatabase();

  // Create game to prime database for calling endTurn function.
  const user: UserAccount = {
    id: import.meta.env.VITE_TEST_USER1_ID,
    userName: import.meta.env.VITE_TEST_USER1_NAME,
    phone: import.meta.env.VITE_TEST_USER1_PHONE,
  };
  const gameId = await startGame(user);
  const { board, userData } = await getGame(gameId, user.id);

  const clicked: string[] = [];
  const selected: string[] = [];
  const extraTile: PlacedExtraTile | undefined = undefined;

  expect(
    await saveTurn(
      gameId,
      userData.my_id,
      clicked,
      selected,
      extraTile,
      board,
    )).toBe(`${import.meta.env.VITE_TEST_USER1_NAME} did not make a move and received 2 tokens and an extra tile. Your turn in Wordspot!`);

  await cleanUpDatabase();
});
