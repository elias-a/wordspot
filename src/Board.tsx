import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Alert } from '@material-ui/lab';
import { useStyles } from './styles';
import Tile from './Tile';

function Board() {
    const [tiles, setTiles] = useState([]);
    const [error, setError] = useState("");
    const styles = useStyles();

    useEffect(() => {
        axios.get('/api/get-tiles').then(res => {
            setTiles(res.data);
            setError("");
        }).catch(err => {
            setError(err);
        });
    }, []);

    return (
        <div className={styles.board}>
            {tiles.map(tile => {
                return (
                    <Tile letters={tile.letters} />
                );
            })}
        </div>
    );
}

export default Board;