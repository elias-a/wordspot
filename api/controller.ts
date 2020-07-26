import { models, Models } from './models';

export class Controller {
    models: Models;

    constructor(models: Models) {
        this.models = models;
    }

    async getTiles() {
        const { game } = await this.models.Game.findOne({
            attributes: [['id', 'game']]
        });
        const tiles = await this.models.Tile.findAll({
            where: {
                game: game
            }
        });

        return { status: 200, result: tiles };
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
}

export const controller = new Controller(models);