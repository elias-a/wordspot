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
    Player: any;
    Tile: any;

    constructor(sequelize: Sequelize) {
        this.sequelize = sequelize;

        if (!this.sequelize.authenticate()) {
            console.log("Failed to connect to database");
        }

        this.initGame();
        this.initPlayer();
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

    async initPlayer() {
        this.Player = this.sequelize.define('Player', {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            name: {
                type: DataTypes.STRING
            },
            game: {
                type: DataTypes.INTEGER,
                references: {
                    model: 'Game',
                    key: 'id'
                }
            },
            turn: {
                type: DataTypes.INTEGER
            },
            tokens: {
                type: DataTypes.INTEGER
            }
        }, {
            tableName: 'Player',
            timestamps: false 
        });

        await this.Player.sync();

        if (!(await this.Player.findAll()).length) {
            const { game } = await this.Game.findOne({
                attributes: [['id', 'game']]
            });

            await this.Player.create({
                name: "Player 1",
                game: game,
                turn: 1,
                tokens: 26
            });
            await this.Player.create({
                name: "Player 2",
                game: game,
                turn: 0,
                tokens: 25
            })
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
            },
            game: {
                type: DataTypes.INTEGER,
                references: {
                    model: 'Game',
                    key: 'id'
                }
            }
        }, {
            tableName: "Tile",
            timestamps: false
        });

        await this.Tile.sync();

        if (!(await this.Tile.findAll()).length) {
            const { game } = await this.Game.findOne({
                attributes: [['id', 'game']]
            });
            const perms = [...Array(16).keys()].sort(() => Math.random() - 0.5);
            await Promise.all(perms.map(async (num, index) => {
                await this.Tile.create({
                    letters: tiles[Math.floor(Math.random() * tiles.length)],
                    location: index,
                    game: game
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