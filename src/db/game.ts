import { redirect } from "solid-start/server";
import { v4 as uuidv4 } from "uuid";
import { query, twilioClient } from ".";
import { getUser, type UserAccount } from "~/db/session";
import { isEnglishWord } from "~/db/dictionary";

function formatPostgresObject<T>(obj: T) {
  return `(${Object.values(obj).join(',')})`;
}

function formatPostgresArray<T>(array: T[]) {
  return `{${array.map(obj => `"${formatPostgresObject(obj)}"`).join(',')}}`
}

function formatPostgresArrayOfArrays<T>(array: T[]) {
  return `{${array.map(inner => `"(${inner.join(',')})"`)}}`;
}

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
  const games = await query({
    text: "SELECT game.id, to_char(game.date_created, 'MM/DD/YYYY') AS \"dateCreated\", \
    CASE WHEN my.first_move THEN my.id ELSE opponent.id END AS \"firstPlayer\", \
    Game.winner, my.id AS \"myId\", my.name AS \"myName\", \
    my.turn AS \"myTurn\", opponent.name AS \"opponentName\" \
    FROM (SELECT player.id AS id, game_id, user_account.user_name AS name, \
          tokens, turn, first_move FROM player INNER JOIN user_account ON player.user_id=user_account.id \
      WHERE user_id=$1) AS my INNER JOIN \
      (SELECT player.id AS id, game_id, user_account.user_name AS name, \
       tokens, turn, first_move FROM player \
        INNER JOIN user_account on player.user_id=user_account.id \
        WHERE user_id!=$2) AS opponent \
        ON my.game_id=opponent.game_id INNER JOIN game ON my.game_id=game.id \
        ORDER BY game.date_created DESC",
    values: [userId, userId],
  }) as GameData[];

  return games;
}

