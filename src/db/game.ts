import { redirect } from "solid-start/server";
import { v4 as uuidv4 } from "uuid";
import { query, twilioClient } from ".";
import { getUser } from "~/db/session";
import { isEnglishWord } from "~/db/dictionary";

const TILES = [
  "SGPU", "HEAS", "XAIY",
  "LIEL", "RNAD", "OPPE",
  "CAKI", "TSOS", "MIAP",
  "PLAE", "ZEYA", "ENRI",
  "ILFL", "OSOT", "WOAT",
  "GNSA", "STHA", "IRTE",
  "CEKA", "VEIH", "NTOA",
  "EDER", "THEC", "DLEY",
  "ATIR", "VNSA", "ETND",
  "AJNO", "LRIG", "MORG",
  "RAIB", "BOUT",
];

export type ExtraTileRow = {
  id: string;
  tiles: ExtraTile[];
};

export type Row = {
  id: string;
  tiles: Tile[];
};

export type TileType = "Tile" | "Empty" | "Placeholder" | "Extra" | "Option";

export type Tile = {
  id: string;
  letters: Letter[];
  row: number;
  column: number;
  type: TileType;
};

export type ExtraTile = Omit<Tile, "row" | "column" | "type">;
export type PlacedExtraTile = ExtraTile & { tileId: string };

export type Letter = {
  id: string;
  letterIndex: number;
  letter: string;
  isUsed: boolean;
};

type SqlTile = [string, number | null, number | null, TileType, string];
type SqlLetter = [string, number, string, boolean, string];
type SqlTileLetterMap = [string, string, string, string];

type SqlResultBoard = {
  tileId: string;
  rowIndex: number;
  columnIndex: number;
  tileType: Omit<TileType, "Option">;
  letterId: string;
  letterIndex: number;
  letter: string;
  isUsed: boolean;
};

type SqlResultExtraTile = {
  tileId: string;
  letterId: string;
  letterIndex: number;
  letter: string;
};

export type UserData = {
  playerId: string;
  firstPlayer: string;
  winner: string | null;
  myId: string;
  myName: string;
  myTokens: number;
  myTurn: boolean;
  opponentName: string;
  opponentTokens: number;
  opponentTurn: boolean;
};

type SqlUserData = Omit<UserData, "myTurn" | "opponentTurn"> & { myTurn: number; opponentTurn: number };

export type GameData = {
  id: string;
  dateCreated: string;
  firstPlayer: string;
  winner: string;
  myId: string;
  myName: string;
  myTurn: boolean;
  opponentName: string;
};

export async function getGames(userId: string) {
  return await query({
    sql: "SELECT Game.id, DATE_FORMAT(Game.dateCreated, '%m/%d/%Y') AS dateCreated, \
    IF(my.firstMove, my.id, opponent.id) AS firstPlayer, Game.winner, my.id AS myId, my.name AS myName, \
    my.turn AS myTurn, opponent.name AS opponentName \
    FROM (SELECT Player.id AS id, gameId, UserAccount.userName AS name, tokens, turn, firstMove \
      FROM Player INNER JOIN UserAccount ON Player.userId=UserAccount.id \
      WHERE userId=?) AS my INNER JOIN \
      (SELECT Player.id AS id, gameId, UserAccount.userName AS name, tokens, turn, firstMove FROM Player \
        INNER JOIN UserAccount on Player.userId=UserAccount.id \
        WHERE userId!=?) AS opponent \
        ON my.gameId=opponent.gameId INNER JOIN Game ON my.gameId=Game.id \
        ORDER BY Game.dateCreated DESC",
    values: [userId, userId],
  }) as GameData[];
}

