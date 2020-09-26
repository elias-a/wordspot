import { models, Models } from '../models/auth-models';

export class Controller {
    models: Models;

    constructor(models: Models) {
        this.models = models;
    }

    async login(username: string, password: string) {
        console.log(username, password)

        return { status: 200, result: {

            }
        }
    }
}

export const controller = new Controller(models);