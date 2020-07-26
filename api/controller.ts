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
        const tiles = await this.models.Tile.findAll({
            where: {
                game: game
            }
        });
        const players = await this.models.Player.findAll({
            where: {
                game: game
            }
        });
        
        return { status: 200, result: { tiles: tiles, players: players } };
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