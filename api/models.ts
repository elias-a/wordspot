import { Sequelize, DataTypes } from 'sequelize';

const tilesSet = [
    "SGPU", "HEAS", "XAIY",
    "LIEL", "RNAD", "OPPE",
    "CAKI", "TSOS", "MIAP",
    "PLAE", "ZEYA", "ENRI",
    "ILFL", "OSOT", "WOAT",
    "GNSA", "STHA", "IRTE",
    "CEKA", "VEIH", "NTOA",
    "EDER", "THEC", "DLEY",
    "ATIR", "VNSA", "ETND",
    "AJNO", "LRIG", "MORG",
    "RAIB", "BOUT"
];

const shuffledTiles = tilesSet.sort(() => Math.random() - 0.5);
const tiles = shuffledTiles.slice(0, 16);
const availableTiles = shuffledTiles.slice(16);

export class Models {
    sequelize: Sequelize;
    Game: any;
    Player: any;
    Tile: any;
    Letter: any;
    ExtraTile: any;
    AvailableTile: any;

    constructor(sequelize: Sequelize) {
        this.sequelize = sequelize;

        if (!this.sequelize.authenticate()) {
            console.log("Failed to connect to database");
        }

        this.init();
    }

    async init() {
        await this.initGame();
        await this.initPlayer();
        await this.initTile();
        await this.initLetter();
        await this.initExtraTile();
        await this.initAvailableTile();
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
            tableName: 'Game',
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
                type: DataTypes.BOOLEAN
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
                turn: true,
                tokens: 26
            });
            await this.Player.create({
                name: "Player 2",
                game: game,
                turn: false,
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
            row: {
                type: DataTypes.INTEGER
            },
            column: {
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
            tableName: 'Tile',
            timestamps: false
        });

        await this.Tile.sync();

        if (!(await this.Tile.findAll()).length) {
            const { game } = await this.Game.findOne({
                attributes: [['id', 'game']]
            });
            await Promise.all(tiles.map(async (tile, index) => {
                await this.Tile.create({
                    row: Math.floor(index / 4),
                    column: index % 4,
                    game: game
                });
            }));
        }
    }

    async initLetter() {
        this.Letter = this.sequelize.define('Letter', {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            letter: {
                type: DataTypes.STRING
            },
            tile: {
                type: DataTypes.INTEGER,
                references: {
                    model: 'Tile',
                    key: 'id'
                }
            },
            index: {
                type: DataTypes.INTEGER
            },
            clicked: {
                type: DataTypes.BOOLEAN
            }
        }, {
            tableName: 'Letter', 
            timestamps: false
        });

        await this.Letter.sync();

        if (!(await this.Letter.findAll()).length) {
            await Promise.all(tiles.map(async (tile, i) => {
                const letters = tile.split('');
                await Promise.all(letters.map(async (letter, j) => {
                    await this.Letter.create({
                        letter: letter,
                        tile: i + 1,
                        index: j,
                        clicked: false
                    });
                }));
            }));
        }
    }

    async initExtraTile() {
        this.ExtraTile = this.sequelize.define('ExtraTile', {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true 
            },
            player: {
                type: DataTypes.INTEGER,
                references: {
                    model: 'player',
                    key: 'id'
                }
            },
            tile: {
                type: DataTypes.INTEGER
            },
            letter: {
                type: DataTypes.STRING
            },
            index: {
                type: DataTypes.INTEGER 
            }
        }, {
            tableName: 'ExtraTile',
            timestamps: false
        });

        await this.ExtraTile.sync();
    }

    async initAvailableTile() {
        this.AvailableTile = this.sequelize.define('AvailableTile', {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            tile: {
                type: DataTypes.INTEGER
            },
            letter: {
                type: DataTypes.STRING
            },
            index: {
                type: DataTypes.INTEGER
            }
        }, {
            tableName: 'AvailableTile',
            timestamps: false
        });

        await this.AvailableTile.sync();

        if (!(await this.AvailableTile.findAll()).length) {
            await Promise.all(availableTiles.map(async (tile, i) => {
                const letters = tile.split('');
                await Promise.all(letters.map(async (letter, j) => {
                    await this.AvailableTile.create({
                        tile: i + 1,
                        letter: letter,
                        index: j,
                    });
                }));
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