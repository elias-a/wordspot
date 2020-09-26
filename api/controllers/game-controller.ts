import { models, Models } from '../models/game-models';
import { QueryTypes, Op } from 'sequelize';

export class Controller {
    models: Models;

    constructor(models: Models) {
        this.models = models;
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

    async getGameDetails() {
        const { game } = await this.models.Game.findOne({
            attributes: [['id', 'game']]
        });
        const players = await this.models.Player.findAll({
            where: {
                game: game
            }
        });
        const tiles = await this.models.Tile.findAll({
            where: {
                game: game
            }
        });
        const letters = await Promise.all(tiles.map(async (tile: any) => {
            return await this.models.Letter.findAll({
                where: {
                    tile: tile.id
                }
            });
        }));
        const playerId = players[0].turn ? players[0].id : players[1].id;
        const sql = `SELECT DISTINCT tile FROM ExtraTile WHERE
                     player=${playerId}`;
        const distinctTiles = await this.models.sequelize.query(sql, {
            type: QueryTypes.SELECT
        });
        let extraTiles: any = await Promise.all(distinctTiles.map(async (tile: any) => {
            return await this.models.ExtraTile.findAll({
                where: {
                    tile: tile.tile
                }
            });
        }));
        
        extraTiles = extraTiles.map((playerTiles: any) => {
            return playerTiles.filter((tile: any) => tile.length !== 0);
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

        return { status: 200, result: { 
                players: players, 
                letters: letters,
                layout: layout,
                tiles: tiles,
                numRows: maxRow - minRow + 3,
                numCols: maxCol - minCol + 3,
                extraTiles: extraTiles
            } 
        };
    }

    async endTurn(tokens: number[], tiles: any, letters: any, extraTiles: any) {

        const { player } = await this.models.Player.findOne({
            attributes: [['id', 'player']],
            where: {
                turn: true
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

            let sql = 'SELECT DISTINCT tile FROM ExtraTile';
            const numExtraTiles = (await this.models.sequelize.query(sql, {
                type: QueryTypes.SELECT
            })).length;
            sql = 'SELECT DISTINCT tile FROM AvailableTile';
            const numAvailableTiles = (await this.models.sequelize.query(sql, {
                type: QueryTypes.SELECT
            })).length;

            const extraTile = await this.models.AvailableTile.findAll({
                where: {
                    tile: numAvailableTiles
                }
            });

            extraTiles.push(extraTile.map((letter: any) => {
                return {
                    player: player,
                    tile: letter.tile,
                    letter: letter.letter,
                    index: letter.index
                };
            }));

            await this.models.AvailableTile.destroy({
                where: {
                    tile: numAvailableTiles
                }
            });
        }

        // Update turn and tokens
        await Promise.all((await this.models.Player.findAll())
            .map(async (player: any, index: number) => {
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
            `DELETE FROM ExtraTile WHERE player=${player}`, {
                type: QueryTypes.DELETE
            }
        );
        await this.models.sequelize.query(
            'DELETE FROM Letter', {
                type: QueryTypes.DELETE
            }
        );
        await this.models.sequelize.query(
            'DELETE FROM Tile', {
                type: QueryTypes.DELETE
            }
        );
        
        // Update tiles 
        await Promise.all(tiles.map(async (tile: any) => {
            await this.models.Tile.create({
                id: tile.id,
                row: tile.row,
                column: tile.column,
                game: tile.game
            });
        }));

        // Update letters
        await Promise.all(letters.map(async (tile: any) => {
            await Promise.all(tile.map(async (letter: any) => {
                const clicked = letter.hasOwnProperty('selected') 
                    || letter.clicked
                    ? true : false;
                await this.models.Letter.create({
                    id: letter.id,
                    letter: letter.letter,
                    tile: letter.tile,
                    index: letter.index,
                    clicked: clicked
                });
            }));
        }));

        // Update extra tiles
        await Promise.all(extraTiles.map(async (tile: any) => {
            await Promise.all(tile.map(async (letter: any) => {
                await this.models.ExtraTile.create({
                    player: letter.player,
                    tile: letter.tile,
                    letter: letter.letter,
                    index: letter.index
                });
            }));
        }));

        const newLetters = await Promise.all(tiles.map(async (tile: any) => {
            return await this.models.Letter.findAll({
                where: {
                    tile: tile.id
                }
            });
        }));

        const sql = `SELECT DISTINCT tile FROM ExtraTile WHERE
                     player <> ${player}`;
        const distinctTiles = await this.models.sequelize.query(sql, {
            type: QueryTypes.SELECT
        });
        const newExtraTiles: any = await Promise.all(distinctTiles.map(async (tile: any) => {
            return await this.models.ExtraTile.findAll({
                where: {
                    tile: tile.tile
                }
            });
        }));

        return { status: 200, result: { newLetters, newExtraTiles } };
    }
}

export const controller = new Controller(models);