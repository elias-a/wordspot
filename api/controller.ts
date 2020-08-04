import { models, Models } from './models';

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
        const extraTiles = await Promise.all(players.map(async (player: any) => {
            return await this.models.ExtraTile.findAll({
                where: {
                    player: player.id
                }
            })
        }));
        
        const maxRow = await this.models.Tile.max('row');
        const maxCol = await this.models.Tile.max('column');
        const minRow = await this.models.Tile.min('row');
        const minCol = await this.models.Tile.min('column');

        let layout: number[] = [];
        for (let row = minRow - 1; row <= maxRow + 1; ++row) {
            for (let col = minCol - 1; col <= maxCol + 1; ++col) {
                const tile = await this.models.Tile.findOne({
                    where: {
                        row: row,
                        column: col
                    }
                });

                // 2: tile
                // 1: valid spot to add tile
                // 0: placeholder spot

                if (tile) layout.push(2);
                else if (await this.checkNeighbors(row, col)) layout.push(1);
                else layout.push(0);
            }
        }

        return { status: 200, result: { 
                players: players, 
                letters: letters,
                layout: layout,
                numRows: maxRow - minRow + 3,
                numCols: maxCol - minCol + 3,
                extraTiles: extraTiles
            } 
        };
    }

    async endTurn() {
        await Promise.all((await this.models.Player.findAll()).map(async (player: any) => {
            const turn = player.turn ? 0 : 1;

            await this.models.Player.update({
                turn: turn
            }, {
                where: {
                    id: player.id
                }
            });
        }));

        return { status: 200, result: "" };
    }
}

export const controller = new Controller(models);
