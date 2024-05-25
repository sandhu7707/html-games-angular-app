psql --username 'postgres' <<-EOSQL
	CREATE DATABASE helloworld;
	\connect helloworld;
	CREATE TABLE user_profile(
		id serial primary key,
		username varchar(50) unique not null,
		password varchar(50) not null
	);
	create user helloworldapp with password 'helloworldapp';
	grant all privileges on database helloworld to helloworldapp;
EOSQL
