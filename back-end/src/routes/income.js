const { Router } = require("express");
const database = require("../database");
const authorization = require("../middleware/authorization");

const router = Router();

router.post("/add-income", authorization, async (req, res) => {
    try {
        const userId = req.user_id;
        var { description, amount, date, category } = req.body;

        if (date === undefined || date === null || date === "") {
            date = new Date().toISOString();
        }
        
        await database.addIncome(userId, description, date, amount, category);

        res.status(200).json({ log: "Income created" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ log: "Server error" });
    }
});

router.get("/get-incomes", authorization, async (req, res) => {
    try {
        const userId = req.user_id;
        const incomes = await database.getIncomesFromUser(userId);

        res.status(200).json({ incomes: incomes.rows });
    } catch (error) {
        console.log(error);
        res.status(500).json({ log: "Server error" });
    }
});

router.get("/get-income", authorization, async (req, res) => {
    try {
        const userId = req.user_id;
        const incomeId = req.query.income_id;
        const existsIncome = await database.existsIncome(incomeId);

        if (existsIncome.rowCount === 0) return res.status(401).json({ log: "Income does not exist" });
        if (existsIncome.rows[0].user_id !== userId) return res.status(403).json({ log: "Income is not owned by the user" });

        res.status(200).json({ income: existsIncome.rows[0] });
    } catch (error) {
        console.log(error);
        res.status(500).json({ log: "Server error" });
    }
});

router.put("/update-income", authorization, async (req, res) => {
    try {
        var { income_id, description, amount, date } = req.body;
        const userId = req.user_id;

        const existsIncome = await database.existsIncome(income_id, userId);
        if (existsIncome.rowCount === 0) return res.status(401).json({ log: "Income does not exist" });

        if (date === undefined || date === null || date === "") {
            date = new Date(existsIncome.rows[0].income_timestamp).toISOString();
        }

        await database.updateIncome(income_id, description, date, amount);

        res.status(200).json({ log: "Income updated" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ log: "Server error" });
    }
});

router.delete("/delete-income", authorization, async (req, res) => {
    try {
        const { income_id } = req.body;
        const userId = req.user_id;

        const existsIncome = await database.existsIncome(income_id, userId);
        if (existsIncome.rowCount === 0) return res.status(401).json({ log: "Income does not exist" });

        await database.deleteIncome(income_id);

        res.status(200).json({ log: "Income deleted" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ log: "Server error" });
    }
});

module.exports = router;
