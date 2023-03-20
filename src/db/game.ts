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

export type TileType = "Tile" | "Empty" | "Placeholder" | "Extra";

export type Tile = {
  id: string;
  letters: Letter[];
  row: number;
  column: number;
  type: TileType;
};

export type ExtraTile = Omit<Tile, "row" | "column"> & { tileId: string };

export type Letter = {
  id: string;
  letter: string;
  isUsed: boolean;
};

type TileLetterMap = {
  id: string;
  tileId: string;
  letterId: string;
  gameId: string;
};

type SqlTile = [string, number, number, TileType, string];
type SqlLetter = [string, string, boolean, string];
type SqlTileLetterMap = [string, string, string, string];

type SqlResultTile = {
  id: string;
  rowIndex: number;
  columnIndex: number;
  tileType: TileType;
  gameId: string;
};

type SqlResultLetter = Letter & { gameId: string };

// TODO: Replace with data from database.
const TEST_BOARD = test();
const EXTRA_TILES_USER1 = [
  assignExtraTile("", ""),
  assignExtraTile("", ""),
];

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
  const { tiles, letters, tileLetterMap } = setUpBoard(gameId);
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
  tiles.push([uuidv4(), 0, 0, "Placeholder", uuidv4()]);
  tiles.push([uuidv4(), 0, 1, "Empty", uuidv4()]);
  tiles.push([uuidv4(), 0, 2, "Empty", uuidv4()]);
  tiles.push([uuidv4(), 0, 3, "Empty", uuidv4()]);
  tiles.push([uuidv4(), 0, 4, "Empty", uuidv4()]);
  tiles.push([uuidv4(), 0, 5, "Placeholder", uuidv4()]);

  for (let i = 1; i < 5; i++) {
    // First column in the row.
    tiles.push([uuidv4(), i, 0, "Empty", uuidv4()]);
    
    for (let j = 1; j < 5; j++) {
      const randomIndex = Math.floor(Math.random() * tileOptions.length);
      const tileLetters = tileOptions.splice(randomIndex, 1);

      const tileId = uuidv4();
      tiles.push([tileId, i, j, "Tile", gameId]);

      tileLetters[0].split("").forEach(letter => {
        const letterId = uuidv4();
        letters.push([letterId, letter, false, gameId]);
        tileLetterMap.push([uuidv4(), tileId, letterId, gameId]);
      });
    }

    // Last column in the row.
    tiles.push([uuidv4(), i, 5, "Empty", uuidv4()]);
  }

  // The bottom row.
  tiles.push([uuidv4(), 5, 0, "Placeholder", uuidv4()]);
  tiles.push([uuidv4(), 5, 2, "Empty", uuidv4()]);
  tiles.push([uuidv4(), 5, 3, "Empty", uuidv4()]);
  tiles.push([uuidv4(), 5, 4, "Empty", uuidv4()]);
  tiles.push([uuidv4(), 5, 5, "Placeholder", uuidv4()]);

  return {
    tiles: tiles,
    letters: letters,
    tileLetterMap: tileLetterMap,
  };
}

