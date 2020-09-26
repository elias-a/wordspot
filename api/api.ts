import Router from 'koa-router';
import { 
    controller as gameController, 
    Controller as GameController
} from './controllers/game-controller';
import {
    controller as authController,
    Controller as AuthController 
} from './controllers/auth-controller';

export class Api {
    router: Router;
    gameController: GameController;
    authController: AuthController;

    constructor(gameController: GameController, authController: AuthController) {
        this.router = new Router({
            prefix: '/api'
        });
        this.gameController = gameController;
        this.authController = authController;

        // Game routes 

        this.router.get('/get-game-details', async (ctx) => {
            const { status, result } = await this.gameController.getGameDetails();
            ctx.status = status;
            ctx.body = result;
        });

        this.router.post('/end-turn', async (ctx) => {
            const { tokens, tiles, letters, extraTiles } = ctx.request.body;
            const { status, result } = await this.gameController.endTurn(tokens, tiles, letters, extraTiles);
            ctx.status = status;
            ctx.body = result;
        });

        // Authentication routes

        this.router.post('/login', async (ctx) => {
            const { username, password } = ctx.request.body;
            const { status, result } = await this.authController.login(username, password);
            ctx.status = status;
            ctx.body = result;
        });
    }
}

export const api = new Api(gameController, authController);