CREATE TABLE IF NOT EXISTS UserAccount (
    id VARCHAR(255) NOT NULL,
    unverifiedId VARCHAR(255),
    sessionId VARCHAR(255),
    userName VARCHAR(255) NOT NULL,
    phone VARCHAR(255) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE (phone)
);

CREATE TABLE IF NOT EXISTS Game (
    id VARCHAR(255) NOT NULL,
    userId1 VARCHAR(255) NOT NULL,
    userId2 VARCHAR(255) NOT NULL,
    winner VARCHAR(255),
    dateCreated DATETIME NOT NULL,
    dateModified DATETIME NOT NULL,
    createdBy VARCHAR(255) NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS Player (
    id VARCHAR(255) NOT NULL,
    userId VARCHAR(255) NOT NULL,
    gameId VARCHAR(255) NOT NULL,
    tokens INT NOT NULL,
    turn BOOL,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS Tile (
    id VARCHAR(255) NOT NULL,
    rowIndex INT,
    columnIndex INT,
    tileType VARCHAR(255) NOT NULL,
    ownerId VARCHAR(255) NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS Letter (
    id VARCHAR(255) NOT NULL,
    letterIndex INT NOT NULL,
    letter VARCHAR(1) NOT NULL,
    isUsed BOOL NOT NULL,
    gameId VARCHAR(255) NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS TileLetterMap (
    id VARCHAR(255) NOT NULL,
    tileId VARCHAR(255) NOT NULL,
    letterId VARCHAR(255) NOT NULL,
    gameId VARCHAR(255) NOT NULL,
    PRIMARY KEY (id)
);
