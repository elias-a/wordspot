import React from 'react';
import Score from './Score';
import Turn from './Turn';
import ExtraTile from './ExtraTile';
import BlankTile from './BlankTile';
import { useStyles } from '../styles';
import { Button } from '@material-ui/core';

function ScoreBoard({ 
    disabled,
    players, 
    tokens, 
    turn, 
    width,
    height,
    extraTiles, 
    addTile, 
    endTurn, 
    moveTile 
}) {
    const currPlayer = turn ? players[0].name : players[1].name;
    const addTileDisabled = extraTiles.length ? false : true;
    const styles = useStyles();

    // Convert width and height to pixels.
    // Assumes the width and height of the board is 800px.
    width = (800 * parseFloat(width) / 100).toString() + 'px';
    height = (800 * parseFloat(height) / 100).toString() + 'px';

    return (
        <React.Fragment>
            <Score players={players} tokens={tokens} />
             {extraTiles.map((extraTile, index: number) => {
                if (extraTile.length > 0) {
                    // Note that the `clicked` prop of each element of 
                    // extraTile is undefined. 
                    return <ExtraTile 
                            id={index}
                            tileId={index}
                            letters={extraTile}
                            width={width}
                            height={height}
                            disabled={true}
                            placeToken={() => {}}
                        />;
                } else {
                    // Negative id indicates this blank
                    // tile is on the scoreboard. 
                    return <BlankTile 
                            id={-index-1}
                            row={null} 
                            col={null} 
                            moveTile={moveTile}
                            addTileFlag={true}
                            width={width} 
                            height={height}
                        />;
                }
            })}
            <Button
                className={styles.button}
                onClick={addTile}
                disabled={addTileDisabled || disabled}
            >
                Add Tile
            </Button>
            <Turn turn={currPlayer} endTurn={endTurn} disabled={disabled} />
        </React.Fragment>
    );
}

export default ScoreBoard;