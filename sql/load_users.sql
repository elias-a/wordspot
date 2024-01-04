DO $$ BEGIN
    CREATE TYPE user_type AS (
        id VARCHAR(255),
        user_name VARCHAR(255),
        phone VARCHAR(255)
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

CREATE OR REPLACE FUNCTION load_users (
    users_to_load user_type[]
) RETURNS VOID AS $$
DECLARE
    user_i user_type;
BEGIN
    FOREACH user_i IN ARRAY users_to_load
    LOOP
        INSERT INTO user_account (id, user_name, phone)
            VALUES (user_i.id, user_i.user_name, user_i.phone);
    END LOOP;
END;

$$ LANGUAGE plpgsql;
