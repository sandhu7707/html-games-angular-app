psql --username 'postgres' <<-EOSQL
	CREATE DATABASE helloworld;
	\connect helloworld;
	CREATE TABLE user_profile(
		id serial primary key,
		username varchar(50) unique not null,
		password varchar(50) not null
	);

	CREATE TABLE games(
		id serial primary key,
		game_name varchar(50) unique not null,
		game_code bytea
	);
	create user helloworldapp with password 'helloworldapp';
	grant all privileges on database helloworld to helloworldapp;
	grant all privileges on all tables in schema PUBLIC to helloworldapp;
	grant all privileges on all sequences in schema PUBLIC to helloworldapp;
EOSQL
