import React from 'react';
import Score from './Score';
import Turn from './Turn';
import { useStyles } from './styles';
import { Container } from '@material-ui/core';
import { Button } from '@material-ui/core';

function ScoreBoard({ players, turn, addTile, endTurn }) {
    const currPlayer = turn ? players[0].name : players[1].name;
    const styles = useStyles();

    return (
        <Container className={styles.container}>
            <Score players={players} />
            <Button
                className={styles.button}
                onClick={addTile}
            >
                Add Tile
            </Button>
            <Turn turn={currPlayer} endTurn={endTurn} />
        </Container>
    );
}

export default ScoreBoard;