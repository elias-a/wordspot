import { models, Models } from '../models/models';
import { QueryTypes, Op, fn, col } from 'sequelize';

const tilesSet = [
    "SGPU", "HEAS", "XAIY",
    "LIEL", "RNAD", "OPPE",
    "CAKI", "TSOS", "MIAP",
    "PLAE", "ZEYA", "ENRI",
    "ILFL", "OSOT", "WOAT",
    "GNSA", "STHA", "IRTE",
    "CEKA", "VEIH", "NTOA",
    "EDER", "THEC", "DLEY",
    "ATIR", "VNSA", "ETND",
    "AJNO", "LRIG", "MORG",
    "RAIB", "BOUT"
];

export class Controller {
    models: Models;

    constructor(models: Models) {
        this.models = models;
    }
    
    async getGames(username: string) {
        const { userId } = await this.models.User.findOne({
            attributes: [['id', 'userId']],
            where: {
                username: username 
            }
        });
        const { playerId } = await this.models.User.findOne({
            attributes: [['id', 'playerId']],
            where: {
                username: username
             }
        });
        let games = await this.models.Player.findAll({
            attributes: ['game', 'turn'],
            where: {
                name: playerId
            },
            order: [
                ['id', 'DESC']
            ]
        });

        games = await Promise.all(games
            .map(async (game: any, idx: number) => {
                let outcome = '';
                const date = new Date(game.game*1000).toLocaleDateString("en-US");

                const players = await this.models.Player.findAll({
                    where: {
                        game: game.game
                    }
                }).then(async (game: any) => {
                    return await Promise.all(game
                        .map(async (player: any) => {
                            const user = await this.models.User.findOne({
                                where: {
                                    id: player.name
                                }
                            });

                            if (player.winner === 1) {
                                if (player.name === userId) {
                                    outcome = 'won';
                                } else if (player.name !== userId) {
                                    outcome = 'lost';
                                }
                            }

                            return user.username;
                        })
                    );
                });
                
                return {
                    id: idx, 
                    game: game.game,
                    date: date,
                    turn: game.turn,
                    players: players,
                    outcome: outcome
                }
            })
        );

        return { status: 200, result: {
                games
            }
        }
    }

    async startGame(player1: string) {

        // The name of the game is the current time in Epoch seconds
        const game = Math.round(Date.now() / 1000).toString();
        const gameId = parseInt(game);

        // Later, player2 should be accepted as a parameter
        const { player2 } = await this.models.User.findOne({
            attributes: [['id', 'player2']],
            where: {
                username: {
                    [Op.not]: player1
                }
            }
        });

        player1 = (await this.models.User.findOne({
            where: {
                username: player1
            }
        })).id;

        // Create game
        await this.models.Game.create({
            id: gameId,
            name: game
        });

        // Create players
        await this.models.Player.create({
            name: player1,
            game: gameId,
            turn: true,
            tokens: 26,
            winner: false
        });
        await this.models.Player.create({
            name: player2,
            game: gameId,
            turn: false,
            tokens: 25,
            winner: false
        });

        const shuffledTiles = tilesSet.sort(() => Math.random() - 0.5);
        const tiles = shuffledTiles.slice(0, 16);
        const availableTiles = shuffledTiles.slice(16);

        // Create tiles 
        await Promise.all(tiles.map(async (tile, i) => {
            await this.models.Tile.create({
                game: gameId,
                row: Math.floor(i / 4),
                column: i % 4,
                letters: tile,
                clicked: '0000'
            });
        }));

        // Create available tiles
        await Promise.all(availableTiles.map(async (tile, i) => {
            await this.models.AvailableTile.create({
                game: gameId,
                letters: tile
            });
        }));

        return {
            status: 200, result: {
                game
            }
        }
    }

    // Helper function to check if location is a valid 
    // spot to add a tile. 
    async checkNeighbors(game: number, row: number, col: number): Promise<boolean> {
        const right = await this.models.Tile.findOne({
            where: {
                game: game,
                row: row,
                column: col + 1
            }
        });

        const left = await this.models.Tile.findOne({
            where: {
                game: game,
                row: row,
                column: col - 1
            }
        });

        const above = await this.models.Tile.findOne({
            where: {
                game: game,
                row: row + 1,
                column: col
            }
        });

        const below = await this.models.Tile.findOne({
            where: {
                game: game,
                row: row - 1,
                column: col
            }
        });

        if (right || left || above || below) return true;
        else return false;
    }

