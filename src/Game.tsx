import React, { useState, useEffect } from 'react';
import Board from './Board';
import ScoreBoard from './ScoreBoard';
import axios from 'axios';
import { Grid } from '@material-ui/core';

function Game() {
    const [tiles, setTiles] = useState([]);
    const [letters, setLetters] = useState([]);
    const [players, setPlayers] = useState([]);
    const [turn, setTurn] = useState(true);
    const [tokens, setTokens] = useState([]);
    const [extraTiles, setExtraTiles] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get('/api/get-game-details').then(res => {
            setTiles(res.data.tiles);
            setLetters(res.data.letters);

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
        <div>
            {!loading ? 
                <Grid container>
                    <Grid item xs={6}>
                        <Board 
                            tiles={tiles} 
                            letters={letters}
                            placeToken={placeToken} 
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <ScoreBoard players={players} turn={turn} endTurn={endTurn} />
                    </Grid>
                </Grid> : 
                <p>Loading...</p>
            }
        </div>
    );
}

export default Game;