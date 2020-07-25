import React, { useState, useEffect } from 'react';
import { useStyles } from './styles';
import Letter from './Letter';

function Tile({ letters }) {
    const styles = useStyles();

    return (
        <div className={styles.tile}>
            {letters.split('').map(letter => <Letter letter={letter} />)}
        </div>
    );
}

export default Tile;