export async function startGame(request: Request) {
  // Get user who started the game.
  const user = await getUser(request);
  if (!user) {
    return;
  }

  const players: string[] = [import.meta.env.VITE_USER1, import.meta.env.VITE_USER2];

  const player1 = user.id;
  const player2 = players.find(player => player !== player1);

  if (!player2) {
    throw new Error(`Unable to select opponent. Game was not created.`);
  }

  // Create game.
  const gameId = uuidv4();
  await query({
    sql: "INSERT INTO Game (id, winner, \
      dateCreated, dateModified, createdBy) VALUES \
      (?, ?, ?, ?, ?)",
    values: [
      gameId,
      null,
      new Date(),
      new Date(),
      player1,
    ],
  });

  await query({
    sql: "INSERT INTO Player VALUES ?",
    values: [[
      [uuidv4(), player1, gameId, 26, true, true],
      [uuidv4(), player2, gameId, 25, false, false],
    ]],
  });

  // Set up board.
  const {
    tiles,
    letters,
    tileLetterMap,
  } = setUpBoard(gameId);
  await query({
    sql: "INSERT INTO Tile VALUES ?",
    values: [tiles],
  });
  await query({
    sql: "INSERT INTO Letter VALUES ?",
    values: [letters],
  });
  await query({
    sql: "INSERT INTO TileLetterMap VALUES ?",
    values: [tileLetterMap],
  });

  return redirect(`/games/${gameId}`);
}

function setUpBoard(gameId: string) {
  // Create 4x4 grid of tiles.
  const tileOptions = [...TILES];
  const tiles: SqlTile[] = [];
  const letters: SqlLetter[] = [];
  const tileLetterMap: SqlTileLetterMap[] = [];

  // The top row.
  tiles.push([uuidv4(), 0, 0, "Placeholder", gameId]);
  tiles.push([uuidv4(), 0, 1, "Empty", gameId]);
  tiles.push([uuidv4(), 0, 2, "Empty", gameId]);
  tiles.push([uuidv4(), 0, 3, "Empty", gameId]);
  tiles.push([uuidv4(), 0, 4, "Empty", gameId]);
  tiles.push([uuidv4(), 0, 5, "Placeholder", gameId]);

  for (let i = 1; i < 5; i++) {
    // First column in the row.
    tiles.push([uuidv4(), i, 0, "Empty", gameId]);
    
    for (let j = 1; j < 5; j++) {
      const randomIndex = Math.floor(Math.random() * tileOptions.length);
      const tileLetters = tileOptions.splice(randomIndex, 1);

      const tileId = uuidv4();
      tiles.push([tileId, i, j, "Tile", gameId]);

      tileLetters[0].split("").forEach((letter, letterIndex) => {
        const letterId = uuidv4();
        letters.push([letterId, letterIndex, letter, false, gameId]);
        tileLetterMap.push([uuidv4(), tileId, letterId, gameId]);
      });
    }

    // Last column in the row.
    tiles.push([uuidv4(), i, 5, "Empty", gameId]);
  }

  // The bottom row.
  tiles.push([uuidv4(), 5, 0, "Placeholder", gameId]);
  tiles.push([uuidv4(), 5, 1, "Empty", gameId]);
  tiles.push([uuidv4(), 5, 2, "Empty", gameId]);
  tiles.push([uuidv4(), 5, 3, "Empty", gameId]);
  tiles.push([uuidv4(), 5, 4, "Empty", gameId]);
  tiles.push([uuidv4(), 5, 5, "Placeholder", gameId]);

  // Store remaining tiles in the database.
  tileOptions.forEach(tileLetters => {
    const tileId = uuidv4();
    tiles.push([tileId, null, null, "Option", gameId]);
    tileLetters.split("").forEach((letter, letterIndex) => {
      const letterId = uuidv4();
      letters.push([letterId, letterIndex, letter, false, gameId]);
      tileLetterMap.push([uuidv4(), tileId, letterId, gameId]);
    });
  });

  return {
    tiles: tiles,
    letters: letters,
    tileLetterMap: tileLetterMap,
  };
}

function checkNeighbors(row: number, column: number, board: Row[], extraTile: Tile) {
  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[i].tiles.length; j++) {
      if (
        (board[i].tiles[j].row === row && board[i].tiles[j].column === column + 1 ||
        board[i].tiles[j].row === row && board[i].tiles[j].column === column - 1 ||
        board[i].tiles[j].row === row + 1 && board[i].tiles[j].column === column ||
        board[i].tiles[j].row === row - 1 && board[i].tiles[j].column === column) &&
        board[i].tiles[j].type === "Tile"
      ) {
        return true;
      }
    }
  }

  if (
    extraTile.row === row && extraTile.column === column + 1 ||
    extraTile.row === row && extraTile.column === column - 1 ||
    extraTile.row === row + 1 && extraTile.column === column ||
    extraTile.row === row - 1 && extraTile.column === column
  ) {
    return true;
  }

  return false;
}

