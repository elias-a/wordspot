BEGIN;
    ALTER TYPE get_games_type ALTER ATTRIBUTE my_turn TYPE BOOLEAN;
COMMIT;
