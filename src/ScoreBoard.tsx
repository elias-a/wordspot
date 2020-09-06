import React from 'react';
import Score from './Score';
import Turn from './Turn';
import ExtraTile from './ExtraTile';
import BlankTile from './BlankTile';
import { useStyles } from './styles';
import { Container } from '@material-ui/core';
import { Button } from '@material-ui/core';

function ScoreBoard({ 
    players, 
    tokens, 
    turn, 
    extraTiles, 
    addTile, 
    endTurn, 
    moveTile 
}) {
    const currPlayer = turn ? players[0].name : players[1].name;
    const disabled = extraTiles.length ? false : true;
    const styles = useStyles();

    return (
        <Container>
            <Score players={players} tokens={tokens} />
            {extraTiles.map((extraTile, index: number) => {
                if (extraTile.length > 0) {
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
                } else {
                    return <BlankTile 
                        id={index}
                        row={null} 
                        col={null} 
                        moveTile={moveTile}
                        addTileFlag={true}
                        width={'200px'} 
                        height={'200px'}
                        />
                }
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