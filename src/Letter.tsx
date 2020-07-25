import React from 'react';
import { useStyles } from './styles';
import { Button } from '@material-ui/core';

function Letter({ letter }) {
    const styles = useStyles();

    return (
        <Button className={styles.letter}>
            {letter}
        </Button>
    );
}

export default Letter;