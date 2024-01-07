CREATE OR REPLACE FUNCTION get_tile_letters (
    v_tile_id VARCHAR(255)
) RETURNS SETOF letter_type AS $$
    SELECT 
        letter.id,
        letter.letter_index,
        letter.letter,
        letter.is_used,
        letter.game_id
    FROM letter 
        INNER JOIN tile_letter_map ON letter.id=tile_letter_map.letter_id
        INNER JOIN tile ON tile.id=tile_letter_map.tile_id
        WHERE tile.id=v_tile_id;
$$ LANGUAGE SQL;
