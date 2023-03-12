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
  "RAIB", "BOUT"
];

export const BOARD_WIDTH = 900;
export const BOARD_HEIGHT = 700;

export type TileLocation = {
  key: number;
  row: number;
  col: number;
  index: number;
  tile: number | undefined;
};

export type TileDimensions = {
  width: number;
  height: number;
};

const INITIAL_BOARD_LAYOUT: TileLocation[] = [
  { key: 2, row: 0, col: 0, index: 0, tile: 0 },
  { key: 2, row: 0, col: 1, index: 1, tile: 1 },
  { key: 2, row: 0, col: 2, index: 2, tile: 2 },
  { key: 2, row: 0, col: 3, index: 3, tile: 3 },
  { key: 2, row: 1, col: 0, index: 4, tile: 4 },
  { key: 2, row: 1, col: 1, index: 5, tile: 5 },
  { key: 2, row: 1, col: 2, index: 6, tile: 6 },
  { key: 2, row: 1, col: 3, index: 7, tile: 7 },
  { key: 2, row: 2, col: 0, index: 8, tile: 8 },
  { key: 2, row: 2, col: 1, index: 9, tile: 9 },
  { key: 2, row: 2, col: 2, index: 10, tile: 10 },
  { key: 2, row: 2, col: 3, index: 11, tile: 11 },
  { key: 2, row: 3, col: 0, index: 12, tile: 12 },
  { key: 2, row: 3, col: 1, index: 13, tile: 13 },
  { key: 2, row: 3, col: 2, index: 14, tile: 14 },
  { key: 2, row: 3, col: 3, index: 15, tile: 15 },
  { key: 2, row: 4, col: 3, index: 16, tile: 16 },
];

// Checks if location is a valid spot to add a tile.
async function checkNeighbors(row: number, col: number) {
  const right = INITIAL_BOARD_LAYOUT.find(t => t.row === row && t.col === col + 1);
  const left = INITIAL_BOARD_LAYOUT.find(t => t.row === row && t.col === col - 1);
  const above = INITIAL_BOARD_LAYOUT.find(t => t.row === row + 1 && t.col === col);
  const below = INITIAL_BOARD_LAYOUT.find(t => t.row === row - 1 && t.col === col);

  if (right || left || above || below) return true;
  else return false;
}

async function createBoardLayout() {
  const minRow = Math.min(...INITIAL_BOARD_LAYOUT.map(t => t.row));
  const maxRow = Math.max(...INITIAL_BOARD_LAYOUT.map(t => t.row));
  const minColumn = Math.min(...INITIAL_BOARD_LAYOUT.map(t => t.col));
  const maxColumn = Math.max(...INITIAL_BOARD_LAYOUT.map(t => t.col));

  const layout: TileLocation[] = [];
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
          key: 2,
          row: row,
          col: col,
          index: index++,
          tile: tile.tile,
        });
      } else if (await checkNeighbors(row, col)) {
        layout.push({
          key: 1,
          row: row,
          col: col,
          index: index,
          tile: undefined,
        });
      } else {
        layout.push({
          key: 0,
          row: row,
          col: col,
          index: index,
          tile: undefined,
        });
      }
    }
  }

  return {
    layout,
    numRows: maxRow - minRow + 3,
    numCols: maxColumn - minColumn + 3,
  };
}

export function getTileDimensions(numRows: number, numCols: number) {
  const dimensions: TileDimensions = {
    width: BOARD_WIDTH / numCols - numCols,
    height: BOARD_HEIGHT / numRows - numRows,
  };
  return dimensions;
}

export async function getBoardLayout() {
  const { layout, numRows, numCols } = await createBoardLayout();
  const dimensions = getTileDimensions(numRows, numCols);

  return { layout, dimensions };
}
