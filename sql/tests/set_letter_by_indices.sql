DO $$ BEGIN
    CREATE TYPE type_letter_id AS (
        letter_id VARCHAR(255)
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

CREATE OR REPLACE FUNCTION set_letter_by_indices (
    v_letter VARCHAR(255),
    v_row_index INT,
    v_column_index INT,
    v_letter_index INT,
    v_game_id VARCHAR(255)
) RETURNS SETOF type_letter_id AS $$
    UPDATE letter SET letter=v_letter WHERE id=(
        SELECT letter.id AS letter_id FROM letter 
            INNER JOIN tile_letter_map ON letter.id=tile_letter_map.letter_id
            INNER JOIN tile ON tile.id=tile_letter_map.tile_id
            WHERE 
                tile.row_index=v_row_index AND 
                tile.column_index=v_column_index AND 
                letter.letter_index=v_letter_index AND
                letter.game_id=v_game_id)
        RETURNING id;
$$ LANGUAGE SQL;
