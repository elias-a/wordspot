import React, { useRef } from 'react';
import { useStyles } from '../styles';
import Letter from './Letter';

function Tile({ 
    id, 
    letters, 
    placeToken, 
    width, 
    height,
    disabled
}) {
    const styles = useStyles();

    return (
        <div 
            className={styles.tile} 
            style={{ width: width, height: height }}
        >
            {letters.map((letter, index: number) => 
                <Letter 
                    id={id*4+index}
                    letter={letter} 
                    placeToken={placeToken} 
                    disabled={disabled}
                />
            )}
        </div>
    );
}

export default Tile;