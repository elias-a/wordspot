CREATE TABLE IF NOT EXISTS user_account (
    id VARCHAR(255) PRIMARY KEY,
    unverified_id VARCHAR(255) NULL,
    session_id VARCHAR(255) NULL,
    user_name VARCHAR(255) NOT NULL,
    phone VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS game (
    id VARCHAR(255) PRIMARY KEY,
    winner VARCHAR(255) NULL,
    date_created TIMESTAMP NOT NULL,
    date_modified TIMESTAMP NOT NULL,
    created_by VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS player (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    game_id VARCHAR(255) NOT NULL,
    tokens INT NOT NULL,
    turn BOOLEAN NULL,
    first_move BOOLEAN NULL
);

CREATE TABLE IF NOT EXISTS tile (
    id VARCHAR(255) PRIMARY KEY,
    row_index INT NULL,
    column_index INT NULL,
    tile_type VARCHAR(255) NOT NULL,
    owner_id VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS letter (
    id VARCHAR(255) PRIMARY KEY,
    letter_index INT NOT NULL,
    letter VARCHAR(1) NOT NULL,
    is_used BOOLEAN NOT NULL,
    game_id VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS tile_letter_map (
    id VARCHAR(255) PRIMARY KEY,
    tile_id VARCHAR(255) NOT NULL,
    letter_id VARCHAR(255) NOT NULL,
    game_id VARCHAR(255) NOT NULL
);
