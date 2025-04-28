const Pool = require("pg").Pool;
const dotenv = require("dotenv");
dotenv.config();

const pool = new Pool({
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: process.env.PGPORT,
    ssl: false
});

async function makeQuery(query) {
    console.log(query);
    const res = await pool.query(query);
    console.log("DB response:");
    console.table(res.rows);
    return res;
}

async function existsUser(email) {
    const result = await makeQuery(
        "SELECT user_id, first_name, last_name, email FROM user_account WHERE email = '" + email + "';"
    );
    return result;
}

async function existsUserByID(user_id) {
    const result = await makeQuery(
        "SELECT user_id, first_name, last_name, email FROM user_account WHERE user_id = " + user_id + ";"
    );
    return result;
}

async function getUserByID(user_id) {
    const result = await makeQuery(
        "SELECT * FROM user_account WHERE user_id = " + user_id + " AND status_id = 1;"
    );
    return result;
}

async function getUserByEmail(email) {
    const result = await makeQuery(
        "SELECT * FROM user_account WHERE email = '" + email + "' AND status_id = 1;"
    );
    return result;
}

async function modifyPassword(user_id, new_password) {
    const result = await makeQuery(
        "UPDATE user_account SET user_password = '"+ new_password + "' WHERE user_id = " + user_id + ";"
    );
    return result.rowCount > 0;
}

async function addUser(first_name, last_name, email, user_password) {
    const result = await makeQuery(
        "INSERT INTO user_account (first_name, last_name, email, user_password) values ('" + first_name + "', '" + last_name  + "', '" + email + "', '" + user_password +  "') RETURNING user_id;"
    );
    return result;
}

async function setUserLastLogin(user_id, last_login_timestamp) {
    const result = await makeQuery(
        "UPDATE user_account SET last_login_timestamp = '" + last_login_timestamp + "' WHERE user_id = " + user_id + ";"
    );
    return result;
}

async function getUserLastLogin(user_id) {
    const result = await makeQuery(
        "SELECT last_login_timestamp FROM user_account WHERE user_id = " + user_id + ";"
    );
    return result;
}

async function getUsersWithLastName(last_name) {
    const result = await makeQuery(
        "SELECT user_id, first_name, last_name, email, status_id, status_name NATURAL JOIN status WHERE LOWER(last_name) LIKE '"+ last_name.toLowerCase() +"%' ORDER BY status_id ASC;"
    );
    return result;
}

async function updateUserStatus(user_id, status_id) {
    const result = await makeQuery(
        "UPDATE user_account SET status_id = " + status_id + " WHERE user_id = " + user_id + ";"
    );
    return result;
}

async function updateUser(user_id, first_name, last_name, email) {
    const result = await makeQuery(
        "UPDATE user_account AS u SET first_name = u2.first_name, last_name = u2.last_name, email = u2.email FROM (VALUES (" +
        user_id + ", '" + first_name + "', '" + last_name + "', '" + email + "')) AS u2(user_id, first_name, last_name, email) WHERE u2.user_id = u.user_id;"
        );
    return result;
}

module.exports = { existsUser, existsUserByID, getUserByID, getUserByEmail, modifyPassword, addUser, setUserLastLogin, getUserLastLogin, getUsersWithLastName, updateUserStatus, updateUser };