import Koa from 'koa';
import path from 'path';
import serve from 'koa-static';
import bodyParser from 'koa-bodyparser';
import { createReadStream } from 'fs';
import { Api } from './api';
import { Routes } from './routes';

export function App(api: Api, routes: Routes): Koa {
    const app = new Koa();

    app.use(bodyParser());

    app.use(async (ctx, next) => {
        try {
            await next();
        } catch (err) {
            ctx.status = 500;
            ctx.message = err.message || "An error has occurred";
        }
    });

    app.use(api.router.routes()).use(api.router.allowedMethods());
    app.use(routes.router.routes()).use(routes.router.allowedMethods());
    app.use(serve(path.join(__dirname, '../web')));

    app.use((ctx) => {
        ctx.type = 'html';
        ctx.body = createReadStream(path.join(__dirname, '../web/404.html'));
    });

    return app;
}