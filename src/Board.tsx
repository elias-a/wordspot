import React, { useState, useEffect } from 'react';
import { useStyles } from './styles';
import Tile from './Tile';
import BlankTile from './BlankTile';

function Board({ layout, numRows, numCols, letters, placeToken }) {
    const [board, setBoard] = useState([]);
    const styles = useStyles();
    const width = (100 / numCols - 1).toString() + '%';
    const height = (100 / numRows - 1).toString() + '%';

    useEffect(() => {
        let counter = 0;
        setBoard(layout.map((spot: boolean, index: number) => {
            const tile = 
                <Tile 
                    id={counter}
                    letters={letters[counter]} 
                    placeToken={placeToken} 
                    width={width}
                    height={height}
                />;

            const blankTile = 
                <BlankTile 
                    width={width} 
                    height={height} 
                />;

            if (spot) return tile;
            else return blankTile;
        }));
    }, []);

    return (
        <div className={styles.board}>
            {layout.map((spot: boolean, index: number) => {
                return board[index];
            })}
        </div>
    );
}

export default Board;