    async getGameDetails(player: string, game: string) {
        const gameObj = await this.models.Game.findOne({
            where: {
                name: game
            }
        });
        
        if (gameObj === null) {
            return { status: 404, result: {} };
        }

        const { userId } = await this.models.User.findOne({
            attributes: [['id', 'userId']],
            where: {
                username: player 
            }
        });
        const { playerId } = await this.models.Player.findOne({
            attributes: [['id', 'playerId']],
            where: {
                game: game,
                name: userId
            }
        });

        let players = await this.models.Player.findAll({
            where: {
                game: game
            }
        });

        const tiles = await this.models.Tile.findAll({
            where: {
                game: game
            }
        });
        
        const letters = tiles.map((tile: any, i: number) => {
            const l = tile.letters.split('');
            const clicked: string[] = tile.clicked.split('');
            return l.map((letter: string, j: number) => {
                return {
                    id: i * 4 + j,
                    letter: letter,
                    tile: i + 1,
                    index: j,
                    clicked: parseInt(clicked[j])
                };
            });
        });

        const extraTiles = await this.models.ExtraTile.findAll({
            where: {
                player: playerId
            }
        });

        const { maxRow } = await this.models.Tile.findOne({
            attributes: [[fn('max', col('row')), 'maxRow']],
            where: {
                game: game
            }
        });
        const { maxCol } = await this.models.Tile.findOne({
            attributes: [[fn('max', col('column')), 'maxCol']],
            where: {
                game: game
            }
        });
        const { minRow } = await this.models.Tile.findOne({
            attributes: [[fn('min', col('row')), 'minRow']],
            where: {
                game: game
            }
        });
        const { minCol } = await this.models.Tile.findOne({
            attributes: [[fn('min', col('column')), 'minCol']],
            where: {
                game: game
            }
        });

        const { minTile } = await this.models.Tile.findOne({
            attributes: [[fn('min', col('id')), 'minTile']],
            where: {
                game: game
            }
        });
        let index = 0;
        let layout: { 
            key: number, 
            row: number, 
            col: number, 
            index: number, 
            tile: number | null }[] = [];
        for (let row = minRow - 1; row <= maxRow + 1; ++row) {
            for (let col = minCol - 1; col <= maxCol + 1; ++col) {
                const tile = await this.models.Tile.findOne({
                    where: {
                        game: game,
                        row: row,
                        column: col
                    }
                });

                // 4: Extra tile is currently added here
                // 2: tile
                // 1: valid spot to add tile
                // 0: placeholder spot

                if (tile) {
                    layout.push({
                        key: 2,
                        row: row,
                        col: col,
                        index: index++,
                        tile: tile.id - minTile + 1
                    });
                }
                else if (await this.checkNeighbors(parseInt(game), row, col)) {
                    layout.push({
                        key: 1,
                        row: row,
                        col: col,
                        index: index,
                        tile: null
                    });
                }
                else {
                    layout.push({
                        key: 0,
                        row: row,
                        col: col,
                        index: index,
                        tile: null
                    });
                }
            }
        }

        let outcome = '';
        await Promise.all(players.map(async (player: any) => {
            const { name } = await this.models.User.findOne({
                attributes: [['username', 'name']],
                where: {
                    id: player.name
                }
            });

            player.name === userId
                && player.winner === 1
                ? outcome = 'won' : null;
            player.name !== userId
                && player.winner === 1
                ? outcome = 'lost' : null;

            player.name = name;
        }));
        
        return { status: 200, result: { 
                players, 
                layout,
                letters,
                tiles,
                numRows: maxRow - minRow + 3,
                numCols: maxCol - minCol + 3,
                extraTiles,
                outcome
            } 
        };
    }

