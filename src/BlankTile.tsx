import React from 'react';
import { useStyles } from './styles';

function BlankTile({ addTileFlag, width, height }) {
    const styles = useStyles();

    return (
        <div 
            className={addTileFlag ? styles.tile : styles.blankTile } 
            style={{ width: width, height: height }}
        ></div>
    );
}

export default BlankTile;