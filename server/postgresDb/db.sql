/*Create the main database called Tweekr*/
CREATE DATABASE tweekr;

/*Create the tweeks table*/
/*For now I'll ignore all kinds of inner joins with the users table. If the need arises, I'll add that column later*/
CREATE TABLE tweeks (
    id BIGSERIAL NOT NULL PRIMARY KEY,
    tweet_id BIGINT NOT NULL,
    note TEXT,
    tags VARCHAR(20)[] CHECK (array_length(tags, 1) < 5),
    collection_id BIGSERIAL NOT NULL REFERENCES collections(collection_id)
);

ALTER TABLE tweeks ALTER COLUMN collection_id SET DEFAULT 1;

/*Alter table command*/
ALTER TABLE tweeks ADD collection_id BIGSERIAL NOT NULL REFERENCES collections(collection_id);

/*Add a tweek to the tweeks table*/
INSERT INTO tweets (tweet_id, note, tags) VALUES (123456, 'This is a good note that I want to add to the database!', '{ml, freelancing, tag}');

/*Create a table called collections */
CREATE TABLE collections (
    collection_id BIGSERIAL NOT NULL PRIMARY KEY,
    collection_name VARCHAR(30)
);

/*Create a collection*/
INSERT INTO collections (collection_name) VALUES collection_name";