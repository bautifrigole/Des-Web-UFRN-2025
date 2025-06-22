const Pool = require("pg").Pool;
const dotenv = require("dotenv");
dotenv.config();

const pool = new Pool({
    user: process.env.PGUSER || 'user',
    host: process.env.PGHOST || 'localhost',
    database: process.env.PGDATABASE || 'desweb',
    password: process.env.PGPASSWORD || 'password',
    port: process.env.PGPORT || 5432,
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

async function deleteUser(user_id) {
    const result = await makeQuery(
        "UPDATE user_account SET status_id = 2 WHERE user_id = " + user_id + ";"
    );
    return result;
}

async function addExpense(user_id, description, expense_timestamp, expense_amount, category) {
    const result = await makeQuery(
        "INSERT INTO expense (user_id, description, expense_timestamp, expense_amount, category) VALUES (" + user_id + ", '" + description + "', '" + expense_timestamp + "', " + expense_amount + ", '" + category + "') RETURNING expense_id;"
    );
    return result;
}

async function getExpensesFromUser(user_id) {
    const result = await makeQuery(
        "SELECT * FROM expense WHERE user_id = " + user_id + " ORDER BY expense_timestamp DESC;"
    );
    return result;
}

async function updateExpense(expense_id, description, expense_timestamp, expense_amount) {
    const result = await makeQuery(
        "UPDATE expense SET description = '" + description + "', expense_timestamp = '" + expense_timestamp + "', expense_amount = " + expense_amount + " WHERE expense_id = " + expense_id + ";"
    );
    return result;
}

async function deleteExpense(expense_id) {
    const result = await makeQuery(
        "UPDATE expense SET status_id = 2 WHERE expense_id = " + expense_id + ";"
    );
    return result;
}

async function existsExpense(expense_id) {
    const result = await makeQuery(
        "SELECT * FROM expense WHERE expense_id = " + expense_id + " AND status_id = 1;"
    );
    return result;
}

async function addIncome(user_id, description, income_timestamp, income_amount, category) {
    const result = await makeQuery(
        "INSERT INTO income (user_id, description, income_timestamp, income_amount, category) VALUES (" + user_id + ", '" + description + "', '" + income_timestamp + "', " + income_amount + ", '" + category + "') RETURNING income_id;"
    );
    return result;
}

async function getIncomesFromUser(user_id) {
    const result = await makeQuery(
        "SELECT * FROM income WHERE user_id = " + user_id + " ORDER BY income_timestamp DESC;"
    );
    return result;
}

async function updateIncome(income_id, description, income_timestamp, income_amount) {
    const result = await makeQuery(
        "UPDATE income SET description = '" + description + "', income_timestamp = '" + income_timestamp + "', income_amount = " + income_amount + " WHERE income_id = " + income_id + ";"
    );
    return result;
}

async function deleteIncome(income_id) {
    const result = await makeQuery(
        "UPDATE income SET status_id = 2 WHERE income_id = " + income_id + ";"
    );
    return result;
}

async function existsIncome(income_id) {
    const result = await makeQuery(
        "SELECT * FROM income WHERE income_id = " + income_id + " AND status_id = 1;"
    );
    return result;
}

async function addStock(user_id, stock_code, stock_timestamp, price) {
    const result = await makeQuery(
        "INSERT INTO income (user_id, stock_code, stock_timestamp, price) VALUES (" + user_id + ", '" + stock_code + "', '" + stock_timestamp + "', " + price + "') RETURNING income_id;"
    );
    return result;
}

module.exports = { existsUser, existsUserByID, getUserByID, getUserByEmail, modifyPassword, addUser, setUserLastLogin, getUserLastLogin, getUsersWithLastName, updateUserStatus, updateUser, deleteUser, 
addExpense, getExpensesFromUser, updateExpense, deleteExpense, existsExpense,
addIncome, getIncomesFromUser, updateIncome, deleteIncome, existsIncome, addStock};