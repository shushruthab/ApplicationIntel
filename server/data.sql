DROP DATABASE IF EXISTS boarddb;
DROP DATABASE IF EXISTS board_testdb;

CREATE DATABASE boarddb;
CREATE DATABASE board_testdb;

\c boarddb;

DROP TABLE IF EXISTS users;

CREATE TABLE users
(
    id SERIAL PRIMARY KEY,
    firstname text NOT NULL,
    lastname text NOT NULL,
    email text NOT NULL,
    password text NOT NULL
);

CREATE TABLE contacts
(
    id SERIAL PRIMARY KEY,
    user_id integer NOT NULL REFERENCES users,
    firstname text NOT NULL,
    lastname text NOT NULL,
    company text NOT NULL,
    position text NOT NULL,
    email text,
    phone text,
    notes text
);

CREATE TABLE applications
(
    id SERIAL PRIMARY KEY,
    user_id integer NOT NULL REFERENCES users,
    applied_date DATE,
    job_title text NOT NULL,
    company text NOT NULL,
    application_type text,
    phonescreen DATE,
    coding_challenge DATE,
    interview_1 DATE,
    interview_2 DATE,
    offer DATE,
    active BOOLEAN NOT NULL DEFAULT TRUE
);

INSERT INTO users
    (firstname, lastname, email, password)
VALUES
    ('John', 'Doe', 'johndoe@gmail.com', '$2b$12$AZH7virni5jlTTiGgEg4zu3lSvAw68qVEfSIOjJ3RqtbJbdW/Oi5q'),
    ('Test', 'Genie', 'testgenie@gmail.com', '$2b$12$AZH7virni5jlTTiGgEg4zu3lSvAw68qVEfSIOjJ3RqtbJbdW/Oi5q');

INSERT INTO contacts
    (user_id, firstname, lastname, company, position)
VALUES
    (1, 'Gordon', 'Mansey', 'Google', 'ML Engineer'),
    (1, 'Lee', 'Mitchell', 'Microsoft', 'SDE'),
    (2, 'Rob', 'Brian', 'Apple', 'SDE'),
    (2, 'Jo', 'Matafeo', 'Headspace', 'UX');

INSERT INTO applications
    (user_id, applied_date, company, job_title, application_type )
VALUES
    (1, '2022-03-14', 'Google', 'ML Engineer', 'Cold Apply' ),
    (1, '2022-03-14', 'Microsoft', 'ML Engineer', 'Cold Apply' ),
    (1, '2022-03-14', 'Meta', 'ML Engineer', 'Cold Apply' ),
    (2, '2022-03-14', 'Netflix', 'ML Engineer', 'Cold Apply' ),
    (2, '2022-03-14', 'Jobber', 'ML Engineer', 'Cold Apply' )