import React from 'react';
import { useStyles } from './styles';

function BlankTile({ width, height }) {
    const styles = useStyles();

    return (
        <div 
            className={styles.tile} 
            style={{ width: width, height: height }}
        ></div>
    );
}

export default BlankTile;