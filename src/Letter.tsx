import React from 'react';
import { useStyles } from './styles';
import { Button } from '@material-ui/core';

function Letter(props) {
    const styles = useStyles();
    const letter = props.letter;
    let style;
    if (letter.hasOwnProperty('used')) {
        style = styles.letterUsed;
    } else if (letter.hasOwnProperty('selected')) {
        style = styles.letterSelected;
    } else if (letter.clicked) {
        style = styles.letterClicked;
    } else {
        style = styles.letter;
    }

    return (
        <Button 
            className={style}
            disabled={props.disabled}
            onClick={() => props.placeToken(props.id)}
            style={{ 
                minWidth: '50%',
                maxWidth: '50%',
                minHeight: '50%',
                maxHeight: '50%'
            }}
        >
            {letter.letter}
        </Button>
    );
}

export default Letter;