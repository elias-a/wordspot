CREATE OR REPLACE VIEW get_tiles AS
SELECT 
    tile.id AS tile_id,
    tile.row_index AS row_index,
    tile.column_index AS column_index,
    tile.tile_type AS tile_type,
    letter.id AS letter_id,
    letter.letter_index AS letter_index,
    letter.letter AS letter,
    letter.is_used AS is_used,
    tile.owner_id AS owner_id
FROM tile LEFT JOIN tile_letter_map ON tile.id=tile_letter_map.tile_id
LEFT JOIN letter ON tile_letter_map.letter_id=letter.id
WHERE tile_type!='Option' AND tile_type!='Extra';

CREATE OR REPLACE VIEW get_player AS 
SELECT 
    game_id AS game_id,
    player.user_id AS user_id,
    player.id AS player_id,
    user_account.user_name AS name,
    tokens AS tokens,
    turn AS turn,
    first_move AS first_move
FROM player INNER JOIN user_account ON player.user_id=user_account.id;

CREATE OR REPLACE VIEW get_player_extra_tiles AS
SELECT
    tile.id AS tile_id,
    letter.id AS letter_id,
    letter.letter_index AS letter_index,
    letter.letter AS letter,
    player.game_id AS game_id,
    player.user_id AS user_id
FROM tile INNER JOIN player ON player.id=tile.owner_id
LEFT JOIN tile_letter_map ON tile.id=tile_letter_map.tile_id
LEFT JOIN letter ON tile_letter_map.letter_id=letter.id;
