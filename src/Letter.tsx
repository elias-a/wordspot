import React from 'react';
import { useStyles } from './styles';
import { Button } from '@material-ui/core';

function Letter(props) {
    const styles = useStyles();
    const letter = props.letter;
    let disabled: boolean = false;
    let style;
    if (letter.clicked) {
        style = styles.letterClicked;
        disabled = true;
    } else if (letter.hasOwnProperty('selected')) {
        style = styles.letterSelected;
    } else {
        style = styles.letter;
    }
    disabled = disabled || props.disabled;

    return (
        <Button 
            className={style}
            disabled={disabled}
            onClick={() => props.placeToken(props.id)}
        >
            {letter.letter}
        </Button>
    );
}

export default Letter;