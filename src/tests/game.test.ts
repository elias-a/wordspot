import { test, expect } from "vitest";
import { query } from "~/db";
import { type UserAccount } from "~/db/session";
import {
  isValidMove,
  getGames,
  startGame,
  getGame,
  saveTurn,
  type WordLetter,
  type PlacedExtraTile,
  type GameData,
} from "~/db/game";
import { cleanUpDatabase } from "~/tests/helpers/cleanUpDatabase";
import { initializeDatabase } from "~/tests/helpers/initializeDatabase";
import { testStartGame } from "~/tests/helpers/testStartGame";
import { testAssignExtraTile } from "~/tests/helpers/testAssignExtraTile";
import { testSetLetterByIndices } from "~/tests/helpers/testSetLetterByIndices";
import { testSetLetterByTileId } from "~/tests/helpers/testSetLetterByTileId";
import { testGetPlacedExtraTile } from "~/tests/helpers/testGetPlacedExtraTile";
import { testSetPlayerTokens } from "~/tests/helpers/testSetPlayerTokens";
import { testGetNumExtraTiles } from "~/tests/helpers/testGetNumExtraTiles";
import { testGetTokens } from "~/tests/helpers/testGetTokens";
import { testGetWinner } from "~/tests/helpers/testGetWinner";
import { testCheckBoard } from "~/tests/helpers/testCheckBoard";

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
  await initializeDatabase();

  const user: UserAccount = {
    id: import.meta.env.VITE_TEST_USER1_ID,
    userName: import.meta.env.VITE_TEST_USER1_NAME,
    phone: import.meta.env.VITE_TEST_USER1_PHONE,
  };
  expect(await startGame(user)).toBeTypeOf("string");

  await cleanUpDatabase();
});

test("test getGames function", async () => {
  await cleanUpDatabase();
  await initializeDatabase();

  let userId: string = null;
  for (let i = 0; i < 3; i++) {
    userId = (await testStartGame()).userId;
  }

  const games = await getGames(userId);
  expect(games).toHaveLength(3);
  for (const game of games) {
    expect(game).toHaveProperty("id");
    expect(game["id"]).toBeDefined()
    expect(game).toHaveProperty("dateCreated");
    expect(game["dateCreated"]).toBeDefined();
    expect(game).toHaveProperty("firstPlayer");
    expect(game["firstPlayer"]).toBeDefined();
    expect(game).toHaveProperty("winner");
    expect(game["winner"]).toBeNull()
    expect(game).toHaveProperty("myId");
    expect(game["myId"]).toBeDefined();
    expect(game).toHaveProperty("myName");
    expect(game["myName"]).toBeDefined();
    expect(game).toHaveProperty("myTurn");
    expect(game["myTurn"]).toBe(true);
    expect(game).toHaveProperty("opponentName");
    expect(game["opponentName"]).toBeDefined();
  }

  await cleanUpDatabase();
});

test("test getGame function", async () => {
  await cleanUpDatabase();
  await initializeDatabase();
  const { gameId, userId, userName, playerId } = await testStartGame();
  const { userData } = await getGame(gameId, userId);

});

test("test getGame function", async () => {
  await cleanUpDatabase();
  await initializeDatabase();
  const { gameId, userId, userName, playerId } = await testStartGame();
  const { userData } = await getGame(gameId, userId);

  expect(userData).toHaveProperty("playerId");
  expect(userData["playerId"]).toBe(playerId);
  expect(userData).toHaveProperty("firstPlayer");
  expect(userData["firstPlayer"]).toBe(playerId);
  expect(userData).toHaveProperty("winner");
  expect(userData["winner"]).toBeNull();
  expect(userData).toHaveProperty("myId");
  expect(userData["myId"]).toBe(playerId);
  expect(userData).toHaveProperty("myName");
  expect(userData["myName"]).toBe(userName);
  expect(userData).toHaveProperty("myTokens");
  expect(userData["myTokens"]).toBe(26);
  expect(userData).toHaveProperty("myTurn");
  expect(userData["myTurn"]).toBe(true);
  expect(userData).toHaveProperty("opponentName");
  expect(userData["opponentName"]).toBeTypeOf("string");
  expect(userData).toHaveProperty("opponentTokens");
  expect(userData["opponentTokens"]).toBe(25);
  expect(userData).toHaveProperty("opponentTurn");
  expect(userData["opponentTurn"]).toBe(false);

  await cleanUpDatabase();
});

test("test `saveTurn` function - nothing selected", async () => {
  await cleanUpDatabase();
  await initializeDatabase();
  const { gameId, userId, userName, playerId } = await testStartGame();
  const clicked: string[] = [];
  const selected: string[] = [];
  const extraTile: PlacedExtraTile | undefined = undefined;

  const { board } = await getGame(gameId, userId);
  expect(
    await saveTurn(
      gameId,
      playerId,
      clicked,
      selected,
      extraTile,
      board,
    )).toBe(`${userName} did not make a move and received 2 tokens and an extra tile. Your turn in Wordspot!`);
  expect(await testGetNumExtraTiles(playerId)).toBe(1);
  expect(await testGetTokens(playerId)).toBe(28);

  await cleanUpDatabase();
});

