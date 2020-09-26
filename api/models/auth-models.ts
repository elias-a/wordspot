import { Sequelize, DataTypes } from 'sequelize';
import bcrypt from 'bcrypt';

export class Models {
    sequelize: Sequelize;
    User: any;

    constructor(sequelize: Sequelize) {
        this.sequelize = sequelize;

        if (!this.sequelize.authenticate()) {
            console.log("Failed to connect to database");
        }

        this.init();
    }

    async init() {
        await this.initUser();
    }

    async initUser() {
        this.User = this.sequelize.define('User', {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            username: {
                type: DataTypes.STRING
            },
            password: {
                type: DataTypes.STRING
            }
        }, {
            tableName: 'User', 
            timestamps: false
        });

        await this.User.sync();

        if (!(await this.User.findAll()).length) {
            await this.User.create({
                username: 'player1',
                password: bcrypt.hashSync('testing1', 10)
            });
            await this.User.create({
                username: 'player2',
                password: bcrypt.hashSync('testing2', 10)
            });
        }
    }
}

export const models = new Models(new Sequelize({
    dialect: 'sqlite',
    storage: 'wordspot.db',
    query: {
        raw: true
    }
}));