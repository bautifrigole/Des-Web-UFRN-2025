const { Router } = require("express");
const database = require("../database");
const authorization = require("../middleware/authorization");
const generateJwt = require("../utils/jwtGenerator");
const bcrypt = require("bcrypt");

const router = Router();

router.post("/register", async (req, res, next) => {
    try {
        const { first_name, last_name, email, user_password } = req.body;
        
        const existsUser = await database.existsUser(email);
        if (existsUser.rowCount > 0) return res.status(401).json({ log: "El usuario ya existe" });

        const saltRounds = 10;
        const salt = await bcrypt.genSalt(saltRounds);
        const bcryptPassword = await bcrypt.hash(user_password, salt);

        const result = await database.addUser(first_name, last_name, email, bcryptPassword);

        const token = await generateJwt(result.rows[0].user_id);
        res.status(200).json({ log: "User created", token });
    } catch (error) {
        console.log(error);
        res.status(500).json({ log: "Server error" });
    }
});

router.put("/modify-user", authorization, async (req, res, next) => {
    try {
        const { first_name, last_name, email } = req.body;
        user_id = req.user_id;

        const existsUser = await database.existsUserByID(user_id);
        if (existsUser.rowCount === 0) return res.status(401).json({ log: "El usuario no existe" });
        
        await database.updateUser(user_id, first_name, last_name, email);

        res.status(200).json({ log: true });
    } catch (error) {
        console.log(error);
        res.status(500).json({ log: "Server error" });
    }
});

router.get("/user", authorization, async (req, res) => {
    try {
        const id = req.user_id;
        const user = await database.getUserByID(id);

        if (user.rowCount != 0) {
            res.status(200).json({ user: user.rows[0] });
        } else {
            res.status(401).json({ user: undefined, log: `El usuario no existe` });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ log: "Server error" });
    }
});

module.exports = router;
