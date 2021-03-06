import React, { useState, useEffect } from 'react';
import Menu from '../Menu';
import Board from './Board';
import ScoreBoard from './ScoreBoard';
import { cloneDeep } from 'lodash';
import { 
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions
} from '@material-ui/core';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { getGameDetailsReq, endTurnReq } from '../api';
import { useStyles } from '../styles';

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
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [disabled, setDisabled] = useState(true);
    const [outcome, setOutcome] = useState('');
    const [width, setWidth] = useState('');
    const [height, setHeight] = useState('');
    const [player, setPlayer] = useState(localStorage.getItem('player'));
    const game = location.pathname.slice(location.pathname.lastIndexOf('/') + 1);
    const styles = useStyles();

    useEffect(() => {
        const currPlayer = localStorage.getItem('player');
        const path = location.pathname;
        const game = path.slice(path.lastIndexOf('/') + 1);

        getGameDetailsReq({ player: currPlayer, game }).then(res => {
            setLayout(res.data.layout);
            setTiles(res.data.tiles);
            setNumRows(res.data.numRows);
            setNumCols(res.data.numCols);
            setWidth((100 / res.data.numCols - 1).toString() + '%');
            setHeight((100 / res.data.numRows - 1).toString() + '%');
            setLetters(res.data.letters);
            setExtraTiles(res.data.extraTiles);
            setCurrExtraTiles(res.data.extraTiles);
            setOutcome(res.data.outcome);

            const players = res.data.players;
            setPlayers(players);
            
            const currTurn = players[0].turn ? true : false;
            setTurn(currTurn);

            const tokens = [players[0].tokens, players[1].tokens];
            setTokens(tokens);

            setPlayer(currPlayer);         
            currTurn && currPlayer === players[0].name ||
                !currTurn && currPlayer === players[1].name ? 
                setDisabled(false) : setDisabled(true);

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
            } else {
                newBoardExtraTiles[letter].selected = true;
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
            const isClicked = letters[tile][letter].clicked;
    
            let newLetters = cloneDeep(letters);
            let newTokens = cloneDeep(tokens);
            if (isClicked) {
                const isUsed = letters[tile][letter].hasOwnProperty('used');
                if (isUsed) {
                    delete newLetters[tile][letter].used;
                } else {
                    newLetters[tile][letter].used = true;
                }
            } else {
                if (isSelected) {
                    delete newLetters[tile][letter].selected;
                } else {
                    newLetters[tile][letter].selected = true;
                }

                if (turn) {
                    isSelected ? ++newTokens[0] : --newTokens[0];
                } else {
                    isSelected ? ++newTokens[1] : --newTokens[1];
                }
            }

            setLetters(newLetters);
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
            
            const letters = newBoardExtraTiles
                .map(letter => {
                    return letter.letter;
                }).join('');
            const newExtraTile = {
                player: turn ? 1 : 0,
                letters: letters
            };

            // Add extra tile back to player's stash
            newExtraTiles.splice(extraTileId, 1, newExtraTile);
            newBoardExtraTiles = [];
        }

        if (blankTileIndex >= 0) {
            const tile = newLayout.findIndex(spot => spot.row === hoverRow && spot.col === hoverCol);
            newLayout[tile].key = 4;
            
            // Remove extra tile from player's stash
            const extraTile = newExtraTiles.splice(extraTileIndex, 1, {})[0];
            newBoardExtraTiles = extraTile.letters.split('').map(letter => {
                return {
                    id: extraTileIndex,
                    letter: letter,
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

    const updateBoard = (endTurn: boolean) => {
        setLoading(true);
        setConfirm(false);
        if (!endTurn) {
            setLoading(false);
            return;
        }

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
    
            let extraLetters = '';
            let extraClicked = '';
            let newTile = boardExtraTiles.map((letter, index: number) => {
                extraLetters += letter.letter;
                
                if (letter.hasOwnProperty('selected')) {
                    extraClicked += '1';

                    return {
                        id: 4 * letters.length + 1 + index,
                        clicked: 0,
                        index: index,
                        tile: letters.length + 1,
                        letter: letter.letter,
                        selected: true
                    }
                } else {
                    extraClicked += '0';

                    return {
                        id: 4 * letters.length + 1 + index,
                        clicked: 0,
                        index: index,
                        tile: letters.length + 1,
                        letter: letter.letter
                    }
                }
            });
            newLetters.splice(newLayout[spot].index, 0, newTile);
            
            const game = tiles[0].game;
            let t = {
              id: tiles.length + 1,
              row: newLayout[spot].row,
              column: newLayout[spot].col,
              game: game,
              letters: extraLetters,
              clicked: extraClicked
            };
            newTiles.splice(newLayout[spot].index, 0, t);

            const extraTileIndex = currExtraTiles.findIndex(tile => 
                Object.keys(tile).length === 0
            );
            newExtraTiles.splice(extraTileIndex, 1);
        }

        const updatedData = { 
            game,
            player,
            tokens,
            tiles: newTiles, 
            letters: newLetters,
            extraTiles: newExtraTiles,
            turn,
            moveMade
        };

        endTurnReq(updatedData).then(res => {
            setError("");

            setLayout(res.data.newLayout);
            setLetters(res.data.newLetters);
            setExtraTiles(res.data.newExtraTiles);
            setCurrExtraTiles(res.data.newExtraTiles);
            setTiles(newTiles);
            setTokens(res.data.newTokens);
            setOutcome(res.data.outcome);
            setWidth(res.data.width);
            setHeight(res.data.height);

            setMoveMade(false);
            setTurn(!turn);
            setDisabled(!disabled);
        }).catch(err => {
            setError(err);
        }).then(() => {
            setLoading(false);
        });
    }

    function endTurn() {
        setAddTileFlag(false);

        // Checks if any tokens have been placed. 
        const anySelected = letters.map(tile => {
            // TODO: Check 'used' as well
            return tile.some(letter => letter.hasOwnProperty('selected'));
        }).some(tile => tile === true);

        if (anySelected) {
            setMoveMade(true);
        }
        
        setConfirm(true);
    }

    return (
        <DndProvider backend={HTML5Backend}>
            <Menu />
            <div className={styles.gameLayout}>
                {!loading ? 
                    <div className={styles.game}>
                        <div className={styles.scoreBoard}>
                            <ScoreBoard 
                                disabled={disabled}
                                players={players} 
                                player={player}
                                tokens={tokens}
                                turn={turn} 
                                width={width}
                                height={height}
                                extraTiles={currExtraTiles}
                                addTileFlag={addTileFlag}
                                addTile={addTile}
                                endTurn={endTurn} 
                                moveTile={moveTile}
                            />
                        </div>
                        <div className={styles.board}>
                            <Board 
                                disabled={disabled}
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
                        </div>
                    </div> : 
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
                            onClick={() => updateBoard(false)} 
                            color="primary"
                        >
                            Do not end turn
                        </Button>
                        <Button 
                            onClick={() => updateBoard(true)} 
                            color="primary" 
                        >
                            End turn
                        </Button>
                    </DialogActions>
                </Dialog>
            }
            {(outcome === 'won' || outcome === 'lost') && 
                <Dialog
                    open={outcome ? true : false}
                >
                    <DialogTitle>
                        {`You ${outcome}!`}
                    </DialogTitle>
                </Dialog>
            }
        </DndProvider>
    );
}

export default Game;