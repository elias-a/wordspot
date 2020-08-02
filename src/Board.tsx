import React, { useState, useEffect } from 'react';
import { useStyles } from './styles';
import Tile from './Tile';
import BlankTile from './BlankTile';

function Board({ layout, numRows, numCols, addTileFlag, letters, placeToken }) {
    const [board, setBoard] = useState([]);
    const styles = useStyles();
    const width = (100 / numCols - 1).toString() + '%';
    const height = (100 / numRows - 1).toString() + '%';

    useEffect(() => {
        let counter = 0;
        setBoard(layout.map((spot: boolean, index: number) => {
            if (spot) {
                return <Tile 
                    id={counter}
                    letters={letters[counter++]} 
                    placeToken={placeToken} 
                    width={width}
                    height={height}
                />;
            } else {
                return <BlankTile 
                    addTileFlag={addTileFlag}
                    width={width} 
                    height={height} 
                />;
            }
        }));
    }, [letters, addTileFlag]);

    return (
        <div className={styles.board}>
            {layout.map((spot: boolean, index: number) => {
                return board[index];
            })}
        </div>
    );
}

export default Board;
