CREATE OR REPLACE FUNCTION assign_extra_tile (
    v_game_id VARCHAR(255),
    v_player_id VARCHAR(255)
) RETURNS VARCHAR(255) AS $$
DECLARE
    v_tile_id VARCHAR(255);
BEGIN 
    UPDATE tile SET tile_type='Extra', owner_id=v_player_id
        WHERE id=(
            SELECT id FROM tile 
                WHERE tile_type='Option' AND owner_id=v_game_id
                ORDER BY RANDOM() LIMIT 1)
        RETURNING id INTO v_tile_id;

    IF v_tile_id IS NULL THEN
        RAISE EXCEPTION 'No extra tiles left to assign';
    END IF;

    RETURN v_tile_id;
END;
$$ LANGUAGE plpgsql;
