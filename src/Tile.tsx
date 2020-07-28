import React from 'react';
import { useStyles } from './styles';
import Letter from './Letter';

function Tile({ id, letters, placeToken }) {
    const styles = useStyles();

    return (
        <div className={styles.tile}>
            {letters.map((letter, index) => 
                <Letter 
                    id={id*4+index}
                    letter={letter} 
                    placeToken={placeToken} 
                />
            )}
        </div>
    );
}

export default Tile;