export async function startGame(user: UserAccount) {
  const players: string[] = [import.meta.env.VITE_USER1, import.meta.env.VITE_USER2];

  const player1Id = user.id;
  const player2Id = players.find(player => player !== player1Id);

  if (!player2Id) {
    throw new Error(`Unable to select opponent. Game was not created.`);
  }

  const gameId = uuidv4();

  const game = {
    id: gameId,
    winner: null,
    dateCreated: new Date().toISOString(),
    dateModified: new Date().toISOString(),
    createdBy: player1Id,
  };

  const player1 = {
    id: uuidv4(),
    userId: player1Id,
    gameId: gameId,
    tokens: 26,
    turn: true,
    firstMove: true,
  };

  const player2 = {
    id: uuidv4(),
    userId: player2Id,
    gameId: gameId,
    tokens: 25,
    turn: false,
    firstMove: false,
  };

  const { tiles, letters, tileLetterMap } = setUpBoard(gameId);

  const createdGameId = await query({
    text: "SELECT create_game($1, $2, $3, $4, $5, $6)",
    values: [
        formatPostgresObject(game),
        formatPostgresObject(player1),
        formatPostgresObject(player2),
        formatPostgresArrayOfArrays(tiles),
        formatPostgresArrayOfArrays(letters),
        formatPostgresArrayOfArrays(tileLetterMap),
    ],
  });

  if (createdGameId.length !== 1) {
    throw new Error(`"create_game" SQL function completed without errors, but ${createdGameId.length} IDs were returned, instead of 1 ID`);
  }

  return createdGameId[0].create_game;
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

function isStraightLine(positions: Coordinate[]) {
  for (let i = 0; i < positions.length - 2; i++) {
    if (computeDeterminant(positions.slice(i, i + 3) as Line) !== 0) {
      return false;
    }
  }

  return true;
}

function computeDeterminant(coordinates: Line) {
  const { x: x0, y: y0 } = coordinates[0];
  const { x: x1, y: y1 } = coordinates[1];
  const { x: x2, y: y2 } = coordinates[2];

  return x1 * y2 - y1 * x2 - x0 * y2 + y0 * x2 + x0 * y1 - y0 * x1;
}

function computeDistance(coordinates: Coordinate[]) {
  const { x: x0, y: y0 } = coordinates[0];
  const { x: x1, y: y1 } = coordinates[coordinates.length - 1];
  return Math.abs(y1 !== y0 ? y1 - y0 : x1 - x0) + 1;
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

export async function checkWord(letters: string[], board: Row[], extraTile: Tile | undefined): Promise<string> {
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

    if (extraTile) {
      const matchingLetter = extraTile.letters.find(letter => letter.id === letterId);
      if (matchingLetter) {
        wordPosition.push({
          tileRow: extraTile.row,
          tileColumn: extraTile.column,
          letterIndex: matchingLetter.letterIndex,
          letter: matchingLetter.letter,
        });
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

  let isWord1Valid = false;
  let isWord2Valid = false;
  try {
    isWord1Valid = await isEnglishWord(possibleWord1);
    isWord2Valid = await isEnglishWord(possibleWord2);
  } catch (error) {
    throw new Error("Could not determine if your word is in the English dictionary. Please try again.");
  }

  if (!isWord1Valid && !isWord2Valid) {
    throw new Error(`Your word is not valid. Neither ${possibleWord1.toUpperCase()} nor ${possibleWord2.toUpperCase()} is in the English dictionary.`);
  }

  return isWord1Valid ? possibleWord1.toUpperCase() : possibleWord2.toUpperCase();
}

type SqlExtraTile = {
  id: string;
  rowIndex: number;
  columnIndex: number;
};

type SqlUpdatedTile = {
  tileId: string;
  tileType: string;
};

type SqlNewTile = {
  tileId: string;
  tileType: string;
  rowIndex: number;
  columnIndex: number;
};

export async function endTurn(gameId: string, playerId: string, clicked: string[], selected: string[], extraTile: PlacedExtraTile | undefined, board: Row[]) {
  // `clicked` contains IDs for unused letters that the user clicked.
  // `selected` contains IDs for used letters that the user clicked.
  const lettersChosenByUser = clicked.concat(selected);

  const playerName = await query({
    text: "SELECT user_account.user_name AS name FROM player INNER JOIN \
      user_account ON user_account.id=player.user_id \
      WHERE player.id=$1",
    values: [playerId],
  }) as { name: string }[];

  if (playerName.rows.length !== 1) {
    throw new Error("There was an issue finding your information!");
  }

  // TODO: Use separate SQL function
  // Give the user an extra tile and two tokens for not making
  // a valid move. A valid move requires the user to find a word
  // spanning at least 3 letters with at least one of those letters
  // currently unused. If a valid move has not been made, do not 
  // add an extra tile to the board, even if the user chose to do so.
  if (lettersChosenByUser.length < 3 || clicked.length < 1) {
    await assignExtraTile(gameId, playerId);
    await query({
      text: "UPDATE player SET tokens=tokens+2, turn=FALSE WHERE id=$1",
      values: [playerId],
    });
    await query({
      text: "UPDATE player SET turn=TRUE WHERE id!=$1 AND game_id=$2",
      values: [playerId, gameId],
    });

    const message = `${playerName.rows[0].name} did not make a move and received 2 tokens and an extra tile. Your turn in Wordspot!`;
    await sendYourTurnMessage(playerId, gameId, message);
    return;
  }

  let sqlExtraTile = null;
  let placedExtraTile: Tile | undefined = undefined;
  if (extraTile) {
    // Find row and column of the extra tile that has been placed on the board.
    const extraTileLocation = await query({
      text: "SELECT row_index AS \"rowIndex\", column_index AS \"columnIndex\" FROM tile WHERE id=$1",
      values: [extraTile.tileId],
    }) as { rowIndex: number, columnIndex: number }[];

    if (extraTileLocation.length !== 1) {
      throw new Error(`Error querying the database for the row and column location of the extra tile placed on the board.`);
    }

    sqlExtraTile = {
        id: extraTile.id,
        row: extraTileLocation[0].rowIndex,
        column: extraTileLocation[0].columnIndex,
    };

    placedExtraTile = {
      id: extraTile.id,
      letters: extraTile.letters,
      type: "Extra",
      row: extraTileLocation[0].rowIndex,
      column: extraTileLocation[0].columnIndex,
    };
  }

  // Check if the user submitted a valid word.
  const validWord = await checkWord(lettersChosenByUser, board, placedExtraTile);

  // Award the user an extra tile for finding a word that spans
  // more than two tiles.
  let awardedExtraTile = false;
  if (lettersChosenByUser.length > 2) {
    const tiles = new Set<string>();
    lettersChosenByUser.forEach(letter => {
      tiles.add(getTileFromLetter(letter, board, extraTile));
    });

    if (tiles.size > 2) {
      awardedExtraTile = true;
      await assignExtraTile(gameId, playerId);
    }
  }

  const sqlExtraTiles: SqlExtraTile[] = [];
  const sqlUpdatedTiles: SqlUpdatedTile[] = [];
  const sqlNewTiles: SqlNewTile[] = [];

  // If the user placed an extra tile on the board, iterate over
  // the board to update the layout.
  if (placedExtraTile) {
    const { row, column } = placedExtraTile;
    for (let i = Math.min(board[0].tiles[0].row, row - 1); i <= Math.max(board[board.length - 1].tiles[0].row, row + 1); i++) {
      for (let j = Math.min(board[0].tiles[0].column, column - 1); j <= Math.max(board[0].tiles[board[0].tiles.length - 1].column, column + 1); j++) {
        const tileAtLocation = getTileAtLocation(i, j, board);

        if (tileAtLocation) {
          if (extraTile && i === row && j === column) {
            sqlExtraTiles.push({
              id: extraTile.id,
              rowIndex: i,
              columnIndex: j,
            });

            /*
            await client.query({
              text: "UPDATE tile SET row_index=$1, column_index=$2, tile_type=$3, owner_id=$4 WHERE id=$5",
              values: [i, j, "Tile", gameId, extraTile.id],
            });
            await client.query({
              text: "DELETE FROM tile WHERE id=$1",
              values: [tileAtLocation.id],
            });
            */
          } else {
            if (tileAtLocation.type === "Empty" || tileAtLocation.type === "Placeholder") {
              const tileType = checkNeighbors(i, j, board, placedExtraTile)
                ? "Empty" : "Placeholder";

              if (tileAtLocation.type !== tileType) {
                sqlUpdatedTiles.push({
                  tileId: tileAtLocation.id,
                  tileType: tileType,
                });
              }

              // Need to check if the type of tile changed. Maybe the addition 
              // of the extra tile changed this from Empty to Placeholder.
              /*
              await client.query({
                text: "UPDATE tile SET tile_type=$1 WHERE id=$2",
                values: [
                  checkNeighbors(i, j, board, placedExtraTile) ? "Empty" : "Placeholder",
                  tileAtLocation.id,
                ],
              });
              */
            }
          }
        } else {
          // Create a new tile - either an empty tile or a placeholder.
          sqlNewTiles.push({
            id: uuidv4(),
            tileType: checkNeighbors(i, j, board, placedExtraTile)
                ? "Empty" : "Placeholder",
            rowIndex: i,
            columnIndex: j,
          });
          /*
          await client.query({
            text: "INSERT INTO tile (id, row_index, column_index, tile_type, owner_id) VALUES ($1, $2, $3, $4, $5)",
            values: [
              uuidv4(),
              i,
              j,
              checkNeighbors(i, j, board, placedExtraTile) ? "Empty" : "Placeholder",
              gameId,
            ],
          });
          */
        }
      }
    }
  }

  await query({
    text: "SELECT end_turn($1, $2, $3, $4, $5)",
    values: [
        gameId,
        formatPostgresArray(clicked),
        sqlExtraTile ? formatPostgresObject(sqlExtraTile) : null,
        formatPostgresArray(sqlUpdatedTiles),
        formatPostgresArray(sqlNewTiles),
    ],
  });

  let message = `${playerName[0].name} played ${validWord}`;
  if (didPlayerLose) {
    message += " and beat you in Wordspot. Better luck next time!";
  } else if (awardedExtraTile) {
    message += ` and used ${clicked.length} ${clicked.length === 1 ? "token" : "tokens"} and was awarded an extra tile. Your turn in Wordspot!`;
  } else {
    message += ` and used ${clicked.length} ${clicked.length === 1 ? "token" : "tokens"}. Your turn in Wordspot!`;
  }
  await sendYourTurnMessage(playerId, gameId, message);
}

async function sendYourTurnMessage(playerId: string, gameId: string, message: string) {
  try {
    const userRows = await query({
      text: "SELECT phone FROM user_account INNER JOIN player \
        ON player.user_id=user_account.id WHERE player.id!=$1 \
        AND game_id=$2",
      values: [playerId, gameId],
    }) as { phone: string }[];
  
    if (userRows.length !== 1) {
      throw new Error();
    }
  
    await twilioClient.messages.create({
      body: message,
      from: import.meta.env.VITE_TWILIO_PHONE,
      to: `+1${userRows[0].phone}`,
    });
  } catch (error) {
    throw new Error("Could not send text message to your opponent. Please notify them yourself!");
  }
}

async function assignExtraTile(gameId: string, playerId: string) {
  const rows = await query({
    text: "SELECT id FROM tile WHERE tile_type=$1 AND owner_id=$2 ORDER BY RANDOM() LIMIT 1",
    values: ["Option", gameId],
  }) as { id: string }[];

  if (rows.length === 0) {
    throw new Error("No extra tiles left to assign!");
  }

  const newExtraTileId = rows[0];
  await query({
    text: "UPDATE tile SET tile_type=$1, ownerId=$2 WHERE id=$3",
    values: ["Extra", playerId, newExtraTileId.id],
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
    text: "SELECT tile.id AS \"tileId\", tile.row_index AS \"rowIndex\", tile.column_index AS \"columnIndex\", \
      tile.tile_type AS \"tileType\", letter.id AS \"letterId\", letter.letter_index AS \"letterIndex\", \
      letter.letter, letter.is_used AS \"isUsed\" FROM tile LEFT JOIN \
      tile_letter_map ON tile.id=tile_letter_map.tile_id LEFT JOIN letter \
      ON tile_letter_map.letter_id=letter.id WHERE tile.tile_type != $1 \
      AND tile.tile_type != $2 AND tile.owner_id=$3",
    values: ["Option", "Extra", gameId],
  }) as SqlResultBoard[];

  const userData = await query({
    text: "SELECT CASE WHEN my.first_move THEN my.player_id ELSE opponent.player_id END AS \"firstPlayer\", \
        my.player_id AS \"playerId\", game.winner, my.player_id AS \"myId\", \
      my.name AS \"myName\", my.tokens AS \"myTokens\", \
      my.turn AS \"myTurn\", opponent.name AS \"opponentName\", \
      opponent.tokens AS \"opponentTokens\", opponent.turn AS \"opponentTurn\" \
      FROM (SELECT game_id, player.id AS player_id, user_account.user_name AS name, tokens, turn, first_move \
      FROM player INNER JOIN user_account ON player.user_id=user_account.id \
      WHERE user_id=$1) AS my INNER JOIN \
      (SELECT game_id, player.id AS player_id, user_account.user_name AS name, tokens, turn FROM player \
        INNER JOIN user_account on player.user_id=user_account.id \
        WHERE user_id!=$2) AS opponent \
        ON my.game_id=opponent.game_id INNER JOIN game on my.game_id=game.id \
        WHERE game.id=$3",
    values: [user.id, user.id, gameId],
  }) as SqlUserData[];

  if (userData.length === 0) {
    return;
  }

  const extraTiles = await query({
    text: "SELECT tile.id AS \"tileId\", letter.id AS \"letterId\", \
      letter.letter_index AS \"letterIndex\", letter.letter FROM tile INNER JOIN player ON \
      player.id=tile.owner_id LEFT JOIN tile_letter_map ON \
      tile.id=tile_letter_map.tile_id LEFT JOIN letter ON tile_letter_map.letter_id=letter.id \
      WHERE player.game_id=$1 AND player.user_id=$2",
    values: [gameId, user.id],
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
