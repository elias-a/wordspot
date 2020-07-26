import React from 'react';
import { useStyles } from './styles';
import Letter from './Letter';

function Tile({ letters, clicked, placeToken }) {
    const styles = useStyles();
    const clickedArr = clicked.split('').map(letter => parseInt(letter));

    return (
        <div className={styles.tile}>
            {letters.split('').map((letter, index) => 
                <Letter 
                    letter={letter} 
                    clicked={clickedArr[index]} 
                    placeToken={placeToken} 
                />
            )}
        </div>
    );
}

export default Tile;