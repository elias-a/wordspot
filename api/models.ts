import { Sequelize, DataTypes } from 'sequelize';

const tiles = [
    'SGPU', 'HEAS', 'XAIY',
    'LIEL', 'RNAD', 'OPPE',
    'CAKI', 'TSOS', 'MIAP',
    'PLAE', 'ZEYA', 'ENRI',
    'ILFL', 'OSOT', 'WOAT',
    'GNSA', 'STHA', 'IRTE',
    'CEKA', 'VEIH', 'NTOA',
    'EDER', 'THEC', 'DLEY',
    'ATIR', 'VNSA', 'ETND',
    'AJNO', 'LRIG', 'MORG',
    'RAIB', 'BOUT'
];

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
        }, {
            tableName: "Game",
            timestamps: false
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
        }, {
            tableName: "Tile",
            timestamps: false
        });

        await this.Tile.sync();

        if (!(await this.Tile.findAll()).length) {
            const perms = [...Array(16).keys()].sort(() => Math.random() - 0.5);
            await Promise.all(perms.map(async (num, idx) => {
                await this.Tile.create({
                    letters: tiles[Math.floor(Math.random() * tiles.length)],
                    location: idx
                });
            }));
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