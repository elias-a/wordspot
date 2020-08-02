import React from 'react';
import { useStyles } from './styles';
import { Button } from '@material-ui/core';

function ExtraTile({ id, letters }) {
    const styles = useStyles();

    return (
        <div className={styles.extraTile}>
            {letters.map((letter, index) => 
                <Button className={styles.letter} disabled>
                    {letter.letter}
                </Button>
            )}
        </div>
    );
}

export default ExtraTile;