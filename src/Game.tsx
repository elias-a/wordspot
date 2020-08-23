import React, { useState, useEffect } from 'react';
import Board from './Board';
import ScoreBoard from './ScoreBoard';
import axios from 'axios';
import { cloneDeep } from 'lodash';
import { Grid } from '@material-ui/core';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

function Game() {
    const [layout, setLayout] = useState([]);
    const [numRows, setNumRows] = useState(0);
    const [numCols, setNumCols] = useState(0);
    const [letters, setLetters] = useState([]);
    const [players, setPlayers] = useState([]);
    const [turn, setTurn] = useState(true);
    const [tokens, setTokens] = useState([]);
    const [extraTiles, setExtraTiles] = useState([]);
    const [addTileFlag, setAddTileFlag] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get('/api/get-game-details').then(res => {
            setLayout(res.data.layout);
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

        let l = cloneDeep(letters);
        l[tile][letter].clicked = !l[tile][letter].clicked;
        setLetters(l);
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
        newLetters.push(newTile);
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
        //setLoading(true);
        setTurn(!turn);
        axios.post('/api/end-turn', {}).then(res => {
            setError("");
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
                    <Grid container>
                        <Grid item xs={6}>
                            <Board 
                                layout={layout}
                                numRows={numRows}
                                numCols={numCols}
                                addTileFlag={addTileFlag}
                                letters={letters}
                                placeToken={placeToken} 
                                moveTile={moveTile}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <ScoreBoard 
                                players={players} 
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