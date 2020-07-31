import React from 'react';
import { useStyles } from './styles';
import Tile from './Tile';
import BlankTile from './BlankTile';

function Board({ layout, numRows, numCols, letters, placeToken }) {
    const styles = useStyles();
    const width = (100 / numCols - 1).toString() + '%';
    const height = (100 / numRows - 1).toString() + '%';

    return (
        <div className={styles.board}>
            {layout.map((spot, index) => {
                const tile = 
                    <Tile 
                        id={index}
                        letters={letters[index]} 
                        placeToken={placeToken} 
                        width={width}
                        height={height}
                    />;

                const blankTile = 
                    <BlankTile 
                        width={width} 
                        height={height} 
                    />;
                    
                if (tile) return tile;
                else return blankTile;
            })}
        </div>
    );
}

export default Board;