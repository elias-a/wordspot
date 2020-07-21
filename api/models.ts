import { Sequelize, DataTypes } from 'sequelize';

export class Models {
    sequelize: Sequelize;
    Game: any;
    Tile: any;

    constructor(sequelize: Sequelize) {
        this.sequelize = sequelize;

        if (!this.sequelize.authenticate()) {
            console.log("Failed to connect to database");
        }

        this.initGame();
        this.initTile();
    }

    async initGame() {
        this.Game = this.sequelize.define('Game', {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            name: {
                type: DataTypes.STRING
            }
        });

        await this.Game.sync();

        if (!(await this.Game.findAll()).length) {
            await this.Game.create({
                name: "game1"
            });
        }
    }

    async initTile() {
        this.Tile = this.sequelize.define('Tile', {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            letters: {
                type: DataTypes.STRING
            },
            location: {
                type: DataTypes.INTEGER
            }
        });

        await this.Tile.sync();

        if (!(await this.Tile.findAll()).length) {
            await this.Tile.create({
                letters: Math.random().toString(36).slice(4)
            });
        }
    }
}

export const models = new Models(new Sequelize({
    dialect: 'sqlite',
    storage: 'wordspot.db'
}));