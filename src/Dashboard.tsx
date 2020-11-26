import React, { useState, useEffect } from 'react';
import { Redirect } from 'react-router-dom';
import axios from 'axios';
import { 
    Button
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

    if (game !== '') {
        const path = '/game/' + game;
        return <Redirect push to={path} />;
    }

    return (
        <React.Fragment>
            <Menu />
            <div className={styles.dashboardLayout}>
                <Button
                    className={styles.startGameBtn}
                    onClick={startGame}
                >
                    Start New Game
                </Button>

                <div className={styles.gamesList}>
                    <h3>Games</h3>
                    {games.map(game => {
                        const turn = game.turn 
                            ? 'Your turn!' : ''

                        return (
                            <a
                                key={game.id}
                                href={"/game/" + game.game}
                                className={styles.gameLink}
                            >
                                <div>
                                    {game.date}
                                </div>
                                <div>
                                    {turn}
                                </div>
                                <div>
                                    {game.players[0] + ' vs. ' + game.players[1]}
                                </div>
                            </a>
                        );
                    })}
                </div>
            </div>
        </React.Fragment>
    );
}

export default Dashboard;