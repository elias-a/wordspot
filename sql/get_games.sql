DO $$ BEGIN
    CREATE TYPE get_games_type AS (
        game_id VARCHAR(255),
        date_created VARCHAR(255),
        first_player VARCHAR(255),
        winner VARCHAR(255),
        my_id VARCHAR(255),
        my_name VARCHAR(255),
        my_turn BOOLEAN,
        opponent_name VARCHAR(255)
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

CREATE OR REPLACE FUNCTION get_games (
    v_user_id VARCHAR(255)
) RETURNS SETOF get_games_type AS $$
    SELECT
        game.id AS game_id,
        TO_CHAR(game.date_created, 'MM/DD/YYYY') AS date_created,
        CASE 
            WHEN my.first_move THEN my.player_id ELSE opponent.player_id
        END AS first_player,
        game.winner AS winner,
        my.player_id AS my_id,
        my.name AS my_name,
        my.turn AS my_turn,
        opponent.name AS opponent_name
    FROM (SELECT * FROM get_player WHERE user_id=v_user_id) AS my
    INNER JOIN (SELECT * FROM get_player WHERE user_id!=v_user_id) AS opponent
    ON my.game_id=opponent.game_id INNER JOIN game ON my.game_id=game.id
    ORDER BY game.date_created DESC;
$$ LANGUAGE SQL;
