import React, { useState, useEffect } from 'react';
import Board from './Board';
import ScoreBoard from './ScoreBoard';
import axios from 'axios';
import { cloneDeep } from 'lodash';
import { 
    Grid, 
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions
} from '@material-ui/core';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useStyles } from './styles';

function Game() {
    const [layout, setLayout] = useState([]);
    const [tiles, setTiles] = useState([]);
    const [numRows, setNumRows] = useState(0);
    const [numCols, setNumCols] = useState(0);
    const [letters, setLetters] = useState([]);
    const [players, setPlayers] = useState([]);
    const [turn, setTurn] = useState(true);
    const [tokens, setTokens] = useState([]);
    const [extraTiles, setExtraTiles] = useState([]);
    const [currExtraTiles, setCurrExtraTiles] = useState([]);
    const [boardExtraTiles, setBoardExtraTiles] = useState([]);
    const [addTileFlag, setAddTileFlag] = useState(false);
    const [moveMade, setMoveMade] = useState(false);
    const [confirm, setConfirm] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const styles = useStyles();

    const width = (100 / numCols - 1).toString() + '%';
    const height = (100 / numRows - 1).toString() + '%';

    useEffect(() => {
        axios.get('/api/get-game-details').then(res => {
            setLayout(res.data.layout);
            setTiles(res.data.tiles);
            setNumRows(res.data.numRows);
            setNumCols(res.data.numCols);
            setLetters(res.data.letters);
            setExtraTiles(res.data.extraTiles);
            setCurrExtraTiles(res.data.extraTiles);

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
        if (id >= letters.length * 4) {
            let newBoardExtraTiles = cloneDeep(boardExtraTiles);
            const letter = id % 4;

            const isSelected = newBoardExtraTiles[letter].hasOwnProperty('selected');
            if (isSelected) {
                delete newBoardExtraTiles[letter].selected;
                setMoveMade(false);
            } else {
                newBoardExtraTiles[letter].selected = true;
                setMoveMade(true);
            }
            setBoardExtraTiles(newBoardExtraTiles);

            let newTokens = cloneDeep(tokens);
            if (turn) {
                isSelected ? ++newTokens[0] : --newTokens[0];
            } else {
                isSelected ? ++newTokens[1] : --newTokens[1];
            }
            setTokens(newTokens);
        } else {
            const tile = Math.floor(id / 4);
            const letter = id % 4;
            const isSelected = letters[tile][letter].hasOwnProperty('selected');
    
            let newLetters = cloneDeep(letters);
            if (isSelected) {
                delete newLetters[tile][letter].selected;
                setMoveMade(false);
            } else {
                newLetters[tile][letter].selected = true;
                setMoveMade(true);
            }
            setLetters(newLetters);
    
            let newTokens = cloneDeep(tokens);
            if (turn) {
                isSelected ? ++newTokens[0] : --newTokens[0];
            } else {
                isSelected ? ++newTokens[1] : --newTokens[1];
            }
            setTokens(newTokens);
        }
    }

    const moveTile = ({
        blankTileIndex,
        extraTileIndex,
        hoverRow, 
        hoverCol
    }) => {
        let newLayout = cloneDeep(layout);
        let newExtraTiles = cloneDeep(currExtraTiles);
        let newBoardExtraTiles = cloneDeep(boardExtraTiles);

        // Remove extra tile from its current place on the board
        const spot = newLayout.findIndex(spot => spot.key === 4);
        let extraTileLetters = [];
        if (spot >= 0) {
            let newTokens = cloneDeep(tokens);
            const numSelected = newBoardExtraTiles.filter(letter => 
                letter.hasOwnProperty('selected') === true).length;
            if (turn) {
                newTokens[0] += numSelected;
            } else {
                newTokens[1] += numSelected;
            }
            setTokens(newTokens);

            const extraTileId = newBoardExtraTiles[0].id;
            newLayout[spot].key = 1;
            extraTileLetters = newBoardExtraTiles
                .map((letter, index: number) => {
                    return {
                        player: turn ? 1 : 0,
                        tile: extraTileId,
                        letter: letter.letter,
                        index: index
                    };
                });

            // Add extra tile back to player's stash
            newExtraTiles.splice(extraTileId, 1, extraTileLetters);
            newBoardExtraTiles = [];
        }

        if (blankTileIndex >= 0) {
            const tile = newLayout.findIndex(spot => spot.row === hoverRow && spot.col === hoverCol);
            newLayout[tile].key = 4;
    
            // Remove extra tile from player's stash
            const extraTile = newExtraTiles.splice(extraTileIndex, 1, [])[0];
            newBoardExtraTiles = extraTile.map(letter => {
                return {
                    id: extraTileIndex,
                    letter: letter.letter,
                    clicked: false
                };
            });
        }

        setLayout(newLayout);
        setCurrExtraTiles(newExtraTiles);
        setBoardExtraTiles(newBoardExtraTiles);
    };

    function addTile() {
        setAddTileFlag(!addTileFlag);
    }

    const endTurn = (endTurn: boolean) => {
        setLoading(true);
        setConfirm(false);
        if (!endTurn) {
            setLoading(false);
            return;
        }

        const newTokens = cloneDeep(tokens);
        if (!moveMade) {
            if (turn) {
                newTokens[0] += 2;
            } else {
                newTokens[1] += 2;
            }

            setTokens(newTokens);
        }

        const updatedData = { 
            tokens: newTokens,
            tiles, 
            letters,
            extraTiles,
        };

        axios.post('/api/end-turn', updatedData).then(res => {
            setError("");
            setLetters(res.data.newLetters);
            setMoveMade(false);
            setTurn(!turn);
        }).catch(err => {
            setError(err);
        }).then(() => {
            setLoading(false);
        });
    }

    function updateBoard() {
        setAddTileFlag(false);

        let newLayout = cloneDeep(layout);
        let newTiles = cloneDeep(tiles);
        let newLetters = cloneDeep(letters);
        let newExtraTiles = cloneDeep(extraTiles);

        const spot = newLayout.findIndex(spot => spot.key === 4);
        if (spot >= 0) {
            newLayout[spot].key = 2;
            newLayout[spot].tile = tiles.length + 1;
            for (let i = spot + 1; i < newLayout.length; ++i) {
                ++newLayout[i].index;
            }
            setLayout(newLayout);
    
            const game = tiles[0].game;
            let t = {
              id: tiles.length + 1,
              row: newLayout[spot].row,
              column: newLayout[spot].col,
              game: game
            };
            newTiles.splice(newLayout[spot].index, 0, t);
            setTiles(newTiles);
    
            let newTile = boardExtraTiles.map((letter, index: number) => {
                return {
                    id: 4 * letters.length + 1 + index,
                    clicked: 0,
                    index: index,
                    tile: letters.length + 1,
                    letter: letter.letter
                }
            });
            newLetters.splice(newLayout[spot].index, 0, newTile);
            setLetters(newLetters);
            
            const extraTileIndex = currExtraTiles.findIndex(tile => 
                tile.length === 0
            );
            newExtraTiles.splice(extraTileIndex, 1);
        }

        setLayout(newLayout);
        setTiles(newTiles);
        setLetters(newLetters);
        setExtraTiles(newExtraTiles);
        setCurrExtraTiles(newExtraTiles);

        setConfirm(true);
    }

    return (
        <DndProvider backend={HTML5Backend}>
            <div>
                {!loading ? 
                    <Grid container className={styles.game}>
                        <Grid item xs={8}>
                            <Board 
                                turn={turn}
                                layout={layout}
                                width={width}
                                height={height}
                                addTileFlag={addTileFlag}
                                letters={letters}
                                extraTile={boardExtraTiles}
                                placeToken={placeToken} 
                                moveTile={moveTile}
                            />
                        </Grid>
                        <Grid item xs={4}>
                            <ScoreBoard 
                                players={players} 
                                tokens={tokens}
                                turn={turn} 
                                width={width}
                                height={height}
                                extraTiles={currExtraTiles}
                                addTile={addTile}
                                endTurn={updateBoard} 
                                moveTile={moveTile}
                            />
                        </Grid>
                    </Grid> : 
                    <p>Loading...</p>
                }
            </div>
            {confirm && 
                <Dialog 
                    open={confirm}
                >
                    <DialogTitle>
                        {"Are you sure you want to end your turn?"}
                    </DialogTitle>
                    {!moveMade ? 
                        <DialogContent>
                            <DialogContentText>
                                {"Since you have not made a move, you will be given two tokens if you end your turn."}
                            </DialogContentText>
                        </DialogContent> : <></>
                    }
                    <DialogActions>
                        <Button 
                            onClick={() => endTurn(false)} 
                            color="primary"
                        >
                            Do not end turn
                        </Button>
                        <Button 
                            onClick={() => endTurn(true)} 
                            color="primary" 
                        >
                            End turn
                        </Button>
                    </DialogActions>
                </Dialog>}
        </DndProvider>
    );
}

export default Game;