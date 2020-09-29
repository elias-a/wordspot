import Router from 'koa-router';
import path from 'path';
import { createReadStream } from 'fs';

export class Routes {
    router: Router;

    constructor() {
        this.router = new Router();

        this.router.get('/login', async (ctx) => {
            ctx.type = 'html';
            ctx.body = createReadStream(path.join(__dirname, '../web/index.html'));
        });
    }
}

export const routes = new Routes();