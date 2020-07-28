import React from 'react';
import { useStyles } from './styles';
import Tile from './Tile';

function Board({ tiles, placeToken }) {
    const styles = useStyles();

    return (
        <div className={styles.board}>
            {tiles.map((tile, index) => {
                return (
                    <Tile 
                        id={index}
                        letters={tile.letters} 
                        clicked={tile.clicked}
                        placeToken={placeToken} 
                    />
                );
            })}
        </div>
    );
}

export default Board;