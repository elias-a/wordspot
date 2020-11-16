import { models, Models } from '../models/models';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

export class Controller {
    models: Models;

    constructor(models: Models) {
        this.models = models;
    }

    async login(username: string, password: string) {

        const user = await this.models.User.findOne({
            where: {
                username: username
            }
        });

        if (!user) {
            return { status: 200, result: {
                    status: false,
                    error: 'Incorrect username or password'
                }
            };
        }

        const passwordsMatch = bcrypt.compareSync(password, user.password);
        if (!passwordsMatch) {
            return { status: 200, result: {
                status: false,
                error: 'Incorrect username or password'
            }
        };
        }

        const secret = crypto.randomBytes(64).toString('hex');
        const token = jwt.sign(username, secret);

        return { status: 200, result: {
                status: true,
                token: token,
                player: username
            }
        };
    }
}

export const controller = new Controller(models);