DO $$ BEGIN
    CREATE TYPE type_get_tile_letters_return AS (
        v_id VARCHAR(255),
        v_letter VARCHAR(255),
        v_letter_index INT,
        v_is_used BOOL
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

CREATE OR REPLACE FUNCTION get_tile_letters (
    v_tile_id VARCHAR(255)
) RETURNS SETOF type_get_tile_letters_return AS $$
    SELECT 
        letter.id,
        letter.letter,
        letter.letter_index,
        letter.is_used 
    FROM letter 
        INNER JOIN tile_letter_map ON letter.id=tile_letter_map.letter_id
        INNER JOIN tile ON tile.id=tile_letter_map.tile_id
        WHERE tile.id=v_tile_id;
$$ LANGUAGE SQL;
