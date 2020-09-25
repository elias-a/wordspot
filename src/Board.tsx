import React, { useState, useEffect } from 'react';
import { useStyles } from './styles';
import Tile from './Tile';
import BlankTile from './BlankTile';
import EmptyTile from './EmptyTile';
import ExtraTile from './ExtraTile';

function Board({ 
    disabled,
    turn,
    layout, 
    width,
    height,
    addTileFlag, 
    letters, 
    extraTile,
    placeToken,
    moveTile
}) {
    const [board, setBoard] = useState([]);
    const styles = useStyles();

    useEffect(() => {
        let blankIndex = 0;
        setBoard(layout.map((spot) => {
            if (spot.key === 2) {
                const tile = letters.find(tile => {
                    return tile[0].tile === spot.tile;
                });
                return <Tile 
                    id={spot.tile - 1}
                    letters={tile}
                    placeToken={placeToken} 
                    width={width}
                    height={height}
                    disabled={disabled}
                />;
            } else if (spot.key === 1) {
                return <BlankTile 
                    id={blankIndex++}
                    row={spot.row}
                    col={spot.col}
                    moveTile={moveTile}
                    addTileFlag={addTileFlag}
                    width={width} 
                    height={height} 
                />;
            } else if (spot.key === 4) {
                const extraLetters = extraTile.map((extraLetter, index: number) => {
                    let obj: any = {
                        id: letters.length * 4 + index,
                        letter: extraLetter.letter,
                        tile: letters.length + 1,
                        index: index,
                        clicked: extraLetter.clicked
                    };
                    if (extraLetter.hasOwnProperty('selected')) obj.selected = true;
                    return obj;
                });

                return <ExtraTile
                    id={extraTile[0].id} 
                    tileId={letters.length}
                    letters={extraLetters}
                    width={width}
                    height={height}
                    disabled={false}
                    placeToken={placeToken} 
                />;
            } else {
                return <EmptyTile
                    width={width}
                    height={height}
                />;
            }
        }));
    }, [letters, addTileFlag, turn, extraTile]);

    return (
        <div className={styles.board}>
            {layout.map((_spot, index: number) => {
                return board[index];
            })}
        </div>
    );
}

export default Board;