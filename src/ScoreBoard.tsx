import React from 'react';
import Score from './Score';
import Turn from './Turn';
import ExtraTile from './ExtraTile';
import { useStyles } from './styles';
import { Container } from '@material-ui/core';
import { Button } from '@material-ui/core';

function ScoreBoard({ players, tokens, turn, extraTiles, addTile, endTurn }) {
    const currPlayer = turn ? players[0].name : players[1].name;
    const disabled = extraTiles.length ? false : true;
    const styles = useStyles();

    return (
        <Container>
            <Score players={players} tokens={tokens} />
            {extraTiles.map((extraTile, index: number) => {
                // Note that the `clicked` prop of each element of 
                // extraTile is undefined. 
                return <ExtraTile 
                            id={index}
                            letters={extraTile}
                            width={'200px'}
                            height={'200px'}
                            disabled={true}
                            placeToken={() => {}}
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