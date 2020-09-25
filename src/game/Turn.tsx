import React from 'react';
import { Button } from '@material-ui/core';
import { useStyles } from '../styles';

function Turn({ turn, endTurn, disabled }) {
    const styles = useStyles();

    return (
        <div>
            <h3 className={styles.turn}>{turn}'s Turn!</h3>

            <Button
                className={styles.button}
                onClick={endTurn}
                disabled={disabled}
            >
                End Turn
            </Button>
        </div>
    );
}

export default Turn;