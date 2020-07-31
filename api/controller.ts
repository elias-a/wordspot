import { models, Models } from './models';

export class Controller {
    models: Models;

    constructor(models: Models) {
        this.models = models;
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
        
        const maxRow = await this.models.Tile.max('row');
        const maxCol = await this.models.Tile.max('column');
        
        let layout: boolean[] = [];
        for (let row = 0; row <= maxRow; ++row) {
            for (let col = 0; col <= maxCol; ++col) {
                const tile = await this.models.Tile.findOne({
                    where: {
                        row: row,
                        column: col
                    }
                });

                if (tile) layout.push(true);
                else layout.push(false);
            }
        }

        return { status: 200, result: { 
                players: players, 
                letters: letters,
                layout: layout,
                numRows: maxRow + 1,
                numCols: maxCol + 1
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