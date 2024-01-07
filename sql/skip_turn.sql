CREATE OR REPLACE PROCEDURE skip_turn (
    v_game_id VARCHAR(255),
    v_player_id VARCHAR(255)
) AS $$
BEGIN
    PERFORM assign_extra_tile(v_game_id, v_player_id);
    UPDATE player SET tokens=tokens+2, turn=FALSE WHERE id=v_player_id;
    UPDATE player SET turn=TRUE WHERE id!=v_player_id AND game_id=v_game_id;
END;
$$ LANGUAGE plpgsql;
