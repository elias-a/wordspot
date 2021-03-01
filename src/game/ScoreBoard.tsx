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
    player,
    tokens, 
    turn, 
    width,
    height,
    extraTiles, 
    addTileFlag,
    addTile, 
    endTurn, 
    moveTile 
}) {
    const currPlayer = turn ? players[0].name : players[1].name;
    const addTileDisabled = extraTiles.length ? false : true;
    const styles = useStyles();

    width = '125px';
    height = '125px';

    return (
        <React.Fragment>
            <Score players={players} tokens={tokens} />
            <div className={styles.extraTileContainer}>
                {extraTiles.map((extraTile, index: number) => {
                    if (extraTile.hasOwnProperty('letters')) {
                        const letters = extraTile.letters.split('')
                            .map((letter: string, j: number) => {
                                return {
                                    tile: -index-1,
                                    letter: letter,
                                    clicked: 0,
                                    index: j
                                };
                            });

                        // Note that the `clicked` prop of each element of 
                        // extraTile is undefined. 
                        // Negative tileId indicates this extra
                        // tile is on the scoreboard.
                        return <ExtraTile 
                            id={index}
                            tileId={-index-1}
                            letters={letters}
                            width={width}
                            height={height}
                            disabled={true}
                            canDrag={addTileFlag && !disabled}
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
                            addTileFlag={false}
                            width={width} 
                            height={height}
                        />;
                    }
                })}
            </div>
            <Button
                className={styles.button}
                onClick={addTile}
                disabled={addTileDisabled || disabled}
            >
                Add Tile
            </Button>
            <Turn 
                players={players}
                player={player}
                turn={turn}
                endTurn={endTurn} 
                disabled={disabled} 
            />
        </React.Fragment>
    );
}

export default ScoreBoard;