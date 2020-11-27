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

        this.router.post('/get-games', async (ctx) => {
            const { player } = ctx.request.body;
            const { status, result } = await this.gameController.getGames(player);
            ctx.status = status;
            ctx.body = result;
        });

        this.router.post('/start-game', async (ctx) => {
            const { player } = ctx.request.body;
            const { status, result } = await this.gameController.startGame(player);
            ctx.status = status;
            ctx.body = result;
        });

        this.router.post('/get-game-details', async (ctx) => {
            const { player, game } = ctx.request.body;
            const { status, result } = await this.gameController.getGameDetails(player, game);
            
            ctx.status = status;
            ctx.body = result;
        });

        this.router.post('/end-turn', async (ctx) => {
            const { game, player, tokens, tiles, letters, extraTiles, turn } = ctx.request.body;
            const { status, result } = await this.gameController.endTurn(game, player, tokens, tiles, letters, extraTiles, turn);
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