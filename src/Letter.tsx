import React from 'react';
import { useStyles } from './styles';
import { Button } from '@material-ui/core';

function Letter({ id, letter, clicked, placeToken }) {
    const styles = useStyles();

    return (
        <Button 
            className={clicked ? styles.letterClicked : styles.letter}
            onClick={() => placeToken(id)}
        >
            {letter}
        </Button>
    );
}

export default Letter;