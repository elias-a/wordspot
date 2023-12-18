DO $$ BEGIN
    CREATE TYPE extra_tile AS (
        id VARCHAR(255),
        row_index INT,
        column_index INT
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE updated_tile AS (
        id VARCHAR(255),
        tile_type VARCHAR(255)
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE new_tile AS (
        id VARCHAR(255),
        tile_type VARCHAR(255),
        row_index INT,
        column_index INT
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

CREATE OR REPLACE FUNCTION end_turn (
    updated_game_id VARCHAR(255),
    clicked_letter_ids VARCHAR(255)[],
    placed_extra_tile extra_tile,
    updated_tiles updated_tile[],
    new_tiles new_tile[]
)
RETURNS VARCHAR(255) AS $$
DECLARE
    player1_id VARCHAR(255);
    player2_id VARCHAR(255);
    remaining_tokens INT;
    clicked_letter_i VARCHAR(255);
    replaced_tile_id VARCHAR(255);
    updated_tile_i updated_tile;
    new_tile_i new_tile;
BEGIN

    /*
    Update player1's tokens and change turn to false.
    */
    SELECT id INTO player1_id FROM player 
        WHERE game_id=updated_game_id AND turn=TRUE;
    UPDATE player SET tokens=tokens-ARRAY_LENGTH(clicked_letter_ids, 1),
        turn=FALSE WHERE id=player1_id
        RETURNING tokens INTO remaining_tokens;

    /*
    Change player2's turn to true.
    */
    SELECT id INTO player2_id FROM player
        WHERE game_id=updated_game_id AND turn=FALSE;
    UPDATE player SET turn=TRUE WHERE id=player2_id;

    /*
    If the player now has 0 tokens, declare them the winner.
    */
    IF remaining_tokens = 0 THEN
        UPDATE game SET winner=player1_id WHERE id=updated_game_id;
    END IF;

    /*
    Change clicked letter status to `is_used`.
    */
    FOREACH clicked_letter_i IN ARRAY clicked_letter_ids
    LOOP
        UPDATE letter SET is_used=TRUE WHERE id=clicked_letter_i;
    END LOOP;

    IF placed_extra_tile IS NOT NULL THEN
        
    /*
    Get the previous tile ID at the location where the extra tile was placed.
    */
    SELECT id INTO replaced_tile_id FROM tile WHERE game_id=updated_game_id 
        AND row_index=placed_extra_tile.row_index 
        AND column_index=placed_extra_tile.column_index;

    /*
    Player placed extra tile. Update the row and column index 
    and change the type of tile to "Tile". This tile was previously
    "Extra" and belonged to a player.
    */
    UPDATE tile SET 
        row_index=placed_extra_tile.row_index,
        column_index=placed_extra_tile.column_index,
        tile_type="Tile",
        game_id=updated_game_id WHERE id=placed_extra_tile.id;

    /*
    Delete the tile at the location where the extra tile was placed.
    */
    DELETE FROM tile WHERE id=replaced_tile_id;

    /*
    Due to the placement of an extra tile, the tile type of some existing
    tiles needs to be updated.
    */
    FOREACH updated_tile_i IN ARRAY updated_tiles
    LOOP
        UPDATE tile SET tile_type=updated_tile_i.tile_type
            WHERE id=updated_tile_i.id;
    END LOOP;

    /*
    Due to the placement of an extra tile, new tiles have to be added to the 
    board to keep the grid structure.
    */
    FOREACH new_tile_i IN ARRAY new_tiles
    LOOP
        INSERT INTO tile (id, tile_type, row_index, column_index, owner_id)
            VALUES (
                new_tile_i.id,
                new_tile_i.tile_type,
                new_tile_i.row_index,
                new_tile_i.column_index,
                owner_id=updated_game_id);
    END LOOP;

    END IF;

    RETURN updated_game_id;

END;

$$ LANGUAGE plpgsql;
