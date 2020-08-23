import Router from 'koa-router';
import { controller, Controller } from './controller';

export class Api {
    router: Router;
    controller: Controller;

    constructor(controller: Controller) {
        this.router = new Router({
            prefix: '/api'
        });
        this.controller = controller;

        this.router.get('/get-game-details', async (ctx) => {
            const { status, result } = await this.controller.getGameDetails();
            ctx.status = status;
            ctx.body = result;
        });

        this.router.post('/end-turn', async (ctx) => {
            const { tokens, tiles, letters, extraTiles } = ctx.request.body;
            const { status, result } = await this.controller.endTurn(tokens, tiles, letters, extraTiles);
            ctx.status = status;
            ctx.body = result;
        });
    }
}

export const api = new Api(controller);