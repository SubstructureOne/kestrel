CREATE OR REPLACE FUNCTION increment_db_size(p_userid uuid, p_appid bigint, p_amount bigint)
    RETURNS void
    LANGUAGE plpgsql
AS $$
    BEGIN
        IF p_amount < 0 THEN
            RAISE EXCEPTION 'Increment size must be non-negative: %', p_amount;
        END IF;
        LOOP
            UPDATE userapps
                SET dbsize = dbsize + p_amount
                WHERE userid = p_userid AND appid = p_appid;
            IF FOUND THEN
                RETURN;
            END IF;
            BEGIN
                INSERT INTO userapps (userid, appid, dbsize)
                VALUES (p_userid, p_appid, p_amount);
                RETURN;
            EXCEPTION WHEN unique_violation THEN
                -- try again
            END;
        END LOOP;
    END;
$$;


CREATE OR REPLACE FUNCTION increment_files_size(p_userid uuid, p_appid bigint, p_amount bigint)
    RETURNS void
    LANGUAGE plpgsql
AS $$
    BEGIN
        IF p_amount < 0 THEN
            RAISE EXCEPTION 'Increment size must be non-negative: %', amount;
        END IF;
        LOOP
            UPDATE userapps
                SET filesize = filesize + p_amount
                WHERE userid = p_userid AND appid = p_appid;
            IF FOUND THEN
                RETURN;
            END IF;
            BEGIN
                INSERT INTO userapps (userid, appid, filesize)
                VALUES (p_userid, p_appid, p_amount);
                RETURN;
            EXCEPTION WHEN unique_violation THEN
                -- try again
            END;
        END LOOP;
    END;
$$;
