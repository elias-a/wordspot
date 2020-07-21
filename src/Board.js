import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Board() {
    const [tiles, setTiles] = useState([{}]);
    const [error, setError] = useState("");

    useEffect(() => {
        axios.get('/api/get-tiles').then(res => {
            setTiles(res);
            setError("");
        }).catch(err => {
            setError(err);
        });
    }, []);

    return (
        <h3>Board</h3>
    );
}

export default Board;