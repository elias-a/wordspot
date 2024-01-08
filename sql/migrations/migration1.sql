BEGIN;
    ALTER TABLE player ADD FOREIGN KEY (user_id) REFERENCES user_account;
    ALTER TABLE player ADD FOREIGN KEY (game_id) REFERENCES game
        ON DELETE CASCADE;
    ALTER TABLE letter ADD FOREIGN KEY (game_id) REFERENCES game 
        ON DELETE CASCADE;
    ALTER TABLE tile_letter_map ADD FOREIGN KEY (tile_id) REFERENCES tile
        ON DELETE CASCADE;
    ALTER TABLE tile_letter_map ADD FOREIGN KEY (letter_id) REFERENCES letter 
        ON DELETE CASCADE;
    ALTER TABLE tile_letter_map ADD FOREIGN KEY (game_id) REFERENCES game
        ON DELETE CASCADE;

    CREATE OR REPLACE FUNCTION tile_cascade() RETURNS trigger AS $$
    BEGIN
        DELETE FROM tile WHERE owner_id=OLD.id;
        RETURN OLD;
    END;
    $$ LANGUAGE plpgsql;

    CREATE TRIGGER delete_tile_on_game_drop
       AFTER DELETE ON game FOR EACH ROW
       EXECUTE FUNCTION tile_cascade();

    CREATE TRIGGER delete_tile_on_player_drop
        AFTER DELETE ON player FOR EACH ROW
        EXECUTE FUNCTION tile_cascade();
COMMIT;
