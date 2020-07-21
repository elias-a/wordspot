import { models, Models } from './models';

export class Controller {
    models: Models;

    constructor(models: Models) {
        this.models = models;
    }

    async getTiles() {
        const tiles = await this.models.Tile.findAll({});

        return { status: 200, result: tiles };
    }
}

export const controller = new Controller(models);