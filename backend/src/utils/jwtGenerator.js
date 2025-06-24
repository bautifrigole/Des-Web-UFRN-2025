const jwt = require("jsonwebtoken");
const { setUserLastLogin } = require("../database");
const timeGenerator = require("./timegen");
require("dotenv").config();

async function generateJwt(user_id, is_admin = false) {
    try {
        const { now, today } = timeGenerator();
        await setUserLastLogin(user_id, now);
        const payload = { user_id: user_id, last_login_timestamp: today };

        return jwt.sign(payload, process.env.jwtSecret, { expiresIn: "180d" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ log: "Server error" });
    }
}

module.exports = generateJwt;
