import React, { useState, useEffect } from 'react';
import { Redirect } from 'react-router-dom';
import axios from 'axios';
import { 
    Button
} from '@material-ui/core';
import Menu from './game/Menu';
import { formatApostrophe } from './helpers';
import { useStyles } from './styles';

function Dashboard() {
    const [game, setGame] = useState('');
    const [games, setGames] = useState([]);
    const [player, setPlayer] = useState('');
    const styles = useStyles();

    useEffect(() => {
        const p = localStorage.getItem('player');
        if (p !== '') {
            setPlayer(p);

            axios.post('/api/get-games', { player: p }).then(res => {
                setGames(res.data.games);
            });
        }
    }, [localStorage.getItem('player')]);

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
                <div className={styles.gamesList}>
                    <h2>{`Hello, ${player}!`}</h2>
                </div>
                <Button
                    className={styles.startGameBtn}
                    onClick={startGame}
                >
                    Start New Game
                </Button>

                <div className={styles.gamesList}>
                    <h3>Games</h3>
                    {games.map(game => {
                        const otherPlayer = 
                            player === game.players[0] 
                                ? game.players[1]
                                : game.players[0];

                        let turn = game.turn 
                            ? <div>{'Your turn!'}</div>
                            : <div>{formatApostrophe(otherPlayer) + ' turn!'}</div>;
                        
                        if (game.outcome !== '') {
                            turn = game.outcome === 'won' 
                                ? <div>You won!</div> 
                                : <div>You lost!</div>
                        }

                        return (
                            <a
                                key={game.id}
                                href={"/game/" + game.game}
                                className={styles.gameLink}
                            >
                                <div>
                                    {game.date}
                                </div>
                                {turn}
                                <div>
                                    {game.players[0] 
                                        + ' vs. ' 
                                        + game.players[1]}
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