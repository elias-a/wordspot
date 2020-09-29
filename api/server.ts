import { App } from './app';
import { api } from './api';
import { routes } from './routes';

const app = App(api, routes);

app.listen(3000);