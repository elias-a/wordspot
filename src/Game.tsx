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
    
    const moveTile = ({
        extraTile,
        extraLetters,
        hoverRow, 
        hoverCol
    }) => {
        let newLayout = cloneDeep(layout);
        const tile = newLayout.findIndex(spot => spot.row === hoverRow && spot.col === hoverCol);
        newLayout[tile].key = 2;
        setLayout(newLayout);

        const game = tiles[0].game;
        let newTiles = cloneDeep(tiles);
        let t = {
          id: letters.length + 1,
          row: hoverRow,
          column: hoverCol,
          game: game
        };
        newTiles.splice(newLayout[tile].index, 0, t);
        setTiles(newTiles);

        let newLetters = cloneDeep(letters);
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
        
        let newExtraTiles = cloneDeep(extraTiles);
        if (turn) {
            newExtraTiles[0].splice(extraTile, 1);
        } else {
            newExtraTiles[1].splice(extraTile, 1);
        }
        setExtraTiles(newExtraTiles);
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
                                placeToken={placeToken} 
                                moveTile={moveTile}
                            />
                        </Grid>
                        <Grid item xs={4}>
                            <ScoreBoard 
                                players={players} 
                                tokens={tokens}
                                turn={turn} 
                                extraTiles={extraTiles}
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