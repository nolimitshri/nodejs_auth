const express = require("express");
const router = express.Router();

const { ensureAuthenticated } = require("../middlewares/authorizationReq");

router.get("/", (req, res) => res.render("welcome"));

router.get("/dashboard", ensureAuthenticated, (req, res) => {
    res.render("dashboard", {
        user: req.user,
        sent: false
    })
});

router.use("/", require("./user"));
router.use("/", require("./verificationHandle"));
router.use("/", require("./forgotPassword"));

module.exports = router;