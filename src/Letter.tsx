import React from 'react';
import { useStyles } from './styles';
import { Button } from '@material-ui/core';

function Letter({ id, letter, placeToken }) {
    const styles = useStyles();
    let style;
    if (letter.clicked) {
        style = styles.letterClicked;
    } else if (letter.hasOwnProperty('selected')) {
        style = styles.letterSelected;
    } else {
        style = styles.letter;
    }

    return (
        <Button 
            className={style}
            onClick={() => placeToken(id)}
        >
            {letter.letter}
        </Button>
    );
}

export default Letter;