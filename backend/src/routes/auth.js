const { Router } = require("express");
const database = require("../database");
const bcrypt = require("bcrypt");
const generateJwt = require("../utils/jwtGenerator");
const authorization = require("../middleware/authorization");
const timeGenerator = require("../utils/timegen");

const router = Router();

// error 401: unauthenticated, error 403: unauthorized

router.post("/login", async (req, res) => {
    try {
        const { email, user_password } = req.body;
        const result = await database.getUserByEmail(email);

        // Do not let your intruder know what is wrong
        if(result.rowCount === 0) 
            return res.status(401).json({ log: "Invalid credentials"});
        
        const validPassword = await bcrypt.compare(
            user_password,
            result.rows[0].user_password
        );

        // Do not let your intruder know what is wrong
        if (!validPassword)
            return res.status(401).json({ log: "Invalid credentials" });

        const token = await generateJwt(result.rows[0].user_id);
        res.status(200).json({ log: true, token, user_id: result.rows[0].user_id });
    } catch (error) {
        console.log(error);
        res.status(500).json({ log: "Server error" });
    }
});

router.post("/logout", async (req, res) => {
    try {
        const { user_id } = req.body;
        const { now } = timeGenerator();
        await database.setUserLastLogin(user_id, now);
        res.status(200).json({ log: "Logout successful"});
    } catch (error) {
        console.log(error);
        res.status(500).json({ log: "Logout failed: ", error})
    }
})

router.get("/is-verified", authorization, async (req, res) => {
    try {
        res.status(200).json({ log: true });
    } catch (error) {
        console.log(error);
        res.status(500).json({ log: "Server error" });
    }
});

router.post("/change-password", authorization, async (req, res, next) => {
    try {
        const { user_password, new_password } = req.body;
        user_id = req.user_id;
        const result = await database.getUserByID(user_id);

        const validPassword = await bcrypt.compare(
            user_password,
            result.rows[0].user_password
        );

        if (!validPassword)
            return res.status(401).json({ log: "Incorrect password" });

        const saltRounds = 10;
        const salt = await bcrypt.genSalt(saltRounds);
        const bcryptPassword = await bcrypt.hash(new_password, salt);

        await database.modifyPassword(user_id, bcryptPassword)

        res.status(200).json({ log: true });
    } catch (error) {
        console.log(error);
        res.status(500).json({ log: "Server error" });
    }
});

module.exports = router;
