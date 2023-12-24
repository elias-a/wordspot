CREATE OR REPLACE FUNCTION clear_database ()
RETURNS VOID AS $$
BEGIN
    DELETE FROM tile_letter_map;
    DELETE FROM letter;
    DELETE FROM tile;
    DELETE FROM player;
    DELETE FROM game;
    DELETE FROM user_account;
END;

$$ LANGUAGE plpgsql;
