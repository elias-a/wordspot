import React, { useState, useEffect } from 'react';
import Board from './Board';
import ScoreBoard from './ScoreBoard';
import axios from 'axios';
import { Grid } from '@material-ui/core';

function Game() {
    const [tiles, setTiles] = useState([]);
    const [players, setPlayers] = useState([]);
    const [turn, setTurn] = useState(true);
    const [tokens, setTokens] = useState([]);
    const [extraTiles, setExtraTiles] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get('/api/get-game-details').then(res => {
            setTiles(res.data.tiles);

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

    function endTurn() {
        setLoading(true);
        setTurn(!turn);
        setLoading(false);
    }

    return (
        <div>
            {!loading ? 
                <Grid container>
                    <Grid item xs={6}>
                        <Board tiles={tiles} />
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