import mysql from "mysql2";
import { v4 as uuidv4 } from "uuid";

const connection = mysql.createConnection("mysql://ormkapdroodwtjvx35sc:pscale_pw_655L4RXc6qup888N48dlfSxRllUtBx3HnaZsgFo4yd2@us-east.connect.psdb.cloud/wordspot?ssl={'rejectUnauthorized':true}");

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

export type TileType = "Tile" | "Empty" | "Placeholder";

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

// TODO: Replace with data from database.
const TEST_BOARD = setUpBoard();
const EXTRA_TILES_USER1 = [
  assignExtraTile("", ""),
  assignExtraTile("", ""),
];

export async function startGame() {
  const board = setUpBoard();
  await writeBoardToDatabase(board);
}

async function writeBoardToDatabase(board: Row[]) {
  connection.query(`INSERT INTO Letter VALUES ("1", "A", 0);`)
}

function setUpBoard() {
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

export async function getGame() {
  await startGame();
  return {
    board: TEST_BOARD,
    extraTiles: EXTRA_TILES_USER1,
  };
}
