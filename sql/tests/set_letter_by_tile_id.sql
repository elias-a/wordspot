CREATE OR REPLACE FUNCTION set_letter_by_tile_id (
    v_letter VARCHAR(255),
    v_letter_index INT,
    v_tile_id VARCHAR(255)
) RETURNS SETOF type_letter_id AS $$
    UPDATE letter SET letter=v_letter WHERE id=(
        SELECT letter.id AS letter_id FROM letter 
            INNER JOIN tile_letter_map ON letter.id=tile_letter_map.letter_id
            INNER JOIN tile ON tile.id=tile_letter_map.tile_id
            WHERE tile.id=v_tile_id AND letter.letter_index=v_letter_index)
        RETURNING id;
$$ LANGUAGE SQL;
