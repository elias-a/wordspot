DO $$ BEGIN
    CREATE TYPE game_type AS (
        id VARCHAR(255),
        winner VARCHAR(255),
        date_created TIMESTAMP,
        date_modified TIMESTAMP,
        created_by VARCHAR(255)
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE player_type AS (
        id VARCHAR(255),
        user_id VARCHAR(255),
        game_id VARCHAR(255),
        tokens INT,
        turn BOOLEAN,
        first_move BOOLEAN
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE tile_type AS (
        id VARCHAR(255),
        row_index INT,
        column_index INT,
        tile_type VARCHAR(255),
        owner_id VARCHAR(255)
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE letter_type AS (
        id VARCHAR(255),
        letter_index INT,
        letter VARCHAR(1),
        is_used BOOLEAN,
        game_id VARCHAR(255)
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE tile_letter_map_type AS (
        id VARCHAR(255),
        tile_id VARCHAR(255),
        letter_id VARCHAR(255),
        game_id VARCHAR(255)
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

CREATE OR REPLACE FUNCTION create_game (
    game_to_create game_type,
    player1_to_create player_type,
    player2_to_create player_type,
    tiles_to_create tile_type[],
    letters_to_create letter_type[],
    tile_letter_map_to_create tile_letter_map_type[]
)
RETURNS VARCHAR(255) AS $$
DECLARE
    tile tile_type;
    letter letter_type;
    map tile_letter_map_type;
    created_game_id VARCHAR(255);
BEGIN

    INSERT INTO game (id, winner, date_created, date_modified, created_by)
        VALUES (
            game_to_create.id,
            game_to_create.winner,
            game_to_create.date_created,
            game_to_create.date_modified,
            game_to_create.created_by)
    RETURNING id INTO created_game_id;

    INSERT INTO player (id, user_id, game_id, tokens, turn, first_move)
        VALUES (
            player1_to_create.id,
            player1_to_create.user_id,
            player1_to_create.game_id,
            player1_to_create.tokens,
            player1_to_create.turn,
            player1_to_create.first_move);

    INSERT INTO player (id, user_id, game_id, tokens, turn, first_move)
        VALUES (
            player2_to_create.id,
            player2_to_create.user_id,
            player2_to_create.game_id,
            player2_to_create.tokens,
            player2_to_create.turn,
            player2_to_create.first_move);

    FOREACH tile IN ARRAY tiles_to_create
    LOOP
        INSERT INTO tile (id, row_index, column_index, tile_type, owner_id)
            VALUES (
                tile.id,
                tile.row_index,
                tile.column_index,
                tile.tile_type,
                tile.owner_id);
    END LOOP;

    FOREACH letter IN ARRAY letters_to_create
    LOOP
        INSERT INTO letter (id, letter_index, letter, is_used, game_id)
            VALUES (
                letter.id,
                letter.letter_index,
                letter.letter,
                letter.is_used,
                letter.game_id);
    END LOOP;

    FOREACH map in ARRAY tile_letter_map_to_create
    LOOP
        INSERT INTO tile_letter_map (id, tile_id, letter_id, game_id)
            VALUES (map.id, map.tile_id, map.letter_id, map.game_id);
    END LOOP;

    return created_game_id;

END;

$$ LANGUAGE plpgsql;
