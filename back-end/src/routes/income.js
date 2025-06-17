const { Router } = require("express");
const database = require("../database");
const authorization = require("../middleware/authorization");

const router = Router();

router.post("/add-income", authorization, async (req, res) => {
    try {
        const userId = req.user_id;
        var { description, amount, date } = req.body;

        if (date === undefined || date === null || date === "") {
            date = new Date().toISOString();
        }
        
        await database.addIncome(userId, description, date, amount);

        res.status(200).json({ log: "Income created" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ log: "Server error" });
    }
});

module.exports = router;
