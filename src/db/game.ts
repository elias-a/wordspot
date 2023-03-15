import { v4 as uuidv4 } from "uuid";

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

export const BOARD_WIDTH = 900;
export const BOARD_HEIGHT = 700;

export type Layout = {
  id: string;
  rows: Row[];
};

export type Row = {
  id: string;
  tiles: Tile[];
};

export type Tile = {
  id: string;
  letters: Letter[];
  row: number;
  column: number;
};

export type Letter = {
  id: string;
  letter: string;
};

export type TileType = "Tile" | "Empty" | "Placeholder";

// TODO: Replace with data from database.
const TEST_BOARD = setUpBoard();

function setUpBoard() {
  // Create 4x4 grid of tiles.
  const tileOptions = [...TILES];
  const rows: Row[] = [];
  for (let i = 0; i < 4; i++) {
    const tiles: Tile[] = [];

    for (let j = 0; j < 4; j++) {
      const randomIndex = Math.floor(Math.random() * tileOptions.length);
      const tileLetters = tileOptions.splice(randomIndex, 1);

      const letters = tileLetters[0].split("").map(letter => {
        return {
          id: uuidv4(),
          letter: letter,
        };
      });

      tiles.push({
        id: uuidv4(),
        letters: letters,
        row: i,
        column: j,
      });
    }

    rows.push({ id: uuidv4(), tiles });
  }

  return rows;
}

// Checks if location is a valid spot to add a tile.
async function checkNeighbors(row: number, col: number) {
  const right = INITIAL_BOARD_LAYOUT.find(t => t.row === row && t.col === col + 1);
  const left = INITIAL_BOARD_LAYOUT.find(t => t.row === row && t.col === col - 1);
  const above = INITIAL_BOARD_LAYOUT.find(t => t.row === row + 1 && t.col === col);
  const below = INITIAL_BOARD_LAYOUT.find(t => t.row === row - 1 && t.col === col);

  if (right || left || above || below) return true;
  else return false;
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

type TileLocation = Pick<Tile, "row" | "column">

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

async function getTileAtLocation(row: number, column: number) {

}

async function updateBoard(locationId: string, extraTileId: string) {
  const minRow = TEST_BOARD[0].tiles[0].row;
  const maxRow = TEST_BOARD[-1].tiles[0].row;
  const minColumn = TEST_BOARD[0].tiles[0].column;
  const maxColumn = TEST_BOARD[0].tiles[-1].column;

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
      // Query database for tiles at (i, j).
      // - If type of tile is Tile, push to `tiles`.
      // - If (i, j) == (row, column), push to `tiles`.
      // - If checkNeighbors(i, j) == true, push Empty to `tiles`.
      // - If checkNeighbors(i, j) == false, push Placeholder to `tiles`.
    }

    rows.push({ id: uuidv4(), tiles });
  }

  // In database, update Tile at (row, col) from Extra -> Tile.
  // Update the 4 entries in TileLetterMap where `tileId` = `extraTileId`.
  // Change `tileId` to the ID of the Tile at (row, col). 
  // Delete entries associated with `extraTileId`.


  
}

async function createLayout() {
  const minIndex = TEST_BOARD[0].tiles[0].row;
  const maxIndex = TEST_BOARD[-1].tiles[0].row;

  const layout: Layout = {
    id: uuidv4(),
    rows: [],
  }

  let layoutId = 0;
  let index = 0;
  for (let row = minRow - 1; row <= maxRow + 1; ++row) {
    for (let col = minColumn - 1; col <= maxColumn + 1; ++col) {
      // Replace with DB call.
      const tile = INITIAL_BOARD_LAYOUT.find(t => t.row === row && t.col === col);

      // 4: Extra tile is currently added here
      // 2: tile
      // 1: valid spot to add tile
      // 0: placeholder spot

      if (tile) {
        layout.push({
          id: layoutId++,
          key: 2,
          row: row,
          col: col,
          index: index++,
          tile: tile.tile,
        });
      } else if (await checkNeighbors(row, col)) {
        layout.push({
          id: layoutId++,
          key: 1,
          row: row,
          col: col,
          index: index,
          tile: undefined,
        });
      } else {
        layout.push({
          id: layoutId++,
          key: 0,
          row: row,
          col: col,
          index: index,
          tile: undefined,
        });
      }
    }
  }

  return layout;
}

function getTileDimensions(numRows: number, numCols: number) {
  const dimensions: TileDimensions = {
    width: BOARD_WIDTH / numCols - numCols,
    height: BOARD_HEIGHT / numRows - numRows,
  };
  return dimensions;
}

export type UserData = {
  extraTiles: Tile[];
};

function getUserData(): UserData {
  const extraTiles: Tile[] = [
    { id: 0, letters: TILES[20].split("").map((t, i) => { return { id: i, letter: t } }) }
  ];

  return { extraTiles };
}

export async function getBoardLayout() {
  const { layout, numRows, numCols } = await createBoardLayout();
  const dimensions = getTileDimensions(numRows, numCols);
  const userData = getUserData();

  return { layout, dimensions, userData };
}