function getTileAtLocation(row: number, column: number, board: Row[]) {
  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[i].tiles.length; j++) {
      if (board[i].tiles[j].row === row && board[i].tiles[j].column === column) {
        return board[i].tiles[j];
      }
    }
  }
}

function getTileFromLetter(letterId: string, board: Row[], extraTile: ExtraTile | undefined) {
  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[i].tiles.length; j++) {
      if (board[i].tiles[j].letters.find(letter => letter.id === letterId)) {
        return board[i].tiles[j].id;
      }
    }
  }

  if (extraTile && extraTile.letters.find(l => l.id === letterId)) {
    return extraTile.id;
  }

  throw new Error(`Tile associated with letter ID="${letterId}" was not found.`);
}

export type WordLetter = {
  tileRow: number;
  tileColumn: number;
  letterIndex: number;
};

type Coordinate = {
  x: number;
  y: number;
};

type Line = [Coordinate, Coordinate, Coordinate];

function computeDeterminant(coordinates: Line) {
  const { x: x0, y: y0 } = coordinates[0];
  const { x: x1, y: y1 } = coordinates[1];
  const { x: x2, y: y2 } = coordinates[2];

  return x1 * y2 - y1 * x2 - x0 * y2 + y0 * x2 + x0 * y1 - y0 * x1;
}

function computeDistance(coordinates: Coordinate[]) {
  const { x: x0, y: y0 } = coordinates[0];
  const { x: x1, y: y1 } = coordinates[coordinates.length - 1];
  return (y1 !== y0 ? y1 - y0 : x1 - x0) + 1;
};

function getLetterPosition(row: number, column: number, index: number): Coordinate {
  return {
    x: 2 * row + (index < 2 ? 0 : 1),
    y: 2 * column + index % 2,
  };
}

// Convert the coordinates of each letter to a numeric index.
function getLetterIndex(letter: WordLetter, columnLength: number) {
  return 4 * columnLength * letter.tileRow +
    2 * letter.tileColumn + letter.letterIndex % 2 +
    (letter.letterIndex < 2 ? 0 : 2 * columnLength);
}

export function isValidMove(word: WordLetter[]) {
  const positions = word.map(w => {
    return getLetterPosition(w.tileRow, w.tileColumn, w.letterIndex);
  });

  if (
    isStraightLine(positions) &&
    computeDistance(positions) === positions.length
  ) {
    return true;
  } else {
    return false;
  }
}

type Word = WordLetter & { letter: string };

export async function checkWord(letters: string[], board: Row[]): Promise<string> {
  const wordPosition: Word[] = [];
  letters.forEach(letterId => {
    for (let i = 0; i < board.length; i++) {
      for (let j = 0; j < board[i].tiles.length; j++) {
        const matchingLetter = board[i].tiles[j].letters.find(letter => letter.id === letterId);
        if (matchingLetter) {
          wordPosition.push({
            tileRow: board[i].tiles[j].row,
            tileColumn: board[i].tiles[j].column,
            letterIndex: matchingLetter.letterIndex,
            letter: matchingLetter.letter,
          });
        }
      }
    }
  });

  // Sort the letters by position in order to check if
  // the move is valid.
  wordPosition.sort((a, b) => 
    getLetterIndex(a, board[0].tiles.length) -
    getLetterIndex(b, board[0].tiles.length));

  // Checks that the letters are arranged in a straight line and
  // that there are no gaps between letters.
  if (!isValidMove(wordPosition)) {
    throw new Error("Your word is not valid. Make sure that your word is arranged in a straight line.");
  }

  // Check if word is a valid English word.
  // Check the word both forward and backward.
  let possibleWord1 = "";
  let possibleWord2 = "";
  for (let i = 0; i < wordPosition.length; i++) {
    possibleWord1 += wordPosition[i].letter.toLowerCase();
    possibleWord2 += wordPosition[wordPosition.length - 1 - i].letter.toLowerCase();
  }

  try {
    const isWord1Valid = await isEnglishWord(possibleWord1);
    const isWord2Valid = await isEnglishWord(possibleWord2) 

    if (!isWord1Valid && !isWord2Valid) {
      throw new Error(`Your word is not valid. Neither ${possibleWord1.toUpperCase()} nor ${possibleWord2.toUpperCase()} is in the English dictionary.`);
    }

    return isWord1Valid ? possibleWord1.toUpperCase() : possibleWord2.toUpperCase();
  } catch (error) {
    throw new Error("Could not determine if your word is in the English dictionary. Please try again.");
  }
}

