import React, { useState, useEffect } from 'react';
import { Redirect } from 'react-router-dom';
import axios from 'axios';
import { 
    Button,
    Link
} from '@material-ui/core';
import Menu from './game/Menu';
import { useStyles } from './styles';

function Dashboard() {
    const [game, setGame] = useState('');
    const [games, setGames] = useState([]);
    const player = localStorage.getItem('player');
    const styles = useStyles();

    useEffect(() => {
        axios.post('/api/get-games', { player }).then(res => {
            setGames(res.data.games);
        });
    }, []);

    const startGame = () => {
        axios.post('/api/start-game', { player }).then(res => {
            setGame(res.data.game);
        });
    }

    /*if (game !== '') {
        const path = '/game/' + game;
        return <Redirect to={path} />;
    }*/

    return (
        <React.Fragment>
            <Menu />
            <div className={styles.dashboardLayout}>
                <Button
                    className={styles.button}
                    onClick={startGame}
                >
                    Start New Game
                </Button>

                <ul>
                    {games.map(game => {
                        return (
                            <Link
                                key={game.id}
                                href={"/game/" + game.name}
                            >
                                {game.name}
                            </Link>
                        );
                    })}
                </ul>
            </div>
        </React.Fragment>
    );
}

export default Dashboard;