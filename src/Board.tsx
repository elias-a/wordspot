import React from 'react';
import { useStyles } from './styles';
import Tile from './Tile';

function Board({ tiles }) {
    const styles = useStyles();

    return (
        <div className={styles.board}>
            {tiles.map(tile => {
                return (
                    <Tile letters={tile.letters} />
                );
            })}
        </div>
    );
}

export default Board;