function isStraightLine(positions: Coordinate[]) {
  for (let i = 0; i < positions.length - 2; i++) {
    if (computeDeterminant(positions.slice(i, i + 3) as Line) !== 0) {
      return false;
    }
  }

  return true;
}

export async function endTurn(gameId: string, playerId: string, clicked: string[], selected: string[], extraTile: PlacedExtraTile | undefined, board: Row[]) {
  // `clicked` contains IDs for unused letters that the user clicked.
  // `selected` contains IDs for used letters that the user clicked.
  const lettersChosenByUser = clicked.concat(selected);

  // Give the user an extra tile and two tokens for not making
  // a valid move. A valid move requires the user to find a word
  // spanning at least 3 letters with at least one of those letters
  // currently unused. If a valid move has not been made, do not 
  // add an extra tile to the board, even if the user chose to do so.
  if (lettersChosenByUser.length < 3 || clicked.length < 1) {
    await assignExtraTile(gameId, playerId);
    await query({
      sql: "UPDATE Player SET tokens=tokens+2, turn=0 WHERE id=?",
      values: [playerId],
    });
    await query({
      sql: "UPDATE Player SET turn=1 WHERE id!=? AND gameId=?",
      values: [playerId, gameId],
    });

    await sendYourTurnMessage(playerId, gameId);
    return;
  }

  // Check if the user submitted a valid word.
  const validWord = await checkWord(lettersChosenByUser, board);

  // Update player data.
  await query({
    sql: "UPDATE Player SET tokens=tokens-?, turn=0 WHERE id=?",
    values: [clicked.length, playerId],
  });
  await query({
    sql: "UPDATE Player SET turn=1 WHERE id!=? AND gameId=?",
    values: [playerId, gameId],
  });

  // Check how many tokens the user has left.
  const playerTokens = await query({
    sql: "SELECT tokens FROM Player WHERE id=?",
    values: [playerId],
  }) as { tokens: number }[];

  if (playerTokens.length === 0) {
    throw new Error(`Can't find database record for player with ID=${playerId}`);
  } else if (playerTokens[0].tokens < 0) {
    throw new Error(`Player with ID=${playerId} has negative tokens.`);
  } else if (playerTokens[0].tokens === 0) {
    await query({
      sql: "UPDATE Game SET winner=? WHERE id=?",
      values: [playerId, gameId],
    });
  }

  // Update letters that have been clicked.
  for (let i = 0; i < clicked.length; i++) {
    await query({
      sql: "UPDATE Letter SET isUsed=1 WHERE id=?",
      values: clicked[i],
    });
  }

  // Award the user an extra tile for finding a word that spans
  // more than two tiles.
  if (lettersChosenByUser.length > 2) {
    const tiles = new Set<string>();
    lettersChosenByUser.forEach(letter => {
      tiles.add(getTileFromLetter(letter, board, extraTile));
    });

    if (tiles.size > 2) {
      await assignExtraTile(gameId, playerId);
    }
  }

  // If the user placed an extra tile on the board, iterate over
  // the board to update the layout.
  if (extraTile) {
    // Find row and column of the extra tile that has been placed on the board.
    const extraTileLocation = await query({
      sql: "SELECT rowIndex, columnIndex FROM Tile WHERE id=?",
      values: [extraTile.tileId],
    }) as { rowIndex: number, columnIndex: number }[];

    if (extraTileLocation.length !== 1) {
      throw new Error(`Error querying the database for the row and column location of the extra tile placed on the board.`);
    }

    const placedExtraTile: Tile = {
      id: extraTile.id,
      letters: extraTile.letters,
      type: "Extra",
      row: extraTileLocation[0].rowIndex,
      column: extraTileLocation[0].columnIndex,
    };

    const { row, column } = placedExtraTile;
    for (let i = Math.min(board[0].tiles[0].row, row - 1); i <= Math.max(board[board.length - 1].tiles[0].row, row + 1); i++) {
      for (let j = Math.min(board[0].tiles[0].column, column - 1); j <= Math.max(board[0].tiles[board[0].tiles.length - 1].column, column + 1); j++) {
        const tileAtLocation = getTileAtLocation(i, j, board);

        if (tileAtLocation) {
          if (extraTile && i === row && j === column) {
            await query({
              sql: "UPDATE Tile SET rowIndex=?, columnIndex=?, tileType=?, ownerId=? WHERE id=?",
              values: [i, j, "Tile", gameId, extraTile.id],
            });
            await query({
              sql: "DELETE FROM Tile WHERE id=?",
              values: [tileAtLocation.id],
            });
          } else {
            if (tileAtLocation.type === "Empty" || tileAtLocation.type === "Placeholder") {
              await query({
                sql: "UPDATE Tile SET tileType=? WHERE id=?",
                values: [
                  checkNeighbors(i, j, board, placedExtraTile) ? "Empty" : "Placeholder",
                  tileAtLocation.id,
                ],
              });
            }
          }
        } else {
          // Create a new tile - either an empty tile or a placeholder.
          await query({
            sql: "INSERT INTO Tile (id, rowIndex, columnIndex, tileType, ownerId) VALUES (?, ?, ?, ?, ?)",
            values: [
              uuidv4(),
              i,
              j,
              checkNeighbors(i, j, board, placedExtraTile) ? "Empty" : "Placeholder",
              gameId,
            ],
          });
        }
      }
    }
  }

  await sendYourTurnMessage(playerId, gameId);
}