test("test `saveTurn` function - valid move", async () => {
  await cleanUpDatabase();
  await initializeDatabase();
  const { gameId, userId, userName, playerId } = await testStartGame();
  const extraTile: PlacedExtraTile | undefined = undefined;
  const clicked = [
    await testSetLetterByIndices("L", 1, 1, 0, gameId),
    await testSetLetterByIndices("E", 1, 1, 2, gameId),
    await testSetLetterByIndices("T", 2, 1, 0, gameId),
  ];
  const selected: string[] = [];

  const { board } = await getGame(gameId, userId);
  expect(
    await saveTurn(
      gameId,
      playerId,
      clicked,
      selected,
      extraTile,
      board,
    )).toBe(`${userName} played LET and used 3 tokens. Your turn in Wordspot!`);
  expect(await testGetTokens(playerId)).toBe(23);
  expect(await testCheckBoard(gameId, userId, clicked)).toBe(true);

  await cleanUpDatabase();
});

test("test `saveTurn` function - valid move, added extra tile and earned extra tile", async () => {
  await cleanUpDatabase();
  await initializeDatabase();
  const { gameId, userId, userName, playerId } = await testStartGame();
  const { extraTileId } = await testAssignExtraTile(gameId, playerId);
  const clicked = [
    await testSetLetterByTileId("T", extraTileId, 1),
    await testSetLetterByIndices("E", 1, 1, 0, gameId),
    await testSetLetterByIndices("S", 1, 1, 1, gameId),
    await testSetLetterByIndices("T", 1, 2, 0, gameId),
  ];
  const selected: string[] = [];
  const extraTile: PlacedExtraTile = 
    await testGetPlacedExtraTile(extraTileId, 1, 0);

  const { board } = await getGame(gameId, userId);
  expect(
    await saveTurn(
      gameId,
      playerId,
      clicked,
      selected,
      extraTile,
      board,
    )).toBe(`${userName} played TEST and used 4 tokens and was awarded an extra tile. Your turn in Wordspot!`);
  expect(await testGetNumExtraTiles(playerId)).toBe(1);
  expect(await testGetTokens(playerId)).toBe(22);

  await cleanUpDatabase();
});

test("test `saveTurn` function - mix of clicked and selected", async () => {
  await cleanUpDatabase();
  await initializeDatabase();
  const { gameId, userId, userName, playerId } = await testStartGame();
  const extraTile: PlacedExtraTile | undefined = undefined;
  const clicked = [
    await testSetLetterByIndices("E", 1, 1, 2, gameId),
    await testSetLetterByIndices("T", 2, 1, 0, gameId),
  ];
  const selected = [
    await testSetLetterByIndices("L", 1, 1, 0, gameId),
  ];

  const { board } = await getGame(gameId, userId);
  expect(
    await saveTurn(
      gameId,
      playerId,
      clicked,
      selected,
      extraTile,
      board,
    )).toBe(`${userName} played LET and used 2 tokens. Your turn in Wordspot!`);
  expect(await testGetTokens(playerId)).toBe(24);

  await cleanUpDatabase();
});

test("test `saveTurn` function - mix of clicked and selected, earned extra tile", async () => {
  await cleanUpDatabase();
  await initializeDatabase();
  const { gameId, userId, userName, playerId } = await testStartGame();
  const clicked = [
    await testSetLetterByIndices("E", 1, 2, 0, gameId),
    await testSetLetterByIndices("S", 1, 2, 1, gameId),
    await testSetLetterByIndices("T", 1, 3, 0, gameId),
  ];
  const selected = [
    await testSetLetterByIndices("T", 1, 1, 1, gameId),
  ];
  const extraTile: PlacedExtraTile | undefined = undefined;

  const { board } = await getGame(gameId, userId);
  expect(
    await saveTurn(
      gameId,
      playerId,
      clicked,
      selected,
      extraTile,
      board,
    )).toBe(`${userName} played TEST and used 3 tokens and was awarded an extra tile. Your turn in Wordspot!`);
  expect(await testGetNumExtraTiles(playerId)).toBe(1);
  expect(await testGetTokens(playerId)).toBe(23);

  await cleanUpDatabase();
});

test("test `saveTurn` function - game over", async () => {
  await cleanUpDatabase();
  await initializeDatabase();
  const { gameId, userId, userName, playerId } = await testStartGame();
  const extraTile: PlacedExtraTile | undefined = undefined;
  const clicked = [
    await testSetLetterByIndices("L", 1, 1, 0, gameId),
    await testSetLetterByIndices("E", 1, 1, 1, gameId),
    await testSetLetterByIndices("T", 1, 2, 0, gameId),
  ];
  const selected: string[] = [];
  await testSetPlayerTokens(3, playerId);

  const { board } = await getGame(gameId, userId);
  expect(
    await saveTurn(
      gameId,
      playerId,
      clicked,
      selected,
      extraTile,
      board,
    )).toBe(`${userName} played LET and beat you in Wordspot. Better luck next time!`);
  expect(await testGetTokens(playerId)).toBe(0);
  expect(await testGetWinner(gameId)).toBe(playerId);

  await cleanUpDatabase();
});
