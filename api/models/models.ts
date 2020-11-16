import { Sequelize, DataTypes } from 'sequelize';

export class Models {
    sequelize: Sequelize;
    User: any;
    Game: any;
    Player: any;
    Tile: any;
    AvailableTile: any;
    ExtraTile: any;

    constructor(sequelize: Sequelize) {
        this.sequelize = sequelize;

        if (!this.sequelize.authenticate()) {
            console.log("Failed to connect to database");
        }

        this.init();
    }

    async init() {
        await this.initUser();
        await this.initGame();
        await this.initPlayer();
        await this.initTile();
        await this.initAvailableTile();
        await this.initExtraTile();
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
    }

    async initPlayer() {
        this.Player = this.sequelize.define('Player', {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            name: {
                type: DataTypes.INTEGER,
                references: {
                    model: 'User',
                    key: 'id'
                }
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
    }

    async initTile() {
        this.Tile = this.sequelize.define('Tile', {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            game: {
                type: DataTypes.INTEGER,
                references: {
                    model: 'Game',
                    key: 'id'
                }
            },
            row: {
                type: DataTypes.INTEGER
            },
            column: {
                type: DataTypes.INTEGER
            },
            letters: {
                type: DataTypes.STRING
            },
            clicked: {
                type: DataTypes.STRING
            }
        }, {
            tableName: 'Tile',
            timestamps: false
        });

        await this.Tile.sync();
    }

    async initAvailableTile() {
        this.AvailableTile = this.sequelize.define('AvailableTile', {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            game: {
                type: DataTypes.INTEGER,
                references: {
                    model: 'Game',
                    key: 'id'
                }
            },
            letters: {
                type: DataTypes.STRING
            }
        }, {
            tableName: 'AvailableTile',
            timestamps: false
        });

        await this.AvailableTile.sync();
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
            letters: {
                type: DataTypes.STRING
            }
        }, {
            tableName: 'ExtraTile',
            timestamps: false
        });

        await this.ExtraTile.sync();
    }
}

export const models = new Models(new Sequelize({
    dialect: 'sqlite',
    storage: 'wordspot.db',
    query: {
        raw: true
    },
    logging: false
}));