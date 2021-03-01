import React from 'react';
import { Button } from '@material-ui/core';
import { formatApostrophe } from '../helpers';
import { useStyles } from '../styles';

function Turn({ players, player, turn, endTurn, disabled }) {
    const styles = useStyles();

    let currTurn = null;
    if (turn) {
        currTurn = player === players[0].name
            ? <h3 className={styles.turn}>
                {'Your turn!'}
            </h3> : <h3 className={styles.turn}>
                {formatApostrophe(players[0].name) + ' turn!'}
            </h3>;
    } else {
        currTurn = player === players[1].name 
            ? <h3 className={styles.turn}>
                {'Your turn!'}
            </h3>
            : <h3 className={styles.turn}>
                {formatApostrophe(players[1].name) + ' turn!'}
            </h3>;
    }              

    return (
        <div>
            {currTurn}

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