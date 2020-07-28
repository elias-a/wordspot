import React from 'react';
import { useStyles } from './styles';
import { Button } from '@material-ui/core';

function Letter({ id, letter, placeToken }) {
    const styles = useStyles();

    return (
        <Button 
            className={letter.clicked ? styles.letterClicked : styles.letter}
            onClick={() => placeToken(id)}
        >
            {letter.letter}
        </Button>
    );
}

export default Letter;