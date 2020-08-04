import React from 'react';
import { useStyles } from './styles';

function EmptyTile({ width, height }) {
    const styles = useStyles();

    return (
        <div 
            className={styles.emptyTile} 
            style={{ width: width, height: height }}
        ></div>
    );
}

export default EmptyTile;