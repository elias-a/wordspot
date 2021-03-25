import Router from 'koa-router';
import path from 'path';
import { createReadStream } from 'fs';
import { models, Models } from './models/models';

export class Routes {
    router: Router;

    constructor(models: Models) {
        this.router = new Router();

        this.router.get('/login', async (ctx) => {
            ctx.type = 'html';
            ctx.body = createReadStream(path.join(__dirname, '../web/index.html'));
        });

        this.router.get('/dashboard', async (ctx) => {
            ctx.type = 'html';
            ctx.body = createReadStream(path.join(__dirname, '../web/index.html'));
        });

        this.router.get('/game/:id', async (ctx) => {
            const game = await models.Game.findOne({
                where: {
                    name: ctx.params.id
                }
            });

            ctx.type = 'html';
            
            if (game !== null) {
                ctx.body = createReadStream(path.join(__dirname, '../web/index.html'));
            } else {
                ctx.redirect('http://' + ctx.header.host + '/404');
            }
        });

        this.router.get('/', async (ctx) => {
            ctx.type = 'html';
            ctx.body = createReadStream(path.join(__dirname, '../web/index.html'));
        });
    }
}

export const routes = new Routes(models);