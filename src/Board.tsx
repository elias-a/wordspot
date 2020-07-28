import React from 'react';
import { useStyles } from './styles';
import Tile from './Tile';

function Board({ tiles, letters, placeToken }) {
    const styles = useStyles();

    return (
        <div className={styles.board}>
            {tiles.map((tile, index) => {
                return (
                    <Tile 
                        id={index}
                        letters={letters[index]} 
                        placeToken={placeToken} 
                    />
                );
            })}
        </div>
    );
}

export default Board;