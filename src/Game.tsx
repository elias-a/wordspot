import React, { useState, useEffect } from 'react';
import Board from './Board';
import ScoreBoard from './ScoreBoard';
import axios from 'axios';
import { Grid } from '@material-ui/core';

function Game() {
    const [turn, setTurn] = useState(true);
    const [tokens, setTokens] = useState([]);
    const [extraTiles, setExtraTiles] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => {
        axios.get('/get-game-details').then(res => {
            
            setError("");
        }).catch(err => {
            setError(err);
        });
    }, []);

    return (
        <Grid container>
            <Grid item xs={6}><Board /></Grid>
            <Grid item xs={6}><ScoreBoard /></Grid>
        </Grid>
    );
}

export default Game;