import React from 'react';
import Score from './Score';
import Turn from './Turn';
import ExtraTile from './ExtraTile';
import { useStyles } from './styles';
import { Container } from '@material-ui/core';
import { Button } from '@material-ui/core';

function ScoreBoard({ players, turn, extraTiles, addTile, endTurn }) {
    const currPlayer = turn ? players[0].name : players[1].name;
    const currExtraTiles = turn ? extraTiles[0] : extraTiles[1];
    const disabled = currExtraTiles.length ? false : true;
    const styles = useStyles();

    return (
        <Container className={styles.container}>
            <Score players={players} />
            {currExtraTiles.map((extraTile, index: number) => {
                return <ExtraTile 
                            id={index}
                            letters={extraTile}
                        />;
            })}
            <Button
                className={styles.button}
                onClick={addTile}
                disabled={disabled}
            >
                Add Tile
            </Button>
            <Turn turn={currPlayer} endTurn={endTurn} />
        </Container>
    );
}

export default ScoreBoard;