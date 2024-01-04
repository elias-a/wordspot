DO $$ BEGIN
    CREATE TYPE type_game_players AS (
        first_player VARCHAR(255),
        winner VARCHAR(255),
        my_id VARCHAR(255),
        my_name VARCHAR(255),
        my_tokens INT,
        my_turn BOOLEAN,
        opponent_name VARCHAR(255),
        opponent_tokens INT,
        opponent_turn BOOLEAN
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

CREATE OR REPLACE FUNCTION get_game_players (
    _my_id VARCHAR(255),
    _game_id VARCHAR(255)
) RETURNS SETOF type_game_players AS $$
    SELECT
        CASE 
            WHEN my.first_move THEN my.player_id ELSE opponent.player_id 
        END AS first_player,
        game.winner AS winner,
        my.player_id AS my_id,
        my.name AS my_name,
        my.tokens AS my_tokens,
        my.turn AS my_turn,
        opponent.name AS opponent_name,
        opponent.tokens AS opponent_tokens,
        opponent.turn AS opponent_turn
    FROM (SELECT * FROM get_player WHERE user_id=_my_id) AS my
    INNER JOIN (SELECT * FROM get_player WHERE user_id!=_my_id) AS opponent
    ON my.game_id=opponent.game_id INNER JOIN game ON my.game_id=game.id
    WHERE game.id=_game_id;
$$ LANGUAGE SQL;
