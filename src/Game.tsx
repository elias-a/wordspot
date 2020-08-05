import React, { useState, useEffect } from 'react';
import Board from './Board';
import ScoreBoard from './ScoreBoard';
import axios from 'axios';
import { Grid } from '@material-ui/core';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd';

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

        const l = [...letters];
        l[tile][letter].clicked = !l[tile][letter].clicked;
        setLetters(l);
    }
    
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