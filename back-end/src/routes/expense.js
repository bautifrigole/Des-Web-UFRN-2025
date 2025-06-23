const { Router } = require("express");
const database = require("../database");
const authorization = require("../middleware/authorization");

const router = Router();

router.post("/add-expense", authorization, async (req, res) => {
    try {
        const userId = req.user_id;
        var { description, amount, date, category } = req.body;

        if (date === undefined || date === null || date === "") {
            date = new Date().toISOString();
        }
        
        // A stock is an expense and vice-versa.
        if(category === "Stock") {
            await database.addStock(userId, description, date, amount);
        } 

        await database.addExpense(userId, description, date, amount, category);

        res.status(200).json({ log: "Expense created" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ log: "Server error" });
    }
});

router.get("/get-expenses", authorization, async (req, res) => {
    try {
        const userId = req.user_id;
        const expenses = await database.getExpensesFromUser(userId);

        res.status(200).json({ expenses: expenses.rows });
    } catch (error) {
        console.log(error);
        res.status(500).json({ log: "Server error" });
    }
});

router.get("/get-expense", authorization, async (req, res) => {
    try {
        const userId = req.user_id;
        const expenseId = req.query.expense_id;
        const existsExpense = await database.existsExpense(expenseId);

        if (existsExpense.rowCount === 0) return res.status(401).json({ log: "Expense does not exist" });
        if (existsExpense.rows[0].user_id !== userId) return res.status(403).json({ log: "Expense is not owned by the user" });

        res.status(200).json({ expense: existsExpense.rows[0] });
    } catch (error) {
        console.log(error);
        res.status(500).json({ log: "Server error" });
    }
});

router.put("/update-expense", authorization, async (req, res) => {
    try {
        var { expense_id, description, amount, date } = req.body;
        const userId = req.user_id;

        const existsExpense = await database.existsExpense(expense_id, userId);
        if (existsExpense.rowCount === 0) return res.status(401).json({ log: "Expense does not exist" });

        if (date === undefined || date === null || date === "") {
            date = new Date(existsExpense.rows[0].expense_timestamp).toISOString();
        }

        await database.updateExpense(expense_id, description, date, amount);

        res.status(200).json({ log: "Expense updated" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ log: "Server error" });
    }
});

router.delete("/delete-expense", authorization, async (req, res) => {
    try {
        const { expense_id } = req.body;
        const userId = req.user_id;

        const existsExpense = await database.existsExpense(expense_id, userId);
        if (existsExpense.rowCount === 0) return res.status(401).json({ log: "Expense does not exist" });

        await database.deleteExpense(expense_id);

        res.status(200).json({ log: "Expense deleted" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ log: "Server error" });
    }
});

router.get("/stocks", authorization, async (req, res) => {
    try {
        const userId = req.user_id;
        const stocks = await database.getStocks(userId);
        if (stocks.rowCount === 0) return res.status(200).json({ log: "Stocks are empty" });
        
        return res.status(200).json({ stocks: stocks.rows})
    } catch(error) {
        console.log("ERROR ===>", error)
    }
})

module.exports = router;
