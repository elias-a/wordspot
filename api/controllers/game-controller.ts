import { models, Models } from '../models/models';
import { QueryTypes, Op } from 'sequelize';

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
                const dateObj = new Date(game.game*1000);
                const date = dateObj.toLocaleString();

                const players = await this.models.Player.findAll({
                    where: {
                        game: parseInt(game.game)
                    }
                }).then(async (game: any) => {
                    return await Promise.all(game
                        .map(async (player: any) => {
                            const user = await this.models.User.findOne({
                                where: {
                                    id: player.name
                                }
                            });

                            return user.username;
                        })
                    );
                });

                return {
                    id: idx, 
                    game: game.game,
                    date: date,
                    turn: game.turn,
                    players: players
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
            tokens: 26
        });
        await this.models.Player.create({
            name: player2,
            game: gameId,
            turn: false,
            tokens: 25
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
    async checkNeighbors(row: number, col: number): Promise<boolean> {
        const right = await this.models.Tile.findOne({
            where: {
                row: row,
                column: col + 1
            }
        });

        const left = await this.models.Tile.findOne({
            where: {
                row: row,
                column: col - 1
            }
        });

        const above = await this.models.Tile.findOne({
            where: {
                row: row + 1,
                column: col
            }
        });

        const below = await this.models.Tile.findOne({
            where: {
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

        const { playerId } = await this.models.User.findOne({
            attributes: [['id', 'playerId']],
            where: {
                username: player
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

        const maxRow = await this.models.Tile.max('row');
        const maxCol = await this.models.Tile.max('column');
        const minRow = await this.models.Tile.min('row');
        const minCol = await this.models.Tile.min('column');

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
                        tile: tile.id
                    });
                }
                else if (await this.checkNeighbors(row, col)) {
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

        await Promise.all(players.map(async (player: any) => {
            const { name } = await this.models.User.findOne({
                attributes: [['username', 'name']],
                where: {
                    id: player.name
                }
            });

            player.name = name;
        }));
        
        return { status: 200, result: { 
                players, 
                layout,
                letters,
                tiles,
                numRows: maxRow - minRow + 3,
                numCols: maxCol - minCol + 3,
                extraTiles
            } 
        };
    }

    async endTurn(game: string, player: string, tokens: number[], tiles: any, letters: any, extraTiles: any) {
        
        const { playerId } = await this.models.User.findOne({
            attributes: [['id', 'playerId']],
            where: {
                username: player
            }
        });

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
            'DELETE FROM Tile', {
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
                id: tile.id,
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
                player: tile.player,
                letters: tile.letters,
            });
        }));

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

        return { status: 200, result: { newLetters, newExtraTiles } };
    }
}

export const controller = new Controller(models);