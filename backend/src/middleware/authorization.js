const { verify } = require("jsonwebtoken");
require("dotenv").config();

module.exports = async (req, res, next) => {
    try {
        const jwtToken = req.header("token");

        if (!jwtToken) return res.status(403).json({ log: "Not authorized" });

        const payload = verify(jwtToken, process.env.jwtSecret);
        req.user_id = payload.user_id;

        next();
    } catch (error) {
        console.error(error);
        return res.status(403).json({ log: "Not authorized" });
    }
};