async function sendYourTurnMessage(playerId: string, gameId: string) {
  const userRows = await query({
    sql: "SELECT phone FROM UserAccount INNER JOIN Player \
      ON Player.userId=UserAccount.id WHERE Player.id!=? \
      AND gameId=?",
    values: [playerId, gameId],
  }) as { phone: string }[];

  if (userRows.length !== 1) {
    throw new Error(``);
  }

  await twilioClient.messages.create({
    body: "Your turn in Wordspot!",
    from: import.meta.env.VITE_TWILIO_PHONE,
    to: `+1${userRows[0].phone}`,
  });
}

async function assignExtraTile(gameId: string, playerId: string) {
  const rows = await query({
    sql: "SELECT id FROM Tile WHERE tileType='Option' AND ownerId=? ORDER BY RAND() LIMIT 1",
    values: [gameId],
  }) as { id: string }[];

  if (rows.length === 0) {
    throw new Error("No extra tiles left to assign!");
  }

  const newExtraTileId = rows[0];
  await query({
    sql: `UPDATE Tile SET tileType="Extra", ownerId="${playerId}" WHERE id="${newExtraTileId.id}"`,
  });
}

function convertSqlResultsToBoard(sqlTiles: SqlResultBoard[]) {
  const board: Row[] = [];
  const minRow = Math.min(...sqlTiles.map(t => t.rowIndex));
  const maxRow = Math.max(...sqlTiles.map(t => t.rowIndex));
  const minColumn = Math.min(...sqlTiles.map(t => t.columnIndex));
  const maxColumn = Math.max(...sqlTiles.map(t => t.columnIndex));

  for (let i = minRow; i <= maxRow; i++) {
    const tiles: Tile[] = [];

    for (let j = minColumn; j <= maxColumn; j++) {
      const sqlLetters = sqlTiles.filter(t => t.rowIndex === i && t.columnIndex === j);
      
      if (sqlLetters.length === 0) {
        throw new Error(`Expecting data for row index=${i} and column index=${j}.`);
      }

      const tileType = sqlLetters[0].tileType;
      if (tileType === "Tile" && sqlLetters.length === 4) {
        const letters: Letter[] = sqlLetters.map(l => {
          return {
            id: l.letterId,
            letterIndex: l.letterIndex,
            letter: l.letter,
            isUsed: l.isUsed,
          };
        }).sort((a, b) => a.letterIndex - b.letterIndex);

        tiles.push({
          id: sqlLetters[0].tileId,
          letters: letters,
          row: i,
          column: j,
          type: tileType as TileType,
        });
      } else if ((tileType === "Placeholder" || tileType === "Empty") &&
        sqlLetters.length === 1
      ) {
        tiles.push({
          id: sqlLetters[0].tileId,
          letters: [],
          row: i,
          column: j,
          type: tileType as TileType,
        });
      } else {
        throw new Error(`Incorrect data.`);
      }
    }

    board.push({ id: uuidv4(), tiles });
  }

  return board;
}