function test() {
  // Create 4x4 grid of tiles.
  const tileOptions = [...TILES];
  const rows: Row[] = [];

  // Row of placeholder, 4 empty, placeholder
  const firstRow: Tile[] = [
    {
      id: uuidv4(),
      letters: [],
      row: 0,
      column: 0,
      type: "Placeholder",
    },
    {
      id: uuidv4(),
      letters: [],
      row: 0,
      column: 1,
      type: "Empty",
    },
    {
      id: uuidv4(),
      letters: [],
      row: 0,
      column: 2,
      type: "Empty",
    },
    {
      id: uuidv4(),
      letters: [],
      row: 0,
      column: 3,
      type: "Empty",
    },
    {
      id: uuidv4(),
      letters: [],
      row: 0,
      column: 4,
      type: "Empty",
    },
    {
      id: uuidv4(),
      letters: [],
      row: 0,
      column: 5,
      type: "Placeholder",
    },
  ];
  rows.push({ id: uuidv4(), tiles: firstRow });

  for (let i = 1; i < 5; i++) {
    const tiles: Tile[] = [
      // First column in the row
      {
        id: uuidv4(),
        letters: [],
        row: i,
        column: 0,
        type: "Empty",
      },
    ];

    for (let j = 1; j < 5; j++) {
      const randomIndex = Math.floor(Math.random() * tileOptions.length);
      const tileLetters = tileOptions.splice(randomIndex, 1);

      const letters = tileLetters[0].split("").map(letter => {
        return {
          id: uuidv4(),
          letter: letter,
          isUsed: false,
        };
      });

      tiles.push({
        id: uuidv4(),
        letters: letters,
        row: i,
        column: j,
        type: "Tile",
      });
    }

    // Last column in the row
    tiles.push({
      id: uuidv4(),
      letters: [],
      row: i,
      column: 5,
      type: "Empty",
    });
    
    rows.push({ id: uuidv4(), tiles });
  }

  // Row of placeholder, 4 empty, placeholder
  const lastRow: Tile[] = [
    {
      id: uuidv4(),
      letters: [],
      row: 5,
      column: 0,
      type: "Placeholder",
    },
    {
      id: uuidv4(),
      letters: [],
      row: 5,
      column: 1,
      type: "Empty",
    },
    {
      id: uuidv4(),
      letters: [],
      row: 5,
      column: 2,
      type: "Empty",
    },
    {
      id: uuidv4(),
      letters: [],
      row: 5,
      column: 3,
      type: "Empty",
    },
    {
      id: uuidv4(),
      letters: [],
      row: 5,
      column: 4,
      type: "Empty",
    },
    {
      id: uuidv4(),
      letters: [],
      row: 5,
      column: 5,
      type: "Placeholder",
    },
  ];
  rows.push({ id: uuidv4(), tiles: lastRow });

  return rows;
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

/*
Database structure for Board:

Tile -> Letter

Need gameId in each table

Tile -> id: string; row: number; column: number; type: Tile | Empty | Placeholder | Extra
Letter -> id: string; letter: string; isClicked: boolean;
TileLetterMap -> id: string; tileId: string; letterId: string;

ExtraTile -> id: string; userId: string; tileId: string;
*/

type TileLocation = Pick<Tile, "row" | "column">;

async function getLocationOfTile(id: string): Promise<TileLocation | undefined> {
  TEST_BOARD.forEach(row => {
    row.tiles.forEach(tile => {
      if (tile.id === id) {
        return { row: tile.row, column: tile.column };
      }
    });
  });

  return undefined;
}

async function getTileAtLocation(row: number, column: number): Promise<Tile | undefined> {
  TEST_BOARD.forEach(r => {
    r.tiles.forEach(tile => {
      if (tile.row === row && tile.column === column) {
        return tile;
      }
    });
  });

  return undefined;
}

async function getExtraTileLetters(id: string) {
  const extraTile = EXTRA_TILES_USER1.find(tile => tile.id === id);
  if (extraTile) {
    return extraTile.letters;
  } else {
    return [];
  }
}

async function updateBoard(locationId: string, extraTileId: string, board: Row[]) {
  const minRow = board[0].tiles[0].row;
  const maxRow = board[-1].tiles[0].row;
  const minColumn = board[0].tiles[0].column;
  const maxColumn = board[0].tiles[-1].column;

  // Get extra tile letters.
  const extraTileLetters = await getExtraTileLetters(extraTileId);

  // Get row and column of `locationId`.
  const locationTile = await getLocationOfTile(locationId);
  if (!locationTile) {
    throw new Error(``);
  }

  const { row, column } = locationTile;
  // Iterate over board.
  const rows: Row[] = [];
  for (let i = Math.min(minRow, row - 1); i < Math.max(maxRow, row + 1); i++) {
    const tiles: Tile[] = [];

    for (let j = Math.min(minColumn, column - 1); j < Math.max(maxColumn, column + 1); j++) {
      const tileAtLocation = await getTileAtLocation(i, j);

      if (tileAtLocation && i === row && j === column) {
        tiles.push({
          id: tileAtLocation.id,
          letters: extraTileLetters,
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

  const letters = tileLetters[0].split("").map(letter => {
    return {
      id: uuidv4(),
      letter: letter,
      isUsed: false,
    };
  });

  return {
    id: uuidv4(),
    letters: letters,
    type: "Tile",
    tileId: "",
  };
}

function convertSqlResultsToBoard(sqlTiles: SqlResultTile[], sqlLetters: SqlResultLetter[], tileLetterMap: TileLetterMap[]) {
  const board: Row[] = [];
  const minRow = Math.min(...sqlTiles.map(t => t.rowIndex));
  const maxRow = Math.max(...sqlTiles.map(t => t.rowIndex));
  const minColumn = Math.min(...sqlTiles.map(t => t.columnIndex));
  const maxColumn = Math.max(...sqlTiles.map(t => t.columnIndex));

  for (let i = minRow; i <= maxRow; i++) {
    const tiles: Tile[] = [];

    for (let j = minColumn; j <= maxColumn; j++) {
      const tile = sqlTiles.find(t => t.rowIndex === i && t.columnIndex === j);
      if (tile) {
        const tileLetters: TileLetterMap[] = tileLetterMap.filter(m => m.tileId === tile.id);
        const letters: Letter[] = [];
        sqlLetters.forEach(l => {
          if (tileLetters.find())
          letters.push()
        });
        //const letters: Letter[] = sqlLetters.filter(l => letterIds.includes(l.id));
        
        tiles.push({
          id: tile.id,
          letters: letters,
          row: tile.rowIndex,
          column: tile.columnIndex,
          type: tile.tileType,
        });
      }
    }

    board.push({ id: uuidv4(), tiles });
  }

  return board;
}

export async function getGame(gameId: string) {
  const tiles = await query({
    sql: `SELECT * FROM Tile WHERE gameId="${gameId}"`,
  }) as SqlResultTile[];
  const letters = await query({
    sql: `SELECT * FROM Letter WHERE gameId="${gameId}"`,
  }) as SqlResultLetter[];
  const tileLetterMap = await query({
    sql: `SELECT * FROM TileLetterMap WHERE gameId="${gameId}"`,
  }) as TileLetterMap[];

  const board = convertSqlResultsToBoard(tiles, letters, tileLetterMap);
  console.log(board);

  return {
    board: TEST_BOARD,
    extraTiles: EXTRA_TILES_USER1,
  };
}
