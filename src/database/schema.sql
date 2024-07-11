DROP DATABASE IF EXISTS auto_mod;
CREATE DATABASE auto_mod;
USE auto_mod;

DROP TABLE IF EXISTS guild;
DROP TABLE IF EXISTS user;
DROP TABLE IF EXISTS guild_authorized_role;
DROP TABLE IF EXISTS guild_ignored_channel;
DROP TABLE IF EXISTS guild_restricted_keyword;

CREATE TABLE guild (
    guild_id VARCHAR(100),
    guild_name VARCHAR(200),
    ldb_count INTEGER(3) DEFAULT 10,
    join_date DATE,
    CHECK(ldb_count >= 0 AND ldb_count <= 50)
);

ALTER TABLE guild ADD CONSTRAINT guild_pk PRIMARY KEY ( guild_id );

CREATE TABLE user (
    guild_id VARCHAR(100),
    user_id VARCHAR(100),
    user_name VARCHAR(200),
    st_score DOUBLE DEFAULT 0,
    offence_count INTEGER(3) DEFAULT 0
);

ALTER TABLE user ADD CONSTRAINT user_pk PRIMARY KEY ( user_id, guild_id );
ALTER TABLE user ADD CONSTRAINT user_guild_fk FOREIGN KEY ( guild_id ) REFERENCES guild ( guild_id );

CREATE TABLE guild_authorized_role (
    guild_id VARCHAR(100),
    role_id VARCHAR(100),
    role_name VARCHAR(100)  
);

ALTER TABLE guild_authorized_role ADD CONSTRAINT guild_authorized_role_pk PRIMARY KEY ( guild_id, role_id );
ALTER TABLE guild_authorized_role ADD CONSTRAINT guild_authorized_role_fk FOREIGN KEY ( guild_id ) REFERENCES guild ( guild_id );

CREATE TABLE guild_ignored_channel (
    guild_id VARCHAR(100),
    channel_id VARCHAR(100),
    channel_name VARCHAR(100)
);

ALTER TABLE guild_ignored_channel ADD CONSTRAINT guild_ignored_channel_pk PRIMARY KEY ( guild_id, channel_id );
ALTER TABLE guild_ignored_channel ADD CONSTRAINT guild_ignored_channel_fk FOREIGN KEY ( guild_id ) REFERENCES guild ( guild_id );

CREATE TABLE guild_restricted_keyword (
    guild_id VARCHAR(100),
    keyword VARCHAR(255)
);

ALTER TABLE guild_restricted_keyword ADD CONSTRAINT guild_restricted_keyword_pk PRIMARY KEY ( guild_id, keyword );
ALTER TABLE guild_restricted_keyword ADD CONSTRAINT guild_restricted_keyword_fk FOREIGN KEY ( guild_id ) REFERENCES guild ( guild_id );