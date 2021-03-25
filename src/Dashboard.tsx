import React, { useState, useEffect } from 'react';
import { Redirect } from 'react-router-dom';
import { Button, Card } from '@material-ui/core';
import { Pagination } from '@material-ui/lab';
import Menu from './Menu';
import { formatApostrophe } from './helpers';
import { getGamesReq, startGameReq } from './api';
import { useStyles } from './styles';

function Dashboard() {
    const [game, setGame] = useState('');
    const [games, setGames] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [displayedGames, setDisplayedGames] = useState([]);
    const [player, setPlayer] = useState('');
    const styles = useStyles();

    useEffect(() => {
        const p = localStorage.getItem('player');
        if (p !== '') {
            setPlayer(p);

            getGamesReq({ player: p }).then(res => {
                setGames(res.data.games);
                setTotalPages(Math.ceil(res.data.games.length / 6));
                setDisplayedGames(res.data.games.slice(0, 6));
            });
        }
    }, [localStorage.getItem('player')]);

    useEffect(() => {
        const start = 6 * (page - 1);
        setDisplayedGames(games.slice(start, start + 6));
    }, [page]);

    const startGame = () => {
        startGameReq({ player }).then(res => {
            setGame(res.data.game);
        });
    }

    const redirectToGame = (g: string) => {
        setGame(g);
    }

    if (game !== '') {
        const path = '/game/' + game;
        return <Redirect push to={path} />;
    }

    return (
        <React.Fragment>
            <Menu />
            <div className={styles.dashboardLayout}>
                <div className={styles.statSection}>
                    <h2
                        style={{
                            textAlign: 'center',
                            fontSize: '40px',
                            marginTop: '20px'
                        }}
                    >
                        {`Welcome, ${player}!`}
                    </h2>
                    <Button
                        className={styles.startGameBtn}
                        onClick={startGame}
                    >
                        Start New Game
                    </Button>
                </div>

                <div className={styles.gameSection}>
                    <h3 
                        style={{
                            width: '40%',
                            textAlign: 'center',
                            fontSize: '40px',
                            marginTop: '20px',
                            marginBottom: 0,
                            display: 'inline-block'
                        }}
                    >
                        Your Games
                    </h3>
                    <Pagination 
                        variant="outlined"
                        shape="rounded"
                        count={totalPages}
                        page={page}
                        onChange={(_e, page) => setPage(page)}
                        style={{
                            marginTop: '20px',
                            display: 'inline-block',
                            float: 'right'
                        }}
                    />

                    <div className={styles.gamesList}>
                        {displayedGames.map(game => {
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
                                <Card
                                    key={game.id}
                                    className={styles.gameCard}
                                >
                                    <div className={styles.gameSummary}>
                                        <p className={styles.summaryItem}>
                                            {turn}
                                        </p>
                                        <p className={styles.summaryItem}>
                                            {game.players[0] 
                                                + ' vs. ' 
                                                + game.players[1]}
                                        </p>
                                        <p className={styles.summaryItem}>
                                            Game started: {game.date}
                                        </p>
                                    </div>

                                    <Button
                                        className={styles.gameBtn}
                                        onClick={() => redirectToGame(game.game)}
                                    >
                                        Play Game
                                    </Button>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
}

export default Dashboard;