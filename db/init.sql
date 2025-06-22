-- CREATE DATABASE desweb;

-- Tables creation

CREATE TABLE status (
	status_id SERIAL PRIMARY KEY NOT NULL,
    status_name VARCHAR(50) NOT NULL
);

CREATE TABLE user_account (
	user_id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(62) NOT NULL,
    user_password VARCHAR(255) NOT NULL,
    last_login_timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
    status_id INT NOT NULL DEFAULT 1 REFERENCES status(status_id)
);

CREATE TABLE expense (
	expense_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES user_account(user_id),
    description VARCHAR(100) NOT NULL,
    category VARCHAR(100) NOT NULL,
    expense_timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
    expense_amount REAL NOT NULL DEFAULT 0,
    status_id INT NOT NULL DEFAULT 1 REFERENCES status(status_id)
);

CREATE TABLE income (
	income_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES user_account(user_id),
    description VARCHAR(100) NOT NULL,
    category VARCHAR(100) NOT NULL,
    income_timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
    income_amount REAL NOT NULL DEFAULT 0,
    status_id INT NOT NULL DEFAULT 1 REFERENCES status(status_id)
);

CREATE TABLE stock (
    stock_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES user_account(user_id),
    stock_code VARCHAR(100) NOT NULL,
    stock_timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
    price REAL NOT NULL DEFAULT 0,
    status_id INT NOT NULL DEFAULT 1 REFERENCES status(status_id)
)

-- Insertion

INSERT INTO status (status_name) VALUES
    ('active'),
    ('inactive');

-- We need an user to perform queries
INSERT INTO user_account (first_name, last_name, email, user_password, status_id) VALUES
    ('Pelé', 'O Rei', 'pele.orei@example.com', '$2b$10$jS2nldt.dVtMRE/r1HByBOZoJEExyIKWAWsaBbGJ2sYfU7hfWcAk6', 1);

-- $2b$10$jS2nldt.dVtMRE/r1HByBOZoJEExyIKWAWsaBbGJ2sYfU7hfWcAk6 === "pelemaiorquemaradonaemessi"