function convertSqlResultsToExtraTiles(sqlExtraTiles: SqlResultExtraTile[]) {
  const extraTiles: ExtraTile[] = [];

  const extraTileIds = new Set<string>();
  sqlExtraTiles.forEach(t => {
    extraTileIds.add(t.tileId);
  });

  Array.from(extraTileIds).forEach(id => {
    const sqlLetters = sqlExtraTiles.filter(t => t.tileId === id);
    const letters: Letter[] = sqlLetters.map(l => {
      return {
        id: l.letterId,
        letterIndex: l.letterIndex,
        letter: l.letter,
        isUsed: false,
      };
    }).sort((a, b) => a.letterIndex - b.letterIndex);
    
    const sqlExtraTile = sqlExtraTiles.find(t => t.tileId === id);
    if (!sqlExtraTile) {
      throw new Error(`Tile with id=${id} not found when searching for extra tile.`);
    }

    extraTiles.push({
      id: sqlExtraTile.tileId,
      letters: letters,
    });
  });

  return extraTiles;
}

export async function getGame(gameId: string, request: Request) {
  const user = await getUser(request);
  if (!user) {
    return;
  }

  const tiles = await query({
    sql: `SELECT Tile.id AS tileId, Tile.rowIndex, Tile.columnIndex, \
      Tile.tileType, Letter.id AS letterId, Letter.letterIndex, \
      Letter.letter, Letter.isUsed FROM Tile LEFT JOIN \
      TileLetterMap ON Tile.id=TileLetterMap.tileId LEFT JOIN Letter \
      ON TileLetterMap.letterId=Letter.id WHERE Tile.tileType != "Option" \
      AND Tile.tileType != "Extra" AND Tile.ownerId="${gameId}"`,
  }) as SqlResultBoard[];

  const userData = await query({
    sql: "SELECT IF(my.firstMove, my.playerId, opponent.playerId) AS firstPlayer, my.playerId, Game.winner, my.playerId AS myId, \
    my.name AS myName, my.tokens AS myTokens, \
    my.turn AS myTurn, opponent.name AS opponentName, \
    opponent.tokens AS opponentTokens, opponent.turn AS opponentTurn \
    FROM (SELECT gameId, Player.id AS playerId, UserAccount.userName AS name, tokens, turn, firstMove \
      FROM Player INNER JOIN UserAccount ON Player.userId=UserAccount.id \
      WHERE userId=?) AS my INNER JOIN \
      (SELECT gameId, Player.id AS playerId, UserAccount.userName AS name, tokens, turn FROM Player \
        INNER JOIN UserAccount on Player.userId=UserAccount.id \
        WHERE userId!=?) AS opponent \
        ON my.gameId=opponent.gameId INNER JOIN Game on my.gameId=Game.id \
        WHERE Game.id=?",
    values: [user.id, user.id, gameId],
  }) as SqlUserData[];

  if (userData.length === 0) {
    return;
  }

  const extraTiles = await query({
    sql: `SELECT Tile.id AS tileId, Letter.id AS letterId, \
      Letter.letterIndex, Letter.letter FROM Tile INNER JOIN Player ON \
      Player.id=Tile.ownerId LEFT JOIN TileLetterMap ON \
      Tile.id=TileLetterMap.tileId LEFT JOIN Letter ON TileLetterMap.letterId=Letter.id \
      WHERE Player.gameId="${gameId}" AND Player.userId="${user.id}"`,
  }) as SqlResultExtraTile[];

  const parsedUserData: UserData = {
    ...userData[0],
    myTurn: Boolean(userData[0].myTurn),
    opponentTurn: Boolean(userData[0].opponentTurn),
  };

  return {
    board: convertSqlResultsToBoard(tiles),
    userData: parsedUserData,
    extraTiles: convertSqlResultsToExtraTiles(extraTiles),
  };
}
