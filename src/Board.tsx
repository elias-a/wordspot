import React, { useState, useEffect } from 'react';
import { useStyles } from './styles';
import Tile from './Tile';
import BlankTile from './BlankTile';
import EmptyTile from './EmptyTile';

function Board({ 
    layout, 
    numRows, 
    numCols, 
    addTileFlag, 
    letters, 
    placeToken,
    moveTile
}) {
    const [board, setBoard] = useState([]);
    const styles = useStyles();
    const width = (100 / numCols - 1).toString() + '%';
    const height = (100 / numRows - 1).toString() + '%';

    useEffect(() => {
        let counter = 0;
        let blankIndex = 0;
        setBoard(layout.map((spot, index: number) => {
            if (spot.key === 2) {
                return <Tile 
                    id={counter}
                    letters={letters[counter++]} 
                    placeToken={placeToken} 
                    width={width}
                    height={height}
                />;
            } else if (spot.key === 1) {
                return <BlankTile 
                    id={blankIndex++}
                    row={spot.row}
                    col={spot.col}
                    moveTile={moveTile}
                    addTileFlag={addTileFlag}
                    width={width} 
                    height={height} 
                />;
            } else {
                return <EmptyTile
                    width={width}
                    height={height}
                />;
            }
        }));
    }, [letters, addTileFlag]);

    return (
        <div className={styles.board}>
            {layout.map((spot, index: number) => {
                return board[index];
            })}
        </div>
    );
}

export default Board;