    async endTurn(game: string, player: string, tokens: number[], tiles: any, letters: any, extraTiles: any, turn: boolean, moveMade: boolean) {
        
        const { userId } = await this.models.User.findOne({
            attributes: [['id', 'userId']],
            where: {
                username: player 
            }
        });
        const { playerId } = await this.models.Player.findOne({
            attributes: [['id', 'playerId']],
            where: {
                game: game,
                name: userId
            }
        });        

        // If a move wasn't made, give the player 2 tokens and 
        // an extra tile. 
        if (!moveMade) {
            if (turn) {
                tokens[0] += 2;
            } else {
                tokens[1] += 2;
            }

            const availableTiles = await this.models.AvailableTile.findAll({
                where: {
                    game: game
                }
            });
            
            const availableTile = availableTiles[availableTiles.length - 1];
            const extraTile = {
                id: availableTile.id,
                player: playerId,
                letters: availableTile.letters
            };

            extraTiles.push(extraTile);

            await this.models.AvailableTile.destroy({
                where: {
                    id: availableTile.id
                }
            });
        }

        // Checks how many tiles are used to form the word. 
        const tilesUsed = letters.filter((tile: any) => {
            return tile.some((letter: any) => letter.hasOwnProperty('selected')
                                    || letter.hasOwnProperty('used'));
        }).map((tile: any) => tile[0].tile);

        // Award an extra tile if the word spanned
        // 3 or more tiles. 
        if (tilesUsed.length >= 3) {
            const availableTiles = await this.models.AvailableTile.findAll({
                where: {
                    game: game
                }
            });
            
            const availableTile = availableTiles[availableTiles.length - 1];
            const extraTile = {
                id: availableTile.id,
                player: playerId,
                letters: availableTile.letters
            };

            extraTiles.push(extraTile);

            await this.models.AvailableTile.destroy({
                where: {
                    id: availableTile.id
                }
            });
        }
        
        // Update turn and tokens
        await Promise.all((await this.models.Player.findAll({
            where: {
                game: game
            }
        })).map(async (player: any, index: number) => {
                const turn = player.turn ? 0 : 1;

                await this.models.Player.update({
                    turn: turn,
                    tokens: tokens[index]
                }, {
                    where: {
                        id: player.id
                    }
                });
            })
        );

        await this.models.sequelize.query(
            `DELETE FROM ExtraTile WHERE player=${playerId}`, {
                type: QueryTypes.DELETE
            }
        );
        await this.models.sequelize.query(
            `DELETE FROM Tile WHERE game=${game}`, {
                type: QueryTypes.DELETE
            }
        );

        // Update tiles 
        await Promise.all(tiles.map(async (tile: any, i: number) => {
            const l = tile.letters.split('');
            const clicked = l.map((letter: any, j: number) => {
                return letters[i][j].hasOwnProperty('selected') 
                    || letters[i][j].clicked
                    ? '1' : '0';
            }).join('');

            await this.models.Tile.create({
                game: tile.game,
                row: tile.row,
                column: tile.column,
                letters: tile.letters,
                clicked: clicked
            });
        }));
        
        // Update extra tiles
        await Promise.all(extraTiles.map(async (tile: any) => {
            await this.models.ExtraTile.create({
                player: playerId,
                letters: tile.letters,
            });
        }));

        const { maxRow } = await this.models.Tile.findOne({
            attributes: [[fn('max', col('row')), 'maxRow']],
            where: {
                game: game
            }
        });
        const { maxCol } = await this.models.Tile.findOne({
            attributes: [[fn('max', col('column')), 'maxCol']],
            where: {
                game: game
            }
        });
        const { minRow } = await this.models.Tile.findOne({
            attributes: [[fn('min', col('row')), 'minRow']],
            where: {
                game: game
            }
        });
        const { minCol } = await this.models.Tile.findOne({
            attributes: [[fn('min', col('column')), 'minCol']],
            where: {
                game: game
            }
        });

        const { minTile } = await this.models.Tile.findOne({
            attributes: [[fn('min', col('id')), 'minTile']],
            where: {
                game: game
            }
        });
        let index = 0;
        let newLayout: { 
            key: number, 
            row: number, 
            col: number, 
            index: number, 
            tile: number | null }[] = [];
        for (let row = minRow - 1; row <= maxRow + 1; ++row) {
            for (let col = minCol - 1; col <= maxCol + 1; ++col) {
                const tile = await this.models.Tile.findOne({
                    where: {
                        game: game,
                        row: row,
                        column: col
                    }
                });

                // 4: Extra tile is currently added here
                // 2: tile
                // 1: valid spot to add tile
                // 0: placeholder spot

                if (tile) {
                    newLayout.push({
                        key: 2,
                        row: row,
                        col: col,
                        index: index++,
                        tile: tile.id - minTile + 1
                    });
                }
                else if (await this.checkNeighbors(parseInt(game), row, col)) {
                    newLayout.push({
                        key: 1,
                        row: row,
                        col: col,
                        index: index,
                        tile: null
                    });
                }
                else {
                    newLayout.push({
                        key: 0,
                        row: row,
                        col: col,
                        index: index,
                        tile: null
                    });
                }
            }
        }

        const newTiles = await this.models.Tile.findAll({
            where: {
                game: game
            }
        });

        const newLetters = newTiles.map((tile: any, i: number) => {
            const l = tile.letters.split('');
            const clicked = tile.clicked.split('');
            return l.map((letter: string, j: number) => {
                return {
                    id: i * 4 + j,
                    letter: letter,
                    tile: i + 1,
                    index: j,
                    clicked: parseInt(clicked[j])
                };
            });
        });

        const newExtraTiles = await this.models.ExtraTile.findAll({
            where: {
                player: playerId
            }
        });
        
        const { otherPlayer } = await this.models.Player.findOne({
            where: {
                game: game,
                name: {
                    [Op.not]: userId
                }  
            }
        }).then(async (player: any) => {
            return await this.models.User.findOne({
                attributes: [['username', 'otherPlayer']],
                where: {
                    id: player.name
                }
            });
        });

        const winner = 
            turn && !tokens[0] || !turn && !tokens[1]
                ? player : '';

        let outcome = '';
        if (winner === player) {
            outcome = 'won';
        } else if (winner === otherPlayer) {
            outcome = 'lost';
        } 

        if (outcome !== '') {
            await this.models.Player.update({
                winner: 1
            }, {
                where: {
                    id: playerId
                }
            });
        }

        const numRows = maxRow - minRow + 3;
        const numCols = maxCol - minCol + 3;
        const width = (100 / numCols - 1).toString() + '%';
        const height = (100 / numRows - 1).toString() + '%';

        return { 
            status: 200, 
            result: { 
                newLayout,
                newLetters, 
                newExtraTiles,
                newTokens: tokens,
                outcome,
                width,
                height
            } 
        };
    }
}

export const controller = new Controller(models);