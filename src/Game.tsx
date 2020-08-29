import React, { useState, useEffect } from 'react';
import Board from './Board';
import ScoreBoard from './ScoreBoard';
import axios from 'axios';
import { cloneDeep } from 'lodash';
import { Grid } from '@material-ui/core';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useStyles } from './styles';

function Game() {
    const [layout, setLayout] = useState([]);
    const [tiles, setTiles] = useState([]);
    const [numRows, setNumRows] = useState(0);
    const [numCols, setNumCols] = useState(0);
    const [letters, setLetters] = useState([]);
    const [selected, setSelected] = useState([]);
    const [players, setPlayers] = useState([]);
    const [turn, setTurn] = useState(true);
    const [tokens, setTokens] = useState([]);
    const [extraTiles, setExtraTiles] = useState([]);
    const [currExtraTiles, setCurrExtraTiles] = useState([]);
    const [boardExtraTiles, setBoardExtraTiles] = useState([[], []]);
    const [addTileFlag, setAddTileFlag] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const styles = useStyles();

    useEffect(() => {
        axios.get('/api/get-game-details').then(res => {
            setLayout(res.data.layout);
            setTiles(res.data.tiles);
            setNumRows(res.data.numRows);
            setNumCols(res.data.numCols);
            setLetters(res.data.letters);
            setExtraTiles(res.data.extraTiles);
            setCurrExtraTiles(res.data.extraTiles);

            const players = res.data.players;
            setPlayers(players);
            
            const turn = players[0].turn ? true : false;
            setTurn(turn);

            const tokens = [players[0].tokens, players[1].tokens];
            setTokens(tokens);

            setError("");
        }).catch(err => {
            setError(err);
        }).then(() => {
            setLoading(false);
        });
    }, []);

    function placeToken(id: number) {
        if (id > letters.length * 4) {
            let newBoardExtraTiles = cloneDeep(boardExtraTiles);
            const letter = id % 4;

            let tmp = turn ? newBoardExtraTiles[0] : newBoardExtraTiles[1];
            // Only consider case of 1 extra tile
            const isSelected = tmp[0][letter].hasOwnProperty('selected');
            if (isSelected) {
                delete tmp[0][letter].selected;
            } else {
                tmp[0][letter].selected = true;
            }
            setBoardExtraTiles(newBoardExtraTiles);
        } else {
            const tile = Math.floor(id / 4);
            const letter = id % 4;
            const isSelected = letters[tile][letter].hasOwnProperty('selected');
    
            let newLetters = cloneDeep(letters);
            if (isSelected) {
                delete newLetters[tile][letter].selected;
            } else {
                newLetters[tile][letter].selected = true;
            }
            setLetters(newLetters);
    
            let newTokens = cloneDeep(tokens);
            if (turn) {
                isSelected ? ++newTokens[0] : --newTokens[0];
            } else {
                isSelected ? ++newTokens[1] : --newTokens[1];
            }
            setTokens(newTokens);
        }
    }
    
    const moveTile = ({
        extraTile,
        hoverRow, 
        hoverCol
    }) => {
        let newLayout = cloneDeep(layout);
        let newExtraTiles = cloneDeep(currExtraTiles);
        let newBoardExtraTiles = [[], []];

        const tile = newLayout.findIndex(spot => spot.row === hoverRow && spot.col === hoverCol);
        newLayout[tile].key = 4;
        setLayout(newLayout);

        if (turn) {
            const extra = newExtraTiles[0].splice(extraTile, 1);
            let newExtra = extra[0].map(e => {
                return {
                    letter: e.letter,
                    clicked: false
                };
            });
            newBoardExtraTiles[0].push(newExtra);
        } else {
            const extra = newExtraTiles[1].splice(extraTile, 1);
            let newExtra = extra[0].map(e => {
                return {
                    letter: e.letter,
                    clicked: false
                };
            }); 
            newBoardExtraTiles[1].push(newExtra);
        }
        setCurrExtraTiles(newExtraTiles);
        setBoardExtraTiles(newBoardExtraTiles);

        setAddTileFlag(false);

        /*let newLayout = cloneDeep(layout);
        let newTiles = cloneDeep(tiles);
        let newLetters = cloneDeep(letters);
        let newExtraTiles = cloneDeep(extraTiles);

        const tile = newLayout.findIndex(spot => spot.row === hoverRow && spot.col === hoverCol);
        newLayout[tile].key = 2;
        newLayout[tile].tile = tiles.length + 1;
        for (let i = tile + 1; i < newLayout.length; ++i) {
            ++newLayout[i].index;
        }
        setLayout(newLayout);

        const game = tiles[0].game;
        let t = {
          id: tiles.length + 1,
          row: hoverRow,
          column: hoverCol,
          game: game
        };
        newTiles.splice(newLayout[tile].index, 0, t);
        setTiles(newTiles);

        let newTile = extraLetters.map((letter: string, index: number) => {
            return {
                id: 4 * letters.length + 1 + index,
                clicked: 0,
                index: index,
                tile: letters.length + 1,
                letter: letter
            }
        });
        newLetters.splice(newLayout[tile].index, 0, newTile);
        setLetters(newLetters);
        
        if (turn) {
            newExtraTiles[0].splice(extraTile, 1);
        } else {
            newExtraTiles[1].splice(extraTile, 1);
        }
        setExtraTiles(newExtraTiles);

        setAddTileFlag(false);*/
    };

    function addTile() {
        setAddTileFlag(!addTileFlag);
    }

    function endTurn() {
        setLoading(true);
        setTurn(!turn);
        const updatedData = { tokens, tiles, letters, extraTiles };
        axios.post('/api/end-turn', updatedData).then(res => {
            setError("");
            setLetters(res.data.newLetters);
        }).catch(err => {
            setError(err);
        }).then(() => {
            setLoading(false);
        });
    }

    return (
        <DndProvider backend={HTML5Backend}>
            <div>
                {!loading ? 
                    <Grid container className={styles.game}>
                        <Grid item xs={8}>
                            <Board 
                                turn={turn}
                                layout={layout}
                                numRows={numRows}
                                numCols={numCols}
                                addTileFlag={addTileFlag}
                                letters={letters}
                                extraTiles={boardExtraTiles}
                                placeToken={placeToken} 
                                moveTile={moveTile}
                            />
                        </Grid>
                        <Grid item xs={4}>
                            <ScoreBoard 
                                players={players} 
                                tokens={tokens}
                                turn={turn} 
                                extraTiles={currExtraTiles}
                                addTile={addTile}
                                endTurn={endTurn} 
                            />
                        </Grid>
                    </Grid> : 
                    <p>Loading...</p>
                }
            </div>
        </DndProvider>
    );
}

export default Game;