import { redirect } from "solid-start/server";
import mysql from "mysql2";
import { v4 as uuidv4 } from "uuid";
import { promisify } from "util";

const connection = mysql.createConnection(import.meta.env.VITE_DATABASE_CONNECTION);
const query = promisify(connection.query).bind(connection);

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

export type ExtraTile = Omit<Tile, "row" | "column"> & { tileId: string };
export type PlacedExtraTile = Tile & { tileId: string };

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

export async function getGames(request: Request) {
  
}

export async function startGame(request: Request) {
  // Create game.
  const gameId = uuidv4();
  await query({
    sql: "INSERT INTO Game VALUES (?, ?, ?, ?)",
    values: [
      gameId,
      import.meta.env.VITE_USER1,
      import.meta.env.VITE_USER2,
      null,
    ],
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

// Checks if location is a valid spot to add a tile.
function checkNeighbors(row: number, column: number, board: Row[]) {
  board.forEach(r => {
    r.tiles.forEach(tile => {
      if (
        tile.row === row && tile.column === column + 1 ||
        tile.row === row && tile.column === column - 1 ||
        tile.row === row + 1 && tile.column === column ||
        tile.row === row - 1 && tile.column === column
      ) {
        return true;
      }
    });
  });

  return false;
}

async function getTileAtLocation(row: number, column: number, board: Row[]): Promise<Tile | undefined> {
  board.forEach(r => {
    r.tiles.forEach(tile => {
      if (tile.row === row && tile.column === column) {
        return tile;
      }
    });
  });

  return undefined;
}

export async function updateBoard(gameId: string, extraTile: PlacedExtraTile | undefined, board: Row[]) {    
  const minRow = extraTile
    ? Math.min(board[0].tiles[0].row, extraTile.row - 1)
    : board[0].tiles[0].row;
  const maxRow = extraTile
    ? Math.max(board[board.length - 1].tiles[0].row, extraTile.row + 1)
    : board[board.length - 1].tiles[0].row;
  const minColumn = extraTile
    ? Math.min(board[0].tiles[0].column, extraTile.column - 1)
    : board[0].tiles[0].column;
  const maxColumn = extraTile
    ? Math.max(board[0].tiles[board[0].tiles.length - 1].column, extraTile.column + 1)
    : board[0].tiles[board[0].tiles.length - 1].column;

  // Iterate over board.
  const rows: Row[] = [];
  for (let i = minRow; i <= maxRow; i++) {
    const tiles: Tile[] = [];

    for (let j = minColumn; j <= maxColumn; j++) {
      const tileAtLocation = await getTileAtLocation(i, j, board);

      if (
        extraTile &&
        tileAtLocation &&
        i === extraTile.row &&
        j === extraTile.column
      ) {
        tiles.push({
          id: tileAtLocation.id,
          letters: extraTile.letters,
          row: i,
          column: j,
          type: "Tile",
        });
      } else if (tileAtLocation && tileAtLocation.type === "Tile") {
        tiles.push({
          id: tileAtLocation.id,
          letters: tileAtLocation.letters,
          row: i,
          column: j,
          type: "Tile",
        });
      } else if (checkNeighbors(i, j, board)) {
        tiles.push({
          id: tileAtLocation ? tileAtLocation.id : uuidv4(),
          letters: [],
          row: i,
          column: j,
          type: "Empty",
        });
      } else {
        tiles.push({
          id: tileAtLocation ? tileAtLocation.id : uuidv4(),
          letters: [],
          row: i,
          column: j,
          type: "Placeholder",
        });
      }
    }

    rows.push({ id: uuidv4(), tiles });
  }

  // In database, update Tile at (row, col) from Extra -> Tile.
  // Update the 4 entries in TileLetterMap where `tileId` = `extraTileId`.
  // Change `tileId` to the ID of the Tile at (row, col). 
  // Delete entries associated with `extraTileId`.


  
}

function assignExtraTile(gameId: string, userId: string): ExtraTile {
  // Instead of this, check database for tiles available in the game.
  const tileOptions = [...TILES];
  const randomIndex = Math.floor(Math.random() * tileOptions.length);
  const tileLetters = tileOptions.splice(randomIndex, 1);

  const letters = tileLetters[0].split("").map((letter, letterIndex) => {
    return {
      id: uuidv4(),
      letterIndex: letterIndex,
      letter: letter,
      isUsed: false,
    };
  });

  return {
    id: uuidv4(),
    letters: letters,
    type: "Extra",
    tileId: "",
  };
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
      } else if (tileType === "Extra" && sqlLetters.length === 4) {
        // TODO: Process extra tiles.
      } else {
        throw new Error(`Incorrect data.`);
      }
    }

    board.push({ id: uuidv4(), tiles });
  }

  const extraTiles: ExtraTile[] = [];

  return { board, extraTiles };
}

export async function getGame(gameId: string) {
  const tiles = await query({
    sql: `SELECT Tile.id AS tileId, Tile.rowIndex, Tile.columnIndex, \
      Tile.tileType, Letter.id AS letterId, Letter.letterIndex, \
      Letter.letter, Letter.isUsed FROM Tile LEFT JOIN \
      TileLetterMap ON Tile.id=TileLetterMap.tileId LEFT JOIN Letter \
      ON TileLetterMap.letterId=Letter.id WHERE Tile.tileType != "Option" \
      AND Tile.gameId="${gameId}"`,
  }) as SqlResultBoard[];

  return convertSqlResultsToBoard(tiles);
}
