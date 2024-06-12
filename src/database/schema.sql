CREATE DATABASE auto_mod;
USE auto_mod;

CREATE TABLE GUILD (
    guild_id VARCHAR(100) NOT NULL,
    guild_name VARCHAR(200) NOT NULL,
    join_date DATE NOT NULL
);

ALTER TABLE GUILD ADD CONSTRAINT guild_pk PRIMARY KEY ( guild_id );

CREATE TABLE USER (
    guild_id VARCHAR(100) NOT NULL,
    user_id VARCHAR(100) NOT NULL,
    user_name VARCHAR(200),
    avg_st_score DOUBLE DEFAULT 0,
    timeout_count INTEGER(3) DEFAULT 0,
    report_count INTEGER(3) DEFAULT 0
);

ALTER TABLE USER ADD CONSTRAINT user_pk PRIMARY KEY ( user_id, guild_id );
ALTER TABLE USER ADD CONSTRAINT user_guild_fk FOREIGN KEY ( guild_id ) REFERENCES GUILD ( guild_id );

CREATE TABLE GUILD_AUTHORIZED_ROLE (
    guild_id VARCHAR(100) NOT NULL,
    role_id VARCHAR(100) NOT NULL,
    role_name VARCHAR(100)  
);

ALTER TABLE GUILD_AUTHORIZED_ROLE ADD CONSTRAINT guild_authorized_role_pk PRIMARY KEY ( guild_id, role_id );
ALTER TABLE GUILD_AUTHORIZED_ROLE ADD CONSTRAINT guild_authorized_roke_fk FOREIGN KEY ( guild_id ) REFERENCES GUILD ( guild_id );

CREATE TABLE GUILD_IGNORED_CHANNEL (
    guild_id VARCHAR(100) NOT NULL,
    channel_id VARCHAR(100) NOT NULL,
    channel_name VARCHAR(100)
);

ALTER TABLE GUILD_IGNORED_CHANNEL ADD CONSTRAINT guild_ignored_channel_pk PRIMARY KEY ( guild_id, channel_id );
ALTER TABLE GUILD_IGNORED_CHANNEL ADD CONSTRAINT guild_ignored_channel_fk FOREIGN KEY ( guild_id ) REFERENCES GUILD ( guild_id );