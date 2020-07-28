import React from 'react';
import { useStyles } from './styles';
import Letter from './Letter';

function Tile({ id, letters, clicked, placeToken }) {
    const styles = useStyles();
    const clickedArr = clicked.split('').map(letter => parseInt(letter));
    console.log(clickedArr)

    return (
        <div className={styles.tile}>
            {letters.split('').map((letter, index) => 
                <Letter 
                    id={id*4+index}
                    letter={letter} 
                    clicked={clickedArr[index]} 
                    placeToken={placeToken} 
                />
            )}
        </div>
    );
}

export default Tile;